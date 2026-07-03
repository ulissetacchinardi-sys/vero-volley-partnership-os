/**
 * System.gs
 * Sprint 1 - Fondamenta infrastrutturali.
 *
 * SCOPO
 * Modulo unico per tutto cio' che riguarda identita', ruoli e permessi: la base su cui gli
 * sprint futuri costruiranno il CRM multi-utente descritto nel documento di architettura.
 *
 * RESPONSABILITA'
 * - Definire i ruoli esistenti (ROLES) e cosa puo' fare ciascuno (PERMISSIONS), come dati, non
 *   come logica sparsa nei singoli moduli.
 * - Risolvere "chi sta usando il CRM adesso" a partire dall'identita' Google Workspace
 *   (getCurrentUser / getCurrentRole), leggendo dal foglio "Utenti" definito in Data.gs.
 * - Esporre un motore di permessi (hasPermission / canView / canEdit / canDelete / canManage)
 *   che oggi NON blocca nulla: e' gia' nella forma che avra' quando verra' attivato, cosi' gli
 *   sprint futuri dovranno solo cambiare SYSTEM_CONFIG.enforcePermissions, non riscrivere i
 *   punti di chiamata.
 *
 * STATO ATTUALE (Sprint 1): DISATTIVATO DI PROPOSITO.
 * - Nessuna funzione qui dentro e' chiamata da Code.gs, Dashboard.html o da nessun trigger.
 * - getCurrentUser()/getCurrentRole() non lanciano mai eccezioni e non bloccano mai nessuna
 *   azione: nel peggiore dei casi restituiscono null / un ruolo di default.
 * - hasPermission()/canView()/canEdit()/canDelete()/canManage() ritornano sempre true finche'
 *   SYSTEM_CONFIG.enforcePermissions e' false (valore attuale). Il comportamento del CRM oggi
 *   e' quindi identico a prima che questo file esistesse.
 *
 * USO FUTURO (Sprint successivi)
 * - Sprint 2+ potra' aggiungere "ID Utente Owner" ai fogli esistenti (vedi Migration.gs) e far
 *   si' che Code.gs chiami canView()/canEdit() prima di restituire/modificare un record.
 * - Quando si sara' pronti, attivare l'enforcement e' un cambio di UNA riga
 *   (SYSTEM_CONFIG.enforcePermissions = true), non una riscrittura.
 * - getCurrentUserEmail_() e' gia' pronta per Session.getActiveUser().getEmail(): quando verra'
 *   davvero invocata in produzione, andra' aggiunto lo scope OAuth
 *   "https://www.googleapis.com/auth/userinfo.email" a appsscript.json (oggi non necessario
 *   perche' questo modulo non e' ancora nel percorso di esecuzione reale).
 */

const ROLES = {
  ADMIN: 'Amministratore',
  MANAGER: 'Manager',
  SALES: 'Sales',
  READ_ONLY: 'Sola Lettura'
};

// Ordine crescente di privilegio: utile in futuro per confronti tipo "almeno Manager".
const ROLE_ORDER = [ROLES.READ_ONLY, ROLES.SALES, ROLES.MANAGER, ROLES.ADMIN];

/**
 * Matrice dei permessi. Non ancora applicata (vedi SYSTEM_CONFIG.enforcePermissions), ma gia'
 * definita per intero cosi' l'attivazione futura non richiede di inventare le regole sotto
 * pressione. Valori per ciascuna azione: 'all' | 'team' | 'own' | 'none'; 'manage' e' booleano.
 */
const PERMISSIONS = {
  [ROLES.ADMIN]: { view: 'all', edit: 'all', delete: 'all', manage: true },
  [ROLES.MANAGER]: { view: 'team', edit: 'team', delete: 'team', manage: false },
  [ROLES.SALES]: { view: 'own', edit: 'own', delete: 'none', manage: false },
  [ROLES.READ_ONLY]: { view: 'own', edit: 'none', delete: 'none', manage: false }
};

/** Configurazione centralizzata delle sole costanti introdotte da questo sprint (identita'/permessi). */
const SYSTEM_CONFIG = {
  // Interruttore generale: finche' e' false, hasPermission/canView/canEdit/canDelete/canManage
  // ritornano sempre l'esito piu' permissivo e nessun comportamento esistente cambia.
  enforcePermissions: false,
  // Finche' e' false, getCurrentUser()/getCurrentRole() sono puramente informative: nessun'altra
  // parte del CRM dipende dal loro risultato per funzionare.
  requireAuthentication: false,
  // Chiave del foglio Utenti nel registro SHEETS di Data.gs.
  usersSheetKey: 'utenti',
  // Ruolo assunto quando enforcePermissions=true ma l'utente corrente non e' (ancora) nel
  // foglio Utenti: intenzionalmente il piu' restrittivo, mai un default permissivo per errore.
  defaultRoleWhenUnresolved: ROLES.READ_ONLY
};

// --- Identita' (Task 5: Authentication Layer) ---

/** Email dell'utente Google Workspace corrente, o '' se non risolvibile. Non lancia mai eccezioni. */
function getCurrentUserEmail_() {
  try {
    return String(Session.getActiveUser().getEmail() || '').toLowerCase().trim();
  } catch (e) {
    return '';
  }
}

/** Cerca il record in "Utenti" corrispondente a un'email. Non lancia mai eccezioni. */
function findUserByEmail_(email) {
  const normalized = String(email || '').toLowerCase().trim();
  if (!normalized) return null;
  try {
    return getAllRecords_(SYSTEM_CONFIG.usersSheetKey).find(
      u => String(u['Email'] || '').toLowerCase().trim() === normalized
    ) || null;
  } catch (e) {
    // Il foglio Utenti potrebbe non esistere ancora se setupCrm() non e' stato rilanciato
    // dopo l'installazione di questo modulo: fallire in modo silenzioso, non bloccare nulla.
    return null;
  }
}

/**
 * Record utente corrente, se risolvibile. Finche' SYSTEM_CONFIG.requireAuthentication e' false
 * questa funzione e' puramente informativa e nessun'altra parte del CRM dipende dal risultato.
 */
function getCurrentUser() {
  const email = getCurrentUserEmail_();
  if (!email) return null;
  return findUserByEmail_(email);
}

/** Ruolo dell'utente corrente, o il default piu' restrittivo se non risolvibile. */
function getCurrentRole() {
  const user = getCurrentUser();
  if (user && user['Ruolo']) return user['Ruolo'];
  return SYSTEM_CONFIG.defaultRoleWhenUnresolved;
}

// --- Permission Engine (Task 4) ---

/**
 * Verifica generica di permesso su un'azione ('view'|'edit'|'delete'|'manage'), senza un record
 * specifico. Per controlli legati alla proprieta' di un singolo record usa canView/canEdit/
 * canDelete con l'ID Utente Owner di quel record.
 */
function hasPermission(action) {
  if (!SYSTEM_CONFIG.enforcePermissions) return true;
  const role = getCurrentRole();
  const rule = (PERMISSIONS[role] || {})[action];
  return rule === 'all' || rule === true;
}

function canView(ownerId) {
  if (!SYSTEM_CONFIG.enforcePermissions) return true;
  return evaluateScopedPermission_('view', ownerId);
}

function canEdit(ownerId) {
  if (!SYSTEM_CONFIG.enforcePermissions) return true;
  return evaluateScopedPermission_('edit', ownerId);
}

function canDelete(ownerId) {
  if (!SYSTEM_CONFIG.enforcePermissions) return true;
  return evaluateScopedPermission_('delete', ownerId);
}

/** Permessi amministrativi (gestione utenti, impostazioni globali, trigger): non legati a un record. */
function canManage() {
  if (!SYSTEM_CONFIG.enforcePermissions) return true;
  return !!(PERMISSIONS[getCurrentRole()] || {}).manage;
}

/**
 * Interpreta le regole 'all'/'team'/'own'/'none' della matrice PERMISSIONS contro un owner
 * specifico. La regola 'team' e' un segnaposto per lo Sprint 2+ (oggi equivale a 'own' perche'
 * i record esistenti non hanno ancora un concetto di team applicato).
 */
function evaluateScopedPermission_(action, ownerId) {
  const role = getCurrentRole();
  const rule = (PERMISSIONS[role] || {})[action];
  if (rule === 'all') return true;
  if (rule === 'none' || rule === undefined) return false;
  if (rule === 'own' || rule === 'team') {
    const user = getCurrentUser();
    return !!user && user['ID Utente'] === ownerId;
  }
  return false;
}
