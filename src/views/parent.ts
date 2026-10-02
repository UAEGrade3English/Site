import type { Skill } from "../types";
import { getUnit, readyUnits } from "../data";
import { englishVoices, speak } from "../speech";
import { childName, lastActive, mastery, isMastered, resetProgress, results, settings, skills, streak, thisWeek, updateSettings, weakItems } from "../store";
import { h, stars, topbar } from "../ui";
import { STEPS, scoreOf, unitPercent } from "./unit";

const UNLOCK = "g3e.parent";

export function parentView(app: HTMLElement) {
  let unlocked = false;
  try {
    unlocked = sessionStorage.getItem(UNLOCK) === "1";
  } catch {
    /* ignore */
  }
  if (unlocked) return dashboard(app);
  const pin = settings().pin;
  const input = h("input", { class: "pin", type: "password", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": "PIN" });
  const msg = h("p", { class: "sub" }, pin ? "Enter the parent PIN" : "Create a 4-digit parent PIN");
  const go = () => {
    const v = input.value.trim();
    if (!/^\d{4}$/.test(v)) return (msg.textContent = "Please use 4 numbers.");
    if (!pin) updateSettings({ pin: v });
    else if (v !== pin) {
      input.value = "";
      return (msg.textContent = "That PIN is not right. Try again.");
    }
    try {
      sessionStorage.setItem(UNLOCK, "1");
    } catch {
      /* ignore */
    }
    dashboard(app);
  };
  input.addEventListener("keydown", (e) => e.key === "Enter" && go());
  app.replaceChildren(h("div", { class: "page" }, topbar("Parents", "#/"), h("div", { class: "pin-box" }, h("div", { class: "big-stars" }, "🔒"), msg, input, h("button", { class: "btn primary", onclick: go }, pin ? "Open" : "Save PIN"))));
  setTimeout(() => input.focus(), 50);
}

const SKILL_LABELS: [Skill, string][] = [
  ["vocabulary", "Vocabulary"],
  ["spelling", "Spelling"],
  ["grammar", "Grammar"],
  ["reading", "Reading"],
  ["listening", "Listening"],
];

function skillRows(data: Record<Skill, { correct: number; total: number }>) {
  return h(
    "div",
    { class: "skill-rows" },
    ...SKILL_LABELS.map(([k, label]) => {
      const s = data[k];
      const pct = s.total ? Math.round((s.correct / s.total) * 100) : null;
      return h(
        "div",
        { class: "skill-row" },
        h("span", { class: "sk-label" }, label),
        h("div", { class: "meter" }, h("div", { class: `meter-fill${pct !== null && pct < 60 ? " low" : ""}`, style: `width:${pct ?? 0}%` })),
        h("span", { class: "sk-pct" }, pct === null ? "—" : `${pct}%`),
        h("span", { class: "sk-n" }, s.total ? `${s.total} answers` : ""),
      );
    }),
  );
}

function dashboard(app: HTMLElement) {
  const weak = weakItems();
  const m = Object.values(mastery());
  const masteredWords = m.filter(isMastered).length;
  const weakUnit = weak[0]?.[1].unit;

  // Suggest the lowest-scoring step in the unit with the most weak items.
  let suggestion = "Keep going with the next unit step.";
  if (weakUnit) {
    const u = getUnit(weakUnit);
    if (u) {
      const low = STEPS.map((s) => ({ s, sc: scoreOf(u, s.id) ?? 0 })).sort((a, b) => a.sc - b.sc)[0];
      suggestion = `Unit ${u.unit} (${u.title}): “Tricky words” on the home screen, then ${low.s.label}.`;
    }
  }

  const voiceSel = h("select", { class: "input" }, h("option", { value: "" }, "Automatic (British English if available)"));
  const fillVoices = () => {
    const cur = settings().voiceURI;
    voiceSel.replaceChildren(h("option", { value: "" }, "Automatic (British English if available)"), ...englishVoices().map((v) => h("option", { value: v.voiceURI, selected: v.voiceURI === cur || undefined }, `${v.name} (${v.lang})`)));
  };
  fillVoices();
  speechSynthesis?.addEventListener?.("voiceschanged", fillVoices);
  voiceSel.addEventListener("change", () => {
    updateSettings({ voiceURI: voiceSel.value });
    speak(`Hello ${childName()}! Camels can survive in the hot desert.`);
  });

  const rate = h("input", { type: "range", min: "0.6", max: "1.2", step: "0.05", value: String(settings().rate), class: "input" });
  rate.addEventListener("change", () => {
    updateSettings({ rate: Number(rate.value) });
    speak("This is how fast I talk.");
  });
  const name = h("input", { class: "input", value: settings().childName, "aria-label": "Child's name" });
  name.addEventListener("change", () => updateSettings({ childName: name.value.trim() || "Zahraa" }));
  const praiseToggle = h("input", { type: "checkbox", checked: settings().speakPraise || undefined });
  praiseToggle.addEventListener("change", () => updateSettings({ speakPraise: praiseToggle.checked }));

  app.replaceChildren(
    h(
      "div",
      { class: "page parent" },
      topbar("Parent view", "#/"),
      h(
        "div",
        { class: "stat-tiles" },
        h("div", { class: "tile-stat" }, h("b", {}, String(masteredWords)), h("span", {}, "items mastered")),
        h("div", { class: "tile-stat" }, h("b", {}, `${streak()}`), h("span", {}, "day streak")),
        h("div", { class: "tile-stat" }, h("b", {}, lastActive() ?? "—"), h("span", {}, "last active")),
      ),
      h("section", { class: "panel" }, h("h2", {}, "This week"), skillRows(thisWeek())),
      h(
        "section",
        { class: "panel" },
        h("h2", {}, "Needs practice"),
        weak.length
          ? h("ul", { class: "weak" }, ...weak.slice(0, 10).map(([, w]) => h("li", {}, h("b", {}, w.label), h("span", { class: "sub" }, ` Unit ${w.unit} · ${w.correct}✔ ${w.incorrect}✘`))))
          : h("p", { class: "sub" }, "Nothing yet — great!"),
        h("p", { class: "suggest" }, "💡 Suggested: ", suggestion),
      ),
      h(
        "section",
        { class: "panel" },
        h("h2", {}, "Units"),
        h(
          "table",
          { class: "units-table" },
          h("tr", {}, h("th", {}, "Unit"), ...STEPS.map((s) => h("th", { title: s.label }, s.emoji)), h("th", {}, "%")),
          ...readyUnits().map((u) => h("tr", {}, h("td", {}, `${u.unit}. ${u.title}`), ...STEPS.map((s) => h("td", {}, scoreOf(u, s.id) !== undefined ? `${scoreOf(u, s.id)}` : "·")), h("td", {}, h("b", {}, `${unitPercent(u)}%`)))),
        ),
      ),
      h(
        "section",
        { class: "panel" },
        h("h2", {}, "Recent results"),
        results().length
          ? h("ul", { class: "results" }, ...results().slice(0, 10).map((r) => h("li", {}, h("span", { class: "sub" }, r.date), ` Unit ${r.unit} · ${STEPS.find((s) => r.step.startsWith(s.id))?.label ?? r.step}${r.step.includes(":") ? ` (${r.step.split(":")[1]})` : ""} `, h("b", {}, `${r.score}%`), ` ${stars(r.score)}`)))
          : h("p", { class: "sub" }, "No activities finished yet."),
      ),
      h("section", { class: "panel" }, h("h2", {}, "All time"), skillRows(skills())),
      h(
        "section",
        { class: "panel settings" },
        h("h2", {}, "Settings"),
        h("label", {}, "Child's name", name),
        h("label", {}, "Voice", voiceSel),
        h("label", {}, "Speaking speed", rate),
        h("label", { class: "check" }, praiseToggle, " Say praise out loud"),
        h(
          "div",
          { class: "row" },
          h(
            "button",
            {
              class: "btn",
              onclick: () => {
                const p = prompt("New 4-digit PIN");
                if (p && /^\d{4}$/.test(p)) updateSettings({ pin: p });
              },
            },
            "Change PIN",
          ),
          h(
            "button",
            {
              class: "btn danger",
              onclick: () => {
                if (confirm(`Delete all of ${childName()}'s progress on this device?`)) {
                  resetProgress();
                  dashboard(app);
                }
              },
            },
            "Reset progress",
          ),
        ),
        h("p", { class: "sub" }, "Progress is saved in this browser only. It does not sync between the iPad and the phone."),
      ),
    ),
  );
}
