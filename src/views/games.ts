import type { Unit } from "../types";
import { wordKey } from "../questions";
import { speak, speakWord } from "../speech";
import { childName, completeStep, recordAnswer, settings } from "../store";
import { confetti, encourage, h, pick, picture, praise, shuffle, stars, topbar } from "../ui";

const GAMES = [
  { id: "memory", emoji: "🃏", title: "Memory Match", desc: "Find the picture and its word" },
  { id: "bubbles", emoji: "🫧", title: "Bubble Pop", desc: "Listen and pop the right word" },
  { id: "sort", emoji: "🧺", title: "Sort It!", desc: "" },
];

export function gamesView(app: HTMLElement, unit: Unit) {
  app.replaceChildren(
    h(
      "div",
      { class: "page" },
      topbar("Games", `#/u/${unit.unit}`),
      h(
        "div",
        { class: "game-grid" },
        ...GAMES.map((g) =>
          h("a", { class: "game-card", href: `#/u/${unit.unit}/game/${g.id}` }, h("span", { class: "g-emoji" }, g.emoji), h("b", {}, g.title), h("span", { class: "sub" }, g.id === "sort" ? unit.sort.title : g.desc)),
        ),
      ),
    ),
  );
}

export function gameView(app: HTMLElement, unit: Unit, id?: string) {
  if (id === "memory") return memory(app, unit);
  if (id === "bubbles") return bubbles(app, unit);
  if (id === "sort") return sortGame(app, unit);
  gamesView(app, unit);
}

function say(msg: string) {
  if (settings().speakPraise) speak(msg, { pitch: 1.15 });
}

function finished(app: HTMLElement, unit: Unit, score: number, replay: () => void, line: string) {
  completeStep(unit.unit, "games", score);
  confetti();
  const msg = `Well done, ${childName()}!`;
  say(`${msg} ${line}`);
  app.querySelector(".game-area")!.replaceChildren(
    h(
      "div",
      { class: "finish" },
      h("div", { class: "big-stars" }, stars(score)),
      h("h2", {}, msg),
      h("p", { class: "score" }, line),
      h("div", { class: "row" }, h("button", { class: "btn", onclick: replay }, "↻ Play again"), h("a", { class: "btn primary", href: `#/u/${unit.unit}/games` }, "More games")),
    ),
  );
}

function shell(app: HTMLElement, unit: Unit, title: string, status: HTMLElement) {
  app.replaceChildren(h("div", { class: "page" }, topbar(title, `#/u/${unit.unit}/games`, status), h("div", { class: "game-area" })));
  return app.querySelector(".game-area") as HTMLElement;
}

/* ---------- Memory Match ---------- */
function memory(app: HTMLElement, unit: Unit) {
  const words = pick(unit.vocabulary.filter((v) => v.image || v.emoji), 6);
  type Card = { id: number; word: string; pic: boolean };
  const cards: Card[] = shuffle(words.flatMap((v, id) => [{ id, word: v.word, pic: true }, { id, word: v.word, pic: false }]));
  const status = h("span", { class: "counter" }, "0 / 6");
  const area = shell(app, unit, "Memory Match", status);
  const grid = h("div", { class: "memory" });
  area.append(h("p", { class: "tip" }, "Flip two cards. Find a picture and its word!"), grid);

  let open: { c: Card; el: HTMLElement }[] = [];
  let found = 0;
  let tries = 0;
  let lock = false;
  for (const c of cards) {
    const v = words[c.id];
    const face = c.pic ? picture(v, "mem-pic") ?? h("span", {}, v.word) : h("span", { class: "mem-word" }, v.word);
    const el = h("button", { class: "mem-card", "aria-label": "Hidden card" }, h("span", { class: "mem-back" }, "❓"), h("span", { class: "mem-face" }, face));
    el.addEventListener("click", () => {
      if (lock || el.classList.contains("open")) return;
      el.classList.add("open");
      if (!c.pic) speakWord(c.word);
      open.push({ c, el });
      if (open.length < 2) return;
      tries++;
      const [a, b] = open;
      open = [];
      if (a.c.id === b.c.id) {
        found++;
        status.textContent = `${found} / 6`;
        a.el.classList.add("matched");
        b.el.classList.add("matched");
        setTimeout(() => speakWord(c.word), 300);
        if (found === 6) {
          const score = Math.max(40, Math.round(100 - Math.max(0, tries - 6) * 6));
          setTimeout(() => finished(app, unit, score, () => memory(app, unit), `You found all 6 pairs in ${tries} tries.`), 1100);
        }
      } else {
        lock = true;
        setTimeout(() => {
          a.el.classList.remove("open");
          b.el.classList.remove("open");
          lock = false;
        }, 1100);
      }
    });
    grid.append(el);
  }
}

/* ---------- Bubble Pop ---------- */
function bubbles(app: HTMLElement, unit: Unit) {
  const rounds = pick(unit.vocabulary, 8);
  const status = h("span", { class: "counter" });
  const area = shell(app, unit, "Bubble Pop", status);
  let r = 0;
  let score = 0;
  let inARow = 0;
  const colours = ["#ff8fab", "#7cc6fe", "#ffd166", "#95e1a3"];

  function round() {
    if (r >= rounds.length) return finished(app, unit, (score / rounds.length) * 100, () => bubbles(app, unit), `You popped ${score} of ${rounds.length} first time.`);
    status.textContent = `${r + 1} / ${rounds.length}`;
    const v = rounds[r];
    const options = shuffle([v.word, ...pick(unit.vocabulary.filter((x) => x.word !== v.word), 3).map((x) => x.word)]);
    const msg = h("div", { class: "feedback" });
    const sky = h("div", { class: "sky" });
    let first = true;
    let done = false;
    options.forEach((w, k) => {
      const b = h("button", { class: "bubble" }, w);
      b.style.left = `${4 + k * 24}%`;
      b.style.background = colours[k];
      b.style.animationDelay = `${k * -2.2 - 1.5}s`;
      b.addEventListener("click", () => {
        if (done) return;
        if (w === v.word) {
          done = true;
          b.classList.add("pop");
          if (first) score++;
          recordAnswer(wordKey(unit.unit, v.word), v.word, unit.unit, "listening", first);
          inARow = first ? inARow + 1 : 0;
          msg.replaceChildren(h("div", { class: "fb good" }, "🎉 ", praise(Math.max(inARow, 1))));
          r++;
          setTimeout(round, 1500);
        } else {
          if (first) recordAnswer(wordKey(unit.unit, v.word), v.word, unit.unit, "listening", false);
          first = false;
          b.classList.add("shake");
          setTimeout(() => b.classList.remove("shake"), 500);
          speakWord(v.word);
        }
      });
      sky.append(b);
    });
    area.replaceChildren(
      h("div", { class: "row center" }, h("button", { class: "listen huge", onclick: () => speakWord(v.word), "aria-label": "Hear the word again" }, "🔊"), h("p", { class: "tip" }, "Listen, then pop the right bubble!")),
      sky,
      msg,
    );
    setTimeout(() => speakWord(v.word), 400);
  }
  round();
}

/* ---------- Sort It ---------- */
function sortGame(app: HTMLElement, unit: Unit) {
  const items = shuffle(unit.sort.items);
  const status = h("span", { class: "counter" });
  const area = shell(app, unit, "Sort It!", status);
  let i = 0;
  let score = 0;
  let inARow = 0;

  function step() {
    if (i >= items.length) return finished(app, unit, (score / items.length) * 100, () => sortGame(app, unit), `You sorted ${score} of ${items.length} correctly.`);
    status.textContent = `${i + 1} / ${items.length}`;
    const it = items[i];
    const msg = h("div", { class: "feedback" });
    let done = false;
    const item = h("button", { class: "sort-item", onclick: () => speak(it.label) }, h("span", { class: "si-emoji" }, it.emoji), h("span", {}, it.label));
    const buckets = unit.sort.buckets.map((b) =>
      h(
        "button",
        {
          class: "bucket",
          onclick: (e: MouseEvent) => {
            if (done) return;
            done = true;
            const ok = b.id === it.bucket;
            (e.currentTarget as HTMLElement).classList.add(ok ? "right" : "wrong");
            if (ok) {
              score++;
              inARow++;
              msg.replaceChildren(h("div", { class: "fb good" }, "🌟 ", praise(inARow)));
            } else {
              inARow = 0;
              const right = unit.sort.buckets.find((x) => x.id === it.bucket)!;
              msg.replaceChildren(h("div", { class: "fb try" }, "💪 ", encourage(), h("div", { class: "answer" }, `${it.label} → ${right.emoji} ${right.label}`)));
            }
            i++;
            setTimeout(step, ok ? 1300 : 2300);
          },
        },
        h("span", { class: "b-emoji" }, b.emoji),
        b.label,
      ),
    );
    area.replaceChildren(h("h2", { class: "sort-title" }, unit.sort.title), item, h("div", { class: "buckets" }, ...buckets), msg);
    speak(it.label);
  }
  step();
}
