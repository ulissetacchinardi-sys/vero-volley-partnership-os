/**
 * Outreach.gs
 * Integrazioni native Google (costo zero) per l'esecuzione dei contatti: invio email tracciato
 * via Gmail, promemoria di follow-up su Calendar, allegati commerciali su Drive.
 */

const OUTREACH_TEMPLATES = {
  primoContatto: {
    subject: 'Vero Volley - Opportunita di sponsorizzazione',
    body: 'Gentile {{nome}},\n\nLa contatto da Vero Volley per una possibile collaborazione di sponsorizzazione con {{azienda}}.\n\nSarei lieto di fissare una breve chiamata per approfondire.\n\nCordiali saluti,\n{{owner}}'
  },
  followUp: {
    subject: 'Vero Volley - Aggiornamento proposta di sponsorizzazione',
    body: 'Gentile {{nome}},\n\nVolevo gentilmente sapere se ha avuto modo di valutare la proposta inviata.\n\nResto a disposizione per qualsiasi chiarimento.\n\nCordiali saluti,\n{{owner}}'
  }
};

/**
 * Invia un'email di outreach a una persona (identificata per ID) e registra automaticamente
 * il contatto in "Persone Gia Contattate" (creando il record se non esiste ancora).
 */
function sendOutreachEmail_(personaId, templateKey, overrides) {
  overrides = overrides || {};
  const persona = getAllRecords_('personeContattate').find(r => r['ID Persona'] === personaId);
  const leadFallback = !persona ? getAllRecords_('leadWeekly').find(r => r['ID Persona'] === personaId) : null;
  const email = overrides.email || (persona && persona['Email']) || '';
  if (!email) throw new Error('Nessun indirizzo email disponibile per la persona ' + personaId + ': indicane uno manualmente.');

  const source = persona || leadFallback || {};
  const context = Object.assign({
    nome: source['Nome'] || '', cognome: source['Cognome'] || '', jobTitle: source['Job Title'] || '',
    azienda: source['Azienda'] || '', linkedinUrl: source['LinkedIn URL'] || '',
    owner: Session.getActiveUser().getEmail()
  }, overrides);

  const template = OUTREACH_TEMPLATES[templateKey] || OUTREACH_TEMPLATES.primoContatto;
  const subject = renderTemplate_(overrides.subject || template.subject, context);
  const body = renderTemplate_(overrides.body || template.body, context);

  GmailApp.sendEmail(email, subject, body);

  const now = formatDate_(new Date());
  upsertPersonaRecord_(personaId, {
    'ID Azienda': source['ID Azienda'] || '', 'Data Primo Contatto': now, 'Data Ultimo Contatto': now,
    'Nome': context.nome, 'Cognome': context.cognome, 'Job Title': context.jobTitle, 'Azienda': context.azienda,
    'LinkedIn URL': context.linkedinUrl, 'Email': email, 'Telefono': '', 'Canale': 'Email',
    'Stato': 'Contattato', 'Esito': 'Nessuna risposta', 'Owner': context.owner,
    'Prossima Azione': '', 'Data Follow Up': '', 'Note': ''
  }, {
    'Data Ultimo Contatto': now, 'Canale': 'Email', 'Stato': 'Contattato', 'Email': email
  });

  return { sent: true, email: email, subject: subject };
}

function renderTemplate_(text, context) {
  return String(text).replace(/{{\s*(\w+)\s*}}/g, (match, key) => (context[key] !== undefined && context[key] !== null) ? context[key] : '');
}

/**
 * Crea un evento di follow-up sul calendario Google del commerciale (Owner) e aggiorna la
 * "Data Follow Up" sul record collegato, cosi' la scadenza resta coerente in entrambi i posti.
 */
function createFollowUpEvent_(entityType, id, whenDate, title, details) {
  const start = new Date(whenDate);
  if (isNaN(start.getTime())) throw new Error('Data follow up non valida: ' + whenDate);
  // Se arriva solo una data senza orario (es. "2026-07-06"), Date la interpreta a mezzanotte:
  // in quel caso proponiamo le 9:00 come orario di default invece di un evento a mezzanotte.
  if (!/T\d{2}:\d{2}/.test(String(whenDate))) {
    start.setHours(9, 0, 0, 0);
  }
  const end = new Date(start.getTime() + 30 * 60000);

  const calendar = CalendarApp.getDefaultCalendar();
  const event = calendar.createEvent(title, start, end, { description: details || '' });
  event.addPopupReminder(60);

  const sheetKey = entityType === 'trattativa' ? 'trattativeAperte'
    : entityType === 'azienda' ? 'aziendeContattate'
    : entityType === 'persona' ? 'personeContattate'
    : 'leadWeekly';
  updateRecordById_(sheetKey, id, { 'Data Follow Up': formatDate_(start) });

  return { eventId: event.getId(), start: formatDate_(start) };
}

/**
 * Salva un file (arrivato come base64 dalla web app) in una cartella Drive dedicata al CRM e
 * ne registra il link sul record azienda (Aziende Target e/o Aziende Gia Contattate).
 * La cartella viene creata una sola volta dallo script stesso (scope drive.file) e il suo ID
 * resta salvato in Dashboard Config: lo script non deve mai dover "cercare" file altrui su Drive.
 */
function uploadAziendaDocument_(aziendaId, fileData) {
  const folder = getArchivioFolder_();
  const blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), fileData.mimeType, fileData.filename);
  const file = folder.createFile(blob);
  return attachDocumentLink_(aziendaId, file.getUrl(), fileData.filename);
}

function getArchivioFolder_() {
  const ss = getSpreadsheet_();
  const storedId = getConfigValue_(ss, 'archivioFolderId', '');
  if (storedId) {
    try {
      return DriveApp.getFolderById(storedId);
    } catch (e) {
      // La cartella salvata non e' piu' accessibile (rimossa/spostata): ne creiamo una nuova.
    }
  }
  const folder = DriveApp.createFolder('Vero Volley - CRM Archivio Documenti');
  setConfigValue_(ss, 'archivioFolderId', folder.getId());
  return folder;
}

function attachDocumentLink_(aziendaId, fileUrl, fileName) {
  const linkText = fileName + ': ' + fileUrl;
  const inTarget = getAllRecords_('aziendeTarget').find(r => r['ID Azienda'] === aziendaId);
  const inContattate = getAllRecords_('aziendeContattate').find(r => r['ID Azienda'] === aziendaId);
  if (!inTarget && !inContattate) throw new Error('Azienda non trovata: ' + aziendaId);

  if (inTarget) {
    const updated = inTarget['Documenti'] ? inTarget['Documenti'] + ' | ' + linkText : linkText;
    updateRecordById_('aziendeTarget', aziendaId, { 'Documenti': updated });
  }
  if (inContattate) {
    const updated = inContattate['Documenti'] ? inContattate['Documenti'] + ' | ' + linkText : linkText;
    updateRecordById_('aziendeContattate', aziendaId, { 'Documenti': updated });
  }
  return { link: linkText };
}
