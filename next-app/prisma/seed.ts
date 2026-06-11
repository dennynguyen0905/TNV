import { PrismaClient, QuestionType, LessonStatus, MediaType, WorkerJobType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // ─── Languages ──────────────────────────────────────────────────────────────

  const english = await prisma.language.upsert({
    where: { slug: 'english' },
    update: {},
    create: {
      name: 'English',
      slug: 'english',
      code: 'en',
      description: 'Learn English — the world\'s most widely spoken second language.',
      flagEmoji: '🇬🇧',
      isActive: true,
      sortOrder: 1,
    },
  })

  const german = await prisma.language.upsert({
    where: { slug: 'german' },
    update: {},
    create: {
      name: 'German',
      slug: 'german',
      code: 'de',
      description: 'Learn German — spoken by over 100 million people across Europe.',
      flagEmoji: '🇩🇪',
      isActive: true,
      sortOrder: 2,
    },
  })

  const french = await prisma.language.upsert({
    where: { slug: 'french' },
    update: {},
    create: {
      name: 'French',
      slug: 'french',
      code: 'fr',
      description: 'Learn French — an official language in 29 countries worldwide.',
      flagEmoji: '🇫🇷',
      isActive: true,
      sortOrder: 3,
    },
  })

  const spanish = await prisma.language.upsert({
    where: { slug: 'spanish' },
    update: {},
    create: {
      name: 'Spanish',
      slug: 'spanish',
      code: 'es',
      description: 'Learn Spanish — spoken by over 500 million people globally.',
      flagEmoji: '🇪🇸',
      isActive: true,
      sortOrder: 4,
    },
  })

  console.log('Languages seeded:', english.slug, german.slug, french.slug, spanish.slug)

  // ─── Skills ─────────────────────────────────────────────────────────────────

  const reading = await prisma.skill.upsert({
    where: { slug: 'reading' },
    update: {},
    create: {
      name: 'Reading',
      slug: 'reading',
      description: 'Improve reading comprehension through graded texts and questions.',
      isActive: true,
      sortOrder: 1,
    },
  })

  const listening = await prisma.skill.upsert({
    where: { slug: 'listening' },
    update: {},
    create: {
      name: 'Listening',
      slug: 'listening',
      description: 'Train your ear with audio lessons and comprehension exercises.',
      isActive: true,
      sortOrder: 2,
    },
  })

  const dictation = await prisma.skill.upsert({
    where: { slug: 'dictation' },
    update: {},
    create: {
      name: 'Dictation',
      slug: 'dictation',
      description: 'Sharpen spelling and listening by transcribing spoken sentences.',
      isActive: true,
      sortOrder: 3,
    },
  })

  const grammar = await prisma.skill.upsert({
    where: { slug: 'grammar' },
    update: {},
    create: {
      name: 'Grammar',
      slug: 'grammar',
      description: 'Master grammar rules with clear explanations and practice.',
      isActive: true,
      sortOrder: 4,
    },
  })

  const vocabulary = await prisma.skill.upsert({
    where: { slug: 'vocabulary' },
    update: {},
    create: {
      name: 'Vocabulary',
      slug: 'vocabulary',
      description: 'Build your word bank with contextual vocabulary lessons.',
      isActive: true,
      sortOrder: 5,
    },
  })

  console.log('Skills seeded:', reading.slug, listening.slug, dictation.slug, grammar.slug, vocabulary.slug)

  // ─── Levels ─────────────────────────────────────────────────────────────────

  const levels = await Promise.all([
    prisma.level.upsert({ where: { code: 'A1' }, update: {}, create: { code: 'A1', name: 'Beginner', sortOrder: 1 } }),
    prisma.level.upsert({ where: { code: 'A2' }, update: {}, create: { code: 'A2', name: 'Elementary', sortOrder: 2 } }),
    prisma.level.upsert({ where: { code: 'B1' }, update: {}, create: { code: 'B1', name: 'Intermediate', sortOrder: 3 } }),
    prisma.level.upsert({ where: { code: 'B2' }, update: {}, create: { code: 'B2', name: 'Upper Intermediate', sortOrder: 4 } }),
    prisma.level.upsert({ where: { code: 'C1' }, update: {}, create: { code: 'C1', name: 'Advanced', sortOrder: 5 } }),
    prisma.level.upsert({ where: { code: 'C2' }, update: {}, create: { code: 'C2', name: 'Proficient', sortOrder: 6 } }),
  ])

  const [a1] = levels
  console.log('Levels seeded: A1–C2')

  // ─── Users ──────────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('Password123!', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      isPremium: true,
    },
  })

  const learnerUser = await prisma.user.upsert({
    where: { email: 'learner@example.com' },
    update: {},
    create: {
      email: 'learner@example.com',
      passwordHash,
      name: 'Learner User',
      role: 'LEARNER',
      status: 'ACTIVE',
      isPremium: false,
    },
  })

  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@example.com' },
    update: {},
    create: {
      email: 'premium@example.com',
      passwordHash,
      name: 'Premium Learner',
      role: 'LEARNER',
      status: 'ACTIVE',
      isPremium: true,
    },
  })

  console.log('Users seeded:', adminUser.email, learnerUser.email, premiumUser.email)

  // ─── Lessons ────────────────────────────────────────────────────────────────

  const lessonReading = await prisma.lesson.upsert({
    where: {
      languageId_skillId_slug: {
        languageId: english.id,
        skillId: reading.id,
        slug: 'first-day-school',
      },
    },
    update: {},
    create: {
      title: 'A First Day at School',
      slug: 'first-day-school',
      summary: 'Follow Leo on his first day at a new school and learn key vocabulary for school life.',
      content: `Leo woke up early on Monday morning. Today was his first day at Greenfield School.

He packed his bag carefully: notebooks, pencils, a ruler, and his favourite blue pen. His mother made him a sandwich for lunch.

At school, his teacher, Mrs. Park, smiled and pointed to an empty seat near the window. "Good morning, Leo. Welcome to Class 4A."

Leo sat down and looked around the room. There were colourful posters on the walls and a large whiteboard at the front. He counted twelve other students.

During break time, a boy named Sam offered Leo half of his orange. "Do you like football?" Sam asked.

"Yes, very much," said Leo.

By the end of the day, Leo had three new friends and a homework assignment about his favourite animal. He chose the penguin.`,
      languageId: english.id,
      skillId: reading.id,
      levelId: a1.id,
      status: LessonStatus.PUBLISHED,
      isPremium: false,
      seoTitle: 'A First Day at School — English Reading A1',
      seoDescription: 'Beginner English reading passage about starting school, with comprehension questions.',
      publishedAt: new Date('2026-01-01'),
    },
  })

  const lessonListening = await prisma.lesson.upsert({
    where: {
      languageId_skillId_slug: {
        languageId: english.id,
        skillId: listening.id,
        slug: 'morning-routine',
      },
    },
    update: {},
    create: {
      title: 'A Typical Morning Routine',
      slug: 'morning-routine',
      summary: 'Listen to Sara describe her morning routine and answer questions about daily habits.',
      content: null,
      languageId: english.id,
      skillId: listening.id,
      levelId: a1.id,
      status: LessonStatus.PUBLISHED,
      isPremium: false,
      audioUrl: '/audio/morning-routine.mp3',
      transcript: `Hi, my name is Sara. Every morning I wake up at seven o'clock. First, I wash my face and brush my teeth. Then I go to the kitchen and make breakfast. I usually have toast with butter and a glass of orange juice.

After breakfast, I get dressed. I check the weather on my phone so I know what to wear. If it is cold, I put on a jacket.

I leave the house at eight fifteen. I walk to the bus stop, which takes about ten minutes. The bus arrives at eight twenty-five.

At work, I start at nine o'clock. My colleagues are very friendly. We always say good morning to each other.

I hope you enjoyed learning about my morning routine. What do you do in the morning?`,
      seoTitle: 'A Typical Morning Routine — English Listening A1',
      seoDescription: 'Beginner English listening passage about daily morning habits.',
      publishedAt: new Date('2026-01-05'),
    },
  })

  const lessonDictation = await prisma.lesson.upsert({
    where: {
      languageId_skillId_slug: {
        languageId: english.id,
        skillId: dictation.id,
        slug: 'simple-sentences',
      },
    },
    update: {},
    create: {
      title: 'Simple Sentences Practice',
      slug: 'simple-sentences',
      summary: 'Practise spelling and listening accuracy by transcribing short everyday sentences.',
      content: null,
      languageId: english.id,
      skillId: dictation.id,
      levelId: a1.id,
      status: LessonStatus.PUBLISHED,
      isPremium: false,
      audioUrl: '/audio/simple-sentences.mp3',
      transcript: `The dog is in the garden.
She drinks a cup of tea every morning.
My brother works at a hospital.
It is a sunny day today.
We go to school by bus.`,
      seoTitle: 'Simple Sentences Dictation — English A1',
      seoDescription: 'Beginner English dictation practice with simple everyday sentences.',
      publishedAt: new Date('2026-01-10'),
    },
  })

  const lessonVocabulary = await prisma.lesson.upsert({
    where: {
      languageId_skillId_slug: {
        languageId: english.id,
        skillId: vocabulary.id,
        slug: 'daily-words',
      },
    },
    update: {},
    create: {
      title: 'Essential Daily Words',
      slug: 'daily-words',
      summary: 'Learn twenty common English words you will use every single day.',
      content: null,
      languageId: english.id,
      skillId: vocabulary.id,
      levelId: a1.id,
      status: LessonStatus.PUBLISHED,
      isPremium: false,
      seoTitle: 'Essential Daily Words — English Vocabulary A1',
      seoDescription: 'Beginner English vocabulary: twenty essential everyday words.',
      publishedAt: new Date('2026-01-15'),
    },
  })

  const lessonGrammar = await prisma.lesson.upsert({
    where: {
      languageId_skillId_slug: {
        languageId: english.id,
        skillId: grammar.id,
        slug: 'simple-present',
      },
    },
    update: {},
    create: {
      title: 'The Simple Present Tense',
      slug: 'simple-present',
      summary: 'Understand how to form and use the simple present tense in English.',
      content: `The simple present tense describes habits, facts, and things that are generally true.

**Affirmative:** Subject + base verb (+ s/es for he/she/it)
- I walk to school.
- She walks to school.

**Negative:** Subject + do/does + not + base verb
- I do not (don't) like coffee.
- He does not (doesn't) like coffee.

**Question:** Do/Does + subject + base verb?
- Do you speak English?
- Does she speak French?

**Common time expressions:** always, usually, often, sometimes, never, every day, on Mondays.`,
      languageId: english.id,
      skillId: grammar.id,
      levelId: a1.id,
      status: LessonStatus.PUBLISHED,
      isPremium: false,
      seoTitle: 'Simple Present Tense — English Grammar A1',
      seoDescription: 'Beginner English grammar: how to form and use the simple present tense.',
      publishedAt: new Date('2026-01-20'),
    },
  })

  console.log('Lessons seeded:', lessonReading.slug, lessonListening.slug, lessonDictation.slug, lessonVocabulary.slug, lessonGrammar.slug)

  // ─── Questions ──────────────────────────────────────────────────────────────
  // Delete existing questions per lesson to keep seed idempotent

  await prisma.question.deleteMany({ where: { lessonId: lessonReading.id } })

  const q1 = await prisma.question.create({
    data: {
      lessonId: lessonReading.id,
      type: QuestionType.SINGLE_CHOICE,
      prompt: 'What did Leo pack in his school bag?',
      explanation: 'The text states Leo packed notebooks, pencils, a ruler, and his favourite blue pen.',
      sortOrder: 1,
      options: {
        create: [
          { text: 'Books, pencils, a ruler, and a blue pen', isCorrect: false, sortOrder: 1 },
          { text: 'Notebooks, pencils, a ruler, and a blue pen', isCorrect: true, sortOrder: 2 },
          { text: 'Notebooks, pens, a calculator, and a ruler', isCorrect: false, sortOrder: 3 },
          { text: 'A lunchbox, pencils, a ruler, and a red pen', isCorrect: false, sortOrder: 4 },
        ],
      },
    },
  })

  const q2 = await prisma.question.create({
    data: {
      lessonId: lessonReading.id,
      type: QuestionType.MULTIPLE_CHOICE,
      prompt: 'Which of the following are mentioned as being in the classroom?',
      explanation: 'The text mentions colourful posters on the walls and a large whiteboard at the front.',
      sortOrder: 2,
      options: {
        create: [
          { text: 'Colourful posters', isCorrect: true, sortOrder: 1 },
          { text: 'A large whiteboard', isCorrect: true, sortOrder: 2 },
          { text: 'A projector screen', isCorrect: false, sortOrder: 3 },
          { text: 'A globe', isCorrect: false, sortOrder: 4 },
        ],
      },
    },
  })

  const q3 = await prisma.question.create({
    data: {
      lessonId: lessonReading.id,
      type: QuestionType.FILL_BLANK,
      prompt: 'Leo chose the _____ as his favourite animal for the homework assignment.',
      answerText: 'penguin',
      explanation: 'The last sentence says Leo chose the penguin.',
      sortOrder: 3,
    },
  })

  await prisma.question.deleteMany({ where: { lessonId: lessonListening.id } })

  await prisma.question.create({
    data: {
      lessonId: lessonListening.id,
      type: QuestionType.SINGLE_CHOICE,
      prompt: 'What time does Sara usually wake up?',
      explanation: 'Sara says she wakes up at seven o\'clock every morning.',
      sortOrder: 1,
      options: {
        create: [
          { text: '6:00 AM', isCorrect: false, sortOrder: 1 },
          { text: '7:00 AM', isCorrect: true, sortOrder: 2 },
          { text: '7:30 AM', isCorrect: false, sortOrder: 3 },
          { text: '8:00 AM', isCorrect: false, sortOrder: 4 },
        ],
      },
    },
  })

  await prisma.question.create({
    data: {
      lessonId: lessonListening.id,
      type: QuestionType.FILL_BLANK,
      prompt: 'Sara usually has _____ with butter and a glass of orange juice for breakfast.',
      answerText: 'toast',
      explanation: 'Sara says she usually has toast with butter and orange juice.',
      sortOrder: 2,
    },
  })

  await prisma.question.deleteMany({ where: { lessonId: lessonDictation.id } })

  await prisma.question.create({
    data: {
      lessonId: lessonDictation.id,
      type: QuestionType.DICTATION,
      prompt: 'Listen and type the sentence you hear.',
      answerText: 'The dog is in the garden.',
      explanation: 'Focus on the article "the" and the preposition "in".',
      sortOrder: 1,
    },
  })

  await prisma.question.create({
    data: {
      lessonId: lessonDictation.id,
      type: QuestionType.DICTATION,
      prompt: 'Listen and type the sentence you hear.',
      answerText: 'She drinks a cup of tea every morning.',
      explanation: 'Notice the third-person "drinks" and the time expression "every morning".',
      sortOrder: 2,
    },
  })

  await prisma.question.deleteMany({ where: { lessonId: lessonGrammar.id } })

  await prisma.question.create({
    data: {
      lessonId: lessonGrammar.id,
      type: QuestionType.SINGLE_CHOICE,
      prompt: 'Which sentence uses the simple present tense correctly?',
      explanation: 'Third-person singular (he/she/it) requires adding -s or -es to the base verb.',
      sortOrder: 1,
      options: {
        create: [
          { text: 'She walk to school every day.', isCorrect: false, sortOrder: 1 },
          { text: 'She walks to school every day.', isCorrect: true, sortOrder: 2 },
          { text: 'She is walk to school every day.', isCorrect: false, sortOrder: 3 },
          { text: 'She walked to school every day.', isCorrect: false, sortOrder: 4 },
        ],
      },
    },
  })

  await prisma.question.create({
    data: {
      lessonId: lessonGrammar.id,
      type: QuestionType.MULTIPLE_CHOICE,
      prompt: 'Which of the following are valid simple present time expressions?',
      explanation: 'Always, usually, every day, and on Mondays are all present-tense time expressions. "Yesterday" is past tense.',
      sortOrder: 2,
      options: {
        create: [
          { text: 'always', isCorrect: true, sortOrder: 1 },
          { text: 'every day', isCorrect: true, sortOrder: 2 },
          { text: 'yesterday', isCorrect: false, sortOrder: 3 },
          { text: 'on Mondays', isCorrect: true, sortOrder: 4 },
        ],
      },
    },
  })

  console.log('Questions seeded for all lessons')

  // ─── Media ──────────────────────────────────────────────────────────────────

  await prisma.media.upsert({
    where: { id: 'seed-media-morning-audio' },
    update: {},
    create: {
      id: 'seed-media-morning-audio',
      lessonId: lessonListening.id,
      type: MediaType.AUDIO,
      url: '/audio/morning-routine.mp3',
      filename: 'morning-routine.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 1_200_000,
      altText: 'Audio for A Typical Morning Routine',
    },
  })

  await prisma.media.upsert({
    where: { id: 'seed-media-dictation-audio' },
    update: {},
    create: {
      id: 'seed-media-dictation-audio',
      lessonId: lessonDictation.id,
      type: MediaType.AUDIO,
      url: '/audio/simple-sentences.mp3',
      filename: 'simple-sentences.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 800_000,
      altText: 'Audio for Simple Sentences Practice',
    },
  })

  await prisma.media.upsert({
    where: { id: 'seed-media-reading-pdf' },
    update: {},
    create: {
      id: 'seed-media-reading-pdf',
      lessonId: lessonReading.id,
      type: MediaType.PDF,
      url: '/pdf/first-day-school.pdf',
      filename: 'first-day-school.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 250_000,
      altText: 'PDF worksheet for A First Day at School',
    },
  })

  console.log('Media seeded')

  // ─── Worker Jobs ─────────────────────────────────────────────────────────────

  await prisma.workerJob.upsert({
    where: { idempotencyKey: 'seed-index-search-init' },
    update: {},
    create: {
      type: WorkerJobType.INDEX_SEARCH,
      status: 'SUCCEEDED',
      payload: { action: 'full_reindex', triggeredBy: 'seed' },
      idempotencyKey: 'seed-index-search-init',
      attempts: 1,
      startedAt: new Date('2026-01-01T00:05:00Z'),
      finishedAt: new Date('2026-01-01T00:05:12Z'),
    },
  })

  await prisma.workerJob.upsert({
    where: { idempotencyKey: 'seed-revalidate-cache-init' },
    update: {},
    create: {
      type: WorkerJobType.REVALIDATE_CACHE,
      status: 'SUCCEEDED',
      payload: { tags: ['lessons', 'languages', 'skills'], triggeredBy: 'seed' },
      idempotencyKey: 'seed-revalidate-cache-init',
      attempts: 1,
      startedAt: new Date('2026-01-01T00:05:13Z'),
      finishedAt: new Date('2026-01-01T00:05:14Z'),
    },
  })

  await prisma.workerJob.upsert({
    where: { idempotencyKey: 'seed-generate-pdf-first-day-school' },
    update: {},
    create: {
      type: WorkerJobType.GENERATE_PDF,
      status: 'QUEUED',
      payload: { lessonId: lessonReading.id, lessonSlug: 'first-day-school' },
      idempotencyKey: 'seed-generate-pdf-first-day-school',
      attempts: 0,
    },
  })

  console.log('Worker jobs seeded')
  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
