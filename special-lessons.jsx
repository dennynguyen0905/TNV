/* LangPath — Listening, Dictation, Vocabulary Pages */
/* VOCAB_PRACTICE_WORDS comes from data/mock/vocabulary.js */

function ListeningLessonPage({ navigate, lang, layout }) {
  const [quizAnswers, setQuizAnswers] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);

  const questions = [
    { prompt: 'What does the speaker do every morning?', options: ['Goes for a run', 'Makes coffee and reads the news', 'Takes a shower first', 'Walks the dog'], correct: 1 },
    { prompt: 'What time does the speaker wake up?', options: ['5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM'], correct: 2 },
    { prompt: 'What does the speaker eat for breakfast?', options: ['Cereal', 'Toast with jam', 'Eggs and toast', 'Nothing'], correct: 2 },
    { prompt: 'How does the speaker go to work?', options: ['By car', 'By bus', 'By bicycle', 'On foot'], correct: 1 },
    { prompt: 'What does the speaker enjoy most about mornings?', options: ['Exercise', 'The quiet time', 'Breakfast', 'Reading'], correct: 1 },
  ];
  const score = Object.entries(quizAnswers).filter(([i, a]) => a === questions[i].correct).length;

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 28 }}>
        <Breadcrumb items={[
          { label: 'Home', page: 'home' },
          { label: 'English', page: 'language', params: { lang: 'english' } },
          { label: 'Listening', page: 'skill-list', params: { lang: 'english', skill: 'listening' } },
          { label: 'Morning Routine' },
        ]} navigate={navigate} />
      </div>

      <div className="container" style={{ maxWidth: 800, paddingTop: 28 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Badge color="green">Free</Badge>
          <Badge color="blue">A1</Badge>
          <Badge color="gray">5 min</Badge>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>Morning Routine</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>English · Listening · A1</p>

        <div style={{ padding: 20, background: 'var(--blue-50)', borderRadius: 14, border: '1px solid var(--blue-100)', marginBottom: 24, fontSize: 15, color: 'var(--blue-700)', lineHeight: 1.6 }}>
          Listen to the audio and answer the questions below. You can replay the audio before submitting your answers.
        </div>

        <AudioPlayer />

        <div style={{ marginTop: 16, marginBottom: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowTranscript(!showTranscript)} style={{
            background: 'none', border: 'none', fontSize: 14, fontWeight: 600,
            color: 'var(--blue-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name={showTranscript ? 'chevDown' : 'chevRight'} size={16} color="var(--blue-500)" />
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </button>
        </div>

        {showTranscript && (
          <div style={{ padding: 24, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', marginBottom: 32, fontSize: 15, lineHeight: 1.8, color: 'var(--n-600)' }}>
            <p>Every morning I wake up at half past six. First, I make a cup of coffee and read the news on my phone. Then I take a shower and get dressed.</p>
            <p style={{ marginTop: 12 }}>For breakfast, I usually have eggs and toast. Sometimes I eat fruit too. I enjoy the quiet time in the morning before the day gets busy.</p>
            <p style={{ marginTop: 12 }}>I leave home at eight o'clock and take the bus to work. The bus ride is about twenty minutes.</p>
          </div>
        )}

        {!showResult ? (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Comprehension questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q, i) => (
                <QuizQuestion key={i} question={q} index={i}
                  selected={quizAnswers[i]} onSelect={v => setQuizAnswers({ ...quizAnswers, [i]: v })}
                  submitted={submitted} correctAnswer={q.correct} />
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Button variant="primary" size="lg"
                disabled={Object.keys(quizAnswers).length < questions.length}
                onClick={() => { setSubmitted(true); setShowResult(true); }}>Submit answers</Button>
            </div>
          </div>
        ) : (
          <QuizResult score={score} total={questions.length}
            onContinue={() => navigate('skill-list', { lang: 'english', skill: 'listening' })}
            onReview={() => { setShowResult(false); setSubmitted(true); }} />
        )}
      </div>
    </div>
  );
}

function DictationLessonPage({ navigate, lang, layout }) {
  const sentences = [
    { text: 'The cat is sitting on the table.' },
    { text: 'I like to read books in the morning.' },
    { text: 'She goes to school by bus every day.' },
    { text: 'We have a big garden with many flowers.' },
    { text: 'My brother plays football on Saturdays.' },
  ];
  const [currentIdx, setCurrent] = React.useState(0);
  const [userInput, setUserInput] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [finished, setFinished] = React.useState(false);

  const checkAnswer = () => {
    const correct = sentences[currentIdx].text;
    const userWords = userInput.trim().split(/\s+/);
    const correctWords = correct.split(/\s+/);
    const wordResults = correctWords.map((w, i) => {
      if (!userWords[i]) return { word: w, status: 'missing' };
      if (userWords[i].toLowerCase().replace(/[^a-z]/g, '') === w.toLowerCase().replace(/[^a-z]/g, '')) return { word: w, status: 'correct' };
      return { word: w, typed: userWords[i], status: 'wrong' };
    });
    setResults([...results, { sentence: correct, input: userInput, words: wordResults, score: wordResults.filter(w => w.status === 'correct').length / correctWords.length }]);
    setChecked(true);
  };

  const nextSentence = () => {
    if (currentIdx >= sentences.length - 1) { setFinished(true); return; }
    setCurrent(currentIdx + 1);
    setUserInput('');
    setChecked(false);
  };

  const totalScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length * 100) : 0;

  if (finished) {
    return (
      <div style={{ paddingBottom: 64 }}>
        <div className="container" style={{ paddingTop: 28 }}>
          <Breadcrumb items={[
            { label: 'Home', page: 'home' },
            { label: 'English', page: 'language', params: { lang: 'english' } },
            { label: 'Dictation', page: 'skill-list', params: { lang: 'english', skill: 'dictation' } },
            { label: 'Simple Sentences' },
          ]} navigate={navigate} />
        </div>
        <div className="container" style={{ maxWidth: 600, paddingTop: 40, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px', background: totalScore >= 70 ? 'var(--green-50)' : 'var(--amber-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trophy" size={36} color={totalScore >= 70 ? 'var(--green-500)' : 'var(--amber-500)'} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Dictation Complete</h2>
          <div style={{ fontSize: 40, fontWeight: 800, color: totalScore >= 70 ? 'var(--green-500)' : 'var(--amber-500)', marginBottom: 16 }}>{totalScore}%</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
            You completed {sentences.length} sentences. {totalScore >= 70 ? 'Great work!' : 'Keep practicing!'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => navigate('skill-list', { lang: 'english', skill: 'dictation' })}>Continue</Button>
            <Button variant="outline" onClick={() => { setCurrent(0); setUserInput(''); setChecked(false); setResults([]); setFinished(false); }}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 28 }}>
        <Breadcrumb items={[
          { label: 'Home', page: 'home' },
          { label: 'English', page: 'language', params: { lang: 'english' } },
          { label: 'Dictation', page: 'skill-list', params: { lang: 'english', skill: 'dictation' } },
          { label: 'Simple Sentences' },
        ]} navigate={navigate} />
      </div>

      <div className="container" style={{ maxWidth: 680, paddingTop: 28 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Badge color="green">Free</Badge><Badge color="blue">A1</Badge>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Simple Sentences</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>English · Dictation · A1</p>

        <ProgressBar value={currentIdx + 1} max={sentences.length} height={6} style={{ marginBottom: 24 }} />
        <p style={{ fontSize: 13, color: 'var(--n-400)', marginBottom: 24 }}>Sentence {currentIdx + 1} of {sentences.length}</p>

        <div style={{ padding: 20, background: 'var(--blue-50)', borderRadius: 14, border: '1px solid var(--blue-100)', marginBottom: 24, fontSize: 15, color: 'var(--blue-700)', lineHeight: 1.6 }}>
          Listen carefully and type what you hear.
        </div>

        <AudioPlayer compact />

        <div style={{ marginTop: 24 }}>
          <Textarea placeholder="Type the sentence here..." value={userInput} onChange={setUserInput} rows={3} style={{ marginBottom: 16 }} />

          {checked && (
            <div style={{ padding: 20, background: '#fff', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--n-500)', marginBottom: 10 }}>Correction:</p>
              <p style={{ fontSize: 16, lineHeight: 1.8 }}>
                {results[results.length - 1]?.words.map((w, i) => (
                  <span key={i} style={{
                    borderBottom: `2px solid ${w.status === 'correct' ? 'var(--green-500)' : w.status === 'wrong' ? 'var(--red-500)' : 'var(--amber-400)'}`,
                    color: w.status === 'correct' ? 'var(--green-600)' : w.status === 'wrong' ? 'var(--red-500)' : 'var(--amber-600)',
                    fontWeight: w.status === 'correct' ? 400 : 600, marginRight: 6, padding: '2px 0',
                  }}>{w.word}</span>
                ))}
              </p>
              {results[results.length - 1]?.words.some(w => w.status !== 'correct') && (
                <p style={{ fontSize: 13, color: 'var(--n-400)', marginTop: 10 }}>
                  <span style={{ color: 'var(--green-500)' }}>■</span> correct &nbsp;
                  <span style={{ color: 'var(--red-500)' }}>■</span> wrong &nbsp;
                  <span style={{ color: 'var(--amber-400)' }}>■</span> missing
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            {!checked ? (
              <Button variant="primary" onClick={checkAnswer} disabled={!userInput.trim()}>Check answer</Button>
            ) : (
              <Button variant="primary" onClick={nextSentence}>
                {currentIdx >= sentences.length - 1 ? 'Finish dictation' : 'Next sentence'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VocabularyPracticePage({ navigate, lang, layout }) {
  const words = VOCAB_PRACTICE_WORDS;
  const [current, setCurrent] = React.useState(0);
  const [known, setKnown] = React.useState([]);
  const [practice, setPractice] = React.useState([]);

  const handleKnow = () => {
    setKnown([...known, current]);
    if (current < words.length - 1) setCurrent(current + 1);
  };
  const handlePractice = () => {
    setPractice([...practice, current]);
    if (current < words.length - 1) setCurrent(current + 1);
  };

  const allDone = known.length + practice.length >= words.length;

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 28 }}>
        <Breadcrumb items={[
          { label: 'Home', page: 'home' },
          { label: 'English', page: 'language', params: { lang: 'english' } },
          { label: 'Vocabulary', page: 'skill-list', params: { lang: 'english', skill: 'vocabulary' } },
          { label: 'Everyday Words' },
        ]} navigate={navigate} />
      </div>

      <div className="container" style={{ maxWidth: 560, paddingTop: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Everyday Words</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>English · Vocabulary · A2</p>

        <ProgressBar value={known.length + practice.length} max={words.length} height={6} style={{ marginBottom: 8 }} />
        <p style={{ fontSize: 13, color: 'var(--n-400)', marginBottom: 32 }}>
          {known.length + practice.length} of {words.length} words reviewed · {known.length} known · {practice.length} need practice
        </p>

        {!allDone ? (
          <VocabularyCardComp
            word={words[current].word}
            pronunciation={words[current].pronunciation}
            meaning={words[current].meaning}
            example={words[current].example}
            onKnow={handleKnow}
            onPractice={handlePractice}
          />
        ) : (
          <div style={{ padding: 40, background: '#fff', borderRadius: 20, border: '1px solid var(--border)' }}>
            <Icon name="check" size={48} color="var(--green-500)" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>All words reviewed!</h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
              You know {known.length} words and marked {practice.length} for practice.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => navigate('skill-list', { lang: 'english', skill: 'vocabulary' })}>Back to lessons</Button>
              <Button variant="outline" onClick={() => { setCurrent(0); setKnown([]); setPractice([]); }}>Review again</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ListeningLessonPage, DictationLessonPage, VocabularyPracticePage });
