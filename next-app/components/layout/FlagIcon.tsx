interface FlagIconProps {
  lang: string;
  size?: number;
}

const flags: Record<string, React.ReactNode> = {
  english: (
    <svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="18" fill="#012169"/>
      <path d="M0,0 L24,18 M24,0 L0,18" stroke="#fff" strokeWidth="3.6"/>
      <path d="M0,0 L24,18 M24,0 L0,18" stroke="#C8102E" strokeWidth="2.4"/>
      <path d="M12,0 V18 M0,9 H24" stroke="#fff" strokeWidth="6"/>
      <path d="M12,0 V18 M0,9 H24" stroke="#C8102E" strokeWidth="3.6"/>
    </svg>
  ),
  german: (
    <svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="6" fill="#000"/>
      <rect y="6" width="24" height="6" fill="#D00"/>
      <rect y="12" width="24" height="6" fill="#FFCE00"/>
    </svg>
  ),
  french: (
    <svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
      <rect width="8" height="18" fill="#002395"/>
      <rect x="8" width="8" height="18" fill="#fff"/>
      <rect x="16" width="8" height="18" fill="#ED2939"/>
    </svg>
  ),
  spanish: (
    <svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="4.5" fill="#C60B1E"/>
      <rect y="4.5" width="24" height="9" fill="#FFC400"/>
      <rect y="13.5" width="24" height="4.5" fill="#C60B1E"/>
    </svg>
  ),
};

export function FlagIcon({ lang, size = 28 }: FlagIconProps) {
  const flag = flags[lang.toLowerCase()];
  if (!flag) {
    return (
      <div
        style={{ width: size, height: Math.round(size * 0.75) }}
        className="rounded bg-n-200 flex items-center justify-center text-xs text-n-500"
      >
        ?
      </div>
    );
  }
  return (
    <span
      style={{ width: size, height: Math.round(size * 0.75), display: "inline-block", borderRadius: 4, overflow: "hidden" }}
    >
      {flag}
    </span>
  );
}
