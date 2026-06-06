/* LangPath — Lesson Detail Page (Reading + Quiz) */
/* QUIZ_QUESTIONS, LESSON_TEXT, VOCAB_WORDS come from data/mock/questions.js */

function LessonDetailPage({ navigate, lang, skill, lessonId, layout }) {
  const [quizAnswers, setQuizAnswers] = React.useState({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  const isClassic = layout === 'classic';
  const isWide = layout === 'wide';

  const handleSubmit = () => {
    setQuizSubmitted(true);
    setShowResult(true);
  };

  const score = Object.entries(quizAnswers).filter(([i, a]) => a === QUIZ_QUESTIONS[i].correct).length;

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setShowResult(false);
  };

  const Sidebar = () => (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Lesson progress</h4>
        <ProgressBar value={quizSubmitted ? 100 : 50} height={6} />
        <p style={{ fontSize: 12, color: 'var(--n-400)', marginTop: 8 }}>{quizSubmitted ? 'Completed' : 'In progress'}</p>
      </div>

      <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Listen to the text</h4>
        <AudioPlayer compact />
      </div>

      <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Key vocabulary</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {VOCAB_WORDS.map(v => (
            <div key={v.word} style={{ padding: 12, background: 'var(--n-50)', borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue-600)', marginBottom: 4 }}>{v.word}</div>
              <div style={{ fontSize: 13, color: 'var(--n-600)' }}>{v.meaning}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
        <Button variant="outline" size="sm" style={{ width: '100%', marginBottom: 12 }} icon={<Icon name="download" size={16} />}>Download PDF</Button>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, marginTop: 8 }}>Related lessons</h4>
        {SAMPLE_LESSONS.slice(1, 4).map(l => (
          <div key={l.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--n-100)', cursor: 'pointer' }}
            onClick={() => { resetQuiz(); navigate('lesson', { lang, skill, id: l.id }); }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{l.title}</p>
            <span style={{ fontSize: 12, color: 'var(--n-400)' }}>{l.level} · {l.time}</span>
          </div>
        ))}
      </div>
    </aside>
  );

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 28 }}>
        <Breadcrumb items={[
          { label: 'Home', page: 'home' },
          { label: 'English', page: 'language', params: { lang: 'english' } },
          { label: 'Reading', page: 'skill-list', params: { lang: 'english', skill: 'reading' } },
          { label: 'My First Day at School' },
        ]} navigate={navigate} />
      </div>

      <div className="container" style={{
        paddingTop: 28,
        display: isClassic ? 'grid' : 'block',
        gridTemplateColumns: isClassic ? '1fr 320px' : undefined,
        gap: 40,
      }}>
        <main>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <Badge color="green">Free</Badge>
              <Badge color="blue">A1</Badge>
              <Badge color="gray">8 min</Badge>
              <Badge color="gray">5 Questions</Badge>
            </div>
            <h1 style={{ fontSize: isWide ? 36 : 30, fontWeight: 800, marginBottom: 10 }}>My First Day at School</h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>English · Reading · A1 · 8 min · Free</p>
          </div>

          <div style={{
            padding: 20, background: 'var(--blue-50)', borderRadius: 14, border: '1px solid var(--blue-100)',
            marginBottom: 28, fontSize: 15, color: 'var(--blue-700)', lineHeight: 1.6,
          }}>
            Read the text carefully, then answer the comprehension questions below.
          </div>

          {!isClassic && (
            <div style={{ marginBottom: 24 }}>
              <AudioPlayer />
            </div>
          )}

          <div style={{
            padding: isWide ? 40 : 32, background: '#fff', borderRadius: 20,
            border: '1px solid var(--border)', marginBottom: 32,
            maxWidth: isWide ? 760 : undefined,
          }}>
            {LESSON_TEXT.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--n-700)', marginBottom: i < 5 ? 20 : 0, textWrap: 'pretty' }}>{para}</p>
            ))}
          </div>

          {!isClassic && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Key vocabulary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {VOCAB_WORDS.map(v => (
                  <div key={v.word} style={{ padding: 16, background: '#fff', borderRadius: 14, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-600)', marginBottom: 4 }}>{v.word}</div>
                    <div style={{ fontSize: 14, color: 'var(--n-600)', marginBottom: 6 }}>{v.meaning}</div>
                    <div style={{ fontSize: 13, color: 'var(--n-400)', fontStyle: 'italic' }}>"{v.example}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showResult ? (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Did you understand the text?</h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>Answer the questions below to test your comprehension.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {QUIZ_QUESTIONS.map((q, i) => (
                  <QuizQuestion key={i} question={q} index={i}
                    selected={quizAnswers[i]} onSelect={v => setQuizAnswers({ ...quizAnswers, [i]: v })}
                    submitted={quizSubmitted} correctAnswer={q.correct} />
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Button variant="primary" size="lg"
                  disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                  onClick={handleSubmit}>
                  Submit answers
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 32 }}>
              <QuizResult score={score} total={QUIZ_QUESTIONS.length}
                onContinue={() => navigate('skill-list', { lang: 'english', skill: 'reading' })}
                onReview={() => { setShowResult(false); setQuizSubmitted(true); }} />
            </div>
          )}
        </main>

        {isClassic && <Sidebar />}
      </div>
    </div>
  );
}

Object.assign(window, { LessonDetailPage });
