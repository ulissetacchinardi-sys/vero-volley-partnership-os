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

  return {
    now: formatDate_(new Date()),
    week: getWeekLabel_(new Date()),
    settings: settingsRows.length ? settingsRows[settingsRows.length - 1] : {},
    latestLog: logRows.length ? logRows[logRows.length - 1] : {},
    metrics: buildMetrics_(leadRows),
    funnel: buildFunnel_(leadRows, board),
    pipeline: board,
    recentLogs: logRows.slice(-8).reverse(),
    recentSettings: settingsRows.slice(-5).reverse()
  };
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

/** Conteggio lead per ciascuno stadio del funnel commerciale, dal primo contatto alla trattativa. */
function buildFunnel_(leadRows, board) {
  const status = countBy_(leadRows, 'Stato');
  const trattativeAttive = board.filter(col => col.fase.indexOf('Chiusura') === -1)
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
