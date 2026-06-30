import React, { useState, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const STEPS = [
  {
    id: 'colorblind',
    emoji: '🔴🟢',
    title: 'Você tem daltonismo?',
    desc: 'Dificuldade de distinguir certas cores, como vermelho e verde.',
    yesLabel: 'Sim, tenho daltonismo',
    noLabel: 'Não, enxergo bem as cores',
    yesEffect: 'Marcadores de forma extras nos gráficos serão ativados.',
  },
  {
    id: 'vision',
    emoji: '👓',
    title: 'Você tem dificuldade de visão?',
    desc: 'Baixa acuidade visual ou dificuldade em ler texto pequeno.',
    yesLabel: 'Sim, prefiro texto maior',
    noLabel: 'Não, enxergo bem',
    yesEffect: 'Fonte aumentada em toda a interface.',
  },
  {
    id: 'light',
    emoji: '💡',
    title: 'Você tem sensibilidade à luz?',
    desc: 'Desconforto com telas claras e brilhantes.',
    yesLabel: 'Sim, prefiro tela escura',
    noLabel: 'Não, tela clara está ótimo',
    yesEffect: 'Modo Escuro será ativado.',
  },
];

export default function OnboardingQuiz() {
  const { setQuizDone, setColorblindMode, setFontSize, setDarkMode } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0); // 0=welcome, 1-3=questions, 4=summary
  const [answers, setAnswers] = useState({});

  const applySettings = useCallback((ans) => {
    if (ans.colorblind) setColorblindMode(true);
    if (ans.vision) setFontSize('large');
    if (ans.light) setDarkMode(true);
  }, [setColorblindMode, setFontSize, setDarkMode]);

  const handleAnswer = useCallback((id, value) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);

    const nextStep = currentStep + 1;
    if (nextStep > STEPS.length) {
      // past last question
      applySettings(updated);
      setCurrentStep(4);
    } else {
      setCurrentStep(nextStep);
    }
  }, [answers, currentStep, applySettings]);

  const enterDashboard = useCallback(() => {
    applySettings(answers);
    setQuizDone(true);
  }, [answers, applySettings, setQuizDone]);

  const skipQuiz = useCallback(() => {
    setQuizDone(true);
  }, [setQuizDone]);

  // ─── RENDER ───
  const q = currentStep >= 1 && currentStep <= 3 ? STEPS[currentStep - 1] : null;

  return (
    <div className="quiz-overlay" role="dialog" aria-modal="true" aria-label="Questionário de acessibilidade">

      <div className="quiz-card" key={`step-${currentStep}`}>

        {/* ── WELCOME (step 0) ── */}
        {currentStep === 0 && (
          <>
            <div className="quiz-icon-wrap" aria-hidden="true">♿</div>
            <h1 className="quiz-heading">Configuração de Acessibilidade</h1>
            <p className="quiz-desc">
              Responda <strong>3 perguntas rápidas</strong> para ajustarmos a experiência visual do dashboard para você.
            </p>
            <p className="quiz-desc quiz-small">Você pode alterar qualquer configuração depois, no topo da tela.</p>

            <div className="quiz-preview">
              <span>🔴🟢 Daltonismo</span>
              <span className="quiz-dot">•</span>
              <span>👓 Visão</span>
              <span className="quiz-dot">•</span>
              <span>💡 Luz</span>
            </div>

            <button className="quiz-main-btn" onClick={() => setCurrentStep(1)}>
              Começar →
            </button>
            <button className="quiz-link-btn" onClick={skipQuiz}>
              Pular e usar padrões
            </button>
          </>
        )}

        {/* ── QUESTIONS (steps 1-3) ── */}
        {q && (
          <>
            {/* Progress dots */}
            <div className="quiz-progress">
              {STEPS.map((_, i) => (
                <div key={i} className={`qp-step ${i + 1 < currentStep ? 'done' : ''} ${i + 1 === currentStep ? 'current' : ''}`} />
              ))}
              <span className="qp-text">{currentStep} / 3</span>
            </div>

            <div className="quiz-q-emoji" aria-hidden="true">{q.emoji}</div>
            <h2 className="quiz-heading">{q.title}</h2>
            <p className="quiz-desc">{q.desc}</p>

            <div className="quiz-answers">
              <button className="quiz-answer-btn qa-yes" onClick={() => handleAnswer(q.id, true)}>
                ✅ {q.yesLabel}
              </button>
              <button className="quiz-answer-btn qa-no" onClick={() => handleAnswer(q.id, false)}>
                ❌ {q.noLabel}
              </button>
            </div>
          </>
        )}

        {/* ── SUMMARY (step 4) ── */}
        {currentStep === 4 && (
          <>
            <div className="quiz-icon-wrap" aria-hidden="true">✅</div>
            <h2 className="quiz-heading">Tudo configurado!</h2>

            <div className="quiz-summary-list">
              {STEPS.map(s => {
                const on = !!answers[s.id];
                return (
                  <div key={s.id} className={`qs-row ${on ? 'qs-on' : 'qs-off'}`}>
                    <span className="qs-emoji">{s.emoji}</span>
                    <span className="qs-label">{s.title.replace('Você tem ', '').replace('?', '')}</span>
                    <span className={`qs-badge ${on ? 'badge-on' : 'badge-off'}`}>{on ? 'ATIVADO' : 'OFF'}</span>
                  </div>
                );
              })}
            </div>

            <button className="quiz-main-btn" onClick={() => setCurrentStep(5)}>
              Avançar →
            </button>
          </>
        )}

        {/* ── TOUR / EXPLANATION (step 5) ── */}
        {currentStep === 5 && (
          <>
            <div className="quiz-icon-wrap" aria-hidden="true">🗺️</div>
            <h2 className="quiz-heading">Conhecendo o Painel</h2>
            
            <div className="quiz-summary-list" style={{ textAlign: 'left', margin: '1rem 0', fontSize: '0.9rem' }}>
              <p style={{ margin: '0.5rem 0' }}><strong>🏷️ Cards Indicadores:</strong> Resumo rápido no topo da tela com métricas chave (Total de Servidores, Médias, Valores Pagos).</p>
              <p style={{ margin: '0.5rem 0' }}><strong>📊 Aba Visão Geral:</strong> Gráficos gerais de desempenho e contagem por secretaria.</p>
              <p style={{ margin: '0.5rem 0' }}><strong>🎯 Aba Dispersão:</strong> Analise a correlação entre Carga Horária e Valor Pago por Aluno, categorizando pelas secretarias ou tipos de ações. Esta aba substitui os painéis separados de Carga Horária e Valor Pago.</p>
              <p style={{ margin: '0.5rem 0' }}><strong>📄 Aba Relatório:</strong> Um documento explicativo sobre os objetivos e acessibilidade.</p>
              <div style={{ padding: '0.5rem', background: 'var(--surface-2)', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border)' }}>
                <strong>💡 Dica:</strong> Dê <em>dois cliques</em> em qualquer gráfico para expandi-lo em tela cheia!
              </div>
            </div>

            <button className="quiz-main-btn" onClick={enterDashboard}>
              🚀 Entrar no Dashboard
            </button>
          </>
        )}

      </div>
    </div>
  );
}
