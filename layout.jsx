/* LangPath — Layout Components (Header, Footer, Breadcrumb) */

function FlagIcon({ lang, size = 28 }) {
  const flags = {
    english: (
      <svg width={size} height={size * 0.67} viewBox="0 0 60 40" style={{ borderRadius: 3, overflow: 'hidden' }}>
        <rect width="60" height="40" fill="#012169"/>
        <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="6"/>
        <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3"/>
        <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="10"/>
        <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="6"/>
      </svg>
    ),
    german: (
      <svg width={size} height={size * 0.67} viewBox="0 0 60 40" style={{ borderRadius: 3 }}>
        <rect y="0" width="60" height="13.33" fill="#000"/>
        <rect y="13.33" width="60" height="13.33" fill="#DD0000"/>
        <rect y="26.67" width="60" height="13.33" fill="#FFCC00"/>
      </svg>
    ),
    french: (
      <svg width={size} height={size * 0.67} viewBox="0 0 60 40" style={{ borderRadius: 3 }}>
        <rect x="0" width="20" height="40" fill="#002395"/>
        <rect x="20" width="20" height="40" fill="#fff"/>
        <rect x="40" width="20" height="40" fill="#ED2939"/>
      </svg>
    ),
    spanish: (
      <svg width={size} height={size * 0.67} viewBox="0 0 60 40" style={{ borderRadius: 3 }}>
        <rect width="60" height="40" fill="#AA151B"/>
        <rect y="10" width="60" height="20" fill="#F1BF00"/>
      </svg>
    ),
  };
  return <span style={{ display: 'inline-flex', flexShrink: 0 }}>{flags[lang] || flags.english}</span>;
}

function Logo({ onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--n-900)', letterSpacing: '-0.5px' }}>LangPath</span>
    </div>
  );
}

function Header({ navigate, currentPage, isLoggedIn, onLogin, onLogout, layout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navItems = [
    { label: 'Languages', page: 'home', section: 'languages' },
    { label: 'Reading', page: 'skill-list', params: { lang: 'english', skill: 'reading' } },
    { label: 'Listening', page: 'skill-list', params: { lang: 'english', skill: 'listening' } },
    { label: 'Dictation', page: 'skill-list', params: { lang: 'english', skill: 'dictation' } },
  ];
  const isCompact = layout === 'compact';

  return (
    <header style={{
      background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: isCompact ? 56 : 64, gap: 32,
      }}>
        <Logo onClick={() => navigate('home')} />
        <nav style={{ display: 'flex', gap: isCompact ? 20 : 28, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {navItems.map(item => (
            <a key={item.label} href="#" onClick={e => { e.preventDefault(); navigate(item.page, item.params); }} style={{
              fontSize: 14, fontWeight: 500, color: 'var(--n-600)', textDecoration: 'none',
              transition: 'color 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--blue-500)'}
            onMouseLeave={e => e.target.style.color = 'var(--n-600)'}
            >{item.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('dashboard')}>Dashboard</Button>
              <button onClick={onLogout} style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--blue-50)',
                border: '2px solid var(--blue-200)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Icon name="user" size={16} color="var(--blue-500)" />
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('login')}>Log in</Button>
              <Button variant="primary" size="sm" onClick={() => navigate('register')}>Start learning</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Breadcrumb({ items, navigate }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--n-400)', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevRight" size={14} color="var(--n-300)" />}
          {i < items.length - 1 ? (
            <a href="#" onClick={e => { e.preventDefault(); item.onClick && item.onClick(); navigate && item.page && navigate(item.page, item.params); }} style={{ color: 'var(--n-500)', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = 'var(--blue-500)'}
              onMouseLeave={e => e.target.style.color = 'var(--n-500)'}
            >{item.label}</a>
          ) : (
            <span style={{ color: 'var(--n-700)', fontWeight: 600 }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function Footer({ navigate }) {
  const columns = [
    { title: 'Languages', links: [
      { label: 'English', page: 'language', params: { lang: 'english' } },
      { label: 'German', page: 'language', params: { lang: 'german' } },
      { label: 'French', page: 'language', params: { lang: 'french' } },
      { label: 'Spanish', page: 'language', params: { lang: 'spanish' } },
    ]},
    { title: 'Skills', links: [
      { label: 'Reading', page: 'skill-list', params: { lang: 'english', skill: 'reading' } },
      { label: 'Listening', page: 'skill-list', params: { lang: 'english', skill: 'listening' } },
      { label: 'Dictation', page: 'skill-list', params: { lang: 'english', skill: 'dictation' } },
      { label: 'Vocabulary', page: 'skill-list', params: { lang: 'english', skill: 'vocabulary' } },
    ]},
    { title: 'Platform', links: [
      { label: 'About' }, { label: 'Premium' }, { label: 'Contact' }, { label: 'Blog' },
    ]},
    { title: 'Legal', links: [
      { label: 'Terms of Service' }, { label: 'Privacy Policy' }, { label: 'Cookie Policy' },
    ]},
  ];
  return (
    <footer style={{ background: 'var(--n-900)', color: 'var(--n-300)', marginTop: 80 }}>
      <div className="container" style={{ padding: '64px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--blue-500), var(--blue-700))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>LangPath</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--n-400)', maxWidth: 280 }}>
              Learn languages through reading, listening, dictation and interactive quizzes. Practice from A1 to C2 at your own pace.
            </p>
          </div>
          {columns.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--n-300)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a key={link.label} href="#" onClick={e => { e.preventDefault(); link.page && navigate(link.page, link.params); }} style={{ fontSize: 14, color: 'var(--n-400)', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'var(--n-400)'}
                  >{link.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--n-700)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--n-500)' }}>© 2026 LangPath. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ color: 'var(--n-500)', fontSize: 13 }}>Terms</a>
            <a href="#" style={{ color: 'var(--n-500)', fontSize: 13 }}>Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AdminSidebar({ active, navigate }) {
  const items = [
    { id: 'admin', label: 'Dashboard', icon: 'home' },
    { id: 'admin-languages', label: 'Languages', icon: 'globe' },
    { id: 'admin-lessons', label: 'Lessons', icon: 'book' },
    { id: 'admin-questions', label: 'Questions', icon: 'edit' },
    { id: 'admin-media', label: 'Media', icon: 'layers' },
    { id: 'admin-users', label: 'Users', icon: 'user' },
    { id: 'admin-jobs', label: 'Jobs', icon: 'settings' },
  ];
  return (
    <aside style={{
      width: 240, background: '#fff', borderRight: '1px solid var(--border)',
      minHeight: 'calc(100vh - 64px)', padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ padding: '0 12px', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--n-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Panel</span>
      </div>
      {items.map(item => (
        <button key={item.id} onClick={() => navigate(item.id)} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
          background: active === item.id ? 'var(--blue-50)' : 'transparent',
          color: active === item.id ? 'var(--blue-600)' : 'var(--n-600)',
          border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, width: '100%',
          transition: 'all 0.15s',
        }}>
          <Icon name={item.icon} size={18} color={active === item.id ? 'var(--blue-500)' : 'var(--n-400)'} />
          {item.label}
        </button>
      ))}
    </aside>
  );
}

Object.assign(window, { FlagIcon, Logo, Header, Breadcrumb, Footer, AdminSidebar });
