import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 
                 text-white text-sm font-medium transition-colors border border-white/20
                 focus:outline-none focus:ring-2 focus:ring-white/30"
      aria-label={t('language.toggle')}
    >
      <span className="text-lg">
        {language === 'en' ? '🇬🇧' : '🇲🇻'}
      </span>
      <span className="hidden sm:inline">
        {language === 'en' ? t('language.english') : t('language.dhivehi')}
      </span>
      <span className="text-xs opacity-70">
        {language === 'en' ? 'EN' : 'DV'}
      </span>
    </button>
  );
}
