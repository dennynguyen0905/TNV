/* LangPath — Mock Questions, Lesson Text, and Key Vocabulary */
window.LangPathData = window.LangPathData || {};

/* Quiz questions for the "My First Day at School" reading lesson */
window.QUIZ_QUESTIONS = [
  { prompt: 'Where is the student going today?',           options: ['To the park', 'To school', 'To the supermarket', 'To the library'],    correct: 1 },
  { prompt: 'How does the student feel?',                  options: ['Angry', 'Sad', 'Excited but nervous', 'Bored'],                         correct: 2 },
  { prompt: 'What is the student\'s teacher\'s name?',    options: ['Ms. Johnson', 'Mr. Smith', 'Mrs. Brown', 'Dr. Lee'],                    correct: 0 },
  { prompt: 'What subject does the student like most?',   options: ['Mathematics', 'History', 'English', 'Science'],                         correct: 2 },
  { prompt: 'What does the student do at lunch?',         options: ['Goes home', 'Eats with new friends', 'Studies alone', 'Plays sports'],  correct: 1 },
];

/* Lesson body text for "My First Day at School" */
window.LESSON_TEXT = [
  'Today is my first day at school. I am excited but a little nervous. My mother walks with me to the bus stop. The bus is big and yellow.',
  'When I arrive at school, I see many children. Some of them are laughing and talking. A tall woman stands at the door. She smiles and says, "Welcome! I am Ms. Johnson, your teacher."',
  'The classroom is bright and colorful. There are pictures on the walls and books on the shelves. I sit at a desk near the window. A boy next to me says, "Hi, I\'m Tom. Do you want to be friends?"',
  'In the morning, we learn English. Ms. Johnson reads a story about a cat and a dog. I like English very much. After that, we have mathematics. I count numbers from one to twenty.',
  'At lunch, I eat with Tom and two other children. We talk about our favorite games. I feel happy because I have new friends. After lunch, we draw pictures and sing songs.',
  'When the school day ends, I run to my mother. "How was your day?" she asks. "It was great!" I say with a big smile. I cannot wait to come back tomorrow.',
].join('\n\n');

/* Key vocabulary panel for the reading lesson */
window.VOCAB_WORDS = [
  { word: 'nervous',  meaning: 'slightly afraid or worried',                  example: 'I am excited but a little nervous.' },
  { word: 'arrive',   meaning: 'to reach a place after a journey',            example: 'When I arrive at school, I see many children.' },
  { word: 'bright',   meaning: 'full of light; having strong colors',         example: 'The classroom is bright and colorful.' },
  { word: 'favorite', meaning: 'liked more than all others',                  example: 'We talk about our favorite games.' },
];

/* Admin question bank — covers multiple lesson types */
window.MOCK_QUESTIONS = [
  { id: 1, lessonId: 1, lessonTitle: 'My First Day at School',       type: 'SINGLE_CHOICE',   prompt: 'Where is the student going today?',           options: ['To the park', 'To school', 'To the supermarket', 'To the library'],   correctIdx: 1,  correctIndices: [],    answer: '', explanation: 'The text says "Today is my first day at school."', sortOrder: 1 },
  { id: 2, lessonId: 1, lessonTitle: 'My First Day at School',       type: 'SINGLE_CHOICE',   prompt: 'How does the student feel?',                   options: ['Angry', 'Sad', 'Excited but nervous', 'Bored'],                       correctIdx: 2,  correctIndices: [],    answer: '', explanation: '"I am excited but a little nervous."',           sortOrder: 2 },
  { id: 3, lessonId: 1, lessonTitle: 'My First Day at School',       type: 'SINGLE_CHOICE',   prompt: 'What is the teacher\'s name?',                 options: ['Ms. Johnson', 'Mr. Smith', 'Mrs. Brown', 'Dr. Lee'],                  correctIdx: 0,  correctIndices: [],    answer: '', explanation: '"I am Ms. Johnson, your teacher."',              sortOrder: 3 },
  { id: 4, lessonId: 5, lessonTitle: 'Morning Routine',              type: 'SINGLE_CHOICE',   prompt: 'What time does the speaker wake up?',          options: ['5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM'],                         correctIdx: 2,  correctIndices: [],    answer: '', explanation: '"I wake up at half past six."',                  sortOrder: 1 },
  { id: 5, lessonId: 5, lessonTitle: 'Morning Routine',              type: 'MULTIPLE_CHOICE', prompt: 'What does the speaker do before leaving home?', options: ['Makes coffee', 'Goes for a run', 'Takes a shower', 'Reads the news'], correctIdx: -1, correctIndices: [0,2,3], answer: '', explanation: 'Coffee, shower, and reading are all mentioned.',   sortOrder: 2 },
  { id: 6, lessonId: 3, lessonTitle: 'A City Tour in London',        type: 'FILL_BLANK',      prompt: 'The bus ride from home to work takes ___.',    options: [],                                                                     correctIdx: -1, correctIndices: [],    answer: 'twenty minutes', explanation: '"The bus ride is about twenty minutes."',       sortOrder: 1 },
  { id: 7, lessonId: 2, lessonTitle: 'Weekend Plans with Friends',   type: 'DICTATION',       prompt: 'Type the sentence you hear.',                  options: [],                                                                     correctIdx: -1, correctIndices: [],    answer: 'We are going to the park on Saturday.', explanation: '', sortOrder: 1 },
];

window.LangPathData.QUIZ_QUESTIONS  = window.QUIZ_QUESTIONS;
window.LangPathData.LESSON_TEXT     = window.LESSON_TEXT;
window.LangPathData.VOCAB_WORDS     = window.VOCAB_WORDS;
window.LangPathData.MOCK_QUESTIONS  = window.MOCK_QUESTIONS;

/* Helper functions for lesson/question association */
window.LangPathData.getQuestionsByLessonId = function(lessonId) {
  return window.MOCK_QUESTIONS.filter(function(q) { return q.lessonId === Number(lessonId); });
};

window.LangPathData.createMockQuestion = function(fields) {
  return {
    id: Date.now(),
    lessonId: Number(fields.lessonId),
    lessonTitle: fields.lessonTitle || '',
    type: fields.type || 'SINGLE_CHOICE',
    prompt: fields.prompt || '',
    options: Array.isArray(fields.options) ? fields.options.slice() : [],
    correctIdx: typeof fields.correctIdx === 'number' ? fields.correctIdx : 0,
    correctIndices: Array.isArray(fields.correctIndices) ? fields.correctIndices.slice() : [],
    answer: fields.answer || '',
    explanation: fields.explanation || '',
    sortOrder: Number(fields.sortOrder) || 1,
  };
};

window.LangPathData.updateMockQuestion = function(questions, id, fields) {
  return questions.map(function(q) { return q.id === id ? Object.assign({}, q, fields) : q; });
};

window.LangPathData.deleteMockQuestion = function(questions, id) {
  return questions.filter(function(q) { return q.id !== id; });
};
