/**
 * Scoring.gs
 * Calcolo automatico dello Sponsor Fit Score e della Priorita' associata, a regole esplicite
 * (nessun campo va piu' compilato a mano). Pesi e soglie sono costanti in cima al file cosi'
 * il team commerciale puo' chiederne la ritaratura senza dover capire il resto della logica.
 */

const SCORING_WEIGHTS = {
  territorio: 25,
  settore: 25,
  dimensioneMax: 20,
  fatturatoMax: 20,
  benchmark: 10
};

// Ordine dal piu' alto al piu' basso: il primo "min" superato dallo score vince.
const PRIORITY_THRESHOLDS = [
  { min: 80, label: 'A - Alta' },
  { min: 60, label: 'B - Media' },
  { min: 40, label: 'C - Bassa' },
  { min: 0, label: 'Escludere' }
];

const COMPANY_SIZE_SCORES = { '1-10': 5, '11-50': 10, '51-200': 15, '200+': 20 };

function computeSponsorFitScore_(lead) {
  let score = 0;
  const reasons = [];

  if (matchesAny_(lead.territorioRichiesto, [lead.sede, lead.provincia, lead.regione])) {
    score += SCORING_WEIGHTS.territorio;
    reasons.push('territorio in linea con la ricerca della settimana');
  }

  if (matchesAny_(lead.settoreRichiesto, [lead.settore])) {
    score += SCORING_WEIGHTS.settore;
    reasons.push('settore in linea con la ricerca della settimana');
  }

  const sizeScore = COMPANY_SIZE_SCORES[lead.dimensioneAzienda] || 0;
  score += sizeScore;
  if (sizeScore >= 15) reasons.push('azienda di dimensione rilevante');

  const revenueScore = scoreRevenue_(lead.fatturatoStimato);
  score += revenueScore;
  if (revenueScore >= 15) reasons.push('fatturato stimato elevato');

  if (String(lead.benchmarkRiferimento || '').trim()) {
    score += SCORING_WEIGHTS.benchmark;
    reasons.push('coerente con un benchmark sponsor noto');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const priorita = PRIORITY_THRESHOLDS.find(t => score >= t.min).label;
  const motivo = reasons.length ? reasons.join('; ') : 'nessun criterio di fit soddisfatto sui dati disponibili';

  return { score: score, priorita: priorita, motivo: motivo };
}

function matchesAny_(requestedCsv, candidateValues) {
  const requested = String(requestedCsv || '').split(',').map(v => normalizeCompanyName_(v)).filter(Boolean);
  if (!requested.length) return false;
  const candidates = candidateValues.map(v => normalizeCompanyName_(v)).filter(Boolean);
  return requested.some(r => candidates.some(c => c.indexOf(r) !== -1 || r.indexOf(c) !== -1));
}

function scoreRevenue_(fatturatoStimato) {
  const value = parseRevenue_(fatturatoStimato);
  if (value === null) return 0;
  const max = SCORING_WEIGHTS.fatturatoMax;
  if (value >= 50000000) return max;
  if (value >= 10000000) return Math.round(max * 0.75);
  if (value >= 2000000) return Math.round(max * 0.5);
  if (value >= 500000) return Math.round(max * 0.25);
  return 0;
}

/**
 * Interpreta formati come "5.000.000", "5,5 mln", "5M€". Se e' presente un indicatore di milioni,
 * il punto e' trattato come separatore migliaia SOLO quando seguito da esattamente 3 cifre
 * (altrimenti e' un decimale, es. "5.5 mln"); la virgola e' sempre trattata come decimale.
 * Resta un'euristica: il campo di origine e' testo libero compilato a mano.
 */
function parseRevenue_(text) {
  const raw = String(text || '').toLowerCase().trim();
  if (!raw) return null;
  const numberMatch = raw.match(/\d[\d.,]*/);
  if (!numberMatch) return null;

  const hasMillionSuffix = /mln|mil|m€|m\s*eur|\bm\b|\dm\b/.test(raw);
  if (hasMillionSuffix) {
    const numeric = parseFloat(
      numberMatch[0].replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
    );
    return isNaN(numeric) ? null : numeric * 1000000;
  }

  const value = Number(raw.replace(/[^\d]/g, ''));
  return isNaN(value) ? null : value;
}

/** Ricalcola score/priorita per tutti i lead attivi in "Lead Weekly" (utile dopo aver cambiato i pesi). */
function recalculateOpenLeadScores_() {
  const leads = getAllRecords_('leadWeekly');
  leads.forEach(lead => {
    const scoring = computeSponsorFitScore_({
      territorioRichiesto: lead['Territorio Richiesto'], settoreRichiesto: lead['Settore Richiesto'],
      sede: lead['Sede Azienda'], provincia: lead['Provincia'], regione: lead['Regione'],
      settore: lead['Settore'], dimensioneAzienda: lead['Dimensione Azienda'],
      fatturatoStimato: lead['Fatturato Stimato'], benchmarkRiferimento: lead['Benchmark di Riferimento']
    });
    updateRecordById_('leadWeekly', lead['ID Lead'], {
      'Sponsor Fit Score': scoring.score, 'Priorita': scoring.priorita, 'Motivo del Fit': scoring.motivo
    });
  });
  return leads.length;
}
