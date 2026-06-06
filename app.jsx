/* LangPath — Main App (Router + Tweaks) */

/* Hash route maps — simple routes only (no params required) */
const HASH_TO_ROUTE = {
  '#/home':            { page: 'home',            params: {} },
  '#/dashboard':       { page: 'dashboard',        params: {} },
  '#/admin':           { page: 'admin',            params: {} },
  '#/admin/lessons':   { page: 'admin-lessons',    params: {} },
  '#/admin/questions': { page: 'admin-questions',  params: {} },
  '#/admin/languages': { page: 'admin-languages',  params: {} },
  '#/admin/users':     { page: 'admin-users',      params: {} },
  '#/admin/media':     { page: 'admin-media',      params: {} },
  '#/admin/jobs':      { page: 'admin-jobs',       params: {} },
  '#/login':           { page: 'login',            params: {} },
  '#/register':        { page: 'register',         params: {} },
};

const PAGE_TO_HASH = {
  'home':            '#/home',
  'dashboard':       '#/dashboard',
  'admin':           '#/admin',
  'admin-lessons':   '#/admin/lessons',
  'admin-questions': '#/admin/questions',
  'admin-languages': '#/admin/languages',
  'admin-users':     '#/admin/users',
  'admin-media':     '#/admin/media',
  'admin-jobs':      '#/admin/jobs',
  'login':           '#/login',
  'register':        '#/register',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "classic",
  "cardStyle": "elevated",
  "density": "comfortable"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(() => HASH_TO_ROUTE[window.location.hash] || { page: 'home', params: {} });
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [transitioning, setTransitioning] = React.useState(false);

  const navigate = React.useCallback((page, params = {}) => {
    const hash = PAGE_TO_HASH[page];
    if (hash) window.history.replaceState(null, '', hash);
    setTransitioning(true);
    setTimeout(() => {
      setRoute({ page, params });
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTransitioning(false);
    }, 150);
  }, []);

  React.useEffect(() => {
    window.__nav = (page, params) => {
      setRoute({ page, params: params || {} });
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    const onHashChange = () => {
      const r = HASH_TO_ROUTE[window.location.hash];
      if (r) setRoute(r);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const layout = t.layout;
  const isAdmin = route.page.startsWith('admin');

  React.useEffect(() => {
    const root = document.documentElement;
    if (t.cardStyle === 'flat') {
      root.style.setProperty('--shadow-card', 'none');
      root.style.setProperty('--shadow-hover', '0 0 0 2px var(--blue-200)');
    } else if (t.cardStyle === 'bordered') {
      root.style.setProperty('--shadow-card', 'none');
      root.style.setProperty('--shadow-hover', '0 4px 12px rgba(15,23,42,0.08)');
    } else {
      root.style.setProperty('--shadow-card', '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)');
      root.style.setProperty('--shadow-hover', '0 4px 12px rgba(15,23,42,0.08), 0 12px 32px rgba(15,23,42,0.1)');
    }
    if (t.density === 'compact') {
      root.style.setProperty('--sp-lg', '16px');
      root.style.setProperty('--sp-xl', '24px');
      root.style.setProperty('--r-card', '12px');
    } else {
      root.style.setProperty('--sp-lg', '24px');
      root.style.setProperty('--sp-xl', '32px');
      root.style.setProperty('--r-card', '16px');
    }
  }, [t.cardStyle, t.density]);

  const renderPage = () => {
    const p = route.params;
    switch (route.page) {
      case 'home':              return <HomePage navigate={navigate} layout={layout} />;
      case 'language':          return <LanguageDetailPage navigate={navigate} lang={p.lang || 'english'} layout={layout} />;
      case 'skill-list':        return <SkillLessonListPage navigate={navigate} lang={p.lang || 'english'} skill={p.skill || 'reading'} layout={layout} />;
      case 'lesson':            return <LessonDetailPage navigate={navigate} lang={p.lang} skill={p.skill} lessonId={p.id} layout={layout} />;
      case 'listening-lesson':  return <ListeningLessonPage navigate={navigate} lang={p.lang} layout={layout} />;
      case 'dictation-lesson':  return <DictationLessonPage navigate={navigate} lang={p.lang} layout={layout} />;
      case 'vocabulary':        return <VocabularyPracticePage navigate={navigate} lang={p.lang} layout={layout} />;
      case 'login':             return <LoginPage navigate={navigate} onLogin={() => setIsLoggedIn(true)} />;
      case 'register':          return <RegisterPage navigate={navigate} onLogin={() => setIsLoggedIn(true)} />;
      case 'dashboard':         return <LearnerDashboard navigate={navigate} layout={layout} />;
      /* Admin routes */
      case 'admin':             return <AdminDashboard navigate={navigate} />;
      case 'admin-lessons':     return <AdminLessonList navigate={navigate} />;
      case 'admin-lesson-form': return <AdminLessonForm navigate={navigate} lessonId={p.id} />;
      case 'admin-questions':   return <AdminQuestionsPage navigate={navigate} />;
      case 'admin-languages':   return <AdminLanguagesPage navigate={navigate} />;
      case 'admin-users':       return <AdminUsersPage navigate={navigate} />;
      case 'admin-media':       return <AdminMediaPage navigate={navigate} />;
      case 'admin-jobs':        return <AdminJobsPage navigate={navigate} />;
      default:                  return <HomePage navigate={navigate} layout={layout} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdmin && (
        <Header navigate={navigate} currentPage={route.page} isLoggedIn={isLoggedIn}
          onLogin={() => navigate('login')} onLogout={() => { setIsLoggedIn(false); navigate('home'); }}
          layout={layout} />
      )}

      {isAdmin && (
        <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo onClick={() => navigate('home')} />
            <Badge color="gray" style={{ marginLeft: 8 }}>Admin</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('home')}>View site</Button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="user" size={14} color="var(--blue-500)" />
            </div>
          </div>
        </header>
      )}

      <div style={{ flex: 1, display: isAdmin ? 'flex' : 'block' }}>
        {isAdmin && <AdminSidebar active={route.page} navigate={navigate} />}
        <main style={{
          flex: 1,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(6px)' : 'none',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
        }}>
          {renderPage()}
        </main>
      </div>

      {!isAdmin && <Footer navigate={navigate} />}

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakRadio label="Layout variant" value={t.layout}
          options={['classic', 'wide', 'compact']}
          onChange={v => setTweak('layout', v)} />
        <TweakSection label="Cards" />
        <TweakRadio label="Card style" value={t.cardStyle}
          options={['elevated', 'flat', 'bordered']}
          onChange={v => setTweak('cardStyle', v)} />
        <TweakSection label="Density" />
        <TweakRadio label="Spacing" value={t.density}
          options={['comfortable', 'compact']}
          onChange={v => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
