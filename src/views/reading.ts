import type { Unit } from "../types";
import { readingQuestions } from "../questions";
import { runQuestions } from "../runner";
import { completeStep } from "../store";
import { asset, h, listenBtn, speakable, topbar } from "../ui";

export function readingView(app: HTMLElement, unit: Unit, questions: boolean) {
  const back = `#/u/${unit.unit}/reading`;
  if (questions) {
    runQuestions(app, readingQuestions(unit), { title: "Reading questions", back, onFinish: (s) => completeStep(unit.unit, "reading", s) });
    return;
  }
  const texts = unit.reading.map((r) =>
    h(
      "article",
      { class: "story" },
      h("div", { class: "story-head" }, r.image ? h("img", { src: asset(r.image), alt: "" }) : null, h("h2", {}, r.title), listenBtn([r.title, ...r.paragraphs].join(" "), "Read to me")),
      ...r.paragraphs.map((p) => h("div", { class: "para" }, h("p", {}, speakable(p)), listenBtn(p, "", true))),
    ),
  );
  app.replaceChildren(
    h(
      "div",
      { class: "page" },
      topbar("Reading", `#/u/${unit.unit}`),
      h("p", { class: "tip" }, "Read the story. Tap a word you don't know to hear it."),
      ...texts,
      h("div", { class: "row" }, h("a", { class: "btn primary", href: `${back}/questions` }, "Answer the questions ➜")),
    ),
  );
}
