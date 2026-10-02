import type { Skill } from "./types";

/** Everything is kept in this browser's localStorage (see SPEC §12). */
const KEY = "g3e.v1";

export interface MasteryItem {
  correct: number;
  incorrect: number;
  mastery: number; // 0..1
  lastReviewed: string; // YYYY-MM-DD
  label: string; // what to show the parent, e.g. "shoes" or "This is / These are"
  unit: number;
}

export interface QuizResult {
  date: string;
  unit: number;
  step: string;
  score: number; // 0..100
}

export interface Settings {
  childName: string;
  voiceURI: string;
  rate: number;
  speakPraise: boolean;
  pin: string;
}

interface State {
  settings: Settings;
  steps: Record<string, number>; // "4:quiz" -> best score 0..100
  mastery: Record<string, MasteryItem>;
  skills: Record<Skill, { correct: number; total: number }>;
  week: Record<string, Record<Skill, { correct: number; total: number }>>; // ISO week -> skills
  results: QuizResult[];
  days: string[]; // dates with activity
  masteredOn: Record<string, string>; // key -> date first mastered
}

const emptySkills = (): State["skills"] => ({
  vocabulary: { correct: 0, total: 0 },
  spelling: { correct: 0, total: 0 },
  grammar: { correct: 0, total: 0 },
  reading: { correct: 0, total: 0 },
  listening: { correct: 0, total: 0 },
});

function fresh(): State {
  return {
    settings: { childName: "Zahraa", voiceURI: "", rate: 0.9, speakPraise: true, pin: "" },
    steps: {},
    mastery: {},
    skills: emptySkills(),
    week: {},
    results: [],
    days: [],
    masteredOn: {},
  };
}

let state: State = load();

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<State>;
      const f = fresh();
      return { ...f, ...s, settings: { ...f.settings, ...s.settings }, skills: { ...f.skills, ...s.skills } };
    }
  } catch {
    /* storage unavailable: run without saving */
  }
  return fresh();
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function weekKey(d = new Date()): string {
  // Week starting Sunday (UAE school week)
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
}

export const settings = () => state.settings;
export function updateSettings(p: Partial<Settings>) {
  state.settings = { ...state.settings, ...p };
  save();
}

export const childName = () => state.settings.childName || "Zahraa";

/** Record one answer (first attempt only) for mastery and skill stats. */
export function recordAnswer(key: string, label: string, unit: number, skill: Skill, ok: boolean) {
  const d = today();
  const m = state.mastery[key] ?? { correct: 0, incorrect: 0, mastery: 0, lastReviewed: d, label, unit };
  if (ok) m.correct++;
  else m.incorrect++;
  // Moving average: recent answers matter most.
  m.mastery = Math.round((m.mastery + 0.34 * ((ok ? 1 : 0) - m.mastery)) * 100) / 100;
  m.lastReviewed = d;
  m.label = label;
  state.mastery[key] = m;
  if (isMastered(m) && !state.masteredOn[key]) state.masteredOn[key] = d;
  if (!isMastered(m) && state.masteredOn[key]) delete state.masteredOn[key];

  state.skills[skill].total++;
  if (ok) state.skills[skill].correct++;
  const wk = (state.week[weekKey()] ??= emptySkills());
  wk[skill].total++;
  if (ok) wk[skill].correct++;

  if (!state.days.includes(d)) state.days.push(d);
  save();
}

export const isMastered = (m: MasteryItem) => m.mastery >= 0.75 && m.correct >= 2;

export function stepScore(unit: number, step: string): number | undefined {
  return state.steps[`${unit}:${step}`];
}

export function completeStep(unit: number, step: string, score: number) {
  const k = `${unit}:${step}`;
  state.steps[k] = Math.max(state.steps[k] ?? 0, Math.round(score));
  state.results.unshift({ date: today(), unit, step, score: Math.round(score) });
  state.results = state.results.slice(0, 60);
  if (!state.days.includes(today())) state.days.push(today());
  save();
}

export const mastery = () => state.mastery;
export const skills = () => state.skills;
export const thisWeek = () => state.week[weekKey()] ?? emptySkills();
export const results = () => state.results;

export function masteredToday(): number {
  const d = today();
  return Object.values(state.masteredOn).filter((x) => x === d).length;
}

export function streak(): number {
  const set = new Set(state.days);
  let n = 0;
  const d = new Date();
  if (!set.has(today())) d.setDate(d.getDate() - 1); // streak still alive until tonight
  for (;;) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!set.has(k)) return n;
    n++;
    d.setDate(d.getDate() - 1);
  }
}

export const lastActive = () => state.days[state.days.length - 1];

/** Keys that need more practice, weakest and oldest first. */
export function weakItems(unit?: number): [string, MasteryItem][] {
  const now = Date.now();
  return Object.entries(state.mastery)
    .filter(([, m]) => m.incorrect > 0 && !isMastered(m) && (unit === undefined || m.unit === unit))
    .map(([k, m]) => {
      const days = (now - new Date(m.lastReviewed).getTime()) / 864e5;
      return [k, m, 1 - m.mastery + Math.min(days, 14) * 0.03] as const;
    })
    .sort((a, b) => b[2] - a[2])
    .map(([k, m]) => [k, m]);
}

export function resetProgress() {
  const keep = state.settings;
  state = fresh();
  state.settings = keep;
  save();
}
