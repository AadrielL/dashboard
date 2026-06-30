import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export default function AccessibilityBar({ activeTab }) {
  const { fontSize, setFontSize, darkMode, setDarkMode, colorblindMode, setColorblindMode } = useAccessibility();

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const fontLabel = fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++';
  const fontAriaLabel = `Tamanho de fonte: ${fontSize === 'normal' ? 'Normal' : fontSize === 'large' ? 'Grande' : 'Extra Grande'}. Clique para alternar.`;

  return (
    <div className="a11y-bar" role="group" aria-label="Controles de acessibilidade">
      {/* Colorblind mode toggle */}
      <button
        className={`btn ${colorblindMode ? 'btn-a11y-active' : ''}`}
        onClick={() => setColorblindMode(!colorblindMode)}
        aria-pressed={colorblindMode}
        aria-label={colorblindMode ? 'Modo Daltônico: Ativado. Clique para desativar.' : 'Modo Daltônico: Desativado. Clique para ativar.'}
        title="Modo Daltônico (marcadores extras)"
      >
        🔵 {colorblindMode ? 'Dalt. ON' : 'Dalt. OFF'}
      </button>

      {/* Font size - ONLY on report tab */}
      {activeTab === 'report' && (
        <button
          className="btn"
          onClick={cycleFontSize}
          aria-label={fontAriaLabel}
          title={fontAriaLabel}
        >
          🔠 {fontLabel}
        </button>
      )}

      {/* Dark / Light mode */}
      <button
        className={`btn ${darkMode ? 'btn-a11y-active' : ''}`}
        onClick={() => setDarkMode(!darkMode)}
        aria-pressed={darkMode}
        aria-label={darkMode ? 'Modo Escuro: Ativado. Clique para desativar.' : 'Modo Escuro: Desativado. Clique para ativar.'}
        title="Alternar modo escuro"
      >
        {darkMode ? '☀️ Claro' : '🌙 Escuro'}
      </button>
    </div>
  );
}
