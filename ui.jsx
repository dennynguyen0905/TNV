/* LangPath — Base UI Components */
const uiStyles = {
  btn: (variant, size) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    borderRadius: 10, fontFamily: 'var(--font)',
    fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '10px 20px',
    ...(variant === 'primary' ? {
      background: 'var(--blue-500)', color: '#fff',
    } : variant === 'secondary' ? {
      background: 'var(--blue-50)', color: 'var(--blue-600)',
    } : variant === 'outline' ? {
      background: 'transparent', color: 'var(--n-700)',
      border: '1.5px solid var(--border)',
    } : variant === 'ghost' ? {
      background: 'transparent', color: 'var(--n-600)', padding: size === 'sm' ? '6px 12px' : '8px 16px',
    } : variant === 'success' ? {
      background: 'var(--green-500)', color: '#fff',
    } : variant === 'danger' ? {
      background: 'var(--red-500)', color: '#fff',
    } : {}),
  }),
  btnHover: (variant) => (
    variant === 'primary' ? { background: 'var(--blue-600)' } :
    variant === 'secondary' ? { background: 'var(--blue-100)' } :
    variant === 'outline' ? { borderColor: 'var(--n-400)', background: 'var(--n-50)' } :
    variant === 'ghost' ? { background: 'var(--n-100)' } :
    variant === 'success' ? { background: 'var(--green-600)' } :
    variant === 'danger' ? { background: 'var(--red-600)' } : {}
  ),
};

function Button({ children, variant = 'primary', size = 'md', onClick, style, disabled, icon }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      style={{ ...uiStyles.btn(variant, size), ...(hov && !disabled ? uiStyles.btnHover(variant) : {}), ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}), ...style }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={disabled ? undefined : onClick}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

function Badge({ children, color = 'blue', style }) {
  const colors = {
    blue: { bg: 'var(--blue-50)', text: 'var(--blue-600)', border: 'var(--blue-200)' },
    green: { bg: 'var(--green-50)', text: 'var(--green-500)', border: 'var(--green-100)' },
    amber: { bg: 'var(--amber-50)', text: 'var(--amber-500)', border: '#FDE68A' },
    red: { bg: 'var(--red-50)', text: 'var(--red-500)', border: 'var(--red-100)' },
    gray: { bg: 'var(--n-100)', text: 'var(--n-600)', border: 'var(--n-200)' },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      fontSize: 12, fontWeight: 600, borderRadius: 999, lineHeight: '18px',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

function Input({ label, type = 'text', placeholder, value, onChange, error, style, ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)' }}>{label}</label>}
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 15, lineHeight: '22px',
          border: `1.5px solid ${error ? 'var(--red-500)' : focused ? 'var(--blue-500)' : 'var(--border)'}`,
          outline: 'none', background: '#fff', color: 'var(--n-900)',
          transition: 'border-color 0.2s',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 13, color: 'var(--red-500)' }}>{error}</span>}
    </div>
  );
}

function Textarea({ label, placeholder, value, onChange, rows = 4, style }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)' }}>{label}</label>}
      <textarea
        placeholder={placeholder} value={value} rows={rows}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 15, lineHeight: '22px', resize: 'vertical',
          border: `1.5px solid ${focused ? 'var(--blue-500)' : 'var(--border)'}`,
          outline: 'none', background: '#fff', color: 'var(--n-900)', fontFamily: 'var(--font)',
        }}
      />
    </div>
  );
}

function SelectInput({ label, options, value, onChange, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--n-700)' }}>{label}</label>}
      <select
        value={value} onChange={e => onChange && onChange(e.target.value)}
        style={{
          padding: '10px 14px', borderRadius: 10, fontSize: 15,
          border: '1.5px solid var(--border)', outline: 'none', background: '#fff',
          color: 'var(--n-900)', cursor: 'pointer', appearance: 'auto',
        }}
      >
        {options.map(o => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}
      </select>
    </div>
  );
}

function SearchInput({ placeholder, value, onChange, style }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n-400)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        type="text" placeholder={placeholder} value={value}
        onChange={e => onChange && onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10, fontSize: 15,
          border: '1.5px solid var(--border)', outline: 'none', background: '#fff',
          color: 'var(--n-900)', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--blue-500)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

function Card({ children, style, onClick, hover = false }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      style={{
        background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
        boxShadow: hov && hover ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        transition: 'all 0.25s ease', cursor: onClick ? 'pointer' : 'default',
        transform: hov && hover ? 'translateY(-2px)' : 'none', ...style,
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >{children}</div>
  );
}

function ProgressBar({ value = 0, max = 100, height = 8, color = 'var(--blue-500)', style }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ width: '100%', height, borderRadius: height, background: 'var(--n-100)', overflow: 'hidden', ...style }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: height, background: color, transition: 'width 0.5s ease' }}></div>
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}></div>
      <div style={{ position: 'relative', background: '#fff', borderRadius: 24, padding: 32, maxWidth: width, width: '90%', boxShadow: 'var(--shadow-modal)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--n-400)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Tabs({ tabs, active, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--n-100)', ...style }}>
      {tabs.map(t => (
        <button key={t.id || t} onClick={() => onChange(t.id || t)} style={{
          padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'none', border: 'none',
          borderBottom: `2px solid ${(t.id || t) === active ? 'var(--blue-500)' : 'transparent'}`,
          color: (t.id || t) === active ? 'var(--blue-500)' : 'var(--n-500)',
          cursor: 'pointer', marginBottom: -2, transition: 'all 0.2s',
        }}>{t.label || t}</button>
      ))}
    </div>
  );
}

/* Icons as small SVG components */
function Icon({ name, size = 20, color = 'currentColor', style }) {
  const paths = {
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    headphones: <><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chevRight: <><polyline points="9 18 15 12 9 6"/></>,
    chevDown: <><polyline points="6 9 12 15 18 9"/></>,
    play: <><polygon points="5 3 19 12 5 21 5 3"/></>,
    pause: <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    volume: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name] || null}
    </svg>
  );
}

Object.assign(window, { Button, Badge, Input, Textarea, SelectInput, SearchInput, Card, ProgressBar, Modal, Tabs, Icon });
