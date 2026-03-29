import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════
// FORGE — Tactical Fitness Command System
// Design: Deep Navy + Copper + Teal | 0px radius | Space Grotesk + Inter
// ═══════════════════════════════════════════════════════

// ── Design Tokens ──
const T = {
  surface: "#071325",
  card: "#101C2E",
  cardHigh: "#1F2A3D",
  copper: "#E26F4C",
  copperLight: "#FFB59F",
  teal: "#4FDBCC",
  cream: "#E8DCC8",
  muted: "#6B7B8D",
  label: "#8A9BB0",
  proteinRed: "#E05545",
  fatBlue: "#4A7B9D",
  success: "#3DAA7D",
  warning: "#E26F4C",
};

const font = {
  head: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
};

// ── Activity Library (all available protocols) ──
// Exercises now support superset grouping: group:"A" means paired with other group:"A" exercises
const ACTIVITY_LIBRARY = [
  {
    id: "lower", label: "LOWER BODY", name: "SQUAT PATTERN ALPHA",
    type: "gym", category: "strength", duration: 70, icon: "🦵",
    description: "Supersetted: Leg press/box squat, hip thrust/pull-through, step-ups/calf raises + jump training",
    exercises: [
      { id: "w1", name: "Corrective Warm-Up", sets: 1, reps: "10 min", weight: 0, type: "warmup", note: "Full corrective protocol — foot, ankle, balance, hips, core", rest: 0 },
      // Superset A: Quad dominant + Hip hinge
      { id: "e1", name: "Leg Press", sets: 3, reps: "10-12", weight: 40, note: "Push knees outward. Start light.", group: "A", rest: 30 },
      { id: "e2", name: "Banded Box Squat", sets: 3, reps: "10", weight: 0, note: "Band around knees. Sit to box. Bodyweight.", group: "A", rest: 60 },
      // Superset B: Posterior chain pair
      { id: "e3", name: "Hip Thrust", sets: 3, reps: "10-12", weight: 20, note: "Squeeze glutes at top. Full lockout.", group: "B", rest: 30 },
      { id: "e4", name: "Cable Pull-Through", sets: 3, reps: "12", weight: 15, note: "Hinge at hips. Feel hamstrings stretch.", group: "B", rest: 60 },
      // Superset C: Single-leg + Calves
      { id: "e5", name: "DB Step-Ups", sets: 3, reps: "10 each", weight: 0, note: "Low box. Drive through heel.", group: "C", rest: 30 },
      { id: "e6", name: "Calf Raises", sets: 3, reps: "15", weight: 0, note: "Slow — don't roll inward at the top.", group: "C", rest: 60 },
      // Straight set
      { id: "e7", name: "Leg Curl Machine", sets: 3, reps: "12", weight: 20, note: "Hamstring isolation. Controlled.", rest: 60 },
      // Jump Training (Phase-appropriate)
      { id: "j1", name: "Altitude Drops", sets: 3, reps: "5", weight: 0, type: "plyo", note: "Step off 20cm box. Land softly, hold 3 sec. Knees tracking straight.", rest: 45 },
      { id: "j2", name: "Seated Vertical Jump", sets: 3, reps: "5", weight: 0, type: "plyo", note: "Sit on bench. Stand up explosively onto toes. No actual jump yet.", rest: 45 },
      // Cardio
      { id: "c1", name: "Incline Treadmill Walk", sets: 1, reps: "12 min", weight: 0, type: "cardio", note: "10-12% incline, 5.5-6 km/h. Fat-burning zone.", rest: 0 },
    ]
  },
  {
    id: "upper", label: "UPPER BODY", name: "PUSH/PULL LOGISTICS",
    type: "gym", category: "strength", duration: 65, icon: "💪",
    description: "Supersetted push/pull pairs: Bench+Pulldown, OHP+Row, Curl+Pushdown + face pulls",
    exercises: [
      { id: "w1", name: "Corrective Warm-Up", sets: 1, reps: "10 min", weight: 0, type: "warmup", note: "Full corrective protocol", rest: 0 },
      // Superset A: Horizontal push + pull
      { id: "e1", name: "DB Bench Press", sets: 3, reps: "8-10", weight: 14, note: "3 sec down, 1 sec up. Control the eccentric.", group: "A", rest: 30 },
      { id: "e2", name: "Lat Pulldown", sets: 3, reps: "10-12", weight: 30, note: "Squeeze shoulder blades at bottom.", group: "A", rest: 60 },
      // Superset B: Vertical push + horizontal pull
      { id: "e3", name: "DB Overhead Press", sets: 3, reps: "8-10", weight: 8, note: "Brace core. Don't arch lower back.", group: "B", rest: 30 },
      { id: "e4", name: "Seated Cable Row", sets: 3, reps: "10-12", weight: 25, note: "Pull to belly button. Chest up.", group: "B", rest: 60 },
      // Superset C: Arms antagonist pair
      { id: "e5", name: "DB Bicep Curl", sets: 2, reps: "12", weight: 6, note: "No swinging. Full range of motion.", group: "C", rest: 30 },
      { id: "e6", name: "Tricep Pushdown", sets: 2, reps: "12", weight: 15, note: "Elbows pinned to sides.", group: "C", rest: 45 },
      // Straight set
      { id: "e7", name: "Face Pulls", sets: 3, reps: "15", weight: 10, note: "Posture and shoulder health. Light weight.", rest: 45 },
      // No jump training on upper body day
      // Cardio
      { id: "c1", name: "Incline Treadmill Walk", sets: 1, reps: "15 min", weight: 0, type: "cardio", note: "10-12% incline, 5.5-6 km/h.", rest: 0 },
    ]
  },
  {
    id: "fullbody", label: "FULL BODY", name: "STRENGTH PROTOCOL",
    type: "gym", category: "strength", duration: 70, icon: "⚡",
    description: "Supersetted compounds: Squat+Bench, Hip thrust+Pull-ups, Single-leg press+Plank + jump training",
    exercises: [
      { id: "w1", name: "Corrective Warm-Up", sets: 1, reps: "10 min", weight: 0, type: "warmup", note: "Full corrective protocol", rest: 0 },
      // Superset A: Lower + Upper compound
      { id: "e1", name: "Barbell Squat", sets: 3, reps: "6-8", weight: 20, note: "Band + heel plates. Empty bar to start.", swap: "Hack Squat Machine", group: "A", rest: 45 },
      { id: "e2", name: "DB Bench Press", sets: 3, reps: "6-8", weight: 16, note: "Heavier than Tuesday.", group: "A", rest: 75 },
      // Superset B: Posterior + Pull
      { id: "e3", name: "Hip Thrust", sets: 3, reps: "8", weight: 30, note: "Heavier than Monday.", group: "B", rest: 30 },
      { id: "e4", name: "Pull-Up Negatives", sets: 3, reps: "5", weight: 0, note: "Jump up, lower over 5 seconds.", group: "B", rest: 60 },
      // Superset C: Single-leg + Core
      { id: "e5", name: "Single-Leg Leg Press", sets: 3, reps: "10 each", weight: 20, note: "Fix left-right imbalance.", group: "C", rest: 30 },
      { id: "e6", name: "Plank", sets: 3, reps: "30-45s", weight: 0, note: "Brace hard. No sagging.", group: "C", rest: 45 },
      // Jump Training
      { id: "j1", name: "Box Jump (low)", sets: 3, reps: "5", weight: 0, type: "plyo", note: "Jump ONTO 20-30cm box. Step down. Don't jump down.", rest: 45 },
      { id: "j2", name: "Pogo Hops", sets: 2, reps: "15", weight: 0, type: "plyo", note: "Small bounces on balls of feet. Quick ground contact.", rest: 30 },
      // Cardio
      { id: "c1", name: "Incline Treadmill Walk", sets: 1, reps: "12 min", weight: 0, type: "cardio", note: "Fat-burning zone.", rest: 0 },
    ]
  },
  {
    id: "tennis", label: "TENNIS", name: "COURT SESSION",
    type: "outdoor", category: "sport", duration: 60, icon: "🎾",
    description: "10 min agility ladder warm-up → match play",
    exercises: [
      { id: "a1", name: "One Step Run", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "One foot in each square. Light and quick. Arms at 90°.", rest: 15 },
      { id: "a2", name: "Two Feet In (Fast Feet)", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "Both feet touch every square. Quick choppy steps.", rest: 15 },
      { id: "a3", name: "Lateral Shuffle", sets: 2, reps: "1 pass each way", weight: 0, type: "agility", note: "Face sideways. In-in, out-out through each square.", rest: 15 },
      { id: "a4", name: "High Knees Through", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "One foot per square, drive knees up high.", rest: 15 },
    ]
  },
  {
    id: "badminton", label: "BADMINTON", name: "REACTIVE AGILITY",
    type: "outdoor", category: "sport", duration: 45, icon: "🏸",
    description: "10 min agility ladder warm-up → match play",
    exercises: [
      { id: "a1", name: "One Step Run", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "One foot in each square. Build speed gradually.", rest: 15 },
      { id: "a2", name: "Two Feet In (Fast Feet)", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "Both feet in every square. Maximum speed.", rest: 15 },
      { id: "a3", name: "Lateral Shuffle", sets: 2, reps: "1 pass each way", weight: 0, type: "agility", note: "Side-to-side — critical for court movement.", rest: 15 },
      { id: "a4", name: "In-Out-In-Out", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "Both feet in, both feet out straddling ladder. Moving forward.", rest: 15 },
    ]
  },
  {
    id: "swimming", label: "SWIMMING", name: "AQUATIC RECON",
    type: "outdoor", category: "cardio", duration: 45, icon: "🏊",
    description: "Low-impact cardio — excellent for leg recovery",
    exercises: []
  },
  {
    id: "walking", label: "WALKING", name: "ACTIVE RECOVERY",
    type: "outdoor", category: "cardio", duration: 40, icon: "🚶",
    description: "Steady-state zone 2 cardio — incline or outdoor",
    exercises: []
  },
  {
    id: "rest", label: "REST DAY", name: "NEURAL RESET",
    type: "rest", category: "recovery", duration: 0, icon: "🛡",
    description: "Full recovery — sauna, stretching, or complete rest",
    exercises: []
  },
  {
    id: "mobility", label: "MOBILITY", name: "CORRECTIVE SESSION",
    type: "rest", category: "recovery", duration: 30, icon: "🧘",
    description: "Extended corrective protocol + foam rolling + stretching",
    exercises: []
  },
  {
    id: "plyo", label: "JUMP TRAINING", name: "PLYOMETRIC PROTOCOL",
    type: "gym", category: "performance", duration: 30, icon: "🔥",
    description: "Standalone jump session — altitude drops, box jumps, broad jumps, pogo hops",
    exercises: [
      { id: "j1", name: "Altitude Drops", sets: 3, reps: "5", weight: 0, type: "plyo", note: "Step off 20cm box. Land softly, hold 3 sec.", rest: 45 },
      { id: "j2", name: "Eccentric Squat Drops", sets: 3, reps: "6", weight: 0, type: "plyo", note: "Drop into quarter squat fast, hold 3 sec, stand slowly.", rest: 45 },
      { id: "j3", name: "Seated Vertical Jump", sets: 3, reps: "5", weight: 0, type: "plyo", note: "Sit on bench, stand up explosively onto toes.", rest: 45 },
      { id: "j4", name: "Band-Assisted Pogo Hops", sets: 2, reps: "15", weight: 0, type: "plyo", note: "Hold TRX/cable for support. Small bounces, balls of feet.", rest: 30 },
    ]
  },
  {
    id: "agility", label: "AGILITY SESSION", name: "FOOT SPEED PROTOCOL",
    type: "outdoor", category: "performance", duration: 25, icon: "👟",
    description: "Standalone agility ladder session — all patterns at increasing speed",
    exercises: [
      { id: "a1", name: "One Step Run", sets: 3, reps: "1 pass", weight: 0, type: "agility", note: "One foot per square. Increase speed each pass.", rest: 15 },
      { id: "a2", name: "Two Feet In", sets: 3, reps: "1 pass", weight: 0, type: "agility", note: "Both feet every square. Maximum speed on last pass.", rest: 15 },
      { id: "a3", name: "Lateral Shuffle", sets: 2, reps: "1 pass each way", weight: 0, type: "agility", note: "Side-to-side through each square.", rest: 15 },
      { id: "a4", name: "In-Out-In-Out", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "Both feet in, both feet out, moving forward.", rest: 15 },
      { id: "a5", name: "High Knees Through", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "Drive knees high. One foot per square.", rest: 15 },
      { id: "a6", name: "Carioca/Crossover", sets: 2, reps: "1 pass each way", weight: 0, type: "agility", note: "Sideways, crossing foot in front then behind.", rest: 15 },
    ]
  },
];

// ── Week Shell (days with no fixed activity) ──
const WEEK_DAYS = [
  { day: "MON", date: 24 },
  { day: "TUE", date: 25 },
  { day: "WED", date: 26 },
  { day: "THU", date: 27 },
  { day: "FRI", date: 28 },
  { day: "SAT", date: 29 },
  { day: "SUN", date: 30 },
];

// Default suggestion (can be overridden)
const DEFAULT_SCHEDULE = {
  MON: "lower",
  TUE: "upper",
  WED: null,
  THU: "fullbody",
  FRI: null,
  SAT: null,
  SUN: "rest",
};

// ── Program Meta ──
const PROGRAM = {
  week: 3,
  totalWeeks: 12,
  phase: "Foundation",
  // days is now dynamically built from schedule state
  get days() {
    return WEEK_DAYS.map(d => {
      const actId = DEFAULT_SCHEDULE[d.day];
      const activity = actId ? ACTIVITY_LIBRARY.find(a => a.id === actId) : null;
      return {
        ...d,
        label: activity?.label || "UNASSIGNED",
        name: activity?.name || "—",
        type: activity?.type || "empty",
        duration: activity?.duration || 0,
        status: d.day === "MON" ? "completed" : d.day === "TUE" ? "active" : "upcoming",
        exercises: activity?.exercises || [],
        activityId: actId,
      };
    });
  },
  macros: { calories: { current: 1247, target: 1900 }, protein: { current: 67, target: 145 }, carbs: { current: 89, target: 185 }, fat: { current: 23, target: 60 } },
  meals: [
    { time: "0700", label: "PRE-TRAINING FUEL", food: "Coffee + Skim Milk", kcal: 45, protein: 3, logged: true },
    { time: "1000", label: "BREAKFAST", food: "Oats + Whey Protein Scoop", kcal: 380, protein: 36, logged: true },
    { time: "1300", label: "LUNCH", food: "Paneer Tikka + Brown Rice + Moong Dal", kcal: 520, protein: 38, logged: true },
    { time: "1830", label: "POST-WORKOUT", food: "Whey Isolate + Creatine", kcal: 140, protein: 35, logged: false },
    { time: "2000", label: "DINNER", food: "Chickpea Curry + 2 Multigrain Roti", kcal: 410, protein: 22, logged: false },
  ]
};

// ── Corrective Warm-Up Protocol ──
const WARMUP = [
  { name: "Short Foot Exercise", instruction: "Activate arch muscles — 30 sec each foot", duration: 60, phase: "FOOT", note: "Focus on doming your arch without curling your toes. Hold the contraction — precision over force." },
  { name: "Towel Scrunches", instruction: "Scrunch towel with toes — 30 sec each foot", duration: 60, phase: "FOOT", note: "Pull the towel toward you using only your toes. Keep heel planted." },
  { name: "Banded Ankle Circles", instruction: "10 circles each direction, each ankle", duration: 90, phase: "ANKLE", note: "Slow and controlled. Feel the full range of motion." },
  { name: "Calf Raises (Pronation Focus)", instruction: "15 reps — don't let arch collapse", duration: 60, phase: "ANKLE", note: "Rise straight up. Watch your ankles — they should NOT roll inward." },
  { name: "Single-Leg Balance", instruction: "20 sec each leg — eyes forward", duration: 50, phase: "BALANCE", note: "Right leg will be harder. That's expected. Focus on the arch and hip." },
  { name: "Clamshells", instruction: "15 each side with band", duration: 60, phase: "HIPS", note: "Keep hips stacked. Don't roll backward. Feel it in the outer glute." },
  { name: "Banded Lateral Walks", instruction: "10 steps each direction", duration: 60, phase: "HIPS", note: "Stay low in a quarter squat. Push knees outward against the band." },
  { name: "Dead Bugs", instruction: "8 each side, controlled", duration: 60, phase: "CORE", note: "Lower back stays pressed into the floor. If it lifts, you've gone too far." },
  { name: "Bird Dogs", instruction: "8 each side, 3-sec hold", duration: 60, phase: "CORE", note: "Extend opposite arm and leg. Hold. Don't let hips rotate." },
];

// ── Styles ──
const s = {
  app: { fontFamily: font.body, background: T.surface, color: T.cream, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" },
  label: { fontFamily: font.head, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: T.label, margin: 0 },
  labelCopper: { fontFamily: font.head, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: T.copper, margin: 0 },
  h1: { fontFamily: font.head, fontSize: 28, fontWeight: 700, color: T.cream, margin: 0, lineHeight: 1.2 },
  h2: { fontFamily: font.head, fontSize: 20, fontWeight: 700, color: T.cream, margin: 0, lineHeight: 1.3 },
  h3: { fontFamily: font.head, fontSize: 16, fontWeight: 600, color: T.cream, margin: 0 },
  bigNum: { fontFamily: font.head, fontSize: 48, fontWeight: 700, color: T.cream, margin: 0, lineHeight: 1 },
  card: { background: T.card, padding: 20, marginBottom: 12 },
  cardHighlight: { background: T.card, padding: 20, marginBottom: 12, borderLeft: `3px solid ${T.copper}` },
  body: { fontFamily: font.body, fontSize: 14, color: T.muted, lineHeight: 1.5, margin: 0 },
  btn: { fontFamily: font.head, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, border: "none", padding: "14px 24px", cursor: "pointer", width: "100%", background: `linear-gradient(135deg, ${T.copperLight}, ${T.copper})`, color: T.surface },
  btnSecondary: { fontFamily: font.head, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, border: `1px solid ${T.label}33`, background: "transparent", color: T.cream, padding: "10px 20px", cursor: "pointer" },
  tabBar: { display: "flex", justifyContent: "space-around", alignItems: "center", background: T.card, borderTop: `1px solid ${T.cardHigh}`, padding: "10px 0 6px", position: "sticky", bottom: 0, zIndex: 100 },
  tab: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", border: "none", background: "none", padding: "4px 8px" }),
  tabIcon: (active) => ({ fontSize: 18, color: active ? T.copper : T.muted }),
  tabLabel: (active) => ({ fontFamily: font.head, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: active ? T.copper : T.muted }),
  progressBar: (pct, color) => ({ height: 4, background: T.cardHigh, width: "100%", position: "relative", overflow: "hidden" }),
  progressFill: (pct, color) => ({ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, transition: "width 0.5s ease" }),
};

// ── Icons (SVG inline) ──
const Icon = ({ name, size = 20, color = T.muted }) => {
  const icons = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>,
    train: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M6 5v14M18 5v14M2 8h4M18 8h4M2 16h4M18 16h4M6 12h12" /></svg>,
    fuel: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" /></svg>,
    intel: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
    profile: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0113 0" /></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M8 5v14l11-7z" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>,
    bolt: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    timer: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M10 2h4" /></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2L1 21h22L12 2zm0 7v5m0 3h.01" /></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>,
    fire: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.31-6.64 4.5-9 .37-.4 1-.4 1.37 0C10.56 7.86 11 9.5 11 9.5s1.44-2.14 3-4c.37-.44 1.06-.44 1.43 0C17.69 8.36 21 11.93 21 15c0 4.42-4.03 8-9 8z" /></svg>,
  };
  return icons[name] || null;
};

// ── Circular Progress Ring ──
const ProgressRing = ({ pct, size = 80, stroke = 4, color = T.copper }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.cardHigh} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="butt" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
};

// ── Macro Bar ──
const MacroBar = ({ label, current, target, color, showWarning }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ ...s.label, fontSize: 10, color: T.cream }}>{label}</span>
        {showWarning && <Icon name="alert" size={12} color={T.proteinRed} />}
      </div>
      <span style={{ fontFamily: font.head, fontSize: 12, color: T.cream }}>{current}<span style={{ color: T.muted }}>/{target}G</span></span>
    </div>
    <div style={s.progressBar()}>
      <div style={s.progressFill((current / target) * 100, color)} />
    </div>
  </div>
);

// ═══════════════════════════════════
// SCREEN: COMMAND (Home Dashboard)
// ═══════════════════════════════════
const CommandScreen = ({ onStartWorkout, onNavigate }) => {
  const todayActivity = ACTIVITY_LIBRARY.find(a => a.id === DEFAULT_SCHEDULE["TUE"]);
  const phasePct = Math.round((PROGRAM.week / PROGRAM.totalWeeks) * 100);
  const { macros } = PROGRAM;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="fire" size={22} color={T.copper} />
          <span style={{ fontFamily: font.head, fontSize: 15, letterSpacing: "0.2em", color: T.copper, fontWeight: 700 }}>FORGE</span>
        </div>
        <Icon name="profile" size={22} color={T.label} />
      </div>

      {/* Greeting */}
      <div style={{ padding: "24px 20px 0" }}>
        <p style={s.label}>OPERATIONAL STATUS: OPTIMAL</p>
        <h1 style={{ ...s.h1, fontSize: 32, marginTop: 8 }}>Good morning,{"\n"}Snehal</h1>
      </div>

      {/* Phase Card */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ ...s.cardHighlight }}>
          <p style={s.labelCopper}>MISSION DURATION</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div>
              <h2 style={s.h1}>Week {PROGRAM.week} of {PROGRAM.totalWeeks}</h2>
              <h2 style={{ ...s.h2, color: T.cream, marginTop: 4 }}>{PROGRAM.phase}</h2>
            </div>
            <div style={{ textAlign: "center", position: "relative" }}>
              <ProgressRing pct={phasePct} size={70} stroke={4} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <span style={{ fontFamily: font.head, fontSize: 18, color: T.copper, fontWeight: 700 }}>{phasePct}%</span>
              </div>
            </div>
          </div>
          <p style={{ ...s.body, marginTop: 12, fontStyle: "italic", color: T.teal }}>Strategic Focus: Establishing core stability and metabolic baseline.</p>
        </div>
      </div>

      {/* Motivation Card */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: T.cardHigh, padding: 12, display: "flex" }}>
            <Icon name="bolt" size={24} color={T.copper} />
          </div>
          <div>
            <p style={{ ...s.labelCopper, marginBottom: 4 }}>PUSH YOUR LIMITS</p>
            <p style={{ ...s.body, color: T.cream }}>Surpass yesterday's metrics.</p>
          </div>
        </div>
      </div>

      {/* Daily Fuel */}
      <div style={{ padding: "0 20px" }}>
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <p style={s.label}>DAILY FUEL INTAKE</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                <span style={{ ...s.bigNum, fontSize: 42 }}>{macros.calories.current.toLocaleString()}</span>
                <span style={{ fontFamily: font.head, fontSize: 14, color: T.muted }}>/ {macros.calories.target.toLocaleString()} kcal</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ ...s.label, fontSize: 9 }}>METABOLIC EFFICIENCY</p>
              <p style={{ fontFamily: font.head, fontSize: 16, color: T.copper, fontWeight: 700, marginTop: 4 }}>HIGH</p>
            </div>
          </div>
          <MacroBar label="PROTEIN" current={macros.protein.current} target={macros.protein.target} color={T.proteinRed} showWarning={macros.protein.current < macros.protein.target * 0.5} />
          <MacroBar label="CARBS" current={macros.carbs.current} target={macros.carbs.target} color={T.teal} />
          <MacroBar label="FAT" current={macros.fat.current} target={macros.fat.target} color={T.fatBlue} />
        </div>
      </div>

      {/* Today's Protocol */}
      {todayActivity && (
        <div style={{ padding: "0 20px" }}>
          <p style={{ ...s.label, marginBottom: 12 }}>TODAY'S PROTOCOL</p>
          <div style={{ ...s.cardHighlight, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={onStartWorkout}>
            <div>
              <h2 style={s.h2}>{todayActivity.label} — Tuesday</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <span style={{ ...s.body, fontSize: 12 }}>{todayActivity.exercises.length} exercises</span>
                <span style={{ ...s.body, fontSize: 12 }}>{todayActivity.duration} min</span>
              </div>
              <p style={{ ...s.labelCopper, marginTop: 8, fontSize: 10 }}>STRENGTH FOCUS</p>
            </div>
            <div style={{ background: T.cardHigh, padding: 14, cursor: "pointer" }} onClick={onStartWorkout}>
              <Icon name="play" size={24} color={T.copper} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════
// SCREEN: ACTIVE WORKOUT
// ═══════════════════════════════════
const WorkoutScreen = ({ onBack }) => {
  const todayActivity = ACTIVITY_LIBRARY.find(a => a.id === DEFAULT_SCHEDULE["TUE"]);
  const exercises = todayActivity?.exercises || [];

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [sets, setSets] = useState(() =>
    exercises.map(ex => Array.from({ length: ex.sets }, () => ({ weight: ex.weight, reps: parseInt(ex.reps) || 10, done: false })))
  );
  const [currentSet, setCurrentSet] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [elapsed, setElapsed] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const timerRef = useRef(null);

  // Workout timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Rest timer
  useEffect(() => {
    if (resting && restTime > 0) {
      timerRef.current = setTimeout(() => setRestTime(r => r - 1), 1000);
    } else if (resting && restTime <= 0) {
      setResting(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [resting, restTime]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const currentEx = exercises[currentExIdx];
  const currentSets = sets[currentExIdx] || [];
  const completedSets = currentSets.filter(s => s.done).length;
  const totalExCompleted = sets.filter(exSets => exSets.every(s => s.done)).length;

  const adjustWeight = (delta) => {
    setSets(prev => {
      const next = prev.map(a => a.map(s => ({ ...s })));
      const curr = next[currentExIdx][currentSet];
      curr.weight = Math.max(0, curr.weight + delta);
      return next;
    });
  };

  const adjustReps = (delta) => {
    setSets(prev => {
      const next = prev.map(a => a.map(s => ({ ...s })));
      const curr = next[currentExIdx][currentSet];
      curr.reps = Math.max(0, curr.reps + delta);
      return next;
    });
  };

  const completeSet = () => {
    const exRest = currentEx?.rest || 60;
    setSets(prev => {
      const next = prev.map(a => a.map(s => ({ ...s })));
      next[currentExIdx][currentSet].done = true;
      return next;
    });
    if (currentSet < currentSets.length - 1) {
      setCurrentSet(currentSet + 1);
      setResting(true);
      setRestTime(exRest);
    } else if (currentExIdx < exercises.length - 1) {
      const nextExRest = exercises[currentExIdx + 1]?.rest || 60;
      setCurrentExIdx(currentExIdx + 1);
      setCurrentSet(0);
      setResting(true);
      setRestTime(nextExRest);
    }
  };

  const skipRest = () => { setResting(false); setRestTime(currentEx?.rest || 60); };

  if (currentEx?.type === "warmup") {
    return <WarmupScreen onComplete={() => { setCurrentExIdx(1); setCurrentSet(0); }} onBack={onBack} elapsed={elapsed} formatTime={formatTime} />;
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.cardHigh}` }}>
        <div style={{ cursor: "pointer", padding: 4 }} onClick={onBack}><Icon name="close" size={20} color={T.label} /></div>
        <span style={{ fontFamily: font.head, fontSize: 13, letterSpacing: "0.2em", color: T.copper, fontWeight: 700 }}>FORGE</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Session Info */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={s.label}>PROTOCOL: ACTIVE</p>
        <h1 style={{ ...s.h1, marginTop: 4 }}>{todayActivity?.label}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <Icon name="timer" size={18} color={T.copper} />
          <span style={{ fontFamily: font.head, fontSize: 28, color: T.copper, fontWeight: 700 }}>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Current Exercise */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={s.cardHighlight}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ ...s.label, color: T.teal, fontSize: 10 }}>● CURRENT EXERCISE</p>
                {currentEx?.group && <span style={{ fontFamily: font.head, fontSize: 8, letterSpacing: "0.1em", color: T.copper, background: `${T.copper}20`, padding: "2px 6px" }}>SUPERSET {currentEx.group}</span>}
                {currentEx?.type === "plyo" && <span style={{ fontFamily: font.head, fontSize: 8, letterSpacing: "0.1em", color: T.teal, background: `${T.teal}20`, padding: "2px 6px" }}>JUMP TRAINING</span>}
                {currentEx?.type === "agility" && <span style={{ fontFamily: font.head, fontSize: 8, letterSpacing: "0.1em", color: "#D4944C", background: "#D4944C20", padding: "2px 6px" }}>AGILITY</span>}
                {currentEx?.type === "cardio" && <span style={{ fontFamily: font.head, fontSize: 8, letterSpacing: "0.1em", color: T.success, background: `${T.success}20`, padding: "2px 6px" }}>CARDIO</span>}
              </div>
              <h2 style={{ ...s.h2, marginTop: 8, fontSize: 18 }}>{currentEx?.name}</h2>
              <p style={{ ...s.body, marginTop: 4, fontSize: 12 }}>SET {completedSets + 1} OF {currentSets.length}</p>
            </div>
            <div style={{ cursor: "pointer", padding: 8 }} onClick={() => setShowDetail(true)}>
              <span style={{ fontFamily: font.head, fontSize: 10, color: T.label, letterSpacing: "0.1em" }}>INFO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sets */}
      <div style={{ padding: "0 20px" }}>
        {currentSets.map((set, i) => {
          const isActive = i === currentSet && !set.done;
          const isDone = set.done;
          return (
            <div key={i} style={{
              ...s.card,
              opacity: isDone ? 0.5 : (isActive ? 1 : 0.6),
              borderLeft: isActive ? `3px solid ${T.teal}` : "none",
              marginBottom: 8,
              padding: isActive ? "16px 20px" : "12px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ ...s.label, fontSize: 10 }}>
                  {isDone ? `SET_0${i + 1} // COMPLETED` : isActive ? `SET_0${i + 1} — ACTIVE` : `SET_0${i + 1} // QUEUED`}
                </p>
                {isDone && <Icon name="check" size={18} color={T.teal} />}
              </div>

              {isActive ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    {/* Weight */}
                    <div style={{ flex: 1, background: T.cardHigh, padding: 16, textAlign: "center" }}>
                      <p style={{ ...s.label, fontSize: 9, marginBottom: 8 }}>MASS (KG)</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <button onClick={() => adjustWeight(-1)} style={{ background: "none", border: `1px solid ${T.teal}33`, color: T.teal, width: 32, height: 32, cursor: "pointer", fontFamily: font.head, fontSize: 18 }}>−</button>
                        <span style={{ fontFamily: font.head, fontSize: 32, fontWeight: 700, color: T.cream }}>{set.weight}</span>
                        <button onClick={() => adjustWeight(1)} style={{ background: "none", border: `1px solid ${T.teal}33`, color: T.teal, width: 32, height: 32, cursor: "pointer", fontFamily: font.head, fontSize: 18 }}>+</button>
                      </div>
                    </div>
                    {/* Reps */}
                    <div style={{ flex: 1, background: T.cardHigh, padding: 16, textAlign: "center" }}>
                      <p style={{ ...s.label, fontSize: 9, marginBottom: 8 }}>REPETITIONS</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <button onClick={() => adjustReps(-1)} style={{ background: "none", border: `1px solid ${T.teal}33`, color: T.teal, width: 32, height: 32, cursor: "pointer", fontFamily: font.head, fontSize: 18 }}>−</button>
                        <span style={{ fontFamily: font.head, fontSize: 32, fontWeight: 700, color: T.cream }}>{set.reps}</span>
                        <button onClick={() => adjustReps(1)} style={{ background: "none", border: `1px solid ${T.teal}33`, color: T.teal, width: 32, height: 32, cursor: "pointer", fontFamily: font.head, fontSize: 18 }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontFamily: font.head, fontSize: 16, color: T.cream, marginTop: 6 }}>
                  {set.weight}<span style={{ fontSize: 11, color: T.muted }}> KG</span>  ×  {set.reps}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Coach Note */}
      {currentEx?.note && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ ...s.card, borderLeft: `3px solid ${T.copper}` }}>
            <p style={{ ...s.labelCopper, fontSize: 10, marginBottom: 6 }}>COACH INTEL</p>
            <p style={{ ...s.body, color: T.cream, fontStyle: "italic", fontSize: 13 }}>"{currentEx.note}"</p>
          </div>
        </div>
      )}

      {/* Rest Timer */}
      {resting && (
        <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <ProgressRing pct={(restTime / (currentEx?.rest || 60)) * 100} size={120} stroke={4} color={T.teal} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <p style={{ ...s.label, fontSize: 9 }}>RECOVERY</p>
              <span style={{ fontFamily: font.head, fontSize: 36, color: T.teal, fontWeight: 700 }}>{restTime}<span style={{ fontSize: 16 }}>s</span></span>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={skipRest} style={{ ...s.btnSecondary, fontSize: 10 }}>SKIP REST →</button>
          </div>
        </div>
      )}

      {/* Complete Button */}
      {!resting && (
        <div style={{ padding: "20px 20px 0" }}>
          <button onClick={completeSet} style={s.btn}>COMPLETE SET — EXECUTE</button>
        </div>
      )}

      {/* Exercise Progress Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "20px 20px", alignItems: "center" }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{
            width: i === currentExIdx ? 12 : 8,
            height: i === currentExIdx ? 12 : 8,
            background: i < currentExIdx ? T.copper : i === currentExIdx ? T.teal : T.cardHigh,
            transition: "all 0.3s ease"
          }} />
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setShowDetail(false)}>
          <div style={{ background: T.card, width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
            <p style={{ ...s.label, marginBottom: 8 }}>EXERCISE DETAIL</p>
            <h2 style={{ ...s.h1, marginBottom: 16 }}>{currentEx?.name}</h2>
            <p style={s.labelCopper}>TACTICAL EXECUTION</p>
            <p style={{ ...s.body, color: T.cream, marginTop: 8 }}>{currentEx?.note}</p>
            {currentEx?.swap && (
              <div style={{ marginTop: 16, padding: 12, background: T.cardHigh, borderLeft: `3px solid ${T.warning}` }}>
                <p style={{ ...s.body, color: T.copperLight }}>⚠ If knees cave → switch to {currentEx.swap}</p>
              </div>
            )}
            <button onClick={() => setShowDetail(false)} style={{ ...s.btn, marginTop: 20 }}>UNDERSTOOD</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════
// SCREEN: CORRECTIVE WARM-UP
// ═══════════════════════════════════
const WarmupScreen = ({ onComplete, onBack, elapsed, formatTime }) => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WARMUP[0].duration);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (running && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
      return () => clearTimeout(t);
    }
    if (running && timeLeft <= 0) {
      setRunning(false);
    }
  }, [running, timeLeft]);

  const current = WARMUP[step];
  const phases = ["FOOT", "ANKLE", "BALANCE", "HIPS", "CORE"];
  const currentPhase = current.phase;

  const nextExercise = () => {
    if (step < WARMUP.length - 1) {
      const next = step + 1;
      setStep(next);
      setTimeLeft(WARMUP[next].duration);
      setRunning(false);
    } else {
      onComplete();
    }
  };

  const skipExercise = () => nextExercise();

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.cardHigh}` }}>
        <div style={{ cursor: "pointer" }} onClick={onBack}><Icon name="back" size={20} color={T.label} /></div>
        <span style={{ fontFamily: font.head, fontSize: 11, letterSpacing: "0.2em", color: T.copper }}>FORGE // SESSION</span>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <p style={s.labelCopper}>CORRECTIVE PROTOCOL</p>
        <h1 style={{ ...s.h1, marginTop: 8 }}>Pre-Session Activation</h1>
        <p style={{ ...s.body, marginTop: 4 }}>~12 min • {step + 1} of {WARMUP.length} exercises</p>
      </div>

      {/* Current Exercise */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ ...s.cardHighlight }}>
          <h2 style={{ fontFamily: font.head, fontSize: 22, fontWeight: 700, color: T.cream, textTransform: "uppercase" }}>{current.name}</h2>
          <p style={{ ...s.body, marginTop: 8, color: T.teal }}>{current.instruction}</p>
        </div>
      </div>

      {/* Timer */}
      <div style={{ textAlign: "center", padding: "24px 20px" }}>
        <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }} onClick={() => setRunning(!running)}>
          <ProgressRing pct={(timeLeft / current.duration) * 100} size={160} stroke={5} color={T.copper} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <span style={{ fontFamily: font.head, fontSize: 48, fontWeight: 700, color: T.cream }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
            <p style={{ ...s.label, fontSize: 10, marginTop: 4, color: T.copper }}>{running ? "TAP TO PAUSE" : "TAP TO START"}</p>
          </div>
        </div>
      </div>

      {/* Phase Progress */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "0 20px 20px" }}>
        {phases.map(p => {
          const isComplete = phases.indexOf(p) < phases.indexOf(currentPhase);
          const isCurrent = p === currentPhase;
          return (
            <div key={p} style={{ textAlign: "center" }}>
              <div style={{ width: 12, height: 12, margin: "0 auto 6px", background: isComplete ? T.copper : isCurrent ? T.copper : T.cardHigh, opacity: isCurrent ? 1 : (isComplete ? 0.8 : 0.4) }} />
              <span style={{ fontFamily: font.head, fontSize: 8, letterSpacing: "0.15em", color: isCurrent ? T.copper : T.muted }}>{p}</span>
            </div>
          );
        })}
      </div>

      {/* Coach Note */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ ...s.card, borderLeft: `3px solid ${T.copper}` }}>
          <p style={{ ...s.labelCopper, fontSize: 10, marginBottom: 6 }}>COACH INTEL</p>
          <p style={{ ...s.body, color: T.cream, fontSize: 13 }}>{current.note}</p>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 12 }}>
        <button onClick={skipExercise} style={{ ...s.btnSecondary, flex: 1 }}>SKIP</button>
        <button onClick={nextExercise} style={{ ...s.btn, flex: 2 }}>NEXT EXERCISE</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════
// SCREEN: WEEKLY OPERATIONS (Flexible Scheduler)
// ═══════════════════════════════════
const WeeklyScreen = ({ onStartWorkout }) => {
  const [schedule, setSchedule] = useState({ ...DEFAULT_SCHEDULE });
  const [selectedDay, setSelectedDay] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [customSports, setCustomSports] = useState([]);
  const [showAddSport, setShowAddSport] = useState(false);
  const [newSport, setNewSport] = useState({ name: "", duration: 60, icon: "⚽" });

  const allActivities = [...ACTIVITY_LIBRARY, ...customSports];

  const getActivity = (dayKey) => {
    const actId = schedule[dayKey];
    return actId ? allActivities.find(a => a.id === actId) : null;
  };

  const assignActivity = (dayKey, activityId) => {
    setSchedule(prev => ({ ...prev, [dayKey]: activityId }));
    setShowLibrary(false);
    setSelectedDay(null);
  };

  const clearDay = (dayKey) => {
    setSchedule(prev => ({ ...prev, [dayKey]: null }));
  };

  const openLibrary = (dayKey) => {
    setSelectedDay(dayKey);
    setShowLibrary(true);
    setFilterCat("all");
    setShowAddSport(false);
  };

  const addCustomSport = () => {
    if (!newSport.name.trim()) return;
    const id = "custom_" + Date.now();
    const sport = {
      id,
      label: newSport.name.toUpperCase(),
      name: newSport.name + " Session",
      type: "outdoor",
      category: "sport",
      duration: parseInt(newSport.duration) || 60,
      icon: newSport.icon,
      description: `Custom sport: ${newSport.name} — includes agility ladder warm-up`,
      exercises: [
        { id: "a1", name: "One Step Run", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "One foot per square. Build speed gradually.", rest: 15 },
        { id: "a2", name: "Two Feet In", sets: 2, reps: "1 pass", weight: 0, type: "agility", note: "Both feet every square. Quick choppy steps.", rest: 15 },
        { id: "a3", name: "Lateral Shuffle", sets: 2, reps: "1 pass each way", weight: 0, type: "agility", note: "Side-to-side. Critical for court/field movement.", rest: 15 },
      ]
    };
    setCustomSports(prev => [...prev, sport]);
    assignActivity(selectedDay, id);
    setNewSport({ name: "", duration: 60, icon: "⚽" });
    setShowAddSport(false);
  };

  const removeCustomSport = (sportId) => {
    setCustomSports(prev => prev.filter(s => s.id !== sportId));
    setSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(day => { if (next[day] === sportId) next[day] = null; });
      return next;
    });
  };

  const sportIcons = ["⚽", "🏀", "🏐", "🏓", "🥊", "🚴", "🏃", "🧗", "⛳", "🎯", "🏑", "🤸"];

  const today = "TUE";
  const categories = [
    { id: "all", label: "ALL" },
    { id: "strength", label: "STRENGTH" },
    { id: "sport", label: "SPORT" },
    { id: "cardio", label: "CARDIO" },
    { id: "recovery", label: "RECOVERY" },
    { id: "performance", label: "PERFORMANCE" },
  ];

  const filteredLibrary = filterCat === "all"
    ? allActivities
    : allActivities.filter(a => a.category === filterCat);

  // Count stats
  const gymDays = Object.values(schedule).filter(id => {
    const act = id ? allActivities.find(a => a.id === id) : null;
    return act?.type === "gym";
  }).length;
  const sportDays = Object.values(schedule).filter(id => {
    const act = id ? allActivities.find(a => a.id === id) : null;
    return act?.type === "outdoor";
  }).length;
  const restDays = Object.values(schedule).filter(id => {
    const act = id ? allActivities.find(a => a.id === id) : null;
    return act?.type === "rest" || !id;
  }).length;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0" }}>
        <p style={s.label}>WEEKLY OPERATIONS</p>
        <h1 style={{ ...s.h1, marginTop: 8 }}>Week {PROGRAM.week} — Mar 24-30</h1>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ ...s.body, fontSize: 12, color: T.teal }}>{gymDays} gym</span>
          <span style={{ ...s.body, fontSize: 12, color: "#D4944C" }}>{sportDays} sport</span>
          <span style={{ ...s.body, fontSize: 12, color: T.success }}>{restDays} rest</span>
        </div>
      </div>

      {/* Day Selector Row */}
      <div style={{ display: "flex", gap: 6, padding: "16px 20px", overflowX: "auto" }}>
        {WEEK_DAYS.map(d => {
          const act = getActivity(d.day);
          const isToday = d.day === today;
          const hasActivity = !!act;
          const typeColor = act?.type === "gym" ? T.teal : act?.type === "outdoor" ? "#D4944C" : act?.type === "rest" ? T.success : T.cardHigh;
          return (
            <div key={d.day} onClick={() => openLibrary(d.day)} style={{
              flex: 1, minWidth: 44, textAlign: "center", padding: "8px 4px", cursor: "pointer",
              border: isToday ? `2px solid ${T.copper}` : selectedDay === d.day ? `2px solid ${T.teal}` : `1px solid ${T.cardHigh}`,
              background: hasActivity ? `${typeColor}15` : "transparent",
              transition: "all 0.2s ease"
            }}>
              <p style={{ ...s.label, fontSize: 8 }}>{d.day}</p>
              <p style={{ fontFamily: font.head, fontSize: 16, color: isToday ? T.copper : T.cream, fontWeight: 600, marginTop: 2 }}>{d.date}</p>
              {hasActivity && <div style={{ width: 6, height: 6, background: typeColor, margin: "4px auto 0" }} />}
            </div>
          );
        })}
      </div>

      {/* Schedule Cards */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={s.label}>YOUR SCHEDULE</p>
          <button onClick={() => setSchedule({ ...DEFAULT_SCHEDULE })} style={{ ...s.btnSecondary, padding: "6px 12px", fontSize: 9 }}>RESET DEFAULT</button>
        </div>

        {WEEK_DAYS.map(d => {
          const act = getActivity(d.day);
          const isToday = d.day === today;
          const isDone = d.day === "MON";
          const isEmpty = !act;
          const typeColor = act?.type === "gym" ? T.teal : act?.type === "outdoor" ? "#D4944C" : act?.type === "rest" ? T.success : T.muted;
          const typeLabel = act?.type === "gym" ? "GYM SESSION" : act?.type === "outdoor" ? "OUTDOOR RECON" : act?.type === "rest" ? "RECOVERY" : "";

          return (
            <div key={d.day} style={{
              background: T.card, marginBottom: 8, overflow: "hidden",
              borderLeft: isToday ? `3px solid ${T.copper}` : isDone ? `3px solid ${T.teal}` : isEmpty ? `3px solid ${T.cardHigh}` : `3px solid ${typeColor}`,
              opacity: isDone ? 0.6 : 1,
            }}>
              <div style={{ padding: "16px 20px" }}>
                {/* Top row: day label + status badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={s.label}>{d.day}DAY — {d.date} MAR</p>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {isDone && <span style={{ fontFamily: font.head, fontSize: 9, color: T.teal, letterSpacing: "0.1em" }}>✓ DONE</span>}
                    {isToday && <span style={{ fontFamily: font.head, fontSize: 9, color: T.copper, letterSpacing: "0.1em", background: `${T.copper}20`, padding: "2px 8px" }}>TODAY</span>}
                    {typeLabel && !isEmpty && <span style={{ fontFamily: font.head, fontSize: 9, color: typeColor, letterSpacing: "0.08em" }}>{typeLabel}</span>}
                  </div>
                </div>

                {/* Activity Content or Empty State */}
                {act ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{act.icon}</span>
                          <h2 style={{ ...s.h2, fontSize: 17 }}>{act.label}</h2>
                        </div>
                        <p style={{ ...s.body, fontSize: 11, marginTop: 4 }}>{act.name}</p>
                        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                          {act.exercises.length > 0 && <span style={{ ...s.body, fontSize: 11 }}>{act.exercises.length} exercises</span>}
                          {act.duration > 0 && <span style={{ ...s.body, fontSize: 11 }}>{act.duration} min</span>}
                          {act.type === "outdoor" && <span style={{ ...s.body, fontSize: 11 }}>Flexible timing</span>}
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {!isDone && (
                          <button onClick={(e) => { e.stopPropagation(); openLibrary(d.day); }} style={{ background: "none", border: `1px solid ${T.label}33`, color: T.label, padding: "6px 8px", cursor: "pointer", fontFamily: font.head, fontSize: 9, letterSpacing: "0.1em" }}>
                            SWAP
                          </button>
                        )}
                        {!isDone && (
                          <button onClick={(e) => { e.stopPropagation(); clearDay(d.day); }} style={{ background: "none", border: `1px solid ${T.proteinRed}33`, color: T.proteinRed, padding: "6px 8px", cursor: "pointer", fontFamily: font.head, fontSize: 14 }}>
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Start button for today */}
                    {isToday && act.type === "gym" && (
                      <button onClick={onStartWorkout} style={{ ...s.btn, marginTop: 12, padding: "12px 20px" }}>BEGIN SESSION</button>
                    )}
                    {isToday && act.type === "outdoor" && (
                      <button style={{ ...s.btnSecondary, marginTop: 12, width: "100%", padding: "10px 20px", fontSize: 11 }}>LOG AFTER SESSION</button>
                    )}
                  </div>
                ) : (
                  /* Empty Day */
                  <div onClick={() => openLibrary(d.day)} style={{ marginTop: 10, padding: "16px 0", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, border: `1px dashed ${T.label}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="plus" size={18} color={T.label} />
                    </div>
                    <div>
                      <p style={{ ...s.body, color: T.label, fontSize: 13 }}>Tap to assign activity</p>
                      <p style={{ ...s.body, fontSize: 11, marginTop: 2 }}>Rest day if left empty</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Activity Library Modal ═══ */}
      {showLibrary && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, maxWidth: 430, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", background: T.surface }}>
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.cardHigh}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={s.label}>ACTIVITY LIBRARY</p>
                <p style={{ ...s.body, marginTop: 4, fontSize: 13, color: T.cream }}>
                  Assign to <span style={{ color: T.copper, fontFamily: font.head, fontWeight: 700 }}>{selectedDay}DAY</span>
                </p>
              </div>
              <button onClick={() => { setShowLibrary(false); setSelectedDay(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                <Icon name="close" size={22} color={T.label} />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div style={{ display: "flex", gap: 0, padding: "0 20px", overflowX: "auto", borderBottom: `1px solid ${T.cardHigh}` }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{
                  fontFamily: font.head, fontSize: 10, letterSpacing: "0.1em", color: filterCat === cat.id ? T.copper : T.muted,
                  background: "none", border: "none", borderBottom: filterCat === cat.id ? `2px solid ${T.copper}` : "2px solid transparent",
                  padding: "10px 12px", cursor: "pointer", whiteSpace: "nowrap"
                }}>{cat.label}</button>
              ))}
            </div>

            {/* Activity Cards */}
            <div style={{ flex: 1, overflow: "auto", padding: "12px 20px" }}>
              {filteredLibrary.map(act => {
                const isCurrentlyAssigned = schedule[selectedDay] === act.id;
                const assignedElsewhere = Object.entries(schedule).find(([day, id]) => id === act.id && day !== selectedDay);
                const typeColor = act.type === "gym" ? T.teal : act.type === "outdoor" ? "#D4944C" : act.type === "rest" ? T.success : T.label;
                const isCustom = act.id.startsWith("custom_");

                return (
                  <div key={act.id} onClick={() => assignActivity(selectedDay, act.id)} style={{
                    background: isCurrentlyAssigned ? `${T.copper}15` : T.card,
                    borderLeft: isCurrentlyAssigned ? `3px solid ${T.copper}` : `3px solid ${typeColor}`,
                    padding: "16px 20px", marginBottom: 8, cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{act.icon}</span>
                        <div>
                          <h3 style={{ ...s.h3, fontSize: 15 }}>{act.label}</h3>
                          <p style={{ ...s.body, fontSize: 11, marginTop: 2 }}>{act.name}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontFamily: font.head, fontSize: 9, letterSpacing: "0.1em", color: typeColor }}>{act.category.toUpperCase()}</span>
                          {act.duration > 0 && <p style={{ ...s.body, fontSize: 10, marginTop: 2 }}>{act.duration} min</p>}
                        </div>
                        {isCustom && (
                          <button onClick={(e) => { e.stopPropagation(); removeCustomSport(act.id); }} style={{ background: "none", border: `1px solid ${T.proteinRed}33`, color: T.proteinRed, width: 24, height: 24, cursor: "pointer", fontFamily: font.head, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        )}
                      </div>
                    </div>
                    <p style={{ ...s.body, fontSize: 12, marginTop: 8, color: T.cream }}>{act.description}</p>
                    {isCustom && <span style={{ fontFamily: font.head, fontSize: 8, color: T.teal, letterSpacing: "0.1em", marginTop: 4, display: "inline-block" }}>CUSTOM SPORT</span>}
                    {assignedElsewhere && (
                      <p style={{ ...s.body, fontSize: 10, marginTop: 6, color: T.warning }}>
                        ⚠ Already assigned to {assignedElsewhere[0]}
                      </p>
                    )}
                    {isCurrentlyAssigned && (
                      <p style={{ ...s.labelCopper, fontSize: 9, marginTop: 8 }}>✓ CURRENTLY ASSIGNED</p>
                    )}
                  </div>
                );
              })}

              {/* ═══ Add Custom Sport ═══ */}
              {!showAddSport ? (
                <div onClick={() => setShowAddSport(true)} style={{
                  border: `1px dashed #D4944C66`, padding: "16px 20px", marginBottom: 8, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12
                }}>
                  <div style={{ width: 40, height: 40, background: `#D4944C20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="plus" size={18} color={"#D4944C"} />
                  </div>
                  <div>
                    <h3 style={{ ...s.h3, fontSize: 15, color: "#D4944C" }}>ADD NEW SPORT</h3>
                    <p style={{ ...s.body, fontSize: 11, marginTop: 2 }}>Cricket, volleyball, hiking, cycling — anything you play</p>
                  </div>
                </div>
              ) : (
                <div style={{ background: T.card, padding: 20, marginBottom: 8, borderLeft: `3px solid #D4944C` }}>
                  <p style={{ ...s.labelCopper, marginBottom: 12 }}>CREATE CUSTOM SPORT</p>

                  {/* Sport Name */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ ...s.label, fontSize: 9, marginBottom: 6 }}>SPORT NAME</p>
                    <input
                      type="text"
                      value={newSport.name}
                      onChange={(e) => setNewSport(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Cricket, Volleyball, Hiking..."
                      style={{
                        width: "100%", background: T.cardHigh, border: `1px solid ${T.label}33`,
                        color: T.cream, fontFamily: font.body, fontSize: 14, padding: "10px 12px",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* Duration */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ ...s.label, fontSize: 9, marginBottom: 6 }}>DURATION (MIN)</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {[30, 45, 60, 90, 120].map(d => (
                        <button key={d} onClick={() => setNewSport(prev => ({ ...prev, duration: d }))} style={{
                          padding: "8px 12px", background: newSport.duration === d ? T.copper : T.cardHigh,
                          border: "none", color: newSport.duration === d ? T.surface : T.cream,
                          fontFamily: font.head, fontSize: 12, cursor: "pointer", fontWeight: 600
                        }}>{d}</button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ ...s.label, fontSize: 9, marginBottom: 6 }}>ICON</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {sportIcons.map(icon => (
                        <button key={icon} onClick={() => setNewSport(prev => ({ ...prev, icon }))} style={{
                          width: 40, height: 40, fontSize: 20,
                          background: newSport.icon === icon ? T.cardHigh : "transparent",
                          border: newSport.icon === icon ? `2px solid ${T.copper}` : `1px solid ${T.cardHigh}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>{icon}</button>
                      ))}
                    </div>
                  </div>

                  {/* Note about agility */}
                  <div style={{ background: T.cardHigh, padding: 10, marginBottom: 16, borderLeft: `2px solid ${T.teal}` }}>
                    <p style={{ ...s.body, fontSize: 11, color: T.teal }}>Agility ladder warm-up (3 drills) will be auto-included before the sport session.</p>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowAddSport(false)} style={{ ...s.btnSecondary, flex: 1, padding: "10px" }}>CANCEL</button>
                    <button onClick={addCustomSport} style={{ ...s.btn, flex: 2, padding: "10px", opacity: newSport.name.trim() ? 1 : 0.4 }}>CREATE & ASSIGN</button>
                  </div>
                </div>
              )}

              {/* Clear Day Option */}
              <div onClick={() => assignActivity(selectedDay, null)} style={{
                border: `1px dashed ${T.label}44`, padding: "16px 20px", marginBottom: 8, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12
              }}>
                <span style={{ fontSize: 22 }}>🚫</span>
                <div>
                  <h3 style={{ ...s.h3, fontSize: 15 }}>CLEAR DAY</h3>
                  <p style={{ ...s.body, fontSize: 11, marginTop: 2 }}>Remove assigned activity — defaults to rest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════
// SCREEN: FUEL PROTOCOL (Nutrition) — Complete Meal Planning System
// ═══════════════════════════════════
// ── Meal Library with full macros, ingredients, recipes ──
const MEAL_LIBRARY = {
  breakfast: [
    {
      id: "b1", name: "Oats + Whey Protein", kcal: 380, protein: 36, carbs: 48, fat: 6, prep: 5,
      ingredients: ["50g rolled oats", "250ml skim milk", "1 scoop vanilla whey isolate", "5 almonds (chopped)"],
      steps: ["Cook oats with skim milk for 3-4 min", "Let cool 1 min", "Stir in whey protein scoop", "Top with chopped almonds"],
      tags: ["quick", "high-protein", "meal-prep"]
    },
    {
      id: "b2", name: "Spinach Ricotta Roll", kcal: 340, protein: 22, carbs: 32, fat: 14, prep: 15,
      ingredients: ["2 multigrain wraps", "100g ricotta cheese", "50g baby spinach", "Salt, pepper, chili flakes"],
      steps: ["Wilt spinach in a pan (1 min)", "Mix ricotta with salt, pepper, chili flakes", "Spread on wraps, add spinach", "Roll tight, slice in half"],
      tags: ["friday-special"]
    },
    {
      id: "b3", name: "Moong Dal Chilla (2 pcs)", kcal: 320, protein: 24, carbs: 36, fat: 10, prep: 20,
      ingredients: ["100g moong dal (soaked 4hrs)", "1 green chili", "1/4 onion (diced)", "Coriander, salt, turmeric"],
      steps: ["Blend soaked moong dal into smooth batter", "Add chili, onion, coriander, salt, turmeric", "Pour on hot non-stick pan like a crepe", "Cook both sides until golden, serve with mint chutney"],
      tags: ["weekend", "high-protein"]
    },
    {
      id: "b4", name: "Paneer Bhurji + 1 Roti", kcal: 410, protein: 28, carbs: 30, fat: 20, prep: 15,
      ingredients: ["100g paneer (crumbled)", "1 multigrain roti", "1/2 onion", "1 tomato", "Green chili, turmeric, cumin"],
      steps: ["Heat oil, add cumin seeds", "Sauté onion + tomato + chili until soft", "Add crumbled paneer, turmeric, salt", "Cook 3 min. Serve with roti"],
      tags: ["weekend", "high-protein"]
    },
    {
      id: "b5", name: "Egg White Omelette + Toast", kcal: 290, protein: 26, carbs: 28, fat: 8, prep: 10,
      ingredients: ["4 egg whites", "1 whole egg", "1/4 capsicum (diced)", "1 slice multigrain toast", "Salt, pepper"],
      steps: ["Whisk egg whites + 1 whole egg", "Add diced capsicum, salt, pepper", "Cook on non-stick pan both sides", "Serve with toast"],
      tags: ["weekend", "eggs"]
    },
  ],
  lunch: [
    {
      id: "l1", name: "Soya Chunks Curry + Brown Rice", kcal: 530, protein: 38, carbs: 62, fat: 12, prep: 35,
      ingredients: ["50g dry soya chunks", "150g cooked brown rice", "1/2 onion", "1 tomato", "Ginger-garlic paste, cumin, turmeric, garam masala, coriander"],
      steps: ["Soak soya chunks in hot water 10 min, squeeze dry", "Sauté onion, add ginger-garlic paste", "Add tomato, spices, cook 5 min", "Add soya chunks, 1/2 cup water, simmer 10 min", "Serve with brown rice"],
      tags: ["meal-prep", "high-protein", "batch-cook"]
    },
    {
      id: "l2", name: "Rajma Curry + Brown Rice", kcal: 510, protein: 28, carbs: 72, fat: 10, prep: 40,
      ingredients: ["1 cup cooked rajma (kidney beans)", "150g cooked brown rice", "1/2 onion", "1 tomato", "Ginger-garlic, cumin, turmeric, garam masala, kasuri methi"],
      steps: ["Sauté onion till golden, add ginger-garlic", "Add tomato, spices, cook till thick", "Add rajma + 1 cup water, simmer 15 min", "Finish with kasuri methi, serve with rice"],
      tags: ["meal-prep", "batch-cook"]
    },
    {
      id: "l3", name: "Paneer Tikka + 2 Multigrain Roti + Dal", kcal: 560, protein: 36, carbs: 52, fat: 22, prep: 30,
      ingredients: ["100g paneer (cubed)", "2 multigrain roti", "1/2 cup moong dal (cooked)", "Yogurt, tikka masala spice, lemon"],
      steps: ["Marinate paneer in yogurt + tikka spice 30 min", "Pan-fry or air-fry paneer until charred", "Cook moong dal with turmeric, cumin tadka", "Serve paneer + dal with roti"],
      tags: ["meal-prep", "high-protein"]
    },
    {
      id: "l4", name: "Chole (Chickpea Curry) + 2 Roti", kcal: 520, protein: 26, carbs: 68, fat: 14, prep: 35,
      ingredients: ["1 cup cooked chickpeas", "2 multigrain roti", "1/2 onion", "1 tomato", "Chole masala, ginger-garlic, amchur"],
      steps: ["Sauté onion, add ginger-garlic", "Add tomato + chole masala, cook 5 min", "Add chickpeas + water, simmer 15 min", "Finish with amchur and coriander"],
      tags: ["meal-prep", "batch-cook"]
    },
    {
      id: "l5", name: "Tofu Stir-Fry + Quinoa", kcal: 480, protein: 34, carbs: 48, fat: 16, prep: 25,
      ingredients: ["150g firm tofu (pressed, cubed)", "100g cooked quinoa", "1/2 capsicum", "1/2 broccoli head", "Soy sauce, sesame oil, ginger, garlic, chili"],
      steps: ["Press tofu 15 min, cube", "Stir-fry tofu in sesame oil until golden", "Add vegetables, ginger, garlic", "Add soy sauce, cook 3 min", "Serve over quinoa"],
      tags: ["meal-prep", "high-protein"]
    },
    {
      id: "l6", name: "Soya Palak (Soya + Spinach) + Rice", kcal: 490, protein: 35, carbs: 56, fat: 12, prep: 30,
      ingredients: ["50g dry soya chunks", "150g spinach (blanched, pureed)", "150g cooked brown rice", "1/2 onion, ginger-garlic, cumin, garam masala"],
      steps: ["Soak soya chunks, squeeze dry", "Blanch spinach, puree", "Sauté onion + ginger-garlic + spices", "Add soya + spinach puree, simmer 10 min", "Serve with rice"],
      tags: ["meal-prep", "high-protein", "batch-cook"]
    },
  ],
  dinner: [
    {
      id: "d1", name: "Paneer Salad Bowl", kcal: 380, protein: 28, carbs: 18, fat: 22, prep: 10,
      ingredients: ["100g paneer (cubed, pan-fried)", "Mixed greens (lettuce, cucumber, tomato)", "1/4 avocado", "Lemon-olive oil dressing, chaat masala"],
      steps: ["Pan-fry paneer cubes till golden", "Toss greens, cucumber, tomato in bowl", "Top with paneer + avocado", "Drizzle lemon-olive oil, sprinkle chaat masala"],
      tags: ["quick", "light", "high-protein"]
    },
    {
      id: "d2", name: "Moong Dal Soup + Cottage Cheese", kcal: 350, protein: 32, carbs: 30, fat: 10, prep: 15,
      ingredients: ["1/2 cup moong dal", "100g low-fat cottage cheese (paneer)", "Turmeric, cumin, ginger, lemon, coriander"],
      steps: ["Pressure cook moong dal with turmeric", "Prepare cumin-ginger tadka", "Add tadka to dal, squeeze lemon", "Serve with cubed paneer on the side"],
      tags: ["quick", "light", "high-protein"]
    },
    {
      id: "d3", name: "Egg White + Veggie Stir-Fry", kcal: 310, protein: 30, carbs: 16, fat: 14, prep: 12,
      ingredients: ["5 egg whites + 1 whole egg", "1/2 capsicum", "Mushrooms (50g)", "Onion, spinach, soy sauce"],
      steps: ["Scramble egg whites + 1 egg in pan", "Push aside, stir-fry veggies with soy sauce", "Combine and serve"],
      tags: ["quick", "light", "eggs"]
    },
    {
      id: "d4", name: "Greek Yogurt Bowl + Nuts", kcal: 320, protein: 26, carbs: 28, fat: 12, prep: 5,
      ingredients: ["200g Greek yogurt (low-fat)", "10g peanut butter", "1 tbsp honey", "10 almonds (chopped)", "Cinnamon"],
      steps: ["Scoop yogurt into bowl", "Drizzle peanut butter + honey", "Top with almonds + cinnamon", "Mix and eat"],
      tags: ["quick", "no-cook", "light"]
    },
    {
      id: "d5", name: "Soya Keema + 1 Roti", kcal: 390, protein: 32, carbs: 36, fat: 12, prep: 18,
      ingredients: ["50g soya granules (fine)", "1 multigrain roti", "1/2 onion", "1 tomato", "Peas (30g), ginger-garlic, cumin, garam masala"],
      steps: ["Soak soya granules 5 min, squeeze dry", "Sauté onion + ginger-garlic", "Add tomato + spices + peas, cook 5 min", "Add soya, cook 5 min more", "Serve with roti"],
      tags: ["quick", "high-protein"]
    },
    {
      id: "d6", name: "Chickpea Salad + Curd", kcal: 360, protein: 24, carbs: 38, fat: 12, prep: 8,
      ingredients: ["1 cup boiled chickpeas", "150g curd", "Cucumber, onion, tomato", "Chaat masala, lemon, coriander"],
      steps: ["Mix chickpeas with diced cucumber, onion, tomato", "Add chaat masala + lemon + coriander", "Serve with curd on the side"],
      tags: ["quick", "no-cook", "light"]
    },
    {
      id: "d7", name: "Paneer Wrap (High Protein)", kcal: 420, protein: 30, carbs: 32, fat: 18, prep: 12,
      ingredients: ["80g paneer (sliced)", "1 multigrain wrap", "Mixed greens", "Mint chutney, onion rings"],
      steps: ["Pan-fry paneer slices", "Warm wrap on pan", "Layer mint chutney, greens, paneer, onion", "Roll tight and slice"],
      tags: ["quick", "high-protein"]
    },
  ],
  fixed: [
    {
      id: "f1", name: "Coffee + Skim Milk", kcal: 45, protein: 3, carbs: 5, fat: 1, prep: 2, slot: "pre-fuel",
      ingredients: ["1 cup coffee", "100ml skim milk", "No sugar"], steps: ["Brew coffee, add skim milk"], tags: ["daily"]
    },
    {
      id: "f2", name: "Whey Isolate + Creatine", kcal: 140, protein: 35, carbs: 3, fat: 1, prep: 2, slot: "post-workout",
      ingredients: ["1 scoop whey isolate", "1 scoop creatine", "300ml water"], steps: ["Mix in shaker with water"], tags: ["daily"]
    },
  ],
  snacks: [
    { id: "s1", name: "Roasted Chana (50g)", kcal: 180, protein: 10, carbs: 24, fat: 4, prep: 0, tags: ["no-cook"] },
    { id: "s2", name: "Peanut Butter on Rice Cake", kcal: 160, protein: 6, carbs: 16, fat: 9, prep: 2, tags: ["quick"] },
    { id: "s3", name: "Protein Bar", kcal: 200, protein: 20, carbs: 18, fat: 8, prep: 0, tags: ["no-cook"] },
    { id: "s4", name: "Handful of Almonds (20g)", kcal: 120, protein: 4, carbs: 4, fat: 10, prep: 0, tags: ["no-cook"] },
    { id: "s5", name: "Curd + Peanuts", kcal: 190, protein: 12, carbs: 10, fat: 12, prep: 2, tags: ["quick"] },
  ]
};

// ── Default Weekly Meal Plan ──
const DEFAULT_MEAL_PLAN = {
  MON: { breakfast: "b1", lunch: "l1", dinner: "d1", snack: null },
  TUE: { breakfast: "b1", lunch: "l1", dinner: "d2", snack: null },
  WED: { breakfast: "b1", lunch: "l1", dinner: "d5", snack: null },
  THU: { breakfast: "b1", lunch: "l1", dinner: "d4", snack: "s1" },
  FRI: { breakfast: "b2", lunch: "l3", dinner: "d3", snack: null },
  SAT: { breakfast: "b3", lunch: "l4", dinner: "d7", snack: "s5" },
  SUN: { breakfast: "b4", lunch: "l5", dinner: "d6", snack: "s3" },
};

const findMeal = (id) => {
  const all = [...MEAL_LIBRARY.breakfast, ...MEAL_LIBRARY.lunch, ...MEAL_LIBRARY.dinner, ...MEAL_LIBRARY.fixed, ...MEAL_LIBRARY.snacks];
  return all.find(m => m.id === id);
};

const FuelScreen = () => {
  const [fuelTab, setFuelTab] = useState("today");
  const [mealPlan, setMealPlan] = useState({ ...DEFAULT_MEAL_PLAN });
  const [logged, setLogged] = useState({ coffee: true, breakfast: true, lunch: true, postworkout: false, dinner: false, snack: false });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [swapSlot, setSwapSlot] = useState(null); // {day, slot}
  const today = "TUE";
  const todayPlan = mealPlan[today];

  const fixedMeals = MEAL_LIBRARY.fixed;
  const todayMeals = [
    { slot: "coffee", time: "0700", label: "PRE-TRAINING FUEL", meal: fixedMeals[0], loggable: true },
    { slot: "breakfast", time: "1000", label: "BREAKFAST", meal: findMeal(todayPlan.breakfast), loggable: true },
    { slot: "lunch", time: "1300", label: "LUNCH", meal: findMeal(todayPlan.lunch), loggable: true },
    { slot: "postworkout", time: "1830", label: "POST-WORKOUT", meal: fixedMeals[1], loggable: true },
    { slot: "dinner", time: "2000", label: "DINNER", meal: findMeal(todayPlan.dinner), loggable: true },
    ...(todayPlan.snack ? [{ slot: "snack", time: "1530", label: "SNACK", meal: findMeal(todayPlan.snack), loggable: true }] : []),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const loggedMeals = todayMeals.filter(m => logged[m.slot]);
  const totalLogged = { kcal: loggedMeals.reduce((s, m) => s + (m.meal?.kcal || 0), 0), protein: loggedMeals.reduce((s, m) => s + (m.meal?.protein || 0), 0), carbs: loggedMeals.reduce((s, m) => s + (m.meal?.carbs || 0), 0), fat: loggedMeals.reduce((s, m) => s + (m.meal?.fat || 0), 0) };
  const totalPlanned = { kcal: todayMeals.reduce((s, m) => s + (m.meal?.kcal || 0), 0), protein: todayMeals.reduce((s, m) => s + (m.meal?.protein || 0), 0) };
  const targets = { kcal: 1900, protein: 145, carbs: 185, fat: 60 };

  const toggleLog = (slot) => setLogged(prev => ({ ...prev, [slot]: !prev[slot] }));

  const swapMeal = (day, slot, newMealId) => {
    setMealPlan(prev => ({ ...prev, [day]: { ...prev[day], [slot]: newMealId } }));
    setSwapSlot(null);
  };

  // Grocery list generator
  const generateGrocery = () => {
    const allIngredients = {};
    Object.values(mealPlan).forEach(dayPlan => {
      ["breakfast", "lunch", "dinner", "snack"].forEach(slot => {
        const meal = findMeal(dayPlan[slot]);
        if (meal?.ingredients) {
          meal.ingredients.forEach(ing => {
            allIngredients[ing] = (allIngredients[ing] || 0) + 1;
          });
        }
      });
    });
    // Add fixed daily items
    fixedMeals.forEach(m => m.ingredients?.forEach(ing => { allIngredients[ing] = 7; }));
    return Object.entries(allIngredients).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: "20px 20px 0" }}>
        <p style={s.labelCopper}>FUEL PROTOCOL</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "12px 20px 0", borderBottom: `1px solid ${T.cardHigh}` }}>
        {[["today", "TODAY"], ["week", "WEEK PLAN"], ["grocery", "GROCERY"]].map(([key, label]) => (
          <button key={key} onClick={() => setFuelTab(key)} style={{
            fontFamily: font.head, fontSize: 11, letterSpacing: "0.1em", color: fuelTab === key ? T.copper : T.muted,
            background: "none", border: "none", borderBottom: fuelTab === key ? `2px solid ${T.copper}` : "2px solid transparent",
            padding: "8px 16px", cursor: "pointer"
          }}>{label}</button>
        ))}
      </div>

      {/* ═══ TODAY TAB ═══ */}
      {fuelTab === "today" && (
        <div>
          {/* Macro Summary */}
          <div style={{ padding: "16px 20px 0" }}>
            <div style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={s.label}>NET CONSUMPTION</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                    <span style={{ fontFamily: font.head, fontSize: 38, fontWeight: 700, color: T.cream }}>{totalLogged.kcal}</span>
                    <span style={{ fontFamily: font.head, fontSize: 13, color: T.muted }}>/ {targets.kcal} KCAL</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ ...s.label, fontSize: 9 }}>PLANNED TOTAL</p>
                  <p style={{ fontFamily: font.head, fontSize: 14, color: T.teal, marginTop: 4 }}>{totalPlanned.kcal} kcal</p>
                  <p style={{ fontFamily: font.head, fontSize: 12, color: T.teal }}>{totalPlanned.protein}g protein</p>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <MacroBar label="PROTEIN" current={totalLogged.protein} target={targets.protein} color={T.proteinRed} showWarning={totalLogged.protein < targets.protein * 0.5} />
                <MacroBar label="CARBS" current={totalLogged.carbs} target={targets.carbs} color={T.teal} />
                <MacroBar label="FAT" current={totalLogged.fat} target={targets.fat} color={T.fatBlue} />
              </div>
            </div>
          </div>

          {/* Meal Cards */}
          <div style={{ padding: "0 20px" }}>
            <p style={{ ...s.label, marginBottom: 10 }}>MEAL MANIFEST</p>
            {todayMeals.map((item) => {
              const isLogged = logged[item.slot];
              const meal = item.meal;
              if (!meal) return null;
              return (
                <div key={item.slot} style={{ background: T.card, marginBottom: 8, borderLeft: isLogged ? `3px solid ${T.teal}` : `3px solid ${T.copper}`, opacity: isLogged ? 0.65 : 1 }}>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ ...s.labelCopper, fontSize: 9 }}>{item.time} — {item.label}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {meal.prep !== undefined && <span style={{ ...s.body, fontSize: 10 }}>{meal.prep} min</span>}
                        {isLogged && <Icon name="check" size={16} color={T.teal} />}
                      </div>
                    </div>
                    <h3 style={{ ...s.h3, marginTop: 6, fontSize: 14 }}>{meal.name}</h3>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      <span style={{ fontFamily: font.head, fontSize: 11, color: T.cream }}>{meal.kcal} kcal</span>
                      <span style={{ fontFamily: font.head, fontSize: 11, color: T.proteinRed }}>{meal.protein}g P</span>
                      <span style={{ fontFamily: font.head, fontSize: 11, color: T.teal }}>{meal.carbs}g C</span>
                      <span style={{ fontFamily: font.head, fontSize: 11, color: T.fatBlue }}>{meal.fat}g F</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      {!isLogged && <button onClick={() => toggleLog(item.slot)} style={{ ...s.btn, flex: 2, padding: "8px 12px", fontSize: 10 }}>LOG</button>}
                      {isLogged && <button onClick={() => toggleLog(item.slot)} style={{ ...s.btnSecondary, flex: 1, padding: "8px 12px", fontSize: 10 }}>UNDO</button>}
                      {meal.steps && <button onClick={() => setSelectedRecipe(meal)} style={{ ...s.btnSecondary, flex: 1, padding: "8px 12px", fontSize: 10 }}>RECIPE</button>}
                      {item.slot !== "coffee" && item.slot !== "postworkout" && (
                        <button onClick={() => setSwapSlot({ day: today, slot: item.slot })} style={{ ...s.btnSecondary, flex: 1, padding: "8px 12px", fontSize: 10 }}>SWAP</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining Gap */}
          {totalLogged.protein < targets.protein && (
            <div style={{ padding: "0 20px" }}>
              <div style={{ background: T.card, borderLeft: `3px solid ${T.proteinRed}`, padding: "14px 16px" }}>
                <p style={{ ...s.labelCopper, fontSize: 9 }}>OPERATIONAL GAP</p>
                <p style={{ ...s.h3, marginTop: 6, fontSize: 14 }}>
                  {targets.kcal - totalLogged.kcal} kcal • {targets.protein - totalLogged.protein}g protein remaining
                </p>
                <p style={{ ...s.body, fontSize: 11, marginTop: 4 }}>Log remaining meals to close the protein gap.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ WEEK PLAN TAB ═══ */}
      {fuelTab === "week" && (
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={s.label}>WEEKLY FUEL MAP</p>
            <button onClick={() => setMealPlan({ ...DEFAULT_MEAL_PLAN })} style={{ ...s.btnSecondary, padding: "4px 10px", fontSize: 9 }}>RESET</button>
          </div>
          {Object.entries(mealPlan).map(([day, plan]) => {
            const bk = findMeal(plan.breakfast);
            const ln = findMeal(plan.lunch);
            const dn = findMeal(plan.dinner);
            const sn = plan.snack ? findMeal(plan.snack) : null;
            const dayTotal = [bk, ln, dn, sn, ...fixedMeals].filter(Boolean).reduce((s, m) => ({ kcal: s.kcal + m.kcal, protein: s.protein + m.protein }), { kcal: 0, protein: 0 });
            const isToday = day === today;
            return (
              <div key={day} style={{ background: T.card, marginBottom: 8, borderLeft: isToday ? `3px solid ${T.copper}` : "none", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={s.label}>{day}DAY</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontFamily: font.head, fontSize: 11, color: T.cream }}>{dayTotal.kcal} kcal</span>
                    <span style={{ fontFamily: font.head, fontSize: 11, color: dayTotal.protein >= 140 ? T.teal : T.proteinRed }}>{dayTotal.protein}g P</span>
                  </div>
                </div>
                {[["breakfast", bk, "🌅"], ["lunch", ln, "☀️"], ["dinner", dn, "🌙"], ...(sn ? [["snack", sn, "🥜"]] : [])].map(([slot, meal, icon]) => meal && (
                  <div key={slot} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12 }}>{icon}</span>
                      <span style={{ ...s.body, fontSize: 12, color: T.cream }}>{meal.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...s.body, fontSize: 10 }}>{meal.protein}g P</span>
                      <button onClick={() => setSwapSlot({ day, slot })} style={{ background: "none", border: `1px solid ${T.label}33`, color: T.label, padding: "2px 6px", cursor: "pointer", fontFamily: font.head, fontSize: 8, letterSpacing: "0.08em" }}>SWAP</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {/* Weekly protein summary */}
          <div style={{ background: T.cardHigh, padding: 14, marginTop: 4 }}>
            <p style={s.label}>WEEKLY AVERAGE</p>
            {(() => {
              const days = Object.values(mealPlan);
              const avgP = Math.round(days.reduce((s, plan) => {
                const meals = [findMeal(plan.breakfast), findMeal(plan.lunch), findMeal(plan.dinner), plan.snack ? findMeal(plan.snack) : null, ...fixedMeals].filter(Boolean);
                return s + meals.reduce((t, m) => t + m.protein, 0);
              }, 0) / 7);
              return <p style={{ fontFamily: font.head, fontSize: 16, color: avgP >= 140 ? T.teal : T.proteinRed, marginTop: 6 }}>{avgP}g protein/day {avgP >= 140 ? "✓ ON TARGET" : "⚠ BELOW TARGET"}</p>;
            })()}
          </div>
        </div>
      )}

      {/* ═══ GROCERY TAB ═══ */}
      {fuelTab === "grocery" && (
        <div style={{ padding: "16px 20px 0" }}>
          <p style={s.label}>WEEKLY GROCERY LIST</p>
          <p style={{ ...s.body, marginTop: 4, marginBottom: 12, fontSize: 12 }}>Auto-generated from your meal plan. Shop on Sunday for the week.</p>
          {(() => {
            const items = generateGrocery();
            const categories = { "Protein": [], "Grains & Carbs": [], "Vegetables": [], "Dairy": [], "Spices & Other": [] };
            items.forEach(([ing, count]) => {
              const lower = ing.toLowerCase();
              if (lower.includes("paneer") || lower.includes("soya") || lower.includes("tofu") || lower.includes("egg") || lower.includes("rajma") || lower.includes("chickpea") || lower.includes("dal") || lower.includes("whey") || lower.includes("lentil") || lower.includes("protein")) categories["Protein"].push([ing, count]);
              else if (lower.includes("rice") || lower.includes("roti") || lower.includes("oat") || lower.includes("bread") || lower.includes("quinoa") || lower.includes("wrap")) categories["Grains & Carbs"].push([ing, count]);
              else if (lower.includes("onion") || lower.includes("tomato") || lower.includes("spinach") || lower.includes("capsicum") || lower.includes("broccoli") || lower.includes("cucumber") || lower.includes("greens") || lower.includes("mushroom") || lower.includes("peas") || lower.includes("lettuce") || lower.includes("avocado")) categories["Vegetables"].push([ing, count]);
              else if (lower.includes("milk") || lower.includes("yogurt") || lower.includes("curd") || lower.includes("ricotta") || lower.includes("cream") || lower.includes("coffee") || lower.includes("honey")) categories["Dairy"].push([ing, count]);
              else categories["Spices & Other"].push([ing, count]);
            });
            return Object.entries(categories).filter(([, items]) => items.length > 0).map(([cat, catItems]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ ...s.labelCopper, fontSize: 10, marginBottom: 8 }}>{cat.toUpperCase()}</p>
                {catItems.map(([ing, count]) => (
                  <div key={ing} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.cardHigh}` }}>
                    <span style={{ ...s.body, color: T.cream, fontSize: 13 }}>{ing}</span>
                    {count > 1 && <span style={{ ...s.body, fontSize: 11 }}>×{count} days</span>}
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      )}

      {/* ═══ Recipe Modal ═══ */}
      {selectedRecipe && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setSelectedRecipe(null)}>
          <div style={{ background: T.surface, width: "100%", maxWidth: 430, margin: "0 auto", maxHeight: "80vh", overflow: "auto", padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={s.labelCopper}>RECIPE</p>
                <h2 style={{ ...s.h2, marginTop: 6 }}>{selectedRecipe.name}</h2>
              </div>
              <button onClick={() => setSelectedRecipe(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="close" size={20} color={T.label} /></button>
            </div>
            {/* Macros */}
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {[["KCAL", selectedRecipe.kcal, T.cream], ["PROTEIN", selectedRecipe.protein + "g", T.proteinRed], ["CARBS", selectedRecipe.carbs + "g", T.teal], ["FAT", selectedRecipe.fat + "g", T.fatBlue]].map(([l, v, c]) => (
                <div key={l} style={{ flex: 1, background: T.card, padding: 10, textAlign: "center" }}>
                  <p style={{ ...s.label, fontSize: 8 }}>{l}</p>
                  <p style={{ fontFamily: font.head, fontSize: 18, color: c, fontWeight: 700, marginTop: 4 }}>{v}</p>
                </div>
              ))}
            </div>
            {selectedRecipe.prep !== undefined && <p style={{ ...s.body, marginTop: 12 }}>⏱ Prep time: {selectedRecipe.prep} min</p>}
            {/* Ingredients */}
            <p style={{ ...s.labelCopper, marginTop: 16, marginBottom: 8 }}>INGREDIENTS</p>
            {selectedRecipe.ingredients?.map((ing, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <div style={{ width: 6, height: 6, background: T.copper }} />
                <span style={{ ...s.body, color: T.cream, fontSize: 13 }}>{ing}</span>
              </div>
            ))}
            {/* Steps */}
            <p style={{ ...s.labelCopper, marginTop: 16, marginBottom: 8 }}>METHOD</p>
            {selectedRecipe.steps?.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0" }}>
                <span style={{ fontFamily: font.head, fontSize: 14, color: T.copper, fontWeight: 700, minWidth: 20 }}>{i + 1}</span>
                <span style={{ ...s.body, color: T.cream, fontSize: 13 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Swap Meal Modal ═══ */}
      {swapSlot && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, maxWidth: 430, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", background: T.surface }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.cardHigh}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={s.label}>SWAP MEAL</p>
                <p style={{ ...s.body, marginTop: 4, fontSize: 12, color: T.cream }}>
                  {swapSlot.day}DAY — <span style={{ color: T.copper }}>{swapSlot.slot.toUpperCase()}</span>
                </p>
              </div>
              <button onClick={() => setSwapSlot(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="close" size={20} color={T.label} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "12px 20px" }}>
              {(swapSlot.slot === "breakfast" ? MEAL_LIBRARY.breakfast : swapSlot.slot === "lunch" ? MEAL_LIBRARY.lunch : swapSlot.slot === "dinner" ? MEAL_LIBRARY.dinner : MEAL_LIBRARY.snacks).map(meal => {
                const isCurrent = mealPlan[swapSlot.day]?.[swapSlot.slot] === meal.id;
                return (
                  <div key={meal.id} onClick={() => swapMeal(swapSlot.day, swapSlot.slot, meal.id)} style={{
                    background: isCurrent ? `${T.copper}15` : T.card, borderLeft: isCurrent ? `3px solid ${T.copper}` : `3px solid ${T.cardHigh}`,
                    padding: "14px 16px", marginBottom: 8, cursor: "pointer"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ ...s.h3, fontSize: 14 }}>{meal.name}</h3>
                      <span style={{ fontFamily: font.head, fontSize: 11, color: T.proteinRed }}>{meal.protein}g P</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <span style={{ ...s.body, fontSize: 11 }}>{meal.kcal} kcal</span>
                      <span style={{ ...s.body, fontSize: 11 }}>{meal.carbs}g C</span>
                      <span style={{ ...s.body, fontSize: 11 }}>{meal.fat}g F</span>
                      {meal.prep !== undefined && <span style={{ ...s.body, fontSize: 11 }}>⏱ {meal.prep} min</span>}
                    </div>
                    {isCurrent && <p style={{ ...s.labelCopper, fontSize: 9, marginTop: 6 }}>✓ CURRENT</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════
// SCREEN: INTEL (Progress)
// ═══════════════════════════════════
const IntelScreen = () => {
  const [tab, setTab] = useState("body");
  const weights = [78, 77.8, 77.5, 77.2, 76.9, 76.8, 76.5, 76.2];
  const maxW = Math.max(...weights);
  const minW = Math.min(...weights);
  const range = maxW - minW || 1;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: "20px 20px 0" }}>
        <p style={s.label}>PERFORMANCE ANALYTICS</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "16px 20px 0", gap: 0, borderBottom: `1px solid ${T.cardHigh}` }}>
        {[["body", "BODY METRICS"], ["strength", "STRENGTH"], ["legs", "LEGS & RECON"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            fontFamily: font.head, fontSize: 11, letterSpacing: "0.1em", color: tab === key ? T.copper : T.muted,
            background: "none", border: "none", borderBottom: tab === key ? `2px solid ${T.copper}` : "2px solid transparent",
            padding: "8px 16px", cursor: "pointer"
          }}>{label}</button>
        ))}
      </div>

      {tab === "body" && (
        <div style={{ padding: "20px 20px 0" }}>
          <div style={s.card}>
            <p style={s.label}>BIOMETRIC FEED: WEIGHT</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
              <span style={{ fontFamily: font.head, fontSize: 42, fontWeight: 700, color: T.cream }}>{weights[weights.length - 1]}<span style={{ fontSize: 16, color: T.muted }}>KG</span></span>
              <span style={{ fontFamily: font.head, fontSize: 13, color: T.teal }}>-{(weights[0] - weights[weights.length - 1]).toFixed(1)}KG Δ</span>
            </div>
            {/* Simple Chart */}
            <svg width="100%" height="100" viewBox="0 0 380 100" style={{ marginTop: 16 }}>
              <rect width="380" height="100" fill={T.cardHigh} rx="0" />
              {weights.map((w, i) => {
                const x = (i / (weights.length - 1)) * 360 + 10;
                const y = 90 - ((w - minW) / range) * 70;
                return i > 0 ? (
                  <line key={i} x1={(((i - 1) / (weights.length - 1)) * 360 + 10)} y1={90 - ((weights[i - 1] - minW) / range) * 70} x2={x} y2={y} stroke={T.teal} strokeWidth="2" />
                ) : null;
              })}
              {weights.map((w, i) => {
                const x = (i / (weights.length - 1)) * 360 + 10;
                const y = 90 - ((w - minW) / range) * 70;
                return <circle key={i} cx={x} cy={y} r="3" fill={T.teal} />;
              })}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {weights.map((_, i) => <span key={i} style={{ ...s.label, fontSize: 8 }}>WK {String(i + 1).padStart(2, "0")}</span>)}
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "flex", gap: 12, marginTop: 0 }}>
            <div style={{ ...s.card, flex: 1 }}>
              <p style={{ ...s.label, fontSize: 9 }}>BODY FAT</p>
              <span style={{ fontFamily: font.head, fontSize: 24, fontWeight: 700, color: T.cream }}>24.5%</span>
              <span style={{ fontFamily: font.head, fontSize: 11, color: T.teal }}> ↓TRACKING</span>
            </div>
            <div style={{ ...s.card, flex: 1 }}>
              <p style={{ ...s.label, fontSize: 9 }}>LEAN MASS</p>
              <span style={{ fontFamily: font.head, fontSize: 24, fontWeight: 700, color: T.cream }}>56.5<span style={{ fontSize: 12 }}>KG</span></span>
              <span style={{ fontFamily: font.head, fontSize: 11, color: T.teal }}> →STABLE</span>
            </div>
          </div>

          {/* Evolt Scan */}
          <div style={{ background: T.copper, padding: 20, marginTop: 0 }}>
            <p style={{ fontFamily: font.head, fontSize: 11, letterSpacing: "0.12em", color: T.surface }}>NEXT EVOLT SCAN SEQUENCE</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: font.head, fontSize: 42, fontWeight: 700, color: T.surface }}>42</span>
              <span style={{ fontFamily: font.head, fontSize: 16, color: T.surface }}>DAYS — APRIL 28</span>
            </div>
          </div>
        </div>
      )}

      {tab === "legs" && (
        <div style={{ padding: "20px 20px 0" }}>
          <p style={{ ...s.label, marginBottom: 16 }}>LEGS & RECON DATASET</p>
          {[
            { label: "SINGLE-LEG HOLD", data: "R: 15s → 28s   L: 22s → 35s" },
            { label: "BOX JUMP HEIGHT", data: "20cm → 35cm" },
            { label: "AGILITY LADDER TIME", data: "45s → 32s" },
          ].map(item => (
            <div key={item.label} style={{ ...s.card, marginBottom: 8 }}>
              <p style={s.label}>{item.label}</p>
              <p style={{ fontFamily: font.head, fontSize: 18, color: T.teal, marginTop: 6 }}>{item.data}</p>
            </div>
          ))}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={s.label}>JUMP CONFIDENCE</p>
              <span style={{ fontFamily: font.head, fontSize: 16, color: T.copper }}>LEVEL 07<span style={{ color: T.muted }}>/10</span></span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 6, background: i < 7 ? T.teal : T.cardHigh }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "strength" && (
        <div style={{ padding: "20px 20px 0" }}>
          <p style={{ ...s.label, marginBottom: 16 }}>STRENGTH PROGRESSION</p>
          {[
            { name: "DB Bench Press", from: "14kg × 8", to: "18kg × 10" },
            { name: "Leg Press", from: "40kg × 10", to: "60kg × 12" },
            { name: "Lat Pulldown", from: "30kg × 8", to: "37.5kg × 10" },
            { name: "Hip Thrust", from: "20kg × 10", to: "40kg × 12" },
            { name: "Barbell Squat", from: "20kg × 6", to: "30kg × 8" },
          ].map(item => (
            <div key={item.name} style={{ ...s.card, marginBottom: 8 }}>
              <p style={s.label}>{item.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                <span style={{ fontFamily: font.head, fontSize: 14, color: T.muted }}>{item.from}</span>
                <span style={{ color: T.copper }}>»</span>
                <span style={{ fontFamily: font.head, fontSize: 18, color: T.teal, fontWeight: 700 }}>{item.to}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════
// MAIN APP
// ═══════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("command");
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, done

  // Auto-reset sync status
  useEffect(() => {
    if (syncStatus === "syncing") {
      const t = setTimeout(() => { setSyncStatus("done"); setLastSync(new Date().toLocaleTimeString()); }, 1500);
      return () => clearTimeout(t);
    }
  }, [syncStatus]);

  const startWorkout = () => setActiveWorkout(true);
  const endWorkout = () => setActiveWorkout(false);

  if (activeWorkout) {
    return (
      <div style={s.app}>
        <WorkoutScreen onBack={endWorkout} />
      </div>
    );
  }

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ paddingBottom: 60, minHeight: "calc(100vh - 60px)" }}>
        {screen === "command" && <CommandScreen onStartWorkout={startWorkout} />}
        {screen === "train" && <WeeklyScreen onStartWorkout={startWorkout} />}
        {screen === "fuel" && <FuelScreen />}
        {screen === "intel" && <IntelScreen />}
        {screen === "profile" && (
          <div style={{ padding: 20, paddingBottom: 80 }}>
            <p style={s.labelCopper}>OPERATIVE PROFILE</p>
            <h1 style={{ ...s.h1, marginTop: 12 }}>Snehal</h1>

            {/* ── Google Drive Connection ── */}
            <div style={{ ...s.card, marginTop: 20, borderLeft: `3px solid ${googleConnected ? T.teal : T.copper}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={s.label}>DATA STORAGE</p>
                  <p style={{ fontFamily: font.head, fontSize: 14, color: googleConnected ? T.teal : T.copper, marginTop: 6 }}>
                    {googleConnected ? "● GOOGLE DRIVE CONNECTED" : "○ NOT CONNECTED"}
                  </p>
                </div>
                <div style={{ width: 40, height: 40, background: T.cardHigh, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 19.5h20L12 2z" fill="none" stroke={googleConnected ? T.teal : T.muted} strokeWidth="1.5" />
                    <path d="M12 2l8.5 14.25H3.5L12 2z" fill="none" stroke={googleConnected ? T.teal : T.muted} strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              {googleConnected ? (
                <div style={{ marginTop: 12 }}>
                  <p style={{ ...s.body, fontSize: 12, color: T.cream }}>Syncing to: <span style={{ color: T.teal }}>FORGE_Data</span> in Google Drive</p>
                  <p style={{ ...s.body, fontSize: 11, marginTop: 4 }}>Last sync: {lastSync || "Just now"}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => setSyncStatus("syncing")} style={{ ...s.btnSecondary, flex: 1, padding: "8px", fontSize: 10 }}>FORCE SYNC</button>
                    <button onClick={() => setGoogleConnected(false)} style={{ ...s.btnSecondary, flex: 1, padding: "8px", fontSize: 10, borderColor: `${T.proteinRed}33`, color: T.proteinRed }}>DISCONNECT</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <p style={{ ...s.body, fontSize: 12 }}>Connect your Google account to save all workout logs, meal tracking, and body metrics to your personal Google Drive.</p>
                  <button onClick={() => { setGoogleConnected(true); setLastSync(new Date().toLocaleTimeString()); }} style={{ ...s.btn, marginTop: 12 }}>
                    CONNECT GOOGLE DRIVE
                  </button>
                  <p style={{ ...s.body, fontSize: 10, marginTop: 8, color: T.label }}>Your data stays in YOUR Drive. FORGE can only access files it creates.</p>
                </div>
              )}
            </div>

            {/* ── Sync Status ── */}
            {googleConnected && (
              <div style={s.card}>
                <p style={s.label}>SYNC STATUS</p>
                <div style={{ marginTop: 10 }}>
                  {[
                    ["Workouts", syncStatus === "syncing" ? "Syncing..." : "Up to date", T.teal],
                    ["Nutrition", syncStatus === "syncing" ? "Syncing..." : "Up to date", T.teal],
                    ["Body Metrics", "1 entry", T.teal],
                    ["Schedule", "Week 3 saved", T.teal],
                  ].map(([name, status, color]) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.cardHigh}` }}>
                      <span style={{ ...s.body, color: T.cream, fontSize: 13 }}>{name}</span>
                      <span style={{ fontFamily: font.head, fontSize: 10, color, letterSpacing: "0.08em" }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Biometrics ── */}
            <div style={s.card}>
              <p style={s.label}>BIOMETRICS (EVOLT SCAN — JAN 7, 2026)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                {[["Height", "171 cm"], ["Weight", "~78 kg"], ["Age", "27"], ["Body Fat", "24.5%"], ["BMR", "1,590 kcal"], ["TEE", "2,448 kcal"], ["Lean Mass", "56.5 kg"], ["Bio Age", "29"]].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ ...s.label, fontSize: 9 }}>{k}</p>
                    <p style={{ fontFamily: font.head, fontSize: 16, color: T.cream, marginTop: 4 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Targets ── */}
            <div style={s.card}>
              <p style={s.label}>DAILY TARGETS</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                {[["Calories", "1,850-1,950 kcal"], ["Protein", "140-155g"], ["Carbs", "170-200g"], ["Fat", "55-65g"]].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ ...s.label, fontSize: 9 }}>{k}</p>
                    <p style={{ fontFamily: font.head, fontSize: 14, color: T.teal, marginTop: 4 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Supplements ── */}
            <div style={s.card}>
              <p style={s.label}>SUPPLEMENT PROTOCOL</p>
              <div style={{ marginTop: 8 }}>
                {[
                  ["Whey Protein Isolate", "35g protein/scoop — post-workout"],
                  ["Creatine Monohydrate", "5g daily — with post-workout shake"],
                  ["Multivitamin + Omega-3", "1 daily — with breakfast"],
                ].map(([name, detail]) => (
                  <div key={name} style={{ padding: "8px 0", borderBottom: `1px solid ${T.cardHigh}` }}>
                    <p style={{ ...s.body, color: T.cream, fontSize: 13 }}>{name}</p>
                    <p style={{ ...s.body, fontSize: 11, marginTop: 2 }}>{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Conditions ── */}
            <div style={s.card}>
              <p style={s.label}>CONDITIONS & NOTES</p>
              <div style={{ marginTop: 8 }}>
                {[
                  "Overpronation (bilateral) — corrective warm-up every session",
                  "Right-leg balance deficit — single-leg progressions prioritised",
                  "Post-injury gait pattern (2010 recovery) — jump confidence program active",
                  "Knee valgus tendency under load — banded squats, heel elevation",
                ].map((note, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0" }}>
                    <div style={{ width: 4, height: 4, background: T.copper, marginTop: 6, flexShrink: 0 }} />
                    <p style={{ ...s.body, color: T.cream, fontSize: 12 }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── App Info ── */}
            <div style={{ textAlign: "center", marginTop: 20, padding: "16px 0" }}>
              <p style={{ fontFamily: font.head, fontSize: 13, color: T.copper, letterSpacing: "0.2em" }}>FORGE</p>
              <p style={{ ...s.body, fontSize: 11, marginTop: 4 }}>v3.0 — Tactical Fitness Command System</p>
              <p style={{ ...s.body, fontSize: 10, marginTop: 2 }}>Built for Snehal • Week {PROGRAM.week} of {PROGRAM.totalWeeks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        {[
          ["command", "home", "COMMAND"],
          ["train", "train", "TRAIN"],
          ["fuel", "fuel", "FUEL"],
          ["intel", "intel", "INTEL"],
          ["profile", "profile", "PROFILE"]
        ].map(([key, icon, label]) => (
          <button key={key} style={s.tab(screen === key)} onClick={() => setScreen(key)}>
            <Icon name={icon} size={20} color={screen === key ? T.copper : T.muted} />
            <span style={s.tabLabel(screen === key)}>{label}</span>
            {screen === key && <div style={{ width: 4, height: 4, background: T.copper, marginTop: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}