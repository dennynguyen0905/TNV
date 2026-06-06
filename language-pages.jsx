/* LangPath — Language Detail + Skill Lesson List Pages */

function LanguageDetailPage({ navigate, lang, layout }) {
  const langData = LANGUAGES_DATA.find(l => l.id === lang) || LANGUAGES_DATA[0];
  const isWide = layout === 'wide';
  const isCompact = layout === 'compact';
  const skillDescs = {
    Reading: 'Improve comprehension with short texts and questions.',
    Listening: 'Listen to spoken audio and answer comprehension questions.',
    Dictation: 'Train your ear by typing what you hear.',
    Grammar: 'Practice verb tenses, sentence structure and common patterns.',
    Vocabulary: 'Learn words by topic and review difficult terms.',
  };

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 28 }}>
        <Breadcrumb items={[
          { label: 'Home', page: 'home' },
          { label: langData.name },
        ]} navigate={navigate} />
      </div>

      <section style={{ padding: '40px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <FlagIcon lang={lang} size={40} />
            <h1 style={{ fontSize: isCompact ? 28 : 36, fontWeight: 800 }}>Learn {langData.name} Online</h1>
          </div>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 600, marginBottom: 40, lineHeight: 1.6 }}>
            Choose a skill and practice {langData.name} with level-based lessons, exercises and instant feedback.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : isWide ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
            gap: isCompact ? 16 : 20,
          }}>
            {langData.skills.map(skill => (
              <SkillCard key={skill} skill={skill} description={skillDescs[skill]}
                onClick={() => navigate('skill-list', { lang, skill: skill.toLowerCase() })} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section style={{ padding: '48px 0 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>What's available</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Reading texts', value: langData.meta.split('·')[0]?.trim().split(' ')[0] || '368', icon: 'book', color: 'var(--blue-500)', bg: 'var(--blue-50)' },
              { label: 'Listening texts', value: langData.meta.split('·')[1]?.trim().split(' ')[0] || '153', icon: 'headphones', color: '#A855F7', bg: '#FDF4FF' },
              { label: 'CEFR levels', value: '6', icon: 'layers', color: 'var(--green-500)', bg: 'var(--green-50)' },
            ].map(s => (
              <div key={s.label} style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={s.icon} size={20} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--n-900)' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent lessons preview */}
      <section style={{ padding: '48px 0 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Popular {langData.name} lessons</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('skill-list', { lang, skill: 'reading' })}>See all →</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
            {SAMPLE_LESSONS.filter(l => l.lang === langData.name).slice(0, 3).map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} layout={layout} onClick={() => navigate('lesson', { lang, skill: lesson.skill.toLowerCase(), id: lesson.id })} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SkillLessonListPage({ navigate, lang, skill, layout }) {
  const langData = LANGUAGES_DATA.find(l => l.id === lang) || LANGUAGES_DATA[0];
  const [level, setLevel] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [accessFilter, setAccessFilter] = React.useState('All');
  const [sort, setSort] = React.useState('newest');
  const isWide = layout === 'wide';
  const isCompact = layout === 'compact';

  const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
  const sc = SKILL_COLORS[skillName] || SKILL_COLORS.Reading;

  const lessons = SAMPLE_LESSONS.filter(l => {
    const matchSkill = l.skill.toLowerCase() === skill;
    const matchLevel = level === 'All' || l.level === level;
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase());
    const matchAccess = accessFilter === 'All' || (accessFilter === 'Free' ? l.free : !l.free);
    return matchSkill && matchLevel && matchSearch && matchAccess;
  });

  // Add more sample lessons for the list
  const allLessons = [...lessons];
  if (allLessons.length < 3) {
    SAMPLE_LESSONS.filter(l => l.lang === langData.name).slice(0, 6).forEach(l => {
      if (!allLessons.find(a => a.id === l.id)) allLessons.push({ ...l, skill: skillName });
    });
  }

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 28 }}>
        <Breadcrumb items={[
          { label: 'Home', page: 'home' },
          { label: langData.name, page: 'language', params: { lang } },
          { label: skillName },
        ]} navigate={navigate} />
      </div>

      <section style={{ padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={SKILL_ICONS[skillName] || 'book'} size={22} color={sc.accent} />
            </div>
            <h1 style={{ fontSize: isCompact ? 24 : 30, fontWeight: 800 }}>{langData.name} {skillName}</h1>
          </div>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 28 }}>
            Browse {skillName.toLowerCase()} lessons for {langData.name} learners, from beginner to advanced.
          </p>

          {/* Filters */}
          <div style={{
            display: 'flex', flexDirection: layout === 'classic' ? 'column' : 'row',
            gap: 16, marginBottom: 28, flexWrap: 'wrap', alignItems: layout === 'classic' ? 'stretch' : 'center',
          }}>
            <LevelFilter selected={level} onChange={setLevel} />
            <div style={{ display: 'flex', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['All', 'Free', 'Premium'].map(f => (
                  <button key={f} onClick={() => setAccessFilter(f)} style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: accessFilter === f ? 'var(--n-800)' : '#fff',
                    color: accessFilter === f ? '#fff' : 'var(--n-600)',
                    border: `1px solid ${accessFilter === f ? 'var(--n-800)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}>{f}</button>
                ))}
              </div>
              <SearchInput placeholder="Search lessons..." value={search} onChange={setSearch} style={{ width: 260 }} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container" style={{
          display: isWide ? 'block' : 'grid',
          gridTemplateColumns: isWide ? undefined : layout === 'classic' ? '1fr 300px' : '1fr',
          gap: 32,
        }}>
          <div>
            {allLessons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Icon name="search" size={48} color="var(--n-200)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--n-600)' }}>No lessons found</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Try changing the level filter or search keyword.</p>
                <Button variant="outline" size="sm" onClick={() => { setLevel('All'); setSearch(''); }}>View all lessons</Button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isCompact ? 'repeat(2, 1fr)' : isWide ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                gap: 16,
              }}>
                {allLessons.map(lesson => (
                  <LessonCard key={lesson.id} lesson={lesson} layout={layout} onClick={() => {
                    const target = skill === 'listening' ? 'listening-lesson' : skill === 'dictation' ? 'dictation-lesson' : skill === 'vocabulary' ? 'vocabulary' : 'lesson';
                    navigate(target, { lang, skill, id: lesson.id });
                  }} />
                ))}
              </div>
            )}
            {allLessons.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {[1,2,3,4,5].map(p => (
                  <button key={p} style={{
                    width: 36, height: 36, borderRadius: 8, border: `1px solid ${p === 1 ? 'var(--blue-500)' : 'var(--border)'}`,
                    background: p === 1 ? 'var(--blue-500)' : '#fff', color: p === 1 ? '#fff' : 'var(--n-600)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}>{p}</button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar (classic layout) */}
          {layout === 'classic' && (
            <aside>
              <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', marginBottom: 16 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recommended</h4>
                {SAMPLE_LESSONS.slice(0, 3).map(l => (
                  <div key={l.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--n-100)', cursor: 'pointer' }}
                    onClick={() => navigate('lesson', { lang, skill, id: l.id })}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{l.title}</p>
                    <span style={{ fontSize: 12, color: 'var(--n-400)' }}>{l.level} · {l.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 20, background: 'var(--blue-50)', borderRadius: 16, border: '1px solid var(--blue-100)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 8 }}>Track your progress</h4>
                <p style={{ fontSize: 13, color: 'var(--blue-600)', lineHeight: 1.5, marginBottom: 16 }}>Create a free account to save completed lessons and quiz scores.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('register')}>Sign up free</Button>
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { LanguageDetailPage, SkillLessonListPage });
