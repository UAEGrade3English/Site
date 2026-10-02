import type { DataQuestion, GrammarTopic, Question, SentenceItem, Skill, Unit, VocabItem } from "./types";
import { pick, shuffle } from "./ui";

export const wordKey = (u: number, w: string) => `u${u}:w:${w}`;
export const grammarKey = (u: number, id: string) => `u${u}:g:${id}`;
export const readingKey = (u: number, id: string) => `u${u}:r:${id}`;
export const sentenceKey = (u: number, i: number) => `u${u}:s:${i}`;

const others = (unit: Unit, v: VocabItem, n: number) => {
  // Prefer distractors from the same group so the choice really tests the word.
  const same = unit.vocabulary.filter((x) => x.word !== v.word && x.group === v.group);
  const rest = unit.vocabulary.filter((x) => x.word !== v.word && x.group !== v.group);
  return [...pick(same, n), ...pick(rest, n)].slice(0, n).map((x) => x.word);
};

const base = (unit: Unit, v: VocabItem, skill: Skill) => ({
  key: wordKey(unit.unit, v.word),
  label: v.word,
  unit: unit.unit,
  skill,
});

export function listenChoose(unit: Unit, v: VocabItem): Question {
  return {
    ...base(unit, v, "listening"),
    kind: "choice",
    prompt: "Listen. Which word do you hear?",
    say: v.word,
    sayOnly: true,
    choices: shuffle([v.word, ...others(unit, v, 3)]),
    answer: v.word,
  };
}

export function pictureChoose(unit: Unit, v: VocabItem): Question {
  return {
    ...base(unit, v, "vocabulary"),
    kind: "choice",
    prompt: "What is this?",
    image: v.image,
    emoji: v.image ? undefined : v.emoji,
    choices: shuffle([v.word, ...others(unit, v, 2)]),
    answer: v.word,
  };
}

export function meaningChoose(unit: Unit, v: VocabItem): Question {
  return {
    ...base(unit, v, "vocabulary"),
    kind: "choice",
    prompt: `Which word means “${v.definition}”?`,
    say: v.definition,
    choices: shuffle([v.word, ...others(unit, v, 2)]),
    answer: v.word,
  };
}

export function fillSentence(unit: Unit, v: VocabItem): Question | null {
  const re = new RegExp(`\\b${v.word.replace(/[-]/g, "\\-")}\\b`, "i");
  const m = v.example.match(re);
  if (!m) return null;
  return {
    ...base(unit, v, "vocabulary"),
    kind: "choice",
    prompt: v.example.replace(re, "_____"),
    image: v.image,
    emoji: v.image ? undefined : v.emoji,
    choices: shuffle([m[0], ...others(unit, v, 2)]),
    answer: m[0],
    explain: v.example,
  };
}

export function missingLetters(unit: Unit, v: VocabItem): Question {
  const letters = [...v.word];
  const idx = letters.map((c, i) => (/[a-z]/i.test(c) ? i : -1)).filter((i) => i >= 0);
  const hideN = Math.max(1, Math.round(idx.length * (v.word.length > 6 ? 0.35 : 0.3)));
  const hidden = new Set(pick(idx, hideN));
  const mask = letters.map((_, i) => !hidden.has(i));
  const missing = letters.filter((_, i) => hidden.has(i));
  const extra = pick([..."aeioustrnl"].filter((c) => !missing.includes(c)), 2);
  return {
    ...base(unit, v, "spelling"),
    kind: "build",
    prompt: "Fill in the missing letters.",
    say: v.word,
    image: v.image,
    emoji: v.image ? undefined : v.emoji,
    target: v.word,
    mask,
    tiles: shuffle([...missing, ...extra]),
  };
}

export function unscramble(unit: Unit, v: VocabItem): Question {
  const letters = [...v.word];
  let tiles = shuffle(letters);
  for (let i = 0; i < 5 && tiles.join("") === v.word; i++) tiles = shuffle(letters);
  return {
    ...base(unit, v, "spelling"),
    kind: "build",
    prompt: "Unscramble the letters.",
    say: v.word,
    image: v.image,
    emoji: v.image ? undefined : v.emoji,
    target: v.word,
    mask: letters.map(() => false),
    tiles,
  };
}

export function dictation(unit: Unit, v: VocabItem): Question {
  return {
    ...base(unit, v, "spelling"),
    kind: "type",
    prompt: "Listen and type the word.",
    say: v.word,
    sayOnly: true,
    answer: v.word,
    hint: `${v.word.length} letters`,
  };
}

export function sentenceOrder(unit: Unit, s: SentenceItem, i: number): Question {
  return {
    key: sentenceKey(unit.unit, i),
    label: s.text,
    unit: unit.unit,
    skill: "grammar",
    kind: "order",
    prompt: "Put the words in order.",
    say: s.text,
    image: s.image,
    emoji: s.image ? undefined : s.emoji,
    parts: s.text.split(" "),
    joiner: " ",
  };
}

export function fromData(q: DataQuestion, key: string, label: string, unit: number, skill: Skill): Question {
  const b = { key, label, unit, skill, image: "image" in q ? q.image : undefined, explain: "explain" in q ? q.explain : undefined };
  switch (q.type) {
    case "mcq":
      return { ...b, kind: "choice", prompt: q.prompt, say: q.prompt, choices: shuffle(q.choices), answer: q.answer };
    case "tf":
      return { ...b, kind: "choice", prompt: q.prompt, say: q.prompt, choices: ["True", "False"], answer: q.answer ? "True" : "False", big: true };
    case "order":
      return { ...b, kind: "order", prompt: q.prompt, say: q.answer, parts: q.answer.split(" "), joiner: " " };
    case "sequence":
      return { ...b, kind: "order", prompt: q.prompt, parts: q.items, joiner: "\n", vertical: true };
  }
}

export const grammarQuestions = (unit: Unit, g: GrammarTopic) =>
  g.practice.map((q) => fromData(q, grammarKey(unit.unit, g.id), g.title, unit.unit, "grammar"));

export function readingQuestions(unit: Unit): Question[] {
  return unit.reading.flatMap((r) => r.questions.map((q) => fromData(q, readingKey(unit.unit, r.id), `Reading: ${r.title}`, unit.unit, "reading")));
}

/** Mixed vocabulary practice: one activity per word, varied types. */
export function vocabPractice(unit: Unit, n = 12): Question[] {
  const words = pick(unit.vocabulary, n);
  const makers = [listenChoose, pictureChoose, meaningChoose, fillSentence];
  return words.map((v, i) => {
    let q: Question | null = null;
    for (let k = 0; !q && k < makers.length; k++) {
      const make = makers[(i + k) % makers.length];
      if (make === pictureChoose && !v.image && !v.emoji) continue;
      q = make(unit, v);
    }
    return q ?? meaningChoose(unit, v);
  });
}

export function spellingPractice(unit: Unit, n = 10): Question[] {
  const words = pick(unit.vocabulary, n);
  const makers = [missingLetters, unscramble, dictation];
  return words.map((v, i) => makers[i % makers.length](unit, v));
}

/** End-of-unit quiz mixing every skill. */
export function unitQuiz(unit: Unit): Question[] {
  const vocab = vocabPractice(unit, 4);
  const spell = spellingPractice(unit, 3);
  const gram = unit.grammar.flatMap((g) => pick(grammarQuestions(unit, g), 1));
  const read = pick(readingQuestions(unit).filter((q) => q.kind === "choice"), 2);
  const sent = pick(unit.sentences.map((s, i) => sentenceOrder(unit, s, i)), 1);
  return shuffle([...vocab, ...spell, ...gram, ...read, ...sent]);
}
