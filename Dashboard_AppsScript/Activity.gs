/**
 * Activity.gs
 * Release 0.2 - Activity Engine (con raffinamento del modello dati, vedi sotto).
 *
 * SCOPO
 * Fornire un unico log strutturato per ogni interazione rilevante nel CRM (chiamata, email,
 * riunione, nota, cambio di stato di una trattativa, documento caricato, ecc.), cosi' che il
 * "cosa e' successo e quando" smetta di essere sparso in campi "Note" liberi su fogli diversi e
 * diventi un'unica timeline interrogabile.
 *
 * RESPONSABILITA'
 * - Definire i tipi di attivita' possibili (ACTIVITY_TYPES) e i loro stati (ACTIVITY_STATUSES)
 *   come dati (rispecchiati 1:1 in Data.gs > LISTE_VALUES), non come stringhe sparse nel codice.
 * - Un unico punto di scrittura (logActivity_) cosi' ogni futuro chiamante crea attivita' nello
 *   stesso modo, con gli stessi default, invece di reinventare la logica ogni volta.
 * - Un unico punto di lettura a scopo timeline (getActivityTimeline_), filtrabile per azienda,
 *   persona, trattativa, utente, entita' generica (Lead/Utente) o relazione generica (vedi sotto),
 *   pensato per essere l'unica funzione che un futuro pannello "storico" o una futura funzione AI
 *   di riepilogo dovrebbero chiamare, invece di leggere il foglio "Attivita" direttamente.
 *
 * STATO ATTUALE: MOTORE PRONTO, NON ANCORA COLLEGATO A NULLA.
 * - Nessuna funzione qui dentro e' chiamata da Code.gs, Dashboard.html, Dedup.gs, Pipeline.gs,
 *   Scoring.gs, Outreach.gs, System.gs o da nessun trigger. Crearla non genera attivita' automatiche.
 * - Il tab "Attivita" in Data.gs e' un foglio vuoto finche' non si rilancia setupCrm(), e anche
 *   dopo resta vuoto finche' qualcosa non chiama esplicitamente logActivity_().
 *
 * PERCHE' QUESTO SCHEMA (nota di progettazione)
 * "Tipo/ID Entita Riferimento" e' un riferimento GENERICO SINGOLO (oggi pensato soprattutto per
 * Lead e Utente, che non hanno una colonna FK dedicata qui sotto), mentre "ID Azienda"/
 * "ID Persona"/"ID Trattativa" sono colonne esplicite perche' sono i collegamenti piu' frequenti e
 * una singola attivita' puo' toccarne piu' di uno insieme (es. una chiamata riguarda
 * contemporaneamente un Contatto e la Trattativa a cui e' legato: con solo un riferimento
 * generico non si potrebbe esprimere). "ID Utente" e' la persona a cui l'attivita' e' associata
 * (es. chi ha fatto la chiamata); "Creato Da" e' un campo di audit distinto, perche' non sempre
 * coincidono: un Manager puo' loggare un'attivita' per conto di un collega, o un'automazione
 * (es. "Lead Importato") puo' creare un'attivita' senza che nessun umano l'abbia "fatta" di persona.
 *
 * ============================================================
 * RAFFINAMENTO DEL MODELLO (questa versione) - 4 campi aggiunti, nessuno rimosso o rinominato
 * ============================================================
 *
 * 1) "Relazioni" - relazione generica MULTIPLA e RIPETIBILE.
 *    Il riferimento generico singolo ("Tipo/ID Entita Riferimento") resta com'era e continua a
 *    funzionare esattamente come prima: e' il modo piu' semplice e veloce da interrogare per il
 *    caso comune di UN riferimento generico aggiuntivo. "Relazioni" e' un meccanismo COMPLEMENTARE
 *    per quando un'attivita' deve collegarsi a piu' entita' di tipo arbitrario (anche entita' che
 *    non esistono ancora, come Proposta/Contratto/Documento/Campagna/Evento Hospitality): un array
 *    JSON di oggetti {tipo, id}, es. [{"tipo":"Proposta","id":"PR-000001"},{"tipo":"Documento",
 *    "id":"DOC-000004"}]. Aggiungere un nuovo tipo di entita' collegabile in futuro NON richiede
 *    mai una nuova colonna: si aggiunge solo un nuovo valore di "tipo" dentro l'array. Helper:
 *    getActivityRelations_() per leggere, addActivityRelation_() per aggiungere in modo sicuro
 *    (senza duplicati) a un'attivita' gia' esistente.
 *
 * 2) "Origine" (ACTIVITY_SOURCES) - come e' stata creata l'attivita' (Manuale/Email/Calendario/
 *    Import/Workflow/AI/Sistema). Utile per analytics future ("quante attivita' genera l'AI
 *    rispetto a quelle manuali?") e per distinguere automazioni da azioni umane. Default in
 *    logActivity_(): 'Manuale', il caso d'uso piu' comune oggi; un chiamante automatico dovra'
 *    specificare esplicitamente un'origine diversa.
 *
 * 3) "Esito" (ACTIVITY_OUTCOMES) - risultato di un'interazione specifica (Interessato/Nessuna
 *    Risposta/Riunione Programmata/Proposta Richiesta/Vinto/Perso/Follow-up Necessario). Campo
 *    volutamente distinto da "Esito Contatto" (gia' usato in Aziende/Persone Gia Contattate):
 *    quel campo descrive lo stato complessivo di una RELAZIONE nel tempo, questo descrive il
 *    risultato di UNA singola attivita' puntuale, e include esiti (Vinto/Perso) che non avrebbero
 *    senso su "Esito Contatto". Nessuna logica calcola o impone questo valore: e' solo un campo
 *    disponibile per chi registra l'attivita' da compilare se pertinente.
 *
 * 4) "Visibilita" (ACTIVITY_VISIBILITY) - chi dovrebbe poter vedere l'attivita' in futuro
 *    (Privata/Team/Management/Pubblica). Nessuna logica di permessi la applica ancora: e' un
 *    segnaposto pronto per quando System.gs (Sprint 1) iniziera' davvero a filtrare i dati, cosi'
 *    quel lavoro futuro trova gia' il campo pronto invece di dover fare un'altra migrazione.
 *
 * Compatibilita': tutti e quattro i campi sono aggiunti in coda a HEADERS.attivita (mai inseriti
 * in mezzo, mai rinominato nulla di esistente). ensureSheet_() in Data.gs scrive solo le colonne
 * mancanti su un foglio "Attivita" gia' esistente, senza toccare quelle gia' presenti: aggiornare
 * questo file e rilanciare setupCrm() su un'installazione che avesse gia' generato il tab
 * "Attivita" con lo schema della release precedente e' sicuro.
 *
 * STRUTTURA CONSIGLIATA PER "Metadata" (documentazione, non imposta da nessuna validazione)
 * Campo JSON libero: qualunque modulo futuro puo' scriverci quello che gli serve. Per restare
 * tutti coerenti, la struttura consigliata (vedi ACTIVITY_METADATA_TEMPLATE sotto come riferimento
 * concreto, non solo un commento) e':
 *   {
 *     "summary": "",            // riassunto testuale, es. generato da AI
 *     "sentiment": "",          // es. "positivo"/"neutro"/"negativo"
 *     "participants": [],       // es. altri ID Persona coinvolti oltre al contatto principale
 *     "attachments": [],        // es. URL Drive di documenti collegati
 *     "emailThreadId": "",      // ID thread Gmail, se l'attivita' viene da un'email
 *     "calendarEventId": "",    // ID evento Calendar, se l'attivita' viene da un appuntamento
 *     "nextSuggestedAction": "",// es. suggerimento generato da un futuro AI Copilot
 *     "aiGenerated": false      // true se il record/i suoi contenuti sono stati generati da AI
 *   }
 * Nessun campo e' obbligatorio e nessun codice qui dentro legge/scrive questi campi
 * specifici: e' solo la forma raccomandata per chi inizia a popolare Metadata in futuro,
 * cosi' moduli diversi (AI Copilot, Notifications, Analytics) non inventano ciascuno il proprio
 * formato.
 *
 * USO FUTURO (invariato rispetto alla release precedente)
 * - UI: una scheda "Storico attivita'" per Azienda/Persona/Trattativa puo' chiamare
 *   getActivityTimeline_({idAzienda: ...}) senza dover leggere il foglio direttamente.
 * - Automazioni: Dedup.gs/Pipeline.gs/Outreach.gs potranno chiamare logActivity_() nei punti in
 *   cui oggi scrivono solo in un campo "Note" - non lo fanno ancora, per restare nello scope.
 * - Task Engine / Notifications: possono leggere "Data Scadenza"/"Stato" per capire cosa e'
 *   pianificato e non ancora completato, e usare "Relazioni" per sapere a cosa si riferisce.
 * - Business Community / Hospitality / Proposal Builder: possono collegarsi tramite "Relazioni"
 *   senza richiedere nuove colonne su questo foglio quando quelle entita' verranno create.
 */

const ACTIVITY_TYPES = {
  CALL: 'Chiamata',
  EMAIL: 'Email',
  MEETING: 'Riunione',
  FOLLOW_UP: 'Follow-up',
  NOTE: 'Nota',
  TASK_COMPLETED: 'Task Completato',
  DEAL_CREATED: 'Trattativa Creata',
  DEAL_UPDATED: 'Trattativa Aggiornata',
  LEAD_IMPORTED: 'Lead Importato',
  PROPOSAL_SENT: 'Proposta Inviata',
  HOSPITALITY_INVITATION: 'Invito Hospitality',
  BUSINESS_LUNCH: 'Pranzo di Lavoro',
  CONTRACT_SIGNED: 'Contratto Firmato',
  DOCUMENT_UPLOADED: 'Documento Caricato'
};

// Valori ammessi per "Tipo Entita Riferimento": le entita' che oggi non hanno una colonna FK
// dedicata su "Attivita" (Azienda/Persona/Trattativa ce l'hanno gia', vedi sopra). Per collegare
// PIU' entita' arbitrarie insieme (incluse quelle non ancora esistenti) vedi "Relazioni" sotto.
const ACTIVITY_ENTITY_TYPES = {
  LEAD: 'Lead',
  AZIENDA: 'Azienda',
  PERSONA: 'Persona',
  TRATTATIVA: 'Trattativa',
  UTENTE: 'Utente'
};

const ACTIVITY_STATUSES = {
  PLANNED: 'Pianificata',
  COMPLETED: 'Completata',
  CANCELLED: 'Annullata'
};

/** Come e' stata creata l'attivita' (campo "Origine", Task 2 del raffinamento). */
const ACTIVITY_SOURCES = {
  MANUAL: 'Manuale',
  EMAIL: 'Email',
  CALENDAR: 'Calendario',
  IMPORT: 'Import',
  WORKFLOW: 'Workflow',
  AI: 'AI',
  SYSTEM: 'Sistema'
};

/** Risultato di una singola attivita' (campo "Esito", Task 3 del raffinamento). Opzionale. */
const ACTIVITY_OUTCOMES = {
  INTERESTED: 'Interessato',
  NO_ANSWER: 'Nessuna Risposta',
  MEETING_SCHEDULED: 'Riunione Programmata',
  PROPOSAL_REQUESTED: 'Proposta Richiesta',
  WON: 'Vinto',
  LOST: 'Perso',
  FOLLOW_UP_REQUIRED: 'Follow-up Necessario'
};

/** Visibilita' futura dell'attivita' (campo "Visibilita", Task 4 del raffinamento). Nessuna
 *  logica di permessi la applica ancora - vedi nota di compatibilita' in cima al file. */
const ACTIVITY_VISIBILITY = {
  PRIVATE: 'Privata',
  TEAM: 'Team',
  MANAGEMENT: 'Management',
  PUBLIC: 'Pubblica'
};

/**
 * Struttura JSON raccomandata per il campo "Metadata" (Task 5 del raffinamento). Puramente
 * documentale/di riferimento: nessuna funzione qui dentro la impone o la valida. Un futuro
 * chiamante puo' partire da qui, es. Object.assign({}, ACTIVITY_METADATA_TEMPLATE, {summary: '...'}).
 */
const ACTIVITY_METADATA_TEMPLATE = {
  summary: '',
  sentiment: '',
  participants: [],
  attachments: [],
  emailThreadId: '',
  calendarEventId: '',
  nextSuggestedAction: '',
  aiGenerated: false
};

/**
 * Unico punto di scrittura per una nuova attivita'. Tutti i campi sono opzionali tranne quelli
 * che ha senso lasciare vuoti solo in casi specifici (es. un'attivita' di sistema senza
 * "ID Utente" associato) - la funzione non impone campi obbligatori: e' compito del chiamante
 * futuro decidere cosa e' significativo per il proprio caso d'uso.
 *
 * @param {Object} fields
 * @param {string} [fields.tipo] Uno dei valori di ACTIVITY_TYPES.
 * @param {string} [fields.tipoEntitaRiferimento] Uno dei valori di ACTIVITY_ENTITY_TYPES.
 * @param {string} [fields.idEntitaRiferimento] ID dell'entita' generica collegata (es. ID Lead).
 * @param {string} [fields.idAzienda] ID Azienda, se pertinente.
 * @param {string} [fields.idPersona] ID Persona, se pertinente.
 * @param {string} [fields.idTrattativa] ID Trattativa, se pertinente.
 * @param {string} [fields.idUtente] ID Utente a cui l'attivita' e' associata.
 * @param {string} [fields.titolo]
 * @param {string} [fields.descrizione]
 * @param {string} [fields.creatoDa] Audit: chi/cosa ha creato la riga. Default: idUtente, o 'Sistema'.
 * @param {string|Date} [fields.dataScadenza]
 * @param {string|Date} [fields.dataCompletamento]
 * @param {string} [fields.stato] Uno dei valori di ACTIVITY_STATUSES. Default: Completata (log immediato).
 * @param {string[]|string} [fields.tag] Elenco di tag, o stringa gia' separata da virgole.
 * @param {Object} [fields.metadata] Oggetto libero, serializzato in JSON (vedi ACTIVITY_METADATA_TEMPLATE).
 * @param {Array<{tipo:string,id:string}>} [fields.relazioni] Relazioni generiche multiple, serializzate in JSON.
 * @param {string} [fields.origine] Uno dei valori di ACTIVITY_SOURCES. Default: 'Manuale'.
 * @param {string} [fields.esito] Uno dei valori di ACTIVITY_OUTCOMES. Opzionale, nessun default.
 * @param {string} [fields.visibilita] Uno dei valori di ACTIVITY_VISIBILITY. Opzionale, nessun default.
 */
function logActivity_(fields) {
  fields = fields || {};
  return appendRecord_('attivita', {
    'Tipo': fields.tipo || '',
    'Tipo Entita Riferimento': fields.tipoEntitaRiferimento || '',
    'ID Entita Riferimento': fields.idEntitaRiferimento || '',
    'ID Azienda': fields.idAzienda || '',
    'ID Persona': fields.idPersona || '',
    'ID Trattativa': fields.idTrattativa || '',
    'ID Utente': fields.idUtente || '',
    'Titolo': fields.titolo || '',
    'Descrizione': fields.descrizione || '',
    'Data Creazione': formatDate_(new Date()),
    'Creato Da': fields.creatoDa || fields.idUtente || 'Sistema',
    'Data Scadenza': fields.dataScadenza || '',
    'Data Completamento': fields.dataCompletamento || '',
    'Stato': fields.stato || ACTIVITY_STATUSES.COMPLETED,
    'Tag': Array.isArray(fields.tag) ? fields.tag.join(', ') : (fields.tag || ''),
    'Metadata': fields.metadata ? JSON.stringify(fields.metadata) : '',
    'Relazioni': Array.isArray(fields.relazioni) ? JSON.stringify(fields.relazioni) : '',
    'Origine': fields.origine || ACTIVITY_SOURCES.MANUAL,
    'Esito': fields.esito || '',
    'Visibilita': fields.visibilita || ''
  });
}

/** Segna un'attivita' pianificata come completata, impostando la data di completamento a ora. */
function completeActivity_(activityId) {
  return updateRecordById_('attivita', activityId, {
    'Stato': ACTIVITY_STATUSES.COMPLETED,
    'Data Completamento': formatDate_(new Date())
  });
}

/**
 * Timeline generica, filtrabile, ordinata dalla piu' recente. Pensata come UNICO punto di
 * lettura per qualunque vista o funzione futura abbia bisogno dello storico di un'entita'.
 *
 * @param {Object} [filters]
 * @param {string} [filters.idAzienda]
 * @param {string} [filters.idPersona]
 * @param {string} [filters.idTrattativa]
 * @param {string} [filters.idUtente]
 * @param {string} [filters.tipoEntitaRiferimento] Da usare insieme a idEntitaRiferimento.
 * @param {string} [filters.idEntitaRiferimento]
 * @param {{tipo:string,id:string}} [filters.relazione] Filtra per una relazione generica presente in "Relazioni".
 * @param {string} [filters.tipo] Uno dei valori di ACTIVITY_TYPES.
 * @param {string} [filters.stato] Uno dei valori di ACTIVITY_STATUSES.
 * @param {string} [filters.origine] Uno dei valori di ACTIVITY_SOURCES.
 * @param {string} [filters.esito] Uno dei valori di ACTIVITY_OUTCOMES.
 * @param {string} [filters.visibilita] Uno dei valori di ACTIVITY_VISIBILITY.
 */
function getActivityTimeline_(filters) {
  filters = filters || {};
  let rows = getAllRecords_('attivita');

  if (filters.idAzienda) rows = rows.filter(r => r['ID Azienda'] === filters.idAzienda);
  if (filters.idPersona) rows = rows.filter(r => r['ID Persona'] === filters.idPersona);
  if (filters.idTrattativa) rows = rows.filter(r => r['ID Trattativa'] === filters.idTrattativa);
  if (filters.idUtente) rows = rows.filter(r => r['ID Utente'] === filters.idUtente);
  if (filters.tipoEntitaRiferimento && filters.idEntitaRiferimento) {
    rows = rows.filter(r =>
      r['Tipo Entita Riferimento'] === filters.tipoEntitaRiferimento &&
      r['ID Entita Riferimento'] === filters.idEntitaRiferimento
    );
  }
  if (filters.relazione && filters.relazione.tipo && filters.relazione.id) {
    rows = rows.filter(r => getActivityRelations_(r).some(
      rel => rel.tipo === filters.relazione.tipo && rel.id === filters.relazione.id
    ));
  }
  if (filters.tipo) rows = rows.filter(r => r['Tipo'] === filters.tipo);
  if (filters.stato) rows = rows.filter(r => r['Stato'] === filters.stato);
  if (filters.origine) rows = rows.filter(r => r['Origine'] === filters.origine);
  if (filters.esito) rows = rows.filter(r => r['Esito'] === filters.esito);
  if (filters.visibilita) rows = rows.filter(r => r['Visibilita'] === filters.visibilita);

  rows.sort((a, b) => new Date(b['Data Creazione']) - new Date(a['Data Creazione']));
  return rows;
}

/** Legge il campo Tag come array di stringhe (il foglio lo salva come testo separato da virgole). */
function getActivityTags_(activity) {
  const raw = activity && activity['Tag'];
  if (!raw) return [];
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

/** Legge il campo Metadata come oggetto JS. Non lancia mai eccezioni su JSON non valido/assente. */
function getActivityMetadata_(activity) {
  const raw = activity && activity['Metadata'];
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

/**
 * Legge il campo "Relazioni" come array di {tipo, id}. Non lancia mai eccezioni su JSON non
 * valido/assente: e' il meccanismo di relazione generico e ripetibile del Task 1 del raffinamento.
 */
function getActivityRelations_(activity) {
  const raw = activity && activity['Relazioni'];
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Aggiunge una relazione generica a un'attivita' gia' esistente, senza creare duplicati.
 * Esempio futuro: addActivityRelation_(activityId, 'Proposta', 'PR-000001').
 */
function addActivityRelation_(activityId, tipo, id) {
  const activity = findRecordById_('attivita', activityId);
  if (!activity) throw new Error('Attivita non trovata: ' + activityId);

  const relations = getActivityRelations_(activity);
  const alreadyPresent = relations.some(r => r.tipo === tipo && r.id === id);
  if (!alreadyPresent) relations.push({ tipo: tipo, id: id });

  updateRecordById_('attivita', activityId, { 'Relazioni': JSON.stringify(relations) });
  return relations;
}
