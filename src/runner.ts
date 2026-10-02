import type { Question } from "./types";
import { speak } from "./speech";
import { recordAnswer } from "./store";
import { confetti, encourage, go, h, listenBtn, picture, praise, shuffle, speakable, stars } from "./ui";

export interface RunOptions {
  title: string;
  back: string;
  /** Called once with the first-attempt score (0..100). */
  onFinish?: (score: number) => void;
  /** Re-ask wrong questions once at the end (not scored). */
  retry?: boolean;
}

const answerText = (q: Question) =>
  q.kind === "choice" || q.kind === "type" ? q.answer : q.kind === "build" ? q.target : q.parts.join(q.joiner === "\n" ? " → " : " ");

/** Runs a list of questions one at a time inside `root`. */
export function runQuestions(root: HTMLElement, questions: Question[], opts: RunOptions): void {
  const queue = questions.map((q) => ({ q, retry: false }));
  const total = questions.length;
  const mistakes: Question[] = [];
  let firstCorrect = 0;
  let done = 0;
  let inARow = 0;

  const bar = h("div", { class: "bar-fill" });
  const counter = h("span", { class: "counter" });
  const stage = h("div", { class: "stage" });
  root.replaceChildren(
    h("header", { class: "topbar" }, h("button", { class: "back", onclick: () => go(opts.back), "aria-label": "Back" }, "‹"), h("h1", {}, opts.title), counter),
    h("div", { class: "bar" }, bar),
    stage,
  );

  function next() {
    const item = queue.shift();
    if (!item) return finish();
    bar.style.width = `${(done / total) * 100}%`;
    counter.textContent = item.retry ? "Try again" : `${done + 1} / ${total}`;
    show(item.q, item.retry);
  }

  function show(q: Question, isRetry: boolean) {
    const card = h("div", { class: "qcard" });
    const feedback = h("div", { class: "feedback", "aria-live": "polite" });
    let answered = false;

    const head = h("div", { class: "qhead" });
    const pic = picture(q, "qpic");
    if (pic) head.append(pic);
    const promptBox = h("div", { class: "prompt" });
    if (q.sayOnly) {
      promptBox.append(h("p", { class: "prompt-text" }, q.prompt), h("button", { class: "listen huge", onclick: () => speak(q.say!) }, "🔊"));
    } else {
      promptBox.append(h("p", { class: "prompt-text" }, speakable(q.prompt)));
      if (q.say) promptBox.append(listenBtn(q.say, "Listen"));
    }
    head.append(promptBox);
    card.append(head);

    const result = (ok: boolean) => {
      if (answered) return;
      answered = true;
      card.classList.add(ok ? "is-right" : "is-wrong");
      if (!isRetry) {
        recordAnswer(q.key, q.label, q.unit, q.skill, ok);
        done++;
        if (ok) firstCorrect++;
        else mistakes.push(q);
      }
      bar.style.width = `${(done / total) * 100}%`;
      if (ok) {
        inARow++;
        feedback.replaceChildren(h("div", { class: "fb good" }, h("span", { class: "fb-icon" }, "🌟"), praise(inARow)));
        setTimeout(next, 1700);
      } else {
        inARow = 0;
        if (opts.retry !== false && !isRetry) queue.push({ q, retry: true });
        const ans = answerText(q);
        feedback.replaceChildren(
          h(
            "div",
            { class: "fb try" },
            h("span", { class: "fb-icon" }, "💪"),
            h("div", {}, encourage(), h("div", { class: "answer" }, "Answer: ", h("b", {}, ans), " ", listenBtn(ans, "", true)), q.explain ? h("div", { class: "explain" }, q.explain) : null),
          ),
          h("button", { class: "btn primary next", onclick: next }, "Next ➜"),
        );
      }
    };

    if (q.kind === "choice") {
      const opts2 = h("div", { class: `choices${q.big ? " big" : ""}${q.choices.some((c) => c.length > 24) ? " long" : ""}` });
      for (const c of q.choices) {
        const b = h("button", { class: "choice" }, q.big ? (c === "True" ? "✔ True" : "✘ False") : c);
        b.addEventListener("click", () => {
          if (answered) return;
          const ok = c === q.answer;
          b.classList.add(ok ? "right" : "wrong");
          if (!ok) opts2.querySelectorAll("button").forEach((x, i) => q.choices[i] === q.answer && x.classList.add("right"));
          result(ok);
        });
        opts2.append(b);
      }
      card.append(opts2);
    } else if (q.kind === "build") {
      const target = [...q.target];
      const slots: (string | null)[] = target.map((c, i) => (q.mask[i] ? c : null));
      const used: (number | null)[] = target.map(() => null); // tile index used per slot
      const slotRow = h("div", { class: "slots" });
      const tileRow = h("div", { class: "tiles" });
      const tileBtns = q.tiles.map((t, ti) =>
        h(
          "button",
          {
            class: "tile",
            onclick: () => {
              if (answered) return;
              const i = slots.findIndex((s, k) => s === null && !q.mask[k]);
              if (i < 0) return;
              slots[i] = t;
              used[i] = ti;
              tileBtns[ti].disabled = true;
              draw();
              if (slots.every((s) => s !== null)) {
                const ok = slots.join("").toLowerCase() === q.target.toLowerCase();
                result(ok);
                if (!ok) slotRow.querySelectorAll(".slot").forEach((el, k) => ((el as HTMLElement).textContent = target[k]));
              }
            },
          },
          t,
        ),
      );
      const draw = () => {
        slotRow.replaceChildren(
          ...target.map((_, i) =>
            h(
              "button",
              {
                class: `slot${q.mask[i] ? " fixed" : ""}${slots[i] ? " filled" : ""}${target[i] === " " ? " space" : ""}`,
                disabled: q.mask[i] || undefined,
                onclick: () => {
                  if (answered || q.mask[i] || used[i] === null) return;
                  tileBtns[used[i]!].disabled = false;
                  slots[i] = null;
                  used[i] = null;
                  draw();
                },
              },
              slots[i] ?? "",
            ),
          ),
        );
      };
      draw();
      tileRow.append(...tileBtns);
      card.append(slotRow, tileRow);
    } else if (q.kind === "order") {
      const pool = shuffle(q.parts.map((p, i) => ({ p, i })));
      if (pool.every((x, k) => x.i === k) && pool.length > 1) pool.reverse();
      const chosen: { p: string; i: number }[] = [];
      const line = h("div", { class: `orderline${q.vertical ? " vertical" : ""}` });
      const poolBox = h("div", { class: `pool${q.vertical ? " vertical" : ""}` });
      const draw = () => {
        line.replaceChildren(
          ...chosen.map((x, k) =>
            h(
              "button",
              {
                class: "part placed",
                onclick: () => {
                  if (answered) return;
                  chosen.splice(k, 1);
                  pool.push(x);
                  draw();
                },
              },
              q.vertical ? `${k + 1}. ${x.p}` : x.p,
            ),
          ),
        );
        if (!chosen.length) line.append(h("span", { class: "placeholder" }, q.vertical ? "Tap the sentences in order" : "Tap the words in order"));
        poolBox.replaceChildren(
          ...pool.map((x, k) =>
            h(
              "button",
              {
                class: "part",
                onclick: () => {
                  if (answered) return;
                  pool.splice(k, 1);
                  chosen.push(x);
                  draw();
                  if (!pool.length) {
                    const ok = chosen.map((c) => c.p).join(q.joiner) === q.parts.join(q.joiner);
                    if (ok && q.say) speak(q.say);
                    setTimeout(() => result(ok), ok && q.say ? 900 : 0);
                  }
                },
              },
              x.p,
            ),
          ),
        );
      };
      draw();
      card.append(line, poolBox);
    } else {
      const input = h("input", {
        class: "typein",
        type: "text",
        autocomplete: "off",
        autocapitalize: "off",
        autocorrect: "off",
        spellcheck: "false",
        "aria-label": "Type the word",
        placeholder: q.hint ?? "",
      });
      const check = () => {
        if (answered || !input.value.trim()) return;
        const ok = input.value.trim().toLowerCase().replace(/\s+/g, " ") === q.answer.toLowerCase();
        input.classList.add(ok ? "right" : "wrong");
        input.disabled = true;
        result(ok);
      };
      input.addEventListener("keydown", (e) => e.key === "Enter" && check());
      card.append(h("div", { class: "typerow" }, input, h("button", { class: "btn primary", onclick: check }, "Check")));
      setTimeout(() => input.focus({ preventScroll: true }), 50);
    }

    card.append(feedback);
    stage.replaceChildren(card);
    if (q.sayOnly && q.say) setTimeout(() => speak(q.say!), 350);
  }

  function finish() {
    const score = total ? (firstCorrect / total) * 100 : 100;
    bar.style.width = "100%";
    counter.textContent = "";
    opts.onFinish?.(score);
    if (score >= 50) confetti();
    const s = stars(score);
    const box = h(
      "div",
      { class: "finish" },
      h("div", { class: "big-stars" }, s),
      h("h2", {}, score >= 90 ? "Amazing work!" : score >= 70 ? "Great job!" : "Well done for finishing!"),
      h("p", { class: "score" }, `${firstCorrect} out of ${total} right first time`),
    );
    if (mistakes.length) {
      const seen = new Set<string>();
      const list = h("ul", { class: "mistakes" });
      for (const m of mistakes) {
        const a = answerText(m);
        if (seen.has(a)) continue;
        seen.add(a);
        list.append(h("li", {}, listenBtn(a, "", true), " ", h("b", {}, a)));
      }
      box.append(h("h3", {}, "Let's remember these:"), list);
    }
    box.append(
      h(
        "div",
        { class: "row" },
        h("button", { class: "btn", onclick: () => runQuestions(root, shuffle(questions), opts) }, "↻ Play again"),
        h("button", { class: "btn primary", onclick: () => go(opts.back) }, "Done ✔"),
      ),
    );
    stage.replaceChildren(box);
  }

  next();
}
