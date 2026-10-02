# Grade 3 English — Zahraa's practice app

A small static web app for practising the UAE MoE Grade 3 English curriculum at home:
vocabulary with tap-to-hear pronunciation, sentences, grammar, reading, spelling, games and
quizzes, with progress and "tricky words" saved in the browser. See [SPEC.md](SPEC.md).

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (also reachable from the iPad on the same Wi-Fi)
npm run build      # type-check + production build into dist/
```

## Deploy (GitHub Pages)

1. Repo: https://github.com/UAEGrade3English/Site
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` deploys to https://uaegrade3english.github.io/Site/.

## Adding a unit

Add `data/term-1/unit-NN.json` (copy `unit-04.json` as a template) and put its images in
`public/img/uN/`. It is picked up automatically; the home-screen list is `data/term-1/units.json`.

## Layout

```
data/term-1/      curriculum content (JSON) — separate from code
public/img/       pictures (u4 = Unit 4, u5 = Unit 5)
src/questions.ts  builds exercises from unit data
src/runner.ts     shared exercise player (choice, letter tiles, word order, typing)
src/store.ts      progress + mastery in localStorage
src/speech.ts     Web Speech API (en-GB voice preferred)
src/views/        screens (home, unit, words, sentences, grammar, reading, games, review, parent)
docs/             curriculum map
```

## Notes

- Progress lives in the browser on each device; the iPad and phone are tracked separately.
- The parent area (🔒 Parents, bottom of the home screen) asks for a 4-digit PIN on first use.
- Pictures in `public/img/` are cropped from the MoE Activity Book for family use. A GitHub
  Pages site on a free account is public, so keep that in mind before sharing the link.
  The textbook PDF itself is git-ignored.
