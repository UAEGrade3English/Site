import type { Question, Unit } from "../types";
import { sentenceKey, sentenceOrder } from "../questions";
import { runQuestions } from "../runner";
import { completeStep } from "../store";
import { h, listenBtn, pick, picture, shuffle, speakable, topbar } from "../ui";

/** Missing-word question built from a target sentence. */
function missingWord(unit: Unit, text: string, i: number): Question | null {
  const words = text.split(" ");
  const vocab = unit.vocabulary.map((v) => v.word.toLowerCase());
  const idx = words.findIndex((w) => vocab.includes(w.replace(/[^A-Za-z'-]/g, "").toLowerCase()));
  if (idx < 0) return null;
  const answer = words[idx].replace(/[^A-Za-z'-]/g, "");
  const wrong = pick(unit.vocabulary.map((v) => v.word).filter((w) => w.toLowerCase() !== answer.toLowerCase()), 2);
  const prompt = words.map((w, k) => (k === idx ? w.replace(answer, "_____") : w)).join(" ");
  return { key: sentenceKey(unit.unit, i), label: text, unit: unit.unit, skill: "vocabulary", kind: "choice", prompt, say: text, choices: shuffle([answer, ...wrong]), answer, explain: text };
}

export function sentencesView(app: HTMLElement, unit: Unit) {
  let hidden = false;
  const list = h("div", { class: "sentence-list" });
  const draw = () =>
    list.replaceChildren(
      ...unit.sentences.map((s) =>
        h("div", { class: `sentence${hidden ? " hidden" : ""}` }, picture(s, "s-pic"), h("p", { class: "s-text" }, hidden ? "• • • • •" : speakable(s.text)), listenBtn(s.text, "", true)),
      ),
    );
  draw();

  const toggle = h("button", { class: "btn" }, "🙈 Hide sentences");
  toggle.addEventListener("click", () => {
    hidden = !hidden;
    toggle.textContent = hidden ? "👀 Show sentences" : "🙈 Hide sentences";
    draw();
  });

  const practise = () => {
    const qs: Question[] = [];
    unit.sentences.forEach((s, i) => {
      const q = i % 2 === 0 ? sentenceOrder(unit, s, i) : missingWord(unit, s.text, i) ?? sentenceOrder(unit, s, i);
      qs.push(q);
    });
    runQuestions(app, shuffle(qs), { title: "Sentences", back: `#/u/${unit.unit}/sentences`, onFinish: (sc) => completeStep(unit.unit, "sentences", sc) });
  };

  app.replaceChildren(
    h(
      "div",
      { class: "page" },
      topbar("Sentences", `#/u/${unit.unit}`),
      h("p", { class: "tip" }, "Tap any word to hear it. Tap 🔊 to hear the whole sentence."),
      list,
      h("div", { class: "row" }, toggle, h("button", { class: "btn primary", onclick: practise }, "Practise ➜")),
    ),
  );
}
