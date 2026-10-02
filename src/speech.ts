import { settings } from "./store";

const synth: SpeechSynthesis | undefined = typeof window !== "undefined" ? window.speechSynthesis : undefined;
let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices();
}
loadVoices();
synth?.addEventListener?.("voiceschanged", loadVoices);

export function englishVoices(): SpeechSynthesisVoice[] {
  loadVoices();
  return voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const en = englishVoices();
  const chosen = settings().voiceURI;
  if (chosen) {
    const v = en.find((x) => x.voiceURI === chosen);
    if (v) return v;
  }
  const gb = en.filter((v) => v.lang.replace("_", "-").toLowerCase() === "en-gb");
  // Prefer higher-quality voices where the platform marks them.
  return (
    gb.find((v) => /premium|enhanced|natural|google/i.test(v.name)) ??
    gb[0] ??
    en.find((v) => v.default) ??
    en[0]
  );
}

export function canSpeak(): boolean {
  return !!synth;
}

/** Remove emoji and the quotes that some voices read aloud. */
function clean(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/[“”"]/g, "")
    .replace(/___+/g, "blank")
    .trim();
}

export function speak(text: string, opts: { rate?: number; pitch?: number } = {}): void {
  if (!synth) return;
  const t = clean(text);
  if (!t) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(t);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = v?.lang ?? "en-GB";
  u.rate = (opts.rate ?? 1) * settings().rate;
  u.pitch = opts.pitch ?? 1;
  synth.speak(u);
}

/** Speak a single word, slightly slower so it is easy to hear. */
export function speakWord(word: string): void {
  speak(word.replace(/[^A-Za-z'’\- ]/g, ""), { rate: 0.85 });
}
