import React, { useState, useMemo, useEffect } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import AccessibilityBar from './components/AccessibilityBar';
import OnboardingQuiz from './components/OnboardingQuiz';
import ReportTab from './pages/ReportTab';
import GeneralTab from './pages/GeneralTab';
import ScatterTab from './pages/ScatterTab';
import dados from './dados.json';

const TABS = [
  { id: 'report',    label: '📄 Relatório' },
  { id: 'general',   label: '📊 Visão Geral' },
  { id: 'scatter',   label: '🎯 Dispersão' },
];

function AppContent() {
  const { quizDone } = useAccessibility();
  const [activeTab, setActiveTab] = useState('general');
  const [globalModalidade, setGlobalModalidade] = useState('Todas');

  // Handle double right-click to fullscreen charts
  useEffect(() => {
    let lastRightClick = 0;
    const handleContextMenu = (e) => {
      const chartBox = e.target.closest('.chart-box, .value-panel, .kpi-card');
      if (chartBox) {
        const now = Date.now();
        if (now - lastRightClick < 600) { // double right-click threshold
          e.preventDefault();
          chartBox.classList.toggle('fullscreen-chart');
          lastRightClick = 0;
        } else {
          lastRightClick = now;
        }
      }
    };
    
    // Also handle regular double-click just in case it's easier for them
    const handleDoubleClick = (e) => {
      const chartBox = e.target.closest('.chart-box, .value-panel, .kpi-card');
      if (chartBox) {
        chartBox.classList.toggle('fullscreen-chart');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dblclick', handleDoubleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  // MUST keep all hooks above any return — React rule of hooks
  const modalidades = useMemo(() => {
    const s = new Set(dados.map(d => d.MODALIDADE).filter(Boolean));
    return ['Todas', ...Array.from(s).sort()];
  }, []);

  // Show quiz overlay before dashboard
  if (!quizDone) {
    return <OnboardingQuiz />;
  }

  return (
    <div className="app-wrap">
      <header className="header">
        <h1>Dashboard de Capacitação — CETREMEC</h1>
        <p className="app-subtitle" style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', maxWidth: '720px' }}>
          A aba Dispersão reúne Carga Horária e Valor Pago por Aluno em um único gráfico interativo. Use o seletor para categorizar por Tipo de Ação ou Grupo de Secretaria.
        </p>
        <AccessibilityBar activeTab={activeTab} />
      </header>

      <div className="global-filter" role="search" aria-label="Filtro global por modalidade">
        <label htmlFor="glob-mod">🌐 Modalidade:</label>
        <select id="glob-mod" value={globalModalidade} onChange={e => setGlobalModalidade(e.target.value)} aria-label="Selecione a modalidade para filtrar todos os dados">
          {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <nav aria-label="Navegação entre abas" className="tab-nav" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={activeTab === t.id}
            aria-controls={`panel-${t.id}`}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {TABS.map(t => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          className={`tab-panel ${t.id === 'report' ? 'scrollable' : ''}`}
          hidden={activeTab !== t.id}
        >
          {activeTab === t.id && (
            t.id === 'report'   ? <ReportTab /> :
            t.id === 'general'  ? <GeneralTab  data={dados} globalModalidade={globalModalidade} /> :
                                  <ScatterTab data={dados} globalModalidade={globalModalidade} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}
