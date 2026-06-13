import Link from "next/link";

export function Footer() {
  const columns = [
    { title: 'Languages', links: [
      { label: 'English', href: '/english' },
      { label: 'German', href: '/german' },
      { label: 'French', href: '/french' },
      { label: 'Spanish', href: '/spanish' },
    ]},
    { title: 'Skills', links: [
      { label: 'Reading', href: '/english/reading' },
      { label: 'Listening', href: '/english/listening' },
      { label: 'Dictation', href: '/english/dictation' },
      { label: 'Vocabulary', href: '/english/vocabulary' },
    ]},
    { title: 'Platform', links: [
      { label: 'About', href: '#' }, { label: 'Premium', href: '#' }, { label: 'Contact', href: '#' }, { label: 'Blog', href: '#' },
    ]},
    { title: 'Legal', links: [
      { label: 'Terms of Service', href: '#' }, { label: 'Privacy Policy', href: '#' }, { label: 'Cookie Policy', href: '#' },
    ]},
  ];

  return (
    <footer className="bg-n-900 text-n-300 mt-20">
      <div className="max-w-container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-1.5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <span className="text-xl font-extrabold text-white">LangPath</span>
            </div>
            <p className="text-sm leading-relaxed text-n-400 max-w-[280px]">
              Learn languages through reading, listening, dictation and interactive quizzes. Practice from A1 to C2 at your own pace.
            </p>
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {columns.map(col => (
              <div key={col.title}>
                <h4 className="text-[13px] font-bold text-n-300 uppercase tracking-wider mb-4">{col.title}</h4>
                <div className="flex flex-col gap-2.5">
                  {col.links.map(link => (
                    <Link key={link.label} href={link.href} className="text-sm text-n-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-n-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-n-500">© {new Date().getFullYear()} LangPath. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="text-[13px] text-n-500 hover:text-n-400">Terms</Link>
            <Link href="#" className="text-[13px] text-n-500 hover:text-n-400">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
