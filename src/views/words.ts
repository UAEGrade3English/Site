import type { Unit } from "../types";
import { wordKey } from "../questions";
import { speakWord } from "../speech";
import { completeStep, isMastered, mastery } from "../store";
import { confetti, h, listenBtn, picture, speakable, topbar } from "../ui";

/** Flashcards: picture, word, meaning, example — all with audio (SPEC §4). */
export function wordsView(app: HTMLElement, unit: Unit, start = 0) {
  const words = unit.vocabulary;
  let i = start;
  const seen = new Set<number>();
  const cardBox = h("div", { class: "card-box" });
  const dots = h("div", { class: "dots" });

  function draw() {
    const v = words[i];
    seen.add(i);
    const m = mastery()[wordKey(unit.unit, v.word)];
    const card = h(
      "article",
      { class: "word-card" },
      m && isMastered(m) ? h("span", { class: "mastered" }, "⭐ Mastered") : null,
      picture(v, "card-pic"),
      h("button", { class: "word-big", onclick: () => speakWord(v.word) }, v.word, h("span", { class: "spk" }, "🔊")),
      h("div", { class: "meaning" }, h("span", { class: "lbl" }, "Meaning"), h("p", {}, speakable(v.definition)), listenBtn(v.definition, "", true)),
      h("div", { class: "example" }, h("span", { class: "lbl" }, "Example"), h("p", {}, speakable(v.example)), listenBtn(v.example, "Listen to sentence")),
    );
    cardBox.replaceChildren(card);
    dots.replaceChildren(...words.map((_, k) => h("button", { class: `dot${k === i ? " on" : ""}${seen.has(k) ? " seen" : ""}`, "aria-label": `Word ${k + 1}`, onclick: () => go(k) })));
    prev.disabled = i === 0;
    nextBtn.textContent = i === words.length - 1 ? "Finish ✔" : "Next ➜";
    setTimeout(() => speakWord(v.word), 200);
  }

  function go(k: number) {
    i = Math.max(0, Math.min(words.length - 1, k));
    draw();
  }

  const prev = h("button", { class: "btn", onclick: () => go(i - 1) }, "‹ Back");
  const nextBtn = h("button", {
    class: "btn primary",
    onclick: () => {
      if (i < words.length - 1) return go(i + 1);
      completeStep(unit.unit, "words", 100);
      confetti();
      location.hash = `#/u/${unit.unit}/practice`;
    },
  });

  // Swipe left/right on tablets and phones.
  let x0: number | null = null;
  cardBox.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  cardBox.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  app.replaceChildren(h("div", { class: "page" }, topbar("Learn the words", `#/u/${unit.unit}`, h("span", { class: "counter" }, `${words.length} words`)), cardBox, dots, h("div", { class: "row nav" }, prev, nextBtn)));
  draw();
}
