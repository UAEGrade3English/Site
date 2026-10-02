import type { Unit } from "../types";
import { spellingPractice, unitQuiz, vocabPractice } from "../questions";
import { runQuestions } from "../runner";
import { completeStep, stepScore } from "../store";
import { asset, h, stars, topbar } from "../ui";

export const STEPS = [
  { id: "words", label: "Learn the words", emoji: "📖" },
  { id: "practice", label: "Word practice", emoji: "🎯" },
  { id: "sentences", label: "Sentences", emoji: "💬" },
  { id: "grammar", label: "Grammar", emoji: "✏️" },
  { id: "reading", label: "Reading", emoji: "📚" },
  { id: "spelling", label: "Spelling", emoji: "🔤" },
  { id: "games", label: "Games", emoji: "🎮" },
  { id: "quiz", label: "Unit quiz", emoji: "🏆" },
] as const;
export const STEP_IDS: string[] = STEPS.map((s) => s.id);

/** Grammar's score is the average of its topics. */
export function grammarScore(unit: Unit): number | undefined {
  const sc = unit.grammar.map((g) => stepScore(unit.unit, `grammar:${g.id}`));
  if (sc.every((x) => x === undefined)) return undefined;
  return Math.round(sc.reduce<number>((a, b) => a + (b ?? 0), 0) / unit.grammar.length);
}

export function scoreOf(unit: Unit, id: string) {
  return id === "grammar" ? grammarScore(unit) : stepScore(unit.unit, id);
}

export function unitPercent(unit: Unit): number {
  return Math.round(STEPS.reduce((a, s) => a + (scoreOf(unit, s.id) ?? 0), 0) / STEPS.length);
}

export function unitView(app: HTMLElement, unit: Unit) {
  const pct = unitPercent(unit);
  // Suggest the first step not yet done.
  const nextStep = STEPS.find((s) => scoreOf(unit, s.id) === undefined)?.id;
  app.replaceChildren(
    h(
      "div",
      { class: "page" },
      topbar(`Unit ${unit.unit}`, "#/"),
      h(
        "section",
        { class: "unit-hero" },
        unit.cover ? h("img", { src: asset(unit.cover), alt: "" }) : h("div", { class: "hero-emoji" }, unit.emoji),
        h("div", {}, h("h2", {}, unit.title), h("p", { class: "sub" }, unit.bookPages), h("div", { class: "meter" }, h("div", { class: "meter-fill", style: `width:${pct}%` })), h("p", { class: "sub" }, `${pct}% complete`)),
      ),
      h(
        "div",
        { class: "steps" },
        ...STEPS.map((s, i) => {
          const sc = scoreOf(unit, s.id);
          return h(
            "a",
            { class: `step${sc !== undefined ? " done" : ""}${s.id === nextStep ? " next" : ""}`, href: `#/u/${unit.unit}/${s.id}` },
            h("span", { class: "step-num" }, sc !== undefined ? "✔" : String(i + 1)),
            h("span", { class: "step-emoji" }, s.emoji),
            h("span", { class: "step-label" }, s.label),
            h("span", { class: "step-stars" }, sc !== undefined ? stars(sc) : s.id === nextStep ? "Start ➜" : ""),
          );
        }),
      ),
      h("details", { class: "objectives" }, h("summary", {}, "What I'm learning"), h("ul", {}, ...unit.objectives.map((o) => h("li", {}, o)))),
    ),
  );
}

const back = (unit: Unit) => `#/u/${unit.unit}`;

export function practiceView(app: HTMLElement, unit: Unit) {
  runQuestions(app, vocabPractice(unit), { title: "Word practice", back: back(unit), onFinish: (s) => completeStep(unit.unit, "practice", s) });
}

export function spellingView(app: HTMLElement, unit: Unit) {
  runQuestions(app, spellingPractice(unit), { title: "Spelling", back: back(unit), onFinish: (s) => completeStep(unit.unit, "spelling", s) });
}

export function quizView(app: HTMLElement, unit: Unit) {
  runQuestions(app, unitQuiz(unit), { title: "Unit quiz", back: back(unit), retry: false, onFinish: (s) => completeStep(unit.unit, "quiz", s) });
}
