/**
 * Triggers.gs
 * Automazioni schedulate (manutenzione settimanale) e reattive (modifica manuale dello Stato
 * direttamente nel foglio Google). Da eseguire una sola volta manualmente dopo il setup:
 * la funzione installTriggers_() qui sotto e' idempotente e puo' essere rilanciata in sicurezza.
 */

const TRIGGER_HANDLERS = {
  weeklyMaintenance: 'weeklyMaintenance_',
  onEdit: 'onEditInstallable_'
};

function installTriggers_() {
  uninstallTriggers_();
  ScriptApp.newTrigger(TRIGGER_HANDLERS.weeklyMaintenance)
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .create();
  ScriptApp.newTrigger(TRIGGER_HANDLERS.onEdit)
    .forSpreadsheet(getSpreadsheet_())
    .onEdit()
    .create();
  return { installed: true };
}

function uninstallTriggers_() {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    const handler = trigger.getHandlerFunction();
    if (handler === TRIGGER_HANDLERS.weeklyMaintenance || handler === TRIGGER_HANDLERS.onEdit) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/** Eseguita ogni lunedi alle 7: archivia i lead lavorati/vecchi e manda un promemoria via Gmail. */
function weeklyMaintenance_() {
  const archived = archiveOldLeads_();
  const board = getPipelineBoard_();
  const valorePipelineAperta = board
    .filter(col => col.fase.indexOf('Chiusura') === -1)
    .reduce((sum, col) => sum + col.valoreTotale, 0);

  appendLog_(
    'Archiviazione', 'Manutenzione settimanale automatica', 0, 0, 0, '', 'Completata',
    archived + ' lead archiviati automaticamente. Valore pipeline aperta: ' + valorePipelineAperta
  );

  const recipients = String(getConfigValue_(getSpreadsheet_(), 'notificationRecipients', ''))
    .split(',').map(r => r.trim()).filter(Boolean);
  if (!recipients.length) return;

  const body = 'Promemoria settimanale Vero Volley Sponsor CRM\n\n' +
    'Lead archiviati automaticamente: ' + archived + '\n' +
    'Valore pipeline aperta: ' + valorePipelineAperta + ' EUR\n\n' +
    'Ricordati di compilare i criteri di ricerca nella Dashboard prima di generare i nuovi lead della settimana.';
  recipients.forEach(recipient => GmailApp.sendEmail(recipient, 'Vero Volley CRM - Promemoria settimanale', body));
}

/**
 * Se qualcuno cambia manualmente la colonna "Stato" in "Lead Weekly" direttamente nel foglio
 * (invece che dalla web app), sincronizza comunque "Persone Gia Contattate" come farebbe la UI.
 * Gestisce solo modifiche a singola cella: le modifiche multiple (incolla, ecc.) non attivano
 * la sincronizzazione automatica e vanno rifatte dalla web app.
 */
function onEditInstallable_(e) {
  try {
    if (!e || !e.range || !e.value) return;
    if (e.range.getNumRows() > 1 || e.range.getNumColumns() > 1) return;

    const sheet = e.range.getSheet();
    if (sheet.getName() !== SHEETS.leadWeekly.name) return;

    const row = e.range.getRow();
    if (row === 1) return;

    const headers = HEADERS.leadWeekly;
    const statoCol = headers.indexOf('Stato') + 1;
    if (e.range.getColumn() !== statoCol) return;

    const leadId = sheet.getRange(row, headers.indexOf('ID Lead') + 1).getValue();
    if (!leadId) return;

    updateLeadStatus_(leadId, e.value);
  } catch (err) {
    console.error('onEditInstallable_ error: ' + err);
  }
}
