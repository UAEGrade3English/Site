export type Skill = "vocabulary" | "spelling" | "grammar" | "reading" | "listening";

export interface VocabItem {
  word: string;
  definition: string;
  example: string;
  /** path under public/, e.g. "img/u4/shoes.jpg" */
  image?: string;
  emoji?: string;
  group?: string;
}

export interface SentenceItem {
  text: string;
  image?: string;
  emoji?: string;
}

/** Questions as written in the unit JSON files. */
export type DataQuestion =
  | { type: "mcq"; prompt: string; choices: string[]; answer: string; image?: string; explain?: string }
  | { type: "tf"; prompt: string; answer: boolean; image?: string; explain?: string }
  | { type: "order"; prompt: string; answer: string; explain?: string }
  | { type: "sequence"; prompt: string; items: string[] };

export interface GrammarTopic {
  id: string;
  title: string;
  emoji: string;
  explain: string[];
  examples: string[];
  practice: DataQuestion[];
}

export interface ReadingText {
  id: string;
  title: string;
  image?: string;
  paragraphs: string[];
  questions: DataQuestion[];
}

export interface SortGame {
  title: string;
  buckets: { id: string; label: string; emoji: string }[];
  items: { label: string; emoji: string; bucket: string }[];
}

export interface Unit {
  term: number;
  unit: number;
  title: string;
  emoji: string;
  cover?: string;
  bookPages: string;
  objectives: string[];
  vocabulary: VocabItem[];
  sentences: SentenceItem[];
  grammar: GrammarTopic[];
  reading: ReadingText[];
  sort: SortGame;
}

export interface UnitStub {
  term: number;
  unit: number;
  title: string;
  emoji: string;
}

/** Runtime question used by the exercise runner. */
export type Question = {
  key: string; // mastery key
  label: string; // shown to the parent in "needs practice"
  unit: number;
  skill: Skill;
  prompt: string;
  say?: string; // text to speak (listen button / auto-play)
  sayOnly?: boolean; // hide the text, only play audio
  image?: string;
  emoji?: string;
  explain?: string;
} & (
  | { kind: "choice"; choices: string[]; answer: string; big?: boolean }
  | { kind: "build"; target: string; mask: boolean[]; tiles: string[] }
  | { kind: "order"; parts: string[]; joiner: string; vertical?: boolean }
  | { kind: "type"; answer: string; hint?: string }
);
