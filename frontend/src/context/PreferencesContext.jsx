import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PROFILE_IMAGE_KEY = 'medigrid-profile-image';

const PreferencesContext = createContext(null);

export const PreferencesProvider = ({ children }) => {
  const [customProfileImage, setCustomProfileImage] = useState(() => localStorage.getItem(PROFILE_IMAGE_KEY) || '');

  useEffect(() => {
    localStorage.removeItem('medigrid-theme');
    document.body.classList.remove('theme-dark');
  }, []);

  useEffect(() => {
    if (customProfileImage) {
      localStorage.setItem(PROFILE_IMAGE_KEY, customProfileImage);
    } else {
      localStorage.removeItem(PROFILE_IMAGE_KEY);
    }
  }, [customProfileImage]);

  const value = useMemo(
    () => ({
      customProfileImage,
      setCustomProfileImage,
      clearCustomProfileImage: () => setCustomProfileImage('')
    }),
    [customProfileImage]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return context;
};
