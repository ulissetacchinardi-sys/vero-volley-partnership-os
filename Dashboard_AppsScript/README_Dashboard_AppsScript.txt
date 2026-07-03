CRM SPONSOR B2B VERO VOLLEY - APPS SCRIPT

Obiettivo:
Vero CRM web per la pipeline sponsor B2B, costruito su Google Apps Script + Google Sheets
(nessuno strumento a pagamento). Sostituisce la sola dashboard di input settimanale con:
- deduplica e controllo blacklist automatici su ogni nuovo lead;
- calcolo automatico di Sponsor Fit Score e Priorita (a regole, configurabili in Scoring.gs);
- pipeline commerciale visuale (Kanban) su "Trattative Aperte";
- schede Azienda/Contatto con storico completo;
- invio email di outreach via Gmail, promemoria su Google Calendar, allegati su Google Drive;
- archiviazione automatica settimanale e sincronizzazione stato lead <-> storico contatti.

File inclusi (tutti nella stessa cartella Apps Script):
- Data.gs: schema, configurazione, CRUD generico su tutti i fogli, find-or-create Azienda/Persona.
- Dedup.gs: motore di deduplica e blacklist, valutazione/importazione lead.
- Scoring.gs: calcolo Sponsor Fit Score e Priorita a regole.
- Pipeline.gs: pipeline/Kanban, ricerca, schede di dettaglio, archiviazione settimanale.
- Outreach.gs: invio email (Gmail), follow-up (Calendar), allegati (Drive).
- Triggers.gs: trigger schedulati (manutenzione settimanale) e onEdit (sincronizzazione manuale).
- Code.gs: punto di ingresso della web app (doGet) e funzioni esposte alla UI.
- Dashboard.html: shell dell'interfaccia (navigazione a tab, drawer di dettaglio condiviso).
- View_Overview.html, View_Pipeline.html, View_LeadWeekly.html, View_Aziende.html: le 4 viste.
- appsscript.json: manifest del progetto (scope OAuth: Sheets, Gmail, Calendar, Drive).
- System.gs: fondamenta multi-utente (ruoli, permessi, identita') - vedi sezione dedicata sotto.
- Migration.gs: helper di migrazione manuali per il passaggio a utenti/ownership reali - vedi sotto.
- Activity.gs: motore attivita'/timeline centralizzato - vedi sezione dedicata sotto.
- Ownership.gs: motore di proprieta'/collaborazione sui record (owner, collaboratori, storico
  assegnazioni) - vedi sezione dedicata sotto.

Passaggi per installare:
0. GIA' FATTO: il Google Sheet operativo "Vero Volley - CRM Sponsor B2B" e' gia' stato creato
   (https://docs.google.com/spreadsheets/d/1GLFHliNcgcP8C7V3eEFcXx1GBuoFyh6IZOQtYHUl1C4/edit)
   e il suo ID e' gia' impostato in Data.gs (CONFIG.spreadsheetId). Non serve ricrearlo ne'
   modificarlo, e non serve piu' partire dai file Excel delle cartelle 04/05: lo script crea da
   solo tutti i tab necessari al primo avvio (vedi nota in fondo sulle cartelle 04 e 05 originarie).
1. Vai su https://script.google.com/ e crea un nuovo progetto Apps Script.
2. Crea/incolla tutti i file .gs e .html elencati sopra, piu' appsscript.json (Editor > Impostazioni
   progetto > "Mostra file manifest appsscript.json" per poterlo modificare).
3. Esegui manualmente la funzione setupCrm (menu Esegui > Funzione: setupCrm) dall'editor.
   Alla prima esecuzione Google chiedera' di autorizzare gli scope: Fogli, Gmail (invio),
   Calendar, Drive (solo file creati dall'app) e gestione trigger. Autorizza con l'account
   Google che user' operativamente il CRM.
   Questo passaggio crea tutti i tab (Lead Weekly, Aziende Target, Risposte Lunedi,
   Log Automazioni, Archivio Lead, Aziende Gia Contattate, Persone Gia Contattate,
   Da Non Contattare, Trattative Aperte, Esclusive Sponsor, Lead Scartati, Liste,
   Dashboard Config), le intestazioni con i menu a tendina, e installa i trigger automatici
   (manutenzione ogni lunedi alle 7 + sincronizzazione stato lead on-edit).
4. Pubblica la web app: Deploy > New deployment > Web app.
5. Impostazioni deploy consigliate: Execute as "Me", Who has access in base al team
   (es. "Anyone within [tuo dominio Google Workspace]" per farla usare a piu' commerciali).
6. Apri l'URL della web app.

Se stai migrando dall'installazione precedente (solo Dashboard.html + Code.gs):
- Sostituisci tutti i file con quelli elencati sopra (Code.gs incluso: e' stato riscritto).
- Il tuo Google Sheet esistente resta valido: al primo avvio setupCrm() aggiungera' i tab e le
  colonne mancanti senza toccare i dati gia' presenti in "Lead Weekly" (le nuove colonne ID
  restano vuote sulle righe storiche: verranno valorizzate dai nuovi lead da qui in avanti).

Uso settimanale (vista Dashboard):
1. Apri la web app, tab "Dashboard".
2. Compila territorio, settore, focus, aziende da includere/escludere, salva.
3. Vai al tab "Lead Weekly": incolla i lead candidati della settimana (deduplica, blacklist e
   scoring sono automatici) oppure aggiungine uno singolo dal modulo dedicato.
4. Lavora i lead: cambia stato dal menu a tendina in tabella (sincronizza da solo lo storico
   contatti), invia email di primo contatto, apri una trattativa quando un'azienda si qualifica.
5. Segui le trattative aperte nel tab "Pipeline" (trascina le card tra le fasi).
6. Usa il tab "Aziende & Contatti" per cercare lo storico completo e pianificare follow-up.
7. La manutenzione settimanale (archiviazione + promemoria) parte da sola ogni lunedi alle 7;
   puo' anche essere lanciata a mano dal tab Dashboard ("Esegui manutenzione ora").

Nota sulle cartelle 04_Output_Lead_Weekly e 05_Blacklist_e_Storico_Contatti:
Quei due file Excel descrivono lo schema ORIGINALE pre-automazione e restano come riferimento
storico. Lo schema live del CRM (con le colonne ID Lead/ID Azienda/ID Persona/ID Trattativa che
collegano i record fra loro) e' definito in Data.gs ed e' quello che conta: non serve piu'
tenerli sincronizzati a mano con i file Excel.

Nota su Google Drive: gli allegati caricati dalla scheda Azienda (tab "Aziende & Contatti" /
drawer di dettaglio) vengono salvati in una cartella Drive dedicata ("Vero Volley - CRM Archivio
Documenti"), creata automaticamente al primo utilizzo. E' una cartella su Google Drive (cloud),
non la cartella locale 07_Archivio sul Mac: le due cose non si sincronizzano automaticamente.

============================================================
SPRINT 1 - FONDAMENTA INFRASTRUTTURALI (System.gs, Migration.gs)
============================================================

Cosa e': la prima tappa verso un CRM multi-utente (ruoli, permessi, ownership reale invece del
solo campo "Owner" testuale). Questo sprint prepara SOLO l'infrastruttura: non introduce alcun
comportamento visibile. Il CRM continua a funzionare esattamente come prima in ogni sua parte.

Cosa e' stato aggiunto:
- Un nuovo tab "Utenti" nello schema (Data.gs), vuoto finche' non si rilancia setupCrm() e comunque
  non collegato a nessun workflow: nessuno lo legge o scrive automaticamente.
- System.gs: ruoli (ROLES: Amministratore/Manager/Sales/Sola Lettura), matrice permessi
  (PERMISSIONS), identita' (getCurrentUser/getCurrentRole via Session.getActiveUser) e un motore
  di permessi (hasPermission/canView/canEdit/canDelete/canManage) che oggi permette sempre tutto
  (SYSTEM_CONFIG.enforcePermissions = false). Nessuna funzione esistente lo chiama ancora.
- Migration.gs: due funzioni da eseguire A MANO in futuro, mai automaticamente:
  bootstrapUsersFromOwnerFields_() censisce gli Owner testuali gia' in uso come utenti segnaposto;
  backfillOwnerIdOnSheet_(sheetKey) e' pronta per collegare i record esistenti a un utente reale,
  ma si ferma da sola finche' quel foglio non avra' una colonna "ID Utente Owner" (sprint futuro).

Cosa NON cambia oggi: dashboard, pipeline, lead weekly, aziende/contatti, scoring, deduplica,
trigger, deployment. Zero righe di codice di questi moduli sono state toccate in questo sprint.

Prossimo passo per attivare qualcosa: rilanciare setupCrm() per far comparire il tab "Utenti"
vuoto (facoltativo, nessun effetto se non lo si fa) - l'attivazione vera e propria dei ruoli e
dei permessi e' materia di uno sprint successivo, non di questo.

============================================================
RELEASE 0.2 - ACTIVITY ENGINE (Activity.gs)
============================================================

Cosa e': un log centralizzato di ogni interazione rilevante (chiamata, email, riunione, nota,
trattativa creata/aggiornata, lead importato, proposta inviata, documento caricato, ecc.), pensato
per diventare l'unica fonte di storico/timeline invece dei soli campi "Note" liberi sparsi sui
vari fogli. Anche questa release e' SOLO infrastruttura: nessun comportamento visibile cambia.

Cosa e' stato aggiunto:
- Un nuovo tab "Attivita" nello schema (Data.gs), vuoto finche' non si rilancia setupCrm() e
  comunque non collegato a nessun workflow: nessuno scrive automaticamente al suo interno.
- Activity.gs: tipi di attivita' (ACTIVITY_TYPES), stati (ACTIVITY_STATUSES), un unico punto di
  scrittura (logActivity_) e un unico punto di lettura a scopo timeline (getActivityTimeline_,
  filtrabile per azienda/persona/trattativa/utente/entita' generica). Pensato anche per l'uso
  futuro con l'IA: il campo "Metadata" e' JSON libero per dati strutturati (es. sentiment di una
  chiamata) senza dover aggiungere colonne ogni volta.
- Schema del tab: ID Attivita, Tipo, Tipo/ID Entita Riferimento (generico, oggi usato per
  Lead/Utente), ID Azienda/ID Persona/ID Trattativa (collegamenti diretti, una stessa attivita'
  puo' toccarne piu' di uno insieme), ID Utente (chi ha fatto l'attivita'), Titolo, Descrizione,
  Data Creazione, Creato Da (audit: puo' differire da ID Utente, es. un'automazione), Data
  Scadenza, Data Completamento, Stato, Tag, Metadata.

Cosa NON cambia oggi: dashboard, pipeline, lead weekly, aziende/contatti, scoring, deduplica,
trigger, deployment, e nessuna funzione degli sprint precedenti (System.gs/Migration.gs inclusi).
Nessun modulo esistente chiama ancora logActivity_(): crearlo non genera nessuna attivita' da solo.

Strategia di migrazione (non ancora implementata, solo prevista): lo storico gia' esistente nei
campi "Note" e nelle date "Data Primo/Ultimo Contatto"/"Data Apertura" di Persone Gia Contattate e
Trattative Aperte potra' essere retroattivamente convertito in righe "Attivita" con un helper in
Migration.gs (sulla falsariga di bootstrapUsersFromOwnerFields_), da eseguire a mano quando si
decide di procedere - non incluso in questa release per restare nello scope richiesto.

============================================================
RELEASE 0.2 - RAFFINAMENTO MODELLO ATTIVITA (Activity.gs, Data.gs)
============================================================

Cosa e': un affinamento del modello dati dell'Activity Engine sopra, non una nuova release ne'
una riscrittura. Nessuna colonna esistente e' stata rimossa o rinominata; 4 colonne sono state
aggiunte in coda al tab "Attivita":

- "Relazioni": relazione generica MULTIPLA e ripetibile (JSON di {tipo, id}), pensata per
  collegare un'attivita' a entita' future (Proposta, Contratto, Pranzo di Lavoro, Evento
  Hospitality, Documento, Campagna) senza mai dover aggiungere una nuova colonna FK: basta un
  nuovo valore di "tipo" dentro l'array. Il riferimento generico singolo gia' esistente
  ("Tipo/ID Entita Riferimento") resta invariato e continua a funzionare come prima: "Relazioni"
  e' un meccanismo complementare per quando serve collegare piu' di un'entita' aggiuntiva insieme.
  Helper: getActivityRelations_(), addActivityRelation_(activityId, tipo, id).
- "Origine" (ACTIVITY_SOURCES: Manuale/Email/Calendario/Import/Workflow/AI/Sistema): come e'
  stata creata l'attivita', utile per analytics future. Default in logActivity_(): 'Manuale'.
- "Esito" (ACTIVITY_OUTCOMES: Interessato/Nessuna Risposta/Riunione Programmata/Proposta
  Richiesta/Vinto/Perso/Follow-up Necessario): risultato di una singola interazione. Volutamente
  distinto da "Esito Contatto" (gia' usato altrove): quello descrive lo stato complessivo di una
  relazione nel tempo, questo il risultato di UN'attivita' puntuale. Nessuna logica di business
  lo calcola o lo impone: e' solo un campo disponibile, opzionale.
- "Visibilita" (ACTIVITY_VISIBILITY: Privata/Team/Management/Pubblica): segnaposto per quando in
  futuro il motore permessi di System.gs iniziera' a filtrare le attivita'. Nessuna logica di
  permessi la applica ancora - System.gs non e' stato toccato in questo raffinamento.

Struttura consigliata per "Metadata" (documentata in Activity.gs, non imposta da nessuna
validazione): summary, sentiment, participants, attachments, emailThreadId, calendarEventId,
nextSuggestedAction, aiGenerated - vedi ACTIVITY_METADATA_TEMPLATE in Activity.gs come riferimento
concreto per i futuri moduli AI Copilot/Notifications/Analytics.

Cosa NON e' cambiato: Dashboard, Pipeline, Lead Weekly, Aziende, Sponsor Research (Risposte
Lunedi), Triggers, System.gs (motore permessi/utenti), Migration.gs, deploy, UI. Nessuna funzione
esistente e' stata riscritta: logActivity_()/getActivityTimeline_() sono le stesse funzioni di
prima, solo con piu' campi opzionali. ensureSheet_() scrive solo le colonne mancanti su un tab
"Attivita" gia' esistente da una release precedente, senza toccare quelle gia' presenti.

============================================================
SPRINT 2 - OWNERSHIP ENGINE (Ownership.gs, Data.gs)
============================================================

Cosa e': un vero modello di proprieta' sui record di business (chi e' l'owner, chi altro
collabora, chi puo' vederlo, quando e' stato assegnato/riassegnato), al posto del solo campo
"Owner" testuale libero usato finora. E' la base per Dashboard Personale, Dashboard Manager,
Permessi, AI Assistant, Reporting, Notifiche, Workflow e Business Community - nessuno di questi e'
stato costruito in questo sprint. Anche questo sprint e' SOLO infrastruttura: nessuna UI cambia,
nessun comportamento visibile cambia, nessun record esistente viene toccato nei suoi dati.

Fogli estesi (colonne aggiunte in coda, mai in mezzo, mai rinominato nulla): Lead Weekly, Aziende
Target, Aziende Gia Contattate, Persone Gia Contattate, Trattative Aperte.

Colonne aggiunte a tutti e cinque:
- "ID Utente Owner": FK verso il tab "Utenti" (Sprint 1). E' la stessa colonna che
  backfillOwnerIdOnSheet_() in Migration.gs era gia' pronta ad aspettare da quando e' stata
  scritta: da questo sprint in poi, richiamarla su questi cinque fogli non si ferma piu' con
  "colonna non ancora pronta" (resta comunque una funzione da eseguire a mano, non e' stata
  invocata automaticamente).
- "Collaboratori": JSON di {id, ruolo}, ruolo tra COLLABORATOR_ROLE (Editor/Visualizzatore).
- "Visibilita": uno dei valori OWNER_VISIBILITY (Privata/Team/Management/Pubblica), validato in
  Data.gs contro la nuova colonna "Liste" > "Visibilita Ownership" (tenuta distinta da "Visibilita
  Attivita" perche' riguarda un record di business, non una voce di timeline).
- "Data Assegnazione": timestamp leggibile dell'ultima volta che "ID Utente Owner" e' stato
  scritto (prima assegnazione o riassegnazione).
- "Storico Assegnazioni": JSON, array di {previousOwner, timestamp, actor}, un elemento per ogni
  cambio owner. Aggiunta oltre l'elenco esplicito del task per dare a changeOwner_() un posto dove
  scrivere lo storico su tutti e cinque i fogli, non solo su Trattative Aperte (vedi nota in
  Ownership.gs).

Colonna aggiuntiva solo su Trattative Aperte: "Ultima Riassegnazione" (timestamp leggibile
dell'ultimo cambio owner, in stile con gli altri campi "Data ..." dello schema).

Ownership.gs (nuovo modulo): OWNER_VISIBILITY, COLLABORATOR_ROLE, OWNERSHIP_ENABLED_SHEETS
(i cinque fogli sopra), assignOwner_(), changeOwner_() (con storico), getOwner_(),
addCollaborator_(), removeCollaborator_(), getCollaborators_(), canUserAccessRecord_() (verifica
basata solo su owner/collaboratori/visibilita', NON sostituisce il motore permessi di System.gs),
piu' tre helper non ancora usati da nessuna parte (getOwnedRecords_(), getSharedRecords_(),
getVisibleRecords_()), pronti per una futura Dashboard Personale/Manager.

Cosa NON e' cambiato: Dashboard, Pipeline, Lead Weekly/Aziende/Overview UI, Sponsor Research,
System.gs (motore permessi non toccato ne' richiamato), Activity.gs, Scoring.gs, Dedup.gs,
Triggers.gs, Outreach.gs, deploy. Nessuna funzione esistente e' stata riscritta o richiamata da
Ownership.gs: crearlo non assegna nessun owner a nessun record esistente.

Strategia di migrazione (non ancora implementata, solo prevista): una volta eseguito
bootstrapUsersFromOwnerFields_() e backfillOwnerIdOnSheet_() (Migration.gs, Sprint 1 - oggi
finalmente "pronti" su questi cinque fogli), un futuro helper potra' chiamare assignOwner_() in
massa per popolare "Data Assegnazione" sui record backfillati, cosi' anche lo storico iniziale
risulta coerente. Non incluso in questo sprint per restare nello scope richiesto.
