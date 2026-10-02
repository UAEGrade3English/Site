import "./styles.css";
import { getUnit } from "./data";
import { speak } from "./speech";
import { homeView } from "./views/home";
import { unitView, practiceView, spellingView, quizView, STEP_IDS } from "./views/unit";
import { wordsView } from "./views/words";
import { sentencesView } from "./views/sentences";
import { grammarListView, grammarTopicView } from "./views/grammar";
import { readingView } from "./views/reading";
import { gamesView, gameView } from "./views/games";
import { reviewView } from "./views/review";
import { parentView } from "./views/parent";
import { h } from "./ui";

const app = document.getElementById("app")!;

function notFound() {
  app.replaceChildren(h("div", { class: "page" }, h("p", {}, "Page not found."), h("a", { class: "btn primary", href: "#/" }, "Home")));
}

function route() {
  speechSynthesis?.cancel();
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  window.scrollTo(0, 0);
  if (parts.length === 0) return homeView(app);
  if (parts[0] === "review") return reviewView(app);
  if (parts[0] === "parent") return parentView(app);
  if (parts[0] === "u") {
    const unit = getUnit(Number(parts[1]));
    if (!unit) return notFound();
    const step = parts[2];
    if (!step) return unitView(app, unit);
    if (!STEP_IDS.includes(step) && step !== "game") return notFound();
    switch (step) {
      case "words":
        return wordsView(app, unit);
      case "practice":
        return practiceView(app, unit);
      case "sentences":
        return sentencesView(app, unit);
      case "grammar":
        return parts[3] ? grammarTopicView(app, unit, parts[3], parts[4] === "practise") : grammarListView(app, unit);
      case "reading":
        return readingView(app, unit, parts[3] === "questions");
      case "spelling":
        return spellingView(app, unit);
      case "games":
        return gamesView(app, unit);
      case "game":
        return gameView(app, unit, parts[3]);
      case "quiz":
        return quizView(app, unit);
    }
  }
  notFound();
}

window.addEventListener("hashchange", route);
route();

// iOS only allows speech after a user gesture: prime it on the first tap.
document.addEventListener(
  "pointerdown",
  () => {
    try {
      speak(" ");
    } catch {
      /* ignore */
    }
  },
  { once: true },
);
