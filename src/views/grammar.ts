import type { Unit } from "../types";
import { grammarQuestions } from "../questions";
import { runQuestions } from "../runner";
import { completeStep, stepScore } from "../store";
import { h, listenBtn, speakable, stars, topbar } from "../ui";

export function grammarListView(app: HTMLElement, unit: Unit) {
  app.replaceChildren(
    h(
      "div",
      { class: "page" },
      topbar("Grammar", `#/u/${unit.unit}`),
      h(
        "div",
        { class: "steps" },
        ...unit.grammar.map((g, i) => {
          const sc = stepScore(unit.unit, `grammar:${g.id}`);
          return h(
            "a",
            { class: `step${sc !== undefined ? " done" : ""}`, href: `#/u/${unit.unit}/grammar/${g.id}` },
            h("span", { class: "step-num" }, sc !== undefined ? "✔" : String(i + 1)),
            h("span", { class: "step-emoji" }, g.emoji),
            h("span", { class: "step-label" }, g.title),
            h("span", { class: "step-stars" }, stars(sc)),
          );
        }),
      ),
    ),
  );
}

/** Short explanation → examples → practice (SPEC §8). */
export function grammarTopicView(app: HTMLElement, unit: Unit, id: string, practise: boolean) {
  const g = unit.grammar.find((x) => x.id === id);
  if (!g) return grammarListView(app, unit);
  const back = `#/u/${unit.unit}/grammar`;
  if (practise) {
    runQuestions(app, grammarQuestions(unit, g), { title: g.title, back, onFinish: (s) => completeStep(unit.unit, `grammar:${g.id}`, s) });
    return;
  }
  app.replaceChildren(
    h(
      "div",
      { class: "page" },
      topbar(g.title, back),
      h("section", { class: "rule" }, h("div", { class: "rule-emoji" }, g.emoji), ...g.explain.map((e) => h("p", {}, speakable(e))), listenBtn(g.explain.join(" "), "Listen")),
      h("h3", { class: "section-title" }, "Examples"),
      h("div", { class: "examples" }, ...g.examples.map((e) => h("div", { class: "example-row" }, h("p", {}, speakable(e)), listenBtn(e, "", true)))),
      h("div", { class: "row" }, h("a", { class: "btn primary", href: `#/u/${unit.unit}/grammar/${g.id}/practise` }, "Let's practise ➜")),
    ),
  );
}
