import { speak, speakWord } from "./speech";
import { childName, settings } from "./store";

type Attrs = Record<string, unknown> & { class?: string; onclick?: (e: MouseEvent) => void };
type Child = Node | string | null | undefined | false;

/** Tiny element builder. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (k === "html") el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const pick = <T>(a: T[], n: number) => shuffle(a).slice(0, n);

/** Big round "listen" button. */
export function listenBtn(text: string, label = "Listen", small = false): HTMLButtonElement {
  return h(
    "button",
    {
      class: small ? "listen small" : "listen",
      "aria-label": `${label}: ${text}`,
      onclick: (e: MouseEvent) => {
        e.stopPropagation();
        speak(text);
      },
    },
    "🔊",
    small ? null : h("span", {}, label),
  );
}

/** Text where every word can be tapped to hear it (SPEC §4.1). */
export function speakable(text: string, cls = "speakable"): HTMLElement {
  const wrap = h("span", { class: cls });
  for (const part of text.split(/(\s+)/)) {
    if (/^\s+$/.test(part) || !part) {
      wrap.append(part);
      continue;
    }
    const w = h("span", { class: "tapword", role: "button", tabindex: "0" }, part);
    const say = () => {
      w.classList.add("said");
      setTimeout(() => w.classList.remove("said"), 500);
      speakWord(part);
    };
    w.addEventListener("click", say);
    w.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), say()));
    wrap.append(w);
  }
  return wrap;
}

export function picture(item: { image?: string; emoji?: string }, cls = "pic"): HTMLElement | null {
  if (item.image) return h("img", { class: cls, src: asset(item.image), alt: "", loading: "lazy" });
  if (item.emoji) return h("div", { class: `${cls} emoji` }, item.emoji);
  return null;
}

export function topbar(title: string, back?: string, extra?: Node): HTMLElement {
  return h(
    "header",
    { class: "topbar" },
    back ? h("a", { class: "back", href: back, "aria-label": "Back" }, "‹") : h("span", { class: "back-space" }),
    h("h1", {}, title),
    extra ?? h("span", { class: "back-space" }),
  );
}

export function stars(score: number | undefined): string {
  if (score === undefined) return "";
  return score >= 90 ? "★★★" : score >= 70 ? "★★☆" : score > 0 ? "★☆☆" : "☆☆☆";
}

const GOOD = [
  "Well done, {n}!",
  "Great job, {n}!",
  "Super, {n}!",
  "Brilliant, {n}!",
  "You're a star, {n}!",
  "Fantastic, {n}!",
  "Excellent work, {n}!",
  "Amazing, {n}!",
  "Wonderful, {n}!",
  "Yes! Well done, {n}!",
];
const STREAK = ["Three in a row, {n}! You're on fire!", "Wow, {n}! Another one right!", "{n}, you're unstoppable!"];
const TRY = ["Good try, {n}! Let's look again.", "Nearly, {n}! Look at the right answer.", "Keep going, {n}! You're learning."];

const fill = (s: string) => s.replace("{n}", childName());
const rnd = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function praise(inARow: number): string {
  const msg = fill(inARow >= 3 && inARow % 3 === 0 ? rnd(STREAK) : rnd(GOOD));
  if (settings().speakPraise) speak(msg, { pitch: 1.15 });
  return msg;
}

export function encourage(): string {
  const msg = fill(rnd(TRY));
  if (settings().speakPraise) speak(msg);
  return msg;
}

/** Celebration burst for finishing an activity. */
export function confetti(): void {
  const box = h("div", { class: "confetti", "aria-hidden": "true" });
  const bits = ["⭐", "🎉", "✨", "💛", "🌟", "🎈"];
  for (let i = 0; i < 36; i++) {
    const s = h("span", {}, bits[i % bits.length]);
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.6}s`;
    s.style.fontSize = `${18 + Math.random() * 22}px`;
    box.append(s);
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 3200);
}

/** Navigate, re-rendering even when the hash is already `hash`. */
export function go(hash: string): void {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
}
