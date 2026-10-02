import { allUnits, getUnit } from "../data";
import { childName, masteredToday, streak, weakItems } from "../store";
import { h, stars } from "../ui";
import { unitPercent } from "./unit";

export function homeView(app: HTMLElement) {
  const s = streak();
  const today = masteredToday();
  const weak = weakItems().length;

  const list = h("div", { class: "unit-list" });
  for (const stub of allUnits) {
    const unit = getUnit(stub.unit);
    if (!unit) {
      list.append(
        h(
          "div",
          { class: "unit-card soon" },
          h("span", { class: "u-emoji" }, stub.emoji),
          h("div", { class: "u-text" }, h("span", { class: "u-num" }, `Unit ${stub.unit}`), h("span", { class: "u-title" }, stub.title)),
          h("span", { class: "u-badge" }, "Soon"),
        ),
      );
      continue;
    }
    const pct = unitPercent(unit);
    list.append(
      h(
        "a",
        { class: "unit-card", href: `#/u/${unit.unit}` },
        h("span", { class: "u-emoji" }, unit.emoji),
        h("div", { class: "u-text" }, h("span", { class: "u-num" }, `Unit ${unit.unit}`), h("span", { class: "u-title" }, unit.title)),
        h(
          "span",
          { class: "u-progress" },
          pct > 0 ? h("span", { class: "u-stars" }, stars(pct)) : null,
          h("span", { class: pct > 0 ? "u-pct" : "u-badge new" }, pct > 0 ? `${pct}%` : "New"),
        ),
      ),
    );
  }

  app.replaceChildren(
    h(
      "div",
      { class: "page home" },
      h(
        "header",
        { class: "hello" },
        h("div", {}, h("h1", {}, `Hi ${childName()}! 👋`), h("p", { class: "sub" }, "English — Grade 3")),
        h("div", { class: "chips" }, s > 0 ? h("span", { class: "chip" }, `🔥 ${s} day${s > 1 ? "s" : ""}`) : null, today > 0 ? h("span", { class: "chip" }, `⭐ ${today} mastered today`) : null),
      ),
      weak > 0
        ? h("a", { class: "review-banner", href: "#/review" }, h("span", { class: "rb-emoji" }, "🧠"), h("span", {}, h("b", {}, "Tricky words"), h("br"), `${Math.min(weak, 10)} to practise`), h("span", { class: "rb-go" }, "➜"))
        : null,
      h("h2", { class: "term" }, "Term 1"),
      list,
      h("footer", { class: "home-foot" }, h("a", { href: "#/parent", class: "parent-link" }, "🔒 Parents")),
    ),
  );
}
