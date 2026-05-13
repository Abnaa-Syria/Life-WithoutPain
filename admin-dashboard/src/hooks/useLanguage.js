import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function useLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
    localStorage.setItem('i18nextLng', i18n.language);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLng);
  };

  return {
    language: i18n.language,
    isRTL: i18n.language === 'ar',
    toggleLanguage,
    setLanguage: i18n.changeLanguage,
  };
}
