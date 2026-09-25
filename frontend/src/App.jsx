import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu, X, ArrowRight, ChevronLeft, ChevronRight,
  Coins, CreditCard, PiggyBank, TrendingUp,
  Landmark, ShieldCheck, Percent, Wallet, Calculator, Zap, ScanEye, Plug,
  House, Car, GraduationCap, Briefcase, Sparkles, BadgeCheck, TriangleAlert,
  Sun, Moon, Cpu, Database, Workflow, Users, UserCheck, CalendarClock,
  Info, CircleCheck, GitBranch, Gauge, Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens — CSS custom properties, switched by [data-theme] on <html>.
// Referencing var(--x) instead of hex means every themed element updates
// instantly when the theme toggles, with no per-component re-render needed.
// ---------------------------------------------------------------------------
const T = {
  bg: "var(--bg)",
  bgSoft: "var(--bg-soft)",
  surface: "var(--surface)",
  surfaceElevated: "var(--surface-elevated)",
  surfaceSoft: "var(--surface-soft)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  border: "var(--border)",
  navy: "var(--navy)",
  navySoft: "var(--navy-soft)",
  primary: "var(--primary)",
  primaryStrong: "var(--primary-strong)",
  primarySoft: "var(--primary-soft)",
  primaryGlow: "var(--primary-glow)",
  accentGreen: "var(--accent-green)",
  success: "var(--success)",
  successSoft: "var(--success-soft)",
  warning: "var(--warning)",
  warningSoft: "var(--warning-soft)",
  danger: "var(--danger)",
  dangerSoft: "var(--danger-soft)",
  headerBg: "var(--header-bg)",
  shadow: "var(--shadow-color)",
};

const displayFont = "'Sora', 'Segoe UI', sans-serif";
const bodyFont = "'Inter', 'Segoe UI', sans-serif";
const monoFont = "'IBM Plex Mono', 'Courier New', monospace";

const FONT_LINK_ID = "loaniq-fonts-v5";
function useGoogleFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ---------------------------------------------------------------------------
// Theme (light / dark) — persisted, applied via data-theme attribute so CSS
// vars cascade without touching component state.
// ---------------------------------------------------------------------------
const THEME_KEY = "loaniq-theme";
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  return [theme, toggle];
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// Scroll-spy for the header's active-section indicator.
// ---------------------------------------------------------------------------
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

// ---------------------------------------------------------------------------
// Scroll-reveal helper — small IntersectionObserver-driven fade/slide-up.
// ---------------------------------------------------------------------------
function useRevealed() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, shown] = useRevealed();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live prediction-engine status — a REAL check against the backend's
// existing /health route (derived from the same API_URL, never a separate
// hardcoded endpoint). Purely a UI status indicator: it reflects the actual
// reachability of the Flask server, not synthetic uptime data.
// ---------------------------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/predict";
const HEALTH_URL = API_URL.replace(/\/predict\/?$/, "/health");

function useEngineStatus() {
  const [status, setStatus] = useState("checking"); // checking | online | offline
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch(HEALTH_URL, { method: "GET" });
        if (!cancelled) setStatus(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }
    check();
    const t = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);
  return status;
}

// ---------------------------------------------------------------------------
// Count-up number
// ---------------------------------------------------------------------------
function CountUp({ target, duration = 1200, format = (n) => n.toLocaleString() }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{format(val)}</>;
}

// ---------------------------------------------------------------------------
// Ring dial — conic-gradient risk gauge with tick marks and soft glow.
// Same props/contract as before; visuals upgraded only.
// ---------------------------------------------------------------------------
function RingDial({ pct, label, sublabel, size = 220, thickness = 18, countUp = false, color = T.primary, glow = "var(--primary-glow)" }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);
  const deg = (animPct / 100) * 360;
  const ticks = Array.from({ length: 24 });

  return (
    <div className="dial-hover relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {ticks.map((_, i) => {
          const a = (i / ticks.length) * 360 - 90;
          const rad = (a * Math.PI) / 180;
          const inner = 46, outer = 49;
          const active = a + 90 <= deg;
          return (
            <line
              key={i}
              x1={50 + inner * Math.cos(rad)} y1={50 + inner * Math.sin(rad)}
              x2={50 + outer * Math.cos(rad)} y2={50 + outer * Math.sin(rad)}
              stroke={active ? color : "var(--border)"}
              strokeWidth="1.1"
              strokeLinecap="round"
              style={{ transition: "stroke 0.9s ease" }}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute", inset: 6, borderRadius: "50%",
          background: `conic-gradient(${color} ${deg}deg, var(--surface-soft) ${deg}deg 360deg)`,
          transition: "background 1s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
          boxShadow: `0 20px 45px -16px ${glow}`,
        }}
      >
        <div
          style={{
            position: "absolute", inset: thickness, borderRadius: "50%", backgroundColor: T.surface,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 0 0 1px var(--border)",
          }}
        >
          <p className="text-3xl font-bold" style={{ color, fontFamily: monoFont, transition: "color 0.6s ease" }}>
            {countUp ? <CountUp target={Math.round(clamped)} duration={1400} format={(n) => `${n}%`} /> : label}
          </p>
          {sublabel && <p className="text-xs mt-1 text-center px-6" style={{ color: T.textMuted }}>{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating decorative icon
// ---------------------------------------------------------------------------
function FloatIcon({ Icon, top, left, size = 24, delay = 0, duration = 6, opacity = 0.6 }) {
  return (
    <div aria-hidden style={{ position: "absolute", top, left, opacity, animation: `floaty ${duration}s ease-in-out ${delay}s infinite` }}>
      <div className="icon-hover rounded-2xl p-2.5" style={{ backgroundColor: T.surface, boxShadow: `0 10px 25px -10px ${T.shadow}` }}>
        <Icon size={size} color={T.primary} strokeWidth={2} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lightweight pseudo-3D AI Risk Engine visual — pure SVG + CSS, no WebGL.
// Depicts the pipeline (Applicant Data → Features → ML Model → Risk Score →
// Decision) as nodes orbiting a central hub. Any percentage shown here is
// explicitly labeled DEMO and is never presented as a live prediction.
// ---------------------------------------------------------------------------
function RiskEngineGraphic({ demoPct = 27 }) {
  const reduced = usePrefersReducedMotion();
  const nodes = [
    { label: "Applicant Data", Icon: Users, angle: -90 },
    { label: "Features", Icon: Database, angle: -18 },
    { label: "ML Model", Icon: Cpu, angle: 54 },
    { label: "Risk Score", Icon: Gauge, angle: 126 },
    { label: "Decision", Icon: ShieldCheck, angle: 198 },
  ];
  const R = 130;
  return (
    <div
      aria-hidden
      className="relative mx-auto"
      style={{ width: 300, height: 300, animation: reduced ? "none" : "spinSlow 34s linear infinite" }}
    >
      <svg width="300" height="300" viewBox="0 0 300 300" className="absolute inset-0">
        <circle cx="150" cy="150" r={R} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="150" cy="150" r="58" fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.5" />
        {nodes.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = 150 + R * Math.cos(rad);
          const y = 150 + R * Math.sin(rad);
          return (
            <line key={i} x1="150" y1="150" x2={x} y2={y} stroke="var(--primary)" strokeOpacity="0.25" strokeWidth="1" />
          );
        })}
      </svg>

      {nodes.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = 150 + R * Math.cos(rad);
        const y = 150 + R * Math.sin(rad);
        return (
          <div
            key={n.label}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: x, top: y, transform: "translate(-50%,-50%)",
              animation: reduced ? "none" : `nodeFloat ${5 + i * 0.6}s ease-in-out ${i * 0.3}s infinite, spinSlowReverse 34s linear infinite`,
            }}
          >
            <div
              className="rounded-xl flex items-center justify-center"
              style={{ width: 40, height: 40, backgroundColor: T.surface, boxShadow: `0 10px 22px -10px ${T.shadow}`, border: `1px solid var(--border)` }}
            >
              <n.Icon size={17} color={T.primary} strokeWidth={2} />
            </div>
            <span
              className="text-[9px] font-bold text-center px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: T.surface, color: T.textMuted, animation: reduced ? "none" : "spinSlowReverse 34s linear infinite" }}
            >
              {n.label}
            </span>
          </div>
        );
      })}

      <div
        className="absolute rounded-full flex flex-col items-center justify-center"
        style={{
          width: 116, height: 116, left: "50%", top: "50%", transform: "translate(-50%,-50%)",
          background: "var(--surface)", boxShadow: `0 0 0 1px var(--border), 0 25px 50px -18px var(--primary-glow)`,
          animation: reduced ? "none" : "spinSlowReverse 34s linear infinite",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: T.primary, animation: reduced ? "none" : "pulseGlow 2.4s ease-in-out infinite" }} />
        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textMuted, letterSpacing: "0.1em" }}>AI Risk Engine</p>
        <p className="text-xl font-extrabold mt-0.5" style={{ color: T.primary, fontFamily: monoFont }}>{demoPct}%</p>
        <span className="mt-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ backgroundColor: T.primarySoft, color: T.primary }}>DEMO</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-advancing carousel with tilt-hover slides
// ---------------------------------------------------------------------------
function Carousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4200);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden rounded-3xl">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map(([Icon, title, desc]) => (
            <div key={title} className="w-full flex-shrink-0 px-2">
              <div
                className="tilt-card rounded-3xl p-10 sm:p-12 flex flex-col sm:flex-row items-center gap-8"
                style={{ backgroundColor: T.surface, boxShadow: `0 20px 50px -20px ${T.shadow}`, border: `1px solid var(--border)` }}
              >
                <div className="icon-hover w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.surfaceSoft }}>
                  <Icon size={34} color={T.primary} strokeWidth={1.8} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold mb-2" style={{ color: T.text, fontFamily: displayFont }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        aria-label="Previous"
        className="carousel-nav hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center"
        style={{ backgroundColor: T.surface, boxShadow: `0 10px 25px -10px ${T.shadow}`, border: `1px solid var(--border)` }}
      >
        <ChevronLeft size={18} color={T.text} />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        aria-label="Next"
        className="carousel-nav hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center"
        style={{ backgroundColor: T.surface, boxShadow: `0 10px 25px -10px ${T.shadow}`, border: `1px solid var(--border)` }}
      >
        <ChevronRight size={18} color={T.text} />
      </button>

      <div className="flex justify-center gap-2 mt-6">
        {slides.map(([, title], i) => (
          <button
            key={title}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300 hover:scale-125"
            style={{ width: i === index ? 24 : 8, height: 8, backgroundColor: i === index ? T.primary : "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated weight bar, with hover row highlight
// ---------------------------------------------------------------------------
function WeightBar({ label, pct, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 150 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="bar-row rounded-lg px-2 -mx-2 py-1 transition-colors duration-300">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: T.text, fontWeight: 600 }}>{label}</span>
        <span style={{ color: T.textMuted, fontFamily: monoFont }}>{pct}</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: T.surfaceSoft }}>
        <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: T.primary, transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Real prediction — calls the Flask backend serving logistic_regression_model.pkl
// UNCHANGED: payload shape, endpoint, and response contract are exactly as
// the existing backend expects/returns.
// ---------------------------------------------------------------------------
async function predict(f) {
  const payload = {
    age: f.age,
    income: f.income,
    loanAmount: f.loanAmount,
    creditScore: f.creditScore,
    monthsEmployed: f.monthsEmployed,
    creditLines: f.creditLines,
    interestRate: f.interestRate,
    loanTerm: Number(f.loanTerm),
    dtiRatio: f.dtiRatio,
    education: f.education,
    employmentType: f.employmentType,
    maritalStatus: f.maritalStatus,
    loanPurpose: f.loanPurpose,
    hasMortgage: f.hasMortgage,
    hasDependents: f.hasDependents,
    hasCoSigner: f.hasCoSigner,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server responded with ${res.status}`);
  }

  return res.json(); // { probability, percent, predictedClass, isHighRisk }
}

// ---------------------------------------------------------------------------
// Result interpretation helpers — derived from the real submitted form and
// the real backend response, never from invented numbers. Logic unchanged.
// ---------------------------------------------------------------------------
function riskCategory(pct) {
  if (pct >= 65) return { label: "High Risk", tone: "high" };
  if (pct >= 35) return { label: "Medium Risk", tone: "medium" };
  return { label: "Low Risk", tone: "low" };
}

const TONE_COLORS = {
  high: { fill: T.danger, soft: T.dangerSoft, text: T.danger, glow: "rgba(220,38,38,0.45)" },
  medium: { fill: T.warning, soft: T.warningSoft, text: T.warning, glow: "rgba(201,154,59,0.4)" },
  low: { fill: T.primary, soft: T.primarySoft, text: T.primaryStrong, glow: "var(--primary-glow)" },
};

function computeKeyFactors(f) {
  if (!f) return [];
  const flags = [];
  const loanToIncome = f.income > 0 ? f.loanAmount / f.income : 0;

  if (f.dtiRatio >= 0.45) flags.push(`High debt-to-income ratio (${f.dtiRatio.toFixed(2)})`);
  else if (f.dtiRatio >= 0.35) flags.push(`Elevated debt-to-income ratio (${f.dtiRatio.toFixed(2)})`);

  if (f.creditScore < 600) flags.push(`Low credit score (${f.creditScore})`);
  else if (f.creditScore < 670) flags.push(`Below-average credit score (${f.creditScore})`);

  if (f.interestRate >= 15) flags.push(`High interest rate (${f.interestRate}%)`);
  if (loanToIncome >= 2.5) flags.push(`High loan-to-income ratio (${loanToIncome.toFixed(1)}×)`);
  if (f.employmentType === "Unemployed") flags.push("Currently unemployed");
  else if (f.employmentType === "Part-time") flags.push("Part-time employment");
  if (f.monthsEmployed < 12) flags.push(`Short employment history (${f.monthsEmployed} mo.)`);
  if (!f.hasCoSigner && loanToIncome >= 2) flags.push("No co-signer on file");

  if (flags.length === 0) {
    if (f.creditScore >= 720) flags.push(`Strong credit score (${f.creditScore})`);
    if (f.dtiRatio < 0.3) flags.push(`Low debt-to-income ratio (${f.dtiRatio.toFixed(2)})`);
    if (f.hasCoSigner) flags.push("Backed by a co-signer");
    if (flags.length === 0) flags.push("No major risk flags in this application");
  }

  return flags.slice(0, 4);
}

function recommendationText(result) {
  if (!result) return "";
  return result.isHigh
    ? "Flag for manual underwriting review before any approval decision."
    : "Eligible to proceed through the standard automated approval workflow.";
}

// ---------------------------------------------------------------------------
// Field primitives — premium rounded inputs with icons, units, focus glow.
// ---------------------------------------------------------------------------
function FieldShell({ label, icon: Icon, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold field-hover" style={{ color: T.text, fontFamily: bodyFont }}>
      <span className="flex items-center gap-1.5" style={{ color: T.textMuted }}>
        {Icon && <Icon size={12} strokeWidth={2.2} />}
        <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ letterSpacing: "0.05em" }}>{label}</span>
      </span>
      {children}
    </label>
  );
}

const inputBaseStyle = {
  border: "1px solid var(--border)",
  fontFamily: monoFont,
  color: T.text,
  backgroundColor: T.surface,
};

function NumberField({ label, value, onChange, icon, unit, ...props }) {
  return (
    <FieldShell label={label} icon={icon}>
      <div className="relative">
        {unit && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none" style={{ color: T.textMuted }}>
            {unit}
          </span>
        )}
        <input
          type="number" value={value} onChange={(e) => onChange(+e.target.value)}
          className="input-premium rounded-lg py-2.5 text-sm outline-none w-full"
          style={{ ...inputBaseStyle, paddingLeft: unit ? "1.75rem" : "0.875rem", paddingRight: "0.875rem" }}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

function SelectField({ label, value, onChange, options, icon }) {
  return (
    <FieldShell label={label} icon={icon}>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="input-premium rounded-lg px-3.5 py-2.5 text-sm outline-none"
        style={{ ...inputBaseStyle, fontFamily: bodyFont }}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </FieldShell>
  );
}

function CheckField({ label, checked, onChange, icon: Icon }) {
  return (
    <label
      className="check-pill flex items-center gap-2.5 text-xs font-semibold cursor-pointer rounded-xl px-3.5 py-2.5"
      style={{
        color: checked ? T.primaryStrong : T.text, fontFamily: bodyFont,
        backgroundColor: checked ? T.primarySoft : T.surface,
        border: `1px solid ${checked ? "var(--primary)" : "var(--border)"}`,
      }}
    >
      <span
        className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: checked ? T.primary : "transparent", border: `1.5px solid ${checked ? "var(--primary)" : "var(--border)"}` }}
      >
        {checked && <Check size={11} color="#fff" strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      {Icon && <Icon size={13} strokeWidth={2} />}
      {label}
    </label>
  );
}

function FieldGroupLabel({ children, icon: Icon }) {
  return (
    <p
      className="sm:col-span-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest pt-3 pb-1 -mb-1 border-t first:border-t-0 first:pt-0"
      style={{ color: T.primary, letterSpacing: "0.12em", borderColor: "var(--border)" }}
    >
      {Icon && <Icon size={13} strokeWidth={2.4} />}
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="theme-toggle icon-hover w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: T.surfaceSoft, border: "1px solid var(--border)" }}
    >
      {theme === "dark" ? <Sun size={15} color={T.primary} /> : <Moon size={15} color={T.primary} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Engine status pill — reflects a real /health check (see useEngineStatus)
// ---------------------------------------------------------------------------
function EngineStatusPill({ status }) {
  const copy = {
    checking: "Checking Engine…",
    online: "AI Engine Online",
    offline: "Engine Unreachable",
  }[status];
  const dotColor = status === "online" ? T.primary : status === "offline" ? T.danger : T.textMuted;
  return (
    <span
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{ backgroundColor: T.surfaceSoft, color: T.text, letterSpacing: "0.1em", border: "1px solid var(--border)" }}
      title="Live status of the Flask /health endpoint"
    >
      <span className="relative flex w-2 h-2">
        {status === "online" && (
          <span className="absolute inline-flex w-full h-full rounded-full" style={{ backgroundColor: dotColor, animation: "dotPing 1.8s cubic-bezier(0,0,0.2,1) infinite" }} />
        )}
        <span className="relative inline-flex rounded-full w-2 h-2" style={{ backgroundColor: dotColor }} />
      </span>
      {copy}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
export default function App() {
  useGoogleFonts();
  const [theme, toggleTheme] = useTheme();
  const engineStatus = useEngineStatus();
  const [menuOpen, setMenuOpen] = useState(false);

  const navIds = useMemo(() => ["top", "how-it-works", "why", "try-it", "insights"], []);
  const activeSection = useScrollSpy(navIds);

  const [form, setForm] = useState({
    age: 35, income: 65000, loanAmount: 120000, creditScore: 612, monthsEmployed: 48,
    creditLines: 3, interestRate: 12.5, loanTerm: "36", dtiRatio: 0.38,
    education: "Bachelor's", employmentType: "Full-time", maritalStatus: "Married",
    loanPurpose: "Home", hasMortgage: false, hasDependents: false, hasCoSigner: true,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastForm, setLastForm] = useState(null);
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const panelRef = useRef(null);

  // status drives which state the Risk Analyzer panel renders:
  // idle (no request yet) → loading (in flight) → success | error
  const status = loading ? "loading" : error ? "error" : result ? "success" : "idle";

  async function runPredict(currentForm) {
    setLoading(true);
    setError(null);
    try {
      const data = await predict(currentForm); // real Flask /predict call — never mocked
      setResult({ pct: data.percent, isHigh: data.isHighRisk, stamp: Date.now() });
      setLastForm({ ...currentForm });
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Unable to analyze application. Please make sure the LoanIQ backend is running and try again."
          : err.message
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runPredict(form);
  }

  function handleRetry() {
    runPredict(form);
  }

  function handleAnalyzeAgain() {
    setResult(null);
    setError(null);
  }

  const keyFactors = computeKeyFactors(lastForm);
  const category = result ? riskCategory(result.pct) : null;
  const recommendation = recommendationText(result);

  const heroPct = 27;

  const carouselSlides = [
    [Zap, "Instant scoring", "Every application returns a probability and a class label in milliseconds, no manual review queue."],
    [ScanEye, "Explainable coefficients", "Logistic regression weights show exactly which factors pushed a decision toward risk."],
    [ShieldCheck, "Clean, audited data", "Trained on 255,347 de-duplicated records with zero missing values across all 18 columns."],
    [Plug, "Drop-in API", "The saved .pkl model plugs straight into this form's submit handler for production use."],
  ];

  // Illustrative UI weighting for the demo bar chart below — NOT the model's
  // actual fitted coefficients. Clearly labeled as such in the section itself.
  const featureWeights = [
    ["Debt-to-income ratio", 90],
    ["Interest rate", 70],
    ["Credit score", 62],
    ["Loan-to-income ratio", 55],
    ["Employment type", 40],
  ];

  const loanPurposeIcons = [
    [House, "Home"], [Car, "Auto"], [Briefcase, "Business"], [GraduationCap, "Education"], [Sparkles, "Other"],
  ];

  const howItWorksSteps = [
    { n: "01", title: "Enter Applicant Data", desc: "Fill in income, credit history, loan details and employment profile.", Icon: Users },
    { n: "02", title: "Process Financial Features", desc: "Inputs are mapped to the columns the model was trained on, in the same order.", Icon: Database },
    { n: "03", title: "Run Logistic Regression", desc: "The scaled feature row is passed through the saved logistic_regression_model.pkl.", Icon: Cpu },
    { n: "04", title: "Generate Risk Probability", desc: "The model returns a default probability, class label, and risk category — live.", Icon: Gauge },
  ];

  const primaryNav = ["try-it", "how-it-works", "insights"];
  const navLabel = (id) => (id === "try-it" ? "Risk Checker" : id === "how-it-works" ? "How It Works" : "Model Insights");

  return (
    <div style={{ backgroundColor: T.bg, color: T.textMuted, fontFamily: bodyFont }} className="min-h-screen antialiased">
      <style>{`
        @keyframes floaty { 0%,100% { transform: translateY(0) rotate(0deg);} 50% { transform: translateY(-14px) rotate(4deg);} }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes pulseGlow { 0%,100% { opacity: 0.55; transform: scale(1);} 50% { opacity: 0.9; transform: scale(1.06);} }
        @keyframes dotPing { 0% { transform: scale(1); opacity: 0.7;} 70%,100% { transform: scale(2.4); opacity: 0;} }
        @keyframes stampIn { 0% { transform: scale(0.4) rotate(-18deg); opacity: 0;} 60% { transform: scale(1.12) rotate(4deg); opacity: 1;} 100% { transform: scale(1) rotate(0deg); opacity: 1;} }
        @keyframes spinSlow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes spinSlowReverse { from { transform: translate(-50%,-50%) rotate(0deg);} to { transform: translate(-50%,-50%) rotate(-360deg);} }
        @keyframes nodeFloat { 0%,100% { margin-top: 0px;} 50% { margin-top: -6px;} }
        .fade-in { animation: fadeUp 0.8s ease both; }
        ::selection { background: ${T.accentGreen}; }

        /* --- advanced hover / motion system --- */
        .nav-link { position: relative; }
        .nav-link::after { content:''; position:absolute; left:0; bottom:-3px; width:0; height:2px; background: ${T.primary}; transition: width 0.3s ease; }
        .nav-link:hover::after, .nav-link.active::after { width:100%; }
        .nav-link.active { color: ${T.primary} !important; }

        .btn-shine { position: relative; overflow: hidden; transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease; }
        .btn-shine::after { content:''; position:absolute; top:0; left:-75%; width:40%; height:100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent); transform: skewX(-20deg); transition: left 0.7s ease; }
        .btn-shine:hover { transform: translateY(-3px); box-shadow: 0 16px 34px -12px ${T.shadow}; }
        .btn-shine:hover::after { left: 125%; }
        .btn-shine:active { transform: translateY(-1px) scale(0.985); }

        .icon-hover { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease; }
        .icon-hover:hover { transform: translateY(-4px) rotate(-6deg) scale(1.08); }

        .tilt-card { transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease; }
        .tilt-card:hover { transform: translateY(-8px) scale(1.015); box-shadow: 0 30px 60px -18px ${T.shadow} !important; }

        .carousel-nav { transition: transform 0.3s ease, background-color 0.3s ease; }
        .carousel-nav:hover { transform: translateY(-50%) scale(1.15); background-color: ${T.primary} !important; }
        .carousel-nav:hover svg { stroke: white; }

        .dial-hover { transition: transform 0.4s ease; }
        .dial-hover:hover { transform: scale(1.03); }

        .bar-row:hover { background-color: ${T.surfaceSoft}; }

        .field-hover { transition: transform 0.25s ease; }
        .field-hover:focus-within { transform: translateY(-2px); }

        .input-premium { transition: box-shadow 0.25s ease, border-color 0.25s ease; }
        .input-premium:focus { box-shadow: 0 0 0 3px ${T.primaryGlow}; border-color: ${T.primary} !important; }

        .check-pill { transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease; }
        .check-pill:hover { transform: translateY(-2px); }

        .purpose-chip { transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), background-color 0.3s ease, box-shadow 0.3s ease; }
        .purpose-chip:hover { transform: translateY(-5px); background-color: ${T.primary} !important; box-shadow: 0 14px 28px -12px ${T.shadow}; }
        .purpose-chip:hover svg, .purpose-chip:hover span { color: white !important; }

        .stat-hover { transition: transform 0.3s ease; }
        .stat-hover:hover { transform: translateY(-3px); }

        .step-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .step-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -18px ${T.shadow}; }

        .stamp-anim { animation: stampIn 0.6s cubic-bezier(0.22,1.4,0.36,1) both; }

        .theme-toggle:active { transform: scale(0.92); }

        /* hide scrollbar on the result panel's overflow safety-net, keep it scrollable */
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .loan-spinner {
          width: 42px; height: 42px; border-radius: 50%;
          border: 3px solid ${T.primaryGlow};
          border-top-color: ${T.primary};
          animation: spin 0.85s linear infinite;
        }

        @media (max-width: 1023px) {
          .sticky-panel { position: static !important; max-height: none !important; }
        }
      `}</style>

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: T.headerBg, borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold text-lg" style={{ color: T.text, fontFamily: displayFont }}>
            <span className="icon-hover w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: T.primary, color: "#fff" }}>
              LQ
            </span>
            LoanIQ
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {primaryNav.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className={`nav-link transition-colors duration-300 ${activeSection === id ? "active" : ""}`}
                style={{ color: activeSection === id ? T.primary : T.text }}
              >
                {navLabel(id)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a
              href="#try-it"
              className="btn-shine hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{ backgroundColor: T.primary, color: "#fff" }}
            >
              Analyze Risk <ArrowRight size={14} />
            </a>
            <button className="icon-hover md:hidden w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: T.surfaceSoft }} onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
              {menuOpen ? <X size={16} color={T.text} /> : <Menu size={16} color={T.text} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm font-semibold">
            {primaryNav.map((id) => (
              <a key={id} href={`#${id}`} style={{ color: T.text }} onClick={() => setMenuOpen(false)}>
                {navLabel(id)}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ============ HERO ============ */}
      <section id="top" className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center overflow-hidden">
        <FloatIcon Icon={Coins} top="6%" left="6%" delay={0} duration={7} />
        <FloatIcon Icon={CreditCard} top="72%" left="2%" delay={1.2} duration={8} size={22} />
        <FloatIcon Icon={PiggyBank} top="14%" left="90%" delay={0.6} duration={6.5} size={22} />
        <FloatIcon Icon={Landmark} top="80%" left="88%" delay={2} duration={7.5} size={24} />

        <div className="fade-in relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest" style={{ backgroundColor: T.surfaceSoft, color: T.text, letterSpacing: "0.1em", border: "1px solid var(--border)" }}>
              <Sparkles size={12} color={T.primary} />
              AI-powered loan risk intelligence
            </span>
            <EngineStatusPill status={engineStatus} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.05]" style={{ color: T.text, fontFamily: displayFont }}>
            Predict Loan{" "}
            <span className="relative inline-block">
              Default Risk
              <svg className="absolute -bottom-1 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0,7 Q50,0 100,6 T200,5" stroke={T.primary} strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            Before It Becomes a Problem.
          </h1>

          <p className="mt-6 text-base leading-relaxed max-w-lg" style={{ color: T.textMuted }}>
            LoanIQ scores every application in real time using a logistic regression model trained on historical loans —
            turning income, credit history and 15 other signals into one explainable risk score.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#try-it" className="btn-shine px-6 py-3.5 rounded-full font-bold text-sm inline-flex items-center gap-2" style={{ backgroundColor: T.navy, color: "#fff" }}>
              Analyze Loan Risk <ArrowRight size={15} />
            </a>
            <a href="#insights" className="nav-link text-sm font-bold" style={{ color: T.primary }}>
              Explore Model
            </a>
          </div>

          <div className="mt-11 grid grid-cols-3 gap-3 max-w-md">
            {[[255347, "Historical Records", (n) => `${Math.round(n / 1000)}K+`], [17, "Predictive Features", (n) => n], [70, "Train / Test", () => "70/30"]].map(([target, label, fmt]) => (
              <div key={label} className="stat-hover rounded-2xl px-3 py-3.5 text-center" style={{ backgroundColor: T.surface, border: "1px solid var(--border)", boxShadow: `0 8px 22px -14px ${T.shadow}` }}>
                <p className="text-xl font-extrabold" style={{ color: T.text, fontFamily: monoFont }}>
                  <CountUp target={target} format={fmt} />
                </p>
                <p className="text-[10px] mt-1 leading-tight" style={{ color: T.textMuted }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Loan-purpose visual legend */}
          <div className="mt-7 flex flex-wrap gap-3">
            {loanPurposeIcons.map(([Icon, label]) => (
              <div key={label} className="purpose-chip flex items-center gap-1.5 px-3.5 py-2 rounded-full" style={{ backgroundColor: T.surface, boxShadow: `0 8px 20px -10px ${T.shadow}`, border: "1px solid var(--border)" }}>
                <Icon size={14} color={T.primary} strokeWidth={2} />
                <span className="text-xs font-semibold" style={{ color: T.text }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-in relative flex flex-col items-center gap-6 z-10">
          <RiskEngineGraphic demoPct={heroPct} />

          <div className="relative w-full flex justify-center">
            <div aria-hidden className="absolute w-[300px] h-[300px] rounded-full" style={{ background: `radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)`, animation: "pulseGlow 4.5s ease-in-out infinite" }} />
            <div className="tilt-card relative rounded-3xl p-8 w-full max-w-sm" style={{ backgroundColor: T.surface, boxShadow: `0 25px 60px -20px ${T.shadow}`, border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary, letterSpacing: "0.1em" }}>Sample applicant</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: T.surfaceSoft, color: T.text }}>DEMO</span>
              </div>
              <div className="flex justify-center">
                <RingDial pct={heroPct} label={`${heroPct}%`} sublabel="predicted default probability" />
              </div>
              <div className="mt-6 pt-5 border-t space-y-2.5 text-xs" style={{ borderColor: "var(--border)" }}>
                {[["Credit score", "612"], ["DTI ratio", "0.38"], ["Employment", "Full-time"]].map(([k, v]) => (
                  <div className="flex justify-between" key={k}>
                    <span style={{ color: T.textMuted }}>{k}</span>
                    <span className="font-semibold" style={{ color: T.text, fontFamily: monoFont }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="border-y" style={{ backgroundColor: T.surface, borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Reveal>
            <div className="text-center mb-14 max-w-xl mx-auto">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: T.primary, letterSpacing: "0.1em" }}>Under the hood</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: T.text, fontFamily: displayFont }}>How LoanIQ works.</h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorksSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 110}>
                <div className="step-card relative rounded-2xl p-6 h-full" style={{ backgroundColor: T.bg, border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold" style={{ fontFamily: monoFont, WebkitTextStroke: `1px ${T.primary}`, color: "transparent" }}>{s.n}</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.primarySoft }}>
                      <s.Icon size={17} color={T.primary} strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold mb-1.5" style={{ color: T.text, fontFamily: displayFont }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{s.desc}</p>
                  {i < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10" style={{ color: T.primary }}>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY LOANIQ — carousel ============ */}
      <section id="why" className="py-20 border-b" style={{ backgroundColor: T.bg, borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: T.primary, letterSpacing: "0.1em" }}>Why teams use it</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: T.text, fontFamily: displayFont }}>Built for underwriting desks.</h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Carousel slides={carouselSlides} />
          </Reveal>
        </div>
      </section>

      {/* ============ RISK CHECKER ============ */}
      <section id="try-it" className="max-w-6xl mx-auto px-6 py-20">
        <Reveal>
          <div className="max-w-xl mb-10 flex items-start gap-3">
            <div className="icon-hover w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: T.surfaceSoft }}>
              <Calculator size={20} color={T.primary} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: T.primary, letterSpacing: "0.1em" }}>Risk checker</p>
              <h2 className="text-3xl font-extrabold" style={{ color: T.text, fontFamily: displayFont }}>Score an applicant.</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: T.textMuted }}>
                This form sends your inputs to a Flask API serving the real trained{" "}
                <code style={{ fontFamily: monoFont, fontSize: "0.85em" }}>logistic_regression_model.pkl</code> and returns its actual prediction.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-8">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 rounded-3xl p-7 grid sm:grid-cols-2 gap-5 h-fit"
            style={{ backgroundColor: T.surface, boxShadow: `0 10px 30px -14px ${T.shadow}`, border: "1px solid var(--border)" }}
          >
            <FieldGroupLabel icon={Users}>Applicant Profile</FieldGroupLabel>
            <NumberField label="Age" value={form.age} onChange={set("age")} min={18} max={90} icon={Users} />
            <NumberField label="Months employed" value={form.monthsEmployed} onChange={set("monthsEmployed")} min={0} icon={CalendarClock} />
            <SelectField label="Education" value={form.education} onChange={set("education")} options={["High School", "Bachelor's", "Master's", "PhD"]} icon={GraduationCap} />
            <SelectField label="Employment type" value={form.employmentType} onChange={set("employmentType")} options={["Full-time", "Part-time", "Self-employed", "Unemployed"]} icon={Briefcase} />
            <SelectField label="Marital status" value={form.maritalStatus} onChange={set("maritalStatus")} options={["Single", "Married", "Divorced"]} icon={Users} />
            <div className="flex items-end">
              <CheckField label="Has dependents" checked={form.hasDependents} onChange={set("hasDependents")} icon={Users} />
            </div>

            <FieldGroupLabel icon={Wallet}>Financial Profile</FieldGroupLabel>
            <NumberField label="Annual income" value={form.income} onChange={set("income")} step={1000} unit="$" icon={Coins} />
            <NumberField label="Credit score" value={form.creditScore} onChange={set("creditScore")} min={300} max={850} icon={ShieldCheck} />
            <NumberField label="Open credit lines" value={form.creditLines} onChange={set("creditLines")} min={0} icon={CreditCard} />
            <label className="flex flex-col gap-1.5 text-xs font-semibold field-hover" style={{ color: T.text }}>
              <span className="flex items-center gap-1.5" style={{ color: T.textMuted }}>
                <Percent size={12} strokeWidth={2.2} />
                <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ letterSpacing: "0.05em" }}>Debt-to-income ratio</span>
              </span>
              <span style={{ color: T.primary, fontFamily: monoFont, fontSize: "0.85rem" }}>{form.dtiRatio.toFixed(2)}</span>
              <input type="range" min="0.1" max="0.9" step="0.01" value={form.dtiRatio} onChange={(e) => set("dtiRatio")(+e.target.value)} className="mt-1" style={{ accentColor: T.primary }} />
            </label>

            <FieldGroupLabel icon={Landmark}>Loan Details</FieldGroupLabel>
            <NumberField label="Loan amount" value={form.loanAmount} onChange={set("loanAmount")} step={1000} unit="$" icon={Coins} />
            <NumberField label="Interest rate" value={form.interestRate} onChange={set("interestRate")} step={0.1} unit="%" icon={TrendingUp} />
            <SelectField label="Loan term (months)" value={form.loanTerm} onChange={set("loanTerm")} options={["12", "24", "36", "48", "60"]} icon={CalendarClock} />
            <SelectField label="Loan purpose" value={form.loanPurpose} onChange={set("loanPurpose")} options={["Auto", "Business", "Home", "Education", "Other"]} icon={Briefcase} />

            <FieldGroupLabel icon={UserCheck}>Supporting Factors</FieldGroupLabel>
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <CheckField label="Has mortgage" checked={form.hasMortgage} onChange={set("hasMortgage")} icon={House} />
              <CheckField label="Has co-signer" checked={form.hasCoSigner} onChange={set("hasCoSigner")} icon={UserCheck} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-shine sm:col-span-2 mt-1 px-6 py-3.5 rounded-full font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              style={{ backgroundColor: T.navy, color: "#fff" }}
            >
              {loading ? "Analyzing…" : <>Predict Loan Risk <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="lg:col-span-2">
            {/* Sticky on desktop only (see .sticky-panel media query); stacks
                naturally below the form on mobile/tablet. */}
            <div
              ref={panelRef}
              className="sticky-panel tilt-card no-scrollbar sticky top-24 rounded-3xl p-7 flex flex-col"
              style={{
                backgroundColor: T.surface,
                boxShadow: `0 10px 30px -14px ${T.shadow}`,
                border: "1px solid var(--border)",
                maxHeight: "calc(100vh - 7rem)",
                overflowY: "auto",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-bold" style={{ color: T.text, fontFamily: displayFont }}>AI Risk Analysis</p>
                {status === "success" && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: T.primarySoft, color: T.primaryStrong }}>
                    LIVE
                  </span>
                )}
              </div>

              {/* ---- Idle: before the user has predicted anything ---- */}
              {status === "idle" && (
                <div className="fade-in flex flex-col items-center text-center py-8">
                  <div className="icon-hover w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: T.surfaceSoft }}>
                    <ScanEye size={28} color={T.primary} strokeWidth={1.8} />
                  </div>
                  <p className="font-bold text-sm mb-1.5" style={{ color: T.text }}>Ready to Analyze</p>
                  <p className="text-xs leading-relaxed max-w-[230px]" style={{ color: T.textMuted }}>
                    Enter applicant information and click <strong>Predict Loan Risk</strong> to run the ML model.
                  </p>
                </div>
              )}

              {/* ---- Loading: request in flight, no stale/fake number shown ---- */}
              {status === "loading" && (
                <div className="fade-in flex flex-col items-center text-center py-8">
                  <div className="loan-spinner mb-5" />
                  <p className="font-bold text-sm mb-4" style={{ color: T.text }}>Analyzing Application</p>
                  <ul className="text-left space-y-2 w-full max-w-[220px]">
                    {["Applicant data processed", "Financial profile analyzed", "Running ML prediction", "Generating risk assessment"].map((step, i) => (
                      <li key={step} className="flex items-center gap-2 text-xs" style={{ color: i < 2 ? T.text : T.textMuted }}>
                        {i < 2 ? <CircleCheck size={14} color={T.primary} /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed flex-shrink-0" style={{ borderColor: "var(--border)" }} />}
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ---- Error: backend/API failed ---- */}
              {status === "error" && (
                <div className="fade-in flex flex-col items-center text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: T.dangerSoft }}>
                    <TriangleAlert size={28} color={T.danger} strokeWidth={1.8} />
                  </div>
                  <p className="font-bold text-sm mb-1.5" style={{ color: T.danger }}>Unable to analyze application</p>
                  <p className="text-xs leading-relaxed max-w-[240px] mb-5" style={{ color: T.textMuted }}>
                    {error || "Please make sure the LoanIQ backend is running and try again."}
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="btn-shine px-5 py-2.5 rounded-full font-bold text-xs"
                    style={{ backgroundColor: T.navy, color: "#fff" }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ---- Success: real backend prediction ---- */}
              {status === "success" && result && (
                <div key={result.stamp} className="stamp-anim">
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: T.textMuted, letterSpacing: "0.12em" }}>
                    AI Risk Assessment
                  </p>
                  <div className="flex justify-center">
                    <RingDial
                      pct={result.pct}
                      countUp
                      sublabel="predicted default probability"
                      size={190}
                      thickness={15}
                      color={TONE_COLORS[category.tone].fill}
                      glow={TONE_COLORS[category.tone].glow}
                    />
                  </div>

                  <div
                    className="mt-5 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full mx-auto w-fit"
                    style={{ backgroundColor: TONE_COLORS[category.tone].soft }}
                  >
                    {category.tone === "high" && <TriangleAlert size={16} color={TONE_COLORS.high.text} />}
                    {category.tone === "medium" && <TrendingUp size={16} color={TONE_COLORS.medium.text} />}
                    {category.tone === "low" && <BadgeCheck size={16} color={T.primaryStrong} />}
                    <span
                      className="text-xs font-bold tracking-wide"
                      style={{ color: TONE_COLORS[category.tone].text }}
                    >
                      {category.label.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: T.primary, letterSpacing: "0.1em" }}>
                      Key risk factors
                    </p>
                    <ul className="space-y-2">
                      {keyFactors.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: T.textMuted }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: T.primary }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 px-4 py-3 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: T.surfaceSoft, color: T.text }}>
                    <span className="font-bold">Recommendation: </span>
                    {recommendation}
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeAgain}
                    className="btn-shine mt-5 w-full px-5 py-2.5 rounded-full font-bold text-xs"
                    style={{ backgroundColor: T.surfaceSoft, color: T.text }}
                  >
                    Analyze Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============ EXPLAINABLE AI ============ */}
        <Reveal delay={80}>
          <div className="mt-14 rounded-3xl p-8" style={{ backgroundColor: T.surface, border: "1px solid var(--border)" }}>
            <div className="flex items-start gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.surfaceSoft }}>
                <Info size={19} color={T.primary} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold" style={{ color: T.text, fontFamily: displayFont }}>Why Did LoanIQ Give This Result?</h3>
                <p className="mt-2 text-sm leading-relaxed max-w-2xl" style={{ color: T.textMuted }}>
                  The prediction comes from a logistic regression model weighing applicant characteristics such as
                  credit score, income, loan amount, debt-to-income ratio, interest rate, employment type and loan purpose.
                  {result ? " Here are the values from your most recent submission:" : " Run an analysis above to see this section populated with your actual submitted values."}
                </p>
              </div>
            </div>

            {lastForm && result ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  ["Credit score", lastForm.creditScore],
                  ["Annual income", `$${lastForm.income.toLocaleString()}`],
                  ["Loan amount", `$${lastForm.loanAmount.toLocaleString()}`],
                  ["DTI ratio", lastForm.dtiRatio.toFixed(2)],
                  ["Interest rate", `${lastForm.interestRate}%`],
                  ["Employment", lastForm.employmentType],
                  ["Loan purpose", lastForm.loanPurpose],
                  ["Months employed", lastForm.monthsEmployed],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl px-4 py-3" style={{ backgroundColor: T.bg, border: "1px solid var(--border)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: T.textMuted }}>{k}</p>
                    <p className="text-sm font-bold" style={{ color: T.text, fontFamily: monoFont }}>{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl px-4 py-3.5 text-xs" style={{ backgroundColor: T.bg, color: T.textMuted, border: "1px solid var(--border)" }}>
                No submitted application yet — this section reflects your real inputs once you run the Risk Checker above.
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* ============ MODEL INSIGHTS ============ */}
      <section id="insights" className="border-t" style={{ backgroundColor: T.surface, borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Reveal>
            <div className="max-w-xl mb-10 flex items-start gap-3">
              <div className="icon-hover w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: T.surfaceSoft }}>
                <Percent size={20} color={T.primary} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: T.primary, letterSpacing: "0.1em" }}>Under the hood</p>
                <h2 className="text-3xl font-extrabold" style={{ color: T.text, fontFamily: displayFont }}>What the data looked like.</h2>
              </div>
            </div>
          </Reveal>

          {/* Pipeline diagram */}
          <Reveal delay={80}>
            <div className="mb-12 rounded-2xl p-7 overflow-x-auto" style={{ backgroundColor: T.bg, border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 min-w-[720px] justify-between">
                {[
                  ["Applicant Data", Users],
                  ["Feature Processing", Workflow],
                  ["Standard Scaling", GitBranch],
                  ["Logistic Regression", Cpu],
                  ["Default Probability", Gauge],
                ].map(([label, Icon], i, arr) => (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-2 text-center w-32">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: T.surface, border: "1px solid var(--border)" }}>
                        <Icon size={19} color={T.primary} strokeWidth={2} />
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: T.text }}>{label}</span>
                    </div>
                    {i < arr.length - 1 && <ArrowRight size={16} color={T.primary} className="flex-shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <Reveal className="lg:col-span-2 grid grid-cols-3 gap-4">
              {[["0", "missing values", Wallet], ["0", "duplicate rows", CreditCard], ["18", "clean columns", ShieldCheck]].map(([num, sub, Icon]) => (
                <div key={sub} className="stat-hover rounded-2xl p-5 text-center" style={{ backgroundColor: T.bg, border: "1px solid var(--border)" }}>
                  <Icon size={20} color={T.primary} className="mx-auto mb-2" />
                  <p className="text-xl font-extrabold" style={{ color: T.text, fontFamily: monoFont }}>{num}</p>
                  <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>{sub}</p>
                </div>
              ))}
              <p className="col-span-3 text-xs leading-relaxed mt-1" style={{ color: T.textMuted }}>
                255,347 rows across 18 columns, fully de-duplicated with zero nulls before encoding and scaling.
              </p>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-3 rounded-2xl p-7" style={{ backgroundColor: T.bg, border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold" style={{ color: T.text }}>Illustrative Risk Drivers</p>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ backgroundColor: T.warningSoft, color: T.warning }}>Illustrative</span>
              </div>
              <p className="text-[11px] mb-5" style={{ color: T.textMuted }}>
                A simplified, UI-friendly weighting for demo purposes — not the logistic regression model's actual fitted coefficients.
              </p>
              <div className="space-y-3.5">
                {featureWeights.map(([label, pct], i) => <WeightBar key={label} label={label} pct={pct} delay={i * 120} />)}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {["Education", "EmploymentType", "MaritalStatus", "HasMortgage", "LoanPurpose", "HasCoSigner"].map((f) => (
                  <span key={f} className="px-3 py-1.5 rounded-full text-[11px] transition-transform duration-300 hover:scale-105" style={{ backgroundColor: T.accentGreen, color: "#0B3A2E", fontFamily: monoFont }}>
                    {f}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section style={{ backgroundColor: T.navy }}>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white" style={{ fontFamily: displayFont }}>Ready to Analyze a Loan?</h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
              Run LoanIQ against an applicant profile and see the predicted default risk in seconds.
            </p>
            <a
              href="#try-it"
              className="btn-shine mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm"
              style={{ backgroundColor: T.primary, color: "#fff" }}
            >
              Analyze Loan Risk <ArrowRight size={15} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ backgroundColor: T.navy, color: "rgba(255,255,255,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span className="font-bold" style={{ fontFamily: displayFont, fontSize: "0.95rem" }}>
            LoanIQ — logistic regression risk score, built on 255K banking records.
          </span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>Statistical estimate, not a credit decision · © 2026</span>
        </div>
      </footer>
    </div>
  );
}
