# UAE Grade 3 English Smart Learning Web App --- Specification

## 1. Project Goal

Build a child-friendly web application that follows the **UAE Ministry
of Education Grade 3 English curriculum** as closely as practical,
unit-by-unit and lesson-by-lesson.

The app is intended primarily for home revision and independent
learning. It should not simply display a textbook PDF. It should
transform the curriculum into short, interactive learning activities
while keeping the same curriculum sequence, vocabulary, grammar topics,
themes, and learning objectives.

The first deployment target is **GitHub Pages**, so the initial version
should be a static web application that works well on phones, tablets,
and desktop browsers.

------------------------------------------------------------------------

## 2. Core Principle: Stay Close to the Book

The application's navigation and content structure should mirror the
current Grade 3 English curriculum.

Preferred hierarchy:

``` text
Grade 3 English
└── Term
    └── Unit / Week
        └── Lesson
            ├── Learn
            ├── Vocabulary
            ├── Sentences
            ├── Reading
            ├── Grammar
            ├── Listening / Pronunciation
            ├── Practice
            ├── Quiz
            └── Review
```

A child who is studying a particular unit or lesson at school should be
able to open the corresponding lesson in the app and practise the same
vocabulary, language skill, grammar point, and learning objective.

The app should preserve, where appropriate:

-   term and unit/week order
-   lesson themes
-   target vocabulary
-   spelling targets
-   phonics targets
-   grammar topics
-   reading skills
-   writing skills
-   speaking/listening objectives
-   curriculum learning outcomes
-   exercise *types* and skills being tested

For public distribution, avoid reproducing substantial copyrighted
textbook passages, illustrations, page layouts, or exercises verbatim
unless permission/licensing permits it. Prefer original examples and
exercises that are tightly aligned to the same curriculum objectives.

------------------------------------------------------------------------

## 3. Student Experience

### 3.1 Home Screen

The home screen should be extremely simple.

Example:

``` text
English — Grade 3

Term 1

Week 1 — Back to School
Week 2 — My Daily Routine
Week 3 — Feelings
Week 4 — ...
```

Show progress for each lesson/unit.

Example:

``` text
Week 1 — Back to School       ★★★  85%
Week 2 — My Daily Routine     ★★☆  60%
Week 3 — Feelings             New
```

### 3.2 Lesson Flow

A typical lesson should follow a short sequence:

1.  Learn target words
2.  Hear and repeat the words
3.  See words used in sentences
4.  Complete quick vocabulary practice
5.  Learn the grammar/language point
6.  Read or listen to a short passage
7.  Complete comprehension/practice activities
8.  Take a mini quiz
9.  Review mistakes

Lessons should be broken into small activities rather than long pages.

------------------------------------------------------------------------

## 4. Vocabulary

Each vocabulary item should support:

-   word
-   optional picture/illustration
-   child-friendly definition
-   example sentence
-   pronunciation button
-   mastery status
-   optional spelling practice

Example card:

``` text
survive

🔊 Listen

Meaning:
to stay alive

Example:
Camels can survive in the hot desert.

🔊 Listen to sentence
```

### 4.1 Click-to-Hear Pronunciation

This is a core requirement.

A child should be able to click/tap a word to hear it pronounced.

Initial implementation can use the browser **Web Speech API /
SpeechSynthesis API**.

Example JavaScript concept:

``` javascript
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
```

Where practical, individual words displayed in learning sentences should
also be tappable.

Example:

``` text
Camels  can  survive  in  the  hot  desert.
   🔊    🔊      🔊     🔊  🔊   🔊     🔊
```

A whole-sentence Listen button should also be available.

The implementation should allow the preferred English voice/accent to be
configured because browser/device voices vary.

------------------------------------------------------------------------

## 5. Vocabulary Activities

Support activities such as:

### Listen and Choose

Play:

> 🔊 "survive"

Show several choices and ask the student to tap the correct word.

### Picture Matching

Match a target word to a suitable image.

### Meaning Matching

Match words to child-friendly definitions.

### Missing Letters

``` text
s _ r v _ v e
```

### Spelling Dictation

Play a word without initially displaying it.

The child types the word.

### Word Unscramble

``` text
v i v r s u e
```

Rearrange into:

``` text
survive
```

------------------------------------------------------------------------

## 6. Sentences

Store important target/example sentences separately from vocabulary.

Features:

-   tap individual words for pronunciation
-   listen to the whole sentence
-   hide/show sentence
-   sentence reconstruction
-   missing-word exercises
-   choose-the-correct-word exercises

Example:

``` text
Camels can survive in the hot desert.
```

Practice:

``` text
Camels can ______ in the hot desert.

A. survive
B. sleep
C. pencil
```

Sentence ordering:

``` text
desert | the | Camels | in | live
```

Student rearranges the words into the correct sentence.

------------------------------------------------------------------------

## 7. Reading

Reading activities should be aligned to the curriculum skill and theme.

Where copyrighted textbook passages cannot be republished, create a new
age-appropriate passage that:

-   uses the same target vocabulary
-   practises the same reading skill
-   matches approximately the same difficulty
-   stays on the same topic/theme

Reading features:

-   readable large text
-   optional Listen button
-   optional tap-to-hear individual words
-   comprehension questions
-   vocabulary-in-context questions
-   true/false
-   sequencing
-   multiple choice
-   short answer where appropriate

------------------------------------------------------------------------

## 8. Grammar

Each grammar lesson should contain:

1.  very short explanation
2.  examples
3.  interactive guided practice
4.  independent practice
5.  mini quiz

Avoid long grammar explanations.

Example:

``` text
Present Simple

I play football.
She plays football.

Remember:
With he/she/it, we often add -s.
```

Then immediately practise the concept.

------------------------------------------------------------------------

## 9. Listening and Speaking

Listening exercises may use text-to-speech initially.

Examples:

-   listen and select the word
-   listen and type the word
-   listen and choose the matching sentence
-   listen and arrange words
-   listen to a short passage and answer questions

Speaking practice:

``` text
Listen:
🔊 I get up at seven o'clock.

Now say it yourself:
🎤 Repeat
```

Speech recognition can be investigated later. It should not be required
for the MVP because browser/device support and child speech recognition
quality can vary.

------------------------------------------------------------------------

## 10. Exercise Types

The exercise engine should support reusable question types:

-   multiple choice
-   true/false
-   fill in the blank
-   word matching
-   picture matching
-   sentence ordering
-   word ordering
-   missing letters
-   spelling/dictation
-   listen and choose
-   listen and type
-   reading comprehension
-   drag-and-drop classification

Exercises should provide immediate, encouraging feedback.

------------------------------------------------------------------------

## 11. Smart Review / Mastery

The app should remember which words and concepts the child struggles
with.

Each item can maintain a simple mastery score.

Example:

``` json
{
  "word": "survive",
  "correct": 3,
  "incorrect": 2,
  "mastery": 0.6,
  "lastReviewed": "2026-10-02"
}
```

Items answered incorrectly should appear more frequently in review.

Items consistently answered correctly should appear less frequently.

Later versions can implement a proper spaced-repetition algorithm.

------------------------------------------------------------------------

## 12. Progress

Track locally:

-   lessons completed
-   vocabulary mastered
-   spelling accuracy
-   grammar accuracy
-   reading/comprehension accuracy
-   quiz scores
-   difficult words
-   last activity date

For the GitHub Pages MVP, store progress using browser `localStorage` or
IndexedDB.

No login or backend is required initially.

Important limitation: local browser storage does not automatically
synchronize between different devices. Cloud synchronization can be
added later.

------------------------------------------------------------------------

## 13. Parent View

Provide a simple parent dashboard.

Example:

``` text
This Week

Vocabulary       82%
Spelling         65%
Grammar          90%
Reading          75%

Needs Practice

• because
• different
• favourite
• present-simple questions
```

Also show:

-   completed lessons
-   time/practice sessions if reliably measurable
-   recent quiz results
-   weak vocabulary
-   suggested review lesson

------------------------------------------------------------------------

## 14. Gamification

Keep gamification lightweight.

Possible features:

-   stars
-   lesson completion badges
-   streaks
-   mastery percentage
-   celebration animation after completing a lesson
-   "5 words mastered today"

Avoid distracting game mechanics that compete with learning.

------------------------------------------------------------------------

## 15. Accessibility / Child-Friendly UI

Target approximately 8--9-year-old learners.

Requirements:

-   large tap targets
-   large readable fonts
-   minimal text on navigation screens
-   clear icons
-   tablet-first responsive design
-   no advertising
-   no external distractions
-   audio controls visible beside relevant content
-   keyboard accessibility where practical
-   strong contrast
-   encouraging but concise feedback

------------------------------------------------------------------------

## 16. Content Data Model

Keep curriculum content separate from presentation code.

Suggested structure:

``` text
data/
  term-1/
    week-01.json
    week-02.json
    week-03.json
  term-2/
  term-3/
```

Example lesson data:

``` json
{
  "term": 1,
  "week": 1,
  "title": "Back to School",
  "vocabulary": [
    {
      "word": "classroom",
      "definition": "a room where students learn",
      "example": "Our classroom is bright."
    }
  ],
  "grammar": [],
  "sentences": [],
  "reading": [],
  "activities": [],
  "quiz": []
}
```

This allows curriculum content to be updated without redesigning the
application.

------------------------------------------------------------------------

## 17. Suggested Technology

### MVP

-   HTML5
-   CSS
-   JavaScript or TypeScript
-   optional lightweight framework such as React/Vite
-   Web Speech API for pronunciation
-   localStorage or IndexedDB for progress
-   JSON curriculum files
-   GitHub repository
-   GitHub Pages deployment

A backend is unnecessary for the first version.

### Future Options

If needed later:

-   PWA/offline installation
-   cloud progress synchronization
-   parent accounts
-   multiple children
-   teacher dashboard
-   recorded human pronunciation
-   speech recognition
-   AI-generated adaptive exercises with safeguards
-   Firebase/Supabase or another backend

------------------------------------------------------------------------

## 18. GitHub Pages

The site should be deployable to:

``` text
https://USERNAME.github.io/grade3-english/
```

Recommended repository structure:

``` text
grade3-english/
├── README.md
├── SPEC.md
├── index.html
├── src/
├── public/
├── data/
│   ├── term-1/
│   ├── term-2/
│   └── term-3/
└── docs/
    └── curriculum-map.md
```

------------------------------------------------------------------------

## 19. Source Material / Current Book Links

### Grade 3 English Activity Book --- Term 1 --- 2026--2027

Source page:

https://mrsasmaa.com/files/elementary/003/english/%D8%A7%D9%84%D9%81%D8%B5%D9%84%20%D8%A7%D9%84%D8%A3%D9%88%D9%84/%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%B7%D8%A7%D9%84%D8%A8/%D9%83%D8%AA%D8%A7%D8%A8-%D8%A7%D9%84%D8%B7%D8%A7%D9%84%D8%A8-activity-book-%D8%A7%D9%84%D9%84%D8%BA%D8%A9-%D8%A7%D9%84%D8%A5%D9%86%D8%AC%D9%84%D9%8A%D8%B2%D9%8A%D8%A9-%D8%A7%D9%84%D8%B5%D9%81-%D8%A7%D9%84%D8%AB%D8%A7%D9%84%D8%AB-%D8%A7%D9%84%D9%81%D8%B5%D9%84-%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A-%D8%A7%D9%84%D8%A3%D9%88%D9%84-2026-2027

Listed PDF filename:

``` text
انجليزي_كتاب_الطالب_3_3.pdf
```

The source page provides Google Drive preview/download links. Because
the underlying Drive URL can change, keep the source page above as the
canonical external reference rather than hard-coding an unstable
download endpoint.

### Grade 3 English Comprehensive Curriculum Guide --- Term 1 --- 2026--2027

Source page:

https://mrsasmaa.com/files/elementary/003/english/%D8%A7%D9%84%D9%81%D8%B5%D9%84%20%D8%A7%D9%84%D8%A3%D9%88%D9%84/%D9%85%D9%84%D9%81%D8%A7%D8%AA%20%D8%AA%D8%B9%D9%84%D9%8A%D9%85%D9%8A%D8%A9/%D8%A7%D9%84%D8%AF%D9%84%D9%8A%D9%84-%D8%A7%D9%84%D8%B4%D8%A7%D9%85%D9%84-comprehensive-curriculum-guide-%D8%A7%D9%84%D9%84%D8%BA%D8%A9-%D8%A7%D9%84%D8%B5%D9%81-%D8%A7%D9%84%D8%AB%D8%A7%D9%84%D8%AB-%D8%A7%D9%84%D9%81%D8%B5%D9%84-%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D9%8A-%D8%A7%D9%84%D8%A3%D9%88%D9%84-2026-2027

Listed PDF filename:

``` text
انجليزي_الدليل_الشامل_3_25.pdf
```

### Grade 3 English Resource Index

https://mrsasmaa.com/files/browse/003/english

This index currently includes Grade 3 English books, curriculum guides,
worksheets, lesson presentations, reviews, and interactive tests.

> Note: MrsAsmaa / "ملفاتي" is a third-party educational resource site,
> not the UAE Ministry of Education website. Verify licensing/permission
> before redistributing textbook files or substantial copyrighted
> material through the GitHub repository.

------------------------------------------------------------------------

## 20. Existing UAE Digital Platforms

The UAE Ministry of Education has previously documented several
digital-learning systems.

### Al Diwan

MoE documentation describes **Al Diwan** as a platform for displaying
electronic versions of textbooks and allowing users to download them for
offline use.

This means the UAE already has/had an official mechanism for digital
textbooks, but this is conceptually different from the proposed
child-focused practice application.

### Alef Platform

The Ministry announced a broad Alef Platform rollout to UAE public
schools in 2020. The announcement described:

-   interactive digital learning
-   curriculum-aligned content
-   videos/interactivities/games
-   lesson data and feedback
-   personalized/mastery-oriented learning

The documented nationwide rollout at that time covered **Grades 5--9**,
including English among the core subjects. Therefore, this announcement
does not establish that the same Alef experience is currently provided
for Grade 3 English.

Before assuming current Grade 3 access, check the child's school/MoE
account because platform availability and grade coverage may have
changed since those announcements.

### Why Build This Project?

The proposed project has a narrower purpose:

> A lightweight, parent-controlled Grade 3 English companion that
> mirrors the child's current UAE English units and makes vocabulary,
> pronunciation, spelling, grammar, reading, and revision immediately
> accessible.

It can therefore complement official systems rather than trying to
replace them.

------------------------------------------------------------------------

## 21. Copyright / Repository Policy

Do **not** commit the full textbook PDF to a public GitHub repository
unless redistribution rights are confirmed.

Recommended repository policy:

-   link to legitimate source material
-   store curriculum mappings and metadata
-   store target vocabulary where legally appropriate
-   create original explanations
-   create original practice sentences
-   create original reading passages
-   create original questions/exercises
-   use original/licensed/public-domain images
-   do not copy substantial textbook pages or illustrations
-   do not reproduce substantial copyrighted passages verbatim

The app can remain extremely close to the curriculum without being a
public clone of the textbook.

------------------------------------------------------------------------

## 22. Development Plan

### Phase 1 --- Curriculum Mapping

Extract/map:

-   terms
-   weeks/units
-   lessons
-   vocabulary
-   phonics
-   spelling
-   grammar
-   reading skills
-   writing skills
-   speaking/listening objectives
-   assessment objectives

Create:

``` text
docs/curriculum-map.md
```

### Phase 2 --- One Complete Pilot Lesson

Build one representative lesson with:

-   vocabulary cards
-   tap-to-hear pronunciation
-   sentence audio
-   vocabulary practice
-   grammar practice
-   reading activity
-   quiz
-   local progress saving

Test it with the child before converting the whole curriculum.

### Phase 3 --- Term 1

Convert the remaining Term 1 curriculum.

### Phase 4 --- Smart Revision

Add:

-   mastery scoring
-   difficult-word queue
-   spaced review
-   parent dashboard

### Phase 5 --- Terms 2 and 3

Map and implement the remaining current curriculum as source material
becomes available.

------------------------------------------------------------------------

## 23. Definition of MVP Success

The MVP is successful when a student can:

1.  open the site on an iPad/phone/computer;
2.  select the same unit/week currently being studied at school;
3.  learn its target vocabulary;
4.  tap words and sentences to hear English pronunciation;
5.  practise vocabulary, spelling, grammar and reading;
6.  complete a short quiz;
7.  leave the site and return later with progress preserved;
8.  receive extra practice on items previously answered incorrectly.

The parent should be able to quickly see what has been completed and
what needs more practice.
