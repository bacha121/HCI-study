import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  text:"#dde4f0", text2:"rgba(221,228,240,0.80)", text3:"rgba(221,228,240,0.55)",
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
  text:"#0d1117", text2:"rgba(13,17,23,0.75)", text3:"rgba(13,17,23,0.52)",
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

  // save — writes locally AND syncs to Supabase with retry
  save: (u) => {
    const a = db.all();
    const i = a.findIndex(x => x.id === u.id);
    if (i >= 0) a[i] = u; else a.push(u);
    try { localStorage.setItem(K.u, JSON.stringify(a)); } catch {}
    if (!supa) return;
    const payload = { id: u.id, data: u, updated_at: new Date().toISOString() };
    const attempt = (tries) => {
      supa.from("participants").upsert(payload).then(({ error }) => {
        if (error) {
          console.warn("Supabase sync error:", error.message);
          if (tries > 0) setTimeout(() => attempt(tries - 1), 2000);
        }
      }).catch(err => {
        if (tries > 0) setTimeout(() => attempt(tries - 1), 2000);
      });
    };
    attempt(3); // up to 3 retry attempts
  },

  // syncFromCloud — pulls all Supabase rows into localStorage, cloud is source of truth
  syncFromCloud: async () => {
    if (!supa) return 0;
    try {
      const { data, error } = await supa.from("participants").select("data");
      if (error || !data?.length) return 0;
      const cloud = data.map(r => r.data).filter(Boolean);
      const local = db.all();
      // Cloud wins: merge local-only participants + all cloud participants (cloud is authoritative)
      const localOnly = local.filter(l => !cloud.find(c => c.id === l.id));
      const merged = [...localOnly, ...cloud];
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
  // Normal CDF approximation (Abramowitz & Stegun)
  normalCDF: z => {
    const t2 = 1 / (1 + 0.2316419 * Math.abs(z));
    const d2 = 0.3989423 * Math.exp(-z * z / 2);
    const p2 = d2 * t2 * (0.3193815 + t2 * (-0.3565638 + t2 * (1.7814779 + t2 * (-1.8212560 + t2 * 1.3302744))));
    return z > 0 ? 1 - p2 : p2;
  },
  // Observed statistical power for paired t-test
  power: (cohensD, n, alpha) => {
    if (!cohensD || !n || n < 2) return null;
    const za = alpha <= 0.005 ? 2.838 : 1.960;
    const ncp = Math.abs(cohensD) * Math.sqrt(n);
    const z1 = ncp - za;
    const t3 = 1 / (1 + 0.2316419 * Math.abs(z1));
    const d3 = 0.3989423 * Math.exp(-z1 * z1 / 2);
    const pw = d3 * t3 * (0.3193815 + t3 * (-0.3565638 + t3 * (1.7814779 + t3 * (-1.8212560 + t3 * 1.3302744))));
    const power = z1 > 0 ? 1 - pw : pw;
    return Math.min(0.9999, Math.max(0.0001, power));
  },
  // Wilcoxon signed-rank test
  wilcoxon: (a, b) => {
    const n = Math.min(a.length, b.length);
    if (n < 4) return null;
    const diffs = a.slice(0, n).map((v, i) => v - b[i]).filter(d => d !== 0);
    if (diffs.length < 2) return null;
    const sorted = [...diffs.map((d, i) => ({ v: Math.abs(d), sign: d > 0 ? 1 : -1, i }))].sort((x, y) => x.v - y.v);
    sorted.forEach((x, i) => { x.rank = i + 1; });
    const W = sorted.filter(x => x.sign > 0).reduce((s, x) => s + x.rank, 0);
    const nd = diffs.length;
    const mu = nd * (nd + 1) / 4;
    const sigma2 = Math.sqrt(nd * (nd + 1) * (2 * nd + 1) / 24);
    if (!sigma2) return null;
    const z = (W - mu) / sigma2;
    const t4 = 1/(1+0.2316419*Math.abs(z)), d4=0.3989423*Math.exp(-z*z/2);
    const pw2 = d4*t4*(0.3193815+t4*(-0.3565638+t4*(1.7814779+t4*(-1.8212560+t4*1.3302744))));
    const pv = 2 * Math.min(0.5, z > 0 ? pw2 : 1 - pw2);
    return { W: +W.toFixed(1), z: +z.toFixed(3), p: +pv.toFixed(4), sig: pv < 0.05, n: nd };
  },
  // Independent samples t-test (Welch's) for order effect
  independentT: (a, b) => {
    if (a.length < 2 || b.length < 2) return null;
    const ma = stat.mean(a), mb = stat.mean(b);
    const sa = stat.sd(a), sb = stat.sd(b);
    if (!sa || !sb) return null;
    const na = a.length, nb = b.length;
    const se = Math.sqrt(sa*sa/na + sb*sb/nb);
    const tv = (ma - mb) / se;
    const df = Math.pow(sa*sa/na + sb*sb/nb, 2) / (Math.pow(sa*sa/na, 2)/(na-1) + Math.pow(sb*sb/nb, 2)/(nb-1));
    const pv = tTailP(tv, df);
    const pooled = Math.sqrt(((na-1)*sa*sa + (nb-1)*sb*sb) / (na+nb-2));
    const dv = pooled ? (ma - mb) / pooled : null;
    return { t: +tv.toFixed(3), p: pv ? +pv.toFixed(4) : null, df: Math.round(df), meanA: +ma.toFixed(4), meanB: +mb.toFixed(4), cohensD: dv ? +dv.toFixed(3) : null, sig: pv != null && pv < 0.05 };
  },
};
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

  // Per-participant paired data — use ONLY the first valid session per theme
  const pairs = valid.map(u => {
    const row = { pid: u.id, name: u.name, enc: u._enc };
    for (const theme of ["dark","light"]) {
      // Take only the FIRST complete session for each theme
      const sess = (u.experiments||[]).filter(e => e.theme === theme && (e.tasks||[]).length > 0);
      if (!sess.length) { row[theme] = null; continue; }
      const s0 = sess[0]; // first session only
      const trials = (s0.tasks||[]).flatMap(t => t.trials||[]);
      const tlx = s0.nasaTLX || {};
      const comfort = s0.comfort || {};
      row[theme] = {
        acc:    trials.length ? stat.mean(trials.map(t=>t.acc??0)) : null,
        tt:     trials.length ? stat.mean(trials.map(t=>t.tt??0))  : null,
        rt:     trials.filter(t=>t.rt).length ? stat.mean(trials.filter(t=>t.rt).map(t=>t.rt)) : null,
        err:    trials.length ? stat.mean(trials.map(t=>t.err??0)) : null,
        clicks: trials.length ? stat.mean(trials.map(t=>t.cl??0))  : null,
        path:   trials.length ? stat.mean(trials.map(t=>t.path??0)): null,
        idle:   trials.length ? stat.mean(trials.map(t=>t.idle??0)): null,
        nasa:   tlx.totalScore||null,
        nasaMD: tlx.md||null, nasaPD: tlx.pd||null, nasaTD: tlx.td||null,
        nasaPE: tlx.pe||null, nasaEF: tlx.ef||null, nasFR: tlx.fr||null,
        vc: comfort.visualComfort||null,
        es: comfort.eyeStrain||null,
        fa: comfort.fatigue||null,
        sa: comfort.satisfaction||null,
        sessionCount: sess.length, // flag duplicates
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

  // ── Statistical tests — effect-size primary, α=.05 uncorrected, FDR supplementary ──
  const TEST_KEYS   = ["acc","tt","rt","err","nasa","nasFR","nasaMD","vc","es","fa","sa"];
  const N_TESTS     = TEST_KEYS.length;
  const ALPHA_RAW   = 0.05;                    // primary threshold (exploratory)
  const ALPHA_BONF  = ALPHA_RAW / N_TESTS;     // reference only (0.0045)

  // Step 1 — run all paired t-tests
  const rawTests = Object.fromEntries(TEST_KEYS.map(k => {
    const paired = pairs.map(p=>[p.dark[k],p.light[k]]).filter(([a,b])=>a!=null&&b!=null);
    if (paired.length < 2) return [k, null];
    const result = stat.pairedT(paired.map(p=>p[0]), paired.map(p=>p[1]));
    return [k, result || null];
  }));

  // Step 2 — Benjamini-Hochberg FDR correction
  const validKeys  = TEST_KEYS.filter(k => rawTests[k]?.p != null);
  const sortedByP  = [...validKeys].sort((a,b) => rawTests[a].p - rawTests[b].p);
  const fdrThresh  = {};
  let lastSig = -1;
  sortedByP.forEach((k, i) => {
    const threshold = ((i + 1) / N_TESTS) * ALPHA_RAW;
    if (rawTests[k].p <= threshold) lastSig = i;
  });
  sortedByP.forEach((k, i) => { fdrThresh[k] = i <= lastSig; });

  // Step 3 — assemble final tests object with all three significance levels
  const tests = Object.fromEntries(TEST_KEYS.map(k => {
    const r = rawTests[k]; if (!r) return [k, null];
    const p = r.p;
    const pBonf = p != null ? Math.min(1, p * N_TESTS) : null;
    return [k, {
      ...r,
      sig:       p != null && p < ALPHA_RAW,          // PRIMARY: uncorrected α = .05
      fdrSig:    fdrThresh[k] ?? false,               // SUPPLEMENTARY: FDR corrected
      bonferroni: p != null && p < ALPHA_BONF,        // REFERENCE: Bonferroni (strict)
      marginal:  false,                               // not used with uncorrected α
      pBonf,
      pBonferroniAdj: pBonf,
    }];
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


  // ── Power analysis per test ──────────────────────────────────────────────────
  const power = Object.fromEntries(Object.entries(tests).map(([k, t]) => {
    if (!t?.cohensD || !pairs.length) return [k, null];
    const pw = stat.power(t.cohensD, pairs.length, ALPHA_BONF);
    return [k, pw != null ? +pw.toFixed(3) : null];
  }));

  // ── Wilcoxon signed-rank (non-parametric fallback) ───────────────────────────
  const wilcoxon = Object.fromEntries(["acc","rt","err","nasa","vc","es","fa","sa"].map(k => {
    const paired = pairs.map(p=>[p.dark[k],p.light[k]]).filter(([a,b])=>a!=null&&b!=null);
    if (paired.length < 4) return [k, null];
    return [k, stat.wilcoxon(paired.map(p=>p[0]), paired.map(p=>p[1]))];
  }));

  // ── Order effect check (DL vs LD independent t-test) ────────────────────────
  const dlPairs = pairs.filter(p => {
    const u2 = valid.find(u3 => u3.id === p.pid);
    return u2?.orderGroup === "DL";
  });
  const ldPairs = pairs.filter(p => {
    const u2 = valid.find(u3 => u3.id === p.pid);
    return u2?.orderGroup === "LD";
  });
  const orderEffect = ["acc","rt","nasa"].reduce((acc2, k) => {
    const dlVals = dlPairs.map(p => (p.dark[k]??0) - (p.light[k]??0)).filter(v=>v!=null);
    const ldVals = ldPairs.map(p => (p.dark[k]??0) - (p.light[k]??0)).filter(v=>v!=null);
    acc2[k] = dlVals.length >= 2 && ldVals.length >= 2 ? stat.independentT(dlVals, ldVals) : null;
    return acc2;
  }, {});

  // ── Practice effect (Phase 1 vs Phase 2 regardless of theme) ────────────────
  const p1Scores = valid.map(u2 => {
    const exps2 = (u2.experiments||[]).filter(e=>(e.tasks||[]).length>0);
    const s = exps2[0]; if (!s) return null;
    const trials = (s.tasks||[]).flatMap(t=>t.trials||[]);
    return trials.length ? avg(trials.map(t=>t.acc||0)) : null;
  }).filter(v=>v!=null);
  const p2Scores = valid.map(u2 => {
    const exps2 = (u2.experiments||[]).filter(e=>(e.tasks||[]).length>0);
    const s = exps2[1]; if (!s) return null;
    const trials = (s.tasks||[]).flatMap(t=>t.trials||[]);
    return trials.length ? avg(trials.map(t=>t.acc||0)) : null;
  }).filter(v=>v!=null);
  const practiceEffect = p1Scores.length >= 2 && p2Scores.length >= 2 && p1Scores.length === p2Scores.length
    ? stat.pairedT(p1Scores, p2Scores) : null;

  // ── Correlation matrix (key metrics) ────────────────────────────────────────
  const CORR_KEYS = ["acc","rt","err","nasa","vc","es","sa"];
  const CORR_LABELS = ["Accuracy","Resp. Time","Error Rate","NASA Total","Visual Comfort","Eye Strain","Satisfaction"];
  const allScores = CORR_KEYS.map(k => pairs.map(p => (p.dark[k]??p.light[k])).filter(v=>v!=null));
  const corrMatrix = CORR_KEYS.map((k1, i) => CORR_KEYS.map((k2, j) => {
    if (i === j) return 1;
    const a2 = pairs.map(p=>p.dark[k1]??p.light[k1]).filter(v=>v!=null);
    const b2 = pairs.map(p=>p.dark[k2]??p.light[k2]).filter(v=>v!=null);
    const n2 = Math.min(a2.length, b2.length);
    return n2 >= 3 ? stat.pearson(a2.slice(0,n2), b2.slice(0,n2)) : null;
  }));

  // ── Per-task paired t-tests ──────────────────────────────────────────────────
  const taskTests = taskBreak.map(task => {
    const a2 = pairs.map(p => {
      const dkTrials = (p.dark?.trials||[]).filter(t=>t.taskType===task.tid||t.task===task.tid);
      return dkTrials.length ? avg(dkTrials.map(t=>t.acc||0)) : null;
    }).filter(v=>v!=null);
    const b2 = pairs.map(p => {
      const ltTrials = (p.light?.trials||[]).filter(t=>t.taskType===task.tid||t.task===task.tid);
      return ltTrials.length ? avg(ltTrials.map(t=>t.acc||0)) : null;
    }).filter(v=>v!=null);
    const n2 = Math.min(a2.length, b2.length);
    return { tid: task.tid, label: task.label, test: n2 >= 2 ? stat.pairedT(a2.slice(0,n2), b2.slice(0,n2)) : null };
  });

  // ── Pattern analyses ─────────────────────────────────────────────────────────
  const gm = (p, theme, key) => {
    const vals = (p[theme]?.trials||[]).map(t=>t[key]).filter(v=>v!=null&&!isNaN(v));
    return vals.length ? avg(vals) : null;
  };

  // P1 — Age group × theme
  const ageGroups = { 'Young (18–24)':[18,24], 'Adult (25–34)':[25,34], 'Senior (35+)':[35,99] };
  const patternAge = Object.entries(ageGroups).map(([label,[lo,hi]])=>{
    const sub = pairs.filter(p=>{ const a=parseFloat(p.dem?.age); return !isNaN(a)&&a>=lo&&a<=hi; });
    if(sub.length<3) return null;
    const dkAcc=sub.map(p=>gm(p,'dark','acc')).filter(v=>v!=null);
    const ltAcc=sub.map(p=>gm(p,'light','acc')).filter(v=>v!=null);
    const dkNasa=sub.map(p=>p.dark?.nasa).filter(v=>v!=null);
    const ltNasa=sub.map(p=>p.light?.nasa).filter(v=>v!=null);
    return { label, n:sub.length,
      dkAcc:avg(dkAcc), ltAcc:avg(ltAcc), diffAcc:+(avg(dkAcc)-avg(ltAcc)).toFixed(3),
      dkNasa:avg(dkNasa), ltNasa:avg(ltNasa), diffNasa:+(avg(dkNasa||[])-avg(ltNasa||[])).toFixed(2) };
  }).filter(Boolean);

  // P2 — Gender × theme
  const patternGender = ['Male','Female','Other'].map(gender=>{
    const sub = pairs.filter(p=>p.dem?.gender===gender);
    if(sub.length<3) return null;
    const dkAcc=sub.map(p=>gm(p,'dark','acc')).filter(v=>v!=null);
    const ltAcc=sub.map(p=>gm(p,'light','acc')).filter(v=>v!=null);
    const dkVc=sub.map(p=>p.dark?.vc).filter(v=>v!=null);
    const ltVc=sub.map(p=>p.light?.vc).filter(v=>v!=null);
    return { label:gender, n:sub.length,
      dkAcc:avg(dkAcc), ltAcc:avg(ltAcc), diffAcc:+(avg(dkAcc)-avg(ltAcc)).toFixed(3),
      dkVc:avg(dkVc), ltVc:avg(ltVc), diffVc:+(avg(dkVc||[])-avg(ltVc||[])).toFixed(2) };
  }).filter(Boolean);

  // P3 — Preference–performance alignment
  let prefMatch=0, prefMismatch=0, prefTie=0;
  const matchGaps=[], mismatchGaps=[];
  pairs.forEach(p=>{
    const pref=p.pref; const dkA=gm(p,'dark','acc'); const ltA=gm(p,'light','acc');
    if(!pref||dkA==null||ltA==null) return;
    const better=dkA-ltA>0.02?'dark':ltA-dkA>0.02?'light':'tie';
    if(better==='tie'){prefTie++;return;}
    if(pref===better){prefMatch++;matchGaps.push(Math.abs(dkA-ltA));}
    else{prefMismatch++;mismatchGaps.push(Math.abs(dkA-ltA));}
  });
  const patternPrefAlign = { match:prefMatch, mismatch:prefMismatch, tie:prefTie,
    total:prefMatch+prefMismatch+prefTie,
    matchPct:+((prefMatch/(prefMatch+prefMismatch+prefTie||1))*100).toFixed(1),
    avgMatchGap:matchGaps.length?+(avg(matchGaps)).toFixed(3):null,
    avgMismatchGap:mismatchGaps.length?+(avg(mismatchGaps)).toFixed(3):null };

  // P4 — Task complexity tiers
  const SIMPLE=['visual_search','flanker','symbol_match'];
  const MEDIUM=['sentence_verify','n_back','digit_span','trail_making','nav_task'];
  const COMPLEX=['reading_comp','memory_recall','email_sel','form_fill','comparison'];
  const complexityTiers = [['Simple',SIMPLE],['Medium',MEDIUM],['Complex',COMPLEX]].map(([label,tasks])=>{
    const dkAcc=pairs.flatMap(p=>(p.dark?.trials||[]).filter(t=>tasks.includes(t.taskType||t.task)).map(t=>t.acc)).filter(v=>v!=null);
    const ltAcc=pairs.flatMap(p=>(p.light?.trials||[]).filter(t=>tasks.includes(t.taskType||t.task)).map(t=>t.acc)).filter(v=>v!=null);
    if(!dkAcc.length||!ltAcc.length) return null;
    return { label, tasks:tasks.length, dkAcc:+avg(dkAcc).toFixed(3), ltAcc:+avg(ltAcc).toFixed(3), diff:+(avg(dkAcc)-avg(ltAcc)).toFixed(3) };
  }).filter(Boolean);

  // P5 — High vs low performers
  const perfRanked=[...pairs].map(p=>({ p, overall:avg([gm(p,'dark','acc'),gm(p,'light','acc')].filter(v=>v!=null)) })).filter(x=>x.overall!=null).sort((a,b)=>a.overall-b.overall);
  const third=Math.floor(perfRanked.length/3);
  const perfGroups = [['Low performers',perfRanked.slice(0,third)],['High performers',perfRanked.slice(2*third)]].map(([label,grp])=>{
    const sub=grp.map(x=>x.p);
    const dkAcc=sub.map(p=>gm(p,'dark','acc')).filter(v=>v!=null);
    const ltAcc=sub.map(p=>gm(p,'light','acc')).filter(v=>v!=null);
    const dkN=sub.map(p=>p.dark?.nasa).filter(v=>v!=null);
    const ltN=sub.map(p=>p.light?.nasa).filter(v=>v!=null);
    return { label, n:sub.length,
      dkAcc:avg(dkAcc)?+avg(dkAcc).toFixed(3):null, ltAcc:avg(ltAcc)?+avg(ltAcc).toFixed(3):null,
      diffAcc:dkAcc.length&&ltAcc.length?+(avg(dkAcc)-avg(ltAcc)).toFixed(3):null,
      dkNasa:dkN.length?+avg(dkN).toFixed(2):null, ltNasa:ltN.length?+avg(ltN).toFixed(2):null };
  });

  // P6 — Individual winners
  let dkWin=0,ltWin=0,tied=0; const dkGaps=[],ltGaps=[];
  pairs.forEach(p=>{ const dk=gm(p,'dark','acc'),lt=gm(p,'light','acc'); if(!dk||!lt) return;
    const d=dk-lt; if(d>0.02){dkWin++;dkGaps.push(d);} else if(d<-0.02){ltWin++;ltGaps.push(-d);} else tied++; });
  const individualWinners = { dkWin, ltWin, tied, total:dkWin+ltWin+tied,
    dkAvgGap:dkGaps.length?+avg(dkGaps).toFixed(3):null,
    ltAvgGap:ltGaps.length?+avg(ltGaps).toFixed(3):null };

  // P7 — Phase order effect on dark mode
  const phaseOrderEffect = { darkPhase1:null, darkPhase2:null, lightPhase1:null, lightPhase2:null };
  const dlPairs2=pairs.filter(p=>p.group==='DL'), ldPairs2=pairs.filter(p=>p.group==='LD');
  if(dlPairs2.length) phaseOrderEffect.darkPhase1=+avg(dlPairs2.map(p=>gm(p,'dark','acc')).filter(v=>v!=null)).toFixed(3);
  if(ldPairs2.length) phaseOrderEffect.darkPhase2=+avg(ldPairs2.map(p=>gm(p,'dark','acc')).filter(v=>v!=null)).toFixed(3);
  if(dlPairs2.length) phaseOrderEffect.lightPhase2=+avg(dlPairs2.map(p=>gm(p,'light','acc')).filter(v=>v!=null)).toFixed(3);
  if(ldPairs2.length) phaseOrderEffect.lightPhase1=+avg(ldPairs2.map(p=>gm(p,'light','acc')).filter(v=>v!=null)).toFixed(3);

  return { n: valid.length, issues, pairs, desc, tests, taskBreak, correlations, allAcc, allTT, METRICS, counterbalance, szLabel, derivedMetrics, demoSummary, reliability, power, wilcoxon, orderEffect, practiceEffect, corrMatrix, corrKeys: CORR_KEYS, corrLabels: CORR_LABELS, taskTests,
    patternAge, patternGender, patternPrefAlign, complexityTiers, perfGroups, individualWinners, phaseOrderEffect,
    insufficient: false };
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
function applySettings() {
  const s = loadSettings();
  if (s.trialCounts) Object.assign(CFG.TN, s.trialCounts);
}
applySettings(); // apply on startup


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
    const len = 4 + Math.floor(Math.random() * 2);
    return { digits: Array.from({ length: len }, () => Math.floor(Math.random() * 10)) };
  },
  n_back() {
    const AL = "BCDFGHJKLMNPQRSTVWXZ".split("");
    const n = CFG.TN.n_back;
    const seq = [AL[Math.floor(Math.random() * AL.length)]];
    const targets = [false];
    for (let i = 1; i < n; i++) {
      const isTarget = Math.random() < 0.35;
      if (isTarget) { seq.push(seq[i-1]); targets.push(true); }
      else { let l; do { l = AL[Math.floor(Math.random()*AL.length)]; } while (l===seq[i-1]); seq.push(l); targets.push(false); }
    }
    return { seq, targets, n };
  },
  nav_task() {
    const TREE = {
      Settings:  ["Profile Settings","Notifications","Privacy","Security","Language","Accessibility","Theme","Data Export"],
      Dashboard: ["Overview","Analytics","Reports","Live Monitor","Metrics","Activity Log","Exports","Insights"],
      Account:   ["My Profile","Billing","Subscription","Usage","API Keys","Connected Apps","Sessions","Delete Account"],
      Help:      ["Getting Started","FAQs","Video Tutorials","Contact Support","Release Notes","Community","Status","Feedback"],
      Tools:     ["Import Data","Export Data","Templates","Integrations","Automation","Scheduler","Bulk Edit","Archive"],
    };
    const roots = Object.keys(TREE);
    const root  = roots[Math.floor(Math.random() * roots.length)];
    const items = TREE[root];
    const item  = items[Math.floor(Math.random() * items.length)];
    return { roots, tree: TREE, target: { root, item }, path: `${root} → ${item}` };
  },

};

// ─── EXPERIMENT ERROR BOUNDARY ───────────────────────────────────────────────────
// Tab-level error boundary — catches crashes in any tab without killing the app
class TabErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('Tab crash:', e, info); }
  render() {
    if (this.state.error) {
      const u = this.props.u;
      return (
        <div style={{ padding:24, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
          <div style={{ padding:20, borderRadius:12, background:`${u?.red||'#dc2626'}08`, border:`1px solid ${u?.red||'#dc2626'}22` }}>
            <div style={{ fontSize:14, fontWeight:700, color:u?.red||'#dc2626', marginBottom:8 }}>⚠ This tab encountered an error</div>
            <div style={{ fontSize:12, color:u?.text2||'#64748b', marginBottom:12, fontFamily:'monospace' }}>{this.state.error?.message}</div>
            <button onClick={() => this.setState({ error:null })} style={{ padding:'6px 16px', borderRadius:8, border:'none', background:u?.accent||'#4d8ef0', color:'#fff', cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class ExperimentErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e) { console.error("Experiment crash:", e); }
  render() {
    if (this.state.error) {
      const u = this.props.u;
      return (
        <div style={{ minHeight:"100vh", background:u?.bg||"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',system-ui,sans-serif", padding:24 }}>
          <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
          <div style={{ fontSize:18, fontWeight:700, color:u?.text||"#111", marginBottom:8 }}>Something went wrong</div>
          <div style={{ fontSize:13, color:u?.text2||"#64748b", marginBottom:24, textAlign:"center", maxWidth:320 }}>
            Your progress has been saved. Tap below to continue.
          </div>
          <button onClick={() => { this.setState({ error:null }); this.props.onReset?.(); }}
            style={{ padding:"12px 28px", borderRadius:10, border:"none", background:u?.accent||"#4d8ef0", color:"#fff", fontSize:15, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
            Continue Experiment →
          </button>
          <div style={{ marginTop:12, fontSize:11, color:u?.text3||"#94a3b8" }}>
            Error: {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  // Use only the FIRST valid session per theme to avoid contamination from repeated sessions
  const dkSess = exps.filter(e => e.theme === "dark"  && (e.tasks||[]).length > 0)[0];
  const ltSess = exps.filter(e => e.theme === "light" && (e.tasks||[]).length > 0)[0];
  const validSess = [dkSess, ltSess].filter(Boolean);
  if (!validSess.length) return null;
  const all = validSess.flatMap(e => (e.tasks || []).flatMap(t => (t.trials || []).map(tr => ({ ...tr, theme: e.theme, task: t.type }))));
  const dk = all.filter(t => t.theme === "dark"), lt = all.filter(t => t.theme === "light");
  const dkRTs = dk.filter(t => t.rt && t.rt > 50 && t.rt < 20000).map(t => t.rt);
  const ltRTs = lt.filter(t => t.rt && t.rt > 50 && t.rt < 20000).map(t => t.rt);
  const ALL_TASK_TYPES = Object.keys(CFG.TL);
  const byTask = Object.fromEntries(ALL_TASK_TYPES.map(tid => [tid, all.filter(t => t.task === tid)]));
  const tperf = Object.fromEntries(CFG.tasks.map(tid => [tid, { acc: avg(byTask[tid].map(t => t.acc || 0)), rt: avg(byTask[tid].filter(t => t.rt).map(t => t.rt)), n: byTask[tid].length }]));
  const accDk = avg(dk.map(t => t.acc || 0)), accLt = avg(lt.map(t => t.acc || 0));
  const efDk  = dkSess?.nasaTLX?.md || 0;
  const efLt  = ltSess?.nasaTLX?.md || 0;
  const comfortOf = (sess) => sess?.comfort ? { vc: sess.comfort.visualComfort||0, es: sess.comfort.eyeStrain||0, fa: sess.comfort.fatigue||0, sa: sess.comfort.satisfaction||0 } : { vc:0, es:0, fa:0, sa:0 };
  const comfortDk = comfortOf(dkSess);
  const comfortLt = comfortOf(ltSess);
  const rtDk = dkRTs.length ? avg(dkRTs) : null, rtLt = ltRTs.length ? avg(ltRTs) : null;
  const nasaDk = dkSess?.nasaTLX ? [dkSess.nasaTLX] : [];
  const nasaLt = ltSess?.nasaTLX ? [ltSess.nasaTLX] : [];
  const nasaTotalDk = nasaDk.length ? nasaDk[0].totalScore : null;
  const nasaTotalLt = nasaLt.length ? nasaLt[0].totalScore : null;
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
  const [items, setItems] = useState(() => (data?.items || []).map(i => ({ ...i })));
  const found = items.filter(i => i.hit && i.ok).length;
  useEffect(() => {
    if (!data?.items) return;
    setItems(data.items.map(i => ({ ...i }))); tracker.start(); setTimeout(() => tracker.setOnset(), 60);
  }, [data]);
  if (!data?.items) return null;
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
    if (!data?.dir) return;
    setPh("fix"); setDone(false); setFb(null); setLastRT(null); tracker.start();
    const t1 = setTimeout(() => { setPh("stim"); tracker.setOnset(); }, 650);
    return () => clearTimeout(t1);
  }, [data]);
  if (!data?.display) return null;
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

function SymbolMatchTask({ t, data, idx, total, onDone, tracker }) {
  const [sel, setSel] = useState(null);
  const ref = useRef(false);
  useEffect(() => { tracker.start(); tracker.setOnset(); }, []);

  const pick = item => {
    if (ref.current) return;
    ref.current = true;
    const ok = item === data.target;
    setSel(item);
    tracker.click(ok);
    const m = tracker.stop();
    setTimeout(() => onDone({ acc: ok ? 1 : 0, rt: m.rt, err: ok ? 0 : 1, cl: m.cl }), 600);
  };

  if (!data?.items) return null;
  return (
    <div style={{ textAlign:"center", padding:"0 8px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:4 }}>Trial {idx+1} of {total}</div>
      <div style={{ fontSize:13, color:t.muted, marginBottom:16 }}>Find the matching symbol</div>
      <div style={{ fontSize:"clamp(52px,15vw,72px)", fontFamily:L.mono, fontWeight:900, color:t.text, marginBottom:24, letterSpacing:4 }}>{data.target}</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"clamp(8px,2vw,12px)", maxWidth:280, margin:"0 auto" }}>
        {data.items.map((item,i) => {
          const picked = sel === item;
          const ok = item === data.target;
          let bg = t.surface, color = t.text, border = t.border;
          if (picked) { bg = ok ? t.successBg : t.errorBg; color = ok ? t.success : t.error; border = ok ? t.success : t.error; }
          return (
            <button key={i} onClick={() => pick(item)} style={{ height:"clamp(56px,15vw,68px)", borderRadius:R.md, border:`2px solid ${border}`, background:bg, color, fontSize:"clamp(20px,6vw,28px)", fontFamily:L.mono, fontWeight:700, cursor:ref.current?"default":"pointer", transition:"all .12s" }}>
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
  const [ans, setAns] = useState(null);
  const ref = useRef(false);
  useEffect(() => { tracker.start(); tracker.setOnset(); }, []);

  const respond = val => {
    if (ref.current) return;
    ref.current = true;
    const ok = val === data.a;
    setAns(val);
    tracker.click(ok);
    const m = tracker.stop();
    setTimeout(() => onDone({ acc: ok ? 1 : 0, rt: m.rt, err: ok ? 0 : 1, cl: m.cl }), 600);
  };

  if (!data?.s) return null;
  return (
    <div style={{ textAlign:"center", maxWidth:420, margin:"0 auto", padding:"0 12px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:8 }}>Trial {idx+1} of {total}</div>
      <div style={{ fontSize:13, color:t.muted, marginBottom:20 }}>Is this statement TRUE or FALSE?</div>
      <div style={{ fontSize:"clamp(17px,4.5vw,22px)", fontWeight:700, color:t.text, lineHeight:1.5, padding:"20px 24px", background:t.surface, borderRadius:R.lg, border:`1px solid ${t.border}`, marginBottom:28 }}>
        {data.s}
      </div>
      <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
        {[{ val:true, l:"✓  True" }, { val:false, l:"✗  False" }].map(({ val, l }) => {
          const picked = ans === val;
          const ok = val === data.a;
          const bg = picked ? (ok ? t.success : t.error) : t.accent;
          return (
            <button key={String(val)} onClick={() => respond(val)} disabled={ref.current}
              style={{ flex:1, maxWidth:160, height:"clamp(52px,13vw,60px)", borderRadius:R.md, border:"none", background:bg, color:"#fff", fontSize:"clamp(15px,4vw,18px)", fontWeight:700, fontFamily:L.font, cursor:ref.current?"default":"pointer", opacity:ref.current&&!picked?.4:1, transition:"all .15s" }}>
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TRAIL MAKING TASK ───────────────────────────────────────────────────────────
function TrailMakingTask({ t, data, idx, total, onDone, tracker }) {
  const [next, setNext] = useState(1);
  const [tapped, setTapped] = useState([]);
  const [hadErr, setHadErr] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(false);
  useEffect(() => { tracker.start(); tracker.setOnset(); }, []);

  const tap = n => {
    if (ref.current || done || tapped.includes(n)) return;
    if (n === next) {
      tracker.click(true);
      const newTapped = [...tapped, n];
      setTapped(newTapped);
      if (next === data.total) {
        ref.current = true;
        setDone(true);
        const m = tracker.stop();
        setTimeout(() => onDone({ acc: hadErr ? 0.6 : 1, rt: m.rt, err: hadErr ? 1 : 0, cl: m.cl }), 800);
      } else {
        setNext(next + 1);
      }
    } else {
      tracker.click(false);
      setHadErr(true);
    }
  };

  if (!data?.nodes) return null;
  const COLS = 5, ROWS = 4;
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
    node: data.nodes.find(nd => nd.x === i % COLS && nd.y === Math.floor(i / COLS)),
    ci: i,
  }));

  return (
    <div style={{ textAlign:"center", padding:"0 8px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:8 }}>Trial {idx+1} of {total} — Tap 1 → {data.total} in order</div>
      {done ? (
        <div style={{ fontSize:36, marginTop:40, color:t.success }}>✓ Done!</div>
      ) : (
        <>
          <div style={{ display:"inline-block", padding:"4px 16px", borderRadius:R.pill, background:`${t.accent}18`, color:t.accent, fontSize:13, fontWeight:700, marginBottom:16 }}>Next: {next}</div>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${COLS},1fr)`, gap:"clamp(6px,2vw,10px)", maxWidth:300, margin:"0 auto" }}>
            {cells.map(({ node, ci }) => {
              if (!node) return <div key={ci} style={{ height:"clamp(52px,13vw,62px)" }} />;
              const isDone = tapped.includes(node.n);
              const isNext = node.n === next;
              return (
                <button key={ci} onClick={() => tap(node.n)} style={{ height:"clamp(52px,13vw,62px)", borderRadius:"50%", border:`2.5px solid ${isDone?t.success:isNext?t.accent:t.border}`, background:isDone?t.successBg:isNext?`${t.accent}20`:t.surface, color:isDone?t.success:isNext?t.accent:t.text, fontSize:"clamp(17px,5vw,23px)", fontWeight:800, fontFamily:L.mono, cursor:"pointer", transition:"all .12s" }}>
                  {node.n}
                </button>
              );
            })}
          </div>
          {hadErr && <div style={{ fontSize:12, color:t.error, marginTop:10 }}>Wrong order — keep going in sequence</div>}
        </>
      )}
    </div>
  );
}

// ─── DIGIT SPAN TASK ─────────────────────────────────────────────────────────────
function DigitSpanTask({ t, data, idx, total, onDone, tracker }) {
  const [phase, setPhase] = useState("show");
  const [shown, setShown] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(null);
  const ref = useRef(false);

  useEffect(() => { tracker.start(); }, []);

  // Show digits one at a time
  useEffect(() => {
    if (phase !== "show") return;
    if (shown < data.digits.length) {
      const tid = setTimeout(() => setShown(s => s + 1), 750);
      return () => clearTimeout(tid);
    } else {
      const tid = setTimeout(() => { setPhase("recall"); tracker.setOnset(); }, 500);
      return () => clearTimeout(tid);
    }
  }, [phase, shown]);

  const submit = () => {
    if (ref.current || submitted) return;
    ref.current = true;
    const ok = input.trim() === data.digits.join("");
    setSubmitted(true);
    setCorrect(ok);
    tracker.click(ok);
    const m = tracker.stop();
    setTimeout(() => onDone({ acc: ok ? 1 : 0, rt: m.rt, err: ok ? 0 : 1, cl: m.cl }), 800);
  };

  const handleKey = e => { if (e.key === "Enter" && input.length >= (data?.digits?.length||0)) submit(); };

  if (!data?.digits) return null;
  return (
    <div style={{ textAlign:"center", padding:"0 12px", maxWidth:360, margin:"0 auto" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:8 }}>Trial {idx+1} of {total}</div>
      {phase === "show" ? (
        <>
          <div style={{ fontSize:13, color:t.muted, marginBottom:24 }}>Remember this sequence</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", minHeight:72, alignItems:"center" }}>
            {Array.from({ length: data.digits.length }, (_, i) => (
              <div key={i} style={{ width:"clamp(44px,11vw,56px)", height:"clamp(44px,11vw,56px)", borderRadius:R.md, background: i < shown ? t.surface : "transparent", border: i < shown ? `1px solid ${t.border}` : `1px dashed ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(22px,6vw,30px)", fontWeight:900, fontFamily:L.mono, color:t.text, transition:"all .2s" }}>
                {i < shown ? data.digits[i] : ""}
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color:t.muted, marginTop:12 }}>{shown < data.digits.length ? `${shown} of ${data.digits.length} digits shown…` : "Get ready to recall…"}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize:13, color:t.muted, marginBottom:20 }}>Enter the digits you just saw</div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            value={input}
            onChange={e => !submitted && setInput(e.target.value.replace(/\D/g,"").slice(0, data.digits.length))}
            onKeyDown={handleKey}
            style={{ width:"100%", height:60, borderRadius:R.md, border:`2px solid ${submitted ? (correct ? t.success : t.error) : t.accent}`, background:t.surface, color:t.text, fontSize:30, fontFamily:L.mono, fontWeight:700, textAlign:"center", letterSpacing:8, outline:"none", boxSizing:"border-box", WebkitAppearance:"none" }}
          />
          <div style={{ fontSize:12, color:t.muted, marginTop:6 }}>{data.digits.length} digit{data.digits.length > 1 ? "s" : ""} · tap each number</div>
          <button
            onClick={submit}
            disabled={submitted || input.length < data.digits.length}
            style={{ marginTop:20, width:"100%", height:52, borderRadius:R.md, border:"none", background: submitted || input.length < data.digits.length ? t.border : t.accent, color: submitted || input.length < data.digits.length ? t.muted : t.accentFg, fontSize:16, fontWeight:700, fontFamily:L.font, cursor: submitted || input.length < data.digits.length ? "default" : "pointer", transition:"all .15s" }}>
            {submitted ? (correct ? "✓ Correct!" : `✗ Answer: ${data.digits.join(" ")}`) : "Submit →"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── N-BACK TASK ─────────────────────────────────────────────────────────────────
function NBackTask2({ t, data, idx: startIdx, total, onDone, tracker }) {
  const [pos, setPos] = useState(0);
  const [showLetter, setShowLetter] = useState(true);
  const [canRespond, setCanRespond] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const responses = useRef([]);
  const done = useRef(false);

  useEffect(() => { tracker.start(); tracker.setOnset(); }, []);

  // Sequence driver
  useEffect(() => {
    if (done.current) return;
    setShowLetter(true);
    setCanRespond(false);
    setFeedback(null);
    const showTimer = setTimeout(() => {
      if (pos === 0) {
        // First item — no response needed, auto-advance after showing
        const nextTimer = setTimeout(() => setPos(1), 400);
        return () => clearTimeout(nextTimer);
      } else {
        setCanRespond(true);
      }
    }, 900);
    return () => clearTimeout(showTimer);
  }, [pos]);

  const finish = () => {
    done.current = true;
    const n = responses.current.length;
    const correct = responses.current.filter((r, i) => r === data.targets[i + 1]).length;
    const acc = n > 0 ? correct / n : 0;
    const m = tracker.stop();
    onDone({ acc, rt: m.rt, err: acc < 0.5 ? 1 : 0, cl: m.cl });
  };

  const respond = ans => {
    if (!canRespond || done.current || !data?.targets) return;
    setCanRespond(false);
    const correct = ans === data.targets[pos];
    setFeedback(correct ? "✓" : "✗");
    responses.current = [...responses.current, ans];
    setTimeout(() => {
      if (pos + 1 >= (data.seq?.length||0)) { finish(); }
      else { setPos(p => p + 1); }
    }, 450);
  };

  if (!data?.seq) return null;
  return (
    <div style={{ textAlign:"center", padding:"0 12px" }}>
      <div style={{ fontSize:11, color:t.muted, marginBottom:4 }}>Trial {startIdx+1} of {total}</div>
      <div style={{ fontSize:12, color:t.muted, marginBottom:8 }}>Item {pos+1} of {data.seq.length} — Same as the previous letter?</div>
      <div style={{ fontSize:"clamp(56px,18vw,86px)", fontFamily:L.mono, fontWeight:900, letterSpacing:4, color: feedback ? (feedback==="✓"?t.success:t.error) : t.text, minHeight:"clamp(80px,22vw,110px)", display:"flex", alignItems:"center", justifyContent:"center", transition:"color .2s" }}>
        {showLetter ? data.seq[pos] : ""}
      </div>
      {pos === 0 ? (
        <div style={{ fontSize:13, color:t.muted, padding:"12px 0" }}>Remember this letter…</div>
      ) : canRespond ? (
        <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
          {[{ l:"✓  Same", v:true }, { l:"✗  Different", v:false }].map(({ l, v }) => (
            <button key={String(v)} onClick={() => respond(v)} style={{ flex:1, maxWidth:150, height:"clamp(52px,13vw,60px)", borderRadius:R.md, border:"none", background:v?t.success:t.error, color:"#fff", fontSize:"clamp(14px,3.5vw,17px)", fontWeight:700, fontFamily:L.font, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
      ) : feedback ? (
        <div style={{ fontSize:28, fontWeight:900, color: feedback==="✓"?t.success:t.error }}>{feedback}</div>
      ) : (
        <div style={{ fontSize:13, color:t.muted, padding:"12px 0" }}>…</div>
      )}
      <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:16 }}>
        {data.seq.map((_, i) => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background: i<pos?t.success:i===pos?t.accent:t.border }} />)}
      </div>
    </div>
  );
}
// ─── SENTENCE VERIFY TASK ────────────────────────────────────────────────────────
function NavTask({ t, data, idx, total, onDone, tracker }) {
  const [openRoot, setOpenRoot] = useState(null);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState(0);
  useEffect(() => {
    if (!data?.roots) return;
    setOpenRoot(null); setDone(false); setErrors(0); tracker.start(); setTimeout(() => tracker.setOnset(), 60);
  }, [data]);
  if (!data?.roots || !data?.tree) return null;
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

  const dims = [{ l:"Attention", v:stats.cog?.attention||0 },{ l:"Inhibition", v:stats.cog?.inhibition||0 },{ l:"Analysis", v:stats.cog?.analysis||0 },{ l:"Reading", v:stats.cog?.reading||0 },{ l:"Decision", v:stats.cog?.decision||0 },{ l:"Precision", v:stats.cog?.precision||0 },{ l:"Memory", v:stats.cog?.memory||0 },{ l:"Navigation", v:stats.cog?.navigation||0 }];

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
          const tp = stats.tperf?.[tid];
          if (!tp) return null;
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
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5,6,7].map(n => {
        const active = value != null && n === Math.round(value);
        return (
          <div key={n} style={{ flex:1, height:36, borderRadius:R.sm, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:active?L.fwBold:L.fwNorm, transition:"all .2s", background:active?color:u.fill, border:`1px solid ${active?color:u.border}`, color:active?"#fff":u.text3 }}>
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

  const ComfortDimCard = ({ label, icon, anchor1, anchor2, higherBetter, dkVal, ltVal }) => {
    const dkBetter = dkVal!=null && ltVal!=null && (higherBetter ? dkVal>ltVal : dkVal<ltVal);
    const ltBetter = dkVal!=null && ltVal!=null && (higherBetter ? ltVal>dkVal : ltVal<dkVal);
    return (
      <div style={{ borderBottom:`1px solid ${u.border}`, paddingBottom:L.spLg, marginBottom:L.spLg }}>
        {/* Dimension label */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:L.spMd }}>
          <span style={{ fontSize:20 }}>{icon}</span>
          <div>
            <div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text }}>{label}</div>
            <div style={{ fontSize:L.fsXs, color:u.text3 }}>{anchor1} → {anchor2}</div>
          </div>
          {(dkBetter||ltBetter) && (
            <span style={{ marginLeft:"auto", fontSize:L.fsXs, padding:"2px 10px", borderRadius:R.pill, background:dkBetter?`${u.accent2}18`:`${u.gold}18`, color:dkBetter?u.accent2:u.gold, border:`1px solid ${dkBetter?u.accent2:u.gold}28`, whiteSpace:"nowrap" }}>
              {dkBetter?"🌙 Dark":"☀️ Light"} better
            </span>
          )}
        </div>
        {/* Dark row */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:L.fsXs, fontWeight:L.fwSemi, color:u.accent2 }}>🌙 Dark Mode</span>
            <span style={{ fontSize:L.fsSm, fontWeight:L.fwBold, color:u.accent2 }}>{dkVal!=null?`${dkVal}/7`:"—"}</span>
          </div>
          {dkVal != null ? <LikertRow value={dkVal} color={u.accent2} /> : <div style={{ fontSize:L.fsSm, color:u.text3, textAlign:"center", padding:8 }}>No data</div>}
        </div>
        {/* Light row */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:L.fsXs, fontWeight:L.fwSemi, color:u.gold }}>☀️ Light Mode</span>
            <span style={{ fontSize:L.fsSm, fontWeight:L.fwBold, color:u.gold }}>{ltVal!=null?`${ltVal}/7`:"—"}</span>
          </div>
          {ltVal != null ? <LikertRow value={ltVal} color={u.gold} /> : <div style={{ fontSize:L.fsSm, color:u.text3, textAlign:"center", padding:8 }}>No data</div>}
        </div>
        {/* Scale anchors */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:u.text3 }}>
          <span>1 — {anchor1}</span><span>7 — {anchor2}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding:`${L.spXl}px ${L.spLg}px`, fontFamily:L.font }} className="au">
      <SectionHdr u={u} eyebrow="Post-Phase Survey" title="Comfort Ratings" sub="Self-reported ratings collected after completing each interface phase. Scale: 1 (low) → 7 (high)." />

      {!hasData ? (
        <EmptyState u={u} icon="📋" title="No survey data yet" body="Comfort ratings are collected at the end of each experiment phase." />
      ) : (
        <Card u={u} style={{ padding:L.spLg }}>
          {COMFORT_DIMS.map(({ key, label, icon, anchor1, anchor2, higherBetter }) => (
            <ComfortDimCard key={key} label={label} icon={icon} anchor1={anchor1} anchor2={anchor2} higherBetter={higherBetter} dkVal={dkC?.[key]} ltVal={ltC?.[key]} />
          ))}
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
        <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
          <thead>
            <tr>
              <th style={{ ...thS, width:"28%" }}>Metric</th>
              <th style={{ ...thS, color:u.accent2, width:"18%", textAlign:"center" }}>🌙 Dark</th>
              <th style={{ ...thS, color:u.gold,    width:"18%", textAlign:"center" }}>☀️ Light</th>
              <th style={{ ...thS, width:"18%",     textAlign:"center" }}>Diff</th>
              <th style={{ ...thS, width:"18%",     textAlign:"center" }}>Better</th>
            </tr>
          </thead>
          <tbody>
            {[
              { metric:"Accuracy",      dk:stats.accDk,       lt:stats.accLt,       fmt:fmtPct,               higherBetter:true  },
              { metric:"Response Time", dk:stats.rtDk,        lt:stats.rtLt,        fmt:fmtMs,                higherBetter:false },
              { metric:"Errors",        dk:stats.errDk,       lt:stats.errLt,       fmt:v=>v!=null?Math.round(v)+"":"—", higherBetter:false },
              { metric:"NASA Load",     dk:stats.nasaTotalDk, lt:stats.nasaTotalLt, fmt:v=>v!=null?v.toFixed(1):"—",     higherBetter:false },
              { metric:"Mental",        dk:stats.efDk,        lt:stats.efLt,        fmt:v=>fmt(v,1),          higherBetter:false },
            ].map(({ metric, dk, lt, fmt:f, higherBetter }) => {
              const diff = dk!=null && lt!=null ? dk-lt : null;
              const dkBetter = diff!=null && (higherBetter ? diff>0 : diff<0);
              const ltBetter = diff!=null && (higherBetter ? diff<0 : diff>0);
              const diffDisplay = diff!=null ? (diff>0?"+":"")+f(diff) : "—";
              const diffColor = diff!=null ? (dkBetter?u.green:ltBetter?u.red:u.text3) : u.text3;
              return (
                <tr key={metric}>
                  <td style={{ ...tdS(u.text), fontSize:L.fsSm, wordBreak:"keep-all" }}>{metric}</td>
                  <td style={{ ...tdS(u.accent2), textAlign:"center", fontFamily:L.mono, fontSize:L.fsSm }}>{dk!=null?f(dk):"—"}</td>
                  <td style={{ ...tdS(u.gold),    textAlign:"center", fontFamily:L.mono, fontSize:L.fsSm }}>{lt!=null?f(lt):"—"}</td>
                  <td style={{ ...tdS(diffColor), textAlign:"center", fontFamily:L.mono, fontSize:L.fsSm }}>{diffDisplay}</td>
                  <td style={{ padding:"8px 6px", borderBottom:`1px solid ${u.border}`, textAlign:"center" }}>
                    {dkBetter && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:R.pill, background:`${u.accent2}18`, color:u.accent2, border:`1px solid ${u.accent2}28`, whiteSpace:"nowrap" }}>🌙 Dark</span>}
                    {ltBetter && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:R.pill, background:`${u.gold}18`, color:u.gold, border:`1px solid ${u.gold}28`, whiteSpace:"nowrap" }}>☀️ Light</span>}
                    {!dkBetter && !ltBetter && <span style={{ fontSize:10, color:u.text3 }}>—</span>}
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
                const tp = stats.tperf?.[tid];
                if (!tp || !tp.n) return null;
                return (
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
                );
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

function Dashboard({ user, u, onStart, startingExp, onProfile, onTutorial, onReport }) {
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
              {(() => {
                const doneExps = (user.experiments||[]).filter(e=>(e.tasks||[]).length>0);
                const isResume = doneExps.length === 1;
                const doneTheme = doneExps[0]?.theme;
                const pendTheme = doneTheme === "dark" ? "light" : "dark";
                return (
                  <>
                    <div>
                      <div style={{ fontSize: L.fsXs, color: u.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
                        {isResume ? "Resume Session" : "Start Session"}
                      </div>
                      <h3 style={{ fontSize: L.fsLg, fontWeight: L.fwBold, color: u.text, margin: 0 }}>Dark vs Light Mode Experiment</h3>
                      {isResume ? (
                        <p style={{ color: u.text2, fontSize: L.fsSm, marginTop: 4 }}>
                          Phase 1 ({doneTheme} mode) ✓ complete — Phase 2 ({pendTheme} mode) is pending.
                        </p>
                      ) : (
                        <p style={{ color: u.text2, fontSize: L.fsSm, marginTop: 4 }}>8 tasks · 2 phases · ~20 min · Response time measured · One attempt only</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: L.spSm, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {!isResume && <Btn u={u} v="ghost" onClick={onTutorial}>📖 Tutorial</Btn>}
                      <Btn u={u} v="grad" onClick={onStart} disabled={onStart.loading}>{isResume ? `Continue Phase 2 (${pendTheme}) →` : startingExp ? "Assigning group…" : "Begin Experiment →"}</Btn>
                    </div>
                  </>
                );
              })()}
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
              <Radar u={u} dims={[{ l:"Attention", v:stats.cog?.attention||0 }, { l:"Inhibition", v:stats.cog?.inhibition||0 }, { l:"Analysis", v:stats.cog?.analysis||0 }, { l:"Reading", v:stats.cog?.reading||0 }, { l:"Decision", v:stats.cog?.decision||0 }, { l:"Precision", v:stats.cog?.precision||0 }, { l:"Memory", v:stats.cog?.memory||0 }, { l:"Navigation", v:stats.cog?.navigation||0 }]} size={160} />
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
      <div style={{ width:230, height:"100vh", background:u.sidebar, borderRight:`1px solid ${u.sidebarBorder}`, display:"flex", flexDirection:"column", padding:18, position:"sticky", top:0, flexShrink:0, overflowY:"auto" }}>
        {/* Logo */}
        <div style={{ marginBottom:28, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🧠</div>
          <div>
            <div style={{ fontSize:L.fsMd, fontWeight:L.fwBold, color:u.text, letterSpacing:-.3 }}>CogBench</div>
            <div style={{ fontSize:L.fsXs, color:u.text3 }}>HCI Study</div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
          {nav.map(({ id, l }) => (
            <button key={id} onClick={() => setTab(id)} style={{ height:36, borderRadius:R.md, border:"none", background:tab===id?`${u.accent}14`:"transparent", color:tab===id?u.accent:u.text2, fontWeight:tab===id?L.fwSemi:L.fwNorm, textAlign:"left", padding:"0 11px", fontFamily:L.font, cursor:"pointer", fontSize:L.fsBase, transition:"all .15s" }}>{l}</button>
          ))}
        </nav>
        {/* Footer — user info + toggle + sign out */}
        <div style={{ borderTop:`1px solid ${u.border}`, paddingTop:14, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:L.fwBold, color:"#fff", flexShrink:0 }}>{user.name.slice(0,2).toUpperCase()}</div>
            <div style={{ overflow:"hidden", flex:1 }}>
              <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:L.fsXs, color:u.text3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</div>
            </div>
          </div>
          {/* Toggle + Sign out side by side */}
          <div style={{ display:"flex", gap:8 }}>
            <ThemeToggle uiDark={uiDark} onToggle={onToggleTheme} u={u} />
            <button onClick={onLogout} style={{ flex:1, height:32, borderRadius:R.md, border:`1px solid ${u.red}40`, background:`${u.red}08`, color:u.red, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, fontWeight:L.fwSemi }}>Sign Out</button>
          </div>
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
// ─── ANALYSIS TAB ─────────────────────────────────────────────────────────────────
// ─── ANALYSIS TAB ─────────────────────────────────────────────────────────────────
function AnalysisTab({ u, users }) {
  const res = useMemo(() => computeAnalysis(users), [users]);
  const [expanded, setExpanded] = useState({});
  const toggle = k => setExpanded(p => ({ ...p, [k]: !p[k] }));
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  const isDesktop = w >= 1024, isTablet = w >= 640;

  if (!res || res.insufficient === undefined) return (
    <div style={{ padding:40, textAlign:'center', color:u.text3, fontFamily:L.font }}>Computing…</div>
  );

  // ── Color system ──────────────────────────────────────────────────────────────
  const DK  = '#7c3aed';  // dark mode  — purple
  const LT  = '#d97706';  // light mode — amber
  const SIG = '#059669';  // significant — emerald
  const MAR = '#ea580c';  // marginal    — orange
  const NS  = u.text3;    // not sig     — muted

  if (res.insufficient) return (
    <div style={{ padding:48, fontFamily:L.font, maxWidth:520, margin:'0 auto', textAlign:'center' }}>
      <div style={{ width:56, height:56, borderRadius:16, background:`${u.accent}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 20px' }}>📊</div>
      <div style={{ fontSize:20, fontWeight:700, color:u.text, marginBottom:8 }}>Awaiting data</div>
      <div style={{ fontSize:14, color:u.text2, lineHeight:1.8 }}>At least 2 participants must complete both phases before paired comparisons can run. Currently <strong style={{ color:u.accent }}>{res.n}</strong> valid pair{res.n!==1?'s':''} available.</div>
    </div>
  );

  const { pairs, desc, tests, taskBreak, counterbalance:cb, szLabel:sz, allAcc, allTT, demoSummary, reliability,
    power:resPower={}, wilcoxon:resWilcoxon={}, orderEffect:resOrderEffect={},
    practiceEffect:pe=null, corrMatrix:CM=[], corrLabels:CL=[], taskTests:TT=[],
    patternAge=[], patternGender=[], patternPrefAlign=null, complexityTiers=[], perfGroups=[], individualWinners=null, phaseOrderEffect=null } = res;

  const N = pairs.length, NT = 11;
  const ALPHA = '0.050';   // primary: uncorrected
  const ALPHA_FDR = 'FDR'; // Benjamini-Hochberg
  const ALPHA_BONF_LABEL = (0.05/NT).toFixed(4); // reference only
  const TEST_ROWS = [
    { k:'acc',    l:'Accuracy',         hi:true  },
    { k:'rt',     l:'Response Time',    hi:false },
    { k:'tt',     l:'Completion Time',  hi:false },
    { k:'err',    l:'Error Rate',       hi:false },
    { k:'nasa',   l:'NASA-TLX Total',   hi:false },
    { k:'nasaMD', l:'Mental Demand',    hi:false },
    { k:'nasFR',  l:'Frustration',      hi:false },
    { k:'vc',     l:'Visual Comfort',   hi:true  },
    { k:'es',     l:'Eye Strain',       hi:false },
    { k:'fa',     l:'Fatigue',          hi:false },
    { k:'sa',     l:'Satisfaction',     hi:true  },
  ];

  const sigRows  = TEST_ROWS.filter(r => tests[r.k]?.sig);
  const margRows = TEST_ROWS.filter(r => tests[r.k]?.marginal);

  const fv = v => v==null||isNaN(v)?'—':Math.abs(v)>=100?Math.round(v)+'':Math.abs(v)>=10?v.toFixed(1):v.toFixed(3);
  const sigCol = t => t?.sig?SIG:t?.marginal?MAR:NS;
  const dCol   = d => d==null?NS:Math.abs(d)>=0.8?u.red:Math.abs(d)>=0.5?MAR:Math.abs(d)>=0.2?u.teal:NS;
  const rowBg  = t => t?.sig?`${SIG}08`:t?.marginal?`${MAR}06`:'transparent';

  // ── Sub-components ────────────────────────────────────────────────────────────
  const Chip = ({ label, color, bg }) => (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:600, color:color||u.text2, background:bg||`${color}12`, border:`1px solid ${color||u.border}20`, whiteSpace:'nowrap' }}>{label}</span>
  );

  const SectionWrap = ({ children, tight }) => (
    <div style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:16, overflow:'hidden', marginBottom:tight?16:28 }}>
      {children}
    </div>
  );

  const SHdr = ({ num, title, sub, action }) => (
    <div style={{ padding:`24px ${isTablet?32:20}px 20px`, borderBottom:`1px solid ${u.border}` }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
          <span style={{ fontSize:10, fontWeight:700, color:u.text3, letterSpacing:2, fontFamily:L.mono }}>{num}</span>
          <div>
            <div style={{ fontSize:isTablet?18:16, fontWeight:700, color:u.text, letterSpacing:-0.3 }}>{title}</div>
            {sub && <div style={{ fontSize:12, color:u.text3, marginTop:3, lineHeight:1.5 }}>{sub}</div>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );

  const ExpandToggle = ({ id, label }) => (
    <button onClick={() => toggle(id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:`1px solid ${u.border}`, background:'transparent', color:u.text2, fontSize:12, fontWeight:500, fontFamily:L.font, cursor:'pointer', whiteSpace:'nowrap' }}>
      <span style={{ fontSize:10, color:u.accent }}>{expanded[id]?'▾':'▸'}</span>
      {expanded[id]?'Collapse':'Expand'} {label}
    </button>
  );

  const DotLegend = () => (
    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
      {[[DK,'Dark mode'],[LT,'Light mode'],[SIG,'Significant'],[MAR,'Marginal']].map(([c,l])=>(
        <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />
          <span style={{ fontSize:11, color:u.text3 }}>{l}</span>
        </div>
      ))}
    </div>
  );

  // ── Dumbbell chart ────────────────────────────────────────────────────────────
  const Dumbbell = ({ rows, title }) => {
    const RH = 40, LBL = isTablet?160:130, W = isTablet?260:200;
    const H = rows.length*RH + 36;
    return (
      <div>
        {title && <div style={{ fontSize:11, fontWeight:600, color:u.text3, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>{title}</div>}
        <svg width="100%" viewBox={`0 0 ${LBL+W+90} ${H}`} style={{ overflow:'visible', display:'block' }}>
          <text x={LBL+W*0.2} y={14} fontSize={9} fill={DK} textAnchor="middle" fontFamily={L.font} fontWeight="700" letterSpacing={1}>DARK</text>
          <text x={LBL+W*0.8} y={14} fontSize={9} fill={LT} textAnchor="middle" fontFamily={L.font} fontWeight="700" letterSpacing={1}>LIGHT</text>
          {rows.map(({ k, l, hi }, ri) => {
            const t=tests[k], d=desc[k]; if (!t||!d) return null;
            const dm=d.dark?.mean, lm=d.light?.mean; if (dm==null||lm==null) return null;
            const all=[dm,lm], mn=Math.min(...all), mx=Math.max(...all), range=mx-mn||0.001;
            const pad=range*0.5, sc=v=>LBL+((v-mn+pad)/((mx-mn)+pad*2))*W;
            const dkX=sc(dm), ltX=sc(lm), y=ri*RH+28;
            const isSig=t.sig, isMar=t.marginal, isNS=!isSig&&!isMar;
            const textOp = isNS?0.55:1;
            const better = hi?(dm>lm?'dark':'light'):(dm<lm?'dark':'light');
            return (
              <g key={k}>
                <rect x={0} y={y-16} width={LBL+W+90} height={RH-2} rx={6} fill={isSig?`${SIG}06`:isMar?`${MAR}04`:'transparent'} />
                <text x={LBL-12} y={y+4} fontSize={11.5} fill={u.text2} textAnchor="end" fontFamily={L.font} fontWeight={isSig?700:400} opacity={textOp}>{l}</text>
                <line x1={Math.min(dkX,ltX)} y1={y} x2={Math.max(dkX,ltX)} y2={y} stroke={isSig?SIG:isMar?MAR:u.border} strokeWidth={isSig?2:1.5} opacity={isSig?.8:.5} />
                <circle cx={dkX} cy={y} r={isSig?7:5} fill={DK} opacity={isNS?.6:.9} />
                <circle cx={ltX} cy={y} r={isSig?7:5} fill={LT} opacity={isNS?.6:.9} />
                <text x={LBL+W+12} y={y-4} fontSize={9.5} fill={DK} fontFamily={L.mono} opacity={textOp}>{fv(dm)}</text>
                <text x={LBL+W+12} y={y+8} fontSize={9.5} fill={LT} fontFamily={L.mono} opacity={textOp}>{fv(lm)}</text>
                {isSig && <circle cx={4} cy={y} r={3} fill={SIG} />}
                {isMar && !isSig && <circle cx={4} cy={y} r={3} fill={MAR} />}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // ── Forest plot ───────────────────────────────────────────────────────────────
  const Forest = () => {
    const rows = TEST_ROWS.filter(r => tests[r.k]?.cohensD!=null);
    if (!rows.length) return null;
    const allE = rows.flatMap(r=>{const t=tests[r.k];return t?.ci95?[Math.abs(t.ci95.lower),Math.abs(t.ci95.upper),Math.abs(t.cohensD)]:[Math.abs(t.cohensD)]}).filter(v=>v!=null&&isFinite(v));
    const SCALE = Math.min(Math.ceil((allE.length?Math.max(...allE):1)*5)/5+0.3, 3);
    const LBL=isTablet?155:130, W=isTablet?320:240, RH=36, PAD=24;
    const H = rows.length*RH+PAD+40;
    const sx = d => LBL+((d+SCALE)/(SCALE*2))*W;
    const gridV = [-1,-.5,0,.5,1].filter(v=>Math.abs(v)<=SCALE);
    return (
      <svg width="100%" viewBox={`0 0 ${LBL+W+80} ${H}`} style={{ overflow:'visible', display:'block' }}>
        <rect x={LBL} y={PAD} width={W} height={H-PAD-38} rx={8} fill={u.fill} />
        {[-.8,-.5,.5,.8].filter(v=>Math.abs(v)<=SCALE).map(v=>(
          <rect key={v} x={v<0?sx(v<-.5?-SCALE:-0.8):sx(v<.5?.5:.8)} y={PAD} width={Math.abs(sx(Math.min(v,-.5))-sx(Math.max(v,-SCALE)))||Math.abs(sx(.8)-sx(.5))} height={H-PAD-38} fill={`${u.red}${Math.abs(v)>=.8?'0a':'06'}`} />
        ))}
        {gridV.map(v=>(
          <g key={v}>
            <line x1={sx(v)} y1={PAD} x2={sx(v)} y2={H-38} stroke={v===0?u.text3:u.border} strokeWidth={v===0?1.5:.5} strokeDasharray={v===0?'':' 4,3'} />
            <text x={sx(v)} y={H-24} fontSize={9} fill={u.text3} textAnchor="middle" fontFamily={L.mono}>{v===0?'0':(v>0?'+':'')+v}</text>
          </g>
        ))}
        {rows.map(({ k, l }, ri) => {
          const t=tests[k], d=t.cohensD, ci=t.ci95, y=ri*RH+PAD+18;
          const xd=sx(d);
          const ciLr=ci?ci.lower:d-.3, ciRr=ci?ci.upper:d+.3;
          const ciLc=Math.max(-SCALE,ciLr), ciRc=Math.min(SCALE,ciRr);
          const clipL=ciLr<-SCALE, clipR=ciRr>SCALE;
          const ciL=sx(ciLc), ciR=sx(ciRc);
          const col=sigCol(t);
          const isSig=t.sig||t.marginal;
          return (
            <g key={k}>
              <rect x={0} y={y-14} width={LBL+W+80} height={32} rx={4} fill={rowBg(t)} />
              <text x={LBL-10} y={y+4} fontSize={11} fill={u.text2} textAnchor="end" fontFamily={L.font} fontWeight={t.sig?700:400} opacity={t.sig||t.marginal?1:.65}>{l}</text>
              <line x1={ciL} y1={y} x2={ciR} y2={y} stroke={col} strokeWidth={isSig?2:1.5} opacity={isSig?.9:.55} />
              {!clipL&&<line x1={ciL} y1={y-5} x2={ciL} y2={y+5} stroke={col} strokeWidth={1.5} opacity={isSig?.9:.55} />}
              {!clipR&&<line x1={ciR} y1={y-5} x2={ciR} y2={y+5} stroke={col} strokeWidth={1.5} opacity={isSig?.9:.55} />}
              {clipL&&<polygon points={`${ciL},${y} ${ciL+8},${y-4} ${ciL+8},${y+4}`} fill={col} opacity={.7} />}
              {clipR&&<polygon points={`${ciR},${y} ${ciR-8},${y-4} ${ciR-8},${y+4}`} fill={col} opacity={.7} />}
              <rect x={xd-5} y={y-5} width={10} height={10} rx={2} fill={col} opacity={isSig?1:.7} />
              <text x={ciR+(clipR?12:8)} y={y+4} fontSize={10} fill={col} fontFamily={L.mono} fontWeight={isSig?700:400}>{d>0?'+':''}{d}</text>
            </g>
          );
        })}
        <text x={LBL+W/2} y={H-10} fontSize={9} fill={u.text3} textAnchor="middle" fontFamily={L.font}>← Light mode higher · Cohen's d · Dark mode higher →</text>
        <text x={LBL+W/2} y={H-22} fontSize={8} fill={u.text3} textAnchor="middle" fontFamily={L.font}>shaded bands: medium (|d|≥0.5) and large (|d|≥0.8) effect zones</text>
      </svg>
    );
  };

  // ── Scatter ───────────────────────────────────────────────────────────────────
  const Scatter = ({ metric, label, fmt }) => {
    const pts=pairs.map(p=>({ x:p.dark[metric],y:p.light[metric],n:p.name })).filter(p=>p.x!=null&&p.y!=null);
    if (pts.length<2) return <div style={{ padding:20, textAlign:'center', fontSize:12, color:u.text3 }}>—</div>;
    const vals=pts.flatMap(p=>[p.x,p.y]), mn=Math.min(...vals), mx=Math.max(...vals), range=mx-mn||1;
    const SZ=180, P=28, sc=v=>P+((v-mn)/range)*(SZ-P*2);
    const dkBetter=pts.filter(p=>(metric==='rt'||metric==='nasa'||metric==='err')?p.x<p.y:p.x>p.y).length;
    const f=fmt||(v=>fv(v));
    return (
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:10 }}>{label}</div>
        <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`} style={{ overflow:'visible', display:'inline-block' }}>
          <rect x={P} y={P} width={SZ-P*2} height={SZ-P*2} rx={4} fill={u.fill} />
          <line x1={P} y1={SZ-P} x2={SZ-P} y2={P} stroke={u.border} strokeWidth={1.5} strokeDasharray="5,3" />
          {pts.map((p,i)=><circle key={i} cx={sc(p.x)} cy={SZ-sc(p.y)} r={5} fill={(metric==='rt'||metric==='nasa'||metric==='err')?(p.x<p.y?DK:LT):(p.x>p.y?DK:LT)} opacity={.85} stroke={u.bg} strokeWidth={1.5} />)}
          <text x={P+(SZ-P*2)/2} y={SZ-6} fontSize={9} fill={DK} textAnchor="middle" fontFamily={L.font} fontWeight="600">Dark</text>
          <text x={12} y={P+(SZ-P*2)/2} fontSize={9} fill={LT} textAnchor="middle" transform={`rotate(-90 12 ${P+(SZ-P*2)/2})`} fontFamily={L.font} fontWeight="600">Light</text>
        </svg>
        <div style={{ fontSize:11, color:u.text3, marginTop:6 }}>
          <span style={{ color:DK, fontWeight:600 }}>{dkBetter}</span> dark · <span style={{ color:LT, fontWeight:600 }}>{pts.length-dkBetter}</span> light
        </div>
      </div>
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const pad = isTablet?'28px 32px':'20px 18px';
  const TH = { padding:'9px 14px', fontSize:11, fontWeight:600, color:u.text3, background:u.fill, borderBottom:`1.5px solid ${u.border}`, textAlign:'left', whiteSpace:'nowrap', letterSpacing:.3 };
  const TD = (c,mono) => ({ padding:'8px 14px', fontSize:12, color:c||u.text, borderBottom:`1px solid ${u.border}`, whiteSpace:'nowrap', fontFamily:mono?L.mono:L.font });

  // ── Finding cards ─────────────────────────────────────────────────────────────
  const topFindings = () => {
    const findings = [];
    TEST_ROWS.forEach(({ k, l, hi }) => {
      const t=tests[k], d=desc[k]; if (!t||!t.sig&&!t.marginal) return;
      const dm=d?.dark?.mean, lm=d?.light?.mean; if (dm==null||lm==null) return;
      const betterLabel = hi?(dm>lm?'Dark':'Light'):(dm<lm?'Dark':'Light');
      const betterColor = betterLabel==='Dark'?DK:LT;
      const strength = Math.abs(t.cohensD)>=.8?'large':Math.abs(t.cohensD)>=.5?'medium':'small';
      findings.push({ metric:l, better:betterLabel, betterColor, d:t.cohensD, sig:t.sig, strength });
    });
    // If no significant, add top effect-size findings
    if (findings.length===0) {
      const sorted = TEST_ROWS.map(r => ({ ...r, t:tests[r.k] })).filter(r=>r.t?.cohensD!=null).sort((a,b)=>Math.abs(b.t.cohensD)-Math.abs(a.t.cohensD)).slice(0,3);
      sorted.forEach(({ k, l, hi }) => {
        const t=tests[k], d=desc[k]; if (!t) return;
        const dm=d?.dark?.mean, lm=d?.light?.mean; if (dm==null||lm==null) return;
        const betterLabel = hi?(dm>lm?'Dark':'Light'):(dm<lm?'Dark':'Light');
        findings.push({ metric:l, better:betterLabel, betterColor:betterLabel==='Dark'?DK:LT, d:t.cohensD, sig:false, strength:Math.abs(t.cohensD)>=.5?'medium':'small', trend:true });
      });
    }
    return findings.slice(0,4);
  };
  const findings = topFindings();

  return (
    <div style={{ fontFamily:L.font, padding:isTablet?'28px 28px 48px':'16px 14px 40px', maxWidth:1000 }} className="au">

      {/* ══ 01 EXECUTIVE SUMMARY ══════════════════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="01" title="Executive Summary"
          sub={`Paired-samples t-tests · ${N} complete pairs · Primary α = .05 (uncorrected) · FDR & Bonferroni reported as reference`} />
        <div style={{ padding:pad }}>

          {/* KPI row */}
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${isTablet?4:2},1fr)`, gap:isTablet?0:1, marginBottom:28, borderRadius:12, overflow:'hidden', border:`1px solid ${u.border}` }}>
            {[
              { v:N,                          l:'Pairs',          s:'complete participants',                c:u.accent },
              { v:`${sigRows.length}/${NT}`,  l:'Significant',    s:'uncorrected p < .05 (primary)',       c:sigRows.length?SIG:u.text3 },
              { v:`${Object.values(tests).filter(t=>t?.fdrSig).length}/${NT}`, l:'FDR Significant', s:'Benjamini-Hochberg corrected', c:u.teal },
              { v:'α = .05',                  l:'Primary α',      s:'exploratory · effect sizes primary',  c:u.green  },
            ].map(({ v,l,s,c },i,a) => (
              <div key={l} style={{ padding:'20px 16px', textAlign:'center', borderRight:i<a.length-1?`1px solid ${u.border}`:'none', borderBottom:!isTablet&&i<2?`1px solid ${u.border}`:'none' }}>
                <div style={{ fontSize:30, fontWeight:800, color:c, fontFamily:L.mono, lineHeight:1, letterSpacing:-1 }}>{v}</div>
                <div style={{ fontSize:11, fontWeight:600, color:u.text2, marginTop:6, textTransform:'uppercase', letterSpacing:.8 }}>{l}</div>
                <div style={{ fontSize:10, color:u.text3, marginTop:2 }}>{s}</div>
              </div>
            ))}
          </div>

          {/* Sample + counterbalance status */}
          <div style={{ display:'grid', gridTemplateColumns:isTablet?'1fr 1fr 1fr':'1fr', gap:12, marginBottom:28 }}>
            <div style={{ padding:'14px 18px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
              <div style={{ fontSize:10, fontWeight:600, color:u.text3, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Sample Adequacy</div>
              <div style={{ fontSize:15, fontWeight:700, color:u[sz.c]||u.text }}>{sz.l}</div>
              <div style={{ fontSize:11, color:u.text3, marginTop:3 }}>{sz.note||'Effect sizes are more reliable than p-values at this n.'}</div>
            </div>
            <div style={{ padding:'14px 18px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
              <div style={{ fontSize:10, fontWeight:600, color:u.text3, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Counterbalance</div>
              <div style={{ fontSize:15, fontWeight:700, color:cb.balanced?SIG:MAR }}>{cb.balanced?'Balanced':'Imbalanced'}</div>
              <div style={{ fontSize:11, color:u.text3, marginTop:3 }}>DL group: {cb.dl} · LD group: {cb.ld}</div>
            </div>
            {demoSummary && <div style={{ padding:'14px 18px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
              <div style={{ fontSize:10, fontWeight:600, color:u.text3, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>Demographics</div>
              <div style={{ fontSize:15, fontWeight:700, color:u.text }}>n = {demoSummary.n}</div>
              <div style={{ fontSize:11, color:u.text3, marginTop:3 }}>{demoSummary.age?`Age ${demoSummary.age.mean}±${demoSummary.age.sd}`:'—'}</div>
            </div>}
          </div>

          {/* Findings highlight */}
          {findings.length>0 && <>
            <div style={{ fontSize:11, fontWeight:600, color:u.text3, letterSpacing:1.2, textTransform:'uppercase', marginBottom:12 }}>
              {sigRows.length?'Significant Findings':'Largest Observed Trends'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:isTablet?`repeat(${Math.min(findings.length,2)},1fr)`:'1fr', gap:10 }}>
              {findings.map(({ metric,better,betterColor,d,sig,strength,trend }) => (
                <div key={metric} style={{ padding:'14px 18px', borderRadius:10, border:`1.5px solid ${sig?SIG:trend?u.border:MAR}${sig?'':trend?'':30}`, background:sig?`${SIG}06`:`${u.fill}` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:u.text }}>{metric}</span>
                    {sig&&<Chip label="Significant" color={SIG} />}
                    {!sig&&trend&&<Chip label="Trend" color={u.text3} />}
                    {!sig&&!trend&&<Chip label="Marginal" color={MAR} />}
                  </div>
                  <div style={{ fontSize:13, color:u.text2 }}>
                    <span style={{ color:betterColor, fontWeight:700 }}>{better} mode</span> performed better · <span style={{ fontFamily:L.mono, color:dCol(d) }}>d = {d>0?'+':''}{d}</span> ({strength} effect)
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </SectionWrap>

      {/* ══ 02 OUTCOME OVERVIEW ═══════════════════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="02" title="Outcome Overview"
          sub="Dark vs light mode mean comparison across all dependent variables. Filled circles = group mean. Highlighted rows reached statistical significance." />
        <div style={{ padding:pad }}>
          <div style={{ display:'grid', gridTemplateColumns:isDesktop?'1fr 1fr':'1fr', gap:32 }}>
            <Dumbbell rows={TEST_ROWS.slice(0,4)} title="Performance" />
            <Dumbbell rows={TEST_ROWS.slice(4)} title="Workload & Comfort" />
          </div>
          <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${u.border}` }}>
            <DotLegend />
          </div>
        </div>
      </SectionWrap>

      {/* ══ 03 EFFECT SIZES ════════════════════════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="03" title="Effect Sizes"
          sub="Cohen's d with 95% confidence intervals. Squares = point estimates. Shaded bands mark medium (|d| ≥ 0.5) and large (|d| ≥ 0.8) effect zones." />
        <div style={{ padding:pad, overflowX:'auto' }}>
          <Forest />
        </div>
      </SectionWrap>

      {/* ══ 04 INDIVIDUAL DATA ════════════════════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="04" title="Individual Participant Data"
          sub="Each point represents one participant. Points above the diagonal = Light mode higher; below = Dark mode higher." />
        <div style={{ padding:pad }}>
          <div style={{ display:'flex', gap:isTablet?32:20, flexWrap:'wrap', justifyContent:'center' }}>
            <Scatter metric="acc"  label="Accuracy"    fmt={v=>v!=null?(v*100).toFixed(0)+'%':''} />
            <Scatter metric="rt"   label="Response Time" fmt={v=>v!=null?Math.round(v)+'ms':''} />
            <Scatter metric="nasa" label="NASA-TLX" />
          </div>
          <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${u.border}` }}>
            <DotLegend />
          </div>
        </div>
      </SectionWrap>

      {/* ══ 05 FULL STATISTICAL TABLE (collapsible) ═══════════════════════════ */}
      <SectionWrap>
        <SHdr num="05" title="Statistical Test Results"
          sub={`Paired-samples t-tests · Bonferroni-corrected · highlighted rows = significant or marginal · n = ${N} pairs`}
          action={<ExpandToggle id="stats" label="table" />} />
        {expanded.stats && (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr>{['Variable','Dark M (SD)','Light M (SD)','Δ Mean','95% CI','t (df)','p (raw)','FDR','Bonf. p','d','Power','Result'].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {TEST_ROWS.map(({ k,l }) => {
                  const t=tests[k], d=desc[k]; if (!t) return null;
                  const dm=d?.dark?.mean, dsd=d?.dark?.sd, lm=d?.light?.mean, lsd=d?.light?.sd;
                  const diff=dm!=null&&lm!=null?dm-lm:null;
                  const pw=resPower?.[k];
                  const isSig = t.sig;           // uncorrected p < .05 (primary)
                  const isFDR = t.fdrSig;         // FDR corrected
                  const isBonf = t.bonferroni;    // Bonferroni (strict)
                  const sigLabel = isBonf?'★★ Bonf.':isFDR?'★ FDR':isSig?'~ p<.05':'n.s.';
                  const sigColor = isBonf?SIG:isFDR?u.teal:isSig?MAR:u.text3;
                  return (
                    <tr key={k} style={{ background:isBonf?`${SIG}08`:isFDR?`${u.teal}06`:isSig?`${MAR}04`:'transparent', opacity:!isSig?.75:1 }}>
                      <td style={{ ...TD(u.text), fontWeight:isSig?700:400 }}>{l}</td>
                      <td style={TD(DK,true)}>{fv(dm)} <span style={{ color:u.text3 }}>({fv(dsd)})</span></td>
                      <td style={TD(LT,true)}>{fv(lm)} <span style={{ color:u.text3 }}>({fv(lsd)})</span></td>
                      <td style={{ ...TD(diff!=null?(diff>0?SIG:u.red):u.text3,true) }}>{diff!=null?(diff>0?'+':'')+fv(diff):'—'}</td>
                      <td style={{ ...TD(u.text3,true), fontSize:10 }}>{t.ci95?`[${fv(t.ci95.lower)}, ${fv(t.ci95.upper)}]`:'—'}</td>
                      <td style={TD(u.teal,true)}>{t.t} ({t.df})</td>
                      <td style={{ ...TD(isSig?MAR:u.text3,true), fontWeight:isSig?700:400 }}>{t.p?.toFixed(4)||'—'}</td>
                      <td style={{ ...TD(isFDR?u.teal:u.text3,true), fontWeight:isFDR?700:400 }}>{isFDR?'✓ Yes':'No'}</td>
                      <td style={TD(isBonf?SIG:u.text3,true)}>{t.pBonf?.toFixed(4)||'—'}</td>
                      <td style={{ ...TD(dCol(t.cohensD),true), fontWeight:700 }}>{t.cohensD!=null?(t.cohensD>0?'+':'')+t.cohensD:'—'}</td>
                      <td style={TD(pw>=.8?SIG:pw>=.5?MAR:u.text3,true)}>{pw!=null?(pw*100).toFixed(0)+'%':'—'}</td>
                      <td style={{ padding:'8px 14px', borderBottom:`1px solid ${u.border}` }}>
                        <Chip label={sigLabel} color={sigColor} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding:'10px 16px', fontSize:11, color:u.text3, background:u.fill, borderTop:`1px solid ${u.border}` }}>
              {'Δ = Dark − Light · Primary: p (raw) < .05 · FDR: Benjamini-Hochberg · Bonf. p = min(raw p × 11, 1) · Effect size (d) is the primary evidence'}
            </div>
          </div>
        )}
        {!expanded.stats && (
          <div style={{ padding:pad, paddingTop:16 }}>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {sigRows.length===0&&margRows.length===0
                ? <span style={{ fontSize:13, color:u.text3 }}>No tests reached significance at α = .05. Effect sizes and CIs are the primary evidence — expand to view.</span>
                : <>
                    {sigRows.map(r=><Chip key={r.k} label={`${r.l}: d=${tests[r.k].cohensD}`} color={SIG} />)}
                    {margRows.map(r=><Chip key={r.k} label={`${r.l}: p=${tests[r.k].p?.toFixed(3)}`} color={MAR} />)}
                  </>
              }
            </div>
          </div>
        )}
      </SectionWrap>

      {/* ══ 06 PER-TASK ANALYSIS ══════════════════════════════════════════════ */}
      {taskBreak.length>0 && <SectionWrap>
        <SHdr num="06" title="Per-Task Analysis"
          sub="Mean accuracy per task by theme. Bars show group performance. Asterisk (*) marks tasks with uncorrected p < .05." />
        <div style={{ padding:pad }}>
          {/* Bar chart */}
          <div style={{ overflowX:'auto', marginBottom:20 }}>
            {(() => {
              const tasks=taskBreak.filter(t=>t.dark?.n>0||t.light?.n>0);
              if (!tasks.length) return null;
              const BW=16, GAP=6, GRP=10, W=tasks.length*(BW*2+GAP+GRP)+48, H=110;
              return (
                <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{ minWidth:Math.min(W,isTablet?600:320) }}>
                  {[0,.25,.5,.75,1].map(v=>(
                    <g key={v}>
                      <line x1={32} y1={H-v*H} x2={W} y2={H-v*H} stroke={u.border} strokeWidth={.5} />
                      <text x={30} y={H-v*H+3} fontSize={8} fill={u.text3} textAnchor="end" fontFamily={L.mono}>{Math.round(v*100)}%</text>
                    </g>
                  ))}
                  {tasks.map((task,ti)=>{
                    const x=36+ti*(BW*2+GAP+GRP);
                    const dh=(task.dark?.mean||0)*H, lh=(task.light?.mean||0)*H;
                    const tt=TT?.find(t=>t.tid===task.tid)?.test;
                    return (
                      <g key={task.tid}>
                        <rect x={x}      y={H-dh} width={BW} height={dh} rx={2} fill={DK} opacity={.85} />
                        <rect x={x+BW+GAP} y={H-lh} width={BW} height={lh} rx={2} fill={LT} opacity={.85} />
                        <text x={x+BW} y={H+13} fontSize={8} fill={u.text2} textAnchor="middle" fontFamily={L.font}>{task.label?.split(' ')[0]}</text>
                        {tt?.sig&&<text x={x+BW} y={H-Math.max(dh,lh)-5} fontSize={10} fill={SIG} textAnchor="middle" fontWeight="700">*</text>}
                      </g>
                    );
                  })}
                  <rect x={36} y={H+14} width={BW} height={4} rx={1} fill={DK} />
                  <text x={36+BW+4} y={H+18} fontSize={9} fill={DK} fontFamily={L.font}>Dark</text>
                  <rect x={90} y={H+14} width={BW} height={4} rx={1} fill={LT} />
                  <text x={90+BW+4} y={H+18} fontSize={9} fill={LT} fontFamily={L.font}>Light</text>
                </svg>
              );
            })()}
          </div>
          {/* Task table (collapsible) */}
          <button onClick={()=>toggle('tasks')} style={{ fontSize:12, color:u.text3, background:'none', border:'none', cursor:'pointer', fontFamily:L.font, padding:0, marginBottom:expanded.tasks?14:0 }}>
            {expanded.tasks?'▾ Hide':'▸ Show'} per-task table
          </button>
          {expanded.tasks && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                <thead><tr>{['Task','Dark M','Dark SD','Light M','Light SD','Δ','n','t','p'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {taskBreak.filter(t=>t.dark?.n>0||t.light?.n>0).map((task,i)=>{
                    const diff=task.dark?.mean!=null&&task.light?.mean!=null?task.dark.mean-task.light.mean:null;
                    const tt=TT?.find(t=>t.tid===task.tid)?.test;
                    return (
                      <tr key={task.tid} style={{ background:tt?.sig?`${SIG}08`:i%2?u.fill+'66':'transparent' }}>
                        <td style={{ ...TD(u.text), fontWeight:500 }}>{task.label}</td>
                        <td style={TD(DK,true)}>{fv(task.dark?.mean)}</td>
                        <td style={TD(u.text3,true)}>{fv(task.dark?.sd)}</td>
                        <td style={TD(LT,true)}>{fv(task.light?.mean)}</td>
                        <td style={TD(u.text3,true)}>{fv(task.light?.sd)}</td>
                        <td style={TD(diff!=null?(diff>0?SIG:u.red):u.text3,true)}>{diff!=null?(diff>0?'+':'')+fv(diff):'—'}</td>
                        <td style={TD(u.text3,true)}>{Math.max(task.dark?.n||0,task.light?.n||0)}</td>
                        <td style={TD(u.teal,true)}>{tt?.t||'—'}</td>
                        <td style={TD(tt?.sig?SIG:tt?.p<.05?MAR:u.text3,true)}>{tt?.p?.toFixed(3)||'—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SectionWrap>}

      {/* ══ 07 SUBJECTIVE MEASURES ════════════════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="07" title="Subjective Measures"
          sub="NASA-TLX cognitive workload subscales (0–20) and post-phase comfort ratings (1–7) by theme condition." />
        <div style={{ padding:pad }}>
          <div style={{ display:'grid', gridTemplateColumns:isDesktop?'1fr 1fr':'1fr', gap:32 }}>
            {/* NASA bars */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:u.text3, letterSpacing:1.2, textTransform:'uppercase', marginBottom:16 }}>NASA-TLX Subscales (0–20)</div>
              {[{k:'nasaMD',l:'Mental Demand'},{k:'nasaEF',l:'Effort'},{k:'nasFR',l:'Frustration'},{k:'nasa',l:'Total Score'}].map(({k,l})=>{
                const d=desc[k]; if (!d?.dark?.n&&!d?.light?.n) return null;
                const dm=d?.dark?.mean||0, lm=d?.light?.mean||0, mx=20;
                const t=tests[k];
                return (
                  <div key={k} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                      <span style={{ fontSize:12, color:u.text2, fontWeight:t?.sig?700:400 }}>{l}</span>
                      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                        <span style={{ fontSize:11, color:DK, fontFamily:L.mono, fontWeight:600 }}>{fv(dm)}</span>
                        <span style={{ fontSize:10, color:u.text3 }}>vs</span>
                        <span style={{ fontSize:11, color:LT, fontFamily:L.mono, fontWeight:600 }}>{fv(lm)}</span>
                        {t?.sig&&<Chip label="★" color={SIG} />}
                        {t?.marginal&&!t?.sig&&<Chip label="~" color={MAR} />}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:DK, flexShrink:0 }} />
                      <div style={{ flex:1, height:5, background:u.border, borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(dm/mx)*100}%`, background:DK, opacity:.85, borderRadius:3 }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:LT, flexShrink:0 }} />
                      <div style={{ flex:1, height:5, background:u.border, borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(lm/mx)*100}%`, background:LT, opacity:.85, borderRadius:3 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Comfort ratings */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:u.text3, letterSpacing:1.2, textTransform:'uppercase', marginBottom:16 }}>Comfort Ratings (1–7)</div>
              {[{k:'vc',l:'Visual Comfort',hi:true},{k:'es',l:'Eye Strain',hi:false},{k:'fa',l:'Fatigue',hi:false},{k:'sa',l:'Satisfaction',hi:true}].map(({k,l,hi})=>{
                const d=desc[k]; if (!d?.dark?.n&&!d?.light?.n) return null;
                const dm=d?.dark?.mean, lm=d?.light?.mean;
                const t=tests[k];
                const betterColor = dm!=null&&lm!=null?(hi?(dm>lm?DK:LT):(dm<lm?DK:LT)):null;
                return (
                  <div key={k} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                      <span style={{ fontSize:12, color:u.text2, fontWeight:t?.sig?700:400 }}>{l}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:11, color:DK, fontFamily:L.mono, fontWeight:600 }}>{fv(dm)}</span>
                        <span style={{ fontSize:10, color:u.text3 }}>vs</span>
                        <span style={{ fontSize:11, color:LT, fontFamily:L.mono, fontWeight:600 }}>{fv(lm)}</span>
                        {betterColor&&<div style={{ width:8, height:8, borderRadius:'50%', background:betterColor }} />}
                        {t?.sig&&<Chip label="★" color={SIG} />}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:3 }}>
                      {[1,2,3,4,5,6,7].map(n=>{
                        const dkA=dm!=null&&Math.round(dm)===n, ltA=lm!=null&&Math.round(lm)===n;
                        const both=dkA&&ltA;
                        return (
                          <div key={n} style={{ flex:1, height:28, borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:dkA||ltA?700:400, background:both?'#7c3aed':dkA?DK:ltA?LT:u.fill, border:`1px solid ${dkA||ltA?'transparent':u.border}`, color:dkA||ltA?'#fff':u.text3, transition:'all .15s' }}>
                            {n}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:u.text3, marginTop:4 }}>
                      <span>{hi?'Low':'Absent'}</span><span>{hi?'High':'Severe'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${u.border}` }}>
            <DotLegend />
          </div>
        </div>
      </SectionWrap>

      {/* ══ 08 ADVANCED ANALYSIS (collapsible) ════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="08" title="Advanced Analysis"
          sub="Non-parametric validation, order effects, practice effects, statistical power, and internal consistency."
          action={<ExpandToggle id="advanced" label="details" />} />
        {expanded.advanced ? (
          <div style={{ padding:pad }}>
            <div style={{ display:'grid', gridTemplateColumns:isTablet?'1fr 1fr':'1fr', gap:24, marginBottom:24 }}>
              {/* Wilcoxon */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:12 }}>Wilcoxon Signed-Rank</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:12 }}>Non-parametric alternative. Validates t-test findings where normality is violated.</div>
                {Object.entries(resWilcoxon||{}).slice(0,6).map(([k,w])=>{
                  const row=TEST_ROWS.find(r=>r.k===k), t=tests[k]; if (!row) return null;
                  const matches=w&&t?w.sig===t.sig:null;
                  return (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${u.border}` }}>
                      <span style={{ fontSize:11, color:u.text2 }}>{row.l}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:11, color:w?.sig?SIG:NS, fontFamily:L.mono }}>{w?.p?.toFixed(4)||'—'}</span>
                        <Chip label={matches==null?'—':matches?'Consistent':'⚠ Discrepant'} color={matches==null?NS:matches?SIG:MAR} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Power + Order + Practice */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:12 }}>Statistical Power (1−β)</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:12 }}>Power ≥ 80% is conventionally adequate. Low power: null results may be Type II errors.</div>
                {TEST_ROWS.slice(0,5).map(({ k,l }) => {
                  const t=tests[k], pw=resPower?.[k]; if (!t) return null;
                  const col=pw>=.8?SIG:pw>=.5?MAR:NS;
                  return (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${u.border}` }}>
                      <span style={{ fontSize:11, color:u.text2 }}>{l}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:11, color:col, fontFamily:L.mono, fontWeight:600 }}>{pw!=null?(pw*100).toFixed(0)+'%':'—'}</span>
                        <Chip label={pw==null?'—':pw>=.8?'Adequate':pw>=.5?'Moderate':'Low'} color={col} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order effect + Practice effect */}
            <div style={{ display:'grid', gridTemplateColumns:isTablet?'1fr 1fr':'1fr', gap:16, marginBottom:24 }}>
              <div style={{ padding:'16px 20px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:8 }}>Order Effect (DL vs LD)</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:10 }}>A significant result indicates theme order influenced outcomes — report as limitation.</div>
                {Object.entries(resOrderEffect||{}).map(([k,oe])=>{
                  const row=TEST_ROWS.find(r=>r.k===k); if (!row||!oe) return null;
                  return (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${u.border}` }}>
                      <span style={{ fontSize:11, color:u.text2 }}>{row.l}</span>
                      <span style={{ fontSize:11, color:oe.sig?u.red:SIG, fontFamily:L.mono, fontWeight:oe.sig?700:400 }}>{oe.sig?'⚠ p=':'✓ p='}{oe.p?.toFixed(3)||'—'}</span>
                    </div>
                  );
                })}
              </div>
              {pe && <div style={{ padding:'16px 20px', borderRadius:10, background:pe.sig?`${MAR}08`:`${SIG}06`, border:`1px solid ${pe.sig?MAR:SIG}25` }}>
                <div style={{ fontSize:12, fontWeight:600, color:pe.sig?MAR:SIG, marginBottom:6 }}>{pe.sig?'⚠ Practice Effect Detected':'✓ No Practice Effect'}</div>
                <div style={{ fontSize:11, color:u.text2, lineHeight:1.7 }}>t({pe.df}) = {pe.t}, p = {pe.p?.toFixed(3)}, d = {pe.cohensD}</div>
                <div style={{ fontSize:11, color:u.text3, marginTop:6 }}>{pe.sig?'Performance changed between phases regardless of theme.':'Performance was stable across phases.'}</div>
              </div>}
            </div>

            {/* Correlation matrix */}
            {CM?.length>0 && <>
              <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:10 }}>Correlation Matrix (Pearson r)</div>
              <div style={{ overflowX:'auto', marginBottom:24 }}>
                <table style={{ borderCollapse:'collapse' }}>
                  <thead><tr><th style={{ ...TH, background:'transparent', minWidth:90 }}></th>{(CL||[]).map(l=><th key={l} style={{ ...TH, fontSize:10, minWidth:80 }}>{l}</th>)}</tr></thead>
                  <tbody>{(CM||[]).map((row,i)=>(
                    <tr key={i}>
                      <td style={{ ...TD(u.text), fontWeight:500, fontSize:11 }}>{CL?.[i]}</td>
                      {row.map((r,j)=>{
                        if (i===j) return <td key={j} style={{ ...TD(u.text3,true), background:u.fill, textAlign:'center', fontSize:11 }}>—</td>;
                        const col=r==null?NS:Math.abs(r)>.5?SIG:Math.abs(r)>.3?u.teal:NS;
                        const bg=r==null?'':r>.5?`${SIG}12`:r<-.5?`${u.red}12`:r>.3||r<-.3?`${u.teal}08`:'';
                        return <td key={j} style={{ ...TD(col,true), background:bg, textAlign:'center', fontSize:11 }}>{r!=null?r.toFixed(2):'—'}</td>;
                      })}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>}

            {/* Reliability */}
            {Object.keys(reliability||{}).length>0 && <>
              <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:12 }}>Reliability — Cronbach's α</div>
              <div style={{ display:'grid', gridTemplateColumns:isTablet?'1fr 1fr':'1fr', gap:12 }}>
                {Object.values(reliability).map(rel=>{
                  const col=rel.alpha==null?NS:rel.alpha>=.9?SIG:rel.alpha>=.8?u.teal:rel.alpha>=.7?MAR:u.red;
                  const lab=rel.alpha==null?'N/A':rel.alpha>=.9?'Excellent':rel.alpha>=.8?'Good':rel.alpha>=.7?'Acceptable':'Poor';
                  return (
                    <div key={rel.label} style={{ padding:'16px 18px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
                      <div style={{ fontSize:11, color:u.text3, marginBottom:6 }}>{rel.label} · k={rel.items}, n={rel.n}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <span style={{ fontSize:26, fontWeight:800, color:col, fontFamily:L.mono }}>{rel.alpha!=null?rel.alpha:'—'}</span>
                        <Chip label={lab} color={col} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>}
          </div>
        ) : (
          <div style={{ padding:pad, paddingTop:16 }}>
            <div style={{ fontSize:13, color:u.text3 }}>Power analysis · Wilcoxon tests · Order effect check · Practice effect · Correlation matrix · Reliability</div>
          </div>
        )}
      </SectionWrap>

      {/* ══ 08B PATTERNS & SUBGROUP ANALYSIS ══════════════════════════════ */}
      <SectionWrap>
        <SHdr num="08B" title="Patterns & Subgroup Analysis"
          sub="Derived patterns across age, gender, skill level, task complexity, preference alignment, and individual performance profiles."
          action={<ExpandToggle id="patterns" label="all patterns" />} />
        {expanded.patterns ? (
          <div style={{ padding:pad }}>

            {/* Individual winners */}
            {individualWinners && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:6 }}>Who wins per person?</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:14 }}>Each participant's better-performing theme (accuracy gap &gt; 2%).</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:8 }}>
                  {[
                    { label:'Dark mode better', n:individualWinners.dkWin, pct:+(individualWinners.dkWin/individualWinners.total*100).toFixed(1), gap:individualWinners.dkAvgGap, color:DK },
                    { label:'Light mode better', n:individualWinners.ltWin, pct:+(individualWinners.ltWin/individualWinners.total*100).toFixed(1), gap:individualWinners.ltAvgGap, color:LT },
                    { label:'Tied (≤2% diff)', n:individualWinners.tied, pct:+(individualWinners.tied/individualWinners.total*100).toFixed(1), gap:null, color:u.text3 },
                  ].map(({ label,n,pct,gap,color }) => (
                    <div key={label} style={{ padding:'14px 16px', borderRadius:10, background:u.fill, border:`1.5px solid ${color}30` }}>
                      <div style={{ fontSize:24, fontWeight:800, color, fontFamily:L.mono, lineHeight:1 }}>{pct}%</div>
                      <div style={{ fontSize:11, color:u.text2, marginTop:4, fontWeight:600 }}>{label}</div>
                      <div style={{ fontSize:11, color:u.text3, marginTop:2 }}>n = {n}{gap?` · avg Δ = ${(gap*100).toFixed(1)}%`:''}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height:8, borderRadius:4, overflow:'hidden', display:'flex' }}>
                  <div style={{ width:`${individualWinners.dkWin/individualWinners.total*100}%`, background:DK, opacity:.85 }} />
                  <div style={{ width:`${individualWinners.ltWin/individualWinners.total*100}%`, background:LT, opacity:.85 }} />
                  <div style={{ flex:1, background:u.border }} />
                </div>
              </div>
            )}

            {/* Preference–performance alignment */}
            {patternPrefAlign && (
              <div style={{ marginBottom:28, padding:'16px 20px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:6 }}>Preference ↔ Performance Alignment</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:14 }}>Does the theme users prefer also produce their better performance?</div>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:120 }}>
                    <div style={{ fontSize:28, fontWeight:800, color:SIG, fontFamily:L.mono }}>{patternPrefAlign.matchPct}%</div>
                    <div style={{ fontSize:11, color:u.text2, marginTop:2 }}>Preference = Better performance</div>
                    <div style={{ fontSize:11, color:u.text3 }}>n = {patternPrefAlign.match} of {patternPrefAlign.total}</div>
                  </div>
                  <div style={{ flex:1, minWidth:120 }}>
                    <div style={{ fontSize:28, fontWeight:800, color:MAR, fontFamily:L.mono }}>{(100-patternPrefAlign.matchPct-patternPrefAlign.tied/patternPrefAlign.total*100).toFixed(1)}%</div>
                    <div style={{ fontSize:11, color:u.text2, marginTop:2 }}>Preference ≠ Better performance</div>
                    <div style={{ fontSize:11, color:u.text3 }}>n = {patternPrefAlign.mismatch} of {patternPrefAlign.total}</div>
                  </div>
                  <div style={{ flex:2, minWidth:200, padding:'12px 16px', borderRadius:8, background:`${SIG}08`, border:`1px solid ${SIG}20` }}>
                    <div style={{ fontSize:12, color:SIG, fontWeight:600, marginBottom:4 }}>Key Insight</div>
                    <div style={{ fontSize:11, color:u.text2, lineHeight:1.6 }}>Users' intuitive theme choice is correct {patternPrefAlign.matchPct}% of the time — supporting user-controlled theme selection over platform mandates.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Age × Theme */}
            {patternAge.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:4 }}>Age Group × Theme Interaction</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:14 }}>Direction of accuracy advantage by age group. Note the reversal between young and older participants.</div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:400 }}>
                    <thead><tr>
                      {['Age Group','n','Dark Acc','Light Acc','Δ Accuracy','Dark NASA','Light NASA','Δ NASA'].map(h=><th key={h} style={TH}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {patternAge.map(row => {
                        const dkBetter = row.diffAcc > 0.01;
                        const ltBetter = row.diffAcc < -0.01;
                        return (
                          <tr key={row.label} style={{ background:dkBetter?`${DK}06`:ltBetter?`${LT}06`:'transparent' }}>
                            <td style={TD(u.text)}>{row.label}</td>
                            <td style={TD(u.text3,true)}>{row.n}</td>
                            <td style={TD(DK,true)}>{row.dkAcc?.toFixed(3)||'—'}</td>
                            <td style={TD(LT,true)}>{row.ltAcc?.toFixed(3)||'—'}</td>
                            <td style={{ ...TD(dkBetter?DK:ltBetter?LT:u.text3,true), fontWeight:700 }}>{row.diffAcc>0?'+':''}{row.diffAcc}</td>
                            <td style={TD(DK,true)}>{row.dkNasa?.toFixed(1)||'—'}</td>
                            <td style={TD(LT,true)}>{row.ltNasa?.toFixed(1)||'—'}</td>
                            <td style={TD(row.diffNasa<0?DK:u.text3,true)}>{row.diffNasa>0?'+':''}{row.diffNasa}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Gender × Theme */}
            {patternGender.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:4 }}>Gender × Theme Interaction</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:14 }}>Males and females show opposing performance and comfort patterns across theme conditions.</div>
                <div style={{ display:'grid', gridTemplateColumns:isDesktop?`repeat(${patternGender.length},1fr)`:'1fr 1fr', gap:12 }}>
                  {patternGender.map(row => {
                    const dkBetter = row.diffAcc > 0.01;
                    const color = dkBetter ? DK : LT;
                    return (
                      <div key={row.label} style={{ padding:'16px 18px', borderRadius:10, background:u.fill, border:`1.5px solid ${color}30` }}>
                        <div style={{ fontSize:13, fontWeight:700, color:u.text, marginBottom:12 }}>{row.label} <span style={{ fontSize:11, color:u.text3, fontWeight:400 }}>n={row.n}</span></div>
                        <div style={{ marginBottom:8 }}>
                          <div style={{ fontSize:10, color:u.text3, textTransform:'uppercase', letterSpacing:.8, marginBottom:4 }}>Accuracy</div>
                          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                            <span style={{ fontSize:13, color:DK, fontFamily:L.mono, fontWeight:600 }}>{row.dkAcc?.toFixed(3)}</span>
                            <span style={{ fontSize:10, color:u.text3 }}>vs</span>
                            <span style={{ fontSize:13, color:LT, fontFamily:L.mono, fontWeight:600 }}>{row.ltAcc?.toFixed(3)}</span>
                            <span style={{ fontSize:12, fontWeight:700, color, fontFamily:L.mono }}>{row.diffAcc>0?'+':''}{row.diffAcc}</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:u.text3, textTransform:'uppercase', letterSpacing:.8, marginBottom:4 }}>Visual Comfort</div>
                          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                            <span style={{ fontSize:13, color:DK, fontFamily:L.mono, fontWeight:600 }}>{row.dkVc?.toFixed(2)}</span>
                            <span style={{ fontSize:10, color:u.text3 }}>vs</span>
                            <span style={{ fontSize:13, color:LT, fontFamily:L.mono, fontWeight:600 }}>{row.ltVc?.toFixed(2)}</span>
                            <span style={{ fontSize:12, fontWeight:700, color:row.diffVc>0?DK:LT, fontFamily:L.mono }}>{row.diffVc>0?'+':''}{row.diffVc}</span>
                          </div>
                        </div>
                        <div style={{ marginTop:10, padding:'6px 10px', borderRadius:6, background:`${color}10`, fontSize:11, color, fontWeight:600 }}>
                          {dkBetter?'Dark mode':'Light mode'} favoured
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task complexity tiers */}
            {complexityTiers.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:4 }}>Task Complexity × Theme</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:14 }}>As cognitive demand increases, light mode advantage grows. Simple tasks show no difference; complex tasks show 13pp+ light mode advantage.</div>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${complexityTiers.length},1fr)`, gap:12 }}>
                  {complexityTiers.map(tier => {
                    const dkBetter = tier.diff > 0.01;
                    const ltBetter = tier.diff < -0.01;
                    const color = dkBetter ? DK : ltBetter ? LT : u.text3;
                    const bgColor = dkBetter ? `${DK}08` : ltBetter ? `${LT}08` : u.fill;
                    const absDiff = Math.abs(tier.diff);
                    return (
                      <div key={tier.label} style={{ padding:'16px 18px', borderRadius:10, background:bgColor, border:`1.5px solid ${color}30` }}>
                        <div style={{ fontSize:11, fontWeight:600, color:u.text3, textTransform:'uppercase', letterSpacing:.8, marginBottom:8 }}>{tier.label}</div>
                        <div style={{ fontSize:28, fontWeight:800, color, fontFamily:L.mono, lineHeight:1 }}>{tier.diff>0?'+':''}{(tier.diff*100).toFixed(1)}%</div>
                        <div style={{ fontSize:11, color:u.text2, marginTop:4 }}>{dkBetter?'Dark':'Light'} mode advantage</div>
                        <div style={{ marginTop:10, display:'flex', gap:8, fontSize:11 }}>
                          <span style={{ color:DK, fontFamily:L.mono }}>{tier.dkAcc}</span>
                          <span style={{ color:u.text3 }}>vs</span>
                          <span style={{ color:LT, fontFamily:L.mono }}>{tier.ltAcc}</span>
                        </div>
                        {/* Mini bar showing effect size */}
                        <div style={{ marginTop:8, height:4, borderRadius:2, background:u.border, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min(absDiff*300,100)}%`, background:color, borderRadius:2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* High vs Low performers */}
            {perfGroups.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:4 }}>Skill Level × Theme Interaction</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:14 }}>Low performers benefit more from light mode; high performers benefit more from dark mode — a skill-level reversal.</div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr>{['Group','n','Dark Acc','Light Acc','Δ Acc','Dark NASA','Light NASA','Δ NASA','Favours'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                      {perfGroups.map(g => {
                        const favors = g.diffAcc > 0.01 ? 'Dark' : g.diffAcc < -0.01 ? 'Light' : 'Equal';
                        const fc = favors==='Dark'?DK:favors==='Light'?LT:u.text3;
                        return (
                          <tr key={g.label} style={{ background:g.diffAcc>0?`${DK}06`:`${LT}06` }}>
                            <td style={TD(u.text)}>{g.label}</td>
                            <td style={TD(u.text3,true)}>{g.n}</td>
                            <td style={TD(DK,true)}>{g.dkAcc||'—'}</td>
                            <td style={TD(LT,true)}>{g.ltAcc||'—'}</td>
                            <td style={{ ...TD(fc,true), fontWeight:700 }}>{g.diffAcc!=null?(g.diffAcc>0?'+':'')+g.diffAcc:'—'}</td>
                            <td style={TD(DK,true)}>{g.dkNasa||'—'}</td>
                            <td style={TD(LT,true)}>{g.ltNasa||'—'}</td>
                            <td style={TD(g.dkNasa<g.ltNasa?DK:LT,true)}>{g.dkNasa&&g.ltNasa?(g.dkNasa-g.ltNasa>0?'+':'')+((g.dkNasa||0)-(g.ltNasa||0)).toFixed(2):'—'}</td>
                            <td style={{ padding:'8px 14px', borderBottom:`1px solid ${u.border}` }}><Chip label={favors} color={fc} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Phase order effect */}
            {phaseOrderEffect && (phaseOrderEffect.darkPhase1||phaseOrderEffect.darkPhase2) && (
              <div style={{ padding:'16px 20px', borderRadius:10, background:u.fill, border:`1px solid ${u.border}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:u.text, marginBottom:6 }}>Phase Order Effect on Accuracy</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:12 }}>Does being done first or second affect performance? Dark mode shows a notable drop in Phase 2.</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {[
                    { theme:'Dark Mode', p1:phaseOrderEffect.darkPhase1, p2:phaseOrderEffect.darkPhase2, color:DK },
                    { theme:'Light Mode', p1:phaseOrderEffect.lightPhase1, p2:phaseOrderEffect.lightPhase2, color:LT },
                  ].map(({ theme,p1,p2,color }) => {
                    const drop = p1&&p2?+(p2-p1).toFixed(3):null;
                    return (
                      <div key={theme}>
                        <div style={{ fontSize:11, fontWeight:600, color, marginBottom:8 }}>{theme}</div>
                        <div style={{ display:'flex', gap:16 }}>
                          <div>
                            <div style={{ fontSize:10, color:u.text3, marginBottom:2 }}>Phase 1 (first)</div>
                            <div style={{ fontSize:18, fontWeight:700, color, fontFamily:L.mono }}>{p1?.toFixed(3)||'—'}</div>
                          </div>
                          <div style={{ fontSize:18, color:u.text3, alignSelf:'center' }}>→</div>
                          <div>
                            <div style={{ fontSize:10, color:u.text3, marginBottom:2 }}>Phase 2 (second)</div>
                            <div style={{ fontSize:18, fontWeight:700, color, fontFamily:L.mono }}>{p2?.toFixed(3)||'—'}</div>
                          </div>
                          {drop!=null && <div style={{ alignSelf:'center', fontSize:13, fontWeight:700, color:drop<-0.02?u.red:drop>0.02?SIG:u.text3, fontFamily:L.mono }}>Δ{drop>0?'+':''}{drop}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ padding:pad, paddingTop:16 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[
                `Individual winners: ${individualWinners?`${individualWinners.dkWin} dark / ${individualWinners.ltWin} light / ${individualWinners.tied} tied`:'—'}`,
                `Preference alignment: ${patternPrefAlign?`${patternPrefAlign.matchPct}% match`:'—'}`,
                `Age reversal: young→light, adult/senior→dark`,
                `Gender reversal: male→dark, female→light`,
                `Complexity dose-response: simple≈0 → complex→light +13%`,
                `Skill reversal: low performers→light, high→dark`,
              ].map(s => <Chip key={s} label={s} color={u.text3} />)}
            </div>
          </div>
        )}
      </SectionWrap>

      {/* ══ 09 APA RESULTS (collapsible) ════════════════════════════════════════ */}
      <SectionWrap>
        <SHdr num="09" title="APA-Formatted Results"
          sub="Ready to copy into your thesis or paper. Expand, select all, and paste."
          action={<ExpandToggle id="apa" label="text" />} />
        {expanded.apa ? (
          <div style={{ padding:pad }}>
            <div style={{ padding:'24px 28px', background:u.fill, borderRadius:10, border:`1px solid ${u.border}`, userSelect:'all', cursor:'text' }}>
              {[
                { head:'Participants', body:`A total of ${N} participant${N!==1?'s':''} completed a within-subjects experiment comparing dark mode and light mode interfaces across ${CFG.tasks.length} cognitive tasks. Participants were counterbalanced using alternating DL/LD assignment (DL: n = ${cb?.dl??'—'}, LD: n = ${cb?.ld??'—'}).` },
                { head:'Statistical Analysis', body:`Paired-samples t-tests were conducted for ${NT} dependent variables. Given the exploratory nature of this study, results are interpreted primarily through effect sizes (Cohen's d) and 95% confidence intervals, with uncorrected p-values (α = .05) as the statistical threshold. FDR correction (Benjamini-Hochberg procedure) is reported as a supplementary measure, and Bonferroni-corrected values (α = ${ALPHA_BONF_LABEL}) are included for reference. Where Jarque-Bera tests indicated non-normality, Wilcoxon signed-rank tests were conducted as non-parametric alternatives.` },
                tests.acc && { head:'Accuracy', body:`Mean accuracy in dark mode (M = ${fv(desc.acc?.dark?.mean)}, SD = ${fv(desc.acc?.dark?.sd)}) was compared with light mode (M = ${fv(desc.acc?.light?.mean)}, SD = ${fv(desc.acc?.light?.sd)}). A paired-samples t-test ${tests.acc.sig?'revealed a statistically significant difference':'did not reveal a statistically significant difference'}, t(${tests.acc.df}) = ${tests.acc.t}, p = ${tests.acc.p?.toFixed(4)} (Bonferroni-adjusted p = ${Math.min(1,(tests.acc.p||0)*NT).toFixed(4)}), d = ${tests.acc.cohensD}${tests.acc.ci95?`, 95% CI [${fv(tests.acc.ci95.lower)}, ${fv(tests.acc.ci95.upper)}]`:''}` },
                tests.rt && { head:'Response Time', body:`Mean response time: dark mode M = ${fv(desc.rt?.dark?.mean)} ms (SD = ${fv(desc.rt?.dark?.sd)}), light mode M = ${fv(desc.rt?.light?.mean)} ms (SD = ${fv(desc.rt?.light?.sd)}). t(${tests.rt.df}) = ${tests.rt.t}, p = ${tests.rt.p?.toFixed(4)}, d = ${tests.rt.cohensD}.` },
                tests.nasa && { head:'Cognitive Workload', body:`NASA-TLX total: dark mode M = ${fv(desc.nasa?.dark?.mean)} (SD = ${fv(desc.nasa?.dark?.sd)}), light mode M = ${fv(desc.nasa?.light?.mean)} (SD = ${fv(desc.nasa?.light?.sd)}). t(${tests.nasa.df}) = ${tests.nasa.t}, p = ${tests.nasa.p?.toFixed(4)}, d = ${tests.nasa.cohensD}.` },
                sigRows.length>0
                  ? { head:'Significant Findings', body:`The following variables reached significance at the uncorrected threshold (α = .05): ${sigRows.map(r=>`${r.l} [t(${tests[r.k].df}) = ${tests[r.k].t}, p = ${tests[r.k].p?.toFixed(4)}, d = ${tests[r.k].cohensD}]`).join('; ')}. Of these, ${Object.values(tests).filter(t=>t?.fdrSig).length} also survived FDR correction and ${Object.values(tests).filter(t=>t?.bonferroni).length} survived Bonferroni correction.` }
                  : { head:'Null Findings', body:`No dependent variable reached the uncorrected significance threshold (α = .05). Effect sizes were uniformly small (|d| < 0.22), and 95% confidence intervals consistently included zero. Given the exploratory sample size, effect sizes and confidence intervals are the primary basis for interpretation, with Bonferroni-corrected values (α = ${ALPHA_BONF_LABEL}) reported as a conservative reference.` },
                pe && { head:'Practice Effects', body:pe.sig?`A significant practice effect was detected [t(${pe.df}) = ${pe.t}, p = ${pe.p?.toFixed(4)}, d = ${pe.cohensD}], indicating performance changed across phases independently of theme condition. This should be noted as a limitation.`:`No significant practice effect was detected [t(${pe.df}) = ${pe.t}, p = ${pe.p?.toFixed(4)}], indicating performance was stable across phases.` },
              ].filter(Boolean).map(({ head, body }, i) => (
                <div key={i} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:u.text, marginBottom:6 }}>{head}.</div>
                  <div style={{ fontSize:13, color:u.text2, lineHeight:1.9, fontFamily:"Georgia, 'Times New Roman', serif" }}>{body}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:u.text3, marginTop:10 }}>Select all text above to copy. Review statistical notation and update participant details before submission.</div>
          </div>
        ) : (
          <div style={{ padding:pad, paddingTop:16 }}>
            <div style={{ fontSize:13, color:u.text3 }}>Auto-generated APA-formatted paragraph with all test statistics, ready to paste into your paper.</div>
          </div>
        )}
      </SectionWrap>

    </div>
  );
}

// ─── LIMITATIONS TAB ─────────────────────────────────────────────────────────────
function LimitationsTab({ u }) {
  const MAR = "#f97316";
  const sevColor = s => s==="High"?u.red:s==="Moderate"?MAR:u.teal;
  const lims = [
    { title:"Sample Size",           sev:"High",     desc:"Paired t-tests require n ≥ 20 for adequate power (1−β ≥ 0.80) at medium effects with Bonferroni correction. Current results are preliminary. Effect sizes (Cohen's d) are more reliable indicators than p-values." },
    { title:"Stimulus Difficulty",   sev:"High",     desc:"Both phases use randomly generated stimuli rather than pre-matched sets. Unequal task difficulty across conditions may confound theme comparisons. A counterbalanced fixed stimulus set would strengthen internal validity." },
    { title:"Practice Effect",       sev:"Moderate", desc:"Participants in Phase 2 benefit from task familiarity regardless of theme. Counterbalancing mitigates but does not eliminate this. Practice effect analysis is available in the Analysis tab." },
    { title:"Single-Session Design", sev:"Moderate", desc:"Both conditions were tested in one session. Long-term habituation, sustained-use fatigue, and preference stability remain unexamined. A longitudinal design would address these concerns." },
    { title:"Theme Scope",           sev:"Moderate", desc:"Only default system light and dark themes were tested. Custom schemes, high-contrast modes, blue-light filters, and individual display calibration were excluded, limiting generalisability." },
    { title:"Multiple Comparisons",  sev:"Low",      desc:"11 simultaneous t-tests are conducted. Results are interpreted using uncorrected α = .05 as the primary threshold (appropriate for exploratory research), supplemented by FDR correction (Benjamini-Hochberg) and Bonferroni correction (α = 0.0045) as reference. Effect sizes and 95% CIs are the primary evidence throughout." },
    { title:"Normality Assumption",  sev:"Low",      desc:"Paired t-tests assume normally distributed difference scores. The Jarque-Bera test flags violations; non-parametric Wilcoxon alternatives are computed and reported in the Analysis tab." },
    { title:"Self-Report Validity",  sev:"Low",      desc:"NASA-TLX and comfort ratings rely on self-report, which is subject to response bias and demand characteristics. Objective physiological measures would supplement these findings." },
  ];
  return (
    <div className="au" style={{ fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Methodology" title="Limitations & Validity Threats"
        sub="Known threats to internal and external validity. Address these in your Discussion section." />
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {lims.map(({ title, sev, desc }) => {
          const c = sevColor(sev);
          return (
            <Card key={title} u={u} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ height:3, background:c }} />
              <div style={{ padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:u.text }}>{title}</div>
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:`${c}15`, color:c, border:`1px solid ${c}25`, fontWeight:600 }}>{sev}</span>
                </div>
                <div style={{ fontSize:13, color:u.text2, lineHeight:1.7 }}>{desc}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

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
    visual_search:   { name:"Visual Search",          what:"your ability to locate a target among distractors — used constantly when scanning documents, dashboards, or emails." },
    flanker:         { name:"Inhibitory Control",     what:"your ability to ignore irrelevant information and focus on what matters — critical for avoiding distractions." },
    symbol_match:    { name:"Symbol Matching",        what:"your pattern recognition ability — how quickly and accurately you can identify matching visual information." },
    sentence_verify: { name:"Sentence Verification",  what:"how accurately you read and evaluate written statements — fundamental to any knowledge work." },
    trail_making:    { name:"Trail Making",            what:"your planning and sequencing ability — the capacity to organise steps in the right order efficiently." },
    digit_span:      { name:"Digit Span",              what:"your verbal working memory — how well you hold and recall short sequences of information." },
    n_back:          { name:"N-Back Memory",           what:"your memory updating ability — a core component of multi-step problem solving and active learning." },
    nav_task:        { name:"Navigation",              what:"your ability to move efficiently through menu structures — reflecting everyday software and web navigation." },
  };

  CFG.tasks.forEach(tid => {
    const tp = stats.tperf?.[tid];
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
  const nasaScore = nasa?.totalScore;
  if (nasaScore != null) {
    if (nasaScore < 7) workloadInsight = `Your overall workload score of ${nasaScore.toFixed(1)} out of 20 indicates a low cognitive load experience — the tasks felt manageable and you did not experience significant mental fatigue. This is a very positive result.`;
    else if (nasaScore < 13) workloadInsight = `Your workload score of ${nasaScore.toFixed(1)} out of 20 reflects a moderate level of cognitive effort. This is the expected range for unfamiliar tasks — it shows genuine engagement without overwhelming strain.`;
    else workloadInsight = `Your workload score of ${nasaScore.toFixed(1)} out of 20 suggests the tasks were cognitively demanding. This is common when encountering new interface types for the first time. With repeated exposure, perceived workload drops substantially.`;
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
            const tp = stats.tperf?.[tid];
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

// ─── LIVE MONITOR TAB ─────────────────────────────────────────────────────────────
function LiveMonitorTab({ u, users }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(t=>t+1), 5000); return () => clearInterval(iv); }, []);
  const todayStr = new Date().toDateString();
  const all = db.all().filter(x => x.role !== "admin");
  const activeToday    = all.filter(u2 => (u2.experiments||[]).some(e => e.ts && new Date(e.ts).toDateString() === todayStr));
  const inProgress     = activeToday.filter(u2 => !u2.completed && (u2.experiments||[]).length < 2);
  const completedToday = activeToday.filter(u2 => u2.completed || (u2.experiments||[]).length >= 2);
  const updated = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  return (
    <div className="au" style={{ fontFamily:L.font }}>
      <SectionHdr u={u} eyebrow="Real-time" title="Live Monitor"
        action={<div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:R.pill, background:`${u.green}12`, border:`1px solid ${u.green}28` }}><div style={{ width:7, height:7, borderRadius:"50%", background:u.green }} /><span style={{ fontSize:L.fsXs, color:u.green, fontWeight:L.fwSemi }}>Live · {updated}</span></div>}
      />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:L.spMd, marginBottom:24 }}>
        {[{l:"Active Today",v:activeToday.length,c:u.accent,i:"👥"},{l:"In Progress",v:inProgress.length,c:u.orange,i:"⚡"},{l:"Completed",v:completedToday.length,c:u.green,i:"✓"},{l:"Total",v:all.length,c:u.teal,i:"📋"}].map(({l,v,c,i})=>(
          <Card key={l} u={u} style={{ padding:L.spMd, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:c }} />
            <div style={{ fontSize:20, marginBottom:L.spSm }}>{i}</div>
            <div style={{ fontSize:30, fontWeight:L.fwBlack, color:c, fontFamily:L.mono, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:L.fsXs, color:u.text3, marginTop:4 }}>{l}</div>
          </Card>
        ))}
      </div>
      {inProgress.length > 0 && <Card u={u} style={{ padding:L.spLg, marginBottom:16 }}><div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text, marginBottom:L.spMd }}>⚡ In Progress</div>{inProgress.map(u2=><div key={u2.id} style={{ display:"flex", alignItems:"center", gap:L.spMd, padding:L.spMd, background:u.fill, borderRadius:R.md, marginBottom:8 }}><div style={{ width:36,height:36,borderRadius:10,background:u.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:L.fwBold,color:"#fff",flexShrink:0 }}>{u2.name.slice(0,2).toUpperCase()}</div><div style={{ flex:1 }}><div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{u2.name}</div><div style={{ fontSize:L.fsXs, color:u.text3 }}>Phase {(u2.experiments||[]).length+1} of 2</div></div><span style={{ fontSize:L.fsXs, padding:"3px 10px", borderRadius:R.pill, background:`${u.orange}18`, color:u.orange, border:`1px solid ${u.orange}30` }}>Active</span></div>)}</Card>}
      {completedToday.length > 0 && <Card u={u} style={{ padding:L.spLg, marginBottom:16 }}><div style={{ fontSize:L.fsBase, fontWeight:L.fwSemi, color:u.text, marginBottom:L.spMd }}>✓ Completed Today</div>{completedToday.map(u2=><div key={u2.id} style={{ display:"flex", alignItems:"center", gap:L.spMd, padding:L.spMd, background:u.fill, borderRadius:R.md, marginBottom:8 }}><div style={{ width:36,height:36,borderRadius:10,background:u.gradSoft,border:`1px solid ${u.green}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:L.fwBold,color:u.green,flexShrink:0 }}>{u2.name.slice(0,2).toUpperCase()}</div><div style={{ flex:1 }}><div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{u2.name}</div><div style={{ fontSize:L.fsXs, color:u.text3 }}>Preferred: {u2.pref||"—"}</div></div><span style={{ fontSize:L.fsXs, padding:"3px 10px", borderRadius:R.pill, background:`${u.green}18`, color:u.green, border:`1px solid ${u.green}28` }}>Done</span></div>)}</Card>}
      {activeToday.length === 0 && <EmptyState u={u} icon="👁" title="No activity today" body="Participants who start or complete the experiment today appear here." />}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────────
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
      <Card u={u} style={{ padding:L.spLg }}>
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

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────────
function AdminDashboard({ onLogout, u, uiDark, onToggleTheme }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState(() => db.all().filter(x => x.role !== "admin").sort((a,b) => a.name.localeCompare(b.name)));
  const [sel, setSel] = useState(null);
  const [csvModal, setCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Pull latest participant data from Supabase on first load + every 30s
  useEffect(() => {
    if (!supa) return;
    const sync = () => {
      setSyncing(true);
      db.syncFromCloud().then(() => {
        setUsers(db.all().filter(x => x.role !== "admin").sort((a,b) => a.name.localeCompare(b.name)));
        setSyncing(false);
      });
    };
    sync();
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    setSyncing(true);
    await db.syncFromCloud();
    setUsers(db.all().filter(x => x.role !== "admin").sort((a,b) => a.name.localeCompare(b.name)));
    setSyncing(false);
  };
  const [delConfirm, setDelConfirm] = useState(null);

  const deleteParticipant = async (pid) => {
    // Remove from localStorage
    const all = db.all().filter(u => u.id !== pid);
    try { localStorage.setItem("hci_v5_users", JSON.stringify(all)); } catch {}
    setUsers(all.filter(u => u.role !== "admin").sort((a,b) => a.name.localeCompare(b.name)));
    setDelConfirm(null);
    if (sel?.id === pid) setSel(null);
    // Remove from Supabase
    if (supa) {
      try { await supa.from("participants").delete().eq("id", pid); } catch {}
    }
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
  const allExps = useMemo(() => users.flatMap(usr => (usr.experiments || []).map(e => ({ ...e, uid: usr.id }))), [users]);
  const allT    = useMemo(() => allExps.flatMap(e => (e.tasks || []).flatMap(t => (t.trials || []).map(tr => ({ ...tr, theme: e.theme, task: t.type })))), [allExps]);
  const dkT     = useMemo(() => allT.filter(t => t.theme === "dark"),  [allT]);
  const ltT     = useMemo(() => allT.filter(t => t.theme === "light"), [allT]);
  const dkRTs   = useMemo(() => dkT.filter(t => t.rt && t.rt > 50).map(t => t.rt), [dkT]);
  const ltRTs   = useMemo(() => ltT.filter(t => t.rt && t.rt > 50).map(t => t.rt), [ltT]);
  const tStats  = useMemo(() => CFG.tasks.map(tid => {
    const tr = allT.filter(t => t.task === tid);
    const dk = tr.filter(t => t.theme === "dark"), lt = tr.filter(t => t.theme === "light");
    return { tid, l: CFG.TL[tid] || tid, n: tr.length, acc: avg(tr.map(t => t.acc || 0)), dk: { acc: avg(dk.map(t => t.acc || 0)), rt: avg(dk.filter(t => t.rt).map(t => t.rt)) }, lt: { acc: avg(lt.map(t => t.acc || 0)), rt: avg(lt.filter(t => t.rt).map(t => t.rt)) } };
  }), [allT]);
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
        <div style={{ width:230, height:"100vh", background:u.sidebar, borderRight:`1px solid ${u.sidebarBorder}`, display:"flex", flexDirection:"column", padding:18, position:"sticky", top:0, flexShrink:0, overflowY:"auto" }}>
          <div style={{ marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🧠</div>
            <div><div style={{ fontSize:L.fsMd, fontWeight:L.fwBold, color:u.text }}>CogBench</div><Badge u={u} color={u.red}>Admin</Badge></div>
          </div>
          <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
            {navItems.map(({ id, l }) => <button key={id} onClick={() => setTab(id)} style={{ height:36, borderRadius:R.md, border:"none", background:tab===id?`${u.accent}14`:"transparent", color:tab===id?u.accent:u.text2, fontWeight:tab===id?L.fwSemi:L.fwNorm, textAlign:"left", padding:"0 11px", fontFamily:L.font, cursor:"pointer", fontSize:L.fsBase, transition:"all .15s" }}>{l}</button>)}
          </nav>
          <div style={{ borderTop:`1px solid ${u.border}`, paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
            <button onClick={exportCSV} style={{ height:34, borderRadius:R.md, border:`1px solid ${u.accent}40`, background:`${u.accent}12`, color:u.accent, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, fontWeight:L.fwSemi }}>↓ Export CSV</button>
            <button onClick={refresh} style={{ height:34, borderRadius:R.md, border:`1px solid ${u.border}`, background:"transparent", color:u.text3, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm }}>{syncing?"⟳ Syncing…":"⟳ Refresh"}</button>
            <div style={{ fontSize:L.fsXs, color:supa?(syncing?u.orange:u.green):u.text3, textAlign:"center" }}>
              {supa ? (syncing ? "⟳ Syncing with cloud…" : "☁ Cloud connected") : "⚠ Local storage only"}
            </div>
            {/* Toggle + Sign out side by side */}
            <div style={{ display:"flex", gap:8 }}>
              <ThemeToggle uiDark={uiDark} onToggle={onToggleTheme} u={u} />
              <button onClick={onLogout} style={{ flex:1, height:32, borderRadius:R.md, border:`1px solid ${u.red}40`, background:`${u.red}08`, color:u.red, fontFamily:L.font, cursor:"pointer", fontSize:L.fsSm, fontWeight:L.fwSemi }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", minWidth:0 }}>
        <div style={{ width:"100%", padding:mobile?`${L.spMd}px 14px`:`${L.spXl}px ${L.spLg}px` }}>
        {tab === "overview" && (
          <TabErrorBoundary u={u}><div className="au">
          {(() => {
            const DK = "#7c3aed", LT = "#d97706", SIG = "#059669";
            const completed = users.filter(u2 => (u2.experiments||[]).length >= 2);
            const inProg    = users.filter(u2 => (u2.experiments||[]).length === 1);
            const registered= users.filter(u2 => (u2.experiments||[]).length === 0);
            const dlN = users.filter(u2=>u2.orderGroup==="DL").length;
            const ldN = users.filter(u2=>u2.orderGroup==="LD").length;
            const balanced  = Math.abs(dlN-ldN) <= 2;
            const dkAcc     = dkT.length ? avg(dkT.map(t=>t.acc||0)) : null;
            const ltAcc     = ltT.length ? avg(ltT.map(t=>t.acc||0)) : null;
            const dkRT      = dkRTs.length ? avg(dkRTs) : null;
            const ltRT      = ltRTs.length ? avg(ltRTs) : null;
            const dkNasa = (() => { const vals=allExps.filter(e=>e.theme==="dark").map(e=>e.nasaTLX?.totalScore).filter(v=>v!=null); return vals.length?avg(vals):null; })();
            const ltNasa = (() => { const vals=allExps.filter(e=>e.theme==="light").map(e=>e.nasaTLX?.totalScore).filter(v=>v!=null); return vals.length?avg(vals):null; })();
            // Recent activity (last 7 days)
            const now = Date.now();
            const recent7 = users.filter(u2=>u2.createdAt && (now-new Date(u2.createdAt).getTime())<7*86400000);
            const recent24 = users.filter(u2=>u2.createdAt && (now-new Date(u2.createdAt).getTime())<86400000);
            // Preference breakdown
            const prefDk = users.filter(u2=>u2.pref==="dark").length;
            const prefLt = users.filter(u2=>u2.pref==="light").length;
            const prefNo = users.filter(u2=>u2.pref==="none"||!u2.pref).length;
            // Target = 68 (34+34), progress
            const TARGET = 68;
            const progress = Math.min(completed.length/TARGET*100,100);

            return <>
              {/* ── Header ─────────────────────────────────────────────── */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontSize:12, color:u.text3, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6, fontWeight:600 }}>Admin Dashboard</div>
                  <h1 style={{ fontSize:24, fontWeight:800, color:u.text, margin:0, letterSpacing:-.5 }}>Study Overview</h1>
                  <p style={{ color:u.text3, fontSize:13, margin:"6px 0 0" }}>Dark Mode vs Light Mode · Within-subjects HCI experiment · Real-time</p>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ fontSize:11, color:supa?SIG:u.red, padding:"4px 10px", borderRadius:99, background:supa?`${SIG}10`:`${u.red}10`, border:`1px solid ${supa?SIG:u.red}25`, fontWeight:600 }}>
                    {supa ? "● Live" : "⚠ Offline"}
                  </div>
                  <button onClick={refresh} style={{ height:32, padding:"0 14px", borderRadius:R.md, border:`1px solid ${u.border}`, background:u.fill, color:u.text2, fontFamily:L.font, cursor:"pointer", fontSize:12, fontWeight:500 }}>{syncing?"⟳ Syncing…":"⟳ Refresh"}</button>
                </div>
              </div>

              {/* ── Recruitment Progress ────────────────────────────────── */}
              <div style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:14, padding:"20px 24px", marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:u.text3, textTransform:"uppercase", letterSpacing:.8 }}>Recruitment Progress</div>
                    <div style={{ fontSize:22, fontWeight:800, color:u.text, marginTop:4 }}>
                      {completed.length} <span style={{ fontSize:14, fontWeight:400, color:u.text3 }}>of {TARGET} target pairs</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    {[
                      { l:"Completed", v:completed.length, c:SIG },
                      { l:"In Progress", v:inProg.length, c:u.orange },
                      { l:"Registered", v:registered.length, c:u.text3 },
                      { l:"Last 24h", v:recent24.length, c:u.teal },
                      { l:"Last 7 days", v:recent7.length, c:u.accent },
                    ].map(({ l,v,c }) => (
                      <div key={l} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:700, color:c, fontFamily:L.mono }}>{v}</div>
                        <div style={{ fontSize:10, color:u.text3, marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height:8, background:u.fill, borderRadius:4, overflow:"hidden", marginBottom:6 }}>
                  <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${SIG},${u.teal})`, borderRadius:4, transition:"width .5s" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:u.text3 }}>
                  <span>{progress.toFixed(1)}% complete</span>
                  <span>{TARGET-completed.length} more pairs needed</span>
                </div>
              </div>

              {/* ── KPI Grid ────────────────────────────────────────────── */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
                {[
                  { l:"Total Enrolled",  v:users.length,      sub:"all accounts", c:u.accent,  icon:"👥" },
                  { l:"Paired Complete", v:completed.length,  sub:"both phases",  c:SIG,       icon:"✓"  },
                  { l:"Total Trials",    v:allT.length.toLocaleString(), sub:"recorded",     c:u.teal,  icon:"📊" },
                  { l:"Completion Rate", v:users.length?`${Math.round(completed.length/users.length*100)}%`:"—", sub:"enrolled→paired", c:u.green, icon:"📈" },
                  { l:"DL Group",        v:dlN,               sub:balanced?"✓ Balanced":"⚠ Imbalanced", c:balanced?SIG:u.orange, icon:"🌙→☀️" },
                  { l:"LD Group",        v:ldN,               sub:balanced?"✓ Balanced":"⚠ Imbalanced", c:balanced?SIG:u.orange, icon:"☀️→🌙" },
                ].map(({ l,v,sub,c,icon }) => (
                  <div key={l} style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:12, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:c }} />
                    <div style={{ fontSize:18, marginBottom:8 }}>{icon}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:L.mono, lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:u.text2, marginTop:5, textTransform:"uppercase", letterSpacing:.6 }}>{l}</div>
                    <div style={{ fontSize:10, color:u.text3, marginTop:2 }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* ── Main content grid ───────────────────────────────────── */}
              <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 1fr", gap:16, marginBottom:16 }}>

                {/* Theme Performance Comparison */}
                <div style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:14, padding:"20px 22px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:u.text, marginBottom:16 }}>Theme Performance Comparison</div>
                  {[
                    { l:"Accuracy", dk:dkAcc, lt:ltAcc, fmt:v=>v!=null?(v*100).toFixed(1)+"%":"—", hi:true  },
                    { l:"Response Time", dk:dkRT, lt:ltRT, fmt:v=>v!=null?Math.round(v)+"ms":"—", hi:false },
                    { l:"NASA Workload", dk:dkNasa, lt:ltNasa, fmt:v=>v!=null?v.toFixed(1)+"/20":"—", hi:false },
                  ].map(({ l, dk, lt, fmt, hi }) => {
                    const diff = dk!=null&&lt!=null ? dk-lt : null;
                    const dkBetter = diff!=null && (hi?diff>0:diff<0);
                    const ltBetter = diff!=null && (hi?diff<0:diff>0);
                    return (
                      <div key={l} style={{ marginBottom:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:12, color:u.text2, fontWeight:500 }}>{l}</span>
                          {diff!=null && <span style={{ fontSize:11, color:dkBetter?DK:ltBetter?LT:u.text3, fontWeight:600 }}>{dkBetter?"Dark better":ltBetter?"Light better":"Equal"}</span>}
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <div style={{ flex:1, padding:"8px 12px", borderRadius:8, background:`${DK}10`, border:`1px solid ${DK}20`, textAlign:"center" }}>
                            <div style={{ fontSize:10, color:DK, marginBottom:2 }}>🌙 Dark</div>
                            <div style={{ fontSize:15, fontWeight:700, color:DK, fontFamily:L.mono }}>{fmt(dk)}</div>
                          </div>
                          <div style={{ flex:1, padding:"8px 12px", borderRadius:8, background:`${LT}10`, border:`1px solid ${LT}20`, textAlign:"center" }}>
                            <div style={{ fontSize:10, color:LT, marginBottom:2 }}>☀️ Light</div>
                            <div style={{ fontSize:15, fontWeight:700, color:LT, fontFamily:L.mono }}>{fmt(lt)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Theme Preference + Counterbalance */}
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {/* Preference */}
                  <div style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:14, padding:"20px 22px", flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:u.text, marginBottom:14 }}>Theme Preference</div>
                    {[
                      { l:"Dark Mode", v:prefDk, c:DK },
                      { l:"Light Mode", v:prefLt, c:LT },
                      { l:"No Preference", v:prefNo, c:u.text3 },
                    ].map(({ l,v,c }) => {
                      const total = prefDk+prefLt+prefNo||1;
                      return (
                        <div key={l} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:12, color:u.text2 }}>{l}</span>
                            <span style={{ fontSize:12, fontWeight:600, color:c, fontFamily:L.mono }}>{v} ({(v/total*100).toFixed(0)}%)</span>
                          </div>
                          <div style={{ height:5, background:u.fill, borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${v/total*100}%`, background:c, opacity:.85, borderRadius:3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Counterbalance */}
                  <div style={{ background:u.bg, border:`1.5px solid ${balanced?SIG:u.orange}30`, borderRadius:14, padding:"18px 22px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:u.text }}>Counterbalance</div>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:balanced?`${SIG}12`:`${u.orange}12`, color:balanced?SIG:u.orange, fontWeight:600 }}>{balanced?"✓ Balanced":"⚠ Imbalanced"}</span>
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                      {[{l:"DL (Dark first)",v:dlN,c:DK},{l:"LD (Light first)",v:ldN,c:LT}].map(({l,v,c})=>(
                        <div key={l} style={{ flex:1, textAlign:"center", padding:"10px", borderRadius:8, background:`${c}08`, border:`1px solid ${c}20` }}>
                          <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:L.mono }}>{v}</div>
                          <div style={{ fontSize:10, color:u.text3, marginTop:3 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {!balanced && <div style={{ marginTop:10, fontSize:11, color:u.orange }}>Need {Math.abs(dlN-ldN)} more {dlN>ldN?"LD":"DL"} participants to balance.</div>}
                  </div>
                </div>
              </div>

              {/* ── Accuracy by Task (full width bar chart) ─────────────── */}
              <div style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:14, padding:"20px 22px", marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:u.text, marginBottom:4 }}>Accuracy by Task Type</div>
                <div style={{ fontSize:11, color:u.text3, marginBottom:16 }}>Mean accuracy across all participants · Dark vs Light</div>
                <div style={{ overflowX:"auto" }}>
                {(() => {
                  const tasks = tStats.filter(t=>t.n>0);
                  if (!tasks.length) return <div style={{ color:u.text3, fontSize:13, textAlign:"center", padding:20 }}>No trial data yet</div>;
                  const BW=20, GAP=6, GRP=16, H=100, LBL=60;
                  const W = tasks.length*(BW*2+GAP+GRP)+LBL;
                  return (
                    <svg width="100%" viewBox={`0 0 ${W} ${H+28}`} style={{ minWidth:Math.min(W,500), display:"block" }}>
                      {[0,.25,.5,.75,1].map(v=>(
                        <g key={v}>
                          <line x1={LBL-8} y1={H-v*H} x2={W} y2={H-v*H} stroke={u.border} strokeWidth={.5} />
                          <text x={LBL-10} y={H-v*H+3} fontSize={8} fill={u.text3} textAnchor="end" fontFamily={L.mono}>{(v*100).toFixed(0)}%</text>
                        </g>
                      ))}
                      {tasks.map((task,ti)=>{
                        const x=LBL+ti*(BW*2+GAP+GRP);
                        const dh=(task.dk?.acc||0)*H, lh=(task.lt?.acc||0)*H;
                        const label=task.l.split(" ")[0];
                        return (
                          <g key={task.tid}>
                            <rect x={x}       y={H-dh} width={BW} height={dh} rx={3} fill={DK} opacity={.85} />
                            <rect x={x+BW+GAP} y={H-lh} width={BW} height={lh} rx={3} fill={LT} opacity={.85} />
                            <text x={x+BW} y={H+13} fontSize={8} fill={u.text2} textAnchor="middle" fontFamily={L.font}>{label}</text>
                            {/* Diff indicator */}
                            {Math.abs(dh-lh)>5 && <line x1={x+BW/2} y1={Math.min(H-dh,H-lh)-2} x2={x+BW+GAP+BW/2} y2={Math.min(H-dh,H-lh)-2} stroke={dh>lh?DK:LT} strokeWidth={1.5} strokeDasharray="3,2" opacity={.6} />}
                          </g>
                        );
                      })}
                      <rect x={LBL} y={H+18} width={BW} height={5} rx={1} fill={DK} />
                      <text x={LBL+BW+4} y={H+23} fontSize={9} fill={DK} fontFamily={L.font}>Dark</text>
                      <rect x={LBL+50} y={H+18} width={BW} height={5} rx={1} fill={LT} />
                      <text x={LBL+50+BW+4} y={H+23} fontSize={9} fill={LT} fontFamily={L.font}>Light</text>
                    </svg>
                  );
                })()}
                </div>
              </div>

              {/* ── Recent registrations ────────────────────────────────── */}
              <div style={{ background:u.bg, border:`1px solid ${u.border}`, borderRadius:14, padding:"20px 22px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:u.text }}>Recent Participants</div>
                  <button onClick={()=>setTab("participants")} style={{ fontSize:11, color:u.accent, background:"none", border:"none", cursor:"pointer", fontFamily:L.font, fontWeight:600 }}>View all →</button>
                </div>
                {users.length===0 && <div style={{ color:u.text3, fontSize:13, textAlign:"center", padding:20 }}>No participants yet</div>}
                {[...users].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6).map(p=>{
                  const sessions=(p.experiments||[]).length;
                  const statusColor = sessions>=2?SIG:sessions===1?u.orange:u.text3;
                  const statusLabel = sessions>=2?"Completed":sessions===1?"In Progress":"Registered";
                  return (
                    <div key={p.id} onClick={()=>{setSel(p);setTab("participants");}} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${u.border}`, cursor:"pointer" }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:sessions>=2?`${SIG}18`:u.fill, border:`1px solid ${sessions>=2?SIG:u.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:statusColor, flexShrink:0 }}>{p.name.slice(0,2).toUpperCase()}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:u.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize:11, color:u.text3 }}>{p.orderGroup||"—"} · {p.dem?.gender||"—"} · Age {p.dem?.age||"—"}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:statusColor, padding:"2px 8px", borderRadius:99, background:`${statusColor}12`, border:`1px solid ${statusColor}25` }}>{statusLabel}</div>
                        <div style={{ fontSize:10, color:u.text3, marginTop:3 }}>{p.createdAt?new Date(p.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"—"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>;
          })()}
          </div></TabErrorBoundary>
        )}
        {tab === "participants" && (
          <TabErrorBoundary u={u}><div className="au">
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
                            {(p.experiments||[]).length > 2 && <span style={{ fontSize: L.fsXs, padding: "1px 6px", borderRadius: R.pill, background: `${u.orange}18`, color: u.orange, border: `1px solid ${u.orange}28` }}>⚠ {(p.experiments||[]).length} sessions</span>}
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
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:u.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:L.fwBold, color:"#fff", flexShrink:0 }}>{sel.name.slice(0,2).toUpperCase()}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:L.fsLg, fontWeight:L.fwBold, color:u.text }}>{sel.name}</div>
                    <div style={{ fontSize:L.fsSm, color:u.text3 }}>{sel.email}</div>
                    <div style={{ display:"flex", gap:10, marginTop:4, flexWrap:"wrap" }}>
                      {sel.orderGroup && <Badge u={u} color={u.accent}>{sel.orderGroup === "DL" ? "🌙→☀️ Dark First" : "☀️→🌙 Light First"}</Badge>}
                      {sel.pref && sel.pref !== "none" && <Badge u={u} color={sel.pref==="dark"?u.accent2:u.gold}>Prefers {sel.pref}</Badge>}
                      {sel.completed ? <Badge u={u} color={u.green}>✓ Completed</Badge> : <Badge u={u} color={u.orange}>In Progress</Badge>}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <Card u={u} style={{ padding:L.spMd, marginBottom:12 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
                    {[
                      { l:"Registered",  v:sel.createdAt  ? new Date(sel.createdAt).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—" },
                      { l:"Completed",   v:sel.completedAt? new Date(sel.completedAt).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—" },
                      { l:"Order Group", v:sel.orderGroup||"—" },
                      { l:"Preference",  v:sel.pref||"—" },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ padding:"8px 12px", background:u.fill, borderRadius:R.md }}>
                        <div style={{ fontSize:L.fsXs, color:u.text3, marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Demographics */}
                {sel.dem && Object.keys(sel.dem).length > 0 && (
                  <Card u={u} style={{ padding:L.spMd, marginBottom:12 }}>
                    <div style={{ fontSize:L.fsSm, fontWeight:L.fwSemi, color:u.text, marginBottom:10 }}>Demographics</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8 }}>
                      {Object.entries(sel.dem).map(([k, v]) => (
                        <div key={k} style={{ padding:"6px 10px", background:u.fill, borderRadius:R.md }}>
                          <div style={{ fontSize:L.fsXs, color:u.text3, marginBottom:1, textTransform:"capitalize" }}>{k.replace(/([A-Z])/g," $1")}</div>
                          <div style={{ fontSize:L.fsSm, color:u.text }}>{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Sessions */}
                {(sel.experiments||[]).map((sess, si) => {
                  const allT2 = (sess.tasks||[]).flatMap(t => t.trials||[]);
                  const ac = avg(allT2.map(t => t.acc||0));
                  const rts = allT2.filter(t=>t.rt).map(t=>t.rt);
                  const nasa = sess.nasaTLX;
                  return (
                    <Card key={si} u={u} style={{ marginBottom:12, padding:L.spLg }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <Badge u={u} color={sess.theme==="dark"?u.accent2:u.gold}>{sess.theme==="dark"?"🌙 Dark":"☀️ Light"}</Badge>
                          <span style={{ fontSize:L.fsSm, color:u.text2 }}>Phase {sess.phase || si+1}</span>
                        </div>
                        <div style={{ display:"flex", gap:L.spMd }}>
                          <span style={{ fontSize:L.fsSm, color:u.text3 }}>Acc: <strong style={{ color:u.green }}>{fmtPct(ac)}</strong></span>
                          {rts.length>0 && <span style={{ fontSize:L.fsSm, color:u.text3 }}>RT: <strong style={{ color:u.teal }}>{fmtMs(avg(rts))}</strong></span>}
                          {allT2.length>0 && <span style={{ fontSize:L.fsSm, color:u.text3 }}>Trials: <strong style={{ color:u.text }}>{allT2.length}</strong></span>}
                        </div>
                      </div>

                      {/* Per-task breakdown */}
                      {(sess.tasks||[]).length > 0 && (
                        <div className="tbl-wrap" style={{ marginBottom:nasa?12:0 }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:L.fsXs }}>
                            <thead>
                              <tr style={{ borderBottom:`1px solid ${u.border}` }}>
                                {["Task","Trials","Accuracy","Avg RT","Errors"].map(h=>(
                                  <th key={h} style={{ padding:"5px 8px", textAlign:"left", color:u.text3, fontWeight:L.fwSemi, whiteSpace:"nowrap" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(sess.tasks||[]).map((task,ti) => {
                                const tTrials = task.trials||[];
                                const tAcc = avg(tTrials.map(t=>t.acc||0));
                                const tRTs = tTrials.filter(t=>t.rt).map(t=>t.rt);
                                const tErr = tTrials.reduce((s,t)=>s+(t.err||0),0);
                                return (
                                  <tr key={ti} style={{ borderBottom:`1px solid ${u.border}`, background:ti%2===0?u.fill:"transparent" }}>
                                    <td style={{ padding:"6px 8px", color:u.text, fontWeight:L.fwSemi }}>{CFG.TL[task.type]||task.type}</td>
                                    <td style={{ padding:"6px 8px", color:u.text3 }}>{tTrials.length}</td>
                                    <td style={{ padding:"6px 8px", color:tAcc>=0.7?u.green:tAcc>=0.5?u.orange:u.red, fontWeight:L.fwBold, fontFamily:L.mono }}>{tTrials.length?fmtPct(tAcc):"—"}</td>
                                    <td style={{ padding:"6px 8px", color:u.teal, fontFamily:L.mono }}>{tRTs.length?fmtMs(avg(tRTs)):"—"}</td>
                                    <td style={{ padding:"6px 8px", color:u.text3, fontFamily:L.mono }}>{tErr}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Comfort */}
                      {sess.comfort && (
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:6, marginBottom:nasa?10:0 }}>
                          {[{l:"Visual Comfort",k:"visualComfort"},{l:"Eye Strain",k:"eyeStrain"},{l:"Fatigue",k:"fatigue"},{l:"Satisfaction",k:"satisfaction"}].map(({l,k})=>(
                            <div key={k} style={{ padding:"6px 10px", background:u.fill, borderRadius:R.sm, textAlign:"center" }}>
                              <div style={{ fontSize:10, color:u.text3, marginBottom:2 }}>{l}</div>
                              <div style={{ fontSize:L.fsSm, fontWeight:L.fwBold, color:u.accent }}>{sess.comfort[k]||"—"}/7</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* NASA-TLX */}
                      {nasa && (
                        <div style={{ padding:"10px 12px", borderRadius:R.md, background:u.fill, border:`1px solid ${u.border}` }}>
                          <div style={{ fontSize:L.fsXs, color:u.text3, marginBottom:6, fontWeight:L.fwSemi }}>NASA-TLX · Total: <span style={{ color:u.accent }}>{nasa.totalScore?.toFixed(1)}/20</span></div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {[{k:"md",l:"Mental"},{k:"pd",l:"Physical"},{k:"td",l:"Temporal"},{k:"pe",l:"Performance"},{k:"ef",l:"Effort"},{k:"fr",l:"Frustration"}].map(({k,l})=>(
                              <span key={k} style={{ fontSize:11, padding:"2px 8px", borderRadius:R.pill, background:u.bg, border:`1px solid ${u.border}`, color:u.text2 }}>{l}: <strong>{nasa[k]}</strong></span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div></TabErrorBoundary>
        )}
        {tab === "monitor" && <TabErrorBoundary u={u}><LiveMonitorTab u={u} users={users} /></TabErrorBoundary>}
        {tab === "statistics" && (
          <TabErrorBoundary u={u}><div className="au">
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
          </div></TabErrorBoundary>
        )}
        {tab === "stats_engine" && <TabErrorBoundary u={u}><AnalysisTab u={u} users={users} /></TabErrorBoundary>}
        {tab === "limitations" && <TabErrorBoundary u={u}><LimitationsTab u={u} /></TabErrorBoundary>}
        {tab === "settings"    && <TabErrorBoundary u={u}><SettingsTab u={u} /></TabErrorBoundary>}
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

  const [startingExp, setStartingExp] = useState(false);

  const startExp = async () => {
    if (startingExp) return;
    if (user.completed || (user.experiments || []).length >= 2) return; // one attempt only

    const doneExps = (user.experiments || []).filter(e => (e.tasks||[]).length > 0);

    if (doneExps.length === 1) {
      // One phase already done — resume with the pending theme
      const doneTheme   = doneExps[0].theme;
      const pendTheme   = doneTheme === "dark" ? "light" : "dark";
      const p1 = user.orderGroup === "DL" ? "dark" : (user.orderGroup === "LD" ? "light" : doneTheme);
      setP1Theme(p1);
      setTaskOrder(shuf([...CFG.tasks]));
      setPhase(2); // jump straight to phase 2
      setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setSessTasks([]);
      setScreen("instructions");
      return;
    }

    // Fresh start — assign counterbalanced group
    setStartingExp(true);
    try {
    // Fetch live group counts from Supabase to ensure global balance
    let dlCount = 0, ldCount = 0;
    if (supa) {
      try {
        const { data } = await supa.from("participants").select("data");
        if (data) {
          const allP = data.map(r => r.data).filter(Boolean).filter(x => x.role !== "admin" && x.orderGroup);
          dlCount = allP.filter(x => x.orderGroup === "DL").length;
          ldCount = allP.filter(x => x.orderGroup === "LD").length;
        }
      } catch {}
    } else {
      const allUsers = db.all().filter(x => x.role !== "admin" && x.orderGroup);
      dlCount = allUsers.filter(x => x.orderGroup === "DL").length;
      ldCount = allUsers.filter(x => x.orderGroup === "LD").length;
    }
    const group = ldCount < dlCount ? "LD" : (dlCount < ldCount ? "DL" : ((dlCount + ldCount) % 2 === 0 ? "DL" : "LD"));
    const first = group === "DL" ? "dark" : "light";
    const upd = { ...user, orderGroup: group };
    setUser(upd); db.save(upd);
    setP1Theme(first); setTaskOrder(shuf([...CFG.tasks]));
    setPhase(1); setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setSessTasks([]);
    setScreen("instructions");
    } catch(e) { console.error('startExp error', e); }
    finally { setStartingExp(false); }
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
      const latest = db.get(user.id) || user;
      const upd = { ...latest, experiments: [...(latest.experiments || []), sessRec] };
      setUser(upd); db.save(upd);
      setSessTasks([]); setPhase(2); setTaskIdx(0); setTrialIdx(0); setTrialRes([]);
      setPendingSess(null);
      setScreen("break");
    } else {
      // Phase 2 done — read latest from db to ensure Phase 1 session is included
      const latest = db.get(user.id) || user;
      const upd = { ...latest, experiments: [...(latest.experiments || []), sessRec], completed: true };
      setUser(upd); db.save(upd);
      setPendingSess(null);
      setScreen("preference");
    }
  };

  const handleBreak = () => {
    const td = genTaskData(taskOrder[0]);
    setTaskData(td); setTaskIdx(0); setTrialIdx(0); setTrialRes([]); setScreen("instructions");
  };

  const handlePref = pref => {
    // Read latest from db to avoid stale state overwriting experiments saved in handleNASA
    const latest = db.get(user.id) || user;
    const upd = { ...latest, pref, completed: true, completedAt: new Date().toISOString() };
    setUser(upd); db.save(upd); setScreen("debrief");
  };

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

  // Report renders full-page outside AppShell
  if (screen === "app" && uiTab === "report") return (
    <><style>{GCSS}</style>
      <ExperimentErrorBoundary u={u} onReset={() => setUiTab("dashboard")}>
        <ReportScreen user={user} u={u} onBack={() => setUiTab("dashboard")} />
      </ExperimentErrorBoundary>
    </>
  );

  if (screen === "app") return (
    <><style>{GCSS}</style>
      <AppShell user={user} u={u} uiDark={uiDark} onToggleTheme={toggleTheme} tab={uiTab} setTab={setUiTab} onLogout={logout}>
        {uiTab === "dashboard" && <Dashboard user={user} u={u} onStart={startExp} startingExp={startingExp} onProfile={() => setUiTab("profile")} onTutorial={() => setScreen("tutorial")} onReport={() => setUiTab("report")} />}
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
    const safeDone = res => { try { handleTrialDone(res); } catch(e) { console.error("Trial done error:", e); setScreen("task_brief"); } };
    return (
      <ExperimentErrorBoundary u={u} onReset={() => setScreen("task_brief")}>
        <><style>{GCSS}</style><TimeoutOverlay />
          <div
            onTouchStart={tracker.onTouchStart} onTouchEnd={tracker.onTouchEnd} onTouchMove={tracker.onTouchMove}
            onClickCapture={e => { try { const r = e.currentTarget.getBoundingClientRect(); tracker.captureClick(e.clientX, e.clientY, r); } catch(e){} }}
            style={{ minHeight:"100vh" }}>
            <ExpPage showProgress>
              <div style={{ maxWidth: L.taskW, margin: "0 auto" }}>
                {TC ? <TC key={`${curType}-${trialIdx}-p${phase}`} t={t} data={curData} idx={trialIdx} total={taskData?.seq ? taskData.n : (taskData.length || 1)} onDone={safeDone} tracker={tracker} />
                : <div style={{ textAlign:"center", color:t.muted, padding:40 }}>Loading task…</div>}
              </div>
            </ExpPage>
          </div>
        </>
      </ExperimentErrorBoundary>
    );
  }

  return <><style>{GCSS}</style><div style={{ minHeight: "100vh", background: u.bg, display: "flex", alignItems: "center", justifyContent: "center", color: u.text3, fontFamily: L.font }}>Loading…</div></>;
}

