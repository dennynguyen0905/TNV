/* LangPath — Learning Components */
/* LANGUAGES_DATA, SKILL_ICONS, SKILL_COLORS, LEVELS, SAMPLE_LESSONS come from data/ files */

function LanguageCard({ lang, onClick, layout }) {
  const isWide = layout === 'wide';
  return (
    <Card hover onClick={onClick} style={{ padding: isWide ? 28 : 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <FlagIcon lang={lang.id} size={isWide ? 36 : 30} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: isWide ? 20 : 18, fontWeight: 700, marginBottom: 4 }}>{lang.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lang.meta}</p>
        </div>
        <Icon name="chevRight" size={18} color="var(--n-300)" />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {lang.skills.map(s => (
          <Badge key={s} color={s === 'Reading' ? 'blue' : s === 'Listening' ? 'gray' : s === 'Dictation' ? 'green' : s === 'Grammar' ? 'amber' : 'red'}>
            {s}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function SkillCard({ skill, description, onClick }) {
  const sc = SKILL_COLORS[skill] || SKILL_COLORS.Reading;
  const [hov, setHov] = React.useState(false);
  return (
    <Card hover onClick={onClick} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '28px 24px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: sc.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <Icon name={SKILL_ICONS[skill] || 'book'} size={22} color={sc.accent} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{skill}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{description}</p>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue-500)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        >
          Start practice <Icon name="chevRight" size={16} color="var(--blue-500)" style={{ transform: hov ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }} />
        </span>
      </div>
    </Card>
  );
}

function LevelFilter({ selected, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
      {['All', ...LEVELS].map(level => (
        <button key={level} onClick={() => onChange(level)} style={{
          padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
          background: selected === level ? 'var(--blue-500)' : 'var(--n-0)',
          color: selected === level ? '#fff' : 'var(--n-600)',
          border: `1.5px solid ${selected === level ? 'var(--blue-500)' : 'var(--border)'}`,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>{level === 'All' ? 'All Levels' : level}</button>
      ))}
    </div>
  );
}

function LessonCard({ lesson, onClick, layout }) {
  const isWide = layout === 'wide';
  return (
    <Card hover onClick={onClick} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: isWide ? '24px 24px 20px' : '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Badge color={lesson.free ? 'green' : 'amber'}>{lesson.free ? 'Free' : 'Premium'}</Badge>
          <Badge color="blue">{lesson.level}</Badge>
          {lesson.hasPdf && <Badge color="gray">PDF</Badge>}
        </div>
        <h3 style={{ fontSize: isWide ? 17 : 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>{lesson.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>{lesson.summary}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--n-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={14} color="var(--n-400)" /> {lesson.time} · {lesson.questions} questions
          </span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--n-400)', fontWeight: 500 }}>{lesson.lang} · {lesson.skill}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-500)' }}>Start lesson →</span>
      </div>
    </Card>
  );
}

function AudioPlayer({ compact }) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => { if (p >= 100) { setPlaying(false); return 100; } return p + 0.5; });
      }, 100);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const formatTime = (pct) => {
    const total = 180; const sec = Math.floor(total * pct / 100);
    return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
  };

  return (
    <div style={{
      background: 'var(--n-50)', border: '1px solid var(--border)', borderRadius: 14,
      padding: compact ? '12px 16px' : '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => { setPlaying(!playing); if (progress >= 100) setProgress(0); }} style={{
          width: compact ? 36 : 42, height: compact ? 36 : 42, borderRadius: '50%', border: 'none',
          background: 'var(--blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          flexShrink: 0,
        }}>
          <Icon name={playing ? 'pause' : 'play'} size={compact ? 16 : 18} color="#fff" />
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ position: 'relative', height: 6, background: 'var(--n-200)', borderRadius: 3, cursor: 'pointer' }}
            onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - rect.left) / rect.width) * 100); }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--blue-500)', borderRadius: 3, transition: 'width 0.1s' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--n-400)' }}>
            <span>{formatTime(progress)}</span><span>3:00</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setSpeed(s => s === 0.75 ? 1 : s === 1 ? 1.25 : 0.75)} style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff',
            fontSize: 12, fontWeight: 600, color: 'var(--n-600)', cursor: 'pointer',
          }}>{speed}x</button>
          <button onClick={() => { setProgress(0); setPlaying(true); }} style={{
            padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--n-500)" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizQuestion({ question, index, selected, onSelect, submitted, correctAnswer }) {
  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--n-800)' }}>
        <span style={{ color: 'var(--blue-500)', marginRight: 8 }}>Q{index + 1}.</span>
        {question.prompt}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = submitted && i === correctAnswer;
          const isWrong = submitted && isSelected && i !== correctAnswer;
          return (
            <button key={i} onClick={() => !submitted && onSelect(i)} style={{
              padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${isCorrect ? 'var(--green-500)' : isWrong ? 'var(--red-500)' : isSelected ? 'var(--blue-500)' : 'var(--border)'}`,
              background: isCorrect ? 'var(--green-50)' : isWrong ? 'var(--red-50)' : isSelected ? 'var(--blue-50)' : '#fff',
              color: 'var(--n-800)', fontSize: 14, fontWeight: 500, textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', border: `2px solid ${isCorrect ? 'var(--green-500)' : isWrong ? 'var(--red-500)' : isSelected ? 'var(--blue-500)' : 'var(--n-300)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: isSelected || isCorrect ? (isCorrect ? 'var(--green-500)' : isWrong ? 'var(--red-500)' : 'var(--blue-500)') : 'transparent',
              }}>
                {(isSelected || isCorrect) && <Icon name={isCorrect ? 'check' : isWrong ? 'x' : 'check'} size={14} color="#fff" />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizResult({ score, total, onContinue, onReview }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  return (
    <div style={{
      padding: 32, background: '#fff', borderRadius: 20, border: '1px solid var(--border)',
      textAlign: 'center', maxWidth: 420, margin: '0 auto',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
        background: passed ? 'var(--green-50)' : 'var(--amber-50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={passed ? 'trophy' : 'award'} size={36} color={passed ? 'var(--green-500)' : 'var(--amber-500)'} />
      </div>
      <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{score} / {total} correct</h3>
      <div style={{ fontSize: 36, fontWeight: 800, color: passed ? 'var(--green-500)' : 'var(--amber-500)', marginBottom: 8 }}>{pct}%</div>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
        {passed ? 'Great job! You completed this lesson.' : 'Keep practicing! Try again to improve your score.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button variant="primary" onClick={onContinue}>Continue learning</Button>
        <Button variant="outline" onClick={onReview}>Review answers</Button>
      </div>
    </div>
  );
}

function VocabularyCardComp({ word, pronunciation, meaning, example, onKnow, onPractice }) {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div style={{
      background: '#fff', borderRadius: 20, border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)', maxWidth: 480, margin: '0 auto', overflow: 'hidden',
    }}>
      <div style={{ padding: 32, textAlign: 'center', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setFlipped(!flipped)}>
        {!flipped ? (
          <>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{word}</h2>
            <p style={{ fontSize: 16, color: 'var(--n-400)', fontFamily: 'monospace' }}>{pronunciation}</p>
            <p style={{ fontSize: 13, color: 'var(--n-300)', marginTop: 16 }}>Tap to reveal meaning</p>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--blue-600)' }}>{word}</h3>
            <p style={{ fontSize: 17, color: 'var(--n-700)', marginBottom: 16 }}>{meaning}</p>
            <p style={{ fontSize: 14, color: 'var(--n-500)', fontStyle: 'italic', lineHeight: 1.5 }}>"{example}"</p>
          </>
        )}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', display: 'flex' }}>
        <button onClick={onPractice} style={{ flex: 1, padding: 14, border: 'none', background: 'var(--amber-50)', color: 'var(--amber-500)', fontWeight: 600, fontSize: 14, cursor: 'pointer', borderRight: '1px solid var(--border)' }}>Need practice</button>
        <button onClick={onKnow} style={{ flex: 1, padding: 14, border: 'none', background: 'var(--green-50)', color: 'var(--green-500)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>I know this</button>
      </div>
    </div>
  );
}

Object.assign(window, {
  LanguageCard, SkillCard, LevelFilter, LessonCard, AudioPlayer,
  QuizQuestion, QuizResult, VocabularyCardComp,
});
