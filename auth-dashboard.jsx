/* LangPath — Auth Pages (Login + Register) + Learner Dashboard */

function LoginPage({ navigate, onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin && onLogin(); navigate('dashboard'); }, 800);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Log in to save your progress and continue learning.</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} error={errors.email} />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} error={errors.password} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ fontSize: 13, color: 'var(--blue-500)', fontWeight: 500 }}>Forgot password?</a>
            </div>
            <Button variant="primary" size="lg" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); navigate('register'); }} style={{ fontWeight: 600, color: 'var(--blue-500)' }}>Create one</a>
        </p>
      </div>
    </div>
  );
}

function RegisterPage({ navigate, onLogin }) {
  const [form, setForm] = React.useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!form.email.includes('@')) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (!form.terms) errs.terms = 'You must agree to continue';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin && onLogin(); navigate('dashboard'); }, 800);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create your learning account</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Start learning and track your progress across languages.</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Full name" placeholder="Your name" value={form.name} onChange={v => update('name', v)} error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={v => update('email', v)} error={errors.email} />
            <Input label="Password" type="password" placeholder="At least 6 characters" value={form.password} onChange={v => update('password', v)} error={errors.password} />
            <Input label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirm} onChange={v => update('confirm', v)} error={errors.confirm} />
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.terms} onChange={e => update('terms', e.target.checked)}
                style={{ marginTop: 3, accentColor: 'var(--blue-500)' }} />
              <span style={{ fontSize: 13, color: 'var(--n-600)', lineHeight: 1.4 }}>
                I agree to the <a href="#" style={{ color: 'var(--blue-500)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--blue-500)' }}>Privacy Policy</a>.
              </span>
            </label>
            {errors.terms && <span style={{ fontSize: 13, color: 'var(--red-500)', marginTop: -8 }}>{errors.terms}</span>}
            <Button variant="primary" size="lg" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <a href="#" onClick={e => { e.preventDefault(); navigate('login'); }} style={{ fontWeight: 600, color: 'var(--blue-500)' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}

function LearnerDashboard({ navigate, layout }) {
  const isCompact = layout === 'compact';

  return (
    <div style={{ paddingBottom: 64 }}>
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: isCompact ? 24 : 30, fontWeight: 800, marginBottom: 6 }}>Welcome back, Minh</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Keep up the great work! Here's your learning overview.</p>
        </div>

        {/* Continue learning */}
        <div style={{
          padding: 24, background: 'linear-gradient(135deg, var(--blue-50), #fff)',
          borderRadius: 20, border: '1px solid var(--blue-100)', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Continue learning</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>My First Day at School</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>English · Reading · A1</p>
            <ProgressBar value={60} height={6} style={{ maxWidth: 240, marginBottom: 8 }} />
            <span style={{ fontSize: 12, color: 'var(--n-400)' }}>60% complete</span>
          </div>
          <Button variant="primary" onClick={() => navigate('lesson', { lang: 'english', skill: 'reading', id: 'first-day-school' })}>
            Resume lesson
          </Button>
        </div>

        {/* Progress cards */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your progress</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { lang: 'english', name: 'English', completed: 24, best: '92%', level: 'A2', color: 'var(--blue-500)' },
            { lang: 'german', name: 'German', completed: 6, best: '78%', level: 'A1', color: 'var(--green-500)' },
            { lang: 'french', name: 'French', completed: 2, best: '65%', level: 'A1', color: '#A855F7' },
          ].map(p => (
            <Card key={p.lang} hover onClick={() => navigate('language', { lang: p.lang })} style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <FlagIcon lang={p.lang} size={24} />
                <span style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</span>
                <Badge color="blue" style={{ marginLeft: 'auto' }}>{p.level}</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: p.color }}>{p.completed}</div>
                  <div style={{ fontSize: 12, color: 'var(--n-400)' }}>Lessons done</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: p.color }}>{p.best}</div>
                  <div style={{ fontSize: 12, color: 'var(--n-400)' }}>Best score</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent activity */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recent activity</h2>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 32 }}>
          {[
            { title: 'My First Day at School', type: 'Reading · A1', score: '80%', date: 'Today', color: 'var(--green-500)' },
            { title: 'Morning Routine', type: 'Listening · A1', score: '100%', date: 'Yesterday', color: 'var(--green-500)' },
            { title: 'A City Tour in London', type: 'Reading · A2', score: '67%', date: '2 days ago', color: 'var(--amber-500)' },
            { title: 'Simple Sentences', type: 'Dictation · A1', score: '85%', date: '3 days ago', color: 'var(--green-500)' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '16px 20px', borderBottom: i < 3 ? '1px solid var(--n-100)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.title}</p>
                <span style={{ fontSize: 13, color: 'var(--n-400)' }}>{item.type}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.score}</span>
                <p style={{ fontSize: 12, color: 'var(--n-400)' }}>{item.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recommended next</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
          {SAMPLE_LESSONS.slice(2, 5).map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} layout={layout} onClick={() => navigate('lesson', { lang: 'english', skill: lesson.skill.toLowerCase(), id: lesson.id })} />
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, RegisterPage, LearnerDashboard });
