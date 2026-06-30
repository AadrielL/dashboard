import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();
export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [fontSize,       setFontSize]       = useState('normal'); // normal | large | xlarge
  const [darkMode,       setDarkMode]       = useState(false);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [quizDone,       setQuizDone]       = useState(false);

  // Apply font class on HTML element (rem is relative to html, not body)
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-normal', 'font-large', 'font-xlarge');
    html.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  // Apply dark mode on body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Apply colorblind mode on body
  useEffect(() => {
    document.body.classList.toggle('colorblind-mode', colorblindMode);
  }, [colorblindMode]);

  const value = {
    fontSize,       setFontSize,
    darkMode,       setDarkMode,
    colorblindMode, setColorblindMode,
    quizDone,       setQuizDone,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
