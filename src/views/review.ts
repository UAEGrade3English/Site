import type { Question } from "../types";
import { getUnit } from "../data";
import { dictation, grammarQuestions, listenChoose, meaningChoose, missingLetters, pictureChoose, readingQuestions, sentenceOrder } from "../questions";
import { runQuestions } from "../runner";
import { childName, weakItems } from "../store";
import { h, pick, topbar } from "../ui";

/** Builds fresh questions for the weakest items (SPEC §11). */
export function reviewQuestions(limit = 10): Question[] {
  const qs: Question[] = [];
  for (const [key, m] of weakItems().slice(0, limit)) {
    const unit = getUnit(m.unit);
    if (!unit) continue;
    const [, kind, id] = key.split(":");
    if (kind === "w") {
      const v = unit.vocabulary.find((x) => x.word === id);
      if (!v) continue;
      const makers = [listenChoose, meaningChoose, missingLetters, dictation, ...(v.image || v.emoji ? [pictureChoose] : [])];
      qs.push(...pick(makers, 2).map((f) => f(unit, v)));
    } else if (kind === "g") {
      const g = unit.grammar.find((x) => x.id === id);
      if (g) qs.push(...pick(grammarQuestions(unit, g), 2));
    } else if (kind === "s") {
      const s = unit.sentences[Number(id)];
      if (s) qs.push(sentenceOrder(unit, s, Number(id)));
    } else if (kind === "r") {
      qs.push(...pick(readingQuestions(unit).filter((q) => q.key === key), 2));
    }
  }
  return qs;
}

export function reviewView(app: HTMLElement) {
  const qs = reviewQuestions();
  if (!qs.length) {
    app.replaceChildren(
      h("div", { class: "page" }, topbar("Tricky words", "#/"), h("div", { class: "finish" }, h("div", { class: "big-stars" }, "🎉"), h("h2", {}, `Nothing to review, ${childName()}!`), h("p", {}, "You know all your words. Keep going!"), h("a", { class: "btn primary", href: "#/" }, "Home"))),
    );
    return;
  }
  runQuestions(app, qs, { title: "Tricky words", back: "#/" });
}
