import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────────
// Fill these in from your Supabase project → Settings → API
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supa = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',system-ui,sans-serif;}
::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px;}
input[type=range]{accent-color:#4f8ef7;cursor:pointer;width:100%;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes pulse{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
.au{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both;}
.hover-lift{transition:transform .15s ease,box-shadow .15s ease;}
.hover-lift:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.18);}
.live-dot{animation:livePulse 2s ease-in-out infinite;}
@media print{
  .no-print{display:none !important;}
  .print-break{break-before:page;}
  body{background:white !important; margin:0 !important;}
  #report-root{padding-top:0 !important; max-width:100% !important;}
  *{box-shadow:none !important;}
}
/* ── Responsive utilities ── */
@media(max-width:639px){
  .au{padding:14px !important;}
  .rsp-hide{display:none !important;}
  .rsp-col{flex-direction:column !important;}
  .rsp-1col{grid-template-columns:1fr !important;}
  .rsp-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .rsp-full{width:100% !important;min-width:0 !important;}
  .rsp-text-sm{font-size:13px !important;}
  .rsp-stack{flex-direction:column !important;align-items:stretch !important;}
  table{font-size:12px !important;}
  th,td{padding:6px 8px !important;}
  .grid-2{grid-template-columns:1fr !important;}
  .likert-grid{grid-template-columns:1fr !important;}
  /* Prevent iOS zoom on inputs */
  input,textarea,select{font-size:16px !important;}
  /* Ensure tap targets */
  button{min-height:40px;}
}
@media(max-width:400px){
  .au{padding:10px !important;}
  h1{letter-spacing:-.5px !important;}
}
@media(min-width:640px){
  .rsp-show-mobile{display:none !important;}
}
/* All tables scrollable by default */
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;}
`;

// ─── DESIGN ──────────────────────────────────────────────────────────────────────
const R = { sm:8, md:12, lg:16, xl:20, pill:999 };
const mkUI = (dark) => dark ? {
  bg:"#07090e", bg2:"#0c0f17", surface:"rgba(255,255,255,0.04)", surfaceSolid:"#111520",
  surface2:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.13)",
  text:"#dde4f0", text2:"rgba(221,228,240,0.62)", text3:"rgba(221,228,240,0.36)",
  accent:"#4f8ef7", accentFg:"#fff", accent2:"#8b5cf6",
  grad:"linear-gradient(135deg,#4f8ef7,#8b5cf6)",
  gradSoft:"linear-gradient(135deg,rgba(79,142,247,0.14),rgba(139,92,246,0.08))",
  green:"#34d399", greenBg:"rgba(52,211,153,0.12)",
  red:"#f87171", redBg:"rgba(248,113,113,0.12)",
  orange:"#fb923c", teal:"#38bdf8", gold:"#fbbf24",
  fill:"rgba(255,255,255,0.04)", hover:"rgba(255,255,255,0.06)",
  sidebar:"#0a0d16", sidebarBorder:"rgba(255,255,255,0.055)",
  chart:["#4f8ef7","#8b5cf6","#34d399","#fb923c","#f87171","#38bdf8","#fbbf24","#a78bfa","#6ee7b7","#fca5a5"],
} : {
  bg:"#f5f7fc", bg2:"#eceff8", surface:"rgba(255,255,255,0.9)", surfaceSolid:"#ffffff",
  surface2:"#edf0f9", border:"rgba(0,0,0,0.07)", border2:"rgba(0,0,0,0.13)",
  text:"#0d1117", text2:"rgba(13,17,23,0.60)", text3:"rgba(13,17,23,0.36)",
  accent:"#1a6ef5", accentFg:"#fff", accent2:"#7c3aed",
  grad:"linear-gradient(135deg,#1a6ef5,#7c3aed)",
  gradSoft:"linear-gradient(135deg,rgba(26,110,245,0.09),rgba(124,58,237,0.06))",
  green:"#059669", greenBg:"rgba(5,150,105,0.09)",
  red:"#dc2626", redBg:"rgba(220,38,38,0.07)",
  orange:"#d97706", teal:"#0891b2", gold:"#b45309",
  fill:"rgba(0,0,0,0.035)", hover:"rgba(0,0,0,0.05)",
  sidebar:"#ffffff", sidebarBorder:"rgba(0,0,0,0.07)",
  chart:["#1a6ef5","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#b45309","#6d28d9","#047857","#b91c1c"],
};

// Experiment theme — ONLY colors differ, ALL layout identical
const ET = {
  dark:{ bg:"#0f0f0f", surface:"#1a1a1a", surface2:"#252525", border:"#2e2e2e",
    text:"#f0f0f0", textMuted:"#8a8a8a", textFaint:"#4a4a4a",
    accent:"#4d8ef0", accentFg:"#fff",
    success:"#34d399", successBg:"rgba(52,211,153,0.13)",
    error:"#f87171", errorBg:"rgba(248,113,113,0.11)",
    selected:"rgba(77,142,240,0.15)", selectedBdr:"#4d8ef0", rowAlt:"#141414" },
  light:{ bg:"#ffffff", surface:"#f3f4f6", surface2:"#e9eaed", border:"#d1d5db",
    text:"#111827", textMuted:"#6b7280", textFaint:"#9ca3af",
    accent:"#1d4ed8", accentFg:"#fff",
    success:"#059669", successBg:"rgba(5,150,105,0.09)",
    error:"#dc2626", errorBg:"rgba(220,38,38,0.07)",
    selected:"rgba(29,78,216,0.09)", selectedBdr:"#1d4ed8", rowAlt:"#f9fafb" },
};

// Layout constants — NEVER change with theme
const L = {
  font:"'DM Sans',system-ui,sans-serif", mono:"'DM Mono',monospace",
  fsXs:11, fsSm:13, fsBase:15, fsMd:17, fsLg:20, fsXl:26, fs2Xl:36,
  fwNorm:400, fwMed:500, fwSemi:600, fwBold:700, fwBlack:800,
  spXs:4, spSm:8, spMd:16, spLg:24, spXl:40, sp2Xl:64,
  btnH:44, maxW:900, taskW:780,
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────────
const K = { u:"hci_v5_users", c:"hci_v5_cur" };
const db = {
  all: () => { try { return JSON.parse(localStorage.getItem(K.u) || "[]"); } catch { return []; } },
  get: (id) => db.all().find(u => u.id === id) || null,
  cur: () => { try { return localStorage.getItem(K.c) || null; } catch { return null; } },
  setCur: (id) => { try { if (id) localStorage.setItem(K.c, id); else localStorage.removeItem(K.c); } catch {} },

  // save — writes locally AND syncs to Supabase
  save: (u) => {
    const a = db.all();
    const i = a.findIndex(x => x.id === u.id);
    if (i >= 0) a[i] = u; else a.push(u);
    try { localStorage.setItem(K.u, JSON.stringify(a)); } catch {}
    if (supa) supa.from("participants").upsert({ id: u.id, data: u, updated_at: new Date().toISOString() }).then(() => {}).catch(() => {});
  },

  // syncFromCloud — pulls all Supabase rows into localStorage (called on admin login)
  syncFromCloud: async () => {
    if (!supa) return 0;
    try {
      const { data, error } = await supa.from("participants").select("data");
      if (error || !data?.length) return 0;
      const cloud = data.map(r => r.data);
      const local = db.all();
      // Cloud wins for matching IDs (most up-to-date)
      const merged = [...local.filter(l => !cloud.find(c => c.id === l.id)), ...cloud];
      localStorage.setItem(K.u, JSON.stringify(merged));
      return cloud.length;
    } catch { return 0; }
  },

  // allFromCloud — fetch directly from Supabase (for admin panel)
  allFromCloud: async () => {
    if (!supa) return db.all();
    try {
      const { data, error } = await supa.from("participants").select("data").order("updated_at", { ascending: false });
      if (error || !data) return db.all();
      return data.map(r => r.data);
    } catch { return db.all(); }
  },
};

function hashPw(s) { let v = 5381; for (let i = 0; i < s.length; i++) v = ((v << 5) + v) ^ s.charCodeAt(i); return (v >>> 0).toString(16); }
const uid = () => "U" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
const shuf = a => [...a].sort(() => Math.random() - 0.5);
const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtPct = v => v != null ? `${(v * 100).toFixed(1)}%` : "—";
const fmtMs  = v => v != null ? `${Math.round(v)}ms` : "—";
const fmt    = (v, d = 1) => v != null && !isNaN(v) ? Number(v).toFixed(d) : "—";
// APA 7 p-value format — no leading zero, threshold at .001
const fmtPVal = p => p == null ? "—" : p < .001 ? "< .001" : `.${String(Math.round(p * 1000)).padStart(3, "0")}`;

// ─── STATISTICAL ENGINE ───────────────────────────────────────────────────────────
// Lanczos log-gamma approximation
function logGamma(z) {
  const C = [0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = C[0];
  for (let i = 1; i < 9; i++) x += C[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Lentz continued fraction for regularised incomplete beta
function betaCF(a, b, x) {
  const MAXIT = 200, EPS = 3e-7, FPMIN = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = Math.max(1 - qab * x / qap, FPMIN), h = d = 1 / d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = Math.max(1 + aa * d, FPMIN); c = Math.max(1 + aa / c, FPMIN); d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = Math.max(1 + aa * d, FPMIN); c = Math.max(1 + aa / c, FPMIN); d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function iBeta(a, b, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b));
  return x < (a + 1) / (a + b + 2) ? front * betaCF(a, b, x) / a : 1 - front * betaCF(b, a, 1 - x) / b;
}
// Two-tailed p-value from t-statistic
function tTailP(t, df) {
  if (!isFinite(t) || df <= 0) return null;
  return Math.min(1, iBeta(df / 2, 0.5, df / (df + t * t)));
}

// Inverse t-distribution — binary search on tTailP
function invT(alpha, df) {
  if (alpha <= 0) return Infinity;
  let lo = 0, hi = 50;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (Math.abs(tTailP(mid, df) - alpha) < 1e-9) return mid;
    tTailP(mid, df) > alpha ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

// Jarque-Bera normality test (self-contained, no stat dependency)
function jarqueBera(arr) {
  const n = arr.length;
  if (n < 8) return { tested: false, normal: null, note: "n < 8 — not testable" };
  const m = arr.reduce((a, v) => a + v, 0) / n;
  const s2 = arr.reduce((a, x) => a + (x - m) ** 2, 0) / n;
  const s = Math.sqrt(s2);
  if (!s) return { tested: false, normal: null, note: "Zero variance" };
  const skew = arr.reduce((a, x) => a + ((x - m) / s) ** 3, 0) / n;
  const kurt = arr.reduce((a, x) => a + ((x - m) / s) ** 4, 0) / n;
  const jb = (n / 6) * (skew ** 2 + (kurt - 3) ** 2 / 4);
  const p = Math.exp(-jb / 2); // exact for chi²(df=2)
  return { tested: true, jb: +jb.toFixed(3), p: +p.toFixed(4), normal: p > 0.05, skew: +skew.toFixed(3) };
}

// Cohen's d for paired samples = mean_diff / sd_diff
function cohensD(diffs) {
  const n = diffs.length, m = diffs.reduce((a, v) => a + v, 0) / n;
  const s = Math.sqrt(diffs.reduce((a, v) => a + (v - m) ** 2, 0) / (n - 1));
  return s ? +(m / s).toFixed(3) : null;
}
function cohenLabel(d) {
  if (d == null) return "—";
  const a = Math.abs(d);
  if (a < 0.2) return "Negligible";
  if (a < 0.5) return "Small";
  if (a < 0.8) return "Medium";
  return "Large";
}

// Quartiles for box plots
function quartiles(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b), n = s.length;
  const q1 = s[Math.floor(n * 0.25)];
  const q2 = n % 2 ? s[Math.floor(n / 2)] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const q3 = s[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const wLow = Math.max(s[0], q1 - 1.5 * iqr), wHigh = Math.min(s[n - 1], q3 + 1.5 * iqr);
  return { q1, q2, q3, iqr, wLow, wHigh, outliers: s.filter(v => v < wLow || v > wHigh), mean: arr.reduce((a, b) => a + b, 0) / n, n };
}

// Core statistics object
const stat = {
  mean: a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null,
  median: a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; },
  sd: a => { if (a.length < 2) return null; const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); },
  describe: a => {
    const c = a.filter(v => v != null && !isNaN(v));
    if (!c.length) return { n: 0, mean: null, median: null, sd: null, min: null, max: null };
    return { n: c.length, mean: stat.mean(c), median: stat.median(c), sd: stat.sd(c), min: Math.min(...c), max: Math.max(...c) };
  },
  pearson: (xs, ys) => {
    const n = Math.min(xs.length, ys.length);
    if (n < 3) return null;
    const mx = stat.mean(xs.slice(0, n)), my = stat.mean(ys.slice(0, n));
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; num += dx * dy; dx2 += dx * dx; dy2 += dy * dy; }
    return (dx2 && dy2) ? num / Math.sqrt(dx2 * dy2) : null;
  },
  // Enhanced pairedT — now returns Cohen's d, 95% CI, normality check
  pairedT: (a, b) => {
    const n = Math.min(a.length, b.length);
    if (n < 2) return null;
    const diffs = a.slice(0, n).map((v, i) => v - b[i]);
    const m = diffs.reduce((s, v) => s + v, 0) / n;
    const s = Math.sqrt(diffs.reduce((s, v) => s + (v - m) ** 2, 0) / (n - 1));
    if (!s) return null;
    const se = s / Math.sqrt(n), t = m / se, df = n - 1;
    const p = tTailP(t, df);
    const tCrit = invT(0.05, df);       // t* for 95% CI
    const d = m / s;                    // Cohen's d (paired)
    return {
      t: +t.toFixed(3), p: p ? +p.toFixed(4) : null, df, n,
      meanDiff: m, sd: s, se,
      ci95: { lower: +(m - tCrit * se).toFixed(4), upper: +(m + tCrit * se).toFixed(4) },
      cohensD: +d.toFixed(3),
      cohenLabel: cohenLabel(d),
      normality: jarqueBera(diffs),
      sig: p != null && p < 0.05,
    };
  },
};

// Sample size validation
function sampleSizeLabel(n) {
  if (n < 5)  return { l: "Critical",   c: "red",    note: "Do not interpret findings. Collect substantially more data.",                preliminary: true  };
  if (n < 10) return { l: "Very Small", c: "orange", note: "Highly preliminary — treat all findings with extreme caution.",             preliminary: true  };
  if (n < 20) return { l: "Small",      c: "gold",   note: "Preliminary findings — prioritise effect size (d) and CI width over p.",   preliminary: true  };
  if (n < 30) return { l: "Adequate",   c: "teal",   note: "Adequate for exploratory analysis. Replication recommended.",              preliminary: false };
  return               { l: "Sufficient", c: "green", note: "Sufficient for reliable statistical inference.",                          preliminary: false };
}

// Counterbalance validation
function checkCounterbalance(users) {
  const comp = users.filter(u => (u.experiments || []).length >= 2);
  const dl = comp.filter(u => u.orderGroup === "DL").length;
  const ld = comp.filter(u => u.orderGroup === "LD").length;
  const tot = dl + ld;
  const balanced = tot >= 4 && Math.abs(dl - ld) <= Math.max(1, Math.floor(tot * 0.25));
  return { dl, ld, tot, balanced, ratio: `${dl}:${ld}` };
}

// Derived composite research metrics
function computeDerivedMetrics(pairs) {
  const calc = (d) => {
    if (!d) return null;
    const cli = [d.nasa && d.nasa / 20, d.fa && d.fa / 7, d.es && d.es / 7].filter(Boolean);
    const vcs = [d.vc && d.vc / 7, d.es && (8 - d.es) / 7, d.sa && d.sa / 7].filter(Boolean);
    const tt_n = d.tt && Math.min(1, d.tt / 15000);
    const rt_n = d.rt != null ? 1 - Math.min(1, d.rt / 3000) : null;
    return {
      CognitiveLoadIndex:     cli.length   ? +(cli.reduce((a, b) => a + b, 0) / cli.length).toFixed(3) : null,
      VisualComfortScore:     vcs.length   ? +(vcs.reduce((a, b) => a + b, 0) / vcs.length).toFixed(3) : null,
      EfficiencyScore:        tt_n && d.acc != null ? +((d.acc || 0) / Math.max(tt_n, 0.05)).toFixed(3) : null,
      SpeedAccuracyTradeoff:  rt_n != null && d.acc != null ? +(((d.acc || 0) + rt_n) / 2).toFixed(3) : null,
    };
  };
  const rows = pairs.map(p => ({ pid: p.pid, dk: calc(p.dark), lt: calc(p.light) })).filter(r => r.dk && r.lt);
  const DM = ["CognitiveLoadIndex","VisualComfortScore","EfficiencyScore","SpeedAccuracyTradeoff"];
  return DM.map(k => {
    const a = rows.map(r => r.dk[k]).filter(v => v != null);
    const b = rows.map(r => r.lt[k]).filter(v => v != null);
    return { key: k, label: k.replace(/([A-Z])/g, ' $1').trim(), dark: stat.describe(a), light: stat.describe(b), test: stat.pairedT(a, b) };
  });
}

function corrStrength(r) {
  if (r == null) return "–";
  const a = Math.abs(r), dir = r > 0 ? "positive" : "negative";
  if (a < 0.10) return "Negligible";
  if (a < 0.30) return `Weak ${dir}`;
  if (a < 0.50) return `Moderate ${dir}`;
  if (a < 0.70) return `Strong ${dir}`;
  return `Very strong ${dir}`;
}

// ─── CRONBACH'S ALPHA (Internal Consistency) ──────────────────────────────────────
function cronbachAlpha(matrix) {
  // matrix: rows = participants, cols = scale items (all same direction)
  const n = matrix.length, k = matrix[0]?.length;
  if (!n || !k || n < 2 || k < 2) return null;
  const means = Array.from({ length: k }, (_, j) => matrix.reduce((s, r) => s + r[j], 0) / n);
  const itemVars = Array.from({ length: k }, (_, j) => {
    const m = means[j];
    return matrix.reduce((s, r) => s + (r[j] - m) ** 2, 0) / (n - 1);
  });
  const totals = matrix.map(r => r.reduce((a, b) => a + b, 0));
  const totalMean = totals.reduce((a, b) => a + b, 0) / n;
  const totalVar = totals.reduce((s, t) => s + (t - totalMean) ** 2, 0) / (n - 1);
  if (!totalVar) return null;
  return +((k / (k - 1)) * (1 - itemVars.reduce((a, b) => a + b, 0) / totalVar)).toFixed(3);
}

function alphaInterp(a) {
  if (a == null) return { label: "–", col: "text3", note: "Insufficient data for reliability estimation." };
  if (a >= 0.90) return { label: `Excellent (α = ${a})`, col: "green", note: "The scale demonstrated excellent internal consistency (α ≥ 0.90)." };
  if (a >= 0.80) return { label: `Good (α = ${a})`, col: "green", note: "The scale demonstrated good internal consistency (α ≥ 0.80)." };
  if (a >= 0.70) return { label: `Acceptable (α = ${a})`, col: "teal", note: "The scale demonstrated acceptable internal consistency (α ≥ 0.70), supporting its use in this study." };
  if (a >= 0.60) return { label: `Questionable (α = ${a})`, col: "gold", note: "The scale demonstrated questionable internal consistency (α ≥ 0.60). Findings should be interpreted with caution." };
  if (a >= 0.50) return { label: `Poor (α = ${a})`, col: "orange", note: "The scale demonstrated poor internal consistency (α ≥ 0.50). Results may lack reliability." };
  return { label: `Unacceptable (α = ${a})`, col: "red", note: "The scale failed to demonstrate acceptable internal consistency (α < 0.50)." };
}

// ─── DEMOGRAPHIC SUMMARY ──────────────────────────────────────────────────────────
function computeDemoSummary(users) {
  const valid = users.filter(u => u.dem && (u.experiments || []).length >= 2);
  if (!valid.length) return null;
  const ages = valid.map(u => parseFloat(u.dem.age)).filter(v => !isNaN(v) && v > 0);
  const freq = key => {
    const counts = {};
    valid.forEach(u => { const v = u.dem[key] || "Not specified"; counts[v] = (counts[v] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([l, n]) => ({ l, n, pct: +(n / valid.length * 100).toFixed(1) }));
  };
  return {
    n: valid.length,
    age: ages.length ? { mean: +stat.mean(ages).toFixed(1), sd: +(stat.sd(ages)||0).toFixed(1), min: Math.min(...ages), max: Math.max(...ages), median: +stat.median(ages).toFixed(0) } : null,
    gender: freq("gender"),
    proficiency: freq("proficiency"),
    darkMode: freq("darkMode"),
    screenTime: freq("screenTime"),
    edu: freq("edu"),
  };
}

// ─── DATA CLEANING ────────────────────────────────────────────────────────────────
function cleanData(users) {
  const issues = [], valid = [];
  const ORD = { "Never":1,"Rarely (few times a month)":2,"Sometimes (few times a week)":3,"Often (daily)":4,"Always":5 };
  const SCR = { "Less than 2 hours":1,"2–4 hours":2,"4–6 hours":3,"6–8 hours":4,"More than 8 hours":5 };
  const PRF = { "Beginner":1,"Intermediate":2,"Advanced":3,"Expert":4 };

  for (const u of users) {
    const exps = u.experiments || [];
    const flag = (msg) => issues.push({ id:u.id, name:u.name, type:"warning", msg });

    // Completeness check
    if (exps.length < 2) { issues.push({ id:u.id, name:u.name, type:"excluded", msg:`Only ${exps.length} phase(s) recorded` }); continue; }
    const themes = new Set(exps.map(e => e.theme));
    if (!themes.has("dark") || !themes.has("light")) { issues.push({ id:u.id, name:u.name, type:"excluded", msg:"Missing a theme condition" }); continue; }

    // Missing fields
    if (!u.dem?.age || !u.dem?.gender) flag("Missing demographics");
    if (!u.orderGroup) flag("Missing counterbalance group");

    // Outlier RT check — flag if mean RT > 10 s (likely inattention)
    const allTrials = exps.flatMap(e => (e.tasks||[]).flatMap(t=>t.trials||[]));
    const rts = allTrials.map(t=>t.rt).filter(v=>v&&v>50&&v<30000);
    const meanRT = stat.mean(rts);
    if (meanRT && meanRT > 10000) flag(`Possible inattention — mean RT ${Math.round(meanRT)}ms`);

    // Duplicate check (same participant ID appearing more than once)
    if (users.filter(x => x.id === u.id).length > 1) flag("Duplicate participant ID");

    valid.push({ ...u, _enc: { darkMode: ORD[u.dem?.darkMode]||null, screenTime: SCR[u.dem?.screenTime]||null, proficiency: PRF[u.dem?.proficiency]||null, age: parseFloat(u.dem?.age)||null } });
  }
  return { valid, issues };
}

// ─── FULL ANALYSIS ENGINE ─────────────────────────────────────────────────────────
function computeAnalysis(users) {
  const { valid, issues } = cleanData(users);
  if (valid.length < 2) return { insufficient: true, n: valid.length, issues };

  // Per-participant paired data {pid, dark: {...metrics}, light: {...metrics}}
  const pairs = valid.map(u => {
    const row = { pid: u.id, name: u.name, enc: u._enc };
    for (const theme of ["dark","light"]) {
      const sess = (u.experiments||[]).filter(e => e.theme === theme);
      const trials = sess.flatMap(s => (s.tasks||[]).flatMap(t => t.trials||[]));
      const tlx = sess.find(s=>s.nasaTLX)?.nasaTLX || {};
      const comfort = sess.find(s=>s.comfort)?.comfort || {};
      row[theme] = {
        acc: stat.mean(trials.map(t=>t.acc??0)),
        tt: stat.mean(trials.map(t=>t.tt??0)),
        rt: stat.mean(trials.filter(t=>t.rt).map(t=>t.rt)),
        err: stat.mean(trials.map(t=>t.err??0)),
        clicks: stat.mean(trials.map(t=>t.cl??0)),
        path: stat.mean(trials.map(t=>t.path??0)),
        idle: stat.mean(trials.map(t=>t.idle??0)),
        nasa: tlx.totalScore||null,
        nasaMD: tlx.md||null, nasaPD: tlx.pd||null, nasaTD: tlx.td||null,
        nasaPE: tlx.pe||null, nasaEF: tlx.ef||null, nasFR: tlx.fr||null,
        vc: comfort.visualComfort||null,
        es: comfort.eyeStrain||null,
        fa: comfort.fatigue||null,
        sa: comfort.satisfaction||null,
      };
    }
    return row;
  }).filter(r => r.dark && r.light);

  const dk = k => pairs.map(p=>p.dark[k]).filter(v=>v!=null);
  const lt = k => pairs.map(p=>p.light[k]).filter(v=>v!=null);

  // Descriptive stats per metric per theme
  const METRICS = [
    { k:"acc",    l:"Accuracy (0–1)",          fmt: v=>v.toFixed(3) },
    { k:"tt",     l:"Completion Time (ms)",     fmt: v=>Math.round(v) },
    { k:"rt",     l:"Response Time (ms)",       fmt: v=>Math.round(v) },
    { k:"err",    l:"Error Count",              fmt: v=>v.toFixed(2) },
    { k:"clicks", l:"Click Count",             fmt: v=>v.toFixed(1) },
    { k:"path",   l:"Mouse Path (px)",         fmt: v=>Math.round(v) },
    { k:"idle",   l:"Idle Time (ms)",           fmt: v=>Math.round(v) },
    { k:"nasa",   l:"NASA-TLX Total Score",    fmt: v=>v.toFixed(2) },
    { k:"nasFR",  l:"NASA Frustration",        fmt: v=>v.toFixed(2) },
    { k:"nasaMD", l:"NASA Mental Demand",      fmt: v=>v.toFixed(2) },
    { k:"vc",     l:"Visual Comfort (1–7)",    fmt: v=>v.toFixed(2) },
    { k:"es",     l:"Eye Strain (1–7)",        fmt: v=>v.toFixed(2) },
    { k:"fa",     l:"Fatigue (1–7)",           fmt: v=>v.toFixed(2) },
    { k:"sa",     l:"Satisfaction (1–7)",      fmt: v=>v.toFixed(2) },
  ];

  const desc = Object.fromEntries(METRICS.map(m => [m.k, { dark: stat.describe(dk(m.k)), light: stat.describe(lt(m.k)) }]));

  // Paired t-tests for key metrics
  const TEST_KEYS = ["acc","tt","rt","err","nasa","nasFR","nasaMD","vc","es","fa","sa"];
  const tests = Object.fromEntries(TEST_KEYS.map(k => {
    const a = pairs.map(p=>p.dark[k]).filter(v=>v!=null);
    const b = pairs.map(p=>p.light[k]).filter(v=>v!=null);
    const paired = pairs.map(p=>[p.dark[k],p.light[k]]).filter(([a,b])=>a!=null&&b!=null);
    return [k, stat.pairedT(paired.map(p=>p[0]), paired.map(p=>p[1]))];
  }));

  // Per-task accuracy breakdown
  const taskBreak = CFG.tasks.map(tid => ({
    tid, label: CFG.TL[tid],
    dark: stat.describe(pairs.flatMap(p => (p.dark.trials||[]).filter(t=>t.taskType===tid).map(t=>t.acc??0))),
    light: stat.describe(pairs.flatMap(p => (p.light.trials||[]).filter(t=>t.taskType===tid).map(t=>t.acc??0))),
  }));

  // Correlation analysis — encode ordinal vars
  const pick = (arr) => arr.filter(([a,b])=>a!=null&&b!=null);
  const corr = (xs, ys) => { const p = pick(xs.map((x,i)=>[x,ys[i]])); return p.length>=3 ? stat.pearson(p.map(v=>v[0]),p.map(v=>v[1])) : null; };
  const overallMetric = (k) => pairs.map(p=>stat.mean([p.dark[k], p.light[k]].filter(v=>v!=null)));
  const correlations = [
    { label:"Dark Mode Habit ↔ NASA Workload", desc:"Habitual dark mode users vs overall cognitive load",     r: corr(pairs.map(p=>p.enc.darkMode), overallMetric("nasa")) },
    { label:"Screen Time ↔ Error Count",       desc:"Daily screen time vs average errors per trial",          r: corr(pairs.map(p=>p.enc.screenTime), overallMetric("err")) },
    { label:"Age ↔ Completion Time",           desc:"Participant age vs average task completion time",        r: corr(pairs.map(p=>p.enc.age), overallMetric("tt")) },
    { label:"Proficiency ↔ Accuracy",          desc:"Computer proficiency level vs overall accuracy",         r: corr(pairs.map(p=>p.enc.proficiency), overallMetric("acc")) },
  ];

  // Distribution data for histograms / box plots
  const allAcc = { dark: dk("acc"), light: lt("acc") };
  const allTT  = { dark: dk("tt"),  light: lt("tt")  };

  // Counterbalance validation
  const counterbalance = checkCounterbalance(users);

  // Sample size classification
  const szLabel = sampleSizeLabel(valid.length);

  // Derived composite metrics
  const derivedMetrics = computeDerivedMetrics(pairs);

  // Demographic summary
  const demoSummary = computeDemoSummary(users);

  // Reliability analysis — Cronbach's Alpha
  // NASA-TLX: all 6 items (same direction: higher = more workload)
  const nasaMatrix = valid.map(u => {
    const tlx = (u.experiments||[]).find(e=>e.nasaTLX)?.nasaTLX;
    return tlx && [tlx.md,tlx.pd,tlx.td,tlx.pe,tlx.ef,tlx.fr].every(v=>v!=null) ? [tlx.md,tlx.pd,tlx.td,tlx.pe,tlx.ef,tlx.fr] : null;
  }).filter(Boolean);
  // Comfort scale: reverse eye strain & fatigue so all items point "higher = better comfort"
  const comfortMatrix = valid.map(u => {
    const c = (u.experiments||[]).find(e=>e.comfort)?.comfort;
    return c && c.visualComfort && c.eyeStrain && c.fatigue && c.satisfaction
      ? [c.visualComfort, 8-c.eyeStrain, 8-c.fatigue, c.satisfaction]
      : null;
  }).filter(Boolean);
  const reliability = {
    nasa:    { alpha: cronbachAlpha(nasaMatrix),    items: 6, label: "NASA-TLX (md, pd, td, pe, ef, fr)",   n: nasaMatrix.length    },
    comfort: { alpha: cronbachAlpha(comfortMatrix), items: 4, label: "Comfort Scale (vc, es†, fa†, sat)",    n: comfortMatrix.length },
  };

  return { n: valid.length, issues, pairs, desc, tests, taskBreak, correlations, allAcc, allTT, METRICS, counterbalance, szLabel, derivedMetrics, demoSummary, reliability, insufficient: false };
}

// ─── ANALYTICS PIPELINE ──────────────────────────────────────────────────────────
// Produces one fully-normalized flat record per trial.
// All field names match the specification exactly — directly importable into
// SPSS, Excel, Python (pandas), R, and other statistical software.
function computeAnalyticsRecord(trial, task, session, user) {
  const tlx   = session.nasaTLX || {};
  const nasaValues = [tlx.md, tlx.pd, tlx.td, tlx.pe, tlx.ef, tlx.fr].filter(v => v != null && v > 0);
  const nasaTotal  = nasaValues.length === 6
    ? parseFloat((nasaValues.reduce((s, v) => s + v, 0) / 6).toFixed(2))
    : "";
  const accuracy   = trial.acc != null ? parseFloat(trial.acc.toFixed(4)) : "";
  // TaskSuccessRate: binary (1 = trial accuracy ≥ 0.70, 0 = below threshold)
  const taskSuccessRate = trial.acc != null ? (trial.acc >= 0.70 ? 1 : 0) : "";

  return {
    // ── Participant ──────────────────────────────────────────────────────
    ParticipantID:        user.id,
    Name:                 user.name,
    Age:                  user.dem?.age          || "",
    Gender:               user.dem?.gender       || "",
    EducationLevel:       user.dem?.edu          || "",
    VisionCondition:      user.dem?.vision       || "",
    DarkModeUsage:        user.dem?.darkMode     || "",
    DailyScreenTime:      user.dem?.screenTime   || "",
    ComputerProficiency:  user.dem?.proficiency  || "",

    // ── Experimental Variables ───────────────────────────────────────────
    ExperimentalGroup:    user.orderGroup        || "",   // DL or LD
    ThemeOrder:           session.phase          || "",   // 1 or 2
    ThemeCondition:       session.theme          || "",   // dark or light
    TaskType:             task.type              || "",
    TaskOrder:            (task.idx ?? task.taskOrder ?? 0) + 1, // 1-based position in sequence
    TrialIndex:           (trial.i ?? 0) + 1,             // 1-based
    Timestamp:            session.ts             || "",

    // ── Performance Metrics ──────────────────────────────────────────────
    TaskCompletionTime_ms: trial.tt              || "",
    ResponseTime_ms:       trial.rt              || "",
    Accuracy:              accuracy,
    TaskSuccessRate:       taskSuccessRate,
    ErrorCount:            trial.err             ?? 0,
    MisclickCount:         trial.mc              ?? 0,

    // ── Interaction Behavior Metrics ─────────────────────────────────────
    ClickCount:            trial.cl              ?? 0,
    MousePathLength_px:    trial.path            ?? 0,
    HoverDuration_ms:      trial.hover           || "",   // pre-response inspection time
    IdleTime_ms:           trial.idle            ?? 0,
    ScrollDepth_px:        trial.scroll          ?? 0,
    NavigationSteps:       trial.navSteps ?? trial.cl ?? 0,

    // ── Subjective Experience (per-phase comfort & fatigue) ──────────────
    VisualComfort:         session.comfort?.visualComfort  || "",  // 1-7
    EyeStrain:             session.comfort?.eyeStrain      || "",  // 1-7 (7=severe)
    MentalFatigue:         session.comfort?.fatigue        || "",  // 1-7
    InterfaceSatisfaction: session.comfort?.satisfaction   || "",  // 1-7

    // ── Cognitive Load — NASA-TLX ────────────────────────────────────────
    MentalDemand:          tlx.md               || "",
    PhysicalDemand:        tlx.pd               || "",
    TemporalDemand:        tlx.td               || "",
    PerformanceScore:      tlx.pe               || "",
    EffortLevel:           tlx.ef               || "",
    FrustrationLevel:      tlx.fr               || "",
    NASA_TotalScore:       nasaTotal,                     // mean of all 6 dimensions

    // ── Study Outcome ────────────────────────────────────────────────────
    ThemePreference:       user.pref            || "",
    CompletedAt:           user.completedAt     || "",
  };
}

function buildCSV(users) {
  // Column order follows the analytics specification exactly
  const COLS = [
    "ParticipantID","Name",
    "Age","Gender","EducationLevel","VisionCondition","DarkModeUsage","DailyScreenTime","ComputerProficiency",
    "ExperimentalGroup","ThemeOrder","ThemeCondition","TaskType","TaskOrder","TrialIndex","Timestamp",
    "TaskCompletionTime_ms","ResponseTime_ms","Accuracy","TaskSuccessRate","ErrorCount","MisclickCount",
    "ClickCount","MousePathLength_px","HoverDuration_ms","IdleTime_ms","ScrollDepth_px","NavigationSteps",
    "VisualComfort","EyeStrain","MentalFatigue","InterfaceSatisfaction",
    "MentalDemand","PhysicalDemand","TemporalDemand","PerformanceScore","EffortLevel","FrustrationLevel","NASA_TotalScore",
    "ThemePreference","CompletedAt",
  ];
  const rows = [COLS.join(",")];
  for (const usr of users) {
    for (const session of (usr.experiments || [])) {
      for (const task of (session.tasks || [])) {
        for (const trial of (task.trials || [])) {
          const rec = computeAnalyticsRecord(trial, task, session, usr);
          rows.push(COLS.map(col => `"${String(rec[col] ?? "").replace(/"/g, '""')}"`).join(","));
        }
      }
    }
  }
  return rows.join("\n");
}

function dlCSV(content, filename) {
  // Method 1 — Blob URL (standard, works in most browsers)
  try {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" }); // BOM → Excel UTF-8
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename, style: "display:none" });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    return true;
  } catch (_) {}
  // Method 2 — data URI (fallback for restrictive sandboxes)
  try {
    const uri = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(content);
    const a = Object.assign(document.createElement("a"), { href: uri, download: filename, style: "display:none" });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (_) {}
  return false; // caller should show the copy modal instead
}

// ─── TEST DATA GENERATOR ──────────────────────────────────────────────────────────
function generateTestData() {
  const FIRST = ["James","Maria","Ahmed","Sarah","David","Fatima","John","Priya","Michael","Aisha","Daniel","Sofia","Omar","Emily","Carlos","Zara","Alex","Mei","Samuel","Amara","Oliver","Nina","Hassan","Emma","Luis","Leila","Marcus","Hannah","Yusuf","Grace","Benjamin","Layla","Noah","Chloe","Ethan","Rania","Isaac","Isabella","Adam","Yasmin","Leo","Nadia","Felix","Sophia","Luca","Diana","Julian","Alicia","Matteo","Elena"];
  const LAST  = ["Smith","Johnson","Patel","Chen","Williams","Ahmed","Brown","Kim","Davis","Okafor","Wilson","Gupta","Moore","Rodriguez","Taylor","Nakamura","Anderson","Müller","Thomas","Abubakar","Jackson","Santos","Martin","Singh","Lee","Petrov","Garcia","Nkosi","White","Ibrahim","Harris","Yamamoto","Lewis","Novak","Clark","Ali","Robinson","Ferreira","Walker","Kwon","Young","Mendez","Hall","Volkov","King","Costa","Wright","Hassan","Lopez","Abebe"];
  const GENDERS   = ["Male","Female","Non-binary","Male","Female","Male","Female","Male","Female","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female","Male","Female"];
  const EDUS      = ["Bachelor's degree","Master's degree","Bachelor's degree","Doctorate or higher","High school diploma","Master's degree","Bachelor's degree","Master's degree","Doctorate or higher","Bachelor's degree","Some college","Master's degree","Bachelor's degree","Bachelor's degree","Master's degree","Doctorate or higher","Bachelor's degree","Master's degree","Bachelor's degree","High school diploma","Master's degree","Bachelor's degree","Some college","Master's degree","Bachelor's degree","Doctorate or higher","Master's degree","Bachelor's degree","Master's degree","Bachelor's degree","Doctorate or higher","Master's degree","Bachelor's degree","High school diploma","Master's degree","Bachelor's degree","Master's degree","Bachelor's degree","Some college","Master's degree","Bachelor's degree","Doctorate or higher","Master's degree","Bachelor's degree","Master's degree","Bachelor's degree","Some college","Master's degree","Bachelor's degree","Master's degree"];
  const VISIONS   = ["Normal / uncorrected","Glasses","Contact lenses","Normal / uncorrected","Glasses","Normal / uncorrected","Contact lenses","Glasses","Normal / uncorrected","Glasses","Normal / uncorrected","Contact lenses","Glasses","Normal / uncorrected","Glasses","Laser correction","Normal / uncorrected","Glasses","Contact lenses","Normal / uncorrected","Glasses","Normal / uncorrected","Contact lenses","Glasses","Normal / uncorrected","Glasses","Normal / uncorrected","Contact lenses","Normal / uncorrected","Glasses","Contact lenses","Normal / uncorrected","Glasses","Normal / uncorrected","Glasses","Contact lenses","Normal / uncorrected","Glasses","Normal / uncorrected","Contact lenses","Glasses","Normal / uncorrected","Glasses","Normal / uncorrected","Contact lenses","Glasses","Normal / uncorrected","Glasses","Contact lenses","Normal / uncorrected"];
  const DM_USAGE  = ["Often (daily)","Never","Sometimes (few times a week)","Always","Rarely (few times a month)","Often (daily)","Never","Always","Sometimes (few times a week)","Often (daily)","Rarely (few times a month)","Never","Always","Often (daily)","Sometimes (few times a week)","Never","Always","Rarely (few times a month)","Often (daily)","Sometimes (few times a week)","Never","Always","Often (daily)","Rarely (few times a month)","Sometimes (few times a week)","Always","Often (daily)","Never","Sometimes (few times a week)","Always","Rarely (few times a month)","Often (daily)","Never","Sometimes (few times a week)","Always","Often (daily)","Rarely (few times a month)","Never","Always","Sometimes (few times a week)","Often (daily)","Never","Always","Often (daily)","Rarely (few times a month)","Sometimes (few times a week)","Always","Often (daily)","Never","Sometimes (few times a week)"];
  const SCREEN    = ["4–6 hours","2–4 hours","6–8 hours","More than 8 hours","4–6 hours","6–8 hours","2–4 hours","More than 8 hours","4–6 hours","6–8 hours","2–4 hours","4–6 hours","More than 8 hours","6–8 hours","4–6 hours","2–4 hours","More than 8 hours","6–8 hours","4–6 hours","2–4 hours","6–8 hours","More than 8 hours","4–6 hours","2–4 hours","6–8 hours","More than 8 hours","4–6 hours","6–8 hours","2–4 hours","More than 8 hours","6–8 hours","4–6 hours","2–4 hours","6–8 hours","4–6 hours","More than 8 hours","2–4 hours","6–8 hours","4–6 hours","More than 8 hours","2–4 hours","6–8 hours","4–6 hours","More than 8 hours","6–8 hours","2–4 hours","4–6 hours","More than 8 hours","6–8 hours","4–6 hours"];
  const PROFS     = ["Advanced","Intermediate","Expert","Advanced","Intermediate","Expert","Intermediate","Advanced","Expert","Advanced","Intermediate","Expert","Advanced","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate","Advanced","Expert","Intermediate"];
  const AGES      = [24,31,28,35,22,29,33,27,40,25,38,23,45,30,26,34,21,42,28,32,25,37,29,24,43,31,26,35,22,39,28,33,27,41,24,36,30,25,38,23,44,29,32,26,40,22,35,27,43,31];
  const PREFS     = ["dark","light","dark","light","none","dark","light","dark","dark","light","light","dark","dark","light","none","dark","dark","light","dark","none","dark","light","none","light","dark","dark","light","dark","light","none","dark","dark","light","dark","light","none","dark","light","dark","dark","light","light","dark","dark","light","none","dark","light","dark","dark"];

  const rn = (mu, sd) => mu + sd * (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
  const cl01 = v => Math.max(0, Math.min(1, v));
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));

  // Task-specific parameters: [baseAcc, accSD, baseTT_ms, ttSD_ms, baseRT_ms, rtSD_ms]
  const TASK_P = {
    visual_search: [0.88, 0.07, 9000,  2200, null, null],
    flanker:       [0.82, 0.09, 3800,  900,  640,  130 ],
    comparison:    [0.76, 0.10, 13000, 3500, null, null],
    reading_comp:  [0.79, 0.09, 18000, 4000, 3200, 700 ],
    email_sel:     [0.84, 0.08, 12000, 3000, null, null],
    form_fill:     [0.80, 0.09, 32000, 7000, null, null],
    memory_recall: [0.72, 0.11, 10000, 2500, null, null],
    nav_task:      [0.86, 0.07, 7500,  1800, null, null],
  };

  const makeTrial = (taskType, trialIdx, baseAcc, themeBonus, taskIdx) => {
    const [bacc, asd, btt, ttsd, brt, rtsd] = TASK_P[taskType] || [0.78, 0.09, 10000, 3000, null, null];
    const fatigue = 1 - taskIdx * 0.005;
    const acc = cl01(rn(bacc + baseAcc + themeBonus, asd) * fatigue);
    const tt  = Math.round(cl(rn(btt, ttsd), 1000, 60000));
    const rt  = brt ? Math.round(cl(rn(brt - baseAcc * 150 + (themeBonus < 0 ? 40 : -30), rtsd), 150, 8000)) : null;
    const err = acc < 0.5 ? Math.floor(Math.random() * 4) + 1 : acc < 0.75 ? (Math.random() < 0.45 ? 1 : 0) : (Math.random() < 0.12 ? 1 : 0);
    const mc  = Math.floor(Math.random() * 2);
    const cl2 = Math.round(2 + Math.random() * 7);
    const path = Math.round(rn(800, 350));
    const idle = Math.round(Math.random() * 1800);
    const hover = rt ? Math.round(rt * 0.3 + Math.random() * 180) : null;
    return { i: trialIdx, acc: +acc.toFixed(4), err, mc, cl: cl2, tt, rt, path: Math.max(100, path), idle, hover: hover || null, scroll: Math.round(Math.random() * 60), navSteps: cl2 };
  };

  const makeComfort = (theme, pref) => {
    const isPreferred = theme === pref;
    const vc = cl(Math.round(rn(isPreferred ? 5.4 : 4.2, 1.0)), 1, 7);
    const es = cl(Math.round(rn(isPreferred ? 2.3 : 3.5, 0.9)), 1, 7);
    const fa = cl(Math.round(rn(isPreferred ? 2.8 : 3.8, 1.0)), 1, 7);
    const sa = cl(Math.round(rn(isPreferred ? 5.2 : 4.0, 1.0)), 1, 7);
    return { visualComfort: vc, eyeStrain: es, fatigue: fa, satisfaction: sa };
  };

  const makeNasa = (basePerf) => {
    const md = cl(Math.round(rn(13 - basePerf * 8, 2.5)), 1, 20);
    const pd = cl(Math.round(rn(4,  1.5)), 1, 20);
    const td = cl(Math.round(rn(11, 2.2)), 1, 20);
    const pe = cl(Math.round(rn(14 + basePerf * 4, 2.5)), 1, 20);
    const ef = cl(Math.round(rn(12 - basePerf * 5, 2.2)), 1, 20);
    const fr = cl(Math.round(rn(9  - basePerf * 5, 2.5)), 1, 20);
    const totalScore = +((md + pd + td + pe + ef + fr) / 6).toFixed(2);
    return { md, pd, td, pe, ef, fr, totalScore };
  };

  const tasks = ["visual_search","flanker","comparison","reading_comp","email_sel","form_fill","memory_recall","nav_task"];
  const TN_MAP = { visual_search:5, flanker:10, comparison:5, reading_comp:4, email_sel:4, form_fill:3, memory_recall:4, nav_task:4 };

  const existing = db.all();
  const testEmails = new Set(existing.filter(u => u.isTestData).map(u => u.email));

  let added = 0;
  for (let i = 0; i < 50; i++) {
    const email = `p${String(i+1).padStart(2,"0")}@cogbench.test`;
    if (testEmails.has(email)) continue; // skip if already seeded

    const orderGroup = i < 25 ? "DL" : "LD";
    const p1Theme = orderGroup === "DL" ? "dark" : "light";
    const p2Theme = orderGroup === "DL" ? "light" : "dark";
    const pref = PREFS[i];
    const basePerf = cl01(rn(0.10, 0.12));  // individual performance offset (-0.15 to +0.25)
    const darkBonus = pref === "dark" ? 0.035 : pref === "light" ? -0.028 : 0.005;
    const taskOrder = [...tasks]; // same order both phases (within-subjects design)

    const makePhase = (phase, theme) => {
      const themeBonus = theme === "dark" ? darkBonus : -darkBonus * 0.7;
      const taskRecs = taskOrder.map((tid, taskIdx) => {
        const nTrials = TN_MAP[tid] || 4;
        const trialList = Array.from({ length: nTrials }, (_, ti) => makeTrial(tid, ti, basePerf, themeBonus, taskIdx));
        const avgAcc = trialList.reduce((s, t) => s + t.acc, 0) / nTrials;
        const rtArr  = trialList.filter(t => t.rt).map(t => t.rt);
        const avgRT  = rtArr.length ? rtArr.reduce((a, b) => a + b) / rtArr.length : null;
        return { type: tid, idx: taskIdx, taskOrder: taskIdx + 1, trials: trialList, avgAcc, avgRT, taskSuccessRate: trialList.filter(t => t.acc >= 0.7).length / nTrials };
      });
      const comfort = makeComfort(theme, pref);
      const nasaTLX = phase === 2 ? makeNasa(basePerf + (theme === "dark" ? darkBonus : -darkBonus * 0.7)) : undefined;
      const rec = { phase, theme, tasks: taskRecs, comfort, ts: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString() };
      if (nasaTLX) rec.nasaTLX = nasaTLX;
      return rec;
    };

    const user = {
      id: "T" + Date.now().toString(36) + i.toString(36),
      name: `${FIRST[i]} ${LAST[i]}`,
      email,
      pwHash: hashPw("test123"),
      role: "user",
      dem: { age: String(AGES[i]), gender: GENDERS[i], edu: EDUS[i], vision: VISIONS[i], darkMode: DM_USAGE[i], screenTime: SCREEN[i], proficiency: PROFS[i] },
      orderGroup,
      experiments: [makePhase(1, p1Theme), makePhase(2, p2Theme)],
      completed: true,
      completedAt: new Date().toISOString(),
      pref,
      isTestData: true,
    };
    db.save(user);
    added++;
  }
  return added;
}

// ─── STUDY CONFIG ─────────────────────────────────────────────────────────────────
const CFG = {
  adminEmail: "admin@study.com", adminPw: "hci2024",
  idleMs: 2000, memMs: 4000,
  tasks: ["visual_search","flanker","symbol_match","sentence_verify","trail_making","digit_span","n_back","nav_task"],
  TL: { visual_search:"Visual Search", flanker:"Flanker Inhibition", symbol_match:"Symbol Matching", sentence_verify:"Sentence Verification", trail_making:"Trail Making", digit_span:"Digit Span", n_back:"N-Back Memory", nav_task:"Navigation" },
  TD: { visual_search:"Find and click every occurrence of the target character in the 6×6 grid.", flanker:"Identify the direction the CENTRE arrow points — ignore the flankers.", n_back:"Does the current letter match the one from 2 steps ago? Click Match or No Match.", stroop:"Click the colour of the INK, not what the word says.", comparison:"Select every row where Column A exceeds Column B by more than the threshold.", selection:"Select all items belonging to the stated category.", memory_recall:"Memorise the displayed words, then identify them in the recognition list.", arithmetic:"Solve the problem and tap the correct answer as fast as you can.", pattern:"Identify the value that logically completes the sequence.", trail:"Click the numbered circles in ascending order: 1 → 2 → 3 …", email_sel:"Select all emails matching the stated criteria from the inbox list below.", data_comp:"Compare the two information cards and select the one that answers the question.", form_fill:"A reference card is shown above. Transcribe the four requested fields into the form below as accurately as possible.", coded_recall:"A code is displayed briefly — memorise it. Then answer the question from memory.", nav_task:"Navigate the menu to find and click the specified destination.", reading_comp:"Read the passage carefully, then answer the comprehension question." },
  TN: {
    visual_search:   3,   // 3 grids — attention and target detection
    flanker:         6,   // 6 trials — 3 congruent + 3 incongruent
    symbol_match:    4,   // 4 trials — pattern recognition
    sentence_verify: 4,   // 4 sentences — reading and semantic reasoning
    trail_making:    2,   // 2 sequences — planning and sequencing
    digit_span:      3,   // 3 rounds — working memory
    n_back:          6,   // 6 items per trial — memory updating
    nav_task:        2,   // 2 menu trees — navigation
  },
  RT: ["flanker","reading_comp"],
};

// ─── SETTINGS SYSTEM ──────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  trialCounts: { visual_search:3, flanker:6, comparison:3, reading_comp:2, email_sel:2, form_fill:1, memory_recall:2, nav_task:2 },
  studyTitle: "Cognitive Load & User Performance: Dark vs Light Mode Interfaces",
  researcher: "",
  institution: "",
  contactEmail: "",
  notes: "",
};
function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("hci_settings") || "{}") }; }
  catch { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(s) {
  try { localStorage.setItem("hci_settings", JSON.stringify(s)); } catch {}
}
// Apply saved trial counts to CFG.TN at startup
(function applySettings() {
  const s = loadSettings();
  if (s.trialCounts) Object.assign(CFG.TN, s.trialCounts);
})();


const gen = {
  visual_search() {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    const tgt = pool[Math.floor(Math.random() * 22)];
    const dst = pool.filter(c => c !== tgt);
    const n = 36, tc = Math.floor(Math.random() * 3) + 2, tp = new Set();
    while (tp.size < tc) tp.add(Math.floor(Math.random() * n));
    return { tgt, items: Array.from({ length: n }, (_, i) => ({ id: i, ch: tp.has(i) ? tgt : dst[Math.floor(Math.random() * dst.length)], ok: tp.has(i), hit: false })), tc };
  },
  flanker() {
    const dir = Math.random() > .5 ? "L" : "R", cong = Math.random() > .5;
    const a = dir === "L" ? "←" : "→", f = cong ? a : (dir === "L" ? "→" : "←");
    return { display: [f, f, a, f, f], dir, cong };
  },
  // ── New validated tasks ─────────────────────────────────────────────────────────
  // ── New validated tasks ─────────────────────────────────────────────────────────
  symbol_match() {
    const pool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789#@$%&".split("");
    const target = pool[Math.floor(Math.random() * pool.length)];
    const distractors = shuf(pool.filter(s => s !== target)).slice(0, 8);
    return { target, items: shuf([target, ...distractors]) };
  },
  sentence_verify() {
    const sentences = [
      { s:"The sky is blue",                a:true  }, { s:"Fish live in water",              a:true  },
      { s:"The sun rises in the west",      a:false }, { s:"Cats have four legs",             a:true  },
      { s:"Humans breathe underwater",      a:false }, { s:"Ice is cold",                     a:true  },
      { s:"Birds cannot fly",               a:false }, { s:"The moon is smaller than Earth",  a:true  },
      { s:"Snakes have legs",               a:false }, { s:"Water freezes at 0°C",            a:true  },
      { s:"The heart pumps blood",          a:true  }, { s:"Apples are a vegetable",          a:false },
      { s:"The Earth orbits the Sun",       a:true  }, { s:"Diamonds are made of gold",       a:false },
      { s:"Honey is made by bees",          a:true  }, { s:"The ocean contains fresh water",  a:false },
      { s:"Dogs are mammals",               a:true  }, { s:"Plants need sunlight to grow",    a:true  },
      { s:"Sound travels faster than light",a:false }, { s:"The number 7 is even",            a:false },
      { s:"A triangle has four sides",      a:false }, { s:"The heart is in the chest",       a:true  },
      { s:"Trees are living organisms",     a:true  }, { s:"The sun is a planet",             a:false },
    ];
    return sentences[Math.floor(Math.random() * sentences.length)];
  },
  trail_making() {
    const n = 5;
    const grid = [], positions = [];
    while (positions.length < n) {
      const x = Math.floor(Math.random() * 5), y = Math.floor(Math.random() * 4);
      if (!positions.find(p => p.x===x && p.y===y)) positions.push({ x, y });
    }
    const nums = shuf([1,2,3,4,5]);
    return { nodes: positions.map((p, i) => ({ ...p, n: nums[i] })), total: n };
  },
  digit_span() {
    const len = 4 + Math.floor(Math.random() * 2); // 4 or 5 digits
    return { digits: Array.from({ length:len }, () => Math.floor(Math.random() * 10)) };
  },
  n_back() {
    const AL = "BCDFGHJKLMNPQRSTVWXZ".split("");
    const seq = [AL[Math.floor(Math.random() * AL.length)]];
    const targets = [false];
    for (let i = 1; i < CFG.TN.n_back; i++) {
      const isTarget = i >= 1 && Math.random() < 0.35;
      if (isTarget) { seq.push(seq[i-1]); targets.push(true); }
      else { let l; do { l = AL[Math.floor(Math.random()*AL.length)]; } while (l===seq[i-1]); seq.push(l); targets.push(false); }
    }
    return { seq, targets };
  },

};

// ─── TRACKER HOOK ─────────────────────────────────────────────────────────────────
function useTracker() {
  const d   = useRef(null);
  const iv  = useRef(null);

  const start = useCallback(() => {
    const n = Date.now();
    d.current = {
      st:n, lm:n, pos:null, path:0,
      cl:0, mc:0, idle:0, idleStart:null, isIdle:false,
      onset:null, firstClick:null, scroll:0,
      // ── Touch metrics ──────────────────────────────────────────────
      hasMouse:false, hasTouch:false,
      touchCount:0, touchStarts:{}, touchDurs:[], touchRadii:[], multiTouch:false,
      clickPositions:[],   // [{x,y,ok}] normalised 0-1 relative to task container
    };
    iv.current = setInterval(() => {
      const n2 = Date.now(), s = d.current;
      if (s && !s.isIdle && n2 - s.lm > CFG.idleMs) { s.isIdle = true; s.idleStart = n2; }
    }, 400);
  }, []);

  const setOnset = useCallback(() => { if (d.current) d.current.onset = Date.now(); }, []);

  const stop = useCallback(() => {
    clearInterval(iv.current);
    const n = Date.now(), s = d.current;
    if (!s) return {};
    if (s.isIdle && s.idleStart) s.idle += n - s.idleStart;
    const ref   = s.onset || s.st;
    const hover = s.firstClick && ref ? Math.max(0, s.firstClick - ref) : null;
    const avgDur = s.touchDurs.length   ? Math.round(s.touchDurs.reduce((a,b)=>a+b,0)  / s.touchDurs.length)   : null;
    const avgRad = s.touchRadii.length  ? Math.round(s.touchRadii.reduce((a,b)=>a+b,0) / s.touchRadii.length)  : null;
    const inputType = s.hasMouse && s.hasTouch ? "mixed" : s.hasTouch ? "touch" : "mouse";
    return {
      tt:n-s.st, rt:s.onset?n-s.onset:null,
      cl:s.cl, mc:s.mc, path:Math.round(s.path),
      idle:s.idle, hover, scroll:s.scroll, navSteps:s.cl,
      // Touch
      inputType, touchCount:s.touchCount,
      touchDuration:avgDur, touchRadius:avgRad, multiTouch:s.multiTouch,
      clickPositions: s.clickPositions,
    };
  }, []);

  // captureClick — call via onClickCapture on the task wrapper to record normalised position
  const captureClick = useCallback((clientX, clientY, rect, ok) => {
    const s = d.current; if (!s) return;
    const x = +Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)).toFixed(3);
    const y = +Math.min(1, Math.max(0, (clientY - rect.top)  / rect.height)).toFixed(3);
    s.clickPositions.push({ x, y, ok: ok !== false });
  }, []);

  // Mouse move — marks hasMouse, accumulates path
  const onMove = useCallback(e => {
    const n = Date.now(), s = d.current; if (!s?.st) return;
    s.hasMouse = true;
    if (s.pos) { const dx=e.clientX-s.pos.x, dy=e.clientY-s.pos.y; s.path+=Math.sqrt(dx*dx+dy*dy); }
    s.pos = { x:e.clientX, y:e.clientY };
    if (s.isIdle && s.idleStart) { s.idle+=n-s.idleStart; s.isIdle=false; s.idleStart=null; }
    s.lm = n;
  }, []);

  // Touch start — records per-finger start time, marks hasTouch
  const onTouchStart = useCallback(e => {
    const n = Date.now(), s = d.current; if (!s?.st) return;
    s.hasTouch = true;
    if (e.touches.length > 1) s.multiTouch = true;
    Array.from(e.changedTouches).forEach(t => { s.touchStarts[t.identifier] = n; });
    const t0 = e.touches[0];
    if (t0) s.pos = { x:t0.clientX, y:t0.clientY };
    if (s.isIdle && s.idleStart) { s.idle+=n-s.idleStart; s.isIdle=false; s.idleStart=null; }
    s.lm = n;
  }, []);

  // Touch end — records duration + contact radius, counts as a touch interaction
  const onTouchEnd = useCallback(e => {
    const n = Date.now(), s = d.current; if (!s) return;
    s.touchCount++;
    Array.from(e.changedTouches).forEach(t => {
      if (s.touchStarts[t.identifier] != null) {
        s.touchDurs.push(n - s.touchStarts[t.identifier]);
        delete s.touchStarts[t.identifier];
      }
      const rad = ((t.radiusX||0) + (t.radiusY||0)) / 2;
      if (rad > 0) s.touchRadii.push(rad);
    });
    if (!s.firstClick) s.firstClick = n;
    s.lm = n;
  }, []);

  // Touch move — accumulates path from touch coordinates
  const onTouchMove = useCallback(e => {
    const n = Date.now(), s = d.current; if (!s?.st) return;
    const t0 = e.touches[0];
    if (t0) {
      if (s.pos) { const dx=t0.clientX-s.pos.x, dy=t0.clientY-s.pos.y; s.path+=Math.sqrt(dx*dx+dy*dy); }
      s.pos = { x:t0.clientX, y:t0.clientY };
    }
    if (s.isIdle && s.idleStart) { s.idle+=n-s.idleStart; s.isIdle=false; s.idleStart=null; }
    s.lm = n;
  }, []);

  const onScroll = useCallback(e => {
    if (!d.current) return;
    const sy = e.target?.scrollTop || window.pageYOffset || 0;
    d.current.scroll = Math.max(d.current.scroll, Math.round(sy));
  }, []);

  const click = useCallback(ok => {
    const s = d.current; if (!s) return;
    if (!s.firstClick) s.firstClick = Date.now();
    s.cl++;
    if (!ok) s.mc++;
  }, []);

  const recordRT = useCallback(() => d.current?.onset ? Date.now() - d.current.onset : null, []);
  useEffect(() => () => clearInterval(iv.current), []);

  return { start, stop, onMove, onTouchStart, onTouchEnd, onTouchMove, onScroll, click, setOnset, recordRT, captureClick };
}

// ─── SESSION TIMEOUT ──────────────────────────────────────────────────────────────
function useSessionTimeout({ enabled=false, idleMs=300000, warnMs=60000, onExpire }={}) {
  const [status,    setStatus]    = useState("active"); // active | warning | expired
  const [countdown, setCountdown] = useState(Math.floor(warnMs/1000));
  const lastAct = useRef(Date.now());
  const warned  = useRef(false);
  const cdTimer = useRef(null);

  // Global activity listeners — reset idle clock on any interaction
  useEffect(() => {
    if (!enabled) return;
    const touch = () => { lastAct.current = Date.now(); };
    const EVTS = ["mousemove","mousedown","keydown","touchstart","touchmove","scroll","click"];
    EVTS.forEach(ev => window.addEventListener(ev, touch, { passive:true }));
    return () => EVTS.forEach(ev => window.removeEventListener(ev, touch));
  }, [enabled]);

  // Poll every 10s for idle threshold
  useEffect(() => {
    if (!enabled) return;
    const poll = setInterval(() => {
      if (warned.current) return;
      if (Date.now() - lastAct.current >= idleMs) {
        warned.current = true;
        setStatus("warning");
        let c = Math.floor(warnMs / 1000);
        setCountdown(c);
        cdTimer.current = setInterval(() => {
          c--;
          setCountdown(c);
          if (c <= 0) {
            clearInterval(cdTimer.current);
            setStatus("expired");
            onExpire?.();
          }
        }, 1000);
      }
    }, 10000);
    return () => clearInterval(poll);
  }, [enabled, idleMs, warnMs, onExpire]);

  const reset = useCallback(() => {
    lastAct.current = Date.now();
    warned.current  = false;
    clearInterval(cdTimer.current);
    setStatus("active");
    setCountdown(Math.floor(warnMs / 1000));
  }, [warnMs]);

  useEffect(() => () => clearInterval(cdTimer.current), []);
  return { status, countdown, reset };
}

function SessionTimeoutModal({ u, countdown, onStillHere, onLeave }) {
  const urgent = countdown <= 15;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:L.font }}>
      <div style={{ background:u.surfaceSolid, borderRadius:R.xl, padding:L.spXl, maxWidth:360, width:"100%", border:`2px solid ${urgent?u.red:u.orange}40`, textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,0.7)" }}>
        <div style={{ fontSize:44, marginBottom:12 }}>⏱</div>
        <h3 style={{ fontSize:L.fsLg, fontWeight:L.fwBold, color:u.text, margin:"0 0 10px" }}>Are you still there?</h3>
        <p style={{ color:u.text2, fontSize:L.fsSm, marginBottom:L.spLg, lineHeight:1.65 }}>
          Your session will pause in <strong style={{ color:urgent?u.red:u.orange }}>{countdown}s</strong> due to inactivity. Completed trials are already saved.
        </p>
        <div style={{ fontSize:60, fontWeight:L.fwBlack, color:urgent?u.red:u.orange, fontFamily:L.mono, lineHeight:1, marginBottom:L.spXl, transition:"color .3s" }}>
          {countdown}
        </div>
        <div style={{ display:"flex", gap:L.spMd }}>
          <button onClick={onLeave} style={{ flex:1, height:L.btnH, borderRadius:R.md, border:`1px solid ${u.border}`, background:"transparent", color:u.text2, fontFamily:L.font, fontSize:L.fsSm, cursor:"pointer" }}>Save & Exit</button>
          <button onClick={onStillHere} style={{ flex:1, height:L.btnH, borderRadius:R.md, border:"none", background:urgent?u.red:u.grad, color:"#fff", fontFamily:L.font, fontSize:L.fsBase, fontWeight:L.fwSemi, cursor:"pointer" }}>I'm Still Here →</button>
        </div>
      </div>
    </div>
  );
}

// ─── STATS ENGINE ─────────────────────────────────────────────────────────────────
function computeStats(user) {
  const exps = user.experiments || [];
  if (!exps.length) return null;
  const all = exps.flatMap(e => (e.tasks || []).flatMap(t => (t.trials || []).map(tr => ({ ...tr, theme: e.theme, task: t.type }))));
  const dk = all.filter(t => t.theme === "dark"), lt = all.filter(t => t.theme === "light");
  const dkRTs = dk.filter(t => t.rt && t.rt > 50 && t.rt < 20000).map(t => t.rt);
  const ltRTs = lt.filter(t => t.rt && t.rt > 50 && t.rt < 20000).map(t => t.rt);
  // Build byTask for every known task type (active or inactive) so lookups never throw
  const ALL_TASK_TYPES = Object.keys(CFG.TL);
  const byTask = Object.fromEntries(ALL_TASK_TYPES.map(tid => [tid, all.filter(t => t.task === tid)]));
  const tperf = Object.fromEntries(CFG.tasks.map(tid => [tid, { acc: avg(byTask[tid].map(t => t.acc || 0)), rt: avg(byTask[tid].filter(t => t.rt).map(t => t.rt)), n: byTask[tid].length }]));
  const accDk = avg(dk.map(t => t.acc || 0)), accLt = avg(lt.map(t => t.acc || 0));
  const efDk = avg(exps.filter(e => e.theme === "dark").map(e => e.nasaTLX?.md || 0).filter(Boolean));
  const efLt = avg(exps.filter(e => e.theme === "light").map(e => e.nasaTLX?.md || 0).filter(Boolean));

  // Per-phase perceived comfort & fatigue (within-subjects comparison)
  const comfortDk = { vc: avg(exps.filter(e=>e.theme==="dark"&&e.comfort).map(e=>e.comfort.visualComfort)||[0]), es: avg(exps.filter(e=>e.theme==="dark"&&e.comfort).map(e=>e.comfort.eyeStrain)||[0]), fa: avg(exps.filter(e=>e.theme==="dark"&&e.comfort).map(e=>e.comfort.fatigue)||[0]), sa: avg(exps.filter(e=>e.theme==="dark"&&e.comfort).map(e=>e.comfort.satisfaction)||[0]) };
  const comfortLt = { vc: avg(exps.filter(e=>e.theme==="light"&&e.comfort).map(e=>e.comfort.visualComfort)||[0]), es: avg(exps.filter(e=>e.theme==="light"&&e.comfort).map(e=>e.comfort.eyeStrain)||[0]), fa: avg(exps.filter(e=>e.theme==="light"&&e.comfort).map(e=>e.comfort.fatigue)||[0]), sa: avg(exps.filter(e=>e.theme==="light"&&e.comfort).map(e=>e.comfort.satisfaction)||[0]) };
  const rtDk = dkRTs.length ? avg(dkRTs) : null, rtLt = ltRTs.length ? avg(ltRTs) : null;

  // NASA-TLX per theme
  const nasaDk = exps.filter(e => e.theme === "dark"  && e.nasaTLX).map(e => e.nasaTLX);
  const nasaLt = exps.filter(e => e.theme === "light" && e.nasaTLX).map(e => e.nasaTLX);
  const nasaTotalDk = nasaDk.length ? avg(nasaDk.map(n => n.totalScore)) : null;
  const nasaTotalLt = nasaLt.length ? avg(nasaLt.map(n => n.totalScore)) : null;
  const errDk = avg(dk.map(t => t.err || 0));
  const errLt = avg(lt.map(t => t.err || 0));

  // Comprehensive betterTheme — every measured aspect gets a vote
  const betterTheme = (() => {
    let dkPts = 0, ltPts = 0;
    const vote = (dkVal, ltVal, higherBetter, weight = 1) => {
      if (dkVal == null || ltVal == null) return;
      if (dkVal > ltVal + 0.001) higherBetter ? (dkPts += weight) : (ltPts += weight);
      else if (ltVal > dkVal + 0.001) higherBetter ? (ltPts += weight) : (dkPts += weight);
    };
    vote(accDk,            accLt,            true,  3); // Accuracy — highest weight
    vote(rtDk,             rtLt,             false, 2); // Response time — lower is better
    vote(errDk,            errLt,            false, 2); // Error count — lower is better
    vote(nasaTotalDk,      nasaTotalLt,      false, 2); // Overall workload — lower is better
    vote(efDk,             efLt,             false, 1); // Mental demand
    vote(comfortDk.vc,     comfortLt.vc,     true,  1); // Visual comfort
    vote(comfortDk.es,     comfortLt.es,     false, 1); // Eye strain — lower is better
    vote(comfortDk.fa,     comfortLt.fa,     false, 1); // Fatigue — lower is better
    vote(comfortDk.sa,     comfortLt.sa,     true,  1); // Satisfaction
    return dkPts >= ltPts ? "dark" : "light";
  })();
  const speed = clamp(1 - avg([...dkRTs,...ltRTs].filter(Boolean).map(r => r / 2000)), 0, 1);
  const cog = {
    attention:   avg((byTask.visual_search   ||[]).map(t=>t.acc||0)) || 0,
    inhibition:  avg((byTask.flanker         ||[]).map(t=>t.acc||0)) || 0,
    analysis:    avg((byTask.symbol_match    ||[]).map(t=>t.acc||0)) || 0,
    reading:     avg((byTask.sentence_verify ||[]).map(t=>t.acc||0)) || 0,
    decision:    avg((byTask.trail_making    ||[]).map(t=>t.acc||0)) || 0,
    precision:   avg((byTask.digit_span      ||[]).map(t=>t.acc||0)) || 0,
    memory:      avg((byTask.n_back          ||[]).map(t=>t.acc||0)) || 0,
    navigation:  avg((byTask.nav_task        ||[]).map(t=>t.acc||0)) || 0,
  };
  return { all, dk, lt, dkRTs, ltRTs, byTask, tperf, accDk, accLt, efDk, efLt, rtDk, rtLt, betterTheme, cog, comfortDk, comfortLt, nasaTotalDk, nasaTotalLt, nasaDk, nasaLt, errDk, errLt, n: exps.length };
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────────
function Btn({ u, children, onClick, v = "primary", sm = false, disabled = false, full = false, style = {} }) {
  const [hov, setHov] = useState(false);
  const h = sm ? 36 : L.btnH;
  const bgs = { primary: u.accent, grad: u.grad, ghost: "transparent", danger: u.red, success: u.green, subtle: u.fill };
  const fgs = { primary: u.accentFg, grad: "#fff", ghost: hov ? u.text : u.text2, danger: "#fff", success: "#fff", subtle: u.text };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ height: h, padding: `0 ${sm ? 14 : 22}px`, borderRadius: R.md, fontSize: sm ? L.fsSm : L.fsBase, fontWeight: L.fwSemi, fontFamily: L.font, border: v === "ghost" ? `1px solid ${hov ? u.border2 : u.border}` : "none", background: hov && !disabled && v !== "grad" ? (bgs[v] || u.accent) + "cc" : bgs[v] || u.accent, color: fgs[v] || u.accentFg, opacity: disabled ? 0.42 : 1, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s", width: full ? "100%" : "auto", letterSpacing: .2, boxShadow: v === "grad" && !disabled ? "0 2px 20px rgba(79,142,247,.25)" : "none", ...style }}>
      {children}
    </button>
  );
}

function Card({ u, children, style = {}, onClick, pad = true }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => onClick && setHov(true)} onMouseLeave={() => onClick && setHov(false)}
      style={{ background: u.surface, backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: `1px solid ${hov && onClick ? u.border2 : u.border}`, borderRadius: R.xl, boxShadow: hov && onClick ? "0 8px 32px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.06)", transition: "all .25s", cursor: onClick ? "pointer" : "default", transform: hov && onClick ? "translateY(-1px)" : "none", overflow: "hidden", ...(pad ? { padding: L.spLg } : {}), ...style }}>
      {children}
    </div>
  );
}

function Badge({ u, children, color }) {
  const c = color || u.accent;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: R.pill, background: `${c}18`, color: c, fontSize: L.fsXs, fontWeight: L.fwSemi, letterSpacing: .4, border: `1px solid ${c}28` }}>{children}</span>;
}

function Inp({ u, value, onChange, type = "text", placeholder, onEnter }) {
  const [foc, setFoc] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onKeyDown={e => e.key === "Enter" && onEnter && onEnter()}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ width: "100%", height: L.btnH, padding: "0 14px", borderRadius: R.md, border: `1px solid ${foc ? u.accent : u.border2}`, background: u.surfaceSolid, color: u.text, fontSize: L.fsBase, fontFamily: L.font, outline: "none", transition: "border-color .2s", boxSizing: "border-box", boxShadow: foc ? `0 0 0 3px ${u.accent}22` : "none" }} />
  );
}

function Sel({ u, value, onChange, opts }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", height: L.btnH, padding: "0 14px", borderRadius: R.md, border: `1px solid ${u.border2}`, background: u.surfaceSolid, color: u.text, fontSize: L.fsBase, fontFamily: L.font, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
      {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

// ─── CHARTS ───────────────────────────────────────────────────────────────────────
function Radar({ u, dims, size = 180 }) {
  const n = dims.length, cx = 90, cy = 90, r = 62;
  const ang = i => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, v) => [cx + Math.cos(ang(i)) * v * r, cy + Math.sin(ang(i)) * v * r];
  return (
    <svg width={size} height={size} viewBox="0 0 180 180" style={{ overflow: "visible" }}>
      {[.25,.5,.75,1].map(f => <polygon key={f} points={dims.map((_, i) => pt(i, f).join(",")).join(" ")} fill="none" stroke={u.border2} strokeWidth={.7} opacity={.6} />)}
      {dims.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={u.border2} strokeWidth={.7} />; })}
      <polygon points={dims.map((d, i) => pt(i, d.v).join(",")).join(" ")} fill={`${u.accent}28`} stroke={u.accent} strokeWidth={2} strokeLinejoin="round" />
      {dims.map((d, i) => { const p = pt(i, d.v); return <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={u.accent} />; })}
      {dims.map((d, i) => { const p = pt(i, 1.2); return <text key={i} x={p[0]} y={p[1] + 3} textAnchor="middle" fontSize={8.5} fill={u.text3} fontFamily={L.font}>{d.l}</text>; })}
    </svg>
  );
}

function HBar({ u, data }) {
  if (!data?.length) return null;
  const mx = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: L.font }}>
          <span style={{ fontSize: L.fsXs, color: u.text3, width: 82, flexShrink: 0, textAlign: "right" }}>{d.l}</span>
          <div style={{ flex: 1, height: 22, background: u.fill, borderRadius: 99, overflow: "hidden", border: `1px solid ${u.border}` }}>
            <div style={{ height: "100%", width: `${(d.v / mx) * 100}%`, background: d.c || u.accent, borderRadius: 99, transition: "width .8s" }} />
          </div>
          <span style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, width: 46, textAlign: "left" }}>{d.fmt || d.v.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ANALYSIS CHARTS ──────────────────────────────────────────────────────────────
function GroupedBarChart({ u, groups, maxV, colors = ["#4f8ef7","#fbbf24"], labels = ["Dark","Light"] }) {
  const W = 560, H = 220, PL = 42, PR = 12, PT = 18, PB = 52;
  const cW = W - PL - PR, cH = H - PT - PB;
  const mx = maxV || Math.max(...groups.flatMap(g => g.vals.filter(Boolean)), 0.01);
  const gW = cW / groups.length, bW = Math.min((gW - 10) / 2, 26);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ f, v: mx * f }));
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} fontFamily={L.font} style={{ overflow: "visible" }}>
      {yTicks.map(({ f, v }) => (
        <g key={f}>
          <line x1={PL} y1={PT + cH * (1-f)} x2={PL+cW} y2={PT + cH * (1-f)} stroke={u.border} strokeWidth={.6} />
          <text x={PL-5} y={PT + cH*(1-f)+4} textAnchor="end" fontSize={9} fill={u.text3}>{v < 1 ? v.toFixed(2) : Math.round(v)}</text>
        </g>
      ))}
      {groups.map((g, gi) => {
        const gx = PL + gi * gW;
        return (
          <g key={gi}>
            {g.vals.map((v, bi) => {
              if (v == null) return null;
              const bH = Math.max(1, (v / mx) * cH);
              const bx = gx + (gW - 2*bW - 4) / 2 + bi * (bW + 4);
              return (
                <g key={bi}>
                  <rect x={bx} y={PT + cH - bH} width={bW} height={bH} fill={colors[bi]} rx={2} opacity={0.85} />
                  <text x={bx + bW/2} y={PT + cH - bH - 3} textAnchor="middle" fontSize={8} fill={colors[bi]} fontWeight="600">
                    {v < 2 ? v.toFixed(2) : Math.round(v)}
                  </text>
                </g>
              );
            })}
            <text x={gx + gW/2} y={PT + cH + 14} textAnchor="middle" fontSize={9} fill={u.text3}>{g.label}</text>
          </g>
        );
      })}
      <line x1={PL} y1={PT+cH} x2={PL+cW} y2={PT+cH} stroke={u.border2} strokeWidth={1} />
      {labels.map((l, i) => (
        <g key={l} transform={`translate(${PL + i * 72}, ${H - 10})`}>
          <rect width={10} height={10} fill={colors[i]} rx={2} />
          <text x={14} y={9} fontSize={9.5} fill={u.text2}>{l}</text>
        </g>
      ))}
    </svg>
  );
}

function HistogramChart({ u, datasets, bins = 10, xLabel = "Value" }) {
  // datasets: [{label, data, color}]
  const allVals = datasets.flatMap(d => d.data);
  if (!allVals.length) return null;
  const mn = Math.min(...allVals), mx = Math.max(...allVals);
  const bW2 = (mx - mn) / bins || 1;
  const counts = datasets.map(ds => {
    const c = Array(bins).fill(0);
    ds.data.forEach(v => { const i = Math.min(Math.floor((v - mn) / bW2), bins-1); c[i]++; });
    return c;
  });
  const maxC = Math.max(...counts.flat(), 1);
  const W = 480, H = 180, PL = 36, PR = 12, PT = 12, PB = 40;
  const cW = W-PL-PR, cH = H-PT-PB;
  const segW = cW / bins;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} fontFamily={L.font} style={{ overflow: "visible" }}>
      {[0, 0.5, 1].map(f => (
        <g key={f}>
          <line x1={PL} y1={PT+cH*(1-f)} x2={PL+cW} y2={PT+cH*(1-f)} stroke={u.border} strokeWidth={.6} />
          <text x={PL-4} y={PT+cH*(1-f)+4} textAnchor="end" fontSize={8} fill={u.text3}>{Math.round(maxC*f)}</text>
        </g>
      ))}
      {datasets.map((ds, di) => counts[di].map((c, bi) => {
        const bH = (c / maxC) * cH;
        const bx = PL + bi * segW + (di * segW / datasets.length);
        const bw = segW / datasets.length - 1;
        return <rect key={`${di}-${bi}`} x={bx} y={PT+cH-bH} width={Math.max(bw, 2)} height={Math.max(bH,0)} fill={ds.color} rx={1} opacity={0.8} />;
      }))}
      {[0,0.25,0.5,0.75,1].map(f => (
        <text key={f} x={PL + cW*f} y={PT+cH+14} textAnchor="middle" fontSize={8} fill={u.text3}>
          {(mn + bW2 * bins * f).toFixed(2)}
        </text>
      ))}
      <text x={PL+cW/2} y={H-2} textAnchor="middle" fontSize={9} fill={u.text3}>{xLabel}</text>
      {datasets.map((ds, i) => (
        <g key={ds.label} transform={`translate(${PL + i * 70}, ${H - 2})`}>
          <rect width={8} height={8} fill={ds.color} rx={1} y={-12} />
          <text x={12} y={-4} fontSize={8.5} fill={u.text2}>{ds.label}</text>
        </g>
      ))}
    </svg>
  );
}
function BoxPlotSVG({ u, datasets, yLabel = "" }) {
  const allVals = datasets.flatMap(d => d.data);
  if (!allVals.length) return null;
  const qs = datasets.map(d => ({ ...quartiles(d.data), label: d.label, color: d.color }));
  const mn = Math.min(...allVals), mx = Math.max(...allVals), range = mx - mn || 1;
  const W = 280, H = 200, PL = 40, PR = 12, PT = 14, PB = 32;
  const cW = W - PL - PR, cH = H - PT - PB;
  const bW = Math.min(52, (cW / datasets.length) * 0.55);
  const toY = v => PT + cH - ((v - mn) / range) * cH;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} fontFamily={L.font} style={{ overflow: "visible" }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={PL} y1={toY(mn + range * f)} x2={PL + cW} y2={toY(mn + range * f)} stroke={u.border} strokeWidth={0.5} />
          <text x={PL - 4} y={toY(mn + range * f) + 3.5} textAnchor="end" fontSize={8} fill={u.text3}>{(mn + range * f).toFixed(2)}</text>
        </g>
      ))}
      {qs.map((q, qi) => {
        if (!q) return null;
        const cx = PL + (qi + 0.5) * (cW / datasets.length);
        const bL = cx - bW / 2, bR = cx + bW / 2;
        const boxTop = toY(q.q3), boxBot = toY(q.q1), boxH = Math.max(2, boxBot - boxTop);
        return (
          <g key={qi}>
            <line x1={cx} y1={toY(q.wHigh)} x2={cx} y2={boxTop} stroke={q.color} strokeWidth={1.5} />
            <line x1={cx} y1={boxBot} x2={cx} y2={toY(q.wLow)} stroke={q.color} strokeWidth={1.5} />
            <line x1={bL + 6} y1={toY(q.wHigh)} x2={bR - 6} y2={toY(q.wHigh)} stroke={q.color} strokeWidth={1.5} />
            <line x1={bL + 6} y1={toY(q.wLow)} x2={bR - 6} y2={toY(q.wLow)} stroke={q.color} strokeWidth={1.5} />
            <rect x={bL} y={boxTop} width={bW} height={boxH} fill={`${q.color}22`} stroke={q.color} strokeWidth={1.5} rx={2} />
            <line x1={bL} y1={toY(q.q2)} x2={bR} y2={toY(q.q2)} stroke={q.color} strokeWidth={2.5} />
            <circle cx={cx} cy={toY(q.mean)} r={3} fill={q.color} opacity={0.75} />
            {q.outliers.map((o, oi) => <circle key={oi} cx={cx + (oi % 2 ? -7 : 7)} cy={toY(o)} r={2.5} fill="none" stroke={q.color} strokeWidth={1} />)}
            <text x={cx} y={PT + cH + 14} textAnchor="middle" fontSize={9} fill={u.text3}>{q.label}</text>
          </g>
        );
      })}
      {yLabel && <text x={9} y={PT + cH / 2} textAnchor="middle" fontSize={8} fill={u.text3} transform={`rotate(-90 9 ${PT + cH / 2})`}>{yLabel}</text>}
    </svg>
  );
}

function TrendLineChart({ u, pairs, metric = "acc" }) {
  if (!pairs.length) return null;
  const tasks = CFG.tasks;
  const getLine = theme => tasks.map((tid, i) => {
    const vals = pairs.map(p => {
      const ts = (p[theme]?.trials || []).filter(t => t.taskType === tid);
      return ts.length ? ts.reduce((s, t) => s + (t[metric] || 0), 0) / ts.length : null;
    }).filter(v => v != null);
    return { i: i + 1, label: (CFG.TL[tid] || tid).split(" ")[0], mean: vals.length ? vals.reduce((a, b) => a + b) / vals.length : null, n: vals.length };
  }).filter(d => d.mean != null);
  const dkLine = getLine("dark"), ltLine = getLine("light");
  const allM = [...dkLine, ...ltLine].map(d => d.mean);
  if (!allM.length) return null;
  const W = 480, H = 200, PL = 40, PR = 16, PT = 14, PB = 46;
  const cW = W - PL - PR, cH = H - PT - PB;
  const minV = Math.max(0, Math.min(...allM) - 0.05), maxV = Math.min(1.05, Math.max(...allM) + 0.05), rng = maxV - minV || 1;
  const xOf = d => PL + ((d.i - 1) / Math.max(tasks.length - 1, 1)) * cW;
  const yOf = v => PT + cH - ((v - minV) / rng) * cH;
  const poly = line => line.map(d => `${xOf(d)},${yOf(d.mean)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} fontFamily={L.font} style={{ overflow: "visible" }}>
      {[0, 0.5, 1].map(f => { const v = minV + rng * f; return <g key={f}><line x1={PL} y1={yOf(v)} x2={PL + cW} y2={yOf(v)} stroke={u.border} strokeWidth={0.5} /><text x={PL - 4} y={yOf(v) + 3.5} textAnchor="end" fontSize={8} fill={u.text3}>{v.toFixed(2)}</text></g>; })}
      {dkLine.length > 1 && <polyline points={poly(dkLine)} fill="none" stroke={u.accent2} strokeWidth={2} strokeLinejoin="round" />}
      {ltLine.length > 1 && <polyline points={poly(ltLine)} fill="none" stroke={u.gold} strokeWidth={2} strokeLinejoin="round" />}
      {dkLine.map((d, i) => <g key={i}><circle cx={xOf(d)} cy={yOf(d.mean)} r={4} fill={u.accent2} /><text x={xOf(d)} y={PT + cH + 14} textAnchor="middle" fontSize={7.5} fill={u.text3} transform={`rotate(-35 ${xOf(d)} ${PT + cH + 14})`}>{d.label}</text></g>)}
      {ltLine.map((d, i) => <circle key={i} cx={xOf(d)} cy={yOf(d.mean)} r={4} fill={u.gold} />)}
      <rect x={PL} y={H - 11} width={8} height={8} fill={u.accent2} rx={1} /><text x={PL + 12} y={H - 4} fontSize={8.5} fill={u.accent2}>Dark</text>
      <rect x={PL + 48} y={H - 11} width={8} height={8} fill={u.gold} rx={1} /><text x={PL + 60} y={H - 4} fontSize={8.5} fill={u.gold}>Light</text>
    </svg>
  );
}

function TrialHdr({ t, type, idx, total, rt }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${L.spSm}px ${L.spMd}px`, background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.md, marginBottom: L.spMd, fontFamily: L.font }}>
      <span style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: t.text }}>{CFG.TL[type]}</span>
      <span style={{ fontSize: L.fsSm, color: t.textMuted }}>Trial <strong style={{ color: t.text }}>{idx + 1}</strong> / {total}</span>
      {rt && <span style={{ fontSize: L.fsSm, color: t.accent, fontFamily: L.mono }}>RT: {rt}ms</span>}
    </div>
  );
}

const eBtn = (t, active = false) => ({ padding: `${L.spSm}px ${L.spMd}px`, borderRadius: R.md, border: `1px solid ${active ? t.selectedBdr : t.border}`, background: active ? t.selected : t.surface, cursor: "pointer", transition: "all .1s", fontFamily: L.font, color: t.text });

// ─── TASK COMPONENTS ──────────────────────────────────────────────────────────────
function VisualSearchTask({ t, data, idx, total, onDone, tracker }) {
  const [items, setItems] = useState(() => data.items.map(i => ({ ...i })));
  const found = items.filter(i => i.hit && i.ok).length;
  useEffect(() => { setItems(data.items.map(i => ({ ...i }))); tracker.start(); setTimeout(() => tracker.setOnset(), 60); }, [data]);
  const tap = id => {
    const item = items.find(i => i.id === id); if (item?.hit) return;
    tracker.click(item?.ok ?? false);
    setItems(p => p.map(i => i.id === id ? { ...i, hit: true } : i));
  };
  const submit = () => {
    const m = tracker.stop(); const fp = items.filter(i => i.hit && !i.ok).length;
    onDone({ i: idx, acc: found / data.tc, err: (data.tc - found) + fp, ...m });
  };
  return (
    <div onMouseMove={tracker.onMove}>
      <TrialHdr t={t} type="visual_search" idx={idx} total={total} />
      <div style={{ textAlign: "center", padding: `${L.spSm}px`, background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.md, marginBottom: L.spMd, fontFamily: L.font }}>
        <span style={{ fontSize: L.fsSm, color: t.textMuted }}>Target: <strong style={{ fontSize: 22, fontFamily: L.mono, color: t.accent, marginLeft: 8 }}>{data.tgt}</strong></span>
        <span style={{ fontSize: L.fsSm, color: t.textMuted, marginLeft: 20 }}>Found: <strong style={{ color: t.text }}>{found}</strong>/{data.tc}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "clamp(4px,1.5vw,10px)", marginBottom: L.spMd }}>
        {items.map(item => {
          let bg = t.surface, color = t.text, bdr = t.border;
          if (item.hit) { bg = item.ok ? t.successBg : t.errorBg; color = item.ok ? t.success : t.error; bdr = item.ok ? t.success : t.error; }
          return <button key={item.id} onClick={() => tap(item.id)} style={{ height: "clamp(40px,10vw,54px)", borderRadius: R.sm, border: `1px solid ${bdr}`, background: bg, color, fontFamily: L.mono, fontSize: "clamp(13px,3vw,18px)", fontWeight: L.fwBold, cursor: item.hit ? "default" : "pointer", transition: "all .1s" }}>{item.ch}</button>;
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={submit} disabled={found < data.tc} style={{ ...eBtn(t, found >= data.tc), height: L.btnH, padding: "0 28px", fontSize: L.fsBase, fontWeight: L.fwSemi, background: found >= data.tc ? t.accent : t.surface, color: found >= data.tc ? t.accentFg : t.text, border: "none", opacity: found < data.tc ? .5 : 1 }}>
          Submit ({found}/{data.tc} found)
        </button>
      </div>
    </div>
  );
}

function FlankerTask({ t, data, idx, total, onDone, tracker }) {
  const [ph, setPh] = useState("fix");
  const [done, setDone] = useState(false);
  const [fb, setFb] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  useEffect(() => {
    setPh("fix"); setDone(false); setFb(null); setLastRT(null); tracker.start();
    const t1 = setTimeout(() => { setPh("stim"); tracker.setOnset(); }, 650);
    return () => clearTimeout(t1);
  }, [data]);
  const respond = dir => {
    if (done) return; const rt = tracker.recordRT(); setLastRT(rt);
    const ok = dir === data.dir; tracker.click(ok); setDone(true); setFb(ok);
    setTimeout(() => { const m = tracker.stop(); onDone({ i: idx, rt, acc: ok ? 1 : 0, err: ok ? 0 : 1, ...m }); }, 700);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ textAlign: "center", fontFamily: L.font }}>
      <TrialHdr t={t} type="flanker" idx={idx} total={total} rt={lastRT} />
      <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.lg, marginBottom: L.spMd }}>
        {ph === "fix" ? <span style={{ fontSize: 40, color: t.textFaint }}>+</span> : <span style={{ fontSize: 52, letterSpacing: 10, fontFamily: L.mono, color: fb === true ? t.success : fb === false ? t.error : t.text }}>{data.display.join(" ")}</span>}
      </div>
      <p style={{ fontSize: L.fsXs, color: t.textFaint, marginBottom: L.spMd }}>{data.cong ? "Congruent" : "Incongruent"} — respond as quickly as possible</p>
      {ph === "stim" && !done && (
        <div style={{ display: "flex", gap: L.spLg, justifyContent: "center", padding: `0 ${L.spMd}px` }}>
          {[{ dir: "L", label: "← Left" }, { dir: "R", label: "Right →" }].map(({ dir, label }) => (
            <button key={dir} onClick={() => respond(dir)} style={{ height: "clamp(48px,12vw,56px)", flex:1, maxWidth:180, borderRadius: R.md, border: "none", background: t.accent, color: t.accentFg, fontSize: "clamp(14px,4vw,18px)", fontWeight: L.fwSemi, fontFamily: L.font, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      )}
      {fb !== null && <p style={{ marginTop: L.spMd, fontSize: L.fsSm, color: fb ? t.success : t.error, fontWeight: L.fwSemi }}>{fb ? "✓ Correct" : "✗ Incorrect"}</p>}
    </div>
  );
}

function NBackTask({ t, data, idx: startIdx, total, onDone, tracker }) {
  const [seqIdx, setSeqIdx] = useState(0);
  const [showing, setShowing] = useState(false);
  const [cur, setCur] = useState(null);
  const [wait, setWait] = useState(false);
  const [results, setResults] = useState([]);
  const [fb, setFb] = useState(null);
  const [ans, setAns] = useState(false);
  const doneRef = useRef(false);
  const sRef = useRef(null);
  useEffect(() => { setSeqIdx(0); setResults([]); doneRef.current = false; tracker.start(); }, [data]);
  useEffect(() => {
    if (!data?.seq || seqIdx >= data.n || doneRef.current) return;
    setWait(true);
    const t1 = setTimeout(() => {
      setCur(data.seq[seqIdx]); setShowing(true); setFb(null); setAns(false); setWait(false);
      sRef.current = Date.now(); tracker.setOnset();
      const t2 = setTimeout(() => {
        setShowing(false);
        const t3 = setTimeout(() => {
          const ni = seqIdx + 1;
          if (ni >= data.n && !doneRef.current) {
            doneRef.current = true;
            setResults(r => {
              const m = tracker.stop();
              const okCount = r.filter(x => x.ok).length;
              setTimeout(() => onDone({ i: startIdx, rt: avg(r.map(x => x.rt).filter(Boolean)), acc: okCount / Math.max(r.length, 1), err: r.filter(x => !x.ok).length, ...m }), 80);
              return r;
            });
          } else setSeqIdx(ni);
        }, 550);
        return () => clearTimeout(t3);
      }, 1100);
      return () => clearTimeout(t2);
    }, 450);
    return () => clearTimeout(t1);
  }, [data, seqIdx]);
  const respond = isMatch => {
    if (ans || wait || !showing || seqIdx < 2) return;
    const rt = Date.now() - sRef.current;
    const actual = data.seq[seqIdx] === data.seq[seqIdx - 2];
    const ok = isMatch === actual; tracker.click(ok); setAns(true); setFb(ok);
    setResults(r => [...r, { ok, rt }]);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ textAlign: "center", fontFamily: L.font }}>
      <TrialHdr t={t} type="n_back" idx={Math.max(0, seqIdx - 1)} total={data.n} />
      <div style={{ height: 5, background: t.border, borderRadius: 3, marginBottom: L.spLg, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(seqIdx / data.n) * 100}%`, background: t.accent, transition: "width .3s" }} />
      </div>
      <div style={{ width: 130, height: 130, borderRadius: 24, margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", background: showing ? t.selected : t.surface, border: `2px solid ${showing ? t.selectedBdr : t.border}`, fontSize: 60, fontWeight: L.fwBold, color: showing ? t.accent : t.textFaint, transition: "all .2s", fontFamily: L.mono }}>
        {showing ? cur : "·"}
      </div>
      {seqIdx >= 2 ? (
        <div style={{ display: "flex", gap: L.spLg, justifyContent: "center" }}>
          {[{ l: "Match", m: true }, { l: "No Match", m: false }].map(({ l, m }) => (
            <button key={l} onClick={() => respond(m)} disabled={ans || wait || !showing}
              style={{ height: L.btnH, minWidth: 125, borderRadius: R.md, border: "none", background: t.accent, color: t.accentFg, fontSize: L.fsMd, fontWeight: L.fwSemi, fontFamily: L.font, cursor: ans || wait || !showing ? "not-allowed" : "pointer", opacity: ans || wait || !showing ? .4 : 1 }}>
              {l}
            </button>
          ))}
        </div>
      ) : <p style={{ fontSize: L.fsSm, color: t.textFaint }}>Building sequence…</p>}
      {fb !== null && <p style={{ marginTop: L.spMd, fontSize: L.fsSm, color: fb ? t.success : t.error, fontWeight: L.fwSemi }}>{fb ? "✓ Correct" : "✗ Incorrect"}</p>}
    </div>
  );
}

function StroopTask({ t, data, idx, total, onDone, tracker }) {
  const [ph, setPh] = useState("fix");
  const [done, setDone] = useState(false);
  const [fb, setFb] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  useEffect(() => {
    setPh("fix"); setDone(false); setFb(null); setLastRT(null); tracker.start();
    const t1 = setTimeout(() => { setPh("stim"); tracker.setOnset(); }, 600);
    return () => clearTimeout(t1);
  }, [data]);
  const choose = opt => {
    if (done) return; const rt = tracker.recordRT(); setLastRT(rt);
    const ok = opt.name === data.ink.name; tracker.click(ok); setDone(true); setFb(ok);
    setTimeout(() => { const m = tracker.stop(); onDone({ i: idx, rt, acc: ok ? 1 : 0, err: ok ? 0 : 1, cong: data.cong, ...m }); }, 700);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ textAlign: "center", fontFamily: L.font }}>
      <TrialHdr t={t} type="stroop" idx={idx} total={total} rt={lastRT} />
      <p style={{ fontSize: L.fsSm, color: t.textFaint, marginBottom: L.spMd }}>Click the <strong style={{ color: t.text }}>colour of the ink</strong> — {data.cong ? "Congruent" : "Incongruent"}</p>
      <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.lg, marginBottom: L.spLg }}>
        {ph === "fix" ? <span style={{ fontSize: 42, color: t.textFaint }}>+</span> : <span style={{ fontSize: 56, fontWeight: L.fwBlack, fontFamily: L.font, color: data.ink.css, letterSpacing: 2 }}>{data.word}</span>}
      </div>
      {ph === "stim" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: L.spMd, maxWidth: 440, margin: "0 auto" }}>
          {data.opts.map(opt => (
            <button key={opt.name} onClick={() => choose(opt)} disabled={done}
              style={{ height: 56, borderRadius: R.md, border: `2px solid ${done && opt.name === data.ink.name ? t.success : t.border}`, background: done && opt.name === data.ink.name ? t.successBg : t.surface, cursor: done ? "default" : "pointer", transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: opt.css }} />
              <span style={{ fontSize: L.fsXs, color: t.textMuted, fontFamily: L.font }}>{opt.name}</span>
            </button>
          ))}
        </div>
      )}
      {fb !== null && <p style={{ marginTop: L.spMd, fontSize: L.fsSm, color: fb ? t.success : t.error, fontWeight: L.fwSemi }}>{fb ? "✓ Correct" : "✗ Incorrect"}</p>}
    </div>
  );
}

function ComparisonTask({ t, data, idx, total, onDone, tracker }) {
  const [rows, setRows] = useState(() => data.rows.map(r => ({ ...r, sel: false })));
  useEffect(() => { setRows(data.rows.map(r => ({ ...r, sel: false }))); tracker.start(); setTimeout(() => tracker.setOnset(), 60); }, [data]);
  const toggle = id => { const row = rows.find(r => r.id === id); tracker.click(row?.ok ?? false); setRows(p => p.map(r => r.id === id ? { ...r, sel: !r.sel } : r)); };
  const submit = () => {
    const m = tracker.stop(); const sel = rows.filter(r => r.sel);
    const ok = sel.filter(r => r.ok).length, fp = sel.filter(r => !r.ok).length, miss = rows.filter(r => r.ok && !r.sel).length, tot = data.okRows.length;
    onDone({ i: idx, acc: ok / tot, err: fp + miss, ...m });
  };
  return (
    <div onMouseMove={tracker.onMove}>
      <TrialHdr t={t} type="comparison" idx={idx} total={total} />
      <div style={{ padding: `${L.spSm}px ${L.spMd}px`, background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.md, marginBottom: L.spMd, fontFamily: L.font, fontSize: L.fsSm, color: t.textMuted }}>
        Select rows where <strong style={{ color: t.text }}>A − B &gt; {data.thr}</strong>
      </div>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: R.md, overflow: "hidden", marginBottom: L.spMd }}>
        <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 28px", background: t.surface2, borderBottom: `1px solid ${t.border}`, padding: `${L.spSm}px ${L.spMd}px` }}>
          {["#","Col A","Col B","✓"].map((h, i) => <span key={i} style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: t.textMuted, textAlign: "center", fontFamily: L.font }}>{h}</span>)}
        </div>
        {rows.map((row, i) => (
          <div key={row.id} onClick={() => toggle(row.id)} style={{ display: "grid", gridTemplateColumns: "32px 1fr 1fr 28px", padding: `${L.spMd}px`, background: row.sel ? t.selected : i % 2 === 0 ? t.bg : t.rowAlt, border: `1px solid ${row.sel ? t.selectedBdr : "transparent"}`, borderBottom: `1px solid ${t.border}`, cursor: "pointer", transition: "background .1s" }}>
            <span style={{ fontSize: L.fsSm, color: t.textFaint, textAlign: "center", alignSelf: "center" }}>{i + 1}</span>
            <span style={{ fontSize: L.fsBase, color: t.text, fontFamily: L.mono, textAlign: "center", alignSelf: "center" }}>{row.a}</span>
            <span style={{ fontSize: L.fsBase, color: t.text, fontFamily: L.mono, textAlign: "center", alignSelf: "center" }}>{row.b}</span>
            <span style={{ textAlign: "center", alignSelf: "center", color: row.sel ? t.accent : t.border, fontSize: 14 }}>{row.sel ? "●" : "○"}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={submit} style={{ ...eBtn(t), height: L.btnH, padding: "0 28px", fontSize: L.fsBase, fontWeight: L.fwSemi }}>
          Submit ({rows.filter(r => r.sel).length} selected)
        </button>
      </div>
    </div>
  );
}

function SelectionTask({ t, data, idx, total, onDone, tracker }) {
  const [items, setItems] = useState(() => data.items.map(i => ({ ...i, sel: false })));
  useEffect(() => { setItems(data.items.map(i => ({ ...i, sel: false }))); tracker.start(); setTimeout(() => tracker.setOnset(), 60); }, [data]);
  const toggle = id => { const item = items.find(i => i.id === id); tracker.click(item?.cat === data.tc); setItems(p => p.map(i => i.id === id ? { ...i, sel: !i.sel } : i)); };
  const submit = () => {
    const m = tracker.stop(); const sel = items.filter(i => i.sel);
    const ok = sel.filter(i => i.cat === data.tc).length, fp = sel.filter(i => i.cat !== data.tc).length;
    const tot = items.filter(i => i.cat === data.tc).length, miss = tot - ok;
    onDone({ i: idx, acc: ok / tot, err: fp + miss, ...m });
  };
  return (
    <div onMouseMove={tracker.onMove}>
      <TrialHdr t={t} type="selection" idx={idx} total={total} />
      <div style={{ padding: `${L.spSm}px ${L.spMd}px`, background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.md, marginBottom: L.spMd, fontFamily: L.font, fontSize: L.fsSm, color: t.textMuted }}>
        Select all: <strong style={{ color: t.accent }}>{data.crit}</strong>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: L.spSm, marginBottom: L.spMd }}>
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)} style={{ padding: L.spMd, borderRadius: R.md, border: `1px solid ${item.sel ? t.selectedBdr : t.border}`, background: item.sel ? t.selected : t.surface, cursor: "pointer", textAlign: "left", transition: "all .1s", fontFamily: L.font }}>
            <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: t.text, marginBottom: 3 }}>{item.name}</div>
            <div style={{ fontSize: L.fsXs, color: t.textMuted }}>{item.cat}</div>
            <div style={{ fontSize: L.fsXs, color: t.textFaint, marginTop: 3 }}>${item.price}</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={submit} style={{ ...eBtn(t), height: L.btnH, padding: "0 28px", fontSize: L.fsBase, fontWeight: L.fwSemi }}>
          Submit ({items.filter(i => i.sel).length} selected)
        </button>
      </div>
    </div>
  );
}

function MemoryTask({ t, data, idx, total, onDone, tracker }) {
  const [ph, setPh] = useState("mem");
  const [tl, setTl] = useState(CFG.memMs);
  const [items, setItems] = useState(() => data.items.map(i => ({ ...i })));
  useEffect(() => {
    setPh("mem"); setTl(CFG.memMs); setItems(data.items.map(i => ({ ...i }))); tracker.start();
    const s = Date.now();
    const iv = setInterval(() => {
      const left = CFG.memMs - (Date.now() - s);
      if (left <= 0) { setTl(0); setPh("recall"); tracker.setOnset(); clearInterval(iv); }
      else setTl(left);
    }, 50);
    return () => clearInterval(iv);
  }, [data]);
  const toggle = id => { const item = items.find(i => i.id === id); tracker.click(item?.ok ?? false); setItems(p => p.map(i => i.id === id ? { ...i, sel: !i.sel } : i)); };
  const submit = () => {
    const m = tracker.stop(); const sel = items.filter(i => i.sel);
    const ok = sel.filter(i => i.ok).length, fp = sel.filter(i => !i.ok).length, tot = data.tgts.length, miss = tot - ok;
    onDone({ i: idx, acc: ok / tot, err: fp + miss, ...m });
  };
  if (ph === "mem") return (
    <div style={{ fontFamily: L.font }}>
      <TrialHdr t={t} type="memory_recall" idx={idx} total={total} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: L.spMd, fontSize: L.fsSm, color: t.textMuted }}>
        <span>Memorise these words</span>
        <strong style={{ color: t.accent }}>{(tl / 1000).toFixed(1)}s</strong>
      </div>
      <div style={{ height: 4, background: t.border, borderRadius: 2, marginBottom: L.spLg, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(tl / CFG.memMs) * 100}%`, background: t.accent, transition: "width .1s" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: L.spMd }}>
        {data.tgts.map((w, i) => <div key={i} style={{ padding: L.spMd, background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.md, fontSize: L.fsMd, fontWeight: L.fwSemi, color: t.text, textAlign: "center" }}>{w}</div>)}
      </div>
    </div>
  );
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily: L.font }}>
      <TrialHdr t={t} type="memory_recall" idx={idx} total={total} />
      <p style={{ fontSize: L.fsSm, color: t.textMuted, marginBottom: L.spMd, textAlign: "center" }}>Select the words you saw</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: L.spSm, marginBottom: L.spMd }}>
        {items.map(item => <button key={item.id} onClick={() => toggle(item.id)} style={{ padding: L.spMd, borderRadius: R.md, border: `1px solid ${item.sel ? t.selectedBdr : t.border}`, background: item.sel ? t.selected : t.surface, color: t.text, fontSize: L.fsBase, fontFamily: L.font, cursor: "pointer", transition: "all .1s" }}>{item.w}</button>)}
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={submit} style={{ ...eBtn(t), height: L.btnH, padding: "0 28px", fontSize: L.fsBase, fontWeight: L.fwSemi }}>Submit Recall</button>
      </div>
    </div>
  );
}

function ArithmeticTask({ t, data, idx, total, onDone, tracker }) {
  const [ph, setPh] = useState("fix");
  const [done, setDone] = useState(false);
  const [fb, setFb] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  useEffect(() => {
    setPh("fix"); setDone(false); setFb(null); setLastRT(null); tracker.start();
    const t1 = setTimeout(() => { setPh("prob"); tracker.setOnset(); }, 500);
    return () => clearTimeout(t1);
  }, [data]);
  const choose = opt => {
    if (done) return; const rt = tracker.recordRT(); setLastRT(rt);
    tracker.click(opt.ok); setDone(true); setFb(opt.ok);
    setTimeout(() => { const m = tracker.stop(); onDone({ i: idx, rt, acc: opt.ok ? 1 : 0, err: opt.ok ? 0 : 1, ...m }); }, 680);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ textAlign: "center", fontFamily: L.font }}>
      <TrialHdr t={t} type="arithmetic" idx={idx} total={total} rt={lastRT} />
      <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.lg, marginBottom: L.spLg }}>
        {ph === "fix" ? <span style={{ fontSize: 40, color: t.textFaint }}>+</span> : <span style={{ fontSize: 32, fontWeight: L.fwBold, fontFamily: L.mono, color: t.text }}>{data.prob}</span>}
      </div>
      {ph === "prob" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: L.spMd, maxWidth: 340, margin: "0 auto" }}>
          {data.opts.map(opt => (
            <button key={opt.id} onClick={() => choose(opt)} disabled={done}
              style={{ height: 56, borderRadius: R.md, border: `1px solid ${done && opt.ok ? t.success : t.border}`, background: done && opt.ok ? t.successBg : t.surface, color: done && opt.ok ? t.success : t.text, fontSize: L.fsLg, fontWeight: L.fwBold, fontFamily: L.mono, cursor: done ? "default" : "pointer", transition: "all .15s" }}>
              {opt.v}
            </button>
          ))}
        </div>
      )}
      {fb !== null && <p style={{ marginTop: L.spMd, fontSize: L.fsSm, color: fb ? t.success : t.error, fontWeight: L.fwSemi }}>{fb ? "✓ Correct" : "✗ Incorrect"}</p>}
    </div>
  );
}

function PatternTask({ t, data, idx, total, onDone, tracker }) {
  const [done, setDone] = useState(false);
  const [fb, setFb] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  useEffect(() => { setDone(false); setFb(null); setLastRT(null); tracker.start(); setTimeout(() => tracker.setOnset(), 80); }, [data]);
  const choose = opt => {
    if (done) return; const rt = tracker.recordRT(); setLastRT(rt);
    tracker.click(opt.ok); setDone(true); setFb(opt.ok);
    setTimeout(() => { const m = tracker.stop(); onDone({ i: idx, rt, acc: opt.ok ? 1 : 0, err: opt.ok ? 0 : 1, ...m }); }, 680);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily: L.font }}>
      <TrialHdr t={t} type="pattern" idx={idx} total={total} rt={lastRT} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: L.spMd, padding: L.spLg, background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.lg, marginBottom: L.spLg }}>
        {data.seq.map((v, i) => <div key={i} style={{ width: 60, height: 60, borderRadius: R.md, background: t.bg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: L.fsLg, fontWeight: L.fwBold, fontFamily: L.mono, color: t.text }}>{v}</div>)}
        <span style={{ fontSize: 22, color: t.textFaint }}>→</span>
        <div style={{ width: 60, height: 60, borderRadius: R.md, background: t.selected, border: `2px dashed ${t.selectedBdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: t.accent }}>?</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: L.spMd }}>
        {data.opts.map(opt => (
          <button key={opt.id} onClick={() => choose(opt)} disabled={done}
            style={{ height: 56, borderRadius: R.md, border: `1px solid ${done && opt.ok ? t.success : t.border}`, background: done && opt.ok ? t.successBg : t.surface, color: done && opt.ok ? t.success : t.text, fontSize: L.fsMd, fontWeight: L.fwBold, fontFamily: L.mono, cursor: done ? "default" : "pointer", transition: "all .15s" }}>
            {opt.v}
          </button>
        ))}
      </div>
      {fb !== null && <p style={{ textAlign: "center", marginTop: L.spMd, fontSize: L.fsSm, color: fb ? t.success : t.error, fontWeight: L.fwSemi }}>{fb ? "✓ Correct" : "✗ Incorrect"}</p>}
    </div>
  );
}

function TrailTask({ t, data, idx, total, onDone, tracker }) {
  const [nodes, setNodes] = useState(() => data.nodes.map(n => ({ ...n })));
  const [next, setNext] = useState(1);
  const [errs, setErrs] = useState(0);
  useEffect(() => { setNodes(data.nodes.map(n => ({ ...n }))); setNext(1); setErrs(0); tracker.start(); setTimeout(() => tracker.setOnset(), 80); }, [data]);
  const tap = nodeId => {
    const ok = nodeId === next; tracker.click(ok);
    if (!ok) { setErrs(e => e + 1); return; }
    setNodes(p => p.map(n => n.id === nodeId ? { ...n, done: true } : n));
    const newNext = next + 1; setNext(newNext);
    if (newNext > data.n) { const m = tracker.stop(); onDone({ i: idx, acc: errs === 0 ? 1 : Math.max(0, 1 - errs / data.n), err: errs, ...m }); }
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily: L.font }}>
      <TrialHdr t={t} type="trail" idx={idx} total={total} />
      <p style={{ fontSize: L.fsSm, color: t.textMuted, marginBottom: L.spMd, textAlign: "center" }}>
        Click the numbered circles in ascending order: <strong style={{ color: t.accent }}>1 → 2 → … → {data.n}</strong>
      </p>
      <div style={{ position: "relative", width: "100%", paddingBottom: "58%", background: t.surface, border: `1px solid ${t.border}`, borderRadius: R.lg, overflow: "hidden", marginBottom: L.spMd }}>
        {nodes.map(node => (
          <button key={node.id} onClick={() => !node.done && tap(node.id)}
            style={{
              position: "absolute", left: `${node.x}%`, top: `${node.y}%`,
              transform: "translate(-50%,-50%)", width: 44, height: 44, borderRadius: "50%",
              // Done nodes: success colour. All remaining nodes look identical — no hint which is next.
              border: `2px solid ${node.done ? t.success : t.border}`,
              background: node.done ? t.successBg : t.surface,
              color: node.done ? t.success : t.text,
              fontFamily: L.mono, fontSize: L.fsSm, fontWeight: L.fwBold,
              cursor: node.done ? "default" : "pointer", transition: "all .15s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {node.done ? "✓" : node.id}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: L.fsSm, color: t.textFaint, padding: `0 ${L.spSm}px` }}>
        <span>Progress: {next - 1}/{data.n}</span>
        <span>Errors: <strong style={{ color: errs > 0 ? t.error : t.textFaint }}>{errs}</strong></span>
      </div>
    </div>
  );
}

// ─── EMAIL SELECTION TASK ──────────────────────────────────────────────────────────
function EmailSelTask({ t, data, idx, total, onDone, tracker }) {
  const [emails, setEmails] = useState(() => data.emails.map(e => ({ ...e })));
  useEffect(() => { setEmails(data.emails.map(e => ({ ...e }))); tracker.start(); setTimeout(() => tracker.setOnset(), 60); }, [data]);
  const toggle = id => {
    const e = emails.find(e => e.id === id);
    tracker.click(data.correctIds.includes(id) ? !e.sel : false);
    setEmails(p => p.map(e => e.id === id ? { ...e, sel: !e.sel } : e));
  };
  const submit = () => {
    const m = tracker.stop();
    const sel = emails.filter(e => e.sel).map(e => e.id);
    const ok = sel.filter(id => data.correctIds.includes(id)).length;
    const fp = sel.filter(id => !data.correctIds.includes(id)).length;
    const miss = data.correctIds.filter(id => !sel.includes(id)).length;
    onDone({ i:idx, acc:ok/Math.max(data.correctIds.length,1), err:fp+miss, ...m });
  };
  const TAG = { urgent:{ c:t.error, bg:t.errorBg }, normal:{ c:t.textMuted, bg:t.surface }, spam:{ c:t.textFaint, bg:t.surface } };
  return (
    <div onMouseMove={tracker.onMove}>
      <TrialHdr t={t} type="email_sel" idx={idx} total={total} />
      <div style={{ padding:`${L.spSm}px ${L.spMd}px`, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.md, marginBottom:L.spMd, fontFamily:L.font, fontSize:L.fsSm, color:t.textMuted }}>
        Task: <strong style={{ color:t.text }}>{data.crit}</strong>
      </div>
      <div style={{ border:`1px solid ${t.border}`, borderRadius:R.md, overflow:"hidden", marginBottom:L.spMd }}>
        {emails.map((email, i) => (
          <div key={email.id} onClick={() => toggle(email.id)} style={{ display:"flex", alignItems:"center", gap:L.spMd, padding:`${L.spMd}px`, background:email.sel?t.selected:i%2===0?t.bg:t.rowAlt, border:`1px solid ${email.sel?t.selectedBdr:"transparent"}`, borderBottom:`1px solid ${t.border}`, cursor:"pointer", transition:"background .1s" }}>
            <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${email.sel?t.accent:t.border}`, background:email.sel?t.accent:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {email.sel && <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:L.spSm, marginBottom:3 }}>
                <span style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:t.text }}>{email.from}</span>
                <span style={{ fontSize:L.fsXs, padding:"2px 8px", borderRadius:R.pill, background:TAG[email.tag].bg, color:TAG[email.tag].c, border:`1px solid ${TAG[email.tag].c}30`, fontWeight:L.fwBold, textTransform:"uppercase", letterSpacing:.6 }}>{email.tag}</span>
              </div>
              <div style={{ fontSize:L.fsSm, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{email.subject}</div>
            </div>
            <div style={{ fontSize:L.fsXs, color:t.textFaint, flexShrink:0 }}>{email.time}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center" }}>
        <button onClick={submit} style={{ ...eBtn(t), height:L.btnH, padding:"0 28px", fontSize:L.fsBase, fontWeight:L.fwSemi }}>Submit ({emails.filter(e=>e.sel).length} selected)</button>
      </div>
    </div>
  );
}

// ─── DATA COMPARISON TASK ─────────────────────────────────────────────────────────
function DataCompTask({ t, data, idx, total, onDone, tracker }) {
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  useEffect(() => { setChosen(null); setDone(false); tracker.start(); setTimeout(() => tracker.setOnset(), 60); }, [data]);
  const choose = side => {
    if (done) return;
    const rt = tracker.recordRT();
    tracker.click(side === data.correct);
    setChosen(side); setDone(true);
    setTimeout(() => { const m = tracker.stop(); onDone({ i:idx, rt, acc:side===data.correct?1:0, err:side===data.correct?0:1, ...m }); }, 750);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily:L.font }}>
      <TrialHdr t={t} type="data_comp" idx={idx} total={total} />
      <div style={{ textAlign:"center", padding:`${L.spSm}px ${L.spMd}px`, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.md, marginBottom:L.spMd, fontSize:L.fsSm, color:t.textMuted }}>
        <strong style={{ color:t.text }}>{data.question}</strong>
      </div>
      <div style={{ display:"flex", gap:L.spMd, marginBottom:L.spMd }}>
        {["a","b"].map(side => {
          const card = data[side];
          const isChosen = chosen === side;
          const isCorrect = side === data.correct;
          const bdr = done && isCorrect ? t.success : done && isChosen && !isCorrect ? t.error : isChosen ? t.selectedBdr : t.border;
          const bg  = done && isCorrect ? t.successBg : isChosen ? t.selected : t.surface;
          return (
            <div key={side} onClick={() => choose(side)} style={{ flex:1, padding:L.spLg, borderRadius:R.lg, border:`2px solid ${bdr}`, background:bg, cursor:done?"default":"pointer", transition:"all .15s", textAlign:"center" }}>
              <div style={{ fontSize:L.fsXs, color:t.textFaint, letterSpacing:1.5, textTransform:"uppercase", marginBottom:L.spSm }}>{side === "a" ? "Option A" : "Option B"}</div>
              <div style={{ fontSize:L.fsLg, fontWeight:L.fwBold, color:t.text, marginBottom:L.spSm }}>{card.company}</div>
              <div style={{ fontSize:L.fsXs, color:t.textMuted, marginBottom:L.spMd, textTransform:"uppercase", letterSpacing:.5 }}>{card.metric}</div>
              <div style={{ fontSize:34, fontWeight:L.fwBlack, color:done&&isCorrect?t.success:t.accent, fontFamily:L.mono }}>{card.display}</div>
            </div>
          );
        })}
      </div>
      {done && <p style={{ textAlign:"center", fontSize:L.fsSm, color:chosen===data.correct?t.success:t.error, fontWeight:L.fwSemi }}>{chosen===data.correct?"✓ Correct":"✗ Incorrect"}</p>}
    </div>
  );
}

// ─── FORM FILLING TASK ────────────────────────────────────────────────────────────
function FormFillTask({ t, data, idx, total, onDone, tracker }) {
  const [vals, setVals] = useState(() => Object.fromEntries(data.fields.map(f => [f.k, ""])));
  const [submitted, setSubmitted] = useState(false);
  const [fieldRes, setFieldRes] = useState(null);
  useEffect(() => { setVals(Object.fromEntries(data.fields.map(f => [f.k, ""]))); setSubmitted(false); setFieldRes(null); tracker.start(); setTimeout(() => tracker.setOnset(), 100); }, [data]);
  const ready = data.fields.every(f => vals[f.k].trim());
  const submit = () => {
    const m = tracker.stop();
    const res = data.fields.map(f => ({ k:f.k, ok: data.src[f.k].trim().toLowerCase() === vals[f.k].trim().toLowerCase() }));
    const ok = res.filter(r => r.ok).length;
    setFieldRes(res); setSubmitted(true);
    setTimeout(() => onDone({ i:idx, acc:ok/data.fields.length, err:data.fields.length-ok, ...m }), 1400);
  };
  const srcLabels = { name:"Full Name", empId:"Employee ID", dept:"Department", code:"Access Code", date:"Date" };
  const inpSt = (k) => {
    const res = fieldRes?.find(r => r.k === k);
    return { width:"100%", height:L.btnH, padding:"0 12px", borderRadius:R.md, border:`1px solid ${submitted&&res?res.ok?t.success:t.error:t.border}`, background:submitted&&res?res.ok?t.successBg:t.errorBg:t.bg, color:t.text, fontSize:L.fsBase, fontFamily:L.mono, outline:"none", boxSizing:"border-box", letterSpacing:.5 };
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily:L.font }}>
      <TrialHdr t={t} type="form_fill" idx={idx} total={total} />
      <div style={{ padding:L.spMd, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.md, marginBottom:L.spMd }}>
        <div style={{ fontSize:L.fsXs, color:t.textFaint, letterSpacing:1.5, textTransform:"uppercase", marginBottom:L.spSm }}>Reference Card</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:L.spSm }}>
          {Object.entries(data.src).map(([k, v]) => (
            <div key={k} style={{ padding:`${L.spSm}px ${L.spMd}px`, background:t.bg, borderRadius:R.sm, border:`1px solid ${t.border}` }}>
              <div style={{ fontSize:L.fsXs, color:t.textFaint, marginBottom:3 }}>{srcLabels[k] || k}</div>
              <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:t.text, fontFamily:L.mono }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ border:`1px solid ${t.border}`, borderRadius:R.md, overflow:"hidden", marginBottom:L.spMd }}>
        <div style={{ padding:`${L.spSm}px ${L.spMd}px`, background:t.surface2, borderBottom:`1px solid ${t.border}` }}>
          <span style={{ fontSize:L.fsXs, fontWeight:L.fwSemi, color:t.textMuted, textTransform:"uppercase", letterSpacing:.5 }}>Enter the four fields below</span>
        </div>
        <div style={{ padding:L.spMd, display:"flex", flexDirection:"column", gap:L.spMd }}>
          {data.fields.map(f => {
            const res = fieldRes?.find(r => r.k === f.k);
            return (
              <div key={f.k} style={{ display:"flex", alignItems:"center", gap:L.spMd }}>
                <label style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:t.textMuted, width:120, flexShrink:0 }}>{f.l}</label>
                <input value={vals[f.k]} onChange={e => !submitted && setVals(p => ({ ...p, [f.k]:e.target.value }))} disabled={submitted} placeholder={`Enter ${f.l.toLowerCase()}…`} style={inpSt(f.k)} />
                {submitted && res && <span style={{ fontSize:20, color:res.ok?t.success:t.error }}>{res.ok?"✓":"✗"}</span>}
              </div>
            );
          })}
        </div>
      </div>
      {!submitted && (
        <div style={{ textAlign:"center" }}>
          <button onClick={submit} disabled={!ready} style={{ height:L.btnH, padding:"0 28px", borderRadius:R.md, border:"none", background:ready?t.accent:t.surface, color:ready?t.accentFg:t.text, fontSize:L.fsBase, fontWeight:L.fwSemi, fontFamily:L.font, cursor:ready?"pointer":"not-allowed", opacity:ready?1:.5 }}>Submit Form</button>
        </div>
      )}
    </div>
  );
}

// ─── CODED RECALL TASK ────────────────────────────────────────────────────────────
function CodedRecallTask({ t, data, idx, total, onDone, tracker }) {
  const [phase, setPhase] = useState("show");
  const [tl, setTl] = useState(data.showMs);
  const [done, setDone] = useState(false);
  const [fb, setFb] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  useEffect(() => {
    setPhase("show"); setTl(data.showMs); setDone(false); setFb(null); setLastRT(null); tracker.start();
    const s = Date.now();
    const iv = setInterval(() => { const left = data.showMs - (Date.now()-s); if (left <= 0) { setPhase("question"); tracker.setOnset(); clearInterval(iv); } else setTl(left); }, 50);
    return () => clearInterval(iv);
  }, [data]);
  const choose = opt => {
    if (done) return;
    const rt = tracker.recordRT(); setLastRT(rt);
    tracker.click(opt.ok); setDone(true); setFb(opt.ok);
    setTimeout(() => { const m = tracker.stop(); onDone({ i:idx, rt, acc:opt.ok?1:0, err:opt.ok?0:1, ...m }); }, 700);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ textAlign:"center", fontFamily:L.font }}>
      <TrialHdr t={t} type="coded_recall" idx={idx} total={total} rt={lastRT} />
      {phase === "show" ? (
        <div>
          <p style={{ fontSize:L.fsSm, color:t.textMuted, marginBottom:L.spMd }}>Memorise this — you will be asked about it</p>
          <div style={{ height:4, background:t.border, borderRadius:2, marginBottom:L.spLg, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(tl/data.showMs)*100}%`, background:t.accent, transition:"width .1s" }} />
          </div>
          <div style={{ padding:`${L.spXl}px ${L.sp2Xl}px`, background:t.surface, border:`2px solid ${t.border}`, borderRadius:R.lg, display:"inline-block" }}>
            <div style={{ fontSize:28, fontWeight:L.fwBold, fontFamily:L.mono, color:t.text, letterSpacing:6, whiteSpace:"nowrap" }}>{data.display}</div>
          </div>
          <p style={{ marginTop:L.spMd, fontSize:L.fsSm, color:t.textFaint }}>{(tl/1000).toFixed(1)}s remaining</p>
        </div>
      ) : (
        <div>
          <div style={{ padding:`${L.spMd}px`, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.md, marginBottom:L.spXl, fontSize:L.fsMd, fontWeight:L.fwSemi, color:t.text }}>{data.question}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:L.spMd, maxWidth:380, margin:"0 auto" }}>
            {data.opts.map(opt => (
              <button key={opt.id} onClick={() => choose(opt)} disabled={done}
                style={{ height:56, borderRadius:R.md, border:`1px solid ${done&&opt.ok?t.success:t.border}`, background:done&&opt.ok?t.successBg:t.surface, color:done&&opt.ok?t.success:t.text, fontSize:L.fsMd, fontWeight:L.fwBold, fontFamily:L.mono, cursor:done?"default":"pointer", transition:"all .15s" }}>
                {opt.v}
              </button>
            ))}
          </div>
          {fb !== null && <p style={{ marginTop:L.spMd, fontSize:L.fsSm, color:fb?t.success:t.error, fontWeight:L.fwSemi }}>{fb?"✓ Correct":"✗ Incorrect"}</p>}
        </div>
      )}
    </div>
  );
}

// ─── NAVIGATION TASK ──────────────────────────────────────────────────────────────
// ─── SYMBOL MATCH TASK ───────────────────────────────────────────────────────────
function SymbolMatchTask({ t, data, idx, total, onDone, tracker }) {
  const [sel, setSel] = useState(null);
  useEffect(() => { tracker.start(); tracker.setOnset(Date.now()); }, []);

  const pick = item => {
    if (sel !== null) return;
    const ok = item === data.target;
    setSel(item);
    tracker.click(ok);
    const m = tracker.stop();
    setTimeout(() => onDone({ acc:ok?1:0, rt:m.rt, err:ok?0:1, ...m }), 500);
  };

  return (
    <div style={{ textAlign:"center", padding:"0 8px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:12 }}>Trial {idx+1} of {total} — Tap the matching symbol</div>
      <div style={{ fontSize:"clamp(52px,15vw,72px)", fontFamily:L.mono, fontWeight:700, color:t.text, marginBottom:20, letterSpacing:4 }}>{data.target}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"clamp(6px,2vw,10px)", maxWidth:280, margin:"0 auto" }}>
        {data.items.map(item => {
          const isTarget = item === data.target;
          const picked = sel === item;
          let bg=t.surface, color=t.text, border=t.border;
          if (picked) { bg=isTarget?t.successBg:t.errorBg; color=isTarget?t.success:t.error; border=isTarget?t.success:t.error; }
          return (
            <button key={item} onClick={() => pick(item)}
              style={{ height:"clamp(52px,14vw,64px)", borderRadius:R.md, border:`1.5px solid ${border}`, background:bg, color, fontSize:"clamp(18px,5vw,26px)", fontFamily:L.mono, fontWeight:700, cursor:sel!==null?"default":"pointer", transition:"all .1s" }}>
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── SENTENCE VERIFY TASK ────────────────────────────────────────────────────────
function SentenceVerifyTask({ t, data, idx, total, onDone, tracker }) {
  const [done, setDone] = useState(false);
  useEffect(() => { tracker.start(); tracker.setOnset(Date.now()); }, []);

  const respond = ans => {
    if (done) return;
    setDone(true);
    const ok = ans === data.a;
    tracker.click(ok);
    const m = tracker.stop();
    onDone({ acc:ok?1:0, rt:m.rt, err:ok?0:1, ...m });
  };

  return (
    <div style={{ textAlign:"center", maxWidth:420, margin:"0 auto", padding:"0 12px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:20 }}>Trial {idx+1} of {total} — Is this statement true or false?</div>
      <div style={{ fontSize:"clamp(18px,4.5vw,24px)", fontWeight:700, color:t.text, marginBottom:36, lineHeight:1.5, padding:"20px 24px", background:t.surface, borderRadius:R.lg, border:`1px solid ${t.border}` }}>
        {data.s}
      </div>
      <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
        {[{ ans:true, l:"✓ True", bg:t.success }, { ans:false, l:"✗ False", bg:t.error }].map(({ ans, l, bg }) => (
          <button key={String(ans)} onClick={() => respond(ans)} disabled={done}
            style={{ flex:1, maxWidth:160, height:"clamp(48px,12vw,60px)", borderRadius:R.md, border:"none", background:bg, color:"#fff", fontSize:"clamp(15px,4vw,19px)", fontWeight:700, fontFamily:L.font, cursor:done?"default":"pointer", opacity:done?.7:1 }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TRAIL MAKING TASK ───────────────────────────────────────────────────────────
function TrailMakingTask({ t, data, idx, total, onDone, tracker }) {
  const [next, setNext] = useState(1);
  const [tapped, setTapped] = useState([]);
  const [hadErr, setHadErr] = useState(false);
  useEffect(() => { tracker.start(); tracker.setOnset(Date.now()); }, []);

  const tap = n => {
    if (tapped.includes(n)) return;
    if (n === next) {
      tracker.click(true);
      const newTapped = [...tapped, n];
      setTapped(newTapped);
      if (next === data.total) {
        const m = tracker.stop();
        onDone({ acc:hadErr?0.7:1, rt:m.rt, err:hadErr?1:0, ...m });
      } else { setNext(next + 1); }
    } else {
      tracker.click(false);
      setHadErr(true);
    }
  };

  // 5×4 grid layout
  const COLS = 5, ROWS = 4;
  const cells = Array.from({ length: COLS*ROWS }, (_,i) => {
    const node = data.nodes.find(nd => nd.x === i%COLS && nd.y === Math.floor(i/COLS));
    return { idx:i, node };
  });

  return (
    <div style={{ textAlign:"center", padding:"0 8px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:8 }}>Trial {idx+1} of {total} — Tap numbers 1 → {data.total} in order</div>
      <div style={{ fontSize:13, fontWeight:700, color:t.accent, marginBottom:16 }}>Next: {next}</div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${COLS},1fr)`, gap:"clamp(4px,1.5vw,8px)", maxWidth:320, margin:"0 auto" }}>
        {cells.map(({ idx:ci, node }) => {
          if (!node) return <div key={ci} />;
          const done2 = tapped.includes(node.n);
          const isNext = node.n === next;
          return (
            <button key={ci} onClick={() => tap(node.n)}
              style={{ height:"clamp(50px,13vw,62px)", borderRadius:"50%", border:`2px solid ${done2?t.success:isNext?t.accent:t.border}`, background:done2?t.successBg:isNext?`${t.accent}18`:t.surface, color:done2?t.success:isNext?t.accent:t.text, fontSize:"clamp(16px,4.5vw,22px)", fontWeight:800, fontFamily:L.mono, cursor:done2||tapped.length>=data.total?"default":"pointer", transition:"all .15s" }}>
              {node.n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DIGIT SPAN TASK ─────────────────────────────────────────────────────────────
function DigitSpanTask({ t, data, idx, total, onDone, tracker }) {
  const [phase, setPhase] = useState("show"); // "show" | "recall"
  const [shown, setShown] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { tracker.start(); }, []);

  useEffect(() => {
    if (phase !== "show") return;
    if (shown < data.digits.length) {
      const t2 = setTimeout(() => setShown(s => s + 1), 700);
      return () => clearTimeout(t2);
    } else {
      const t2 = setTimeout(() => { setPhase("recall"); tracker.setOnset(Date.now()); }, 500);
      return () => clearTimeout(t2);
    }
  }, [phase, shown]);

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    const ok = input === data.digits.join("");
    setResult(ok);
    tracker.click(ok);
    const m = tracker.stop();
    setTimeout(() => onDone({ acc:ok?1:0, rt:m.rt, err:ok?0:1, ...m }), 700);
  };

  return (
    <div style={{ textAlign:"center", padding:"0 12px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:16 }}>Trial {idx+1} of {total}</div>
      {phase === "show" ? (
        <>
          <div style={{ fontSize:13, color:t.muted, marginBottom:24 }}>Remember this sequence</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center", alignItems:"center", minHeight:80 }}>
            {data.digits.slice(0, shown).map((d, i) => (
              <div key={i} style={{ width:"clamp(44px,12vw,56px)", height:"clamp(44px,12vw,56px)", borderRadius:R.md, background:t.surface, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(22px,6vw,30px)", fontWeight:800, fontFamily:L.mono, color:t.text }}>{d}</div>
            ))}
          </div>
          <div style={{ fontSize:12, color:t.muted, marginTop:16 }}>Showing {shown} of {data.digits.length}…</div>
        </>
      ) : (
        <>
          <div style={{ fontSize:13, color:t.muted, marginBottom:20 }}>Type the digits you saw in order</div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={input}
            onChange={e => !submitted && setInput(e.target.value.replace(/\D/g,"").slice(0, data.digits.length))}
            placeholder={"_ ".repeat(data.digits.length)}
            autoFocus
            style={{ width:"100%", maxWidth:220, height:56, borderRadius:R.md, border:`2px solid ${submitted?result?t.success:t.error:t.accent}`, background:t.surface, color:t.text, fontSize:28, fontFamily:L.mono, fontWeight:700, textAlign:"center", letterSpacing:6, outline:"none", boxSizing:"border-box" }}
          />
          <div style={{ marginTop:20 }}>
            <button onClick={submit} disabled={submitted || input.length < data.digits.length}
              style={{ width:"100%", height:48, borderRadius:R.md, border:"none", background:t.accent, color:"#fff", fontSize:16, fontWeight:700, fontFamily:L.font, cursor:submitted||input.length<data.digits.length?"default":"pointer", opacity:submitted||input.length<data.digits.length?.5:1 }}>
              Submit
            </button>
          </div>
          {submitted && <div style={{ marginTop:12, fontSize:14, fontWeight:700, color:result?t.success:t.error }}>{result ? "✓ Correct!" : `✗ Answer was: ${data.digits.join(" ")}`}</div>}
        </>
      )}
    </div>
  );
}

// ─── N-BACK TASK ─────────────────────────────────────────────────────────────────
function NBackTask2({ t, data, idx: startIdx, total, onDone, tracker }) {
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState("show"); // "show" | "respond"
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { tracker.start(); tracker.setOnset(Date.now()); }, []);

  const advance = () => {
    if (pos + 1 >= data.seq.length) {
      // Done — compute accuracy
      const correct = responses.filter((r, i) => r === data.targets[i+1]).length;
      const acc = correct / (data.seq.length - 1);
      const m = tracker.stop();
      onDone({ acc, rt:m.rt, err:acc<0.5?1:0, ...m });
    } else { setPos(p => p+1); setPhase("show"); setFeedback(null); }
  };

  useEffect(() => {
    if (phase !== "show") return;
    const timer = setTimeout(() => setPhase("respond"), 800);
    return () => clearTimeout(timer);
  }, [phase, pos]);

  const respond = ans => {
    if (phase !== "respond" || pos === 0) return;
    const correct = ans === data.targets[pos];
    tracker.click(correct);
    setFeedback(correct ? "✓" : "✗");
    setResponses(r => [...r, ans]);
    setTimeout(advance, 400);
  };

  return (
    <div style={{ textAlign:"center", padding:"0 12px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:8 }}>Item {pos+1} of {data.seq.length} — Is this the SAME as the previous letter?</div>
      <div style={{ fontSize:"clamp(52px,18vw,80px)", fontFamily:L.mono, fontWeight:900, color:t.text, minHeight:"clamp(80px,22vw,100px)", display:"flex", alignItems:"center", justifyContent:"center", letterSpacing:4 }}>
        {phase === "show" || phase === "respond" ? data.seq[pos] : ""}
      </div>
      {pos === 0 ? (
        <div style={{ fontSize:13, color:t.muted, padding:"16px 0" }}>Remember this letter…</div>
      ) : phase === "respond" && !feedback ? (
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8 }}>
          {[{ l:"✓ Same", v:true, bg:t.success }, { l:"✗ Different", v:false, bg:t.error }].map(({ l, v, bg }) => (
            <button key={String(v)} onClick={() => respond(v)}
              style={{ flex:1, maxWidth:150, height:"clamp(48px,12vw,60px)", borderRadius:R.md, border:"none", background:bg, color:"#fff", fontSize:"clamp(14px,3.5vw,18px)", fontWeight:700, fontFamily:L.font, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
      ) : feedback ? (
        <div style={{ fontSize:24, fontWeight:800, color:feedback==="✓"?t.success:t.error, marginTop:8 }}>{feedback}</div>
      ) : null}
    </div>
  );
}

function NavTask({ t, data, idx, total, onDone, tracker }) {
  const [openRoot, setOpenRoot] = useState(null);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState(0);
  useEffect(() => { setOpenRoot(null); setDone(false); setErrors(0); tracker.start(); setTimeout(() => tracker.setOnset(), 60); }, [data]);
  const clickRoot = root => {
    if (done) return;
    if (root !== data.target.root) { tracker.click(false); setErrors(e => e+1); }
    else tracker.click(true);
    setOpenRoot(root);
  };
  const clickItem = item => {
    if (done) return;
    const ok = item === data.target.item && openRoot === data.target.root;
    tracker.click(ok);
    if (!ok) { setErrors(e => e+1); return; }
    setDone(true);
    const m = tracker.stop();
    setTimeout(() => onDone({ i:idx, acc:1, err:errors, rt:m.rt, ...m }), 600);
  };
  const ICONS = { Settings:"⚙️", Dashboard:"📊", Account:"👤", Help:"❓", Tools:"🛠" };
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily:L.font }}>
      <TrialHdr t={t} type="nav_task" idx={idx} total={total} />
      <div style={{ padding:`${L.spSm}px ${L.spMd}px`, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.md, marginBottom:L.spMd, fontSize:L.fsSm, color:t.textMuted }}>
        Navigate to: <strong style={{ color:t.accent, fontFamily:L.mono }}>{data.path}</strong>
      </div>
      {openRoot && (
        <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:L.spMd, fontSize:L.fsSm, color:t.textMuted }}>
          <button onClick={() => setOpenRoot(null)} style={{ background:"none", border:"none", color:t.accent, cursor:"pointer", fontFamily:L.font, fontSize:L.fsSm, padding:0 }}>Home</button>
          <span> › </span><span style={{ color:t.text }}>{openRoot}</span>
        </div>
      )}
      {!openRoot ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:L.spSm }}>
          {data.roots.map(root => (
            <button key={root} onClick={() => clickRoot(root)} style={{ padding:L.spMd, borderRadius:R.md, border:`1px solid ${done&&root===data.target.root?t.success:t.border}`, background:t.surface, color:t.text, cursor:"pointer", textAlign:"left", fontFamily:L.font, fontSize:L.fsBase, transition:"all .1s" }}>
              <div style={{ fontSize:20, marginBottom:L.spSm }}>{ICONS[root]||"📁"}</div>
              <div style={{ fontWeight:L.fwSemi }}>{root}</div>
              <div style={{ fontSize:L.fsXs, color:t.textFaint, marginTop:3 }}>{data.tree[root]?.length} items</div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:L.spSm }}>
          {data.tree[openRoot]?.map(item => (
            <button key={item} onClick={() => clickItem(item)} style={{ padding:`${L.spMd}px ${L.spLg}px`, borderRadius:R.md, border:`1px solid ${done&&item===data.target.item?t.success:t.border}`, background:done&&item===data.target.item?t.successBg:t.surface, color:done&&item===data.target.item?t.success:t.text, cursor:"pointer", textAlign:"left", fontFamily:L.font, fontSize:L.fsBase, transition:"all .1s", display:"flex", alignItems:"center", gap:L.spMd }}>
              <span style={{ color:t.textFaint }}>›</span> {item}
            </button>
          ))}
        </div>
      )}
      <div style={{ marginTop:L.spMd, fontSize:L.fsSm, color:t.textFaint, textAlign:"right" }}>
        Wrong clicks: <strong style={{ color:errors>0?t.error:t.textFaint }}>{errors}</strong>
      </div>
    </div>
  );
}

// ─── READING COMPREHENSION TASK ────────────────────────────────────────────────────
function ReadingCompTask({ t, data, idx, total, onDone, tracker }) {
  const [phase, setPhase] = useState("read");
  const [done, setDone] = useState(false);
  const [fb, setFb] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  useEffect(() => { setPhase("read"); setDone(false); setFb(null); setLastRT(null); tracker.start(); }, [data]);
  const advance = () => { setPhase("question"); tracker.setOnset(); };
  const choose = opt => {
    if (done) return;
    const rt = tracker.recordRT(); setLastRT(rt);
    tracker.click(opt.ok); setDone(true); setFb(opt.ok);
    setTimeout(() => { const m = tracker.stop(); onDone({ i:idx, rt, acc:opt.ok?1:0, err:opt.ok?0:1, ...m }); }, 700);
  };
  return (
    <div onMouseMove={tracker.onMove} style={{ fontFamily:L.font }}>
      <TrialHdr t={t} type="reading_comp" idx={idx} total={total} rt={lastRT} />
      {phase === "read" ? (
        <div>
          <div style={{ padding:L.spLg, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.lg, marginBottom:L.spMd }}>
            <div style={{ fontSize:L.fsXs, color:t.textFaint, letterSpacing:1.5, textTransform:"uppercase", marginBottom:L.spMd }}>Read carefully</div>
            <p style={{ fontSize:L.fsMd, color:t.text, lineHeight:1.85, margin:0 }}>{data.text}</p>
          </div>
          <div style={{ textAlign:"center" }}>
            <button onClick={advance} style={{ height:L.btnH, padding:"0 28px", borderRadius:R.md, border:"none", background:t.accent, color:t.accentFg, fontSize:L.fsBase, fontWeight:L.fwSemi, fontFamily:L.font, cursor:"pointer" }}>I've Read It — Continue →</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ padding:L.spMd, background:t.surface, border:`1px solid ${t.border}`, borderRadius:R.md, marginBottom:L.spLg, fontSize:L.fsMd, fontWeight:L.fwSemi, color:t.text, textAlign:"center" }}>{data.question}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:L.spMd }}>
            {data.opts.map(opt => (
              <button key={opt.id} onClick={() => choose(opt)} disabled={done}
                style={{ padding:L.spMd, borderRadius:R.md, border:`1px solid ${done&&opt.ok?t.success:t.border}`, background:done&&opt.ok?t.successBg:t.surface, color:done&&opt.ok?t.success:t.text, fontSize:L.fsBase, fontFamily:L.font, cursor:done?"default":"pointer", transition:"all .15s", minHeight:56, lineHeight:1.4 }}>
                {opt.v}
              </button>
            ))}
          </div>
          {fb !== null && <p style={{ textAlign:"center", marginTop:L.spMd, fontSize:L.fsSm, color:fb?t.success:t.error, fontWeight:L.fwSemi }}>{fb?"✓ Correct":"✗ Incorrect"}</p>}
        </div>
      )}
    </div>
  );
}

const TCOMPS = { visual_search:VisualSearchTask, flanker:FlankerTask, symbol_match:SymbolMatchTask, sentence_verify:SentenceVerifyTask, trail_making:TrailMakingTask, digit_span:DigitSpanTask, n_back:NBackTask2, nav_task:NavTask };

// ─── SURVEYS ─────────────────────────────────────────────────────────────────────
function NasaTLXScreen({ u, onDone }) {
  const { mobile } = useBreakpoint();
  const [v, setV] = useState({ md: 10, pd: 10, td: 10, pe: 10, ef: 10, fr: 10 });
  const DS2 = [{ k:"md", l:"Mental Demand", d:"Mental and perceptual activity required." }, { k:"pd", l:"Physical Demand", d:"Physical activity required." }, { k:"td", l:"Temporal Demand", d:"Time pressure felt during the tasks." }, { k:"pe", l:"Performance", d:"How successful were you in accomplishing the goals?" }, { k:"ef", l:"Effort", d:"Mental and physical work required." }, { k:"fr", l:"Frustration", d:"Stress, irritation, or discouragement felt." }];
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: L.font }}>
      <div style={{ textAlign: "center", marginBottom: L.spXl }}>
        <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Phase Complete — Workload Survey</div>
        <h2 style={{ fontSize: mobile ? L.fsLg : L.fsXl, fontWeight: L.fwBold, color: u.text, margin: 0 }}>NASA Task Load Index</h2>
        <p style={{ color: u.text2, fontSize: L.fsSm, marginTop: 8, padding: `0 ${mobile ? 8 : 0}px` }}>Rate each dimension 1 (Low) → 20 (High) based on your experience during this phase</p>
      </div>
      {DS2.map(dim => (
        <Card key={dim.k} u={u} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: L.spMd }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{ fontSize: mobile ? L.fsSm : L.fsBase, fontWeight: L.fwSemi, color: u.text }}>{dim.l}</div>
              <div style={{ fontSize: L.fsXs, color: u.text3, marginTop: 3 }}>{dim.d}</div>
            </div>
            <div style={{ fontSize: mobile ? L.fsLg : L.fsXl, fontWeight: L.fwBold, color: u.accent, minWidth: 36, textAlign: "right" }}>{v[dim.k]}</div>
          </div>
          <input type="range" min={1} max={20} step={1} value={v[dim.k]} onChange={e => setV(p => ({ ...p, [dim.k]: +e.target.value }))} style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: L.fsXs, color: u.text3, marginTop: 4 }}><span>1 — Low</span>{!mobile && <span>10 — Moderate</span>}<span>20 — High</span></div>
        </Card>
      ))}
      <div style={{ textAlign: "center", marginTop: L.spXl }}>
        <Btn u={u} v="grad" onClick={() => onDone({ ...v })} full>Submit NASA-TLX →</Btn>
      </div>
    </div>
  );
}

// ─── POST-PHASE COMFORT & FATIGUE SURVEY ────────────────────────────────────────
// Collected after EACH phase so dark vs light comfort can be directly compared.
function PostPhaseComfortSurvey({ u, phase, theme, onDone }) {
  const [v, setV] = useState({ visualComfort:"", eyeStrain:"", fatigue:"", satisfaction:"" });
  const ready = Object.values(v).every(Boolean);
  const QUESTIONS = [
    { k:"visualComfort", l:"Visual Comfort",      s:"How visually comfortable was this interface theme to work with?" },
    { k:"eyeStrain",     l:"Eye Strain",           s:"Did you experience any eye strain or visual discomfort during these tasks?", note:"1 = None at all, 7 = Severe" },
    { k:"fatigue",       l:"Mental Fatigue",       s:"How mentally fatigued do you feel after completing these tasks?" },
    { k:"satisfaction",  l:"Interface Satisfaction",s:"Overall, how satisfied are you with this interface theme for task performance?" },
  ];
  const LABELS = {
    visualComfort: ["Very Uncomfortable","","","Neutral","","","Very Comfortable"],
    eyeStrain:     ["No Strain","","","Moderate","","","Severe Strain"],
    fatigue:       ["Not at all","","","Moderate","","","Extremely Fatigued"],
    satisfaction:  ["Very Dissatisfied","","","Neutral","","","Very Satisfied"],
  };
  const themeCol = theme === "dark" ? u.accent2 : u.gold;
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", fontFamily: L.font }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Badge u={u} color={themeCol} style={{ marginBottom: 12 }}>{theme} mode — Phase {phase} of 2</Badge>
        <h2 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "12px 0 8px", letterSpacing: -.5 }}>Phase {phase} Complete</h2>
        <p style={{ color: u.text2, fontSize: L.fsSm }}>Rate your experience with the <strong style={{ color: themeCol, textTransform: "capitalize" }}>{theme}</strong> interface. Rate each 1 (Low) → 7 (High).</p>
      </div>
      {QUESTIONS.map(q => (
        <Card key={q.k} u={u} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: L.spMd }}>
            <div>
              <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>{q.l}</div>
              <div style={{ fontSize: L.fsSm, color: u.text2, marginTop: 3 }}>{q.s}</div>
            </div>
            <div style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: v[q.k] ? themeCol : u.text3, minWidth: 28, textAlign: "right" }}>{v[q.k] || "—"}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
            {[1,2,3,4,5,6,7].map(n => {
              const ac = v[q.k] === String(n);
              return (
                <button key={n} onClick={() => setV(p => ({ ...p, [q.k]: String(n) }))}
                  style={{ height: 44, borderRadius: R.md, border: `1px solid ${ac ? themeCol : u.border2}`, background: ac ? `${themeCol}18` : u.fill, color: ac ? themeCol : u.text2, fontWeight: ac ? L.fwBold : L.fwNorm, fontFamily: L.font, cursor: "pointer", transition: "all .15s", fontSize: L.fsMd }}>
                  {n}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: L.fsXs, color: u.text3 }}>
            <span>{LABELS[q.k][0]}</span><span>{LABELS[q.k][6]}</span>
          </div>
        </Card>
      ))}
      <div style={{ textAlign: "center", marginTop: L.spXl }}>
        <Btn u={u} v="grad" onClick={() => ready && onDone({ visualComfort:+v.visualComfort, eyeStrain:+v.eyeStrain, fatigue:+v.fatigue, satisfaction:+v.satisfaction })} disabled={!ready} full>
          {phase === 1 ? "Continue to Phase 2 →" : "Continue to Final Survey →"}
        </Btn>
      </div>
    </div>
  );
}

// ─── TUTORIAL PAGE ────────────────────────────────────────────────────────────────
function TutorialPage({ u, uiDark, onToggleTheme, onBack }) {
  const [step, setStep] = useState(0);
  const TOTAL = 5;

  // Interactive RT demo state
  const [rtPhase, setRtPhase] = useState("idle"); // idle|countdown|stimulus|done
  const [rtCount, setRtCount] = useState(3);
  const [rtVal, setRtVal] = useState(null);
  const [rtCorrect, setRtCorrect] = useState(null);
  const rtStart = useRef(null);
  const rtDir = useRef(Math.random() > .5 ? "L" : "R");

  const startRTDemo = () => {
    setRtPhase("countdown"); setRtCount(3); setRtVal(null); setRtCorrect(null);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      if (c > 0) setRtCount(c);
      else { clearInterval(iv); setRtPhase("stimulus"); rtStart.current = Date.now(); rtDir.current = Math.random() > .5 ? "L" : "R"; }
    }, 800);
  };
  const respondRT = dir => {
    if (rtPhase !== "stimulus") return;
    const rt = Date.now() - rtStart.current;
    setRtVal(rt); setRtCorrect(dir === rtDir.current); setRtPhase("done");
  };
  const resetRT = () => { setRtPhase("idle"); setRtVal(null); setRtCorrect(null); };

  // Practice flanker state
  const [pPhase, setPPhase] = useState("ready"); // ready|fixation|stimulus|done
  const [pCorrect, setPCorrect] = useState(null);
  const [pRT, setPRT] = useState(null);
  const pDir = useRef("L");
  const pStart = useRef(null);

  const startPractice = () => {
    setPPhase("fixation"); setPCorrect(null); setPRT(null);
    pDir.current = Math.random() > .5 ? "L" : "R";
    setTimeout(() => { setPPhase("stimulus"); pStart.current = Date.now(); }, 1000);
  };
  const respondPractice = dir => {
    if (pPhase !== "stimulus") return;
    const rt = Date.now() - pStart.current;
    setPCorrect(dir === pDir.current); setPRT(rt); setPPhase("done");
  };

  const flankerArrows = dir => {
    const c = dir === "L" ? "←" : "→";
    const f = dir === "L" ? "→" : "←";
    return [f, f, c, f, f].join("  ");
  };

  const TASKS = [
    { icon:"🔍", name:"Visual Search",    desc:"Find target characters in a grid" },
    { icon:"⬅️", name:"Flanker Task",     desc:"Identify the centre arrow direction" },
    { icon:"📊", name:"Data Comparison",  desc:"Select rows where A exceeds B" },
    { icon:"📖", name:"Reading Comp.",    desc:"Read a passage, answer a question" },
    { icon:"📧", name:"Email Selection",  desc:"Select emails matching a criterion" },
    { icon:"📝", name:"Form Filling",     desc:"Transcribe a reference card" },
    { icon:"🧠", name:"Memory Recall",    desc:"Memorise words, identify them later" },
    { icon:"🗂️", name:"Navigation",       desc:"Find a destination through menus" },
  ];

  const StepDot = ({ n }) => {
    const done = n < step, active = n === step;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: L.fsXs, fontWeight: L.fwBold, transition: "all .3s", background: done ? u.green : active ? u.accent : u.fill, color: done || active ? "#fff" : u.text3, border: `2px solid ${done ? u.green : active ? u.accent : u.border}` }}>
          {done ? "✓" : n + 1}
        </div>
      </div>
    );
  };

  const STEP_LABELS = ["Overview","Your Tasks","Response Time","Interface","Practice"];

  const canNext = step !== 2 || rtPhase !== "idle";

  return (
    <div style={{ minHeight: "100vh", background: u.bg, fontFamily: L.font, overflowY: "auto" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: `${L.spXl}px ${L.spLg}px` }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: L.spXl }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: u.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
            <div>
              <div style={{ fontSize: L.fsBase, fontWeight: L.fwBold, color: u.text }}>Experiment Tutorial</div>
              <div style={{ fontSize: L.fsXs, color: u.text3 }}>~3 minutes · no data recorded</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={onBack} style={{ background: "none", border: `1px solid ${u.border}`, borderRadius: R.md, color: u.text3, cursor: "pointer", fontFamily: L.font, fontSize: L.fsSm, padding: "6px 14px" }}>Skip ✕</button>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: L.spXl }}>
          {STEP_LABELS.map((lbl, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEP_LABELS.length - 1 ? 1 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <StepDot n={i} />
                <span style={{ fontSize: L.fsXs, color: i === step ? u.accent : u.text3, fontWeight: i === step ? L.fwSemi : L.fwNorm, whiteSpace: "nowrap" }}>{lbl}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? u.green : u.border, margin: "0 6px", marginBottom: 18, transition: "background .4s" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Overview ── */}
        {step === 0 && (
          <Card u={u} style={{ padding: L.spXl }} className="au">
            <div style={{ textAlign: "center", marginBottom: L.spXl }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>👋</div>
              <h2 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "0 0 10px", letterSpacing: -.5 }}>Welcome to CogBench</h2>
              <p style={{ color: u.text2, fontSize: L.fsMd, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>This tutorial explains how the experiment works before you begin. Nothing here is recorded.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:L.spMd, marginBottom:L.spXl }}>
              {[
                { icon:"⏱", label:"Duration", value:"~20 minutes total" },
                { icon:"🔄", label:"Phases", value:"2 phases (dark + light mode)" },
                { icon:"📋", label:"Tasks", value:"8 cognitive task types" },
                { icon:"🔒", label:"Attempts", value:"One attempt — data is permanent" },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: L.spMd, background: u.fill, borderRadius: R.md, border: `1px solid ${u.border}` }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: L.spMd, background: `${u.accent}0c`, border: `1px solid ${u.accent}28`, borderRadius: R.md }}>
              <div style={{ fontSize: L.fsSm, color: u.text2, lineHeight: 1.7 }}>
                <strong style={{ color: u.accent }}>What happens:</strong> You'll complete the same 8 tasks twice — once with a <strong style={{ color: u.text }}>dark interface</strong>, once with a <strong style={{ color: u.text }}>light interface</strong>. The order is randomly assigned. Your performance metrics are automatically collected and anonymised.
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 1: Your Tasks ── */}
        {step === 1 && (
          <Card u={u} style={{ padding: L.spXl }} className="au">
            <div style={{ marginBottom: L.spLg }}>
              <h2 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px" }}>Your 8 Tasks</h2>
              <p style={{ color: u.text2, fontSize: L.fsSm, margin: 0 }}>Each task is introduced with a brief description before it begins. You'll see a task brief screen like this every time a new task starts.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:L.spSm, marginBottom:L.spLg }}>
              {TASKS.map(({ icon, name, desc }) => (
                <div key={name} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: L.spMd, background: u.fill, borderRadius: R.md, border: `1px solid ${u.border}` }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: L.fsXs, color: u.text3, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Mock task brief */}
            <div style={{ padding: L.spMd, borderRadius: R.lg, border: `2px dashed ${u.border2}` }}>
              <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: L.spSm }}>Example task brief screen</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: L.spSm }}>
                <div style={{ height: 6, background: u.accent, borderRadius: 3, width: "35%" }} />
                <div style={{ height: 6, background: u.border, borderRadius: 3, flex: 1 }} />
              </div>
              <div style={{ fontSize: L.fsXs, color: u.text3 }}>Progress bar shows how many of the 8 tasks are complete in this phase</div>
            </div>
          </Card>
        )}

        {/* ── Step 2: Response Time ── */}
        {step === 2 && (
          <Card u={u} style={{ padding: L.spXl }} className="au">
            <div style={{ marginBottom: L.spLg }}>
              <h2 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px" }}>Response Time & Accuracy</h2>
              <p style={{ color: u.text2, fontSize: L.fsSm, lineHeight: 1.65 }}>Two tasks measure <strong style={{ color: u.text }}>response time (RT)</strong> — the time between a stimulus appearing on screen and your first click. Try the live demo below to see how it works.</p>
            </div>

            {/* RT diagram */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: L.spLg, overflowX: "auto" }}>
              {[
                { label: "Task appears", sub: "Stimulus shown", icon: "👁", color: u.accent },
                { label: "Response Time", sub: "Measured automatically", icon: "⏱", color: u.text3, isArrow: true },
                { label: "You respond", sub: "First click recorded", icon: "👆", color: u.green },
              ].map(({ label, sub, icon, color, isArrow }, i) => isArrow ? (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 4 }}>
                    <div style={{ flex: 1, height: 2, background: u.accent }} />
                    <span style={{ fontSize: 20, color: u.accent }}>→</span>
                  </div>
                  <div style={{ fontSize: L.fsXs, color: u.text3, textAlign: "center" }}>{label}</div>
                  <div style={{ fontSize: L.fsXs - 1, color: u.text3, textAlign: "center" }}>{sub}</div>
                </div>
              ) : (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 110 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, textAlign: "center" }}>{label}</div>
                  <div style={{ fontSize: L.fsXs, color: u.text3, textAlign: "center" }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Live RT demo */}
            <div style={{ padding: L.spLg, background: u.fill, borderRadius: R.lg, border: `1px solid ${u.border}`, textAlign: "center" }}>
              <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: L.spMd }}>Live Demo — Try it yourself</div>

              {rtPhase === "idle" && (
                <div>
                  <p style={{ color: u.text2, fontSize: L.fsSm, marginBottom: L.spMd }}>Click start. When the arrows appear, identify which direction the <strong style={{ color: u.text }}>centre arrow</strong> points and click the button as fast as you can.</p>
                  <Btn u={u} v="primary" onClick={startRTDemo}>Start Demo →</Btn>
                </div>
              )}

              {rtPhase === "countdown" && (
                <div>
                  <p style={{ color: u.text2, fontSize: L.fsSm, marginBottom: L.spMd }}>Get ready…</p>
                  <div style={{ fontSize: 60, fontWeight: L.fwBold, color: u.accent }}>{rtCount}</div>
                </div>
              )}

              {rtPhase === "stimulus" && (
                <div>
                  <div style={{ fontSize: 36, letterSpacing: 10, fontFamily: L.mono, color: u.text, marginBottom: L.spXl }}>
                    {flankerArrows(rtDir.current)}
                  </div>
                  <p style={{ color: u.text3, fontSize: L.fsSm, marginBottom: L.spMd }}>Which direction does the <strong style={{ color: u.text }}>centre arrow</strong> point?</p>
                  <div style={{ display: "flex", gap: L.spLg, justifyContent: "center" }}>
                    {["L","R"].map(d => (
                      <button key={d} onClick={() => respondRT(d)} style={{ height: L.btnH, minWidth: 120, borderRadius: R.md, border: "none", background: u.accent, color: "#fff", fontSize: L.fsMd, fontWeight: L.fwSemi, fontFamily: L.font, cursor: "pointer" }}>
                        {d === "L" ? "← Left" : "Right →"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {rtPhase === "done" && (
                <div>
                  <div style={{ fontSize: 36, fontWeight: L.fwBold, color: rtCorrect ? u.green : u.red, marginBottom: L.spSm }}>
                    {rtCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </div>
                  <div style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, marginBottom: 4 }}>{rtVal}ms</div>
                  <div style={{ fontSize: L.fsSm, color: u.text3, marginBottom: L.spMd }}>
                    {rtVal < 400 ? "Very fast response" : rtVal < 700 ? "Good response speed" : rtVal < 1200 ? "Moderate response speed" : "Slower response — try to respond quickly"}
                  </div>
                  <div style={{ padding: L.spSm, background: `${u.accent}0c`, borderRadius: R.md, border: `1px solid ${u.accent}22`, marginBottom: L.spMd }}>
                    <div style={{ fontSize: L.fsXs, color: u.text2, lineHeight: 1.6 }}>This exact measurement — from stimulus display to your click — is what <strong style={{ color: u.accent }}>Response Time</strong> captures. Lower is faster.</div>
                  </div>
                  <button onClick={resetRT} style={{ background: "none", border: `1px solid ${u.border}`, borderRadius: R.md, color: u.text2, cursor: "pointer", fontFamily: L.font, fontSize: L.fsSm, padding: "6px 14px" }}>Try again</button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── Step 3: Interface Guide ── */}
        {step === 3 && (
          <Card u={u} style={{ padding: L.spXl }} className="au">
            <div style={{ marginBottom: L.spLg }}>
              <h2 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px" }}>Reading the Interface</h2>
              <p style={{ color: u.text2, fontSize: L.fsSm }}>During the experiment, every screen follows the same layout. Here's what each part means.</p>
            </div>

            {/* Mock experiment header */}
            <div style={{ border: `2px solid ${u.border2}`, borderRadius: R.lg, overflow: "hidden", marginBottom: L.spXl }}>
              {/* Mock top bar */}
              <div style={{ padding: `${L.spSm}px ${L.spMd}px`, background: u.surfaceSolid, borderBottom: `1px solid ${u.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: L.spSm }}>
                  <span style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text }}>Phase 1 · dark · Visual Search</span>
                  <span style={{ fontSize: L.fsXs, padding: "2px 10px", borderRadius: R.pill, background: u.fill, border: `1px solid ${u.border}`, color: u.text3 }}>🔒 Theme locked</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: L.spSm }}>
                  <div style={{ height: 4, background: u.border, borderRadius: 2, overflow: "hidden", flex: 1 }}>
                    <div style={{ height: "100%", width: "37.5%", background: u.accent, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
              {/* Mock task area */}
              <div style={{ padding: L.spLg, background: u.bg, minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: L.fsSm, color: u.text3 }}>Task content appears here</span>
              </div>
            </div>

            {/* Annotations */}
            <div style={{ display: "flex", flexDirection: "column", gap: L.spMd }}>
              {[
                { num: "1", color: u.accent,  title: "Phase & Task Label",  desc: "Shows which phase you're in (1 or 2), the current theme, and the task name." },
                { num: "2", color: u.green,   title: "Progress Bar",        desc: "Fills as you complete tasks. Each segment = 1 of 8 tasks in this phase." },
                { num: "3", color: u.orange,  title: "Theme Lock Notice",   desc: "The interface colour is fixed for the entire phase. Do not change display settings." },
                { num: "4", color: u.text2,   title: "Task Work Area",      desc: "All interaction happens here. Read task instructions carefully before responding." },
              ].map(({ num, color, title, desc }) => (
                <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: L.fsXs, fontWeight: L.fwBold, color: "#fff", flexShrink: 0, marginTop: 2 }}>{num}</div>
                  <div>
                    <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: L.fsSm, color: u.text2, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Step 4: Practice ── */}
        {step === 4 && (
          <Card u={u} style={{ padding: L.spXl }} className="au">
            <div style={{ marginBottom: L.spLg }}>
              <h2 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px" }}>Try a Practice Task</h2>
              <p style={{ color: u.text2, fontSize: L.fsSm, lineHeight: 1.65 }}>This is a <strong style={{ color: u.text }}>Flanker Inhibition</strong> trial — one of the real tasks in the experiment. Your response is not recorded. Focus on the <strong style={{ color: u.text }}>centre arrow only</strong> and respond as fast as you can.</p>
            </div>

            <div style={{ padding: L.spXl, background: u.fill, borderRadius: R.lg, border: `1px solid ${u.border}`, textAlign: "center", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {pPhase === "ready" && (
                <div>
                  <div style={{ fontSize: L.fsSm, color: u.text2, marginBottom: L.spLg, lineHeight: 1.65 }}>
                    <strong>Rule:</strong> Click the direction the <strong style={{ color: u.text }}>centre arrow</strong> points.<br />
                    <span style={{ color: u.text3 }}>Ignore the arrows on either side — they're there to distract you.</span>
                  </div>
                  <div style={{ fontSize: 28, letterSpacing: 8, fontFamily: L.mono, color: u.text3, marginBottom: L.spLg }}>→  →  <span style={{ color: u.text }}>←</span>  →  →</div>
                  <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spLg }}>Example: The centre arrow points ← Left</div>
                  <Btn u={u} v="primary" onClick={startPractice}>Start Practice →</Btn>
                </div>
              )}

              {pPhase === "fixation" && (
                <div>
                  <div style={{ fontSize: 40, color: u.text3 }}>+</div>
                  <div style={{ fontSize: L.fsSm, color: u.text3, marginTop: L.spMd }}>Focus on the cross…</div>
                </div>
              )}

              {pPhase === "stimulus" && (
                <div>
                  <div style={{ fontSize: 36, letterSpacing: 10, fontFamily: L.mono, color: u.text, marginBottom: L.spXl }}>
                    {flankerArrows(pDir.current)}
                  </div>
                  <div style={{ display: "flex", gap: L.spLg, justifyContent: "center" }}>
                    {["L","R"].map(d => (
                      <button key={d} onClick={() => respondPractice(d)} style={{ height: L.btnH, minWidth: 130, borderRadius: R.md, border: "none", background: u.accent, color: "#fff", fontSize: L.fsMd, fontWeight: L.fwSemi, fontFamily: L.font, cursor: "pointer" }}>
                        {d === "L" ? "← Left" : "Right →"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {pPhase === "done" && (
                <div>
                  <div style={{ fontSize: 40, marginBottom: L.spSm }}>{pCorrect ? "✅" : "❌"}</div>
                  <div style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: pCorrect ? u.green : u.red, marginBottom: L.spSm }}>{pCorrect ? "Correct!" : "Incorrect"}</div>
                  <div style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, marginBottom: 4 }}>{pRT}ms</div>
                  <div style={{ fontSize: L.fsSm, color: u.text3, marginBottom: L.spLg }}>Response time{pCorrect ? ` — ${pRT < 500 ? "Excellent speed!" : pRT < 800 ? "Good speed" : "Try to respond faster in the real task"}` : " — remember to prioritise accuracy too"}</div>
                  <div style={{ display: "flex", gap: L.spMd, justifyContent: "center" }}>
                    <button onClick={() => { setPPhase("ready"); setPCorrect(null); setPRT(null); }} style={{ background: "none", border: `1px solid ${u.border}`, borderRadius: R.md, color: u.text2, cursor: "pointer", fontFamily: L.font, fontSize: L.fsSm, padding: "6px 14px" }}>Try Again</button>
                  </div>
                </div>
              )}
            </div>

            {pPhase === "done" && (
              <div style={{ marginTop: L.spMd, padding: L.spMd, background: `${u.green}0c`, border: `1px solid ${u.green}28`, borderRadius: R.md }}>
                <div style={{ fontSize: L.fsSm, color: u.text2, lineHeight: 1.65 }}>
                  <strong style={{ color: u.green }}>You're ready.</strong> The real tasks work exactly like this. Work quickly and accurately — both matter. In the actual experiment this trial would also measure your click count, mouse path, and idle time.
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: L.spXl }}>
          <Btn u={u} v="ghost" onClick={step === 0 ? onBack : () => setStep(s => s - 1)}>
            {step === 0 ? "← Back to Dashboard" : "← Back"}
          </Btn>
          {step < TOTAL - 1
            ? <Btn u={u} v="primary" onClick={() => setStep(s => s + 1)} disabled={step === 2 && rtPhase === "idle"}>
                {step === 2 && rtPhase === "idle" ? "Complete the demo first" : "Next →"}
              </Btn>
            : <Btn u={u} v="grad" onClick={onBack}>Done — Back to Dashboard →</Btn>
          }
        </div>
        {step === 2 && rtPhase === "idle" && (
          <p style={{ textAlign: "right", fontSize: L.fsXs, color: u.text3, marginTop: 6 }}>Complete the live demo above to continue</p>
        )}

      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, u, uiDark, onToggleTheme }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [err, setErr] = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const login = async () => {
    setErr("");
    if (form.email === CFG.adminEmail && form.pw === CFG.adminPw) { onLogin({ id:"admin", name:"Administrator", email:CFG.adminEmail, role:"admin" }); return; }
    // Check local first
    let user = db.all().find(x => x.email === form.email && x.pwHash === hashPw(form.pw));
    // Not found locally — try pulling from Supabase
    if (!user && supa) {
      setErr("Checking cloud…");
      try {
        const { data } = await supa.from("participants").select("data").eq("id", btoa(form.email).replace(/=/g,"")).limit(1);
        if (!data?.length) {
          // Try scanning all for matching email
          const { data: all } = await supa.from("participants").select("data");
          const match = all?.map(r => r.data).find(u2 => u2.email === form.email && u2.pwHash === hashPw(form.pw));
          if (match) { db.save(match); user = match; }
        } else {
          const candidate = data[0].data;
          if (candidate?.pwHash === hashPw(form.pw)) { db.save(candidate); user = candidate; }
        }
      } catch { /* fall through to error */ }
    }
    if (!user) { setErr("Invalid email or password."); return; }
    db.setCur(user.id); onLogin(user);
  };
  const register = async () => {
    setErr("");
    if (!form.name || !form.email || !form.pw) { setErr("All fields are required."); return; }
    if (form.pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (form.pw !== form.pw2) { setErr("Passwords do not match."); return; }
    if (db.all().find(x => x.email === form.email)) { setErr("Email already registered."); return; }
    // Check Supabase for duplicate email
    if (supa) {
      try {
        const { data } = await supa.from("participants").select("data");
        const cloudMatch = data?.map(r => r.data).find(u2 => u2.email === form.email);
        if (cloudMatch) { setErr("Email already registered. Try signing in."); return; }
      } catch { /* proceed */ }
    }
    const user = { id: uid(), name: form.name, email: form.email, pwHash: hashPw(form.pw), role: "user", experiments: [], createdAt: new Date().toISOString() };
    db.save(user); db.setCur(user.id); onLogin(user);
  };
  return (
    <div style={{ minHeight: "100vh", background: u.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: L.font, position: "relative", overflow: "hidden" }}>
      {/* Theme toggle — top right */}
      <div style={{ position:"fixed", top:16, right:16, zIndex:10 }}>
        <ThemeToggle uiDark={uiDark} onToggle={onToggleTheme} u={u} />
      </div>
      <div style={{ position: "absolute", top: "15%", left: "8%", width: 500, height: 500, borderRadius: "50%", background: u.gradSoft, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${u.accent2}18,transparent 70%)`, filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: u.grad, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 4px 28px ${u.accent}44` }}>🧠</div>
          <h1 style={{ fontSize: L.fs2Xl, fontWeight: L.fwBlack, color: u.text, margin: 0, letterSpacing: -1.5 }}>CogBench</h1>
          <p style={{ color: u.text3, fontSize: L.fsSm, marginTop: 6, letterSpacing: .8, textTransform: "uppercase" }}>HCI Cognitive Load Study</p>
        </div>
        <Card u={u} style={{ padding: 24 }}>
          <div style={{ display: "flex", background: u.fill, borderRadius: R.md, padding: 3, marginBottom: 20 }}>
            {[["login","Sign In"],["register","Register"]].map(([k, l]) => (
              <button key={k} onClick={() => { setTab(k); setErr(""); }} style={{ flex: 1, height: 34, borderRadius: R.sm, border: "none", background: tab === k ? u.surfaceSolid : "transparent", color: tab === k ? u.text : u.text3, fontWeight: tab === k ? L.fwSemi : L.fwNorm, fontFamily: L.font, cursor: "pointer", fontSize: L.fsSm, transition: "all .2s", boxShadow: tab === k ? "0 1px 4px rgba(0,0,0,0.12)" : "none" }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tab === "register" && <Inp u={u} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />}
            <Inp u={u} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="Email address" onEnter={tab === "login" ? login : undefined} />
            <Inp u={u} type="password" value={form.pw} onChange={e => set("pw", e.target.value)} placeholder="Password" onEnter={tab === "login" ? login : undefined} />
            {tab === "register" && <Inp u={u} type="password" value={form.pw2} onChange={e => set("pw2", e.target.value)} placeholder="Confirm password" />}
            {err && <div style={{ color: u.red, fontSize: L.fsSm, padding: "8px 14px", background: u.redBg, borderRadius: R.sm, border: `1px solid ${u.red}22` }}>{err}</div>}
            <Btn u={u} v="grad" onClick={tab === "login" ? login : register} full style={{ marginTop: 4 }}>{tab === "login" ? "Sign In →" : "Create Account →"}</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────────
function ProfilePage({ user, u, onSave }) {
  const [editing, setEditing] = useState(false);
  const [demF, setDemF] = useState(() => ({ ...({age:"",gender:"",edu:"",vision:"",darkMode:"",screenTime:"",proficiency:"",...(user.dem||{})}) }));
  const [saved, setSaved] = useState(false);
  const setF = (k, v) => setDemF(p => ({ ...p, [k]: v }));
  const mkO = opts => [{ v: "", l: "Select…" }, ...opts.map(o => ({ v: o, l: o }))];
  const demReady = DEM_FIELDS.every(field => demF[field.k]);

  const handleSaveDem = () => {
    const upd = { ...user, dem: demF };
    db.save(upd); onSave(upd);
    setEditing(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const lbl = { fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text2, display: "block", marginBottom: 8 };

  return (
    <div style={{ padding: `${L.spXl}px ${L.spLg}px`, fontFamily: L.font }} className="au">
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Account</div>
        <h1 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: 0, letterSpacing: -.5 }}>My Profile</h1>
      </div>

      {/* ── Personal Information ── */}
      <Card u={u} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: editing ? L.spLg : (user.dem ? L.spLg : 0) }}>
          <div>
            <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>Personal Information</div>
            <div style={{ fontSize: L.fsXs, color: u.text3, marginTop: 3 }}>Used to personalise your cognitive analysis</div>
          </div>
          <div style={{ display: "flex", gap: L.spSm, alignItems: "center" }}>
            {saved && <span style={{ fontSize: L.fsSm, color: u.green }}>✓ Saved</span>}
            <Btn u={u} v={editing ? "ghost" : "subtle"} sm onClick={() => { setEditing(e => !e); setSaved(false); }}>
              {editing ? "Cancel" : user.dem ? "Edit" : "Add Info"}
            </Btn>
          </div>
        </div>

        {!editing && user.dem && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
            {DEM_FIELDS.map(field => (
              <div key={field.k} style={{ padding: `${L.spSm}px ${L.spMd}px`, background: u.fill, borderRadius: R.md, border: `1px solid ${u.border}` }}>
                <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: 4, letterSpacing: .3 }}>{field.l}</div>
                <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text }}>{user.dem[field.k] || "—"}</div>
              </div>
            ))}
          </div>
        )}

        {!editing && !user.dem && (
          <div style={{ textAlign: "center", padding: `${L.spMd}px`, color: u.text3, fontSize: L.fsSm }}>
            No profile information yet. Click <strong style={{ color: u.accent }}>"Add Info"</strong> to complete your profile.
          </div>
        )}

        {editing && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: L.spMd, marginBottom: L.spMd }}>
              {DEM_FIELDS.map(field => (
                <div key={field.k} style={field.k === "age" ? {} : {}}>
                  <label style={lbl}>{field.l}</label>
                  {field.type === "number"
                    ? <Inp u={u} type="number" value={demF[field.k]} onChange={e => setF(field.k, e.target.value)} placeholder="Your age" />
                    : <Sel u={u} value={demF[field.k]} onChange={v => setF(field.k, v)} opts={mkO(field.opts)} />
                  }
                </div>
              ))}
            </div>
            <Btn u={u} v="grad" onClick={handleSaveDem} disabled={!demReady} full>Save Changes →</Btn>
          </div>
        )}
      </Card>

      {/* ── No experiment data yet placeholder ── */}
    </div>
  );
}

// ─── PATTERNS TAB ────────────────────────────────────────────────────────────────
function PatternsTab({ user, u }) {
  const stats = useMemo(() => computeStats(user), [user]);

  if (!stats) return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Results" title="Cognitive Patterns" />
      <EmptyState u={u} icon="🔬" title="No data yet" body="Complete the experiment to unlock your cognitive performance profile." />
    </div>
  );

  const dims = [{ l:"Attention", v:stats.cog.attention||0 },{ l:"Inhibition", v:stats.cog.inhibition||0 },{ l:"Analysis", v:stats.cog.analysis||0 },{ l:"Reading", v:stats.cog.reading||0 },{ l:"Decision", v:stats.cog.decision||0 },{ l:"Precision", v:stats.cog.precision||0 },{ l:"Memory", v:stats.cog.memory||0 },{ l:"Navigation", v:stats.cog.navigation||0 }];

  return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }} className="au">
      <SectionHdr u={u} eyebrow="Results" title="Cognitive Patterns" sub="Performance across all tasks and themes." />

      {/* Best theme + radar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:L.spMd, marginBottom:20, alignItems:"start" }}>
        <Card u={u} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:L.spLg }}>
          <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text, marginBottom:L.spMd }}>Cognitive Radar</div>
          <Radar u={u} dims={dims} size={190} />
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:L.spMd }}>
          <Card u={u} style={{ padding:L.spMd, background:u.gradSoft, border:`1px solid ${u.accent}20` }}>
            <div style={{ fontSize:L.fsXs, color:u.accent, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Best Theme for You</div>
            <div style={{ fontSize:L.fsLg, fontWeight:L.fwBold, color:u.text, textTransform:"capitalize" }}>{stats.betterTheme} Mode</div>
            <div style={{ fontSize:L.fsSm, color:u.text2, marginTop:4 }}>Based on accuracy, speed, errors, workload, eye strain, fatigue, comfort and satisfaction</div>
          </Card>
          <Card u={u} style={{ padding:L.spLg }}>
            <HBar u={u} data={dims.map((d,i) => ({ l:d.l, v:d.v*100, c:u.chart[i%u.chart.length], fmt:fmtPct(d.v) }))} />
          </Card>
        </div>
      </div>

      {/* Per-task grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
        {CFG.tasks.map((tid,i) => {
          const tp = stats.tperf[tid];
          return (
            <Card key={tid} u={u} style={{ padding:L.spMd }}>
              <div style={{ fontSize:L.fsXs, color:u.text3, marginBottom:6 }}>{CFG.TL[tid]}</div>
              <div style={{ fontSize:L.fsXl, fontWeight:L.fwBold, color:u.chart[i%u.chart.length] }}>{tp.n ? fmtPct(tp.acc) : "—"}</div>
              {tp.rt && <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:3 }}>RT: {fmtMs(tp.rt)}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── VISUAL COMFORT TAB ───────────────────────────────────────────────────────────
function VisualComfortTab({ user, u }) {
  const exps   = user.experiments || [];
  const dkC    = exps.find(e => e.theme === "dark")?.comfort;
  const ltC    = exps.find(e => e.theme === "light")?.comfort;
  const hasData = dkC || ltC;

  const COMFORT_DIMS = [
    { key:"visualComfort", label:"Visual Comfort",  anchor1:"Very Uncomfortable", anchor2:"Very Comfortable",   icon:"👁",  higherBetter:true  },
    { key:"eyeStrain",     label:"Eye Strain",      anchor1:"No Strain at all",   anchor2:"Severe Strain",       icon:"😣",  higherBetter:false },
    { key:"fatigue",       label:"Mental Fatigue",  anchor1:"Not fatigued",       anchor2:"Extremely Fatigued",  icon:"🧠",  higherBetter:false },
    { key:"satisfaction",  label:"Satisfaction",    anchor1:"Very Dissatisfied",  anchor2:"Very Satisfied",      icon:"⭐",  higherBetter:true  },
  ];

  const LikertRow = ({ value, color }) => (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5,6,7].map(n => {
        const active = value != null && n === Math.round(value);
        return (
          <div key={n} style={{ flex:1, height:40, borderRadius:R.sm, display:"flex", alignItems:"center", justifyContent:"center", fontSize:L.fsSm, fontWeight:active?L.fwBold:L.fwNorm, transition:"all .2s", background:active?color:u.fill, border:`1px solid ${active?color:u.border}`, color:active?"#fff":u.text3 }}>
            {n}
          </div>
        );
      })}
    </div>
  );

  const SectionHeader = ({ title, sub }) => (
    <div style={{ marginBottom:L.spLg }}>
      <div style={{ fontSize:L.fsBase, fontWeight:L.fwBold, color:u.text }}>{title}</div>
      {sub && <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:3 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }} className="au">
      <SectionHdr u={u} eyebrow="Post-Phase Survey" title="Comfort Ratings" sub="Self-reported ratings collected after completing each interface phase. Scale: 1 (low) → 7 (high)." />

      {!hasData ? (
        <EmptyState u={u} icon="📋" title="No survey data yet" body="Comfort ratings are collected at the end of each experiment phase." />
      ) : (
        <Card u={u} style={{ padding:L.spLg }}>
          <SectionHeader title="Post-Phase Comfort Survey" sub="Collected after each interface phase · Scale: 1 (low) → 7 (high)" />

          {/* Column headers */}
          <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 1fr", gap:L.spMd, marginBottom:L.spMd }}>
            <div />
            {[{ label:"🌙 Dark Mode", color:u.accent2 },{ label:"☀️ Light Mode", color:u.gold }].map(({ label, color }) => (
              <div key={label} style={{ textAlign:"center", padding:"6px 12px", borderRadius:R.md, background:`${color}10`, border:`1px solid ${color}28` }}>
                <span style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Likert rows */}
          <div style={{ display:"flex", flexDirection:"column", gap:L.spXl }}>
            {COMFORT_DIMS.map(({ key, label, icon, anchor1, anchor2, higherBetter }) => {
              const dk = dkC?.[key], lt = ltC?.[key];
              const dkBetter = dk!=null && lt!=null && (higherBetter ? dk>lt : dk<lt);
              const ltBetter = dk!=null && lt!=null && (higherBetter ? lt>dk : lt<dk);
              return (
                <div key={key}>
                  <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 1fr", gap:L.spMd, alignItems:"start" }}>
                    <div style={{ paddingTop:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                        <span style={{ fontSize:16 }}>{icon}</span>
                        <span style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{label}</span>
                      </div>
                      <div style={{ fontSize:L.fsXs, color:u.text3, lineHeight:1.4 }}>{anchor1} →<br/>{anchor2}</div>
                    </div>
                    {[{ value:dk, color:u.accent2, better:dkBetter },{ value:lt, color:u.gold, better:ltBetter }].map(({ value, color, better }, i) => (
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:L.spSm }}>
                          <span style={{ fontSize:L.fsXs, color, fontWeight:L.fwSemi }}>Score: {value??"-"}/7</span>
                          {better && <span style={{ fontSize:L.fsXs, color:u.green, fontWeight:L.fwSemi }}>✓ Better</span>}
                        </div>
                        <LikertRow value={value} color={color} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginLeft:176, marginTop:L.spSm, gap:L.spMd }}>
                    {[0,1].map(i => (
                      <div key={i} style={{ flex:1, display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:L.fsXs, color:u.text3 }}>1 — {anchor1}</span>
                        <span style={{ fontSize:L.fsXs, color:u.text3 }}>7 — {anchor2}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderBottom:`1px solid ${u.border}`, marginTop:L.spMd }} />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
// ─── OBJECTIVE TAB ────────────────────────────────────────────────────────────────
function ObjectiveTab({ user, u }) {
  const stats = useMemo(() => computeStats(user), [user]);

  if (!stats) return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Objective Measures" title="Performance Evaluation" />
      <EmptyState u={u} icon="📊" title="No data yet" body="Complete the experiment to see your objective performance metrics." />
    </div>
  );

  const thS = { padding:"8px 12px", fontSize:L.fsXs, fontWeight:L.fwSemi, color:u.text3, textTransform:"uppercase", letterSpacing:.4, borderBottom:`1px solid ${u.border}`, textAlign:"left" };
  const tdS = (c) => ({ padding:"9px 12px", fontSize:L.fsSm, borderBottom:`1px solid ${u.border}`, color:c||u.text2 });

  return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }} className="au">
      <SectionHdr u={u} eyebrow="Objective Measures" title="Performance Evaluation" sub="Metrics automatically recorded during the experiment — accuracy, speed, and errors." />

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:L.spMd, marginBottom:24 }}>
        {[
          { label:"Dark Accuracy",  value:fmtPct(stats.accDk),  sub:"proportion correct",  c:u.accent2 },
          { label:"Light Accuracy", value:fmtPct(stats.accLt),  sub:"proportion correct",  c:u.gold    },
          { label:"Dark RT",        value:fmtMs(stats.rtDk),    sub:"mean response time",  c:u.accent2 },
          { label:"Light RT",       value:fmtMs(stats.rtLt),    sub:"mean response time",  c:u.gold    },
          { label:"Best Theme",     value:stats.betterTheme,    sub:"overall performance", c:stats.betterTheme==="dark"?u.accent2:u.gold },
          { label:"Sessions",       value:stats.n,              sub:"phases completed",    c:u.green   },
        ].map(({ label, value, sub, c }) => (
          <Card key={label} u={u} style={{ padding:L.spMd, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:c }} />
            <div style={{ fontSize:L.fsXs, color:u.text3, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:L.fsXl, fontWeight:L.fwBold, color:c, textTransform:"capitalize" }}>{value||"—"}</div>
            <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:4 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Dark vs Light comparison */}
      <Card u={u} style={{ padding:0, marginBottom:20, overflow:"hidden" }}>
        <div style={{ padding:`${L.spMd}px ${L.spLg}px`, borderBottom:`1px solid ${u.border}` }}>
          <div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text }}>Dark vs Light Comparison</div>
          <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:3 }}>Objective performance across both theme conditions</div>
        </div>
        <div className="tbl-wrap">
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={thS}>Metric</th>
              <th style={{ ...thS, color:u.accent2 }}>🌙 Dark Mode</th>
              <th style={{ ...thS, color:u.gold }}>☀️ Light Mode</th>
              <th style={thS}>Difference</th>
              <th style={thS}>Better</th>
            </tr>
          </thead>
          <tbody>
            {[
              { metric:"Accuracy",      dk:stats.accDk,       lt:stats.accLt,       fmt:fmtPct,               higherBetter:true  },
              { metric:"Response Time", dk:stats.rtDk,        lt:stats.rtLt,        fmt:fmtMs,                higherBetter:false },
              { metric:"Error Count",   dk:stats.errDk,       lt:stats.errLt,       fmt:v=>v!=null?Math.round(v)+"":"—", higherBetter:false },
              { metric:"NASA Workload", dk:stats.nasaTotalDk, lt:stats.nasaTotalLt, fmt:v=>v!=null?v.toFixed(1):"—",     higherBetter:false },
              { metric:"Mental Demand", dk:stats.efDk,        lt:stats.efLt,        fmt:v=>fmt(v,1),          higherBetter:false },
            ].map(({ metric, dk, lt, fmt:f, higherBetter }) => {
              const diff = dk!=null && lt!=null ? dk-lt : null;
              const dkBetter = diff!=null && (higherBetter ? diff>0 : diff<0);
              const ltBetter = diff!=null && (higherBetter ? diff<0 : diff>0);
              return (
                <tr key={metric}>
                  <td style={tdS(u.text)}>{metric}</td>
                  <td style={tdS(u.accent2)}>{dk!=null?f(dk):"—"}</td>
                  <td style={tdS(u.gold)}>{lt!=null?f(lt):"—"}</td>
                  <td style={tdS(diff!=null?(diff>0?u.green:u.red):u.text3)}>{diff!=null?(diff>0?"+":"")+f(diff):"—"}</td>
                  <td style={{ padding:"9px 12px", borderBottom:`1px solid ${u.border}` }}>
                    {dkBetter && <span style={{ fontSize:L.fsXs, padding:"2px 8px", borderRadius:R.pill, background:`${u.accent2}18`, color:u.accent2, border:`1px solid ${u.accent2}28` }}>🌙 Dark</span>}
                    {ltBetter && <span style={{ fontSize:L.fsXs, padding:"2px 8px", borderRadius:R.pill, background:`${u.gold}18`, color:u.gold, border:`1px solid ${u.gold}28` }}>☀️ Light</span>}
                    {!dkBetter && !ltBetter && <span style={{ fontSize:L.fsXs, color:u.text3 }}>Equal</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
      <Card u={u} style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:`${L.spMd}px ${L.spLg}px`, borderBottom:`1px solid ${u.border}` }}>
          <div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text }}>Per-Task Performance</div>
          <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:3 }}>Accuracy and response time for each task type</div>
        </div>
        <div className="tbl-wrap">
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Task","Trials","Accuracy","Response Time","Errors"].map(h=><th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {CFG.tasks.map((tid,i) => {
                const tp = stats.tperf[tid];
                return tp.n ? (
                  <tr key={tid} style={{ background:i%2===0?"transparent":u.fill }}>
                    <td style={{ ...tdS(u.text), fontWeight:L.fwSemi }}>{CFG.TL[tid]}</td>
                    <td style={tdS(u.text3)}>{tp.n}</td>
                    <td style={tdS(u.chart[i%u.chart.length])}>{fmtPct(tp.acc)}</td>
                    <td style={{ ...tdS(u.teal), fontFamily:L.mono }}>{tp.rt?fmtMs(tp.rt):"—"}</td>
                    <td style={tdS(u.text2)}>
                      <div style={{ height:6, background:u.border, borderRadius:3, overflow:"hidden", width:80 }}>
                        <div style={{ height:"100%", width:`${(1-tp.acc)*100}%`, background:tp.acc<0.7?u.red:u.orange, borderRadius:3 }} />
                      </div>
                    </td>
                  </tr>
                ) : null;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── WORKLOAD TAB ─────────────────────────────────────────────────────────────────
function WorkloadTab({ user, u }) {
  const stats    = useMemo(() => computeStats(user), [user]);
  const exps     = user.experiments || [];
  const nasaDkObj = exps.find(e => e.theme === "dark"  && e.nasaTLX)?.nasaTLX;
  const nasaLtObj = exps.find(e => e.theme === "light" && e.nasaTLX)?.nasaTLX;
  const hasData  = !!(nasaDkObj || nasaLtObj);
  const colDk = u.accent2, colLt = u.gold;

  const DIMS = [
    { key:"md", label:"Mental Demand",   desc:"How mentally demanding was the task?",                    lowerBetter:true  },
    { key:"pd", label:"Physical Demand", desc:"How physically demanding was the task?",                   lowerBetter:true  },
    { key:"td", label:"Temporal Demand", desc:"How hurried or rushed was the pace?",                      lowerBetter:true  },
    { key:"pe", label:"Performance",     desc:"How successful were you in accomplishing the task?",       lowerBetter:false },
    { key:"ef", label:"Effort",          desc:"How hard did you have to work to accomplish your level of performance?", lowerBetter:true },
    { key:"fr", label:"Frustration",     desc:"How irritated, stressed or annoyed were you?",             lowerBetter:true  },
  ];

  if (!hasData) return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Self-Report" title="Workload Assessment" />
      <EmptyState u={u} icon="📊" title="No workload data yet" body="Complete both experiment phases to unlock your NASA-TLX results." />
    </div>
  );

  return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }} className="au">
      <SectionHdr u={u} eyebrow="Self-Report" title="Workload Assessment"
        sub="NASA Task Load Index collected after each phase. Scale 1–20. Lower = less workload (except Performance where higher = better)." />

      {/* Total score cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:L.spMd, marginBottom:20 }}>
        {[{ label:"🌙 Dark Mode", nasa:nasaDkObj, color:colDk }, { label:"☀️ Light Mode", nasa:nasaLtObj, color:colLt }].map(({ label, nasa, color }) => (
          <Card key={label} u={u} style={{ padding:L.spLg, textAlign:"center", borderTop:`3px solid ${color}` }}>
            <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text2, marginBottom:8 }}>{label}</div>
            {nasa ? (
              <>
                <div style={{ fontSize:42, fontWeight:L.fwBlack, color, fontFamily:L.mono, lineHeight:1 }}>{nasa.totalScore?.toFixed(1)}</div>
                <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:4 }}>/ 20 overall workload</div>
                <div style={{ height:8, background:u.fill, borderRadius:99, overflow:"hidden", marginTop:L.spMd, border:`1px solid ${u.border}` }}>
                  <div style={{ height:"100%", width:`${((nasa.totalScore||0)/20)*100}%`, background:`linear-gradient(90deg,${u.green},${u.orange},${u.red})`, borderRadius:99, transition:"width .8s" }} />
                </div>
                <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:6 }}>
                  {nasa.totalScore < 7 ? "Low workload" : nasa.totalScore < 13 ? "Moderate workload" : "High workload"}
                </div>
              </>
            ) : <div style={{ color:u.text3, fontSize:L.fsSm }}>Not yet collected</div>}
          </Card>
        ))}
      </div>

      {/* Winner callout */}
      {nasaDkObj && nasaLtObj && (() => {
        const dkLower = nasaDkObj.totalScore < nasaLtObj.totalScore;
        const col = dkLower ? colDk : colLt;
        return (
          <Card u={u} style={{ padding:L.spMd, marginBottom:20, background:u.gradSoft, border:`1px solid ${u.accent}20` }}>
            <div style={{ display:"flex", alignItems:"center", gap:L.spMd }}>
              <span style={{ fontSize:24 }}>{dkLower ? "🌙" : "☀️"}</span>
              <div>
                <div style={{ fontSize:L.fsSm, fontWeight:L.fwBold, color:col }}>{dkLower ? "Dark Mode" : "Light Mode"} caused less cognitive workload</div>
                <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:2 }}>
                  {Math.abs(nasaDkObj.totalScore - nasaLtObj.totalScore).toFixed(1)} point difference · Lower workload means the interface felt easier and more natural
                </div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Per-dimension comparison */}
      <Card u={u} style={{ padding:L.spLg }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px", gap:L.spMd, marginBottom:L.spMd }}>
          <div style={{ fontSize:L.fsXs, color:u.text3, fontWeight:L.fwSemi }}>Dimension</div>
          <div style={{ textAlign:"center", fontSize:L.fsXs, fontWeight:L.fwBold, color:colDk }}>🌙 Dark</div>
          <div style={{ textAlign:"center", fontSize:L.fsXs, fontWeight:L.fwBold, color:colLt }}>☀️ Light</div>
        </div>
        {DIMS.map(({ key, label, desc, lowerBetter }) => {
          const dv = nasaDkObj?.[key] ?? null, lv = nasaLtObj?.[key] ?? null;
          const dkB = dv!=null && lv!=null && (lowerBetter ? dv<lv : dv>lv);
          const ltB = dv!=null && lv!=null && (lowerBetter ? lv<dv : lv>dv);
          return (
            <div key={key} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px", gap:L.spMd, alignItems:"center", padding:`${L.spMd}px 0`, borderBottom:`1px solid ${u.border}` }}>
              <div>
                <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{label}</div>
                <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:2, lineHeight:1.4 }}>{desc}</div>
              </div>
              {[{ v:dv, c:dkB?u.green:colDk, better:dkB }, { v:lv, c:ltB?u.green:colLt, better:ltB }].map((s, i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:L.fwBlack, color:s.v!=null?s.c:u.text3, fontFamily:L.mono, lineHeight:1 }}>{s.v ?? "—"}</div>
                  {s.v!=null && <div style={{ height:4, background:u.fill, borderRadius:99, overflow:"hidden", marginTop:4 }}><div style={{ height:"100%", width:`${(s.v/20)*100}%`, background:s.c, borderRadius:99 }} /></div>}
                  {s.better && <div style={{ fontSize:L.fsXs, color:u.green, marginTop:3 }}>✓</div>}
                </div>
              ))}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function Dashboard({ user, u, onStart, onProfile, onTutorial, onReport }) {
  const stats = useMemo(() => computeStats(user), [user]);
  const recent = (user.experiments || []).slice(-4).reverse();
  const isCompleted = !!(user.completed || (user.experiments || []).length >= 2);
  return (
    <div style={{ padding: `${L.spXl}px ${L.spLg}px`, fontFamily: L.font }} className="au">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Dashboard</div>
        <h1 style={{ fontSize: L.fs2Xl, fontWeight: L.fwBlack, color: u.text, margin: 0, letterSpacing: -1.5 }}>Hi, {user.name.split(" ")[0]} 👋</h1>
        <p style={{ color: u.text2, fontSize: L.fsMd, marginTop: 8 }}>{isCompleted ? "Experiment complete — your data has been saved." : stats ? `${stats.n} session${stats.n !== 1 ? "s" : ""} in progress` : "Ready for your first session?"}</p>
      </div>
      <Card u={u} style={{ padding: 24, marginBottom: 20, background: isCompleted ? u.greenBg : u.gradSoft, border: `1px solid ${isCompleted ? u.green : u.accent}20` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          {isCompleted ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>✅</div>
                <div>
                  <div style={{ fontSize: L.fsXs, color: u.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Experiment Complete</div>
                  <h3 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: 0 }}>Thank you for participating!</h3>
                  <p style={{ color: u.text2, fontSize: L.fsSm, marginTop: 4 }}>Your personalised report is ready to download.</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: L.spSm, alignItems: "flex-end" }}>
                <Btn u={u} v="grad" onClick={onReport}>⬇ Download My Report</Btn>
                <Badge u={u} color={u.green}>Locked — 1 attempt only</Badge>
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={{ fontSize: L.fsXs, color: u.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Start Session</div>
                <h3 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: 0 }}>Dark vs Light Mode Experiment</h3>
                <p style={{ color: u.text2, fontSize: L.fsSm, marginTop: 4 }}>8 tasks · 2 phases · ~20 min · Response time measured · One attempt only</p>
              </div>
              <div style={{ display: "flex", gap: L.spSm, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Btn u={u} v="ghost" onClick={onTutorial}>📖 Tutorial</Btn>
                <Btn u={u} v="grad" onClick={onStart}>Begin Experiment →</Btn>
              </div>
            </>
          )}
        </div>
      </Card>
      {stats ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: L.spMd, marginBottom: 20 }}>
            {[{ l:"Best Theme", v:stats.betterTheme, c:stats.betterTheme==="dark"?u.accent2:u.gold }, { l:"Dark Accuracy", v:fmtPct(stats.accDk), c:u.teal }, { l:"Light Accuracy", v:fmtPct(stats.accLt), c:u.orange }, { l:"Sessions", v:stats.n, c:u.green }].map(({ l, v, c }) => (
              <Card key={l} u={u} style={{ padding: L.spMd, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c }} />
                <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: .8, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: c, letterSpacing: -.5, textTransform: "capitalize" }}>{v}</div>
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: L.spMd, marginBottom: 20 }}>
            <Card u={u} style={{ padding: L.spLg, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Cognitive Profile</div>
              <Radar u={u} dims={[{ l:"Attention", v:stats.cog.attention||0 }, { l:"Inhibition", v:stats.cog.inhibition||0 }, { l:"Analysis", v:stats.cog.analysis||0 }, { l:"Reading", v:stats.cog.reading||0 }, { l:"Decision", v:stats.cog.decision||0 }, { l:"Precision", v:stats.cog.precision||0 }, { l:"Memory", v:stats.cog.memory||0 }, { l:"Navigation", v:stats.cog.navigation||0 }]} size={160} />
            </Card>
            <Card u={u} style={{ padding: L.spLg }}>
              <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Dark vs Light Comparison</div>
              <div style={{ display: "flex", flexDirection: "column", gap: L.spSm }}>
                {[{ l:"Accuracy", d:fmtPct(stats.accDk), li:fmtPct(stats.accLt) }, { l:"Mental Effort", d:fmt(stats.efDk), li:fmt(stats.efLt) }, { l:"Avg RT", d:fmtMs(stats.rtDk), li:fmtMs(stats.rtLt) }].map(({ l, d, li }) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:L.spSm }}>
                    <div style={{ fontSize: L.fsXs, color: u.text3, width:80, flexShrink:0 }}>{l}</div>
                    <div style={{ display:"flex", gap:6, flex:1 }}>
                      {[{ lbl:"🌙", val:d, c:u.accent2 }, { lbl:"☀️", val:li, c:u.gold }].map(({ lbl, val, c }) => (
                        <div key={lbl} style={{ flex:1, padding: "5px 6px", borderRadius: R.md, background: `${c}12`, border: `1px solid ${c}22`, textAlign: "center" }}>
                          <div style={{ fontSize: L.fsXs, color: u.text3 }}>{lbl}</div>
                          <div style={{ fontSize: L.fsSm, fontWeight: L.fwBold, color: c }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {(stats.comfortDk?.vc || stats.comfortLt?.vc) ? (
                <>
                  <div style={{ borderTop: `1px solid ${u.border}`, paddingTop: L.spMd, marginTop: L.spSm }}>
                    <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: .5, textTransform: "uppercase", marginBottom: 10 }}>Perceived Comfort & Fatigue</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 8 }}>
                      {[{ l:"Visual Comfort", dk:stats.comfortDk.vc, lt:stats.comfortLt.vc }, { l:"Eye Strain", dk:stats.comfortDk.es, lt:stats.comfortLt.es }, { l:"Fatigue", dk:stats.comfortDk.fa, lt:stats.comfortLt.fa }, { l:"Satisfaction", dk:stats.comfortDk.sa, lt:stats.comfortLt.sa }].map(({ l, dk, lt }) => (
                        <div key={l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: 6, lineHeight: 1.3 }}>{l}</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[{ lbl:"🌙", val:dk, c:u.accent2 }, { lbl:"☀️", val:lt, c:u.gold }].map(({ lbl, val, c }) => (
                              <div key={lbl} style={{ flex:1, padding: "5px 2px", borderRadius: R.sm, background: `${c}10`, border: `1px solid ${c}20`, textAlign: "center" }}>
                                <div style={{ fontSize: L.fsXs, color: u.text3 }}>{lbl}</div>
                                <div style={{ fontSize: L.fsSm, fontWeight: L.fwBold, color: c }}>{val ? fmt(val, 1) : "—"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </Card>
          </div>
        </>
      ) : (
        <Card u={u} style={{ padding: L.spXl, textAlign: "center" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>🔬</div>
          <h3 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px" }}>No data yet</h3>
          <p style={{ color: u.text2, fontSize: L.fsSm }}>Complete your first session to see your cognitive profile.</p>
        </Card>
      )}
      {recent.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: 12 }}>Recent Sessions</div>
          {recent.map((sess, i) => {
            const allT = (sess.tasks || []).flatMap(t => t.trials || []);
            const ac = avg(allT.map(t => t.acc || 0));
            const rts = allT.filter(t => t.rt).map(t => t.rt);
            return (
              <Card key={i} u={u} style={{ marginBottom: 8, padding: `${L.spMd}px ${L.spLg}px` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Badge u={u} color={sess.theme === "dark" ? u.accent2 : u.gold}>{sess.theme}</Badge>
                    <span style={{ fontSize: L.fsSm, color: u.text2 }}>Phase {sess.phase}</span>
                    <span style={{ fontSize: L.fsSm, color: u.text3 }}>{allT.length} trials</span>
                  </div>
                  <div style={{ display: "flex", gap: L.spLg }}>
                    <span style={{ fontSize: L.fsSm, color: u.text3 }}>Acc: <strong style={{ color: u.green }}>{fmtPct(ac)}</strong></span>
                    {rts.length > 0 && <span style={{ fontSize: L.fsSm, color: u.text3 }}>RT: <strong style={{ color: u.teal }}>{fmtMs(avg(rts))}</strong></span>}
                    <span style={{ fontSize: L.fsSm, color: u.text3 }}>{new Date(sess.ts || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────────
// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────────
const ThemeToggle = ({ uiDark, onToggle, u }) => (
  <button onClick={onToggle} title={`Switch to ${uiDark ? "light" : "dark"} mode`}
    style={{ display:"flex", alignItems:"center", gap:6, height:30, padding:"0 12px", borderRadius:R.pill, border:`1px solid ${u.border}`, background:u.fill, cursor:"pointer", fontFamily:L.font, color:u.text2, fontSize:L.fsSm, transition:"all .2s", flexShrink:0 }}>
    <span style={{ fontSize:15 }}>{uiDark ? "☀️" : "🌙"}</span>
    <span style={{ fontSize:L.fsXs, fontWeight:L.fwSemi }}>{uiDark ? "Light" : "Dark"}</span>
  </button>
);

// ─── SHARED LAYOUT COMPONENTS ────────────────────────────────────────────────────
const SectionHdr = ({ eyebrow, title, sub, action, u }) => (
  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
    <div>
      {eyebrow && <div style={{ fontSize:L.fsXs, color:u.text3, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>{eyebrow}</div>}
      <h1 style={{ fontSize:L.fsXl, fontWeight:L.fwBold, color:u.text, margin:0, letterSpacing:-.5 }}>{title}</h1>
      {sub && <p style={{ color:u.text2, fontSize:L.fsSm, margin:"6px 0 0", lineHeight:1.6, maxWidth:560 }}>{sub}</p>}
    </div>
    {action && <div style={{ flexShrink:0 }}>{action}</div>}
  </div>
);

const EmptyState = ({ icon="📭", title, body, action, u }) => (
  <Card u={u} style={{ padding:L.spXl, textAlign:"center" }}>
    <div style={{ fontSize:38, marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:L.fsLg, fontWeight:L.fwBold, color:u.text, marginBottom:8 }}>{title}</div>
    {body && <p style={{ color:u.text2, fontSize:L.fsSm, lineHeight:1.65, maxWidth:360, margin:"0 auto" }}>{body}</p>}
    {action && <div style={{ marginTop:L.spLg }}>{action}</div>}
  </Card>
);


function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { mobile: w < 640, tablet: w < 1024, w };
}

function AppShell({ user, u, uiDark, onToggleTheme, tab, setTab, onLogout, children }) {
  const { mobile } = useBreakpoint();
  const nav = [
    { id:"dashboard", l:"Dashboard",  icon:"🏠" },
    { id:"profile",   l:"My Profile", icon:"👤" },
    { id:"patterns",  l:"Patterns",   icon:"📊" },
    { id:"comfort",   l:"Survey",     icon:"📋" },
    { id:"objective", l:"Performance",icon:"⚡" },
    { id:"workload",  l:"Workload",   icon:"🧠" },
  ];

  if (mobile) return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:u.bg, fontFamily:L.font }}>
      {/* Top bar */}
      <div style={{ position:"sticky", top:0, zIndex:100, height:52, background:u.sidebar, borderBottom:`1px solid ${u.sidebarBorder}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🧠</div>
          <span style={{ fontSize:L.fsMd, fontWeight:L.fwBold, color:u.text, letterSpacing:-.3 }}>CogBench</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <ThemeToggle uiDark={uiDark} onToggle={onToggleTheme} u={u} />
          <button onClick={onLogout} style={{ height:28, padding:"0 10px", borderRadius:R.md, border:`1px solid ${u.red}40`, background:`${u.red}08`, color:u.red, fontFamily:L.font, cursor:"pointer", fontSize:L.fsXs, fontWeight:L.fwSemi }}>Sign Out</button>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:64 }}>{children}</div>
      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:60, background:u.sidebar, borderTop:`1px solid ${u.sidebarBorder}`, display:"flex", zIndex:100 }}>
        {nav.map(({ id, l, icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex:1, border:"none", background:"transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, cursor:"pointer", borderTop:`2px solid ${active?u.accent:"transparent"}`, transition:"all .15s" }}>
              <span style={{ fontSize:17 }}>{icon}</span>
              <span style={{ fontSize:9, fontWeight:active?L.fwBold:L.fwNorm, color:active?u.accent:u.text3, letterSpacing:.2 }}>{l.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Desktop layout — sidebar
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:u.bg, fontFamily:L.font }}>
      <div style={{ width:230, height:"100vh", background:u.sidebar, borderRight:`1px solid ${u.sidebarBorder}`, display:"flex", flexDirection:"column", padding:18, position:"sticky", top:0, flexShrink:0 }}>
        <div style={{ marginBottom:28, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🧠</div>
          <div>
            <div style={{ fontSize:L.fsMd, fontWeight:L.fwBold, color:u.text, letterSpacing:-.3 }}>CogBench</div>
            <div style={{ fontSize:L.fsXs, color:u.text3 }}>HCI Study</div>
          </div>
        </div>
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
          {nav.map(({ id, l }) => (
            <button key={id} onClick={() => setTab(id)} style={{ height:36, borderRadius:R.md, border:"none", background:tab===id?`${u.accent}14`:"transparent", color:tab===id?u.accent:u.text2, fontWeight:tab===id?L.fwSemi:L.fwNorm, textAlign:"left", padding:"0 11px", fontFamily:L.font, cursor:"pointer", fontSize:L.fsBase, transition:"all .15s" }}>{l}</button>
          ))}
        </nav>
        <div style={{ borderTop:`1px solid ${u.border}`, paddingTop:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:L.fwBold, color:"#fff", flexShrink:0 }}>{user.name.slice(0,2).toUpperCase()}</div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:L.fsXs, color:u.text3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <ThemeToggle uiDark={uiDark} onToggle={onToggleTheme} u={u} />
          </div>
          <button onClick={onLogout} style={{ width:"100%", height:32, borderRadius:R.md, border:`1px solid ${u.red}40`, background:`${u.red}08`, color:u.red, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, fontWeight:L.fwSemi }}>Sign Out</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", minWidth:0 }}>
        <div style={{ width:"100%" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────────
// ─── ANALYSIS TAB ────────────────────────────────────────────────────────────────
function AnalysisTab({ u, users }) {
  const [res, setRes] = useState(null);
  useEffect(() => { setRes(computeAnalysis(users)); }, [users]);

  if (!res) return <div style={{ padding: L.spXl, color: u.text3, fontFamily: L.font }}>Computing…</div>;

  if (res.insufficient) return (
    <div className="au">
      <h1 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "0 0 16px" }}>Analysis</h1>
      <Card u={u} style={{ padding: L.spXl, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: L.fsLg, fontWeight: L.fwSemi, color: u.text, marginBottom: 8 }}>Insufficient Data</div>
        <p style={{ color: u.text2, fontSize: L.fsSm }}>At least <strong style={{ color: u.accent }}>2 participants</strong> with complete paired data (both phases) required. Currently: <strong>{res.n} valid</strong>.</p>
      </Card>
    </div>
  );

  const dk = u.accent2, lt = u.gold;
  const sz = res.szLabel, cb = res.counterbalance;
  const fv = v => v != null ? (Math.abs(v) < 10 ? v.toFixed(3) : Math.round(v)) : "—";
  const pct = (a, b) => (a != null && b != null && b !== 0) ? `${((a - b) / Math.abs(b) * 100).toFixed(1)}%` : "—";
  const thS = { padding: "7px 10px", fontSize: L.fsXs, fontWeight: L.fwSemi, color: u.text3, textTransform: "uppercase", letterSpacing: .4, borderBottom: `1px solid ${u.border}`, textAlign: "left" };
  const tdS = (c) => ({ padding: "7px 10px", fontSize: L.fsSm, borderBottom: `1px solid ${u.border}`, color: c || u.text2 });
  const dColor = d => { if (!d) return u.text3; const a = Math.abs(d); return a < 0.2 ? u.text3 : a < 0.5 ? u.teal : a < 0.8 ? u.orange : u.green; };

  const TEST_ROWS = [
    { k:"acc",    l:"Accuracy (0–1)" },
    { k:"tt",     l:"Completion Time (ms)" },
    { k:"rt",     l:"Response Time (ms)" },
    { k:"err",    l:"Error Count" },
    { k:"nasa",   l:"NASA-TLX Score" },
    { k:"nasFR",  l:"NASA Frustration" },
    { k:"nasaMD", l:"NASA Mental Demand" },
    { k:"vc",     l:"Visual Comfort" },
    { k:"es",     l:"Eye Strain" },
    { k:"fa",     l:"Fatigue" },
    { k:"sa",     l:"Satisfaction" },
  ];

  return (
    <div className="au" style={{ fontFamily: L.font }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "0 0 6px" }}>Analysis</h1>
        <div style={{ display: "flex", gap: L.spSm, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: L.fsSm, color: u.text2 }}>{res.n} valid participants · {res.pairs.length} complete pairs</span>
          <span style={{ padding: "2px 10px", borderRadius: R.pill, fontSize: L.fsXs, fontWeight: L.fwBold, background: `${u[sz.c]}18`, color: u[sz.c], border: `1px solid ${u[sz.c]}30` }}>{sz.l} Sample</span>
          {sz.preliminary && <span style={{ padding: "2px 10px", borderRadius: R.pill, fontSize: L.fsXs, fontWeight: L.fwBold, background: `${u.orange}18`, color: u.orange, border: `1px solid ${u.orange}30` }}>⚠ PRELIMINARY</span>}
        </div>
        <p style={{ fontSize: L.fsSm, color: u.text3, marginTop: 6, lineHeight: 1.6 }}>{sz.note}</p>
      </div>

      {/* ── Demographics Summary ── */}
      {res.demoSummary && (() => {
        const dm = res.demoSummary;
        const FreqBar = ({ rows, color }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map(({ l, n, pct }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: L.fsXs, color: u.text2, width: 170, flexShrink: 0, lineHeight: 1.3 }}>{l}</span>
                <div style={{ flex: 1, height: 16, background: u.fill, borderRadius: 99, overflow: "hidden", border: `1px solid ${u.border}` }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color || u.accent, borderRadius: 99, transition: "width .7s" }} />
                </div>
                <span style={{ fontSize: L.fsXs, color: u.text2, width: 48, textAlign: "right", fontFamily: L.mono }}>{pct}%</span>
                <span style={{ fontSize: L.fsXs, color: u.text3, width: 24 }}>({n})</span>
              </div>
            ))}
          </div>
        );
        return (
          <Card u={u} style={{ padding: L.spLg, marginBottom: 16 }}>
            <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text, marginBottom: 4 }}>Sample Demographics</div>
            <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spLg }}>N = {dm.n} participants with complete experimental data</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:L.spXl }}>
              <div>
                {dm.age && (
                  <div style={{ marginBottom: L.spLg }}>
                    <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Age</div>
                    <div style={{ display: "flex", gap: L.spMd, flexWrap: "wrap" }}>
                      {[{ l:"Mean", v:`${dm.age.mean} yrs` },{ l:"Median", v:`${dm.age.median} yrs` },{ l:"SD", v:`${dm.age.sd}` },{ l:"Range", v:`${dm.age.min}–${dm.age.max}` }].map(({ l, v }) => (
                        <div key={l} style={{ padding: "6px 10px", background: u.fill, borderRadius: R.md, border: `1px solid ${u.border}` }}>
                          <div style={{ fontSize: L.fsXs, color: u.text3 }}>{l}</div>
                          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: L.spLg }}>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Gender</div>
                  <FreqBar rows={dm.gender} color={u.accent} />
                </div>
                <div>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Education Level</div>
                  <FreqBar rows={dm.edu} color={u.teal} />
                </div>
              </div>
              <div>
                <div style={{ marginBottom: L.spLg }}>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Computer Proficiency</div>
                  <FreqBar rows={dm.proficiency} color={u.green} />
                </div>
                <div style={{ marginBottom: L.spLg }}>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Dark Mode Usage</div>
                  <FreqBar rows={dm.darkMode} color={u.accent2} />
                  {(() => {
                    const heavy = dm.darkMode.filter(r => r.l === "Always" || r.l === "Often (daily)").reduce((s, r) => s + r.pct, 0);
                    if (heavy > 0) return <div style={{ fontSize: L.fsXs, color: u.accent2, marginTop: 6 }}>{heavy.toFixed(0)}% of participants reported frequent dark mode use (Often or Always)</div>;
                  })()}
                </div>
                <div>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Daily Screen Time</div>
                  <FreqBar rows={dm.screenTime} color={u.gold} />
                </div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* ── Data Quality ── */}
      {res.issues.length > 0 && (
        <Card u={u} style={{ padding: L.spMd, marginBottom: 16, border: `1px solid ${u.orange}30`, background: `${u.orange}06` }}>
          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.orange, marginBottom: 8 }}>⚠ Data Quality — {res.issues.length} issue{res.issues.length !== 1 ? "s" : ""}</div>
          {res.issues.map((iss, i) => <div key={i} style={{ fontSize: L.fsXs, color: u.text2, display: "flex", gap: 8, marginBottom: 3 }}><span style={{ color: iss.type === "excluded" ? u.red : u.orange, flexShrink: 0 }}>{iss.type === "excluded" ? "Excluded" : "⚠"}</span><span><strong>{iss.name}</strong> — {iss.msg}</span></div>)}
        </Card>
      )}

      {/* ── Counterbalance Validation ── */}
      <Card u={u} style={{ padding: L.spMd, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text }}>Counterbalance Validation</div>
            <div style={{ fontSize: L.fsXs, color: u.text3, marginTop: 3 }}>Dark→Light (DL) vs Light→Dark (LD) group distribution</div>
          </div>
          <div style={{ display: "flex", gap: L.spMd, alignItems: "center" }}>
            {[{ l:"DL Group", v:cb.dl, c:dk }, { l:"LD Group", v:cb.ld, c:lt }].map(({ l, v, c }) => (
              <div key={l} style={{ textAlign: "center", padding: "8px 16px", borderRadius: R.md, background: `${c}12`, border: `1px solid ${c}22` }}>
                <div style={{ fontSize: L.fsXs, color: u.text3 }}>{l}</div>
                <div style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: c }}>{v}</div>
              </div>
            ))}
            <span style={{ padding: "3px 12px", borderRadius: R.pill, fontSize: L.fsSm, fontWeight: L.fwSemi, background: cb.balanced ? `${u.green}14` : `${u.orange}14`, color: cb.balanced ? u.green : u.orange, border: `1px solid ${cb.balanced ? u.green : u.orange}28` }}>
              {cb.balanced ? `✓ Balanced (${cb.ratio})` : `⚠ Imbalanced (${cb.ratio})`}
            </span>
          </div>
        </div>
        {!cb.balanced && <p style={{ fontSize: L.fsXs, color: u.orange, marginTop: 8 }}>Counterbalance imbalance detected. Order effects may confound theme comparisons. Report this as a limitation.</p>}
      </Card>

      {/* ── Descriptive Statistics ── */}
      <Card u={u} style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ padding: `${L.spMd}px ${L.spLg}px`, borderBottom: `1px solid ${u.border}` }}>
          <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>Descriptive Statistics</div>
          <div style={{ fontSize: L.fsXs, color: u.text3, marginTop: 3 }}>Mean · Median · SD · Min · Max by theme condition</div>
        </div>
          <div className="tbl-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thS}>Variable</th>
                <th style={{ ...thS, color: dk }} colSpan={5}>🌙 Dark Mode</th>
                <th style={{ ...thS, color: lt }} colSpan={5}>☀️ Light Mode</th>
                <th style={thS}>Δ Mean</th>
                <th style={thS}>95% CI</th>
              </tr>
              <tr>
                <th style={thS}></th>
                {["Mean","Median","SD","Min","Max","Mean","Median","SD","Min","Max"].map((h, i) => <th key={i} style={{ ...thS, color: i < 5 ? dk : lt }}>{h}</th>)}
                <th style={thS}></th>
                <th style={thS}></th>
              </tr>
            </thead>
            <tbody>
              {TEST_ROWS.map(({ k, l }) => {
                const d = res.desc[k]; if (!d || (!d.dark.n && !d.light.n)) return null;
                const test = res.tests[k];
                const diff = d.dark.mean != null && d.light.mean != null ? d.dark.mean - d.light.mean : null;
                return (
                  <tr key={k}>
                    <td style={tdS(u.text)}>{l}</td>
                    {[d.dark, d.light].map((s, si) => ["mean","median","sd","min","max"].map(m => <td key={si+m} style={tdS(si === 0 ? dk : lt)}>{fv(s[m])}</td>))}
                    <td style={tdS(diff != null ? (diff > 0 ? u.green : u.red) : u.text3)}>{diff != null ? (diff > 0 ? "+" : "") + fv(diff) : "—"}</td>
                    <td style={{ ...tdS(u.text3), fontFamily: L.mono, fontSize: L.fsXs }}>{test?.ci95 ? `[${fv(test.ci95.lower)}, ${fv(test.ci95.upper)}]` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Paired t-Tests ── */}
      <Card u={u} style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ padding: `${L.spMd}px ${L.spLg}px`, borderBottom: `1px solid ${u.border}` }}>
          <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>Paired Sample t-Tests</div>
          <div style={{ fontSize: L.fsXs, color: u.text3, marginTop: 3 }}>Within-subjects Dark vs Light · α = 0.05 · Cohen's d · 95% CI · Normality (Jarque-Bera)</div>
        </div>
          <div className="tbl-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Variable","🌙 Mean","☀️ Mean","Δ Mean","95% CI","t","df","p","d","Effect","JB Norm.","Result"].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {TEST_ROWS.filter(r => res.tests[r.k]).map(({ k, l }) => {
                const t = res.tests[k], d = res.desc[k];
                if (!t) return null;
                const dm = d.dark.mean, lm = d.light.mean;
                const diff = dm != null && lm != null ? dm - lm : null;
                const norm = t.normality;
                return (
                  <tr key={k}>
                    <td style={tdS(u.text)}>{l}</td>
                    <td style={{ ...tdS(dk), fontFamily: L.mono }}>{fv(dm)}</td>
                    <td style={{ ...tdS(lt), fontFamily: L.mono }}>{fv(lm)}</td>
                    <td style={tdS(diff != null ? (diff > 0 ? u.green : u.red) : u.text3)}>{diff != null ? (diff > 0 ? "+" : "") + fv(diff) : "—"}</td>
                    <td style={{ ...tdS(u.text3), fontFamily: L.mono, fontSize: L.fsXs }}>{t.ci95 ? `[${fv(t.ci95.lower)}, ${fv(t.ci95.upper)}]` : "—"}</td>
                    <td style={{ ...tdS(u.teal), fontFamily: L.mono }}>{t.t}</td>
                    <td style={{ ...tdS(u.text3), fontFamily: L.mono }}>{t.df}</td>
                    <td style={{ ...tdS(t.p < 0.05 ? u.green : u.text2), fontFamily: L.mono }}>{t.p?.toFixed(4)}</td>
                    <td style={{ ...tdS(dColor(t.cohensD)), fontFamily: L.mono, fontWeight: L.fwSemi }}>{t.cohensD != null ? (t.cohensD > 0 ? "+" : "") + t.cohensD : "—"}</td>
                    <td style={tdS(dColor(t.cohensD))}>{t.cohenLabel}</td>
                    <td style={tdS(norm?.tested ? (norm.normal ? u.green : u.orange) : u.text3)}>{norm?.tested ? (norm.normal ? "✓ Normal" : `⚠ p=${norm.p}`) : norm?.note || "—"}</td>
                    <td>
                      <span style={{ padding: "2px 8px", borderRadius: R.pill, fontSize: L.fsXs, fontWeight: L.fwBold, background: t.sig ? `${u.green}18` : u.fill, color: t.sig ? u.green : u.text3, border: `1px solid ${t.sig ? u.green : u.border}22` }}>
                        {t.sig ? "Significant ★" : "Not Significant"}
                      </span>
                      {sz.preliminary && <span style={{ marginLeft: 4, fontSize: L.fsXs, color: u.orange }}>†</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sz.preliminary && <div style={{ padding: `${L.spSm}px ${L.spLg}px`, fontSize: L.fsXs, color: u.orange, borderTop: `1px solid ${u.border}` }}>† Findings marked preliminary due to small sample (n={res.n}). Effect size (d) and CI width are more informative than p-values at this sample size.</div>}
        </div>
      </Card>

      {/* ── Reliability Analysis ── */}
      <Card u={u} style={{ padding: L.spLg, marginBottom: 16 }}>
        <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text, marginBottom: 4 }}>Reliability Analysis — Cronbach's Alpha (α)</div>
        <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spLg }}>Internal consistency of multi-item scales · α ≥ 0.70 = acceptable · Comfort items reverse-scored where applicable (†)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: L.spMd }}>
          {Object.values(res.reliability).map((rel) => {
            const interp = alphaInterp(rel.alpha);
            const barW = rel.alpha != null ? Math.min(100, Math.max(0, rel.alpha * 100)) : 0;
            return (
              <div key={rel.label} style={{ padding: L.spLg, background: u.fill, borderRadius: R.lg, border: `1px solid ${u.border}` }}>
                <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: 4 }}>{rel.label}</div>
                <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spMd }}>k = {rel.items} items · n = {rel.n} participants</div>
                <div style={{ display: "flex", alignItems: "center", gap: L.spMd, marginBottom: L.spSm }}>
                  <div style={{ fontSize: 28, fontWeight: L.fwBold, color: u[interp.col] || u.text3, fontFamily: L.mono, minWidth: 56 }}>{rel.alpha ?? "—"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, background: u.border, borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ height: "100%", width: `${barW}%`, background: u[interp.col] || u.text3, borderRadius: 99, transition: "width .8s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: L.fsXs, color: u.text3 }}>
                      <span>0 — Poor</span><span>0.7 — Acceptable</span><span>1.0</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "8px 12px", borderRadius: R.md, background: `${u[interp.col] || u.text3}12`, border: `1px solid ${u[interp.col] || u.text3}22` }}>
                  <div style={{ fontSize: L.fsXs, fontWeight: L.fwSemi, color: u[interp.col] || u.text3, marginBottom: 2 }}>{interp.label}</div>
                  <div style={{ fontSize: L.fsXs, color: u.text2, lineHeight: 1.5 }}>{interp.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Derived Research Metrics ── */}
      <Card u={u} style={{ padding: L.spLg, marginBottom: 16 }}>
        <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text, marginBottom: 4 }}>Derived Research Metrics</div>
        <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spMd }}>Composite indices computed dynamically from performance, RT, errors, and NASA-TLX · Range 0–1 (higher = better) except CognitiveLoadIndex (lower = better)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: L.spMd }}>
          {res.derivedMetrics.map(m => {
            const t = m.test;
            return (
              <div key={m.key} style={{ padding: L.spMd, background: u.fill, borderRadius: R.lg, border: `1px solid ${u.border}` }}>
                <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>{m.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 8, marginBottom: L.spSm }}>
                  {[{ lbl: "🌙 Dark", v: m.dark.mean, c: dk }, { lbl: "☀️ Light", v: m.light.mean, c: lt }].map(({ lbl, v, c }) => (
                    <div key={lbl} style={{ padding: "6px 8px", borderRadius: R.sm, background: `${c}12`, border: `1px solid ${c}22`, textAlign: "center" }}>
                      <div style={{ fontSize: L.fsXs, color: u.text3 }}>{lbl}</div>
                      <div style={{ fontSize: L.fsMd, fontWeight: L.fwBold, color: c }}>{v != null ? v.toFixed(3) : "—"}</div>
                    </div>
                  ))}
                </div>
                {t && <div style={{ fontSize: L.fsXs, color: t.sig ? u.green : u.text3 }}>
                  {t.sig ? `★ Significant` : "Not significant"} · p={t.p?.toFixed(3)} · d={t.cohensD} ({t.cohenLabel})
                </div>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Visualisations ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: L.spMd, marginBottom: 16 }}>
        <Card u={u} style={{ padding: L.spLg }}>
          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Accuracy by Task — Dark vs Light</div>
          <GroupedBarChart u={u} maxV={1} colors={[dk, lt]}
            groups={res.taskBreak.map(tb => ({ label: tb.label.split(" ")[0], vals: [tb.dark.mean, tb.light.mean] }))} />
        </Card>
        <Card u={u} style={{ padding: L.spLg }}>
          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Accuracy Distribution</div>
          <HistogramChart u={u} xLabel="Accuracy" datasets={[{ label: "Dark", data: res.allAcc.dark, color: dk }, { label: "Light", data: res.allAcc.light, color: lt }]} />
        </Card>
        <Card u={u} style={{ padding: L.spLg }}>
          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Box Plots — Accuracy</div>
          <div style={{ display: "flex", gap: L.spMd, justifyContent: "center" }}>
            <BoxPlotSVG u={u} yLabel="Accuracy" datasets={[{ label: "🌙 Dark", data: res.allAcc.dark, color: dk }, { label: "☀️ Light", data: res.allAcc.light, color: lt }]} />
            <BoxPlotSVG u={u} yLabel="Completion (ms)" datasets={[{ label: "🌙 Dark", data: res.allTT.dark, color: dk }, { label: "☀️ Light", data: res.allTT.light, color: lt }]} />
          </div>
        </Card>
        <Card u={u} style={{ padding: L.spLg }}>
          <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spSm }}>Task-by-Task Accuracy Trend</div>
          <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spMd }}>Fatigue and learning progression across the task sequence</div>
          <TrendLineChart u={u} pairs={res.pairs} metric="acc" />
        </Card>
      </div>

      {/* ── Correlations ── */}
      <Card u={u} style={{ padding: L.spLg, marginBottom: 16 }}>
        <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Correlation Analysis (Pearson r)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: L.spMd }}>
          {res.correlations.map((c, i) => {
            const r = c.r, a = r != null ? Math.abs(r) : null;
            const col = a == null ? u.text3 : a > 0.5 ? u.green : a > 0.3 ? u.teal : u.text3;
            return (
              <div key={i} style={{ padding: L.spMd, background: u.fill, borderRadius: R.lg, border: `1px solid ${u.border}` }}>
                <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: L.spMd }}>{c.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: L.spMd }}>
                  <div style={{ fontSize: 22, fontWeight: L.fwBold, color: col, fontFamily: L.mono, minWidth: 60 }}>{r != null ? (r > 0 ? "+" : "") + r.toFixed(3) : "—"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 5, background: u.border, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: a != null ? `${a * 100}%` : "0%", background: col, borderRadius: 99 }} /></div>
                    <div style={{ fontSize: L.fsXs, color: col, marginTop: 4, fontWeight: L.fwSemi }}>{corrStrength(r)}</div>
                  </div>
                </div>
                {sz.preliminary && <div style={{ fontSize: L.fsXs, color: u.orange, marginTop: 6 }}>⚠ Preliminary — increase n for reliable correlation estimates</div>}
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
// ─── LIVE MONITOR TAB ────────────────────────────────────────────────────────────
function LiveMonitorTab({ u, users }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t=>t+1), 5000); return () => clearInterval(iv); }, []);
  const todayStr = new Date().toDateString();
  const all = db.all().filter(x => x.role !== "admin");
  const activeToday    = all.filter(usr => (usr.experiments||[]).some(e => e.ts && new Date(e.ts).toDateString() === todayStr));
  const inProgress     = activeToday.filter(usr => !usr.completed && (usr.experiments||[]).length < 2);
  const completedToday = activeToday.filter(usr =>  usr.completed || (usr.experiments||[]).length >= 2);
  const updated = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:true });

  return (
    <div className="au" style={{ fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Real-time" title="Live Monitor"
        action={<div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:R.pill, background:`${u.green}12`, border:`1px solid ${u.green}28` }}><div style={{ width:7, height:7, borderRadius:"50%", background:u.green }} /><span style={{ fontSize:L.fsXs, color:u.green, fontWeight:L.fwSemi }}>Live · {updated}</span></div>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:L.spMd, marginBottom:24 }}>
        {[{l:"Active Today",v:activeToday.length,c:u.accent,i:"👥"},{l:"In Progress",v:inProgress.length,c:u.orange,i:"⚡"},{l:"Completed",v:completedToday.length,c:u.green,i:"✓"},{l:"Sessions",v:all.flatMap(x=>(x.experiments||[]).filter(e=>e.ts&&new Date(e.ts).toDateString()===todayStr)).length,c:u.teal,i:"📋"}].map(({l,v,c,i})=>(
          <Card key={l} u={u} style={{ padding:L.spMd, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:c }} />
            <div style={{ fontSize:20, marginBottom:L.spSm }}>{i}</div>
            <div style={{ fontSize:30, fontWeight:L.fwBlack, color:c, fontFamily:L.mono, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:4 }}>{l}</div>
          </Card>
        ))}
      </div>
      {inProgress.length > 0 && <Card u={u} style={{ padding:L.spLg, marginBottom:16 }}><div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text, marginBottom:L.spMd }}>⚡ In Progress</div>{inProgress.map(usr=><div key={usr.id} style={{ display:"flex", alignItems:"center", gap:L.spMd, padding:L.spMd, background:u.fill, borderRadius:R.md, marginBottom:8 }}><div style={{ width:36,height:36,borderRadius:10,background:u.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:L.fwBold,color:"#fff",flexShrink:0 }}>{usr.name.slice(0,2).toUpperCase()}</div><div style={{ flex:1 }}><div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{usr.name}</div><div style={{ fontSize:L.fsXs, color:u.text3 }}>Phase {(usr.experiments||[]).length+1} of 2</div></div><span style={{ fontSize:L.fsXs, padding:"3px 10px", borderRadius:R.pill, background:`${u.orange}18`, color:u.orange, border:`1px solid ${u.orange}30` }}>Active</span></div>)}</Card>}
      {completedToday.length > 0 && <Card u={u} style={{ padding:L.spLg, marginBottom:16 }}><div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text, marginBottom:L.spMd }}>✓ Completed Today</div>{completedToday.map(usr=><div key={usr.id} style={{ display:"flex", alignItems:"center", gap:L.spMd, padding:L.spMd, background:u.fill, borderRadius:R.md, marginBottom:8 }}><div style={{ width:36,height:36,borderRadius:10,background:u.gradSoft,border:`1px solid ${u.green}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:L.fwBold,color:u.green,flexShrink:0 }}>{usr.name.slice(0,2).toUpperCase()}</div><div style={{ flex:1 }}><div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{usr.name}</div><div style={{ fontSize:L.fsXs, color:u.text3 }}>Preferred: {usr.pref||"—"}</div></div><span style={{ fontSize:L.fsXs, padding:"3px 10px", borderRadius:R.pill, background:`${u.green}18`, color:u.green, border:`1px solid ${u.green}28` }}>Done</span></div>)}</Card>}
      {activeToday.length === 0 && <EmptyState u={u} icon="👁" title="No activity today" body="Participants who start or complete the experiment today appear here." />}
    </div>
  );
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────────
function SettingsTab({ u }) {
  const [s, setS] = useState(() => loadSettings());
  const [saved, setSaved] = useState(false);
  const save = () => { saveSettings(s); applySettings(); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { saveSettings(DEFAULT_SETTINGS); setS({ ...DEFAULT_SETTINGS }); applySettings(); };
  const inp = { width:"100%", padding:"9px 12px", borderRadius:R.md, border:`1px solid ${u.border}`, background:u.fill, color:u.text, fontFamily:L.font, fontSize:L.fsSm, outline:"none", boxSizing:"border-box" };

  return (
    <div className="au" style={{ fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Administration" title="Study Settings"
        sub="Configure trial counts and study metadata."
        action={<div style={{ display:"flex", gap:L.spSm }}><Btn u={u} v="ghost" sm onClick={reset}>Reset</Btn><Btn u={u} v="grad" sm onClick={save}>{saved ? "✓ Saved" : "Save"}</Btn></div>}
      />
      <Card u={u} style={{ padding:L.spLg, marginBottom:20 }}>
        <div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text, marginBottom:L.spMd }}>Study Information</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:L.spMd }}>
          {[{k:"studyTitle",l:"Study Title",ph:"Dark vs Light Mode Study"},{k:"researcher",l:"Researcher",ph:"Your name"},{k:"institution",l:"Institution",ph:"University / Lab"},{k:"contactEmail",l:"Contact Email",ph:"email@university.edu"}].map(({k,l,ph})=>(
            <div key={k}><div style={{ fontSize:L.fsXs, color:u.text3, marginBottom:6, fontWeight:L.fwSemi }}>{l}</div><input value={s[k]||""} onChange={e=>setS(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inp} /></div>
          ))}
        </div>
      </Card>
      <Card u={u} style={{ padding:L.spLg, marginBottom:20 }}>
        <div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text, marginBottom:4 }}>Trial Counts Per Task</div>
        <div style={{ fontSize:L.fsSm, color:u.text2, marginBottom:L.spMd }}>Adjust the number of trials per task. Changes apply to new sessions.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:L.spSm }}>
          {CFG.tasks.map(tid => {
            const v = s.trialCounts?.[tid] ?? CFG.TN[tid] ?? 2;
            return (
              <div key={tid} style={{ display:"flex", alignItems:"center", gap:L.spMd, padding:`${L.spSm}px ${L.spMd}px`, background:u.fill, borderRadius:R.md }}>
                <div style={{ flex:1, fontSize:L.fsSm, color:u.text }}>{CFG.TL[tid]||tid}</div>
                <div style={{ display:"flex", alignItems:"center", gap:L.spSm }}>
                  <button onClick={()=>setS(p=>({...p,trialCounts:{...(p.trialCounts||{}),[tid]:Math.max(1,(p.trialCounts?.[tid]??v)-1)}}))} style={{ width:28,height:28,borderRadius:R.sm,border:`1px solid ${u.border}`,background:u.bg,color:u.text,cursor:"pointer",fontSize:16 }}>−</button>
                  <span style={{ width:28,textAlign:"center",fontSize:L.fsBase,fontWeight:L.fwBold,color:u.text,fontFamily:L.mono }}>{v}</span>
                  <button onClick={()=>setS(p=>({...p,trialCounts:{...(p.trialCounts||{}),[tid]:Math.min(20,(p.trialCounts?.[tid]??v)+1)}}))} style={{ width:28,height:28,borderRadius:R.sm,border:`1px solid ${u.border}`,background:u.bg,color:u.text,cursor:"pointer",fontSize:16 }}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── LIMITATIONS TAB ─────────────────────────────────────────────────────────────
function LimitationsTab({ u }) {
  const [active, setActive] = useState(null);

  const CATS = [
    {
      id: "internal", label: "Internal Validity", icon: "🔬",
      color: u.accent, summary: "Factors within the study that may affect result accuracy.",
      items: [
        { title: "Practice & Learning Effects", desc: "Counterbalancing reduces but cannot eliminate carry-over learning between Phase 1 and Phase 2. Familiarity with tasks from the first condition may improve Phase 2 performance independently of theme.", severity: "Moderate" },
        { title: "Fatigue Across Phases", desc: "Cognitive fatigue accumulates across 8 tasks. Phase 2 performance may reflect fatigue rather than theme-specific effects, particularly for later tasks in the sequence.", severity: "Moderate" },
        { title: "Demand Characteristics", desc: "Participants aware of the study aim may adjust behaviour or ratings to match expected outcomes, introducing systematic response bias.", severity: "Low" },
      ]
    },
    {
      id: "external", label: "External Validity", icon: "🌍",
      color: u.teal, summary: "How well findings transfer to real-world contexts.",
      items: [
        { title: "Controlled Environment", desc: "The lab setting eliminates ambient lighting variation, interruptions, and multi-tasking — all present in real usage. Findings may not directly transfer to naturalistic conditions.", severity: "High" },
        { title: "Task Ecological Validity", desc: "Standardised cognitive tasks abstract real interactions. Results may not fully represent the diversity of professional or everyday interface use.", severity: "Moderate" },
        { title: "Sample Representativeness", desc: "The sample likely over-represents students and technology-proficient users. Findings may not generalise to older adults, novice users, or those with visual impairments.", severity: "High" },
        { title: "Short Exposure Duration", desc: "Each theme was experienced for ~15–20 minutes. Long-term adaptation, habituation, and preference formation over days of use cannot be inferred.", severity: "High" },
      ]
    },
    {
      id: "measurement", label: "Measurement", icon: "📐",
      color: u.gold, summary: "Precision and validity of the instruments used.",
      items: [
        { title: "Display & Device Variability", desc: "Monitor size, resolution, brightness, and ambient lighting differed across participants and were not standardised, potentially influencing visual comfort measurements.", severity: "Moderate" },
        { title: "Self-Report Subjectivity", desc: "NASA-TLX and comfort ratings rely on introspection. Individual differences in response tendencies and scale interpretation introduce measurement variance.", severity: "Moderate" },
        { title: "Response Time Confounds", desc: "Recorded RT combines decision latency, motor execution, and rendering time. It cannot be attributed solely to theme-specific cognitive processing.", severity: "Low" },
      ]
    },
    {
      id: "method", label: "Methodology", icon: "⚙️",
      color: u.orange, summary: "Structural limitations of the study design.",
      items: [
        { title: "Single-Session Design", desc: "Both conditions were tested in one visit. Long-term preference formation, habituation, and sustained-use effects remain unexamined.", severity: "Moderate" },
        { title: "Theme Scope", desc: "Only default system light and dark themes were tested. Custom schemes, high-contrast modes, and blue-light filters were excluded.", severity: "Moderate" },
        { title: "Multiple Comparisons", desc: "11 simultaneous t-tests were conducted at α = 0.05 without Bonferroni correction, elevating the risk of Type I error. Effect size and CI width should guide interpretation.", severity: "High" },
        { title: "Normality Assumption", desc: "Paired t-tests assume normally distributed difference scores. With small samples this may not hold; non-parametric alternatives should be considered where Jarque-Bera flags violations.", severity: "Moderate" },
      ]
    },
  ];

  const SEV = {
    High:     { color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.22)" },
    Moderate: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.22)"  },
    Low:      { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)"  },
  };

  const total = CATS.reduce((s, c) => s + c.items.length, 0);
  const highCount = CATS.flatMap(c => c.items).filter(i => i.severity === "High").length;

  return (
    <div className="au" style={{ fontFamily: L.font }}>

      {/* Header */}
      <SectionHdr u={u} eyebrow="Study Methodology" title="Threats to Validity"
        sub="Methodological limitations to acknowledge in the Discussion section of any report based on this data." />

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: L.spMd, marginBottom: 24 }}>
        {CATS.map(cat => (
          <button key={cat.id} onClick={() => setActive(active === cat.id ? null : cat.id)}
            style={{ padding: L.spMd, borderRadius: R.lg, border: `1px solid ${active === cat.id ? cat.color : u.border}`, background: active === cat.id ? `${cat.color}10` : u.fill, cursor: "pointer", textAlign: "left", transition: "all .2s", fontFamily: L.font }}>
            <div style={{ fontSize: 20, marginBottom: L.spSm }}>{cat.icon}</div>
            <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: 4 }}>{cat.label}</div>
            <div style={{ fontSize: L.fsXs, color: u.text3 }}>{cat.items.length} limitation{cat.items.length !== 1 ? "s" : ""}</div>
          </button>
        ))}
      </div>

      {/* Notice banner */}
      <div style={{ display: "flex", alignItems: "center", gap: L.spMd, padding: `${L.spSm}px ${L.spMd}px`, background: `${u.red}0a`, border: `1px solid ${u.red}22`, borderRadius: R.md, marginBottom: 24 }}>
        <span style={{ fontSize: 16 }}>⚠</span>
        <span style={{ fontSize: L.fsSm, color: u.text2 }}><strong style={{ color: u.text }}>{highCount} high-priority</strong> limitations identified across {total} total items — these carry the greatest potential to affect result interpretation.</span>
      </div>

      {/* Limitation cards */}
      {CATS.filter(cat => !active || cat.id === active).map(cat => (
        <div key={cat.id} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: L.spMd }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${cat.color}18`, border: `1px solid ${cat.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{cat.icon}</div>
            <div>
              <div style={{ fontSize: L.fsBase, fontWeight: L.fwBold, color: u.text }}>{cat.label}</div>
              <div style={{ fontSize: L.fsXs, color: u.text3 }}>{cat.summary}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: L.spMd }}>
            {cat.items.map(({ title, desc, severity }) => (
              <div key={title} style={{ padding: L.spLg, background: u.surfaceSolid, borderRadius: R.lg, border: `1px solid ${u.border}`, borderTop: `3px solid ${cat.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: L.spSm }}>
                  <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, lineHeight: 1.4 }}>{title}</div>
                  <span style={{ flexShrink: 0, fontSize: L.fsXs, fontWeight: L.fwBold, padding: "2px 8px", borderRadius: R.pill, color: SEV[severity].color, background: SEV[severity].bg, border: `1px solid ${SEV[severity].border}`, marginTop: 1 }}>{severity}</span>
                </div>
                <div style={{ fontSize: L.fsSm, color: u.text2, lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Severity legend */}
      <div style={{ display: "flex", gap: L.spMd, paddingTop: L.spMd, borderTop: `1px solid ${u.border}`, flexWrap: "wrap" }}>
        <span style={{ fontSize: L.fsXs, color: u.text3, alignSelf: "center", marginRight: 4 }}>Priority:</span>
        {Object.entries(SEV).map(([sev, s]) => (
          <div key={sev} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: L.fsXs, color: u.text2 }}>{sev}</span>
          </div>
        ))}
        <span style={{ fontSize: L.fsXs, color: u.text3, marginLeft: 8 }}>· Click a category card above to filter</span>
      </div>

    </div>
  );
}


// ─── PARTICIPANT HEATMAP ─────────────────────────────────────────────────────────
function ParticipantHeatmap({ u, users }) {
  const complete = users.filter(usr => (usr.experiments || []).length >= 2);
  if (complete.length < 2) return null;
  return (
    <Card u={u} style={{ padding:0, marginBottom:20, overflow:"hidden" }}>
      <div style={{ padding:`${L.spMd}px ${L.spLg}px`, borderBottom:`1px solid ${u.border}` }}>
        <div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text }}>Participant × Task Accuracy</div>
        <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:3 }}>Combined dark + light accuracy · Red → Yellow → Green</div>
      </div>
      <div className="tbl-wrap">
        <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:L.font }}>
          <thead><tr>
            <th style={{ padding:"8px 12px", fontSize:L.fsXs, color:u.text3, textAlign:"left", borderBottom:`1px solid ${u.border}`, fontWeight:L.fwSemi, minWidth:100 }}>Participant</th>
            {CFG.tasks.map(tid=><th key={tid} style={{ padding:"8px 6px", fontSize:L.fsXs, color:u.text3, textAlign:"center", borderBottom:`1px solid ${u.border}`, fontWeight:L.fwSemi, whiteSpace:"nowrap" }}>{(CFG.TL[tid]||tid).split(" ")[0]}</th>)}
            <th style={{ padding:"8px 12px", fontSize:L.fsXs, color:u.text3, textAlign:"center", borderBottom:`1px solid ${u.border}`, fontWeight:L.fwSemi }}>Avg</th>
          </tr></thead>
          <tbody>
            {complete.map((usr,ri)=>{
              const stats=computeStats(usr);
              const accs=CFG.tasks.map(tid=>stats?.tperf[tid]?.acc??null);
              const valid=accs.filter(v=>v!=null);
              const avg2=valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null;
              const hsl=v=>v!=null?`hsl(${Math.round(v*120)},60%,44%)`:u.text3;
              const bg=v=>v!=null?`hsla(${Math.round(v*120)},60%,44%,0.15)`:"transparent";
              return (
                <tr key={usr.id} style={{ borderBottom:`1px solid ${u.border}` }}>
                  <td style={{ padding:"7px 12px", fontSize:L.fsSm, color:u.text }}>{usr.name.split(" ")[0]}</td>
                  {accs.map((acc,ci)=><td key={ci} style={{ padding:"7px 6px", textAlign:"center", background:bg(acc) }}><span style={{ fontSize:L.fsXs, fontWeight:L.fwSemi, color:hsl(acc), fontFamily:L.mono }}>{acc!=null?Math.round(acc*100)+"%":"—"}</span></td>)}
                  <td style={{ padding:"7px 12px", textAlign:"center", fontWeight:L.fwBold, background:bg(avg2) }}><span style={{ fontSize:L.fsSm, color:hsl(avg2), fontFamily:L.mono }}>{avg2!=null?Math.round(avg2*100)+"%":"—"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── REPORT SCREEN ───────────────────────────────────────────────────────────────
function generateInsights(stats, user, nasa, dkC, ltC) {
  const dem = user.dem || {};
  const winner = stats.betterTheme;
  const dkAcc = stats.accDk ?? 0, ltAcc = stats.accLt ?? 0;
  const diff = Math.abs(dkAcc - ltAcc);
  const dkRt = stats.rtDk, ltRt = stats.rtLt;

  // ── Overall summary ──────────────────────────────────────────────────────────
  const strengthLevel = v => v >= 0.85 ? "excellent" : v >= 0.70 ? "good" : v >= 0.55 ? "moderate" : "developing";
  const overallAcc = (dkAcc + ltAcc) / 2;
  const overallLevel = strengthLevel(overallAcc);

  let summary = "";
  if (diff < 0.04) {
    summary = `You performed consistently well across both interface themes, with very little difference between dark and light mode (${Math.round(dkAcc*100)}% vs ${Math.round(ltAcc*100)}% accuracy). This suggests you are a highly adaptable user whose cognitive performance is not strongly influenced by visual theme — a genuinely useful quality for working across different environments and devices.`;
  } else if (winner === "dark") {
    summary = `Your results show a clear preference for dark mode at the cognitive level. You achieved ${Math.round(dkAcc*100)}% accuracy in dark mode compared to ${Math.round(ltAcc*100)}% in light mode — a difference of ${Math.round(diff*100)} percentage points. Dark interfaces appear to support your focus and reduce the cognitive load required to process visual information. This is consistent with research showing that some individuals experience reduced eye strain and improved contrast perception under dark themes.`;
  } else {
    summary = `Your cognitive performance was stronger in light mode. You achieved ${Math.round(ltAcc*100)}% accuracy in light mode compared to ${Math.round(dkAcc*100)}% in dark mode — a gap of ${Math.round(diff*100)} percentage points. Light interfaces appear to enhance your concentration and task processing. This aligns with findings that individuals who primarily work in bright environments often perform better with lighter interface themes.`;
  }

  // ── Speed insight ────────────────────────────────────────────────────────────
  let speedInsight = "";
  if (dkRt && ltRt) {
    const faster = dkRt < ltRt ? "dark" : "light";
    const fasterRt = Math.min(dkRt, ltRt), slowerRt = Math.max(dkRt, ltRt);
    const rtDiff = Math.round(slowerRt - fasterRt);
    if (rtDiff > 50) {
      speedInsight = `You responded ${rtDiff}ms faster on average in ${faster} mode (${Math.round(fasterRt)}ms vs ${Math.round(slowerRt)}ms). While this may seem small, over hundreds of interactions in a workday, faster response times translate to meaningfully reduced mental effort and greater efficiency.`;
    } else {
      speedInsight = `Your response speed was similar across both themes (${Math.round(dkRt)}ms dark vs ${Math.round(ltRt)}ms light), suggesting that theme has minimal effect on how quickly you process and respond to information.`;
    }
  }

  // ── Task-level insights ──────────────────────────────────────────────────────
  const taskInsights = {};
  const taskDescriptions = {
    visual_search:  { name:"Visual Search",      what:"your ability to locate a target among distractors — a skill used constantly when scanning documents, dashboards, or emails." },
    flanker:        { name:"Inhibitory Control",  what:"your ability to ignore irrelevant information and focus on what matters — critical for avoiding distractions in busy work environments." },
    comparison:     { name:"Analytical Thinking", what:"your ability to compare and evaluate data accurately — directly relevant to decision-making and data analysis tasks." },
    reading_comp:   { name:"Reading Comprehension", what:"how accurately you absorb and retain written information — fundamental to any knowledge work." },
    email_sel:      { name:"Decision Making",     what:"your ability to select the most appropriate option under time pressure — mirroring real-world email triage and task prioritisation." },
    form_fill:      { name:"Precision & Accuracy", what:"your accuracy when entering structured information — relevant to data entry, form completion, and administrative tasks." },
    memory_recall:  { name:"Working Memory",      what:"how well you hold and retrieve information over short periods — the foundation of multi-step problem solving." },
    nav_task:       { name:"Navigation",          what:"your ability to move efficiently through menu structures — reflecting everyday software and web navigation." },
  };

  CFG.tasks.forEach(tid => {
    const tp = stats.tperf[tid];
    if (!tp || !tp.n) return;
    const acc = tp.acc ?? 0;
    const level = strengthLevel(acc);
    const desc = taskDescriptions[tid];
    if (!desc) return;
    let insight = `Your ${desc.name} score of ${Math.round(acc*100)}% reflects `;
    if (level === "excellent") insight += `an excellent ability to manage ${desc.what} You are in a strong position here.`;
    else if (level === "good") insight += `a solid command of ${desc.what} With practice, this can become a consistent strength.`;
    else if (level === "moderate") insight += `a developing capacity for ${desc.what} This is a normal starting point and tends to improve with familiarity.`;
    else insight += `an area for growth in ${desc.what} This is not unusual for first-time assessments and can improve significantly with targeted practice.`;
    taskInsights[tid] = insight;
  });

  // ── Workload insight ─────────────────────────────────────────────────────────
  let workloadInsight = "";
  const nasaDkScore = exps.find(e => e.theme === "dark"  && e.nasaTLX)?.nasaTLX?.totalScore;
  const nasaLtScore = exps.find(e => e.theme === "light" && e.nasaTLX)?.nasaTLX?.totalScore;
  if (nasaDkScore != null || nasaLtScore != null) {
    const lower = nasaDkScore != null && nasaLtScore != null ? (nasaDkScore < nasaLtScore ? "dark" : "light") : null;
    const ref = lower === "dark" ? nasaDkScore : lower === "light" ? nasaLtScore : (nasaDkScore ?? nasaLtScore);
    if (ref < 7) workloadInsight = `Your workload scores were low (🌙 ${nasaDkScore?.toFixed(1) ?? "—"} · ☀️ ${nasaLtScore?.toFixed(1) ?? "—"} out of 20), indicating the tasks felt manageable and comfortable across both conditions — a very positive outcome.`;
    else if (ref < 13) workloadInsight = `Your workload scores reflect moderate cognitive effort (🌙 ${nasaDkScore?.toFixed(1) ?? "—"} · ☀️ ${nasaLtScore?.toFixed(1) ?? "—"} out of 20). This is expected when engaging with unfamiliar tasks.${lower ? ` Notably, ${lower} mode produced lower workload.` : ""}`;
    else workloadInsight = `Your workload scores suggest the tasks were cognitively demanding (🌙 ${nasaDkScore?.toFixed(1) ?? "—"} · ☀️ ${nasaLtScore?.toFixed(1) ?? "—"} out of 20). With repeated exposure to similar interfaces, perceived workload typically decreases substantially.`;
  }

  // ── Recommendation ───────────────────────────────────────────────────────────
  let recommendation = "";
  const pref = user.pref;
  const prefMatchesPerf = pref === winner;
  if (pref === "none" || !pref) {
    recommendation = `Based purely on your performance data, we recommend using ${winner} mode for cognitively demanding tasks such as reading, writing, and analysis. For casual browsing or relaxed work, either theme will serve you well.`;
  } else if (prefMatchesPerf) {
    recommendation = `Your subjective preference for ${pref} mode aligns perfectly with your objective performance data. Trust your instincts — use ${winner} mode when focus and accuracy matter most.`;
  } else {
    recommendation = `Interestingly, your subjective preference was ${pref} mode, but your performance data favours ${winner} mode. Consider experimenting with ${winner} mode for focused tasks (reading, analysis, writing) while keeping ${pref} mode for lighter, more casual work. Many people find a hybrid approach works best.`;
  }

  return { summary, speedInsight, taskInsights, workloadInsight, recommendation };
}

function ReportScreen({ user, u, onBack }) {
  const stats  = useMemo(() => computeStats(user), [user]);
  const exps   = user.experiments || [];
  const nasaDkObj = exps.find(e => e.theme === "dark"  && e.nasaTLX)?.nasaTLX;
  const nasaLtObj = exps.find(e => e.theme === "light" && e.nasaTLX)?.nasaTLX;
  const nasa   = nasaDkObj || nasaLtObj; // for backwards compat
  const dkC    = exps.find(e => e.theme === "dark")?.comfort;
  const ltC    = exps.find(e => e.theme === "light")?.comfort;
  const dem    = user.dem || {};

  if (!stats) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"inherit" }}>
      <p>No experiment data found.</p>
      <button onClick={onBack}>← Back</button>
    </div>
  );

  const insights = generateInsights(stats, user, nasa, dkC, ltC);
  const winner   = stats.betterTheme;
  const wCol     = winner === "dark" ? "#1D4ED8" : "#B45309";
  const wBg      = winner === "dark" ? "#EFF6FF" : "#FFFBEB";
  const dateStr  = user.completedAt
    ? new Date(user.completedAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
    : new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });

  const pct  = v => v != null ? Math.round(v * 100) + "%" : "—";
  const ms   = v => v != null ? Math.round(v) + " ms" : "—";
  const accColor = v => v >= 0.85 ? "#15803D" : v >= 0.70 ? "#1D4ED8" : v >= 0.55 ? "#B45309" : "#DC2626";

  const Bar = ({ value, max=1, color="#1D4ED8", height=8 }) => (
    <div style={{ height, background:"#E2E8F0", borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.round(Math.min(1,Math.max(0,value/max))*100)}%`, background:color, borderRadius:99 }} />
    </div>
  );

  const SectionTitle = ({ children, color="#1D4ED8" }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"36px 0 16px", paddingBottom:8, borderBottom:"2px solid #E2E8F0" }}>
      <div style={{ width:4, height:20, background:color, borderRadius:2, flexShrink:0 }} />
      <div style={{ fontSize:15, fontWeight:800, color:"#0F172A", letterSpacing:-.2, textTransform:"uppercase" }}>{children}</div>
    </div>
  );

  const InsightBox = ({ text, color="#1D4ED8" }) => (
    <div style={{ padding:"14px 18px", borderRadius:10, background:`${color}08`, border:`1px solid ${color}22`, marginBottom:16, lineHeight:1.8, fontSize:14, color:"#374151" }}>{text}</div>
  );

  const COMFORT_DIMS = [
    { key:"visualComfort", label:"Visual Comfort",   higherBetter:true  },
    { key:"eyeStrain",     label:"Eye Strain",        higherBetter:false },
    { key:"fatigue",       label:"Mental Fatigue",    higherBetter:false },
    { key:"satisfaction",  label:"Satisfaction",      higherBetter:true  },
  ];

  const NASA_DIMS = [
    { k:"md", l:"Mental Demand"   }, { k:"pd", l:"Physical Demand" },
    { k:"td", l:"Temporal Demand" }, { k:"pe", l:"Performance"     },
    { k:"ef", l:"Effort"          }, { k:"fr", l:"Frustration"     },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:"#fff", minHeight:"100vh" }}>

      {/* Floating action bar — hidden when printing */}
      <div className="no-print" style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(8px)", borderBottom:"1px solid #E2E8F0", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"1px solid #E2E8F0", borderRadius:8, padding:"7px 16px", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"#64748B" }}>← Back</button>
        <span style={{ fontSize:12, color:"#94A3B8" }}>This is your report — what you see is what prints</span>
        <button onClick={() => window.print()} style={{ background:"#1D4ED8", border:"none", borderRadius:8, padding:"8px 22px", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"#fff", fontWeight:700 }}>🖨 Save as PDF</button>
      </div>

      {/* Report — exactly as it prints */}
      <div id="report-root" style={{ maxWidth:800, margin:"0 auto", paddingTop:60 }}>

        {/* ── Cover header ── */}
        <div style={{ background:"linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)", padding:"36px 32px 32px", color:"#fff" }}>
          <div style={{ fontSize:11, letterSpacing:3, color:"#93C5FD", textTransform:"uppercase", marginBottom:16 }}>CogBench · Cognitive Performance Report</div>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:-1, marginBottom:6, lineHeight:1.1 }}>{user.name}</div>
          <div style={{ fontSize:13, color:"#CBD5E1", marginBottom:24 }}>
            Completed {dateStr} &nbsp;·&nbsp; {user.orderGroup === "DL" ? "Dark → Light" : "Light → Dark"}
          </div>
          {/* Optimal interface */}
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"16px 20px", border:"1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize:11, letterSpacing:2, color:"#93C5FD", textTransform:"uppercase", marginBottom:8 }}>Your Recommended Interface</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>{winner === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</div>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:900, color:"#60A5FA" }}>{pct(stats.accDk)}</div><div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>🌙 Dark</div></div>
                <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:900, color:"#FCD34D" }}>{pct(stats.accLt)}</div><div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>☀️ Light</div></div>
                {stats.rtDk && <div style={{ textAlign:"center" }}><div style={{ fontSize:22, fontWeight:900, color:"#6EE7B7" }}>{ms(Math.min(stats.rtDk, stats.rtLt))}</div><div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Best RT</div></div>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"8px clamp(16px, 5vw, 56px) 64px" }}>

          {/* About this report */}
          <SectionTitle>About This Report</SectionTitle>
          <div style={{ fontSize:14, color:"#4B5563", lineHeight:1.9 }}>
            This report summarises your cognitive performance across 8 tasks completed in both dark and light interface themes. It is designed to be meaningful and actionable — not just a list of numbers. Each section includes a plain-language interpretation of what your scores mean in practical terms.
          </div>

          {/* Profile */}
          <SectionTitle>Your Profile</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"6px 32px" }}>
            {[
              ["Age",              dem.age||"—"],
              ["Gender",           dem.gender||"—"],
              ["Education",        dem.edu||"—"],
              ["Computer Skills",  dem.proficiency||"—"],
              ["Daily Screen Time",dem.screenTime||"—"],
              ["Dark Mode Habit",  dem.darkMode||"—"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F1F5F9", fontSize:13 }}>
                <span style={{ color:"#6B7280" }}>{k}</span>
                <span style={{ fontWeight:600, color:"#111827" }}>{v}</span>
              </div>
            ))}
          </div>
          {user.pref && user.pref !== "none" && (
            <div style={{ marginTop:12, padding:"10px 16px", borderRadius:8, background:wBg, border:`1px solid ${wCol}30`, display:"flex", justifyContent:"space-between", fontSize:13 }}>
              <span style={{ color:"#6B7280" }}>Self-reported preference</span>
              <span style={{ fontWeight:700, color:wCol }}>{user.pref === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
            </div>
          )}

          {/* Overall summary */}
          <SectionTitle>Overall Summary</SectionTitle>
          <InsightBox text={insights.summary} />
          {insights.speedInsight && <InsightBox text={insights.speedInsight} color="#7C3AED" />}

          {/* Task Performance */}
          <SectionTitle>Task-by-Task Performance</SectionTitle>
          <div style={{ fontSize:13, color:"#6B7280", marginBottom:16, lineHeight:1.7 }}>
            Each task measures a specific cognitive skill. Below are your scores alongside a plain-language explanation of what they mean for you.
          </div>
          {CFG.tasks.map((tid, i) => {
            const tp = stats.tperf[tid];
            if (!tp || !tp.n) return null;
            const acc = tp.acc ?? 0;
            const col = accColor(acc);
            const insight = insights.taskInsights[tid];
            return (
              <div key={tid} style={{ marginBottom:20, padding:"16px 20px", borderRadius:10, border:"1px solid #E2E8F0", background:i%2===0?"#FAFAFA":"#fff" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{CFG.TL[tid]||tid}</div>
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>🌙 {pct(tp.dk?.acc)}</span>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>☀️ {pct(tp.lt?.acc)}</span>
                    <span style={{ fontSize:16, fontWeight:900, color:col }}>{pct(acc)}</span>
                  </div>
                </div>
                <Bar value={acc} color={col} height={6} />
                {insight && <div style={{ marginTop:10, fontSize:13, color:"#4B5563", lineHeight:1.75, fontStyle:"italic" }}>{insight}</div>}
              </div>
            );
          })}

          {/* Dark vs Light comparison */}
          <SectionTitle color="#7C3AED">Dark vs Light Comparison</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:16 }}>
            {[
              { label:"🌙 Dark Mode Accuracy",  value:pct(stats.accDk), bar:stats.accDk,    color:"#1D4ED8" },
              { label:"☀️ Light Mode Accuracy", value:pct(stats.accLt), bar:stats.accLt,    color:"#D97706" },
              { label:"🌙 Dark Response Time",  value:ms(stats.rtDk),  bar:null,            color:"#1D4ED8" },
              { label:"☀️ Light Response Time", value:ms(stats.rtLt),  bar:null,            color:"#D97706" },
            ].map(({ label, value, bar, color }) => (
              <div key={label} style={{ padding:"14px 16px", borderRadius:10, border:"1px solid #E2E8F0", background:"#FAFAFA" }}>
                <div style={{ fontSize:12, color:"#6B7280", marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:20, fontWeight:800, color, marginBottom:bar!=null?8:0 }}>{value}</div>
                {bar != null && <Bar value={bar} color={color} height={5} />}
              </div>
            ))}
          </div>

          {/* Visual Comfort */}
          {(dkC || ltC) && <>
            <SectionTitle color="#059669">Comfort & Wellbeing</SectionTitle>
            <div style={{ fontSize:13, color:"#6B7280", marginBottom:16, lineHeight:1.7 }}>
              These ratings reflect how comfortable you felt during each theme condition. Scale: 1 (lowest) to 7 (highest). For Eye Strain and Fatigue, lower is better.
            </div>
            {COMFORT_DIMS.map(({ key, label, higherBetter }) => {
              const dv = dkC?.[key], lv = ltC?.[key];
              const dkBetter = dv!=null && lv!=null && (higherBetter ? dv>lv : dv<lv);
              const ltBetter = dv!=null && lv!=null && (higherBetter ? lv>dv : lv<dv);
              return (
                <div key={key} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
                    <span style={{ fontWeight:600, color:"#111827" }}>{label}</span>
                    <span style={{ color:"#6B7280" }}>{higherBetter?"higher is better":"lower is better"}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
                    {[{ v:dv, c:"#1D4ED8", l:"🌙 Dark", better:dkBetter }, { v:lv, c:"#D97706", l:"☀️ Light", better:ltBetter }].map(({ v, c, l, better }) => (
                      <div key={l} style={{ padding:"8px 12px", borderRadius:8, background:"#F8FAFC", border:`1px solid ${better?"#10B981":"#E2E8F0"}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12 }}>
                          <span style={{ color:"#6B7280" }}>{l}</span>
                          <span style={{ fontWeight:700, color:c }}>{v != null ? `${v}/7` : "—"}</span>
                        </div>
                        {v != null && <Bar value={v} max={7} color={c} height={5} />}
                        {better && <div style={{ fontSize:10, color:"#059669", marginTop:4, fontWeight:600 }}>✓ Better condition</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>}

          {/* Workload */}
          {nasa && <>
            <SectionTitle color="#DC2626">Cognitive Workload (NASA-TLX)</SectionTitle>
            <InsightBox text={insights.workloadInsight} color="#DC2626" />
            {/* Dark vs Light total scores */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:16 }}>
              {[{ label:"🌙 Dark Mode", obj:nasaDkObj, col:"#1D4ED8" }, { label:"☀️ Light Mode", obj:nasaLtObj, col:"#D97706" }].map(({ label, obj, col }) => (
                <div key={label} style={{ padding:"14px 16px", borderRadius:10, background:"#F8FAFC", border:`2px solid ${col}30`, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#6B7280", marginBottom:6 }}>{label}</div>
                  {obj ? (
                    <>
                      <div style={{ fontSize:26, fontWeight:900, color: obj.totalScore<7?"#15803D":obj.totalScore<13?"#B45309":"#DC2626" }}>{obj.totalScore?.toFixed(1)}<span style={{ fontSize:12, fontWeight:400, color:"#9CA3AF" }}>/20</span></div>
                      <div style={{ fontSize:11, color:"#6B7280", marginTop:3 }}>{obj.totalScore<7?"Low":obj.totalScore<13?"Moderate":"High"} workload</div>
                    </>
                  ) : <div style={{ color:"#9CA3AF", fontSize:12 }}>Not collected</div>}
                </div>
              ))}
            </div>
            {/* Per-dimension comparison */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
              {NASA_DIMS.map(({ k, l }) => {
                const dv = nasaDkObj?.[k], lv = nasaLtObj?.[k];
                const hasBoth = dv != null && lv != null;
                return (
                  <div key={k} style={{ padding:"10px 14px", borderRadius:8, background:"#FAFAFA", border:"1px solid #E2E8F0" }}>
                    <div style={{ fontSize:11, color:"#6B7280", marginBottom:6, fontWeight:600 }}>{l}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"#1D4ED8" }}>🌙 {dv ?? "—"}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:"#D97706" }}>☀️ {lv ?? "—"}</span>
                    </div>
                    {dv != null && <Bar value={dv} max={20} color="#1D4ED8" height={4} />}
                    {lv != null && <div style={{ marginTop:3 }}><Bar value={lv} max={20} color="#D97706" height={4} /></div>}
                  </div>
                );
              })}
            </div>
          </>}

          {/* Recommendation */}
          <SectionTitle color="#059669">Our Recommendation</SectionTitle>
          <div style={{ padding:"20px 24px", borderRadius:12, background:wBg, border:`2px solid ${wCol}`, marginBottom:24 }}>
            <div style={{ fontSize:18, fontWeight:800, color:wCol, marginBottom:10 }}>{winner === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"} for Focused Work</div>
            <div style={{ fontSize:14, color:"#374151", lineHeight:1.85 }}>{insights.recommendation}</div>
          </div>

          {/* Footer */}
          <div style={{ marginTop:48, paddingTop:20, borderTop:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", fontSize:12, color:"#9CA3AF" }}>
            <span>CogBench · HCI Cognitive Load Study</span>
            <span>{user.name} · {dateStr}</span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────────
function AdminDashboard({ onLogout, u, uiDark, onToggleTheme }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState(() => db.all().filter(x => x.role !== "admin"));
  const [sel, setSel] = useState(null);
  const [csvModal, setCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Pull latest participant data from Supabase on first load
  useEffect(() => {
    if (!supa) return;
    setSyncing(true);
    db.syncFromCloud().then(n => {
      if (n > 0) setUsers(db.all().filter(x => x.role !== "admin"));
      setSyncing(false);
    });
  }, []);

  const refresh = () => setUsers(db.all().filter(x => x.role !== "admin"));
  const [delConfirm, setDelConfirm] = useState(null);

  const deleteParticipant = (pid) => {
    const all = db.all().filter(u => u.id !== pid);
    try { localStorage.setItem("hci_v5_users", JSON.stringify(all)); } catch {}
    setUsers(all.filter(u => u.role !== "admin"));
    setDelConfirm(null);
    if (sel?.id === pid) setSel(null);
  };

  const exportCSV = () => {
    const content = buildCSV(users);
    setCsvContent(content);
    setCsvModal(true);
    dlCSV(content, `hci_study_${Date.now()}.csv`); // attempt direct download simultaneously
  };

  const copyCSV = () => {
    navigator.clipboard?.writeText(csvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const allExps = users.flatMap(usr => (usr.experiments || []).map(e => ({ ...e, uid: usr.id })));
  const allT = allExps.flatMap(e => (e.tasks || []).flatMap(t => (t.trials || []).map(tr => ({ ...tr, theme: e.theme, task: t.type }))));
  const dkT = allT.filter(t => t.theme === "dark"), ltT = allT.filter(t => t.theme === "light");
  const dkRTs = dkT.filter(t => t.rt && t.rt > 50).map(t => t.rt);
  const ltRTs = ltT.filter(t => t.rt && t.rt > 50).map(t => t.rt);
  const tStats = CFG.tasks.map(tid => {
    const tr = allT.filter(t => t.task === tid);
    const dk = tr.filter(t => t.theme === "dark"), lt = tr.filter(t => t.theme === "light");
    return { tid, l: CFG.TL[tid], n: tr.length, acc: avg(tr.map(t => t.acc || 0)), dk: { acc: avg(dk.map(t => t.acc || 0)), rt: avg(dk.filter(t => t.rt).map(t => t.rt)) }, lt: { acc: avg(lt.map(t => t.acc || 0)), rt: avg(lt.filter(t => t.rt).map(t => t.rt)) } };
  });
  const navItems = [{ id:"overview", l:"Overview", icon:"📋" }, { id:"monitor", l:"Live Monitor", icon:"🟢" }, { id:"participants", l:"Participants", icon:"👥" }, { id:"statistics", l:"Statistics", icon:"📈" }, { id:"stats_engine", l:"Analysis", icon:"🔬" }, { id:"limitations", l:"Limitations", icon:"⚠" }, { id:"settings", l:"Settings", icon:"⚙️" }];
  const { mobile } = useBreakpoint();
  return (
    <div style={{ display:"flex", flexDirection:mobile?"column":"row", minHeight:"100vh", background:u.bg, fontFamily:L.font }}>

      {/* ── Delete Confirmation Modal ────────────────────────────────────────────── */}
      {delConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: u.surfaceSolid, borderRadius: R.xl, padding: L.spXl, maxWidth: 380, width: "90%", border: `1px solid ${u.red}40`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>🗑</div>
            <h3 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px", textAlign: "center" }}>Delete Participant?</h3>
            <p style={{ color: u.text2, fontSize: L.fsSm, marginBottom: L.spXl, textAlign: "center", lineHeight: 1.6 }}>This will permanently remove all data for <strong style={{ color: u.text }}>{users.find(p => p.id === delConfirm)?.name}</strong>. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: L.spMd }}>
              <Btn u={u} v="ghost" onClick={() => setDelConfirm(null)} full>Cancel</Btn>
              <Btn u={u} v="danger" onClick={() => deleteParticipant(delConfirm)} full>Delete</Btn>
            </div>
          </div>
        </div>
      )}
      {csvModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: u.surfaceSolid, borderRadius: R.xl, width: "min(92vw,860px)", maxHeight: "88vh", display: "flex", flexDirection: "column", border: `1px solid ${u.border2}`, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${L.spMd}px ${L.spLg}px`, borderBottom: `1px solid ${u.border}`, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>CSV Export — {users.length} participant{users.length !== 1 ? "s" : ""}</div>
                <div style={{ fontSize: L.fsXs, color: u.text3, marginTop: 3 }}>If the file did not download automatically, copy below and save as <strong>.csv</strong></div>
              </div>
              <div style={{ display: "flex", gap: L.spSm, alignItems: "center" }}>
                <Btn u={u} v="grad" sm onClick={copyCSV}>{copied ? "✓ Copied!" : "Copy All"}</Btn>
                <button onClick={() => setCsvModal(false)} style={{ background: "none", border: "none", color: u.text3, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>✕</button>
              </div>
            </div>
            <textarea readOnly value={csvContent}
              style={{ flex: 1, resize: "none", fontFamily: L.mono, fontSize: 10.5, background: u.bg2, color: u.text2, border: "none", padding: L.spMd, outline: "none", overflowY: "auto", lineHeight: 1.65, minHeight: 0 }} />
            <div style={{ padding: `${L.spSm}px ${L.spLg}px`, borderTop: `1px solid ${u.border}`, fontSize: L.fsXs, color: u.text3, flexShrink: 0 }}>
              {csvContent.split("\n").length - 1} data rows · {csvContent.split(",").length > 10 ? csvContent.split("\n")[0].split(",").length : 0} columns · UTF-8 with BOM (Excel-compatible)
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar (desktop) / Top nav (mobile) ── */}
      {mobile ? (
        <>
          {/* Mobile top bar */}
          <div style={{ position:"sticky", top:0, zIndex:100, background:u.sidebar, borderBottom:`1px solid ${u.sidebarBorder}`, flexShrink:0 }}>
            <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🧠</div>
                <span style={{ fontSize:L.fsMd, fontWeight:L.fwBold, color:u.text }}>CogBench</span>
                <Badge u={u} color={u.red}>Admin</Badge>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <ThemeToggle uiDark={uiDark} onToggle={onToggleTheme} u={u} />
                <button onClick={exportCSV} style={{ height:28, padding:"0 10px", borderRadius:R.md, border:`1px solid ${u.accent}40`, background:`${u.accent}12`, color:u.accent, fontFamily:L.font, cursor:"pointer", fontSize:L.fsXs, fontWeight:L.fwSemi }}>↓ CSV</button>
                <button onClick={onLogout} style={{ height:28, padding:"0 10px", borderRadius:R.md, border:`1px solid ${u.red}40`, background:`${u.red}08`, color:u.red, fontFamily:L.font, cursor:"pointer", fontSize:L.fsXs, fontWeight:L.fwSemi }}>Sign Out</button>
              </div>
            </div>
            {/* Horizontal scrollable tab nav */}
            <div style={{ overflowX:"auto", display:"flex", borderTop:`1px solid ${u.border}`, WebkitOverflowScrolling:"touch" }}>
              {navItems.map(({ id, l, icon }) => (
                <button key={id} onClick={() => setTab(id)} style={{ flexShrink:0, height:40, padding:"0 14px", border:"none", background:"transparent", borderBottom:`2px solid ${tab===id?u.accent:"transparent"}`, color:tab===id?u.accent:u.text2, fontWeight:tab===id?L.fwSemi:L.fwNorm, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5, transition:"all .15s" }}>
                  <span>{icon}</span><span>{l}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ width:230, height:"100vh", background:u.sidebar, borderRight:`1px solid ${u.sidebarBorder}`, display:"flex", flexDirection:"column", padding:18, position:"sticky", top:0, flexShrink:0 }}>
          <div style={{ marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🧠</div>
            <div><div style={{ fontSize:L.fsMd, fontWeight:L.fwBold, color:u.text }}>CogBench</div><Badge u={u} color={u.red}>Admin</Badge></div>
          </div>
          <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
            {navItems.map(({ id, l }) => <button key={id} onClick={() => setTab(id)} style={{ height:36, borderRadius:R.md, border:"none", background:tab===id?`${u.accent}14`:"transparent", color:tab===id?u.accent:u.text2, fontWeight:tab===id?L.fwSemi:L.fwNorm, textAlign:"left", padding:"0 11px", fontFamily:L.font, cursor:"pointer", fontSize:L.fsBase, transition:"all .15s" }}>{l}</button>)}
          </nav>
          <div style={{ borderTop:`1px solid ${u.border}`, paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
            <button onClick={exportCSV} style={{ height:34, borderRadius:R.md, border:`1px solid ${u.accent}40`, background:`${u.accent}12`, color:u.accent, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, fontWeight:L.fwSemi }}>↓ Export CSV</button>
            <button onClick={refresh} style={{ height:34, borderRadius:R.md, border:`1px solid ${u.border}`, background:"transparent", color:u.text3, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm }}>⟳ Refresh</button>
            <div style={{ fontSize:L.fsXs, color:supa?(syncing?u.orange:u.green):u.text3, textAlign:"center" }}>
              {supa ? (syncing ? "⟳ Syncing with cloud…" : "☁ Cloud connected") : "⚠ Local storage only"}
            </div>
            <button onClick={onLogout} style={{ width:"100%", height:32, borderRadius:R.md, border:`1px solid ${u.red}40`, background:`${u.red}08`, color:u.red, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, fontWeight:L.fwSemi }}>Sign Out</button>
          </div>
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", minWidth:0 }}>
        <div style={{ width:"100%", padding:mobile?`${L.spMd}px 14px`:`${L.spXl}px ${L.spLg}px` }}>
        {tab === "overview" && (
          <div className="au">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: 0 }}>Study Overview</h1>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:L.spMd, marginBottom:20 }}>
              {[{ l:"Participants", v:users.length, c:u.accent }, { l:"Sessions", v:allExps.length, c:u.accent2 }, { l:"Trials", v:allT.length, c:u.green }, { l:"Completion", v:users.length ? `${Math.round(users.filter(u2 => (u2.experiments||[]).length >= 2).length / users.length * 100)}%` : "—", c:u.teal }].map(({ l, v, c }) => (
                <Card key={l} u={u} style={{ padding: L.spLg, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c }} />
                  <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: .8, textTransform: "uppercase", marginBottom: 8 }}>{l}</div>
                  <div style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: c }}>{v}</div>
                </Card>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: L.spMd }}>
              <Card u={u} style={{ padding: L.spLg }}>
                <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Theme Comparison</div>
                {[{ l:"Accuracy", d:fmtPct(avg(dkT.map(t => t.acc||0))), li:fmtPct(avg(ltT.map(t => t.acc||0))) }, { l:"Avg RT", d:fmtMs(avg(dkRTs)), li:fmtMs(avg(ltRTs)) }, { l:"Errors", d:String(Math.round(avg(dkT.map(t => t.err||0)))), li:String(Math.round(avg(ltT.map(t => t.err||0)))) }].map(({ l, d, li }) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: L.fsXs, color: u.text3, display:"block", marginBottom:4 }}>{l}</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
                      <div style={{ padding: "6px 10px", borderRadius: R.sm, background: `${u.accent2}14`, border: `1px solid ${u.accent2}24`, textAlign: "center" }}><div style={{ fontSize: L.fsXs, color: u.text3 }}>🌙 Dark</div><div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.accent2 }}>{d}</div></div>
                      <div style={{ padding: "6px 10px", borderRadius: R.sm, background: `${u.gold}14`, border: `1px solid ${u.gold}24`, textAlign: "center" }}><div style={{ fontSize: L.fsXs, color: u.text3 }}>☀️ Light</div><div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.gold }}>{li}</div></div>
                    </div>
                  </div>
                ))}
              </Card>
              <Card u={u} style={{ padding: L.spLg }}>
                <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Accuracy by Task</div>
                <HBar u={u} data={tStats.map((ts, i) => ({ l: ts.l.split(" ")[0], v: ts.acc * 100, c: u.chart[i % u.chart.length], fmt: fmtPct(ts.acc) }))} />
              </Card>
            </div>
          </div>
        )}
        {tab === "participants" && (
          <div className="au">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h1 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: 0 }}>{sel ? "Participant Detail" : "Participants"}</h1>
              {sel && <Btn u={u} v="ghost" sm onClick={() => setSel(null)}>‹ Back</Btn>}
            </div>
            {!sel ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!users.length && <Card u={u} style={{ padding: L.spXl, textAlign: "center" }}><p style={{ color: u.text3 }}>No participants yet.</p></Card>}
                {users.map(p => {
                  const s = computeStats(p);
                  return (
                    <Card key={p.id} u={u} onClick={() => setSel(p)} style={{ padding: L.spLg }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: p.isTestData ? u.fill : u.grad, border: p.isTestData ? `1px solid ${u.border2}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: L.fwBold, color: p.isTestData ? u.text3 : "#fff", flexShrink: 0 }}>{p.name.slice(0, 2).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>{p.name}</span>
                            {p.isTestData && <span style={{ fontSize: L.fsXs, padding: "1px 6px", borderRadius: R.pill, background: `${u.teal}18`, color: u.teal, border: `1px solid ${u.teal}28` }}>test</span>}
                          </div>
                          <div style={{ fontSize: L.fsSm, color: u.text3 }}>{p.email}</div>
                          <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                            {p.createdAt && <span style={{ fontSize: L.fsXs, color: u.text3 }}>📅 Registered: {new Date(p.createdAt).toLocaleString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true })}</span>}
                            {p.completedAt && <span style={{ fontSize: L.fsXs, color: u.green }}>✓ Completed: {new Date(p.completedAt).toLocaleString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true })}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: L.spLg, alignItems: "center" }}>
                          {s && <Badge u={u} color={s.betterTheme === "dark" ? u.accent2 : u.gold}>{s.betterTheme}</Badge>}
                          <div style={{ textAlign: "right" }}><div style={{ fontSize: L.fsXs, color: u.text3 }}>Sessions</div><div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text }}>{(p.experiments || []).length}</div></div>
                          {s && <div style={{ textAlign: "right" }}><div style={{ fontSize: L.fsXs, color: u.text3 }}>Avg Acc</div><div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.green }}>{fmtPct(avg([s.accDk, s.accLt]))}</div></div>}
                        </div>
                        <button onClick={e => { e.stopPropagation(); setDelConfirm(p.id); }} style={{ width: 32, height: 32, borderRadius: R.md, border: `1px solid ${u.border}`, background: "transparent", color: u.text3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, transition: "all .15s" }} title="Delete participant">🗑</button>
                        <span style={{ color: u.text3 }}>›</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: u.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: L.fwBold, color: "#fff" }}>{sel.name.slice(0, 2).toUpperCase()}</div>
                  <div><div style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text }}>{sel.name}</div><div style={{ fontSize: L.fsSm, color: u.text3 }}>{sel.email}</div>
                    <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                      {sel.createdAt && <span style={{ fontSize: L.fsXs, color: u.text3 }}>📅 Registered: {new Date(sel.createdAt).toLocaleString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true })}</span>}
                      {sel.completedAt && <span style={{ fontSize: L.fsXs, color: u.green }}>✓ Completed: {new Date(sel.completedAt).toLocaleString("en-GB", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true })}</span>}
                    </div>
                  </div>
                </div>
                {(sel.experiments || []).map((sess, i) => {
                  const allT2 = (sess.tasks || []).flatMap(t => t.trials || []);
                  const ac = avg(allT2.map(t => t.acc || 0));
                  const rts = allT2.filter(t => t.rt).map(t => t.rt);
                  return (
                    <Card key={i} u={u} style={{ marginBottom: 10, padding: L.spLg }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 10 }}><Badge u={u} color={sess.theme === "dark" ? u.accent2 : u.gold}>{sess.theme}</Badge><span style={{ fontSize: L.fsSm, color: u.text2 }}>Phase {sess.phase}</span></div>
                        <div style={{ display: "flex", gap: L.spLg }}><span style={{ fontSize: L.fsSm, color: u.text3 }}>Acc: <strong style={{ color: u.green }}>{fmtPct(ac)}</strong></span>{rts.length > 0 && <span style={{ fontSize: L.fsSm, color: u.text3 }}>RT: <strong style={{ color: u.teal }}>{fmtMs(avg(rts))}</strong></span>}</div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab === "monitor" && <LiveMonitorTab u={u} users={users} />}
        {tab === "statistics" && (
          <div className="au">
            <h1 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "0 0 24px" }}>Statistics</h1>
            <ParticipantHeatmap u={u} users={users} />
            <Card u={u} style={{ padding: L.spLg, marginBottom: 16 }}>
              <div style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text, marginBottom: L.spMd }}>Per-Task Breakdown</div>
                <div className="tbl-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: L.font }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${u.border}` }}>
                      {["Task","n","Overall","Dark Acc","Light Acc","Dark RT","Light RT"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: L.fsXs, color: u.text3, fontWeight: L.fwSemi, letterSpacing: .5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {tStats.map((ts, i) => (
                      <tr key={ts.tid} style={{ borderBottom: `1px solid ${u.border}`, background: i % 2 === 0 ? u.fill : "transparent" }}>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.text, fontWeight: L.fwSemi }}>{ts.l}</td>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.text3 }}>{ts.n}</td>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.text2 }}>{ts.n ? fmtPct(ts.acc) : "—"}</td>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.accent2 }}>{fmtPct(ts.dk.acc)}</td>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.gold }}>{fmtPct(ts.lt.acc)}</td>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.text2, fontFamily: L.mono }}>{fmtMs(ts.dk.rt)}</td>
                        <td style={{ padding: "9px 10px", fontSize: L.fsSm, color: u.text2, fontFamily: L.mono }}>{fmtMs(ts.lt.rt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: L.spMd }}>
              {[{ label:"RT Distribution — Dark", rts:dkRTs, c:u.accent2 }, { label:"RT Distribution — Light", rts:ltRTs, c:u.gold }].map(({ label, rts, c }) => (
                <Card key={label} u={u} style={{ padding: L.spLg }}>
                  {rts.length > 0 ? <HBar u={u} data={[{ l:"<300ms", v:rts.filter(r=>r<300).length, c:u.green },{ l:"300–500ms", v:rts.filter(r=>r>=300&&r<500).length, c },{ l:"500–800ms", v:rts.filter(r=>r>=500&&r<800).length, c:u.orange },{ l:">800ms", v:rts.filter(r=>r>=800).length, c:u.red }]} /> : <p style={{ color:u.text3, fontSize:L.fsSm }}>No RT data yet.</p>}
                </Card>
              ))}
            </div>
          </div>
        )}
        {tab === "stats_engine" && <AnalysisTab u={u} users={users} />}
        {tab === "limitations" && <LimitationsTab u={u} />}
        {tab === "settings" && <SettingsTab u={u} />}
        </div>
      </div>
    </div>
  );
}

// ─── EXPERIMENT SCREENS ────────────────────────────────────────────────────────────
function ConsentSc({ u, user, firstTheme, onAccept, onDecline }) {
  const [agreed, setAgreed] = useState(false);
  const secondTheme = firstTheme === "dark" ? "light" : "dark";
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: `${L.spXl}px ${L.spLg}px`, fontFamily: L.font }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Informed Consent</div>
        <h2 style={{ fontSize: L.fs2Xl, fontWeight: L.fwBlack, color: u.text, margin: "0 0 6px", letterSpacing: -1 }}>Welcome, {user.name.split(" ")[0]} 👋</h2>
      </div>
      <Card u={u} style={{ marginBottom: 14 }}>
        <ul style={{ margin: 0, padding: "0 0 0 18px", color: u.text2, fontSize: L.fsSm, lineHeight: 2 }}>
          {[
            `This is a within-subjects (repeated measures) experiment. You will complete the same matched set of cognitive tasks under both interface themes — ${firstTheme.toUpperCase()} MODE first, then ${secondTheme.toUpperCase()} MODE.`,
            "Theme order is counterbalanced across participants to control for practice and order effects.",
            "Both objective data (task completion time, accuracy, error rate, response time) and subjective data (perceived comfort, fatigue, and cognitive load via NASA-TLX) are collected.",
            "A brief comfort and fatigue rating is collected after each phase, followed by a NASA-TLX workload survey. Both phases include these surveys.",
            "All data is anonymised and used solely for academic HCI research. You may withdraw at any time.",
            "Please do not adjust display brightness or settings during the experiment.",
          ].map((tx, i) => <li key={i} style={{ marginBottom: 5 }}>{tx}</li>)}
        </ul>
      </Card>
      <div onClick={() => setAgreed(a => !a)} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: L.spMd, background: agreed ? `${u.accent}10` : u.fill, border: `1px solid ${agreed ? u.accent : u.border2}`, borderRadius: R.lg, cursor: "pointer", marginBottom: 20, transition: "all .2s" }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${agreed ? u.accent : u.border2}`, background: agreed ? u.accent : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{agreed && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}</div>
        <p style={{ margin: 0, fontSize: L.fsSm, color: u.text2, lineHeight: 1.6 }}>I have read the above. I am 18+ and voluntarily consent to participate in this study.</p>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Btn u={u} v="ghost" onClick={onDecline}>Decline</Btn>
        <Btn u={u} v="grad" onClick={onAccept} disabled={!agreed}>I Consent — Begin →</Btn>
      </div>
    </div>
  );
}

// ─── SHARED DEMOGRAPHICS FIELD DEFINITIONS ────────────────────────────────────────
const DEM_FIELDS = [
  { k:"age",         l:"Age",                  type:"number", placeholder:"Your age" },
  { k:"gender",      l:"Gender",                opts:["Male","Female","Non-binary","Prefer not to say"] },
  { k:"edu",         l:"Education Level",       opts:["Some school","High school diploma","Some college","Bachelor's degree","Master's degree","Doctorate or higher","Prefer not to say"] },
  { k:"vision",      l:"Vision Condition",      opts:["Normal / uncorrected","Glasses","Contact lenses","Laser correction","Colour vision deficiency"] },
  { k:"darkMode",    l:"Dark Mode Usage",       opts:["Never","Rarely (few times a month)","Sometimes (few times a week)","Often (daily)","Always"] },
  { k:"screenTime",  l:"Daily Screen Time",     opts:["Less than 2 hours","2–4 hours","4–6 hours","6–8 hours","More than 8 hours"] },
  { k:"proficiency", l:"Computer Proficiency",  opts:["Beginner","Intermediate","Advanced","Expert"] },
];

function DemographicsSc({ u, onDone }) {
  const empty = Object.fromEntries(DEM_FIELDS.map(f => [f.k, ""]));
  const [f, setF] = useState(empty);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const ready = DEM_FIELDS.every(field => f[field.k]);
  const mkO = opts => [{ v: "", l: "Select…" }, ...opts.map(o => ({ v: o, l: o }))];
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: `${L.spXl}px ${L.spLg}px`, fontFamily: L.font }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: u.grad, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
        <h2 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "0 0 8px" }}>Complete Your Profile</h2>
        <p style={{ color: u.text2, fontSize: L.fsSm, maxWidth: 340, margin: "0 auto" }}>Tell us a bit about yourself. This helps personalise your cognitive analysis. All responses are strictly anonymous.</p>
      </div>
      <Card u={u}>
        <div style={{ display: "flex", flexDirection: "column", gap: L.spMd }}>
          {DEM_FIELDS.map(field => (
            <div key={field.k}>
              <label style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: u.text2, display: "block", marginBottom: 8 }}>{field.l}</label>
              {field.type === "number"
                ? <Inp u={u} type="number" value={f[field.k]} onChange={e => set(field.k, e.target.value)} placeholder={field.placeholder} />
                : <Sel u={u} value={f[field.k]} onChange={v => set(field.k, v)} opts={mkO(field.opts)} />
              }
            </div>
          ))}
          <Btn u={u} v="grad" onClick={() => ready && onDone(f)} disabled={!ready} full style={{ marginTop: 4 }}>Save & Continue →</Btn>
        </div>
      </Card>
    </div>
  );
}

function InstructionsSc({ u, phase, theme, onBegin }) {
  const [read, setRead] = useState(false);
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: `${L.spXl}px clamp(14px,4vw,${L.spLg}px)`, fontFamily: L.font }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Phase {phase} Instructions</div>
        <h2 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: "0 0 10px" }}>{theme.charAt(0).toUpperCase() + theme.slice(1)} Mode Phase</h2>
        <Badge u={u} color={theme === "dark" ? u.accent2 : u.gold}>{theme} theme</Badge>
      </div>
      <Card u={u} style={{ marginBottom: 16 }}>
        <ul style={{ margin: 0, padding: "0 0 0 18px", color: u.text2, fontSize: L.fsSm, lineHeight: 2 }}>
          <li>You will complete <strong style={{ color: u.text }}>8 cognitive tasks</strong> in sequence.</li>
          <li>Work as <strong style={{ color: u.text }}>quickly and accurately</strong> as possible.</li>
          <li>Response times are measured precisely — respond as soon as you know the answer.</li>
          <li>After all 8 tasks, you will complete a <strong style={{ color: u.text }}>brief comfort &amp; fatigue rating</strong> (4 questions) for this theme.</li>
          <li>A single <strong style={{ color: u.text }}>NASA-TLX workload survey</strong> is completed once at the very end of both phases.</li>
          <li>The interface theme is fixed throughout this phase.</li>
        </ul>
      </Card>
      <div onClick={() => setRead(r => !r)} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, cursor: "pointer" }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${read ? u.accent : u.border2}`, background: read ? u.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{read && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}</div>
        <span style={{ fontSize: L.fsSm, color: u.text2 }}>I understand the instructions.</span>
      </div>
      <div style={{ textAlign: "center" }}><Btn u={u} v="grad" onClick={() => read && onBegin()} disabled={!read}>Start Phase {phase} →</Btn></div>
    </div>
  );
}

function PreferenceSc({ u, onDone }) {
  const [pref, setPref] = useState("");
  const opts = [{ v:"dark", l:"Dark Mode 🌙", s:"Darker backgrounds felt more comfortable." }, { v:"light", l:"Light Mode ☀️", s:"White backgrounds felt more comfortable." }, { v:"none", l:"No preference", s:"Both felt equally comfortable." }];
  return (
    <div style={{ maxWidth: 500, width: "100%", padding: `${L.spXl}px ${L.spLg}px`, fontFamily: L.font }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: L.fsXs, color: u.text3, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Final Question</div>
        <h2 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: u.text, margin: 0 }}>Theme Preference</h2>
        <p style={{ color: u.text2, fontSize: L.fsSm, marginTop: 8 }}>Which did you find more comfortable overall?</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: L.spXl }}>
        {opts.map(o => (
          <div key={o.v} onClick={() => setPref(o.v)} style={{ padding: L.spLg, borderRadius: R.lg, border: `1px solid ${pref === o.v ? u.accent : u.border}`, background: pref === o.v ? `${u.accent}10` : u.fill, cursor: "pointer", transition: "all .2s" }}>
            <div style={{ fontSize: L.fsBase, fontWeight: L.fwSemi, color: u.text }}>{o.l}</div>
            <div style={{ fontSize: L.fsSm, color: u.text3, marginTop: 4 }}>{o.s}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" }}><Btn u={u} v="grad" onClick={() => pref && onDone(pref)} disabled={!pref} full>Submit & See Results →</Btn></div>
    </div>
  );
}

function DebriefSc({ u, user, onHome }) {
  const stats = useMemo(() => computeStats(user), [user]);
  return (
    <div style={{ maxWidth: 520, textAlign: "center", padding: `${L.spXl}px ${L.spLg}px`, fontFamily: L.font }}>
      <div style={{ fontSize: 58, marginBottom: 16 }}>🏆</div>
      <div style={{ fontSize: L.fsXs, color: u.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Experiment Complete</div>
      <h2 style={{ fontSize: L.fs2Xl, fontWeight: L.fwBlack, color: u.text, margin: "0 0 16px", letterSpacing: -1 }}>Thank you!</h2>
      <p style={{ color: u.text2, fontSize: L.fsMd, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 24px" }}>Your data has been saved. View your full cognitive profile and AI-powered insights on your dashboard.</p>
      {stats && (
        <Card u={u} style={{ marginBottom: 24, padding: L.spLg, background: u.gradSoft, border: `1px solid ${u.accent}20` }}>
          <div style={{ fontSize: L.fsXs, color: u.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Your Results</div>
          <div style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, marginBottom: 12 }}>Best theme: <span style={{ color: stats.betterTheme === "dark" ? u.accent2 : u.gold, textTransform: "capitalize" }}>{stats.betterTheme} mode</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
            {[{ l:"Dark Accuracy", v:fmtPct(stats.accDk) }, { l:"Light Accuracy", v:fmtPct(stats.accLt) }].map(({ l, v }) => (
              <div key={l} style={{ padding: L.spMd, borderRadius: R.md, background: u.fill }}>
                <div style={{ fontSize: L.fsXs, color: u.text3, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: L.fsMd, fontWeight: L.fwBold, color: u.text }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Btn u={u} v="grad" onClick={onHome} full>Go to Dashboard →</Btn>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("auth");
  const [user, setUser] = useState(null);
  const [uiTab, setUiTab] = useState("dashboard");
  const [uiDark, setUiDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hci_ui_dark") ?? "true"); } catch { return true; }
  });
  const toggleTheme = () => setUiDark(d => { const n = !d; try { localStorage.setItem("hci_ui_dark", n); } catch {} return n; });
  const u = mkUI(uiDark);

  // Experiment state
  const [phase, setPhase] = useState(1);
  const [p1Theme, setP1Theme] = useState(null);
  const [taskOrder, setTaskOrder] = useState([]);
  const [taskIdx, setTaskIdx] = useState(0);
  const [trialIdx, setTrialIdx] = useState(0);
  const [taskData, setTaskData] = useState(null);
  const [trialRes, setTrialRes] = useState([]);
  const [sessTasks, setSessTasks] = useState([]);
  const [pendingSess, setPendingSess] = useState(null);  // holds session data between tasks → comfort → break/NASA-TLX
  const tracker = useTracker();

  const EXPERIMENT_SCREENS = ["instructions","task_brief","task","phase_comfort","break","nasa_tlx","preference","debrief"];
  const isExperiment = EXPERIMENT_SCREENS.includes(screen);

  const goHome = useCallback(() => { setScreen("app"); setPhase(1); setP1Theme(null); setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setSessTasks([]); setPendingSess(null); }, []);

  const { status:tmStatus, countdown:tmCount, reset:tmReset } = useSessionTimeout({
    enabled: isExperiment,
    idleMs:  5 * 60 * 1000,   // 5-minute idle threshold
    warnMs:  60 * 1000,        // 60-second countdown warning
    onExpire: goHome,
  });

  // Timeout overlay — shown on any experiment screen
  const TimeoutOverlay = () => tmStatus === "warning"
    ? <SessionTimeoutModal u={u} countdown={tmCount} onStillHere={tmReset} onLeave={goHome} />
    : null;
  const curTheme = phase === 1 ? p1Theme : (p1Theme === "dark" ? "light" : "dark");
  const t = ET[curTheme || "dark"];
  const curType = taskOrder[taskIdx] || "visual_search";
  const totalTasks = CFG.tasks.length;

  useEffect(() => {
    const id = db.cur();
    if (id) {
      const u2 = db.get(id);
      if (u2) {
        setUser(u2);
        setScreen(u2.role === "admin" ? "admin" : (u2.dem ? "app" : "demographics"));
      }
    }
  }, []);

  const login = u2 => {
    setUser(u2);
    db.setCur(u2.id);
    if (u2.role === "admin") setScreen("admin");
    else if (!u2.dem) setScreen("demographics");
    else setScreen("app");
  };
  const logout = () => { db.setCur(null); setUser(null); setScreen("auth"); setPhase(1); setP1Theme(null); };

  const startExp = () => {
    if (user.completed || (user.experiments || []).length >= 2) return; // one attempt only
    const first = Math.random() < .5 ? "dark" : "light";
    const group = first === "dark" ? "DL" : "LD"; // Dark-first or Light-first
    const upd = { ...user, orderGroup: group };
    setUser(upd); db.save(upd);
    setP1Theme(first); setTaskOrder(shuf([...CFG.tasks]));
    setPhase(1); setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setSessTasks([]);
    setScreen("instructions");
  };

  const saveDem = dem => { const upd = { ...user, dem }; setUser(upd); db.save(upd); setScreen("app"); };

  function genTaskData(type) {
    if (type === "n_back") return gen.n_back();
    return Array.from({ length: CFG.TN[type] }, () => gen[type]());
  }

  const beginPhase = () => {
    const td = genTaskData(taskOrder[0] || CFG.tasks[0]);
    setTaskData(td); setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setScreen("task_brief");
  };

  const advanceTask = (results) => {
    // Build normalized task record
    const rec = {
      type:            curType,
      idx:             taskIdx,
      taskOrder:       taskIdx + 1,   // 1-based position in sequence (ExperimentalVariable: TaskOrder)
      trials:          results,
      avgAcc:          avg(results.map(r => r.acc || 0)),
      avgRT:           avg(results.filter(r => r.rt).map(r => r.rt)),
      taskSuccessRate: results.filter(r => (r.acc || 0) >= 0.70).length / Math.max(results.length, 1),
    };
    const updTasks = [...sessTasks, rec]; setSessTasks(updTasks);
    const nextTask = taskIdx + 1;
    if (nextTask < totalTasks) {
      setTaskIdx(nextTask);
      const td = genTaskData(taskOrder[nextTask]);
      setTaskData(td); setTrialIdx(0); setTrialRes([]); setScreen("task_brief");
    } else {
      // All tasks for this phase done — collect comfort/fatigue before proceeding
      setPendingSess({ phase, theme: curTheme, tasks: updTasks, ts: new Date().toISOString() });
      setScreen("phase_comfort");
    }
  };

  const handleTrialDone = res => {
    const upd = [...trialRes, res]; setTrialRes(upd);
    if (taskData?.seq) { advanceTask(upd); return; }
    const next = trialIdx + 1;
    if (next < taskData.length) setTrialIdx(next);
    else advanceTask(upd);
  };

  // Called after each phase's comfort & fatigue survey — now NASA-TLX follows each phase
  const handleComfort = (comfort) => {
    const sessWithComfort = { ...pendingSess, comfort };
    setPendingSess(sessWithComfort);
    setScreen("nasa_tlx"); // NASA-TLX after EVERY phase
  };

  const handleNASA = tlx => {
    const nasaTotal = parseFloat(((tlx.md+tlx.pd+tlx.td+tlx.pe+tlx.ef+tlx.fr)/6).toFixed(2));
    const tlxFull = { ...tlx, totalScore: nasaTotal };
    const sessRec = { ...(pendingSess || {}), nasaTLX: tlxFull };
    if (phase === 1) {
      // Phase 1 done — save session with comfort + NASA, then break
      const upd = { ...user, experiments: [...(user.experiments || []), sessRec] };
      setUser(upd); db.save(upd);
      setSessTasks([]); setPhase(2); setTaskIdx(0); setTrialIdx(0); setTrialRes([]);
      setPendingSess(null);
      setScreen("break");
    } else {
      // Phase 2 done — save session, go to preference then debrief
      const upd = { ...user, experiments: [...(user.experiments || []), sessRec], completed: true };
      setUser(upd); db.save(upd);
      setPendingSess(null);
      setScreen("preference");
    }
  };

  const handleBreak = () => {
    const td = genTaskData(taskOrder[0]);
    setTaskData(td); setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setScreen("instructions");
  };

  const handlePref = pref => { const upd = { ...user, pref, completed: true, completedAt: new Date().toISOString() }; setUser(upd); db.save(upd); setScreen("debrief"); };

  const Wrap = ({ children }) => (
    <div style={{ minHeight: "100vh", background: u.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {children}
    </div>
  );

  const ExpPage = ({ children, showProgress = false }) => (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: L.font }}>
      {showProgress && (
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: t.bg, borderBottom: `1px solid ${t.border}`, padding: `${L.spSm}px ${L.spLg}px` }}>
          <div style={{ maxWidth: L.maxW, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: L.spSm }}>
            <span style={{ fontSize: L.fsSm, fontWeight: L.fwSemi, color: t.text }}>Phase {phase} · {curTheme} · {CFG.TL[curType]}</span>
            <span style={{ fontSize: L.fsXs, padding: "3px 10px", borderRadius: R.pill, background: t.surface, border: `1px solid ${t.border}`, color: t.textFaint }}>🔒 Theme locked</span>
          </div>
          <div style={{ height: 3, background: t.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(taskIdx / totalTasks) * 100}%`, background: t.accent, transition: "width .5s" }} />
          </div>
        </div>
      )}
      <div style={{ maxWidth: L.maxW, margin: "0 auto", padding: `${L.spXl}px ${L.spLg}px` }}>{children}</div>
    </div>
  );

  if (screen === "auth") return <><style>{GCSS}</style><AuthScreen onLogin={login} u={u} uiDark={uiDark} onToggleTheme={toggleTheme} /></>;
  if (screen === "admin") return <><style>{GCSS}</style><AdminDashboard onLogout={logout} u={u} uiDark={uiDark} onToggleTheme={toggleTheme} /></>;

  if (screen === "tutorial") return <><style>{GCSS}</style><TutorialPage u={u} uiDark={uiDark} onToggleTheme={toggleTheme} onBack={() => setScreen("app")} /></>;

  if (screen === "app") return (
    <><style>{GCSS}</style>
      <AppShell user={user} u={u} uiDark={uiDark} onToggleTheme={toggleTheme} tab={uiTab} setTab={setUiTab} onLogout={logout}>
        {uiTab === "dashboard" && <Dashboard user={user} u={u} onStart={startExp} onProfile={() => setUiTab("profile")} onTutorial={() => setScreen("tutorial")} onReport={() => setUiTab("report")} />}
        {uiTab === "report" && <ReportScreen user={user} u={u} onBack={() => setUiTab("dashboard")} />}
        {uiTab === "profile"   && <ProfilePage user={user} u={u} onSave={upd => setUser(upd)} />}
        {uiTab === "patterns"  && <PatternsTab user={user} u={u} />}
        {uiTab === "comfort"   && <VisualComfortTab user={user} u={u} />}
        {uiTab === "objective" && <ObjectiveTab user={user} u={u} />}
        {uiTab === "workload"  && <WorkloadTab  user={user} u={u} />}
      </AppShell>
    </>
  );

  if (screen === "demographics") return <><style>{GCSS}</style><Wrap><DemographicsSc u={u} onDone={saveDem} /></Wrap></>;
  if (screen === "consent") return <><style>{GCSS}</style><Wrap><ConsentSc u={u} user={user} firstTheme={p1Theme || "dark"} onAccept={() => setScreen("instructions")} onDecline={goHome} /></Wrap></>;
  if (screen === "instructions") return <><style>{GCSS}</style><TimeoutOverlay /><Wrap><InstructionsSc u={u} phase={phase} theme={curTheme} onBegin={beginPhase} /></Wrap></>;
  if (screen === "preference") return <><style>{GCSS}</style><TimeoutOverlay /><Wrap><PreferenceSc u={u} onDone={handlePref} /></Wrap></>;
  if (screen === "debrief") return <><style>{GCSS}</style><Wrap><DebriefSc u={u} user={user} onHome={goHome} /></Wrap></>;
  if (screen === "nasa_tlx") return <><style>{GCSS}</style><TimeoutOverlay /><div style={{ minHeight: "100vh", background: u.bg, padding: `${L.sp2Xl}px ${L.spLg}px` }}><NasaTLXScreen u={u} onDone={handleNASA} /></div></>;
  if (screen === "phase_comfort") return <><style>{GCSS}</style><TimeoutOverlay /><div style={{ minHeight: "100vh", background: u.bg, padding: `${L.sp2Xl}px ${L.spLg}px` }}><PostPhaseComfortSurvey u={u} phase={phase} theme={curTheme} onDone={handleComfort} /></div></>;

  if (screen === "break") return (
    <><style>{GCSS}</style><TimeoutOverlay />
      <div style={{ minHeight: "100vh", background: u.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: L.font }}>
        <div style={{ maxWidth: 480, textAlign: "center", padding: `${L.spXl}px ${L.spLg}px` }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: L.fsXs, color: u.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Phase 1 Complete</div>
          <h2 style={{ fontSize: L.fs2Xl, fontWeight: L.fwBlack, color: u.text, margin: "0 0 16px", letterSpacing: -1 }}>Well done!</h2>
          <p style={{ color: u.text2, fontSize: L.fsMd, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
            Take a short rest. Phase 2 uses the <strong style={{ color: curTheme === "dark" ? u.accent2 : u.gold }}>{curTheme} interface</strong> — same tasks, different theme.
          </p>
          <Btn u={u} v="grad" onClick={handleBreak}>Begin Phase 2 →</Btn>
        </div>
      </div>
    </>
  );

  if (screen === "task_brief") return (
    <><style>{GCSS}</style><TimeoutOverlay />
      <ExpPage>
        <div style={{ maxWidth: L.taskW, margin: "0 auto", textAlign: "center", fontFamily: L.font }}>
          <div style={{ fontSize: L.fsXs, color: t.textFaint, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: L.spMd }}>Task {taskIdx + 1} of {totalTasks}</div>
          <h2 style={{ fontSize: L.fsXl, fontWeight: L.fwBold, color: t.text, margin: `0 0 ${L.spMd}px`, letterSpacing: -.5 }}>{CFG.TL[curType]}</h2>
          <p style={{ color: t.textMuted, fontSize: L.fsMd, maxWidth: 420, margin: `0 auto ${L.spXl}px`, lineHeight: 1.7 }}>{CFG.TD[curType]}</p>
          <div style={{ display: "inline-block", padding: `${L.spSm}px ${L.spLg}px`, borderRadius: R.pill, background: t.surface, border: `1px solid ${t.border}`, fontSize: L.fsSm, color: t.textFaint, marginBottom: L.spXl }}>
            {CFG.TN[curType]} trial{CFG.TN[curType] !== 1 ? "s" : ""} · {curTheme} theme{CFG.RT.includes(curType) ? " · RT measured" : ""}
          </div>
          <div>
            <button onClick={() => setScreen("task")} style={{ height: L.btnH, padding: "0 36px", borderRadius: R.md, border: "none", background: t.accent, color: t.accentFg, fontSize: L.fsBase, fontWeight: L.fwSemi, fontFamily: L.font, cursor: "pointer" }}>Begin Task →</button>
          </div>
        </div>
      </ExpPage>
    </>
  );

  if (screen === "task" && taskData) {
    const TC = TCOMPS[curType];
    const curData = taskData?.seq ? taskData : (Array.isArray(taskData) ? taskData[trialIdx] : taskData);
    return (
      <><style>{GCSS}</style><TimeoutOverlay />
        {/* Touch event wrapper — captures touch path, duration, radius across all task types */}
        <div
          onTouchStart={tracker.onTouchStart} onTouchEnd={tracker.onTouchEnd} onTouchMove={tracker.onTouchMove}
          onClickCapture={e => { const r = e.currentTarget.getBoundingClientRect(); tracker.captureClick(e.clientX, e.clientY, r); }}
          style={{ minHeight:"100vh" }}>
          <ExpPage showProgress>
            <div style={{ maxWidth: L.taskW, margin: "0 auto" }}>
              {TC && <TC key={`${curType}-${trialIdx}-p${phase}`} t={t} data={curData} idx={trialIdx} total={taskData?.seq ? taskData.n : taskData.length} onDone={handleTrialDone} tracker={tracker} />}
            </div>
          </ExpPage>
        </div>
      </>
    );
  }

  return <><style>{GCSS}</style><div style={{ minHeight: "100vh", background: u.bg, display: "flex", alignItems: "center", justifyContent: "center", color: u.text3, fontFamily: L.font }}>Loading…</div></>;
}

