/**
 * Ownership.gs
 * Sprint 2 - Ownership Engine.
 *
 * SCOPO
 * Dare a ogni entita' di business del CRM (Lead Weekly, Aziende Target, Aziende Gia Contattate,
 * Persone Gia Contattate, Trattative Aperte) un modello di proprieta' vero: un owner primario piu'
 * collaboratori, invece del solo campo "Owner" testuale libero usato finora. E' la base su cui
 * potranno appoggiarsi Dashboard Personale, Dashboard Manager, il motore permessi di System.gs,
 * l'AI Assistant, il Reporting, le Notifiche, i Workflow e la Business Community.
 *
 * RESPONSABILITA'
 * - Definire chi e' l'owner di un record e chi altro puo' collaborarci (assignOwner_/changeOwner_/
 *   getOwner_/addCollaborator_/removeCollaborator_/getCollaborators_), in modo generico per
 *   qualunque foglio abilitato, senza duplicare la stessa logica cinque volte.
 * - Preservare uno storico minimo ogni volta che l'owner cambia (Task 3): chi era prima, quando,
 *   chi ha fatto il cambio. Nessuna tabella nuova: un campo JSON in coda al record stesso.
 * - Esporre helper di lettura (getOwnedRecords_/getSharedRecords_/getVisibleRecords_) pronti per
 *   una futura Dashboard Personale/Manager, ma NON ancora usati da nessuna parte del CRM.
 * - Fornire un primo mattone di verifica accesso (canUserAccessRecord_) basato solo su
 *   owner/collaboratori/visibilita': NON e' il motore permessi (quello resta System.gs, con i suoi
 *   ruoli ADMIN/MANAGER/SALES/READ_ONLY) e non lo sostituisce ne' lo richiama.
 *
 * STATO ATTUALE (Sprint 2): PRONTO MA NON COLLEGATO A NULLA.
 * - Nessuna funzione di questo file e' chiamata da Code.gs, Dashboard.html, nessuna View_*.html,
 *   Dedup.gs, Scoring.gs, Pipeline.gs, Outreach.gs, Triggers.gs, System.gs o Activity.gs.
 * - Le nuove colonne (vedi sotto) sono vuote su ogni riga esistente e restano vuote finche' non si
 *   chiama esplicitamente una funzione di questo file: nessun comportamento del CRM cambia oggi.
 * - Non viene wired alcun controllo permessi da nessuna parte: canUserAccessRecord_() calcola solo
 *   un booleano, ma nessun controller esistente lo interroga per bloccare o filtrare alcunche'.
 *
 * FOGLI ABILITATI ALL'OWNERSHIP (OWNERSHIP_ENABLED_SHEETS)
 * leadWeekly, aziendeTarget, aziendeContattate, personeContattate, trattativeAperte. Sono gli
 * unici cinque fogli la cui HEADERS (vedi Data.gs) e' stata estesa in questo sprint con le colonne
 * "ID Utente Owner", "Collaboratori", "Visibilita", "Data Assegnazione" (+ "Ultima Riassegnazione"
 * e "Storico Assegnazioni" per Trattative Aperte, + "Storico Assegnazioni" anche sugli altri
 * quattro, vedi nota schema in Data.gs). Ogni funzione qui dentro rifiuta esplicitamente un
 * sheetKey non abilitato, per non rischiare di scrivere colonne inesistenti su un foglio come
 * "Utenti" o "Attivita".
 *
 * NOTA SU "Storico Assegnazioni" (Task 3, Assignment History)
 * Il Task 1 elenca esplicitamente "Ultima Riassegnazione" solo per Trattative Aperte: li' resta un
 * campo data leggibile in stile "Data ...", coerente con tutti gli altri campi data dello schema.
 * Per soddisfare il Task 3 ("ogni volta che l'ownership cambia, preservare Previous Owner/
 * Timestamp/Actor, un campo JSON basta, niente fogli nuovi") in modo generico su tutti i cinque
 * fogli - non solo su Trattative Aperte - e' stata aggiunta una colonna "Storico Assegnazioni"
 * (JSON, array di {previousOwner, timestamp, actor}) a tutti e cinque i fogli abilitati. E' l'unica
 * colonna aggiunta oltre a quelle elencate esplicitamente nel Task 1: senza di essa changeOwner_()
 * non avrebbe dove scrivere lo storico su Lead Weekly/Aziende Target/Aziende Contattate/Persone
 * Gia Contattate, dato che solo Trattative Aperte ha un campo dedicato nel testo del task.
 *
 * USO FUTURO (Sprint successivi)
 * - Dashboard Personale: getOwnedRecords_(sheetKey, userId) per "i miei lead/le mie trattative".
 * - Dashboard Manager: getVisibleRecords_(sheetKey, userId, ruolo) per una vista aggregata team.
 * - Permessi (System.gs): quando l'enforcement verra' attivato, canView_/canEdit_ di System.gs
 *   potranno delegare il controllo di scope 'own'/'team' a canUserAccessRecord_() invece di
 *   reinventare la logica di ownership.
 * - AI Assistant / Notifiche / Workflow: potranno leggere "ID Utente Owner"/"Collaboratori" per
 *   sapere a chi notificare o assegnare un task, e "Storico Assegnazioni" per capire il passaggio
 *   di mano di un lead/trattativa nel tempo.
 * - Business Community: "Visibilita" (Pubblica) e' pensata anche per un futuro scenario in cui un
 *   record possa essere visibile oltre il singolo team commerciale.
 */

// Fogli la cui HEADERS (Data.gs) e' stata estesa con le colonne di ownership in questo sprint.
const OWNERSHIP_ENABLED_SHEETS = [
  'leadWeekly', 'aziendeTarget', 'aziendeContattate', 'personeContattate', 'trattativeAperte'
];

/** Chi puo' vedere un record (campo "Visibilita", Task 4). Nessuna logica di permessi la applica
 *  ancora: e' un dato pronto per un futuro motore di visibilita'/permessi. */
const OWNER_VISIBILITY = {
  PRIVATE: 'Privata',
  TEAM: 'Team',
  MANAGEMENT: 'Management',
  PUBLIC: 'Pubblica'
};

/** Ruolo di un collaboratore su un record (campo "Collaboratori", Task 4). */
const COLLABORATOR_ROLE = {
  EDITOR: 'Editor',
  VIEWER: 'Visualizzatore'
};

function assertOwnershipEnabled_(sheetKey) {
  if (OWNERSHIP_ENABLED_SHEETS.indexOf(sheetKey) === -1) {
    throw new Error('Il foglio "' + sheetKey + '" non fa parte dell\'Ownership Engine (Sprint 2).');
  }
}

/** Legge "Collaboratori" come array di {id, ruolo}. Non lancia mai eccezioni su JSON assente/non valido. */
function getCollaborators_(sheetKey, recordId) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  return parseCollaborators_(record);
}

function parseCollaborators_(record) {
  const raw = record && record['Collaboratori'];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/** Legge "Storico Assegnazioni" come array di {previousOwner, timestamp, actor}. Mai eccezioni. */
function getAssignmentHistory_(sheetKey, recordId) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  return parseAssignmentHistory_(record);
}

function parseAssignmentHistory_(record) {
  const raw = record && record['Storico Assegnazioni'];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/** Owner primario attuale del record ("ID Utente Owner"), o '' se non assegnato. */
function getOwner_(sheetKey, recordId) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  return (record && record['ID Utente Owner']) || '';
}

/**
 * Prima assegnazione di un owner a un record (o sovrascrittura diretta, senza calcolare uno
 * storico di "prima chi c'era"): pensata per il momento in cui un record viene creato/qualificato
 * e non ha ancora nessun owner. Per un cambio di owner con storico usa changeOwner_().
 */
function assignOwner_(sheetKey, recordId, ownerId, actor) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  if (!record) throw new Error('Record non trovato in "' + sheetKey + '": ' + recordId);

  const now = formatDate_(new Date());
  updateRecordById_(sheetKey, recordId, {
    'ID Utente Owner': ownerId || '',
    'Data Assegnazione': now
  });
  return { owner: ownerId || '', assignedAt: now, actor: actor || '' };
}

/**
 * Cambia l'owner di un record gia' assegnato, preservando lo storico (Task 3): appende
 * {previousOwner, timestamp, actor} a "Storico Assegnazioni" prima di sovrascrivere "ID Utente
 * Owner". Su Trattative Aperte aggiorna anche "Ultima Riassegnazione" (timestamp leggibile).
 */
function changeOwner_(sheetKey, recordId, newOwnerId, actor) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  if (!record) throw new Error('Record non trovato in "' + sheetKey + '": ' + recordId);

  const previousOwner = record['ID Utente Owner'] || '';
  const now = formatDate_(new Date());
  const history = parseAssignmentHistory_(record);
  history.push({ previousOwner: previousOwner, timestamp: now, actor: actor || '' });

  const patch = {
    'ID Utente Owner': newOwnerId || '',
    'Data Assegnazione': now,
    'Storico Assegnazioni': JSON.stringify(history)
  };
  if (HEADERS[sheetKey].indexOf('Ultima Riassegnazione') !== -1) {
    patch['Ultima Riassegnazione'] = now;
  }
  updateRecordById_(sheetKey, recordId, patch);

  return { previousOwner: previousOwner, newOwner: newOwnerId || '', timestamp: now, actor: actor || '' };
}

/** Aggiunge (o aggiorna il ruolo di) un collaboratore su un record, senza duplicati. */
function addCollaborator_(sheetKey, recordId, userId, role) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  if (!record) throw new Error('Record non trovato in "' + sheetKey + '": ' + recordId);

  const collaborators = parseCollaborators_(record);
  const existing = collaborators.find(c => c.id === userId);
  if (existing) {
    existing.ruolo = role || existing.ruolo;
  } else {
    collaborators.push({ id: userId, ruolo: role || COLLABORATOR_ROLE.VIEWER });
  }
  updateRecordById_(sheetKey, recordId, { 'Collaboratori': JSON.stringify(collaborators) });
  return collaborators;
}

/** Rimuove un collaboratore da un record, se presente. */
function removeCollaborator_(sheetKey, recordId, userId) {
  assertOwnershipEnabled_(sheetKey);
  const record = findRecordById_(sheetKey, recordId);
  if (!record) throw new Error('Record non trovato in "' + sheetKey + '": ' + recordId);

  const collaborators = parseCollaborators_(record).filter(c => c.id !== userId);
  updateRecordById_(sheetKey, recordId, { 'Collaboratori': JSON.stringify(collaborators) });
  return collaborators;
}

/**
 * Verifica se un utente puo' accedere a un record in base a owner/collaboratori/visibilita'.
 * NON e' il motore permessi (vedi System.gs per ruoli/PERMISSIONS): e' un mattone piu' semplice,
 * limitato all'ownership, pensato per essere eventualmente richiamato da un futuro motore permessi
 * piu' completo invece di essere gia' esso stesso quel motore. Oggi nessuna funzione lo chiama.
 *
 * Regole (in ordine): owner primario -> sempre true; collaboratore (qualsiasi ruolo) -> true;
 * "Visibilita" = Pubblica -> true per chiunque; "Visibilita" = Team/Management -> true solo se
 * l'utente e' owner o collaboratore (il concetto di "stesso team" non esiste ancora in questo
 * sprint: e' un segnaposto, vedi PERMISSIONS['team'] in System.gs per la stessa nota); "Visibilita"
 * = Privata o assente -> true solo per owner/collaboratori.
 */
function canUserAccessRecord_(sheetKey, recordId, userId) {
  assertOwnershipEnabled_(sheetKey);
  if (!userId) return false;
  const record = findRecordById_(sheetKey, recordId);
  if (!record) return false;

  if (record['ID Utente Owner'] === userId) return true;
  if (parseCollaborators_(record).some(c => c.id === userId)) return true;
  if (record['Visibilita'] === OWNER_VISIBILITY.PUBLIC) return true;
  return false;
}

// --- Task 5: Future Helpers (pronti, NON ancora usati da nessuna parte del CRM) ---

/** Tutti i record di un foglio di cui userId e' l'owner primario. */
function getOwnedRecords_(sheetKey, userId) {
  assertOwnershipEnabled_(sheetKey);
  if (!userId) return [];
  return getAllRecords_(sheetKey).filter(r => r['ID Utente Owner'] === userId);
}

/** Tutti i record di un foglio in cui userId compare come collaboratore (non owner). */
function getSharedRecords_(sheetKey, userId) {
  assertOwnershipEnabled_(sheetKey);
  if (!userId) return [];
  return getAllRecords_(sheetKey).filter(r =>
    r['ID Utente Owner'] !== userId && parseCollaborators_(r).some(c => c.id === userId)
  );
}

/**
 * Unione di posseduti + condivisi + pubblici, pensata come base per una futura Dashboard
 * Personale/Manager. Non applica ancora alcuna logica di ruolo (es. Manager che vede tutto il
 * team): il parametro e' gia' presente per quando quella logica verra' aggiunta, cosi' la firma
 * della funzione non dovra' cambiare di nuovo.
 */
function getVisibleRecords_(sheetKey, userId, role) {
  assertOwnershipEnabled_(sheetKey);
  if (!userId) return [];
  return getAllRecords_(sheetKey).filter(r =>
    r['ID Utente Owner'] === userId ||
    parseCollaborators_(r).some(c => c.id === userId) ||
    r['Visibilita'] === OWNER_VISIBILITY.PUBLIC
  );
}
