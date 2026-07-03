/**
 * Pipeline.gs
 * Gestione della pipeline commerciale (Trattative Aperte), vista Kanban, ricerca e schede di
 * dettaglio Azienda/Contatto con storico completo, e archiviazione settimanale dei lead lavorati.
 */

function getPipelineBoard_() {
  const trattative = getAllRecords_('trattativeAperte');
  const fasi = LISTE_VALUES['Fase Trattativa'];
  const board = fasi.map(fase => ({ fase: fase, valoreTotale: 0, trattative: [] }));
  const byFase = {};
  board.forEach(col => { byFase[col.fase] = col; });

  trattative.forEach(t => {
    const col = byFase[t['Fase']] || byFase[fasi[0]];
    col.trattative.push(t);
    const valore = Number(String(t['Valore Stimato']).replace(/[^\d.-]/g, '')) || 0;
    col.valoreTotale += valore;
  });
  return board;
}

function moveTrattativaToFase_(trattativaId, nuovaFase, probabilita) {
  const patch = { 'Fase': nuovaFase };
  if (probabilita !== undefined && probabilita !== null && probabilita !== '') {
    patch['Probabilita'] = probabilita;
  }
  const ok = updateRecordById_('trattativeAperte', trattativaId, patch);
  if (!ok) throw new Error('Trattativa non trovata: ' + trattativaId);

  if (nuovaFase === 'Chiusura vinta' || nuovaFase === 'Chiusura persa') {
    const trattativa = findRecordById_('trattativeAperte', trattativaId);
    syncAziendaEsitoChiusura_(trattativa, nuovaFase === 'Chiusura vinta' ? 'Chiuso' : 'Non interessato');
  }
  return getPipelineBoard_();
}

function syncAziendaEsitoChiusura_(trattativa, esito) {
  const now = formatDate_(new Date());
  upsertAziendaContattataRecord_(trattativa['ID Azienda'], {
    'Data Primo Contatto': trattativa['Data Apertura'], 'Data Ultimo Contatto': now,
    'Azienda': trattativa['Azienda'], 'Settore': trattativa['Settore'], 'Sede': trattativa['Sede'],
    'Provincia': '', 'Regione': '', 'Sito Web': '', 'LinkedIn Azienda': trattativa['LinkedIn URL'],
    'Stato': esito === 'Chiuso' ? 'Chiuso' : 'Follow up', 'Esito': esito, 'Owner': trattativa['Owner'],
    'Prossima Azione': trattativa['Prossima Azione'], 'Data Follow Up': trattativa['Data Follow Up'],
    'Documenti': '', 'Note': trattativa['Note']
  }, { 'Esito': esito, 'Data Ultimo Contatto': now, 'Stato': esito === 'Chiuso' ? 'Chiuso' : 'Follow up' });
}

function upsertAziendaContattataRecord_(aziendaId, fullFieldsIfNew, patchIfExisting) {
  return withLock_(() => {
    const existing = getAllRecords_('aziendeContattate').find(r => r['ID Azienda'] === aziendaId);
    if (existing) {
      updateRecordById_('aziendeContattate', aziendaId, patchIfExisting);
      return false;
    }
    appendRecord_('aziendeContattate', Object.assign({ 'ID Azienda': aziendaId }, fullFieldsIfNew));
    return true;
  });
}

function createTrattativaFromLead_(leadId, opportunityFields) {
  const lead = findRecordById_('leadWeekly', leadId) || findRecordById_('archivioLead', leadId);
  if (!lead) throw new Error('Lead non trovato: ' + leadId);
  opportunityFields = opportunityFields || {};

  const trattativa = appendRecord_('trattativeAperte', {
    'ID Azienda': lead['ID Azienda'], 'ID Persona': lead['ID Persona'],
    'Data Apertura': formatDate_(new Date()), 'Azienda': lead['Azienda'],
    'Contatto Principale': (lead['Nome'] + ' ' + lead['Cognome']).trim(), 'Job Title': lead['Job Title'],
    'LinkedIn URL': lead['LinkedIn URL'], 'Settore': lead['Settore'], 'Sede': lead['Sede Azienda'],
    'Tipo Opportunita': opportunityFields.tipoOpportunita || 'Sponsorship',
    'Valore Stimato': opportunityFields.valoreStimato || '',
    'Fase': 'Primo contatto', 'Probabilita': opportunityFields.probabilita || '20',
    'Owner': lead['Owner'], 'Prossima Azione': opportunityFields.prossimaAzione || '',
    'Data Follow Up': opportunityFields.dataFollowUp || '', 'Note': ''
  });

  updateRecordById_('leadWeekly', leadId, { 'Stato': 'Interessato' });
  return trattativa;
}

/** Scheda di dettaglio: tutto lo storico collegato a un'azienda o una persona, per ID. */
function getEntityDetail_(type, id) {
  if (type === 'azienda') {
    return {
      target: getAllRecords_('aziendeTarget').filter(r => r['ID Azienda'] === id),
      contattate: getAllRecords_('aziendeContattate').filter(r => r['ID Azienda'] === id),
      leadAttivi: getAllRecords_('leadWeekly').filter(r => r['ID Azienda'] === id),
      leadArchiviati: getAllRecords_('archivioLead').filter(r => r['ID Azienda'] === id),
      trattative: getAllRecords_('trattativeAperte').filter(r => r['ID Azienda'] === id),
      scartati: getAllRecords_('leadScartati').filter(r => r['ID Azienda'] === id),
      blocchi: getAllRecords_('daNonContattare').filter(r => r['ID Azienda'] === id)
    };
  }
  if (type === 'persona') {
    return {
      contattate: getAllRecords_('personeContattate').filter(r => r['ID Persona'] === id),
      leadAttivi: getAllRecords_('leadWeekly').filter(r => r['ID Persona'] === id),
      leadArchiviati: getAllRecords_('archivioLead').filter(r => r['ID Persona'] === id),
      trattative: getAllRecords_('trattativeAperte').filter(r => r['ID Persona'] === id),
      blocchi: getAllRecords_('daNonContattare').filter(r => r['ID Persona'] === id)
    };
  }
  throw new Error('Tipo entita non supportato: ' + type);
}

function searchEntities_(query) {
  const q = normalizeCompanyName_(query);
  if (!q) return { aziende: [], persone: [] };

  const aziende = dedupeById_(
    getAllRecords_('aziendeTarget').concat(getAllRecords_('aziendeContattate'))
      .filter(r => normalizeCompanyName_(r['Azienda']).indexOf(q) !== -1),
    'ID Azienda'
  );
  const persone = dedupeById_(
    getAllRecords_('personeContattate').concat(getAllRecords_('leadWeekly'))
      .filter(r => normalizeCompanyName_(r['Nome'] + ' ' + r['Cognome']).indexOf(q) !== -1 && r['ID Persona']),
    'ID Persona'
  );

  return { aziende: aziende.slice(0, 25), persone: persone.slice(0, 25) };
}

function dedupeById_(records, idField) {
  const seen = {};
  return records.filter(r => {
    const id = r[idField];
    if (!id || seen[id]) return false;
    seen[id] = true;
    return true;
  });
}

function getLeadWeeklyView_(filters) {
  filters = filters || {};
  let rows = getAllRecords_('leadWeekly');
  if (filters.priorita) rows = rows.filter(r => r['Priorita'] === filters.priorita);
  if (filters.stato) rows = rows.filter(r => r['Stato'] === filters.stato);
  if (filters.settore) {
    const q = normalizeCompanyName_(filters.settore);
    rows = rows.filter(r => normalizeCompanyName_(r['Settore']).indexOf(q) !== -1);
  }
  if (filters.territorio) {
    const q = normalizeCompanyName_(filters.territorio);
    rows = rows.filter(r => normalizeCompanyName_(r['Sede Azienda'] + ' ' + r['Provincia'] + ' ' + r['Regione']).indexOf(q) !== -1);
  }
  rows.sort((a, b) => Number(b['Sponsor Fit Score'] || 0) - Number(a['Sponsor Fit Score'] || 0));
  return rows;
}

function updateLeadStatus_(leadId, newStatus) {
  const ok = updateRecordById_('leadWeekly', leadId, { 'Stato': newStatus });
  if (!ok) throw new Error('Lead non trovato: ' + leadId);
  const contactingStates = ['Contattato', 'Risposto', 'Interessato', 'Non interessato'];
  if (contactingStates.indexOf(newStatus) !== -1) {
    const lead = findRecordById_('leadWeekly', leadId);
    syncPersonaFromLeadStatus_(lead, newStatus);
  }
  return getLeadWeeklyView_({});
}

const LEAD_STATO_TO_CONTATTO_STATO = { 'Contattato': 'Contattato', 'Risposto': 'Contattato', 'Interessato': 'In trattativa', 'Non interessato': 'Chiuso' };
const LEAD_STATO_TO_ESITO = { 'Contattato': 'Nessuna risposta', 'Risposto': 'Risposta positiva', 'Interessato': 'Interessato', 'Non interessato': 'Non interessato' };

function syncPersonaFromLeadStatus_(lead, newStatus) {
  const now = formatDate_(new Date());
  upsertPersonaRecord_(lead['ID Persona'], {
    'ID Azienda': lead['ID Azienda'], 'Data Primo Contatto': now, 'Data Ultimo Contatto': now,
    'Nome': lead['Nome'], 'Cognome': lead['Cognome'], 'Job Title': lead['Job Title'], 'Azienda': lead['Azienda'],
    'LinkedIn URL': lead['LinkedIn URL'], 'Email': '', 'Telefono': '', 'Canale': 'LinkedIn',
    'Stato': LEAD_STATO_TO_CONTATTO_STATO[newStatus] || 'Contattato',
    'Esito': LEAD_STATO_TO_ESITO[newStatus] || 'Nessuna risposta',
    'Owner': lead['Owner'], 'Prossima Azione': lead['Prossima Azione'], 'Data Follow Up': '', 'Note': ''
  }, {
    'Data Ultimo Contatto': now,
    'Stato': LEAD_STATO_TO_CONTATTO_STATO[newStatus] || 'Contattato',
    'Esito': LEAD_STATO_TO_ESITO[newStatus] || 'Nessuna risposta'
  });
}

/** Archivia i lead conclusi o piu' vecchi della soglia configurata (Fase 2: manutenzione settimanale). */
function archiveOldLeads_() {
  const archivableStates = ['Archiviato', 'Duplicato', 'Non interessato', 'Da non contattare'];
  const maxAgeDays = Number(getConfigValue_(getSpreadsheet_(), 'archiveAfterDays', 28));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);

  const leads = getAllRecords_('leadWeekly');
  let archived = 0;
  leads.forEach(lead => {
    const inserted = new Date(lead['Data Inserimento']);
    const isOld = !isNaN(inserted.getTime()) && inserted < cutoff;
    if (archivableStates.indexOf(lead['Stato']) !== -1 || isOld) {
      moveRecord_('leadWeekly', 'archivioLead', lead['ID Lead']);
      archived++;
    }
  });
  return archived;
}
