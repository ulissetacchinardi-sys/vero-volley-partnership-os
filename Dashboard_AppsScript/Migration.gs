/**
 * Migration.gs
 * Sprint 1 - Fondamenta infrastrutturali.
 *
 * SCOPO
 * Raccogliere in un unico posto, ben separato dal resto, le funzioni che serviranno a migrare i
 * dati esistenti verso il modello utenti/ownership descritto nel documento di architettura
 * (Owner testuale -> ID Utente Owner reale, Ruolo, Created By / Updated By).
 *
 * REGOLA FERREA DI QUESTO FILE
 * NESSUNA funzione qui dentro viene chiamata automaticamente da setupCrm(), da un trigger, o da
 * Code.gs. Vanno eseguite a mano dall'editor Apps Script, una alla volta, solo quando si decide
 * consapevolmente di procedere con il passo di migrazione corrispondente. Per questo sono anche
 * scritte in modo difensivo: se le premesse per agire non ci sono ancora (es. una colonna che
 * uno sprint futuro deve prima aggiungere), si fermano e riportano perche', senza scrivere nulla.
 *
 * USO FUTURO
 * - bootstrapUsersFromOwnerFields_(): da eseguire quando si e' pronti a censire gli utenti reali
 *   a partire dai nomi Owner gia' in uso nei fogli esistenti (Sprint 1/2).
 * - backfillOwnerIdOnSheet_(sheetKey): da eseguire foglio per foglio DOPO che uno sprint futuro
 *   avra' aggiunto la colonna "ID Utente Owner" a HEADERS per quel foglio (Sprint 2+). Oggi,
 *   chiamata su qualsiasi foglio esistente, si limita a rispondere "non ancora pronto" senza
 *   effetti collaterali: e' sicura da provare anche adesso.
 */

/**
 * Legge (sola lettura) gli Owner testuali gia' presenti nei fogli operativi e crea in "Utenti"
 * un record segnaposto per ciascun nome non ancora censito, con Stato "Da completare" in attesa
 * che un Amministratore vi associ l'email Google Workspace reale e il ruolo corretto.
 * Non modifica in alcun modo i fogli di origine: sono aperti solo in lettura.
 */
function bootstrapUsersFromOwnerFields_() {
  const ownerSheets = ['leadWeekly', 'aziendeContattate', 'personeContattate', 'trattativeAperte'];
  const candidateNames = new Set();

  ownerSheets.forEach(sheetKey => {
    getAllRecords_(sheetKey).forEach(record => {
      const owner = String(record['Owner'] || '').trim();
      if (owner) candidateNames.add(owner);
    });
  });

  const existingDisplayNames = new Set(
    getAllRecords_(SYSTEM_CONFIG.usersSheetKey).map(u => String(u['Nome Visualizzato'] || '').trim())
  );

  let usersCreated = 0;
  candidateNames.forEach(name => {
    if (existingDisplayNames.has(name)) return;
    appendRecord_(SYSTEM_CONFIG.usersSheetKey, {
      'Email': '',
      'Nome': '',
      'Cognome': '',
      'Nome Visualizzato': name,
      'Ruolo': ROLES.SALES,
      'Team': '',
      'Stato': 'Da completare',
      'Data Creazione': formatDate_(new Date()),
      'Ultimo Accesso': ''
    });
    usersCreated++;
  });

  return {
    candidatesFound: candidateNames.size,
    usersCreated: usersCreated,
    alreadyPresent: candidateNames.size - usersCreated
  };
}

/**
 * Backfilla "ID Utente Owner" su un foglio, facendo corrispondere il testo "Owner" attuale a un
 * record di "Utenti" per Nome Visualizzato. Si ferma senza scrivere nulla se il foglio indicato
 * non ha ancora una colonna "ID Utente Owner" in HEADERS (verra' aggiunta in uno sprint futuro).
 */
function backfillOwnerIdOnSheet_(sheetKey) {
  const headers = HEADERS[sheetKey];
  if (!headers || headers.indexOf('ID Utente Owner') === -1) {
    return {
      ready: false,
      reason: 'Il foglio "' + sheetKey + '" non ha ancora una colonna "ID Utente Owner" in HEADERS: nessuna modifica eseguita.'
    };
  }

  const idField = SHEETS[sheetKey] && SHEETS[sheetKey].idField;
  if (!idField) {
    return { ready: false, reason: 'Il foglio "' + sheetKey + '" non ha una colonna ID: impossibile aggiornare righe specifiche.' };
  }

  const users = getAllRecords_(SYSTEM_CONFIG.usersSheetKey);
  const records = getAllRecords_(sheetKey);
  let updated = 0;
  let unmatched = 0;
  let alreadyMigrated = 0;

  records.forEach(record => {
    if (record['ID Utente Owner']) { alreadyMigrated++; return; }
    const ownerName = String(record['Owner'] || '').trim();
    const match = users.find(u => String(u['Nome Visualizzato'] || '').trim() === ownerName);
    if (match) {
      updateRecordById_(sheetKey, record[idField], { 'ID Utente Owner': match['ID Utente'] });
      updated++;
    } else {
      unmatched++;
    }
  });

  return { ready: true, updated: updated, unmatched: unmatched, alreadyMigrated: alreadyMigrated };
}
