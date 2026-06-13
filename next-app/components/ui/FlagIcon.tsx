import React from 'react';

interface FlagIconProps {
  code: string;
  className?: string;
}

export function FlagIcon({ code, className }: FlagIconProps) {
  // Mapping of language codes to flag emojis
  const flags: Record<string, string> = {
    en: '🇬🇧',
    de: '🇩🇪',
    fr: '🇫🇷',
    es: '🇪🇸',
  };

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {flags[code.toLowerCase()] || '🏳️'}
    </span>
  );
}
