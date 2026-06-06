# docs/SEED_CONTENT_GUIDE.md — LangPath Seed Content Guide

## Content Rules

**Critical: Do NOT copy content from any external source.**

- Do not copy from Lingua.com
- Do not copy from textbooks, PDFs, or other language learning platforms
- Do not copy from news articles, Wikipedia, or any copyrighted publication
- Do not copy audio scripts, lesson plans, or vocabulary lists from commercial platforms
- All content must be written from scratch, specifically for LangPath
- Mark all sample content clearly as demo content in the database (`summary` field)

---

## Sample Lesson Structure

Every lesson in the database should have these fields populated:

```
title          — e.g., "My First Day at School"
slug           — e.g., "my-first-day-at-school"
language       — e.g., English
skill          — e.g., Reading
level          — e.g., A1
summary        — 1-2 sentence description for lesson cards
content        — main body (reading text, transcript, etc.)
vocabulary     — list of key words with meanings and example sentences
questions      — 4-8 comprehension/practice questions
answerOptions  — for each question (SINGLE_CHOICE / MULTIPLE_CHOICE)
explanation    — optional per question, shown after submission
seoTitle       — e.g., "My First Day at School — English Reading A1 | LangPath"
seoDesc        — e.g., "Read a short A1 English story about school life and answer comprehension questions."
isPremium      — false for free lessons, true for premium
status         — PUBLISHED for seed content
estimatedMinutes — realistic reading/listening/practice time
```

---

## Reading Lesson Format

**Guidelines:**
- Write short original stories in simple, clear language
- A1: 150–250 words, simple present/past tense, common vocabulary
- A2: 250–350 words, some narrative complexity, everyday topics
- B1: 350–500 words, varied tenses, moderate vocabulary
- B2+: 500+ words, complex sentences, specialized vocabulary

**Example A1 reading lesson (original content):**

```
Title: My First Day at School
Slug: my-first-day-at-school
Level: A1
Language: English
Skill: Reading

Content:
Today is my first day at school. I am excited but a little nervous.
My mother walks with me to the bus stop. The bus is big and yellow.

When I arrive at school, I see many children. Some of them are laughing
and talking. A tall woman stands at the door. She smiles and says,
"Welcome! I am Ms. Johnson, your teacher."

The classroom is bright and colorful. There are pictures on the walls
and books on the shelves. I sit at a desk near the window. A boy next
to me says, "Hi, I'm Tom. Do you want to be friends?"

In the morning, we learn English. Ms. Johnson reads a story about a
cat and a dog. I like English very much. After that, we have
mathematics. I count numbers from one to twenty.

At lunch, I eat with Tom and two other children. We talk about our
favorite games. I feel happy because I have new friends. After lunch,
we draw pictures and sing songs.

When the school day ends, I run to my mother. "How was your day?"
she asks. "It was great!" I say with a big smile. I cannot wait to
come back tomorrow.

Vocabulary:
- nervous: slightly afraid or worried — "I am excited but a little nervous."
- arrive: to reach a place after a journey — "When I arrive at school, I see many children."
- bright: full of light; having strong colors — "The classroom is bright and colorful."
- favorite: liked more than all others — "We talk about our favorite games."
```

---

## Listening Transcript Format

**Guidelines:**
- Write natural-sounding spoken text (not formal written prose)
- Use contractions: "I'm", "it's", "don't"
- Keep sentences shorter and more conversational than reading texts
- A1: very simple daily-life topics, 100–150 words
- A2: everyday conversations, 150–250 words
- B1+: discussions, opinions, narratives, 250–400 words

**Example A1 listening transcript (original content):**

```
Title: Morning Routine
Slug: morning-routine
Level: A1
Language: English
Skill: Listening

Transcript:
Every morning I wake up at half past six. First, I make a cup of
coffee and read the news on my phone. Then I take a shower and
get dressed.

For breakfast, I usually have eggs and toast. Sometimes I eat fruit
too. I enjoy the quiet time in the morning before the day gets busy.

I leave home at eight o'clock and take the bus to work. The bus
ride is about twenty minutes. I like to listen to music on the way.
```

---

## Dictation Format

**Guidelines:**
- Write short, clear sentences that can be typed from audio
- A1: 5–10 word sentences, only common words
- A2: 10–15 word sentences, simple structures
- B1+: 15–20 word sentences, some idiomatic language

**Example A1 dictation sentences (original content):**

```
Title: Simple Sentences
Slug: simple-sentences
Level: A1
Language: English
Skill: Dictation

Sentences:
1. The cat is sitting on the table.
2. I like to read books in the morning.
3. She goes to school by bus every day.
4. We have a big garden with many flowers.
5. My brother plays football on Saturdays.
```

---

## Grammar Exercise Format

**Guidelines:**
- Focus on one grammar point per lesson (e.g., simple past, modal verbs)
- Write original example sentences — no copying from textbooks
- A1: present simple, basic nouns/adjectives
- A2: past simple, present continuous, prepositions
- B1: present perfect, conditionals, passive voice

**Example A2 grammar lesson structure (original content):**

```
Title: Using the Simple Past
Slug: using-the-simple-past
Level: A2
Language: English
Skill: Grammar

Explanation:
We use the simple past to talk about actions that are finished.
For regular verbs, add -ed: walk → walked, play → played.
For irregular verbs, the form changes: go → went, eat → ate.

Example sentences (original):
- Yesterday, I walked to the market.
- She played the piano for one hour.
- They went to the beach last summer.
- He ate a sandwich for lunch.

Questions (fill-blank):
1. Last week, I _____ (visit) my grandmother. → visited
2. She _____ (not / go) to school yesterday. → did not go
3. _____ they _____ (arrive) on time? → Did ... arrive
```

---

## Vocabulary Format

**Guidelines:**
- Group vocabulary by topic (school, food, travel, work, family, etc.)
- Include pronunciation (IPA where possible)
- Write original example sentences
- A1/A2: 8–12 words per lesson
- B1+: 10–15 words per lesson

**Example A2 vocabulary lesson structure (original content):**

```
Title: Everyday Words
Slug: everyday-words
Level: A2
Language: English
Skill: Vocabulary

Words:
- library: /ˈlaɪ.brer.i/ — a place where people read or borrow books
  Example: "I study English at the library every Saturday."

- schedule: /ˈʃed.juːl/ — a plan listing events and times
  Example: "My schedule is very busy this week."

- journey: /ˈdʒɜːr.ni/ — an act of travelling from one place to another
  Example: "The journey from London to Paris takes about two hours."

- recipe: /ˈres.ɪ.pi/ — a set of instructions for cooking a dish
  Example: "I found a great recipe for chocolate cake."
```

---

## Quiz Format

**Guidelines:**
- 4–8 questions per lesson
- SINGLE_CHOICE: one correct answer, 4 plausible options
- MULTIPLE_CHOICE: 2–3 correct answers, 4–5 options
- FILL_BLANK: one correct word or short phrase
- DICTATION: exact sentence typed from audio

**Example SINGLE_CHOICE questions (for reading lesson above):**

```json
[
  {
    "type": "SINGLE_CHOICE",
    "prompt": "Where is the student going today?",
    "options": ["To the park", "To school", "To the supermarket", "To the library"],
    "correctIndex": 1,
    "explanation": "The text says 'Today is my first day at school.'"
  },
  {
    "type": "SINGLE_CHOICE",
    "prompt": "How does the student feel?",
    "options": ["Angry", "Sad", "Excited but nervous", "Bored"],
    "correctIndex": 2,
    "explanation": "The text says 'I am excited but a little nervous.'"
  }
]
```

---

## Recommended Vocabulary Topics

Use common, everyday topics so content stays relevant to all learners:

- School and education
- Travel and transport
- Food and cooking
- Family and relationships
- Work and jobs
- Daily routines and habits
- Weather and seasons
- Health and the body
- Shopping and money (not payment systems)
- Hobbies and free time
- Homes and furniture
- City and nature

---

## Seed Content Plan

For the MVP seed script, write at least:

| Language | Skill | Level | Count |
|----------|-------|-------|-------|
| English | Reading | A1 | 3 |
| English | Reading | A2 | 2 |
| English | Listening | A1 | 2 |
| English | Dictation | A1 | 2 |
| English | Vocabulary | A1 | 1 |
| English | Vocabulary | A2 | 1 |
| German | Reading | A1 | 2 |
| French | Reading | A1 | 1 |
| Spanish | Reading | A1 | 1 |

All content must be original. Keep each piece short and clearly written at the target level.
