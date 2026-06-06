/* LangPath — Admin Pages (Phase 2) */
/* All data comes from data/constants/* and data/mock/* */

/* ── Shared helpers ── */
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
}

function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--n-900)' }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Admin Dashboard ── */
function AdminDashboard({ navigate }) {
  const lessons    = ADMIN_MOCK_LESSONS;
  const users      = MOCK_USERS;
  const jobs       = MOCK_WORKER_JOBS;
  const published  = lessons.filter(l => l.status === 'Published').length;
  const drafts     = lessons.filter(l => l.status === 'Draft').length;
  const premium    = users.filter(u => u.premium).length;
  const pending    = jobs.filter(j => j.status === 'PENDING' || j.status === 'RUNNING').length;

  const stats = [
    { label: 'Total Lessons',   value: lessons.length,          icon: 'book',     color: 'var(--green-500)', bg: 'var(--green-50)' },
    { label: 'Published',       value: published,               icon: 'check',    color: '#059669',          bg: '#ECFDF5'         },
    { label: 'Drafts',          value: drafts,                  icon: 'edit',     color: 'var(--amber-500)', bg: 'var(--amber-50)' },
    { label: 'Total Users',     value: users.length,            icon: 'user',     color: '#A855F7',          bg: '#FDF4FF'         },
    { label: 'Premium Users',   value: premium,                 icon: 'star',     color: 'var(--amber-500)', bg: 'var(--amber-50)' },
    { label: 'Pending Jobs',    value: pending,                 icon: 'settings', color: 'var(--n-500)',     bg: 'var(--n-100)'    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Admin Dashboard</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>Overview of your learning platform.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent lessons */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Lessons</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('admin-lessons')}>View all</Button>
          </div>
          {lessons.slice(0, 4).map((l, i) => (
            <div key={l.id} style={{ padding: '14px 20px', borderBottom: i < 3 ? '1px solid var(--n-100)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{l.title}</p>
                <span style={{ fontSize: 12, color: 'var(--n-400)' }}>{l.lang}</span>
              </div>
              <Badge color={LESSON_STATUS_COLORS[l.status] || 'gray'}>{l.status}</Badge>
            </div>
          ))}
        </div>

        {/* Recent users */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Users</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('admin-users')}>View all</Button>
          </div>
          {users.slice(0, 4).map((u, i) => (
            <div key={u.id} style={{ padding: '14px 20px', borderBottom: i < 3 ? '1px solid var(--n-100)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={14} color="var(--blue-500)" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 1 }}>{u.name}</p>
                  <span style={{ fontSize: 12, color: 'var(--n-400)' }}>{u.email}</span>
                </div>
              </div>
              <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'EDITOR' ? 'blue' : 'gray'}>{u.role}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Admin Lesson List ── */
function AdminLessonList({ navigate }) {
  const [lessons, setLessons] = React.useState(ADMIN_MOCK_LESSONS.map(l => ({ ...l })));
  const [searchVal, setSearchVal]     = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All Status');
  const [langFilter, setLangFilter]   = React.useState('All Languages');
  const [deleteTarget, setDeleteTarget] = React.useState(null);

  const filtered = lessons.filter(l => {
    const ms = !searchVal || l.title.toLowerCase().includes(searchVal.toLowerCase());
    const mst = statusFilter === 'All Status' || l.status === statusFilter;
    const ml  = langFilter === 'All Languages' || l.lang === langFilter;
    return ms && mst && ml;
  });

  const setStatus = (id, status) => setLessons(ls => ls.map(l => l.id === id ? { ...l, status } : l));
  const confirmDelete = () => { setLessons(ls => ls.filter(l => l.id !== deleteTarget.id)); setDeleteTarget(null); };

  return (
    <div style={{ padding: 32 }}>
      <AdminPageHeader
        title="Lessons"
        subtitle={`${lessons.length} lessons total`}
        action={<Button variant="primary" icon={<Icon name="plus" size={18} color="#fff" />} onClick={() => navigate('admin-lesson-form')}>New Lesson</Button>}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SearchInput placeholder="Search lessons..." value={searchVal} onChange={setSearchVal} style={{ flex: 1 }} />
        <SelectInput options={['All Status', ...Object.values(LESSON_STATUSES)]} value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }} />
        <SelectInput options={['All Languages', ...LANGUAGES_DATA.map(l => l.name)]} value={langFilter} onChange={setLangFilter} style={{ width: 160 }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Title','Language','Skill','Level','Status','Premium','Updated','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontWeight: 600, maxWidth: 220 }}>{l.title}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-600)' }}>{l.lang}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-600)' }}>{l.skill}</td>
                <td style={{ padding: '14px 16px' }}><Badge color="blue">{l.level}</Badge></td>
                <td style={{ padding: '14px 16px' }}><Badge color={LESSON_STATUS_COLORS[l.status] || 'gray'}>{l.status}</Badge></td>
                <td style={{ padding: '14px 16px' }}>{l.premium ? <Badge color="amber">Yes</Badge> : <span style={{ color: 'var(--n-300)' }}>—</span>}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontSize: 13 }}>{l.updated}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('admin-lesson-form', { id: l.id })}>Edit</Button>
                    {l.status === 'Published'
                      ? <Button variant="ghost" size="sm" style={{ color: 'var(--amber-500)' }} onClick={() => setStatus(l.id, 'Draft')}>Unpublish</Button>
                      : <Button variant="ghost" size="sm" style={{ color: 'var(--green-500)' }} onClick={() => setStatus(l.id, 'Published')}>Publish</Button>
                    }
                    <Button variant="ghost" size="sm" style={{ color: 'var(--red-500)' }} onClick={() => setDeleteTarget(l)}>Del</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--n-400)' }}>No lessons found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Lesson">
        <p style={{ fontSize: 15, color: 'var(--n-600)', lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ── Lesson Questions Editor (embedded inside AdminLessonForm) ── */
function LessonQuestionsEditor({ lessonId, lessonTitle }) {
  const QTYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_BLANK', 'DICTATION'];
  const typeBadgeColor = { SINGLE_CHOICE: 'blue', MULTIPLE_CHOICE: 'green', FILL_BLANK: 'amber', DICTATION: 'gray' };
  const numId = lessonId ? Number(lessonId) : null;

  const [open,      setOpen]      = React.useState(true);
  const [questions, setQuestions] = React.useState(() =>
    numId ? MOCK_QUESTIONS.filter(q => q.lessonId === numId).map(q => ({ ...q, options: [...(q.options || [])] })) : []
  );
  const [showForm,  setShowForm]  = React.useState(false);
  const [editQ,     setEditQ]     = React.useState(null);
  const [deleteQ,   setDeleteQ]   = React.useState(null);
  const [form,      setForm]      = React.useState({
    lessonId: numId, lessonTitle: lessonTitle || '', type: 'SINGLE_CHOICE',
    prompt: '', options: ['', '', '', ''], correctIdx: 0, correctIndices: [],
    answer: '', explanation: '', sortOrder: 1,
  });

  const openAdd = () => {
    setForm({
      lessonId: numId, lessonTitle: lessonTitle || '', type: 'SINGLE_CHOICE',
      prompt: '', options: ['', '', '', ''], correctIdx: 0, correctIndices: [],
      answer: '', explanation: '', sortOrder: questions.length + 1,
    });
    setEditQ(null);
    setShowForm(true);
  };

  const openEdit = q => {
    const opts = q.options.length > 0 ? [...q.options, '', ''].slice(0, Math.max(q.options.length, 2)) : ['', '', '', ''];
    setForm({ ...q, options: opts });
    setEditQ(q.id);
    setShowForm(true);
  };

  const saveQuestion = () => {
    if (!form.prompt.trim()) return;
    const cleaned = { ...form, options: form.options.filter(o => o.trim()) };
    if (editQ !== null) {
      setQuestions(qs => qs.map(q => q.id === editQ ? cleaned : q));
    } else {
      setQuestions(qs => [...qs, { ...cleaned, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const confirmDelete  = ()    => { setQuestions(qs => qs.filter(q => q.id !== deleteQ.id)); setDeleteQ(null); };
  const updateOption   = (i,v) => setForm(f => { const opts = [...f.options]; opts[i] = v; return { ...f, options: opts }; });
  const addOption      = ()    => setForm(f => ({ ...f, options: [...f.options, ''] }));
  const removeOption   = i    => setForm(f => {
    const opts = f.options.filter((_, idx) => idx !== i);
    return { ...f, options: opts, correctIdx: f.correctIdx >= opts.length ? 0 : f.correctIdx };
  });
  const toggleMulti = i => setForm(f => {
    const ci = f.correctIndices.includes(i) ? f.correctIndices.filter(x => x !== i) : [...f.correctIndices, i];
    return { ...f, correctIndices: ci };
  });

  const hasOptions = form.type === 'SINGLE_CHOICE' || form.type === 'MULTIPLE_CHOICE';

  if (!numId) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--n-700)' }}>Questions &amp; Answers</h3>
        <p style={{ fontSize: 14, color: 'var(--n-400)', marginTop: 8 }}>Save the lesson first before adding questions.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
      {/* Collapsible header */}
      <div
        style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name={open ? 'chevDown' : 'chevRight'} size={18} color="var(--n-500)" />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Questions &amp; Answers</h3>
          <Badge color="gray">{questions.length}</Badge>
        </div>
        {open && (
          <div onClick={e => e.stopPropagation()}>
            <Button variant="primary" size="sm" icon={<Icon name="plus" size={14} color="#fff" />} onClick={openAdd}>Add Question</Button>
          </div>
        )}
      </div>

      {open && (
        <div style={{ padding: 24 }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Icon name="book" size={32} color="var(--n-300)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--n-400)', marginBottom: 16 }}>No questions yet for this lesson.</p>
              <Button variant="outline" size="sm" icon={<Icon name="plus" size={14} />} onClick={openAdd}>Add first question</Button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Type', 'Prompt', 'Options', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => (
                  <tr key={q.id} style={{ borderBottom: i < questions.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px', color: 'var(--n-400)', fontWeight: 600, width: 36 }}>{q.sortOrder}</td>
                    <td style={{ padding: '12px' }}><Badge color={typeBadgeColor[q.type] || 'gray'} style={{ fontSize: 11 }}>{q.type.replace(/_/g, ' ')}</Badge></td>
                    <td style={{ padding: '12px', maxWidth: 300, fontWeight: 500 }}>{q.prompt}</td>
                    <td style={{ padding: '12px', color: 'var(--n-500)', fontSize: 13 }}>{q.options.length > 0 ? `${q.options.length} options` : '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>Edit</Button>
                        <Button variant="ghost" size="sm" style={{ color: 'var(--red-500)' }} onClick={() => setDeleteQ(q)}>Del</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add / Edit question modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editQ !== null ? 'Edit Question' : 'New Question'} width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectInput label="Type" options={QTYPES} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} />
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm(f => ({ ...f, sortOrder: Number(v) }))} />
          </div>
          <Textarea label="Question Prompt" placeholder="Enter the question..." value={form.prompt} onChange={v => setForm(f => ({ ...f, prompt: v }))} rows={2} />

          {hasOptions && (
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)', marginBottom: 8, display: 'block' }}>
                Answer Options {form.type === 'MULTIPLE_CHOICE' ? '(select all correct)' : '(select one correct)'}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {form.type === 'SINGLE_CHOICE'
                      ? <input type="radio" name="lqe_correct" checked={form.correctIdx === i} onChange={() => setForm(f => ({ ...f, correctIdx: i }))} style={{ accentColor: 'var(--green-500)', flexShrink: 0 }} />
                      : <input type="checkbox" checked={form.correctIndices.includes(i)} onChange={() => toggleMulti(i)} style={{ accentColor: 'var(--green-500)', flexShrink: 0 }} />
                    }
                    <input
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
                    />
                    {form.options.length > 2 && (
                      <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)', fontSize: 18, lineHeight: 1 }}>×</button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" icon={<Icon name="plus" size={14} />} onClick={addOption} style={{ alignSelf: 'flex-start', marginTop: 4 }}>Add option</Button>
              </div>
            </div>
          )}

          {!hasOptions && (
            <Input label="Correct Answer" placeholder="Type the expected answer..." value={form.answer} onChange={v => setForm(f => ({ ...f, answer: v }))} />
          )}

          <Textarea label="Explanation (optional)" placeholder="Why is this the correct answer?" value={form.explanation} onChange={v => setForm(f => ({ ...f, explanation: v }))} rows={2} />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveQuestion} disabled={!form.prompt.trim()}>Save Question</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteQ} onClose={() => setDeleteQ(null)} title="Delete Question">
        <p style={{ fontSize: 15, color: 'var(--n-600)', lineHeight: 1.6, marginBottom: 24 }}>
          Delete question: <strong>{deleteQ?.prompt}</strong>?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setDeleteQ(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ── Admin Lesson Form ── */
function AdminLessonForm({ navigate, lessonId }) {
  const existing = lessonId ? ADMIN_MOCK_LESSONS.find(l => l.id === Number(lessonId)) : null;
  const [form, setForm] = React.useState({
    language: existing?.lang     || 'English',
    skill:    existing?.skill    || 'Reading',
    level:    existing?.level    || 'A1',
    title:    existing?.title    || '',
    slug:     existing?.slug     || '',
    summary:  existing?.summary  || '',
    content:  '',
    premium:  existing?.premium  || false,
    seoTitle: existing?.seoTitle || '',
    seoDesc:  existing?.seoDesc  || '',
    status:   existing?.status   || 'Draft',
  });
  const [showPublish,   setShowPublish]   = React.useState(false);
  const [showUnpublish, setShowUnpublish] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const update = (k, v) => {
    if (k === 'title') {
      setForm(prev => ({
        ...prev, title: v,
        slug: !prev.slug || prev.slug === toSlug(prev.title) ? toSlug(v) : prev.slug,
      }));
    } else {
      setForm(prev => ({ ...prev, [k]: v }));
    }
  };

  const handleSaveDraft = () => { update('status', 'Draft'); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handlePublish   = () => { update('status', 'Published'); setShowPublish(false); navigate('admin-lessons'); };
  const handleUnpublish = () => { update('status', 'Draft');     setShowUnpublish(false); navigate('admin-lessons'); };

  const skillNames = ['Reading', 'Listening', 'Dictation', 'Grammar', 'Vocabulary'];

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <Breadcrumb items={[
        { label: 'Lessons', page: 'admin-lessons' },
        { label: lessonId ? 'Edit Lesson' : 'New Lesson' },
      ]} navigate={navigate} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 28px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{lessonId ? 'Edit Lesson' : 'Create New Lesson'}</h1>
        <Badge color={LESSON_STATUS_COLORS[form.status] || 'gray'}>{form.status}</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Basic info */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            <SelectInput label="Language" options={LANGUAGES_DATA.map(l => l.name)} value={form.language} onChange={v => update('language', v)} />
            <SelectInput label="Skill"    options={skillNames}                       value={form.skill}    onChange={v => update('skill', v)} />
            <SelectInput label="Level"    options={LEVELS}                           value={form.level}    onChange={v => update('level', v)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Input label="Title" placeholder="Lesson title" value={form.title} onChange={v => update('title', v)} />
            <Input label="Slug (auto-generated)" placeholder="lesson-url-slug" value={form.slug} onChange={v => update('slug', v)} />
          </div>
          <Textarea label="Summary" placeholder="Brief description of this lesson..." value={form.summary} onChange={v => update('summary', v)} rows={2} />
        </div>

        {/* Content */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Content</h3>
          <Textarea label="Lesson Content" placeholder="Write the lesson text here..." value={form.content} onChange={v => update('content', v)} rows={8} />
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)', marginBottom: 6, display: 'block' }}>Audio File</label>
            <div style={{ padding: 24, border: '2px dashed var(--border)', borderRadius: 12, textAlign: 'center', background: 'var(--n-50)' }}>
              <Icon name="volume" size={24} color="var(--n-300)" style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--n-400)' }}>Drop audio file here or <span style={{ color: 'var(--blue-500)', fontWeight: 600, cursor: 'pointer' }}>browse</span></p>
            </div>
          </div>
        </div>

        {/* SEO & Settings */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>SEO &amp; Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="SEO Title" placeholder="SEO-optimized title" value={form.seoTitle} onChange={v => update('seoTitle', v)} />
            <Textarea label="SEO Description" placeholder="Meta description for search engines..." value={form.seoDesc} onChange={v => update('seoDesc', v)} rows={2} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.premium} onChange={e => update('premium', e.target.checked)} style={{ accentColor: 'var(--blue-500)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)' }}>Premium lesson</span>
            </label>
          </div>
        </div>

        {/* Questions & Answers */}
        <LessonQuestionsEditor lessonId={lessonId} lessonTitle={form.title} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
          {saved && <span style={{ fontSize: 13, color: 'var(--green-500)', fontWeight: 600 }}>Draft saved</span>}
          <Button variant="ghost" onClick={() => navigate('admin-lessons')}>Cancel</Button>
          <Button variant="outline" onClick={handleSaveDraft}>Save draft</Button>
          {form.status === 'Published'
            ? <Button variant="outline" style={{ color: 'var(--amber-500)', borderColor: 'var(--amber-500)' }} onClick={() => setShowUnpublish(true)}>Unpublish</Button>
            : <Button variant="primary" onClick={() => setShowPublish(true)}>Publish</Button>
          }
        </div>
      </div>

      <Modal open={showPublish} onClose={() => setShowPublish(false)} title="Publish Lesson">
        <p style={{ fontSize: 15, color: 'var(--n-600)', lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to publish <strong>{form.title || 'this lesson'}</strong>? It will be visible to all learners immediately.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setShowPublish(false)}>Cancel</Button>
          <Button variant="primary" onClick={handlePublish}>Confirm Publish</Button>
        </div>
      </Modal>

      <Modal open={showUnpublish} onClose={() => setShowUnpublish(false)} title="Unpublish Lesson">
        <p style={{ fontSize: 15, color: 'var(--n-600)', lineHeight: 1.6, marginBottom: 24 }}>
          This will move <strong>{form.title}</strong> back to Draft. Learners will no longer see it.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setShowUnpublish(false)}>Cancel</Button>
          <Button variant="outline" style={{ color: 'var(--amber-500)', borderColor: 'var(--amber-500)' }} onClick={handleUnpublish}>Confirm Unpublish</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ── Admin Questions Page ── */
var defaultQForm = { lessonId: 1, type: 'SINGLE_CHOICE', prompt: '', options: ['', '', '', ''], correctIdx: 0, correctIndices: [], answer: '', explanation: '', sortOrder: 1 };

function AdminQuestionsPage({ navigate }) {
  const [questions, setQuestions] = React.useState(MOCK_QUESTIONS.map(q => ({ ...q, options: [...(q.options || [])] })));
  const [editQ,     setEditQ]     = React.useState(null);
  const [deleteQ,   setDeleteQ]   = React.useState(null);
  const [form,      setForm]      = React.useState({ ...defaultQForm, options: ['', '', '', ''] });
  const [showForm,  setShowForm]  = React.useState(false);
  const [lessonFilter, setLessonFilter] = React.useState('All Lessons');
  const [typeFilter,   setTypeFilter]   = React.useState('All Types');

  const QTYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_BLANK', 'DICTATION'];
  const lessonOptions = ['All Lessons', ...Array.from(new Set(questions.map(q => q.lessonTitle)))];
  const typeOptions   = ['All Types', ...QTYPES];

  const filtered = questions.filter(q => {
    const ml = lessonFilter === 'All Lessons' || q.lessonTitle === lessonFilter;
    const mt = typeFilter   === 'All Types'   || q.type === typeFilter;
    return ml && mt;
  });

  const openAdd = () => {
    setForm({ ...defaultQForm, options: ['', '', '', ''], id: Date.now() });
    setEditQ(null);
    setShowForm(true);
  };

  const openEdit = (q) => {
    setForm({ ...q, options: q.options.length > 0 ? [...q.options, '', '', '', ''].slice(0, Math.max(q.options.length, 2)) : ['', '', '', ''] });
    setEditQ(q.id);
    setShowForm(true);
  };

  const saveQuestion = () => {
    if (!form.prompt.trim()) return;
    const cleaned = { ...form, options: form.options.filter(o => o.trim()) };
    if (editQ) {
      setQuestions(qs => qs.map(q => q.id === editQ ? cleaned : q));
    } else {
      setQuestions(qs => [...qs, { ...cleaned, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => { setQuestions(qs => qs.filter(q => q.id !== deleteQ.id)); setDeleteQ(null); };

  const updateOption = (i, v) => setForm(f => { const opts = [...f.options]; opts[i] = v; return { ...f, options: opts }; });
  const addOption    = ()     => setForm(f => ({ ...f, options: [...f.options, ''] }));
  const removeOption = (i)    => setForm(f => { const opts = f.options.filter((_, idx) => idx !== i); return { ...f, options: opts, correctIdx: f.correctIdx >= opts.length ? 0 : f.correctIdx }; });
  const toggleCorrectMulti = (i) => setForm(f => {
    const ci = f.correctIndices.includes(i) ? f.correctIndices.filter(x => x !== i) : [...f.correctIndices, i];
    return { ...f, correctIndices: ci };
  });

  const hasOptions = form.type === 'SINGLE_CHOICE' || form.type === 'MULTIPLE_CHOICE';

  const typeBadgeColor = { SINGLE_CHOICE: 'blue', MULTIPLE_CHOICE: 'green', FILL_BLANK: 'amber', DICTATION: 'gray' };

  return (
    <div style={{ padding: 32 }}>
      <AdminPageHeader
        title="Questions"
        subtitle={`${questions.length} questions total`}
        action={<Button variant="primary" icon={<Icon name="plus" size={18} color="#fff" />} onClick={openAdd}>New Question</Button>}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SelectInput options={lessonOptions} value={lessonFilter} onChange={setLessonFilter} style={{ width: 220 }} />
        <SelectInput options={typeOptions}   value={typeFilter}   onChange={setTypeFilter}   style={{ width: 180 }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#','Lesson','Type','Prompt','Options','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontWeight: 600 }}>{q.sortOrder}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-600)', fontSize: 13 }}>{q.lessonTitle}</td>
                <td style={{ padding: '14px 16px' }}><Badge color={typeBadgeColor[q.type] || 'gray'} style={{ fontSize: 11 }}>{q.type.replace('_', ' ')}</Badge></td>
                <td style={{ padding: '14px 16px', maxWidth: 280, fontWeight: 500 }}>{q.prompt}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-500)', fontSize: 13 }}>{q.options.length > 0 ? `${q.options.length} options` : '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>Edit</Button>
                    <Button variant="ghost" size="sm" style={{ color: 'var(--red-500)' }} onClick={() => setDeleteQ(q)}>Del</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--n-400)' }}>No questions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Question editor modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editQ ? 'Edit Question' : 'New Question'} width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SelectInput label="Lesson" options={ADMIN_MOCK_LESSONS.map(l => ({ value: l.id, label: l.title }))} value={form.lessonId} onChange={v => setForm(f => ({ ...f, lessonId: Number(v), lessonTitle: ADMIN_MOCK_LESSONS.find(l => l.id === Number(v))?.title || '' }))} />
            <SelectInput label="Type" options={QTYPES} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} />
          </div>
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm(f => ({ ...f, sortOrder: Number(v) }))} />
          <Textarea label="Question Prompt" placeholder="Enter the question..." value={form.prompt} onChange={v => setForm(f => ({ ...f, prompt: v }))} rows={2} />

          {hasOptions && (
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)', marginBottom: 8, display: 'block' }}>
                Answer Options {form.type === 'MULTIPLE_CHOICE' ? '(select all correct)' : '(select one correct)'}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {form.type === 'SINGLE_CHOICE'
                      ? <input type="radio" name="correct" checked={form.correctIdx === i} onChange={() => setForm(f => ({ ...f, correctIdx: i }))} style={{ accentColor: 'var(--green-500)', flexShrink: 0 }} />
                      : <input type="checkbox" checked={form.correctIndices.includes(i)} onChange={() => toggleCorrectMulti(i)} style={{ accentColor: 'var(--green-500)', flexShrink: 0 }} />
                    }
                    <input
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
                    />
                    {form.options.length > 2 && (
                      <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)', fontSize: 18, lineHeight: 1 }}>×</button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" icon={<Icon name="plus" size={14} />} onClick={addOption} style={{ alignSelf: 'flex-start', marginTop: 4 }}>Add option</Button>
              </div>
            </div>
          )}

          {!hasOptions && (
            <Input label="Correct Answer" placeholder="Type the expected answer..." value={form.answer} onChange={v => setForm(f => ({ ...f, answer: v }))} />
          )}

          <Textarea label="Explanation (optional)" placeholder="Why is this the correct answer?" value={form.explanation} onChange={v => setForm(f => ({ ...f, explanation: v }))} rows={2} />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveQuestion} disabled={!form.prompt.trim()}>Save Question</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteQ} onClose={() => setDeleteQ(null)} title="Delete Question">
        <p style={{ fontSize: 15, color: 'var(--n-600)', lineHeight: 1.6, marginBottom: 24 }}>
          Delete question: <strong>{deleteQ?.prompt}</strong>?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setDeleteQ(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ── Admin Languages Page ── */
function AdminLanguagesPage({ navigate }) {
  const [langs, setLangs] = React.useState(LANGUAGES_DATA.map(l => ({ ...l })));
  const [editL, setEditL] = React.useState(null);
  const [form,  setForm]  = React.useState({ id: '', name: '', slug: '', meta: '', active: true });

  const openEdit = (l) => { setForm({ ...l }); setEditL(l.id); };
  const openAdd  = ()  => { setForm({ id: '', name: '', slug: '', meta: '', active: true }); setEditL('new'); };
  const saveL    = ()  => {
    if (!form.name.trim()) return;
    const entry = { ...form, slug: form.slug || toSlug(form.name), id: form.id || toSlug(form.name), skills: form.skills || ['Reading','Listening','Dictation','Grammar','Vocabulary'] };
    if (editL === 'new') {
      setLangs(ls => [...ls, entry]);
    } else {
      setLangs(ls => ls.map(l => l.id === editL ? entry : l));
    }
    setEditL(null);
  };
  const toggleActive = (id) => setLangs(ls => ls.map(l => l.id === id ? { ...l, active: !l.active } : l));

  return (
    <div style={{ padding: 32 }}>
      <AdminPageHeader
        title="Languages"
        subtitle={`${langs.length} languages`}
        action={<Button variant="primary" icon={<Icon name="plus" size={18} color="#fff" />} onClick={openAdd}>Add Language</Button>}
      />

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Flag','Name','Slug','Content','Skills','Active','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {langs.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: i < langs.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}><FlagIcon lang={l.id} size={24} /></td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>{l.name}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontFamily: 'monospace', fontSize: 13 }}>{l.slug || l.id}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-600)', fontSize: 13 }}>{l.meta}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(l.skills || []).map(s => <Badge key={s} color="gray" style={{ fontSize: 11 }}>{s}</Badge>)}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => toggleActive(l.id)} style={{
                    width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative',
                    background: l.active !== false ? 'var(--green-500)' : 'var(--n-300)', transition: 'background 0.2s',
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: l.active !== false ? 18 : 3,
                      width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                    }} />
                  </button>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(l)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editL} onClose={() => setEditL(null)} title={editL === 'new' ? 'Add Language' : 'Edit Language'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Language Name" placeholder="e.g. Italian" value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: toSlug(v) }))} />
          <Input label="Slug" placeholder="e.g. italian" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} />
          <Input label="Content summary" placeholder="e.g. 120 reading texts · 45 listening texts" value={form.meta} onChange={v => setForm(f => ({ ...f, meta: v }))} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active !== false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ accentColor: 'var(--blue-500)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)' }}>Active (visible to learners)</span>
          </label>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="outline" onClick={() => setEditL(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveL} disabled={!form.name.trim()}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Admin Users Page ── */
function AdminUsersPage({ navigate }) {
  const [users, setUsers] = React.useState(MOCK_USERS.map(u => ({ ...u })));
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('All Roles');

  const filtered = users.filter(u => {
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === 'All Roles' || u.role === roleFilter;
    return ms && mr;
  });

  const setRole    = (id, role)        => setUsers(us => us.map(u => u.id === id ? { ...u, role }           : u));
  const setPremium = (id, premium)     => setUsers(us => us.map(u => u.id === id ? { ...u, premium }        : u));
  const setActive  = (id, active)      => setUsers(us => us.map(u => u.id === id ? { ...u, status: active ? 'active' : 'inactive' } : u));

  const roleColor = { ADMIN: 'red', EDITOR: 'blue', LEARNER: 'gray' };

  return (
    <div style={{ padding: 32 }}>
      <AdminPageHeader title="Users" subtitle={`${users.length} users total`} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SearchInput placeholder="Search by name or email..." value={search} onChange={setSearch} style={{ flex: 1 }} />
        <SelectInput options={['All Roles', ...Object.values(ROLES)]} value={roleFilter} onChange={setRoleFilter} style={{ width: 160 }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['User','Email','Role','Premium','Status','Lessons','Joined','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="user" size={14} color="var(--blue-500)" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--n-500)', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <SelectInput
                    options={Object.values(ROLES)}
                    value={u.role}
                    onChange={v => setRole(u.id, v)}
                    style={{ minWidth: 110 }}
                  />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => setPremium(u.id, !u.premium)} style={{
                    width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative',
                    background: u.premium ? 'var(--amber-500)' : 'var(--n-300)', transition: 'background 0.2s',
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: u.premium ? 18 : 3,
                      width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                    }} />
                  </button>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge color={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--n-500)' }}>{u.lessonsCompleted}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontSize: 13 }}>{u.joined}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Button variant="ghost" size="sm"
                    style={{ color: u.status === 'active' ? 'var(--amber-500)' : 'var(--green-500)' }}
                    onClick={() => setActive(u.id, u.status !== 'active')}>
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--n-400)' }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Admin Media Page ── */
function AdminMediaPage({ navigate }) {
  const [assets, setAssets] = React.useState(MOCK_MEDIA_ASSETS.map(a => ({ ...a })));
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('All Types');
  const [deleteA, setDeleteA] = React.useState(null);

  const filtered = assets.filter(a => {
    const ms = !search || a.fileName.toLowerCase().includes(search.toLowerCase()) || (a.lessonTitle || '').toLowerCase().includes(search.toLowerCase());
    const mt = typeFilter === 'All Types' || a.type.startsWith(typeFilter);
    return ms && mt;
  });

  const typeIcon = (type) => type.startsWith('audio') ? 'volume' : type.startsWith('application/pdf') ? 'layers' : 'globe';
  const confirmDelete = () => { setAssets(as => as.filter(a => a.id !== deleteA.id)); setDeleteA(null); };

  return (
    <div style={{ padding: 32 }}>
      <AdminPageHeader
        title="Media Assets"
        subtitle={`${assets.length} assets`}
        action={
          <div style={{ padding: '10px 20px', background: 'var(--blue-50)', borderRadius: 10, border: '2px dashed var(--blue-200)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="plus" size={16} color="var(--blue-500)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue-500)' }}>Upload placeholder</span>
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SearchInput placeholder="Search assets..." value={search} onChange={setSearch} style={{ flex: 1 }} />
        <SelectInput options={['All Types', 'audio', 'application', 'image']} value={typeFilter} onChange={setTypeFilter} style={{ width: 160 }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Type','File Name','MIME Type','Size','Lesson','Uploaded','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--n-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={typeIcon(a.type)} size={16} color="var(--n-500)" />
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600, maxWidth: 200 }}>{a.fileName}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-500)', fontSize: 12, fontFamily: 'monospace' }}>{a.type}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-500)' }}>{a.size}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-600)', fontSize: 13 }}>{a.lessonTitle || '—'}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontSize: 13 }}>{a.uploadedAt}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Button variant="ghost" size="sm" style={{ color: 'var(--red-500)' }} onClick={() => setDeleteA(a)}>Del</Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--n-400)' }}>No media assets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteA} onClose={() => setDeleteA(null)} title="Delete Asset">
        <p style={{ fontSize: 15, color: 'var(--n-600)', lineHeight: 1.6, marginBottom: 24 }}>
          Delete <strong>{deleteA?.fileName}</strong>?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={() => setDeleteA(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ── Admin Jobs Page ── */
function AdminJobsPage({ navigate }) {
  const [jobs, setJobs] = React.useState(MOCK_WORKER_JOBS.map(j => ({ ...j })));
  const [showTrigger, setShowTrigger] = React.useState(false);
  const [triggerForm, setTriggerForm] = React.useState({ type: 'REVALIDATE_CACHE', payload: '{ "scope": "all" }' });
  const [statusFilter, setStatusFilter] = React.useState('All Status');

  const filtered = jobs.filter(j => statusFilter === 'All Status' || j.status === statusFilter);

  const triggerJob = () => {
    const newJob = {
      id: `job-${String(Date.now()).slice(-6)}`,
      type: triggerForm.type,
      status: 'PENDING',
      idempotencyKey: `${triggerForm.type.toLowerCase()}-manual-${Date.now()}`,
      payload: (() => { try { return JSON.parse(triggerForm.payload); } catch { return {}; } })(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setJobs(js => [newJob, ...js]);
    setShowTrigger(false);
  };

  const cancelJob = (id) => setJobs(js => js.map(j => j.id === id ? { ...j, status: 'CANCELLED' } : j));

  return (
    <div style={{ padding: 32 }}>
      <AdminPageHeader
        title="Worker Jobs"
        subtitle={`${jobs.length} jobs total`}
        action={<Button variant="primary" icon={<Icon name="settings" size={18} color="#fff" />} onClick={() => setShowTrigger(true)}>Trigger Job</Button>}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SelectInput options={['All Status', ...Object.values(JOB_STATUSES)]} value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Job ID','Type','Status','Idempotency Key','Created','Updated','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--n-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((j, i) => (
              <tr key={j.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--n-100)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--n-500)' }}>{j.id}</td>
                <td style={{ padding: '14px 16px' }}><Badge color="blue" style={{ fontSize: 11 }}>{JOB_TYPE_LABELS[j.type] || j.type}</Badge></td>
                <td style={{ padding: '14px 16px' }}><Badge color={JOB_STATUS_COLORS[j.status] || 'gray'}>{j.status}</Badge></td>
                <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--n-400)', maxWidth: 200 }}>{j.idempotencyKey}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontSize: 13 }}>{j.createdAt}</td>
                <td style={{ padding: '14px 16px', color: 'var(--n-400)', fontSize: 13 }}>{j.updatedAt}</td>
                <td style={{ padding: '14px 16px' }}>
                  {(j.status === 'PENDING' || j.status === 'RUNNING') && (
                    <Button variant="ghost" size="sm" style={{ color: 'var(--amber-500)' }} onClick={() => cancelJob(j.id)}>Cancel</Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--n-400)' }}>No jobs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showTrigger} onClose={() => setShowTrigger(false)} title="Trigger Worker Job">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SelectInput label="Job Type" options={Object.values(JOB_TYPES)} value={triggerForm.type} onChange={v => setTriggerForm(f => ({ ...f, type: v }))} />
          <Textarea label="Payload (JSON)" value={triggerForm.payload} onChange={v => setTriggerForm(f => ({ ...f, payload: v }))} rows={3} />
          <div style={{ padding: 12, background: 'var(--n-50)', borderRadius: 8, fontSize: 13, color: 'var(--n-500)' }}>
            This is a mock trigger — no real job will be queued. A new PENDING entry will appear in the table.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowTrigger(false)}>Cancel</Button>
            <Button variant="primary" onClick={triggerJob}>Trigger Job</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, {
  AdminDashboard, AdminLessonList, AdminLessonForm,
  AdminQuestionsPage, AdminLanguagesPage, AdminUsersPage,
  AdminMediaPage, AdminJobsPage,
});
