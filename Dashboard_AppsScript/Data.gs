/**
 * Data.gs
 * Schema, configurazione e layer di accesso dati (CRUD) condiviso da tutti gli altri moduli.
 * Tutte le automazioni (Dedup, Scoring, Pipeline, Outreach, Triggers) leggono/scrivono
 * i fogli SOLO tramite le funzioni di questo file, cosi' lo schema resta in un unico posto.
 */

const CONFIG = {
  spreadsheetId: '1GLFHliNcgcP8C7V3eEFcXx1GBuoFyh6IZOQtYHUl1C4', // "Vero Volley - CRM Sponsor B2B"
  timezone: 'Europe/Rome'
};

// Registro dei fogli: nome reale del tab + colonna ID primaria (null se il foglio non ha un ID).
const SHEETS = {
  leadWeekly: { name: 'Lead Weekly', idField: 'ID Lead' },
  aziendeTarget: { name: 'Aziende Target', idField: 'ID Azienda' },
  risposteLunedi: { name: 'Risposte Lunedi', idField: null },
  logAutomazioni: { name: 'Log Automazioni', idField: null },
  archivioLead: { name: 'Archivio Lead', idField: 'ID Lead' },
  aziendeContattate: { name: 'Aziende Gia Contattate', idField: 'ID Azienda' },
  personeContattate: { name: 'Persone Gia Contattate', idField: 'ID Persona' },
  daNonContattare: { name: 'Da Non Contattare', idField: 'ID Blocco' },
  trattativeAperte: { name: 'Trattative Aperte', idField: 'ID Trattativa' },
  esclusiveSponsor: { name: 'Esclusive Sponsor', idField: 'ID Esclusiva' },
  leadScartati: { name: 'Lead Scartati', idField: 'ID Scarto' },
  dashboardConfig: { name: 'Dashboard Config', idField: null },
  // Sprint 1 (fondamenta infrastrutturali): registro utenti, non ancora collegato a nessun
  // workflow esistente. Vedi System.gs. Puramente additivo: nessuna riga sopra e' stata toccata.
  utenti: { name: 'Utenti', idField: 'ID Utente' },
  // Release 0.2 (Activity Engine): log centralizzato di ogni interazione, non ancora collegato
  // a nessun workflow esistente. Vedi Activity.gs. Puramente additivo.
  attivita: { name: 'Attivita', idField: 'ID Attivita' }
};

// Aziende Target e Aziende Gia Contattate condividono lo stesso spazio di ID (AZ-...): rappresentano
// la stessa entita' azienda in due stati diversi del ciclo di vita (target -> contattata).
const ID_PREFIXES = {
  leadWeekly: 'LD',
  archivioLead: 'LD',
  aziendeTarget: 'AZ',
  aziendeContattate: 'AZ',
  personeContattate: 'PE',
  daNonContattare: 'BL',
  trattativeAperte: 'TR',
  esclusiveSponsor: 'ES',
  leadScartati: 'SC',
  utenti: 'US',
  attivita: 'AT'
};

const HEADERS = {
  leadWeekly: [
    'ID Lead', 'ID Azienda', 'ID Persona',
    'Data Inserimento', 'Settimana', 'Nome', 'Cognome', 'Job Title', 'Azienda', 'Settore',
    'Sede Azienda', 'Provincia', 'Regione', 'Dimensione Azienda', 'Fatturato Stimato',
    'LinkedIn URL', 'Sito Web Azienda', 'Fonte', 'Sponsor Fit Score', 'Priorita',
    'Motivo del Fit', 'Benchmark di Riferimento', 'Territorio Richiesto', 'Settore Richiesto',
    'Stato', 'Prossima Azione', 'Owner', 'Note',
    // Sprint 2 (Ownership Engine): vedi Ownership.gs. Puramente additivo, non ancora collegato
    // a nessun workflow ne' letto/scritto da nessuna funzione esistente.
    'ID Utente Owner', 'Collaboratori', 'Visibilita', 'Data Assegnazione', 'Storico Assegnazioni'
  ],
  aziendeTarget: [
    'ID Azienda', 'Data Inserimento', 'Azienda', 'Settore', 'Sede', 'Provincia', 'Regione',
    'Sito Web', 'LinkedIn Azienda', 'Dimensione Azienda', 'Fatturato Stimato', 'Motivo Interesse',
    'Score Azienda', 'Contatti Trovati', 'Stato', 'Documenti', 'Note',
    // Sprint 2 (Ownership Engine): vedi nota su leadWeekly sopra.
    'ID Utente Owner', 'Collaboratori', 'Visibilita', 'Data Assegnazione', 'Storico Assegnazioni'
  ],
  risposteLunedi: [
    'Data Risposta', 'Settimana', 'Territorio Prioritario', 'Settore Merceologico',
    'Aziende Specifiche Da Includere', 'Aziende Da Escludere', 'Focus Commerciale',
    'Numero Lead Richiesti', 'Note Aggiuntive'
  ],
  logAutomazioni: [
    'Data Esecuzione', 'Settimana', 'Tipo Operazione', 'Input Usato', 'Numero Lead Generati',
    'Duplicati Rimossi', 'Lead Scartati', 'Errori', 'Stato Esecuzione', 'Note'
  ],
  archivioLead: [], // popolato subito sotto: schema identico a leadWeekly
  aziendeContattate: [
    'ID Azienda', 'Data Primo Contatto', 'Data Ultimo Contatto', 'Azienda', 'Settore', 'Sede',
    'Provincia', 'Regione', 'Sito Web', 'LinkedIn Azienda', 'Stato', 'Esito', 'Owner',
    'Prossima Azione', 'Data Follow Up', 'Documenti', 'Note',
    // Sprint 2 (Ownership Engine): vedi nota su leadWeekly sopra.
    'ID Utente Owner', 'Collaboratori', 'Visibilita', 'Data Assegnazione', 'Storico Assegnazioni'
  ],
  personeContattate: [
    'ID Persona', 'ID Azienda', 'Data Primo Contatto', 'Data Ultimo Contatto', 'Nome', 'Cognome',
    'Job Title', 'Azienda', 'LinkedIn URL', 'Email', 'Telefono', 'Canale', 'Stato', 'Esito',
    'Owner', 'Prossima Azione', 'Data Follow Up', 'Note',
    // Sprint 2 (Ownership Engine): vedi nota su leadWeekly sopra.
    'ID Utente Owner', 'Collaboratori', 'Visibilita', 'Data Assegnazione', 'Storico Assegnazioni'
  ],
  daNonContattare: [
    'ID Blocco', 'ID Azienda', 'ID Persona', 'Data Inserimento', 'Tipo', 'Azienda', 'Nome',
    'Cognome', 'Job Title', 'LinkedIn URL', 'Motivo Blocco', 'Livello Blocco', 'Scadenza Blocco',
    'Inserito Da', 'Note'
  ],
  trattativeAperte: [
    'ID Trattativa', 'ID Azienda', 'ID Persona', 'Data Apertura', 'Azienda', 'Contatto Principale',
    'Job Title', 'LinkedIn URL', 'Settore', 'Sede', 'Tipo Opportunita', 'Valore Stimato', 'Fase',
    'Probabilita', 'Owner', 'Prossima Azione', 'Data Follow Up', 'Note',
    // Sprint 2 (Ownership Engine): "Ultima Riassegnazione" e' un timestamp leggibile (come tutti
    // gli altri campi "Data ..." di questo schema), distinto da "Storico Assegnazioni" che e' il
    // JSON con lo storico completo (Previous Owner/Timestamp/Actor) - vedi Ownership.gs.
    'ID Utente Owner', 'Collaboratori', 'Visibilita', 'Data Assegnazione', 'Ultima Riassegnazione',
    'Storico Assegnazioni'
  ],
  esclusiveSponsor: [
    'ID Esclusiva', 'Sponsor Attivo', 'Categoria Esclusiva', 'Settore Bloccato',
    'Competitor Da Evitare', 'Data Inizio', 'Data Fine', 'Livello Rischio', 'Note'
  ],
  leadScartati: [
    'ID Scarto', 'ID Azienda', 'ID Persona', 'Data Scarto', 'Nome', 'Cognome', 'Job Title',
    'Azienda', 'LinkedIn URL', 'Settore', 'Sede', 'Motivo Scarto', 'Score Precedente', 'Fonte', 'Note'
  ],
  dashboardConfig: ['Chiave', 'Valore', 'Ultimo Aggiornamento'],
  // Sprint 1: struttura pronta, nessun workflow la popola ancora automaticamente (vedi System.gs
  // e Migration.gs). Campi come da specifica Sprint 1 (Task 2), tradotti in italiano per coerenza
  // con il resto dello schema.
  utenti: [
    'ID Utente', 'Email', 'Nome', 'Cognome', 'Nome Visualizzato', 'Ruolo', 'Team', 'Stato',
    'Data Creazione', 'Ultimo Accesso'
  ],
  // Release 0.2 (Activity Engine): log centralizzato di ogni interazione. "Tipo/ID Entita
  // Riferimento" e' un riferimento generico (usato oggi soprattutto per Lead e Utente, che non
  // hanno una colonna FK dedicata qui); "ID Azienda"/"ID Persona"/"ID Trattativa" restano colonne
  // esplicite perche' sono di gran lunga i collegamenti piu' frequenti e un'attivita' puo'
  // toccarli contemporaneamente (es. una chiamata riguarda sia il Contatto sia la Trattativa).
  // "ID Utente" e' la persona a cui l'attivita' e' associata (es. chi ha fatto la chiamata);
  // "Creato Da" e' un campo di audit distinto: chi (o quale automazione) ha creato la riga.
  // Colonne aggiunte in un secondo momento (raffinamento del modello, non una riscrittura):
  // "Relazioni" e' un meccanismo di relazione generico e ripetibile (JSON di {tipo, id}), per
  // collegare un'attivita' a piu' entita' future (Proposta, Contratto, Documento, ecc.) senza
  // dover aggiungere una colonna FK dedicata ogni volta - vedi Activity.gs per i dettagli.
  // "Origine"/"Esito"/"Visibilita" sono tutte opzionali e non applicate da nessuna logica ancora.
  attivita: [
    'ID Attivita', 'Tipo', 'Tipo Entita Riferimento', 'ID Entita Riferimento',
    'ID Azienda', 'ID Persona', 'ID Trattativa', 'ID Utente',
    'Titolo', 'Descrizione', 'Data Creazione', 'Creato Da',
    'Data Scadenza', 'Data Completamento', 'Stato', 'Tag', 'Metadata',
    'Relazioni', 'Origine', 'Esito', 'Visibilita'
  ]
};
HEADERS.archivioLead = HEADERS.leadWeekly.slice();

// Righe di capacita' per foglio (usate per pre-impostare la validazione dati sulle colonne enum).
const SHEET_ROW_CAPACITY = {
  leadWeekly: 1000, aziendeTarget: 1000, risposteLunedi: 500, logAutomazioni: 2000,
  archivioLead: 6000, aziendeContattate: 6000, personeContattate: 6000,
  daNonContattare: 2000, trattativeAperte: 2000, esclusiveSponsor: 500, leadScartati: 6000,
  utenti: 200, attivita: 8000
};

// Valori standard per i menu a tendina, raccolti in un unico tab "Liste" (una colonna per dominio).
const LISTE_VALUES = {
  'Priorita': ['A - Alta', 'B - Media', 'C - Bassa', 'Escludere'],
  'Stato Lead': ['Nuovo', 'Da validare', 'Validato', 'Contattato', 'Risposto', 'Interessato', 'Non interessato', 'Da non contattare', 'Duplicato', 'Archiviato'],
  'Focus Commerciale': ['Nuovi sponsor', 'Hospitality', 'CSR', 'Giovani e territorio', 'Brand awareness', 'Networking B2B', 'Employer branding', 'Eventi'],
  'Tipo Operazione': ['Invio mail lunedi', 'Benchmark sponsor', 'Generazione lead', 'Deduplica', 'Archiviazione', 'Aggiornamento stato'],
  'Stato Esecuzione': ['Completata', 'Completata con warning', 'Errore', 'In attesa'],
  'Stato Contatto': ['Nuovo', 'Contattato', 'Follow up', 'In trattativa', 'Chiuso', 'Da non contattare', 'Archiviato'],
  'Esito Contatto': ['Nessuna risposta', 'Risposta positiva', 'Risposta negativa', 'Interessato', 'Non interessato', 'Da ricontattare', 'Non qualificato'],
  'Canale': ['LinkedIn', 'Email', 'Telefono', 'Evento', 'Referral'],
  'Tipo Blocco': ['Azienda', 'Persona', 'Settore', 'Competitor', 'Esclusiva sponsor', 'Reputazionale'],
  'Livello Blocco': ['Temporaneo', 'Permanente', 'Da verificare'],
  'Fase Trattativa': ['Primo contatto', 'Qualifica', 'Proposta inviata', 'Negoziazione', 'Chiusura vinta', 'Chiusura persa', 'Stand by'],
  'Tipo Opportunita': ['Sponsorship', 'Hospitality', 'CSR', 'Giovani e territorio', 'Networking B2B', 'Employer branding', 'Eventi', 'Brand awareness'],
  'Livello Rischio': ['Basso', 'Medio', 'Alto'],
  'Motivo Scarto': ['Duplicato', 'Fuori target', 'Settore non coerente', 'Azienda troppo piccola', 'Area geografica non prioritaria', 'Competitor sponsor', 'Reputazione incerta', 'Dati incompleti'],
  // Sprint 1: valori pronti per il tab "Utenti", corrispondenti alle costanti ROLES di System.gs.
  'Ruolo': ['Amministratore', 'Manager', 'Sales', 'Sola Lettura'],
  'Stato Utente': ['Attivo', 'Sospeso', 'Da completare'],
  // Release 0.2: valori pronti per il tab "Attivita", corrispondenti alle costanti di Activity.gs.
  'Tipo Attivita': ['Chiamata', 'Email', 'Riunione', 'Follow-up', 'Nota', 'Task Completato', 'Trattativa Creata', 'Trattativa Aggiornata', 'Lead Importato', 'Proposta Inviata', 'Invito Hospitality', 'Pranzo di Lavoro', 'Contratto Firmato', 'Documento Caricato'],
  'Tipo Entita Attivita': ['Lead', 'Azienda', 'Persona', 'Trattativa', 'Utente'],
  'Stato Attivita': ['Pianificata', 'Completata', 'Annullata'],
  // Raffinamento Release 0.2: corrispondenti alle costanti ACTIVITY_SOURCES/ACTIVITY_OUTCOMES/
  // ACTIVITY_VISIBILITY di Activity.gs.
  'Origine Attivita': ['Manuale', 'Email', 'Calendario', 'Import', 'Workflow', 'AI', 'Sistema'],
  'Esito Attivita': ['Interessato', 'Nessuna Risposta', 'Riunione Programmata', 'Proposta Richiesta', 'Vinto', 'Perso', 'Follow-up Necessario'],
  'Visibilita Attivita': ['Privata', 'Team', 'Management', 'Pubblica'],
  // Sprint 2 (Ownership Engine): valori pronti per la colonna "Visibilita" di Lead Weekly/Aziende
  // Target/Aziende Contattate/Persone Gia Contattate/Trattative Aperte, corrispondenti alle
  // costanti OWNER_VISIBILITY di Ownership.gs. Tenuta distinta da "Visibilita Attivita" perche'
  // riguarda un'entita' di business (chi puo' vedere un lead/un'azienda/una trattativa) e non una
  // singola voce di timeline: stessi valori testuali, liste separate per poterle far evolvere
  // in modo indipendente in futuro.
  'Visibilita Ownership': ['Privata', 'Team', 'Management', 'Pubblica']
};
const LISTE_ORDER = Object.keys(LISTE_VALUES);

// Quale colonna di quale foglio deve validare i propri valori contro quale colonna di "Liste".
const VALIDATION_MAP = {
  leadWeekly: { 'Priorita': 'Priorita', 'Stato': 'Stato Lead', 'Visibilita': 'Visibilita Ownership' },
  archivioLead: { 'Priorita': 'Priorita', 'Stato': 'Stato Lead' },
  aziendeTarget: { 'Stato': 'Stato Lead', 'Visibilita': 'Visibilita Ownership' },
  risposteLunedi: { 'Focus Commerciale': 'Focus Commerciale' },
  logAutomazioni: { 'Tipo Operazione': 'Tipo Operazione', 'Stato Esecuzione': 'Stato Esecuzione' },
  aziendeContattate: { 'Stato': 'Stato Contatto', 'Esito': 'Esito Contatto', 'Visibilita': 'Visibilita Ownership' },
  personeContattate: { 'Canale': 'Canale', 'Stato': 'Stato Contatto', 'Esito': 'Esito Contatto', 'Visibilita': 'Visibilita Ownership' },
  daNonContattare: { 'Tipo': 'Tipo Blocco', 'Livello Blocco': 'Livello Blocco' },
  trattativeAperte: { 'Tipo Opportunita': 'Tipo Opportunita', 'Fase': 'Fase Trattativa', 'Visibilita': 'Visibilita Ownership' },
  esclusiveSponsor: { 'Livello Rischio': 'Livello Rischio' },
  leadScartati: { 'Motivo Scarto': 'Motivo Scarto' },
  utenti: { 'Ruolo': 'Ruolo', 'Stato': 'Stato Utente' },
  attivita: {
    'Tipo': 'Tipo Attivita', 'Tipo Entita Riferimento': 'Tipo Entita Attivita', 'Stato': 'Stato Attivita',
    'Origine': 'Origine Attivita', 'Esito': 'Esito Attivita', 'Visibilita': 'Visibilita Attivita'
  }
};

/** Contatore di rientri per rendere withLock_ sicuro anche se chiamato in modo annidato. */
let LOCK_DEPTH = 0;

function withLock_(fn) {
  if (LOCK_DEPTH > 0) {
    return fn();
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  LOCK_DEPTH++;
  try {
    return fn();
  } finally {
    LOCK_DEPTH--;
    lock.releaseLock();
  }
}

function getSpreadsheet_() {
  if (!CONFIG.spreadsheetId || CONFIG.spreadsheetId === 'INSERISCI_ID_GOOGLE_SHEET') {
    throw new Error('Imposta CONFIG.spreadsheetId con l ID del Google Sheet operativo.');
  }
  return SpreadsheetApp.openById(CONFIG.spreadsheetId);
}

/** Crea (se mancante) e allinea l'intestazione di ogni tab richiesto dal CRM, inclusa "Liste" e le validazioni. */
function ensureAllSheets_(ss) {
  Object.keys(SHEETS).forEach(key => ensureSheet_(ss, SHEETS[key].name, HEADERS[key]));
  ensureListeSheet_(ss);
  applyValidations_(ss);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (headers && headers.length) {
    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const isEmpty = current.every(value => value === '');
    if (isEmpty) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.getRange(1, 1, 1, headers.length).setBackground('#0b3d91').setFontColor('#ffffff');
    } else {
      // Il foglio esisteva gia' con delle intestazioni (es. "Liste" dopo l'aggiunta di nuove
      // colonne in un secondo momento, come Ruolo/Stato Utente nello Sprint 1): scrive SOLO le
      // colonne ancora vuote, senza mai toccare quelle gia' presenti.
      headers.forEach((header, index) => {
        if (current[index] !== '') return;
        sheet.getRange(1, index + 1)
          .setValue(header)
          .setFontWeight('bold')
          .setBackground('#0b3d91')
          .setFontColor('#ffffff');
      });
    }
  }
  return sheet;
}

/**
 * Popola ogni colonna di "Liste" solo se quella colonna specifica e' ancora vuota: se il team
 * commerciale ha aggiunto valori extra a mano non vengono mai sovrascritti, e se in futuro
 * LISTE_VALUES guadagna nuove colonne (es. Ruolo/Stato Utente nello Sprint 1) su un foglio
 * "Liste" gia' popolato da prima, solo le colonne nuove vengono scritte: quelle esistenti restano
 * intatte anche se altre colonne della stessa riga hanno gia' del contenuto.
 */
function ensureListeSheet_(ss) {
  const sheet = ensureSheet_(ss, 'Liste', LISTE_ORDER);
  const maxLen = Math.max.apply(null, LISTE_ORDER.map(key => LISTE_VALUES[key].length));
  const existingCols = sheet.getRange(2, 1, 1, LISTE_ORDER.length).getValues()[0];

  LISTE_ORDER.forEach((key, index) => {
    if (existingCols[index] !== '') return;
    const column = LISTE_VALUES[key].map(value => [value]);
    while (column.length < maxLen) column.push(['']);
    sheet.getRange(2, index + 1, maxLen, 1).setValues(column);
  });

  return sheet;
}

function applyValidations_(ss) {
  const listeSheet = ss.getSheetByName('Liste');
  const listeLastRow = Math.max(listeSheet.getLastRow(), 2);
  Object.keys(VALIDATION_MAP).forEach(sheetKey => {
    const sheet = ss.getSheetByName(SHEETS[sheetKey].name);
    const headers = HEADERS[sheetKey];
    const capacity = SHEET_ROW_CAPACITY[sheetKey] || 1000;
    Object.keys(VALIDATION_MAP[sheetKey]).forEach(headerName => {
      const colIndex = headers.indexOf(headerName) + 1;
      if (colIndex <= 0) return;
      const listeKey = VALIDATION_MAP[sheetKey][headerName];
      const listeColIndex = LISTE_ORDER.indexOf(listeKey) + 1;
      // Copre fino all'ultima riga effettivamente scritta in "Liste", non solo i valori di
      // default: se qualcuno aggiunge a mano un valore extra alla lista, resta selezionabile.
      const count = Math.max(LISTE_VALUES[listeKey].length, listeLastRow - 1);
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(listeSheet.getRange(2, listeColIndex, count, 1), true)
        .setAllowInvalid(true)
        .build();
      sheet.getRange(2, colIndex, capacity - 1, 1).setDataValidation(rule);
    });
  });
}

/** Legge tutte le righe di un foglio come array di oggetti {intestazione: valore}. */
function getAllRecords_(sheetKey) {
  const ss = getSpreadsheet_();
  const def = SHEETS[sheetKey];
  const sheet = ss.getSheetByName(def.name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const record = {};
      headers.forEach((header, index) => { record[header] = row[index] || ''; });
      return record;
    });
}

function findRecordById_(sheetKey, id) {
  if (!id) return null;
  const def = SHEETS[sheetKey];
  return getAllRecords_(sheetKey).find(r => r[def.idField] === id) || null;
}

/** Aggiunge un record generando automaticamente l'ID se il foglio ne prevede uno e non e' gia' presente. */
function appendRecord_(sheetKey, fields) {
  return withLock_(() => {
    const ss = getSpreadsheet_();
    const def = SHEETS[sheetKey];
    const headers = HEADERS[sheetKey];
    const sheet = ensureSheet_(ss, def.name, headers);
    const record = Object.assign({}, fields);
    if (def.idField && !record[def.idField]) {
      record[def.idField] = generateId_(ID_PREFIXES[sheetKey]);
    }
    const row = headers.map(h => (record[h] !== undefined && record[h] !== null) ? record[h] : '');
    sheet.appendRow(row);
    return record;
  });
}

function updateRecordById_(sheetKey, id, patch) {
  return withLock_(() => {
    const def = SHEETS[sheetKey];
    if (!def.idField) throw new Error('Il foglio ' + sheetKey + ' non supporta aggiornamenti per ID.');
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName(def.name);
    if (!sheet) return false;
    const headers = HEADERS[sheetKey];
    const idColIndex = headers.indexOf(def.idField);
    const values = sheet.getDataRange().getValues();
    for (let r = 1; r < values.length; r++) {
      if (values[r][idColIndex] === id) {
        Object.keys(patch).forEach(key => {
          const colIndex = headers.indexOf(key);
          if (colIndex >= 0) sheet.getRange(r + 1, colIndex + 1).setValue(patch[key]);
        });
        return true;
      }
    }
    return false;
  });
}

function deleteRecordRow_(sheetKey, id) {
  return withLock_(() => {
    const def = SHEETS[sheetKey];
    if (!def.idField) return false;
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName(def.name);
    if (!sheet) return false;
    const headers = HEADERS[sheetKey];
    const idColIndex = headers.indexOf(def.idField);
    const values = sheet.getDataRange().getValues();
    for (let r = values.length - 1; r >= 1; r--) {
      if (values[r][idColIndex] === id) {
        sheet.deleteRow(r + 1);
        return true;
      }
    }
    return false;
  });
}

/** Sposta un record da un foglio all'altro mappando i campi per nome di intestazione (usato per l'archiviazione). */
function moveRecord_(fromKey, toKey, id) {
  return withLock_(() => {
    const record = findRecordById_(fromKey, id);
    if (!record) return null;
    const toHeaders = HEADERS[toKey];
    const fields = {};
    toHeaders.forEach(h => { if (record[h] !== undefined) fields[h] = record[h]; });
    appendRecord_(toKey, fields);
    deleteRecordRow_(fromKey, id);
    return fields;
  });
}

/** Se esiste gia' una persona con questo ID in Persone Gia Contattate applica patch, altrimenti crea il record. */
function upsertPersonaRecord_(personaId, fullFieldsIfNew, patchIfExisting) {
  return withLock_(() => {
    const existing = getAllRecords_('personeContattate').find(r => r['ID Persona'] === personaId);
    if (existing) {
      updateRecordById_('personeContattate', personaId, patchIfExisting);
      return false;
    }
    appendRecord_('personeContattate', Object.assign({ 'ID Persona': personaId }, fullFieldsIfNew));
    return true;
  });
}

function generateId_(prefix) {
  return withLock_(() => {
    const ss = getSpreadsheet_();
    const key = 'seq_' + prefix;
    const current = Number(getConfigValue_(ss, key, 0)) + 1;
    setConfigValue_(ss, key, String(current));
    return prefix + '-' + String(current).padStart(6, '0');
  });
}

function getConfigValue_(ss, key, defaultValue) {
  const sheet = ss.getSheetByName(SHEETS.dashboardConfig.name);
  if (!sheet) return defaultValue;
  const values = sheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (values[r][0] === key) return values[r][1];
  }
  return defaultValue;
}

function setConfigValue_(ss, key, value) {
  const sheet = ensureSheet_(ss, SHEETS.dashboardConfig.name, HEADERS.dashboardConfig);
  const values = sheet.getDataRange().getValues();
  const now = formatDate_(new Date());
  for (let r = 1; r < values.length; r++) {
    if (values[r][0] === key) {
      sheet.getRange(r + 1, 2, 1, 2).setValues([[value, now]]);
      return;
    }
  }
  sheet.appendRow([key, value, now]);
}

/** Cerca un'azienda esistente per nome normalizzato o dominio; se non la trova la crea in "Aziende Target". */
function findOrCreateAzienda_(fields) {
  return withLock_(() => {
    const nameKey = normalizeCompanyName_(fields.azienda);
    const domainKey = normalizeDomain_(fields.sitoWebAzienda || fields.linkedinAzienda);
    const candidates = getAllRecords_('aziendeTarget').concat(getAllRecords_('aziendeContattate'));
    const match = candidates.find(r => {
      const rName = normalizeCompanyName_(r['Azienda']);
      const rDomain = normalizeDomain_(r['Sito Web'] || r['LinkedIn Azienda']);
      return (nameKey && rName === nameKey) || (domainKey && rDomain && rDomain === domainKey);
    });
    if (match) return { id: match['ID Azienda'], created: false };

    const record = appendRecord_('aziendeTarget', {
      'Data Inserimento': formatDate_(new Date()),
      'Azienda': fields.azienda || '',
      'Settore': fields.settore || '',
      'Sede': fields.sede || '',
      'Provincia': fields.provincia || '',
      'Regione': fields.regione || '',
      'Sito Web': fields.sitoWebAzienda || '',
      'LinkedIn Azienda': fields.linkedinAzienda || '',
      'Dimensione Azienda': fields.dimensioneAzienda || '',
      'Fatturato Stimato': fields.fatturatoStimato || '',
      'Motivo Interesse': fields.motivoInteresse || '',
      'Score Azienda': '',
      'Contatti Trovati': 1,
      'Stato': 'Nuovo',
      'Documenti': '',
      'Note': ''
    });
    return { id: record['ID Azienda'], created: true };
  });
}

/** Cerca una persona esistente per LinkedIn URL (chiave forte) o Nome+Cognome+Azienda; altrimenti assegna un ID nuovo. */
function findOrCreatePersona_(fields) {
  return withLock_(() => {
    const linkedinKey = normalizeLinkedInUrl_(fields.linkedinUrl);
    const personKey = normalizePersonKey_(fields.nome, fields.cognome, fields.azienda);
    const candidates = getAllRecords_('personeContattate').concat(getAllRecords_('leadWeekly'));
    const match = candidates.find(r => {
      if (!r['ID Persona']) return false;
      const rLinkedin = normalizeLinkedInUrl_(r['LinkedIn URL']);
      if (linkedinKey && rLinkedin) return rLinkedin === linkedinKey;
      return normalizePersonKey_(r['Nome'], r['Cognome'], r['Azienda']) === personKey;
    });
    if (match) return { id: match['ID Persona'], created: false };
    return { id: generateId_('PE'), created: true };
  });
}

// --- Normalizzazione stringhe per il matching (dedup, ricerca, find-or-create) ---

const COMPANY_SUFFIXES = ['s\\.?p\\.?a\\.?', 's\\.?r\\.?l\\.?', 's\\.?a\\.?s\\.?', 's\\.?n\\.?c\\.?', 'societa cooperativa', 'soc coop', 'group', 'holding', 'ltd', 'llc', 'inc', 'gmbh'];

function normalizeCompanyName_(name) {
  let value = String(name || '').toLowerCase().trim();
  value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  value = value.replace(/[^\w\s]/g, ' ');
  COMPANY_SUFFIXES.forEach(suffix => {
    value = value.replace(new RegExp('\\b' + suffix + '\\b', 'g'), ' ');
  });
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeDomain_(url) {
  const value = String(url || '').trim().toLowerCase();
  if (!value) return '';
  return value.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
}

function normalizeLinkedInUrl_(url) {
  const value = String(url || '').trim().toLowerCase();
  if (!value) return '';
  return value.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').split('?')[0];
}

function normalizePersonKey_(nome, cognome, azienda) {
  return [nome, cognome, azienda].map(v => normalizeCompanyName_(v)).join('|');
}

function formatDate_(date) {
  return Utilities.formatDate(date, CONFIG.timezone, 'yyyy-MM-dd HH:mm:ss');
}

function getWeekLabel_(date) {
  const year = Utilities.formatDate(date, CONFIG.timezone, 'yyyy');
  const week = Utilities.formatDate(date, CONFIG.timezone, 'w');
  return year + '-W' + String(week).padStart(2, '0');
}

function clean_(value) {
  return String(value || '').trim();
}

function appendLog_(operation, input, generated, duplicates, rejected, errors, status, notes) {
  appendRecord_('logAutomazioni', {
    'Data Esecuzione': formatDate_(new Date()),
    'Settimana': getWeekLabel_(new Date()),
    'Tipo Operazione': operation,
    'Input Usato': input,
    'Numero Lead Generati': generated,
    'Duplicati Rimossi': duplicates,
    'Lead Scartati': rejected,
    'Errori': errors,
    'Stato Esecuzione': status,
    'Note': notes
  });
}
