/**
 * Code.gs
 * Punto di ingresso della web app e livello di controller: ogni funzione qui sotto e' pensata
 * per essere chiamata da google.script.run lato client (Dashboard.html e viste). La logica vera
 * e propria vive nei moduli dedicati (Data, Dedup, Scoring, Pipeline, Outreach, Triggers).
 */

function doGet() {
  const template = HtmlService.createTemplateFromFile('Dashboard');
  return template.evaluate()
    .setTitle('Vero Volley - Sponsor CRM')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Usata dai partial HTML per includersi a vicenda: <?!= include_('View_Pipeline'); ?> */
function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Da eseguire una sola volta manualmente dall'editor Apps Script dopo aver impostato CONFIG.spreadsheetId. */
function setupCrm() {
  const ss = getSpreadsheet_();
  ensureAllSheets_(ss);
  setConfigValue_(ss, 'crmStatus', 'Configurato');
  setConfigValue_(ss, 'dedupCooldownDays', getConfigValue_(ss, 'dedupCooldownDays', 90));
  setConfigValue_(ss, 'archiveAfterDays', getConfigValue_(ss, 'archiveAfterDays', 28));
  installTriggers_();
  appendLog_('Aggiornamento stato', 'Setup CRM', 0, 0, 0, '', 'Completata', 'CRM inizializzato: fogli, validazioni e trigger installati.');
  return getDashboardData();
}

// --- Dashboard / Overview ---

function getDashboardData() {
  // ensureAllSheets_ (fogli + validazioni) gira solo in setupCrm(): rifarlo ad ogni refresh
  // risulterebbe corretto ma inutilmente lento (riscrive le regole di validazione su migliaia
  // di righe ogni volta). Se serve rigenerare lo schema, rilancia setupCrm() manualmente.
  const leadRows = getAllRecords_('leadWeekly');
  const settingsRows = getAllRecords_('risposteLunedi');
  const logRows = getAllRecords_('logAutomazioni');
  const board = getPipelineBoard_();

  // Sprint 3 (Dashboard 2.0): sezioni aggiuntive team-wide. Nessuna di queste tocca Dedup.gs,
  // Scoring.gs, Pipeline.gs o Activity.gs: leggono solo dati gia' esistenti tramite le funzioni
  // pubbliche gia' presenti in quei moduli (getPipelineBoard_, getActivityTimeline_, ecc.).
  const followUps = buildFollowUpCenter_();
  const agenda = buildDashboardAgenda_(followUps);

  return {
    now: formatDate_(new Date()),
    week: getWeekLabel_(new Date()),
    settings: settingsRows.length ? settingsRows[settingsRows.length - 1] : {},
    latestLog: logRows.length ? logRows[logRows.length - 1] : {},
    metrics: buildMetrics_(leadRows),
    funnel: buildFunnel_(leadRows, board),
    pipeline: board,
    recentLogs: logRows.slice(-8).reverse(),
    recentSettings: settingsRows.slice(-5).reverse(),
    kpisV2: buildDashboardKpis_(board, followUps, agenda),
    agenda: agenda,
    followUps: followUps,
    teamOpportunities: buildTeamOpportunities_(),
    recentActivities: enrichActivitiesWithAziendaLabel_(getActivityTimeline_({}).slice(0, 8))
  };
}

/**
 * "Attivita" (Activity.gs) non ha una colonna testuale "Azienda" denormalizzata, solo "ID
 * Azienda" - a differenza degli altri fogli dello schema. Questa funzione aggiunge un campo di
 * sola presentazione "AziendaNome" per la UI, senza toccare Activity.gs ne' il foglio stesso.
 */
function enrichActivitiesWithAziendaLabel_(activities) {
  return activities.map(a => Object.assign({}, a, { AziendaNome: resolveAziendaLabel_(a['ID Azienda']) }));
}

function resolveAziendaLabel_(aziendaId) {
  if (!aziendaId) return '';
  const record = findRecordById_('aziendeTarget', aziendaId) || findRecordById_('aziendeContattate', aziendaId);
  return record ? record['Azienda'] : aziendaId;
}

/**
 * KPI del Dashboard 2.0 (Sprint 3). Team-wide per decisione esplicita: l'ownership reale
 * (ID Utente Owner) non e' ancora popolata (Migration Engine non eseguito) e la web app non
 * risolve l'identita' per-utente nell'attuale modalita' di deploy (executeAs: USER_DEPLOYING) -
 * vedi docs/04_Business_Rules/Permissions.md Sezione 4. "Proposte Inviate" e "Inviti Partita
 * Inviati" non hanno ancora un'entita' dati (Proposal: Sprint 6; Match/Hospitality: Sprint 8):
 * restano null e la UI li mostra come "Prossimamente" invece di un falso zero.
 */
function buildDashboardKpis_(board, followUps, agenda) {
  const openColumns = getOpenPipelineColumns_(board);
  return {
    openOpportunities: openColumns.reduce((sum, col) => sum + col.trattative.length, 0),
    pipelineValue: openColumns.reduce((sum, col) => sum + col.valoreTotale, 0),
    activitiesToday: agenda.activities.length,
    followUpsDue: followUps.upcoming.length + followUps.late.length,
    proposalsSent: null,
    matchInvitationsSent: null
  };
}

/**
 * Agenda di oggi: attivita' pianificate (Activity Engine, invariato) con Data Scadenza odierna,
 * piu' i follow-up (Data Follow Up, gia' esistente su piu' fogli) in scadenza oggi. Ordinamento:
 * i follow-up scaduti prima, poi per orario - lo schema Attivita' non ha un campo "priorita'"
 * dedicato oggi (vedi Known Limitations del completion report), quindi non viene simulato qui.
 */
function buildDashboardAgenda_(followUps) {
  const todayKey = Utilities.formatDate(new Date(), CONFIG.timezone, 'yyyy-MM-dd');
  const activitiesToday = enrichActivitiesWithAziendaLabel_(
    getActivityTimeline_({ stato: ACTIVITY_STATUSES.PLANNED }).filter(a => {
      const d = new Date(a['Data Scadenza']);
      return !isNaN(d.getTime()) && Utilities.formatDate(d, CONFIG.timezone, 'yyyy-MM-dd') === todayKey;
    })
  );
  const followUpsToday = followUps.upcoming.concat(followUps.late).filter(f => {
    const d = new Date(f.scadenza);
    return !isNaN(d.getTime()) && Utilities.formatDate(d, CONFIG.timezone, 'yyyy-MM-dd') === todayKey;
  });
  followUpsToday.sort((a, b) => (a.scaduto === b.scaduto ? 0 : a.scaduto ? -1 : 1));
  return { activities: activitiesToday, followUps: followUpsToday };
}

// Fogli che portano gia' oggi il campo "Data Follow Up" (funzionalita' esistente, non introdotta
// in questo sprint - vedi Outreach.gs:createFollowUpEvent_).
const FOLLOWUP_SOURCE_SHEETS_ = [
  { key: 'leadWeekly', tipo: 'Lead', persona: true },
  { key: 'aziendeContattate', tipo: 'Azienda', persona: false },
  { key: 'personeContattate', tipo: 'Persona', persona: true },
  { key: 'trattativeAperte', tipo: 'Trattativa', persona: false }
];

/** Centro Follow-up: legge "Data Follow Up" sui quattro fogli che gia' lo popolano, senza modificarli. */
function buildFollowUpCenter_() {
  const now = new Date();
  const upcoming = [];
  const late = [];

  FOLLOWUP_SOURCE_SHEETS_.forEach(source => {
    getAllRecords_(source.key).forEach(row => {
      const raw = row['Data Follow Up'];
      if (!raw) return;
      const due = new Date(raw);
      if (isNaN(due.getTime())) return;

      const entry = {
        tipo: source.tipo,
        azienda: row['Azienda'] || '',
        contatto: source.persona ? (clean_(row['Nome']) + ' ' + clean_(row['Cognome'])).trim() : '',
        scadenza: raw,
        scaduto: due < now,
        prossimaAzione: row['Prossima Azione'] || ''
      };
      (entry.scaduto ? late : upcoming).push(entry);
    });
  });

  upcoming.sort((a, b) => new Date(a.scadenza) - new Date(b.scadenza));
  late.sort((a, b) => new Date(a.scadenza) - new Date(b.scadenza));
  return { upcoming: upcoming.slice(0, 20), late: late.slice(0, 20) };
}

/**
 * Opportunita' aperte per la tabella compatta del Dashboard 2.0. "Ultimo Contatto" usa la Data
 * Ultimo Contatto dell'azienda collegata (Aziende Gia Contattate) quando disponibile, altrimenti
 * la Data Apertura della trattativa - nessun nuovo campo, solo dati gia' esistenti.
 */
function buildTeamOpportunities_() {
  const trattative = getAllRecords_('trattativeAperte').filter(t => isFaseAperta_(t['Fase']));
  const lastContactByAzienda = {};
  getAllRecords_('aziendeContattate').forEach(a => { lastContactByAzienda[a['ID Azienda']] = a['Data Ultimo Contatto']; });

  return trattative.map(t => ({
    id: t['ID Trattativa'],
    aziendaId: t['ID Azienda'],
    azienda: t['Azienda'],
    fase: t['Fase'],
    valoreStimato: t['Valore Stimato'] || '',
    ultimoContatto: lastContactByAzienda[t['ID Azienda']] || t['Data Apertura'] || '',
    prossimaAzione: t['Prossima Azione'] || ''
  })).sort((a, b) => new Date(b.ultimoContatto || 0) - new Date(a.ultimoContatto || 0));
}

/** Rubrica contatti del Dashboard 2.0: stessa fonte dati/dedup di searchEntities_, riuso diretto. */
function getContactDirectory(query) {
  return getContactDirectory_(query);
}

function getContactDirectory_(query) {
  const q = normalizeCompanyName_(query || '');
  const combined = dedupeById_(
    getAllRecords_('personeContattate').concat(getAllRecords_('leadWeekly')).filter(r => r['ID Persona']),
    'ID Persona'
  );
  const filtered = q
    ? combined.filter(r => normalizeCompanyName_(r['Nome'] + ' ' + r['Cognome'] + ' ' + r['Azienda']).indexOf(q) !== -1)
    : combined;

  return filtered.slice(0, 30).map(r => ({
    id: r['ID Persona'],
    nome: r['Nome'] || '', cognome: r['Cognome'] || '', azienda: r['Azienda'] || '',
    jobTitle: r['Job Title'] || '', email: r['Email'] || '', telefono: r['Telefono'] || ''
  }));
}

/**
 * Unico punto da cui il Dashboard 2.0 registra un'attivita' manuale ("+ Nuova Attivita'").
 * Chiama logActivity_() cosi' come esiste in Activity.gs, senza modificarlo: e' il primo
 * chiamante live del motore Attivita' (Sprint 3, come da IMPLEMENTATION_MASTER_PLAN.md).
 */
function logDashboardActivity(payload) {
  payload = payload || {};
  logActivity_({
    tipo: payload.tipo || ACTIVITY_TYPES.NOTE,
    titolo: clean_(payload.titolo),
    descrizione: clean_(payload.descrizione),
    idAzienda: payload.idAzienda || '',
    idPersona: payload.idPersona || '',
    idTrattativa: payload.idTrattativa || '',
    stato: ACTIVITY_STATUSES.COMPLETED,
    origine: ACTIVITY_SOURCES.MANUAL
  });
  return getDashboardData();
}

function buildMetrics_(rows) {
  const priority = countBy_(rows, 'Priorita');
  const status = countBy_(rows, 'Stato');
  const validScores = rows.map(row => Number(row['Sponsor Fit Score'])).filter(score => !isNaN(score));
  const averageScore = validScores.length ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length) : 0;

  return {
    totalLeads: rows.length,
    averageScore: averageScore,
    priority: priority,
    status: status,
    sectors: topBy_(rows, 'Settore', 6),
    regions: topBy_(rows, 'Regione', 6),
    priorityA: priority['A - Alta'] || 0,
    toValidate: status['Da validare'] || 0,
    contacted: status['Contattato'] || 0,
    interested: status['Interessato'] || 0
  };
}

/**
 * Una fase e' "aperta" se non e' una delle due fasi di chiusura (vinta/persa). Estratta durante
 * lo Sprint 3 per eliminare la duplicazione che stava emergendo tra buildFunnel_ (gia' esistente)
 * e le nuove aggregazioni del Dashboard 2.0 (buildDashboardKpis_/buildTeamOpportunities_).
 * Triggers.gs:weeklyMaintenance_ ha ancora una propria copia dello stesso controllo: e' fuori dal
 * file-scope approvato per questo sprint, quindi non e' stata toccata - vedi Known Limitations.
 */
function isFaseAperta_(fase) {
  return String(fase || '').indexOf('Chiusura') === -1;
}

function getOpenPipelineColumns_(board) {
  return board.filter(col => isFaseAperta_(col.fase));
}

/** Conteggio lead per ciascuno stadio del funnel commerciale, dal primo contatto alla trattativa. */
function buildFunnel_(leadRows, board) {
  const status = countBy_(leadRows, 'Stato');
  const trattativeAttive = getOpenPipelineColumns_(board)
    .reduce((sum, col) => sum + col.trattative.length, 0);
  const vinte = (board.find(col => col.fase === 'Chiusura vinta') || { trattative: [] }).trattative.length;

  return [
    { stadio: 'Lead nuovi', valore: status['Nuovo'] || 0 },
    { stadio: 'Contattati', valore: (status['Contattato'] || 0) + (status['Risposto'] || 0) },
    { stadio: 'Interessati', valore: status['Interessato'] || 0 },
    { stadio: 'In trattativa', valore: trattativeAttive },
    { stadio: 'Chiusi vinti', valore: vinte }
  ];
}

function countBy_(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'Non indicato';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topBy_(rows, key, limit) {
  const counts = countBy_(rows, key);
  return Object.keys(counts)
    .map(name => ({ name: name, value: counts[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// --- Impostazioni settimanali (Risposte Lunedi) ---

function saveWeeklySettings(payload) {
  validateWeeklySettingsPayload_(payload);
  const week = payload.week || getWeekLabel_(new Date());

  appendRecord_('risposteLunedi', {
    'Data Risposta': formatDate_(new Date()), 'Settimana': week,
    'Territorio Prioritario': clean_(payload.territory), 'Settore Merceologico': clean_(payload.sector),
    'Aziende Specifiche Da Includere': clean_(payload.includeCompanies),
    'Aziende Da Escludere': clean_(payload.excludeCompanies),
    'Focus Commerciale': clean_(payload.focus),
    'Numero Lead Richiesti': Number(payload.leadCount || 100),
    'Note Aggiuntive': clean_(payload.notes)
  });

  const ss = getSpreadsheet_();
  setConfigValue_(ss, 'activeWeek', week);
  setConfigValue_(ss, 'activeTerritory', clean_(payload.territory));
  setConfigValue_(ss, 'activeSector', clean_(payload.sector));
  setConfigValue_(ss, 'activeFocus', clean_(payload.focus));
  setConfigValue_(ss, 'activeLeadCount', String(Number(payload.leadCount || 100)));

  appendLog_('Salvataggio impostazioni', JSON.stringify({ territory: payload.territory, sector: payload.sector, focus: payload.focus, leadCount: payload.leadCount }),
    0, 0, 0, '', 'Completata', 'Impostazioni settimanali salvate dalla dashboard');

  return getDashboardData();
}

function validateWeeklySettingsPayload_(payload) {
  if (!payload) throw new Error('Payload mancante.');
  if (!payload.territory) throw new Error('Il territorio prioritario e obbligatorio.');
  if (!payload.sector) throw new Error('Il settore merceologico e obbligatorio.');
  if (!payload.focus) throw new Error('Il focus commerciale e obbligatorio.');
}

function addManualLog(payload) {
  appendLog_(
    clean_(payload.operation || 'Nota manuale'), clean_(payload.input || ''),
    Number(payload.generated || 0), Number(payload.duplicates || 0), Number(payload.rejected || 0),
    clean_(payload.errors || ''), clean_(payload.status || 'Completata'), clean_(payload.notes || '')
  );
  return getDashboardData();
}

// --- Lead Weekly: import, filtri, cambio stato, apertura trattativa ---

function getLeadWeeklyView(filters) {
  return getLeadWeeklyView_(filters);
}

function updateLeadStatus(leadId, newStatus) {
  return updateLeadStatus_(leadId, newStatus);
}

/**
 * payload.leads = array di oggetti candidato lead (una riga per persona) da valutare in blocco.
 * Territorio/Settore Richiesto vengono presi dalle impostazioni settimanali attive se il singolo
 * lead non li specifica: chi importa non deve ripeterli riga per riga.
 */
function importLeadBatch(payload) {
  if (!payload || !Array.isArray(payload.leads) || !payload.leads.length) {
    throw new Error('Nessun lead da importare: fornisci un elenco non vuoto.');
  }
  const ss = getSpreadsheet_();
  const defaults = {
    territorioRichiesto: getConfigValue_(ss, 'activeTerritory', ''),
    settoreRichiesto: getConfigValue_(ss, 'activeSector', ''),
    fonte: payload.fonte || ''
  };
  const leads = payload.leads.map(lead => Object.assign({}, defaults, lead));
  const result = processLeadBatch_(leads, { week: payload.week, fonte: payload.fonte });
  return Object.assign(result, { view: getLeadWeeklyView_({}) });
}

function addSingleLead(payload) {
  const result = processIncomingLead_(payload);
  return Object.assign(result, { view: getLeadWeeklyView_({}) });
}

function recalculateScores() {
  const count = recalculateOpenLeadScores_();
  return { recalculated: count, view: getLeadWeeklyView_({}) };
}

function createTrattativa(payload) {
  return createTrattativaFromLead_(payload.leadId, payload);
}

// --- Pipeline / Kanban ---

function getPipelineBoard() {
  return getPipelineBoard_();
}

function moveTrattativa(payload) {
  return moveTrattativaToFase_(payload.trattativaId, payload.nuovaFase, payload.probabilita);
}

// --- Aziende & Contatti ---

function searchEntities(query) {
  return searchEntities_(query);
}

function getEntityDetail(type, id) {
  return getEntityDetail_(type, id);
}

// --- Outreach: email, follow-up, allegati ---

function sendOutreachEmail(payload) {
  return sendOutreachEmail_(payload.personaId, payload.templateKey, payload);
}

function scheduleFollowUp(payload) {
  return createFollowUpEvent_(payload.entityType, payload.id, payload.when, payload.title, payload.details);
}

function uploadAziendaDocument(payload) {
  return uploadAziendaDocument_(payload.aziendaId, payload.file);
}

// --- Manutenzione manuale (bottoni "esegui ora" nella UI) ---

function runWeeklyMaintenanceNow() {
  weeklyMaintenance_();
  return getDashboardData();
}

function installAutomationTriggers() {
  return installTriggers_();
}
