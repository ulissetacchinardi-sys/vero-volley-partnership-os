/**
 * Dedup.gs
 * Motore di deduplica e blacklist: valuta ogni nuovo lead candidato prima che entri in
 * "Lead Weekly", applicando le regole operative gia' definite nei README delle cartelle 04 e 05
 * (non duplicare contatti gia' lavorati, non contattare aziende/persone/settori bloccati,
 * rispettare le esclusive sponsor attive).
 */

/** Valuta un lead candidato: blocked/duplicato -> rifiutato, altrimenti accettato (eventualmente con warning). */
function evaluateNewLead_(lead) {
  const blacklistHit = checkBlacklist_(lead);
  if (blacklistHit.blocked) {
    return {
      accepted: false, reason: blacklistHit.reason, motivoScarto: blacklistHit.motivoScarto,
      matchedAziendaId: blacklistHit.matchedAziendaId, matchedPersonaId: blacklistHit.matchedPersonaId
    };
  }
  const dup = checkDuplicate_(lead);
  if (dup.isDuplicate) {
    return {
      accepted: false, reason: dup.reason, motivoScarto: dup.motivoScarto,
      matchedAziendaId: dup.matchedAziendaId, matchedPersonaId: dup.matchedPersonaId
    };
  }
  return { accepted: true, warning: dup.warning || '' };
}

// "Tipo Blocco" (Da Non Contattare) e "Motivo Scarto" (Lead Scartati) sono due tassonomie diverse
// per due scopi diversi: questa mappa traduce l'una nell'altra per popolare la colonna a menu
// a tendina senza perdere il dettaglio originale (che resta comunque nel campo Note).
const TIPO_BLOCCO_TO_MOTIVO_SCARTO = {
  'Persona': 'Reputazione incerta',
  'Settore': 'Settore non coerente',
  'Azienda': 'Competitor sponsor',
  'Competitor': 'Competitor sponsor',
  'Esclusiva sponsor': 'Competitor sponsor',
  'Reputazionale': 'Reputazione incerta'
};

function checkBlacklist_(lead) {
  const companyKey = normalizeCompanyName_(lead.azienda);
  const sectorKey = normalizeCompanyName_(lead.settore);
  const linkedinKey = normalizeLinkedInUrl_(lead.linkedinUrl);
  const personKey = normalizePersonKey_(lead.nome, lead.cognome, lead.azienda);

  const hit = getAllRecords_('daNonContattare').find(r => {
    if (isBlockExpired_(r)) return false;
    if (r['Tipo'] === 'Persona') {
      const rLinkedin = normalizeLinkedInUrl_(r['LinkedIn URL']);
      if (rLinkedin && linkedinKey) return rLinkedin === linkedinKey;
      return normalizePersonKey_(r['Nome'], r['Cognome'], r['Azienda']) === personKey;
    }
    if (r['Tipo'] === 'Settore') {
      // Per i blocchi di Tipo "Settore" il nome del settore bloccato e' salvato nel campo "Azienda"
      // (schema originale non prevede una colonna Settore dedicata in Da Non Contattare).
      return sectorKey && normalizeCompanyName_(r['Azienda']) === sectorKey;
    }
    // Azienda, Competitor, Esclusiva sponsor, Reputazionale: l'entita' bloccata e' nel campo Azienda.
    return companyKey && normalizeCompanyName_(r['Azienda']) === companyKey;
  });

  if (hit) {
    return {
      blocked: true,
      reason: 'Da Non Contattare (' + hit['Tipo'] + '): ' + (hit['Motivo Blocco'] || 'motivo non specificato'),
      motivoScarto: TIPO_BLOCCO_TO_MOTIVO_SCARTO[hit['Tipo']] || 'Fuori target',
      matchedAziendaId: hit['ID Azienda'] || '',
      matchedPersonaId: hit['ID Persona'] || ''
    };
  }

  const activeExclusive = getAllRecords_('esclusiveSponsor').find(r => {
    if (!isExclusiveActive_(r)) return false;
    const blockedSector = r['Settore Bloccato'] && sectorKey && normalizeCompanyName_(r['Settore Bloccato']) === sectorKey;
    const competitors = String(r['Competitor Da Evitare'] || '').split(',').map(c => normalizeCompanyName_(c)).filter(Boolean);
    const isCompetitor = companyKey && competitors.indexOf(companyKey) !== -1;
    return blockedSector || isCompetitor;
  });
  if (activeExclusive) {
    return {
      blocked: true,
      reason: 'Esclusiva sponsor attiva (' + activeExclusive['Categoria Esclusiva'] + '): competitor o settore bloccato',
      motivoScarto: 'Competitor sponsor',
      matchedAziendaId: '',
      matchedPersonaId: ''
    };
  }

  return { blocked: false };
}

function isBlockExpired_(record) {
  if (record['Livello Blocco'] !== 'Temporaneo') return false;
  const scadenza = record['Scadenza Blocco'];
  if (!scadenza) return false;
  const date = new Date(scadenza);
  return !isNaN(date.getTime()) && date < new Date();
}

function isExclusiveActive_(record) {
  const today = new Date();
  const start = record['Data Inizio'] ? new Date(record['Data Inizio']) : null;
  const end = record['Data Fine'] ? new Date(record['Data Fine']) : null;
  if (start && !isNaN(start.getTime()) && today < start) return false;
  if (end && !isNaN(end.getTime()) && today > end) return false;
  return true;
}

/** Duplicato = stessa persona gia' lavorata di recente. Azienda gia' in trattativa e' solo un warning, non un blocco. */
function checkDuplicate_(lead) {
  const linkedinKey = normalizeLinkedInUrl_(lead.linkedinUrl);
  const personKey = normalizePersonKey_(lead.nome, lead.cognome, lead.azienda);
  const cooldownDays = Number(getConfigValue_(getSpreadsheet_(), 'dedupCooldownDays', 90));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - cooldownDays);

  const personHit = getAllRecords_('personeContattate').find(r => {
    const rLinkedin = normalizeLinkedInUrl_(r['LinkedIn URL']);
    const isSamePerson = (rLinkedin && linkedinKey) ? rLinkedin === linkedinKey
      : normalizePersonKey_(r['Nome'], r['Cognome'], r['Azienda']) === personKey;
    if (!isSamePerson || r['Stato'] === 'Archiviato') return false;
    const lastContact = new Date(r['Data Ultimo Contatto'] || r['Data Primo Contatto']);
    return isNaN(lastContact.getTime()) || lastContact >= cutoff;
  });
  if (personHit) {
    return {
      isDuplicate: true,
      reason: 'Persona gia contattata (stato: ' + personHit['Stato'] + ') il ' + (personHit['Data Ultimo Contatto'] || personHit['Data Primo Contatto']),
      motivoScarto: 'Duplicato',
      matchedAziendaId: personHit['ID Azienda'] || '',
      matchedPersonaId: personHit['ID Persona'] || ''
    };
  }

  let warning = '';
  const companyKey = normalizeCompanyName_(lead.azienda);
  const companyInTrattativa = getAllRecords_('trattativeAperte').find(r => normalizeCompanyName_(r['Azienda']) === companyKey);
  if (companyInTrattativa) {
    warning = 'Azienda gia in trattativa (fase: ' + companyInTrattativa['Fase'] + ') - coordinare con owner ' + companyInTrattativa['Owner'] + ' prima di contattare';
  }

  return { isDuplicate: false, warning: warning };
}

/**
 * Elabora un singolo lead candidato: se rifiutato finisce in "Lead Scartati" con motivo,
 * altrimenti viene collegato/creato Azienda e Persona, calcolato lo score e inserito in "Lead Weekly".
 */
function processIncomingLead_(raw) {
  return withLock_(() => {
    const lead = normalizeLeadInput_(raw);
    const evaluation = evaluateNewLead_(lead);
    const week = lead.settimana || getWeekLabel_(new Date());

    if (!evaluation.accepted) {
      appendRecord_('leadScartati', {
        'ID Azienda': evaluation.matchedAziendaId || '',
        'ID Persona': evaluation.matchedPersonaId || '',
        'Data Scarto': formatDate_(new Date()),
        'Nome': lead.nome, 'Cognome': lead.cognome, 'Job Title': lead.jobTitle,
        'Azienda': lead.azienda, 'LinkedIn URL': lead.linkedinUrl,
        'Settore': lead.settore, 'Sede': lead.sede,
        'Motivo Scarto': evaluation.motivoScarto || 'Fuori target',
        'Score Precedente': '', 'Fonte': lead.fonte, 'Note': evaluation.reason
      });
      return { accepted: false, reason: evaluation.reason };
    }

    const azienda = findOrCreateAzienda_(lead);
    const persona = findOrCreatePersona_(lead);
    const scoring = computeSponsorFitScore_(lead);

    const record = appendRecord_('leadWeekly', {
      'ID Azienda': azienda.id,
      'ID Persona': persona.id,
      'Data Inserimento': formatDate_(new Date()),
      'Settimana': week,
      'Nome': lead.nome, 'Cognome': lead.cognome, 'Job Title': lead.jobTitle,
      'Azienda': lead.azienda, 'Settore': lead.settore, 'Sede Azienda': lead.sede,
      'Provincia': lead.provincia, 'Regione': lead.regione,
      'Dimensione Azienda': lead.dimensioneAzienda, 'Fatturato Stimato': lead.fatturatoStimato,
      'LinkedIn URL': lead.linkedinUrl, 'Sito Web Azienda': lead.sitoWebAzienda,
      'Fonte': lead.fonte, 'Sponsor Fit Score': scoring.score, 'Priorita': scoring.priorita,
      'Motivo del Fit': scoring.motivo, 'Benchmark di Riferimento': lead.benchmarkRiferimento,
      'Territorio Richiesto': lead.territorioRichiesto, 'Settore Richiesto': lead.settoreRichiesto,
      'Stato': 'Nuovo', 'Prossima Azione': '', 'Owner': lead.owner || '',
      'Note': evaluation.warning || ''
    });
    return { accepted: true, lead: record, warning: evaluation.warning || '' };
  });
}

/** Elabora un batch di lead candidati (es. import da CSV/paste) e registra il riepilogo in Log Automazioni. */
function processLeadBatch_(rawLeads, meta) {
  const week = (meta && meta.week) || getWeekLabel_(new Date());
  let generated = 0;
  let rejected = 0;
  const rejectionSamples = [];

  rawLeads.forEach(raw => {
    raw.settimana = raw.settimana || week;
    const result = processIncomingLead_(raw);
    if (result.accepted) {
      generated++;
    } else {
      rejected++;
      if (rejectionSamples.length < 5) rejectionSamples.push(result.reason);
    }
  });

  appendLog_(
    'Generazione lead',
    JSON.stringify(meta || {}),
    generated, 0, rejected,
    rejectionSamples.join(' | '),
    'Completata',
    'Batch di ' + rawLeads.length + ' candidati: ' + generated + ' accettati, ' + rejected + ' scartati'
  );

  return { total: rawLeads.length, generated: generated, rejected: rejected };
}

function normalizeLeadInput_(raw) {
  raw = raw || {};
  return {
    nome: clean_(raw.nome), cognome: clean_(raw.cognome), jobTitle: clean_(raw.jobTitle),
    azienda: clean_(raw.azienda), settore: clean_(raw.settore), sede: clean_(raw.sede),
    provincia: clean_(raw.provincia), regione: clean_(raw.regione),
    dimensioneAzienda: clean_(raw.dimensioneAzienda), fatturatoStimato: clean_(raw.fatturatoStimato),
    linkedinUrl: clean_(raw.linkedinUrl), sitoWebAzienda: clean_(raw.sitoWebAzienda),
    linkedinAzienda: clean_(raw.linkedinAzienda), fonte: clean_(raw.fonte),
    benchmarkRiferimento: clean_(raw.benchmarkRiferimento),
    territorioRichiesto: clean_(raw.territorioRichiesto), settoreRichiesto: clean_(raw.settoreRichiesto),
    owner: clean_(raw.owner), settimana: clean_(raw.settimana),
    motivoInteresse: clean_(raw.motivoInteresse)
  };
}
