/* LangPath — Home Page */

function HomePage({ navigate, layout }) {
  const isWide = layout === 'wide';
  const isCompact = layout === 'compact';

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: isWide
          ? 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #ECFDF5 100%)'
          : '#fff',
        borderBottom: '1px solid var(--border)',
        padding: isCompact ? '48px 0' : isWide ? '80px 0' : '72px 0',
      }}>
        <div className="container" style={{
          display: isWide ? 'grid' : 'flex',
          gridTemplateColumns: isWide ? '1fr 1fr' : undefined,
          flexDirection: isWide ? undefined : 'column',
          alignItems: isWide ? 'center' : 'center',
          gap: isWide ? 64 : 24,
          textAlign: isWide ? 'left' : 'center',
        }}>
          <div style={{ maxWidth: isWide ? '100%' : 720 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: isWide ? 'flex-start' : 'center' }}>
              <Badge color="blue">Free lessons available</Badge>
              <Badge color="green">A1 – C2</Badge>
            </div>
            <h1 style={{
              fontSize: isCompact ? 36 : isWide ? 44 : 48,
              fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em',
              color: 'var(--n-900)',
            }}>
              Learn languages with{' '}
              <span style={{ color: 'var(--blue-500)' }}>short lessons</span>{' '}
              and interactive exercises
            </h1>
            <p style={{
              fontSize: isCompact ? 16 : 18, lineHeight: 1.65, color: 'var(--text-secondary)',
              marginBottom: 32, maxWidth: isWide ? 500 : 580, marginLeft: isWide ? 0 : 'auto', marginRight: isWide ? 0 : 'auto',
            }}>
              Practice reading, listening, dictation, grammar and vocabulary through level-based lessons from A1 to C2.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: isWide ? 'flex-start' : 'center' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('language', { lang: 'english' })}>Start learning</Button>
              <Button variant="outline" size="lg" onClick={() => {
                document.getElementById('languages-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}>Explore languages</Button>
            </div>
          </div>
          {isWide && (
            <div style={{
              background: 'var(--n-50)', borderRadius: 24, padding: 32, border: '1px solid var(--border)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            }}>
              {[
                { icon: 'globe', label: '16 Languages', color: 'var(--blue-500)', bg: 'var(--blue-50)' },
                { icon: 'layers', label: '5 Learning Skills', color: 'var(--green-500)', bg: 'var(--green-50)' },
                { icon: 'award', label: 'A1 – C2 Levels', color: '#A855F7', bg: '#FDF4FF' },
                { icon: 'star', label: 'Free & Premium', color: 'var(--amber-500)', bg: 'var(--amber-50)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fff', borderRadius: 14, border: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={s.icon} size={20} color={s.color} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--n-700)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats bar (non-wide) */}
      {!isWide && (
        <section style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: isCompact ? 32 : 48, flexWrap: 'wrap' }}>
            {[
              { value: '16', label: 'Languages' },
              { value: '5', label: 'Learning Skills' },
              { value: '6', label: 'CEFR Levels' },
              { value: '1,200+', label: 'Free Lessons' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue-500)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Language Cards */}
      <section id="languages-section" style={{ padding: isCompact ? '48px 0' : '72px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: isCompact ? 32 : 40 }}>
            <h2 style={{ fontSize: isCompact ? 24 : 32, fontWeight: 800, marginBottom: 12 }}>Choose your language</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Start with one of our most popular languages and build your skills step by step.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : isWide ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            gap: isCompact ? 16 : 20,
            maxWidth: isWide ? '100%' : 800,
            margin: '0 auto',
          }}>
            {LANGUAGES_DATA.map(lang => (
              <LanguageCard key={lang.id} lang={lang} layout={layout} onClick={() => navigate('language', { lang: lang.id })} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: isCompact ? '48px 0' : '72px 0', background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: isCompact ? 32 : 48 }}>
            <h2 style={{ fontSize: isCompact ? 24 : 32, fontWeight: 800, marginBottom: 12 }}>How it works</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Three simple steps to start improving your language skills.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 960, margin: '0 auto' }}>
            {[
              { step: '01', title: 'Choose a language & skill', desc: 'Pick from 16 languages and 5 skill types: reading, listening, dictation, grammar, or vocabulary.' },
              { step: '02', title: 'Practice with lessons', desc: 'Work through level-based lessons (A1–C2) with texts, audio, and exercises.' },
              { step: '03', title: 'Track your progress', desc: 'Take quizzes, get instant feedback, and watch your skills improve over time.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: 'var(--blue-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 20, fontWeight: 800, color: 'var(--blue-500)',
                }}>{item.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Lessons */}
      <section style={{ padding: isCompact ? '48px 0' : '72px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCompact ? 24 : 36 }}>
            <div>
              <h2 style={{ fontSize: isCompact ? 24 : 28, fontWeight: 800, marginBottom: 8 }}>Popular lessons</h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Start with one of our most popular free lessons.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('skill-list', { lang: 'english', skill: 'reading' })}>View all →</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 20 }}>
            {SAMPLE_LESSONS.slice(0, isCompact ? 4 : 3).map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} layout={layout} onClick={() => navigate(
                lesson.skill === 'Listening' ? 'listening-lesson' : lesson.skill === 'Dictation' ? 'dictation-lesson' : 'lesson',
                { lang: 'english', skill: lesson.skill.toLowerCase(), id: lesson.id }
              )} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--blue-600), var(--blue-800))',
            borderRadius: 24, padding: isCompact ? '40px 32px' : '56px 48px',
            textAlign: 'center', color: '#fff',
          }}>
            <h2 style={{ fontSize: isCompact ? 24 : 32, fontWeight: 800, marginBottom: 12, color: '#fff' }}>Ready to start learning?</h2>
            <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Create a free account to save your progress and access all free lessons.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('register')} style={{ background: '#fff', color: 'var(--blue-600)' }}>
              Create free account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HomePage });
