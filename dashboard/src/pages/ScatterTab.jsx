import React, { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Color palette using CSS variables for colorblind support
const COLORS = [
  'var(--chart-c1)', 'var(--chart-c2)', 'var(--chart-c3)', 'var(--chart-c4)',
  'var(--chart-c5)', 'var(--chart-c6)', 'var(--chart-c7)', 'var(--chart-c8)'
];

const parseNumber = (value) => {
  if (value == null) return NaN;
  if (typeof value === 'number') return value;
  const str = String(value).trim().replace(/\s/g, '');
  if (!str) return NaN;
  if (str.includes(',') && str.includes('.')) {
    return Number(str.replace(/\./g, '').replace(',', '.'));
  }
  return Number(str.replace(',', '.'));
};

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{
        background: 'var(--surface)', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.ACAO_DE_DESENVOLVIMENTO || 'Ação'}</p>
        <p style={{ margin: 0 }}>Servidor: {data.NOME_SERVIDOR}</p>
        <p style={{ margin: 0 }}>Carga Horária: {data.x}h</p>
        <p style={{ margin: 0 }}>Valor Pago: R$ {data.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Categoria: {data.category}</p>
      </div>
    );
  }
  return null;
};

const ScatterTab = ({ data, globalModalidade }) => {
  const [categorizeBy, setCategorizeBy] = useState('Grupo_Secretaria'); // Default grouping by secretary group
  const [tipoAcao, setTipoAcao] = useState('Todos');

  const tipoAcaoOptions = useMemo(() => {
    const actions = new Set(data.map(d => d.TIPO_DE_ACAO).filter(Boolean));
    return ['Todos', ...Array.from(actions).sort()];
  }, [data]);

  const {
    scatterGroups,
    pointCount,
    categoryCount,
    averageCarga,
    averageValor,
    medianCarga,
    medianValor
  } = useMemo(() => {
    let filtered = data;
    if (globalModalidade !== 'Todas') {
      filtered = filtered.filter(d => d.MODALIDADE === globalModalidade);
    }
    if (tipoAcao !== 'Todos') {
      filtered = filtered.filter(d => d.TIPO_DE_ACAO === tipoAcao);
    }

    const points = filtered.map(d => {
      const carga = parseNumber(d.CARGA_HORARIA);
      const valor = parseNumber(d.VALOR_PAGO_POR_ALUNO);
      return {
        ...d,
        carga,
        valor,
        category: d[categorizeBy] || 'Desconhecido'
      };
    }).filter(d => !Number.isNaN(d.carga) && !Number.isNaN(d.valor) && d.carga > 0 && d.valor > 0);

    const groups = {};
    points.forEach(d => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push({
        ...d,
        x: d.carga,
        y: d.valor
      });
    });

    const grouped = Object.keys(groups).map((key, index) => ({
      name: key,
      data: groups[key],
      fill: COLORS[index % COLORS.length]
    }));

    const cargaValues = points.map(p => p.carga);
    const valorValues = points.map(p => p.valor);
    const totalCargas = cargaValues.reduce((sum, value) => sum + value, 0);
    const totalValores = valorValues.reduce((sum, value) => sum + value, 0);
    const count = points.length;

    return {
      scatterGroups: grouped,
      pointCount: count,
      categoryCount: grouped.length,
      averageCarga: count ? totalCargas / count : 0,
      averageValor: count ? totalValores / count : 0,
      medianCarga: median(cargaValues),
      medianValor: median(valorValues)
    };
  }, [data, globalModalidade, tipoAcao, categorizeBy]);

  return (
    <div className="tab-inner">
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <section className="chart-box" style={{ gridColumn: '1 / -1' }} aria-labelledby="scatter-title">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3 id="scatter-title">Dispersão: Carga Horária vs Valor Pago</h3>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', maxWidth: '760px' }}>
                Este painel mostra a correlação entre a carga horária e o valor pago por aluno. Use o seletor para colorir os pontos por Tipo de Ação ou Grupo de Secretaria e identificar padrões por categoria.
              </p>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.25rem', minWidth: '240px' }}>
              <div className="local-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label htmlFor="cat-filter">Colorir por:</label>
                <select
                  id="cat-filter"
                  value={categorizeBy}
                  onChange={(e) => setCategorizeBy(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  <option value="TIPO_DE_ACAO">Tipo de Ação</option>
                  <option value="Grupo_Secretaria">Grupo de Secretaria</option>
                </select>
              </div>
              <div className="local-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label htmlFor="tipo-acao-filter">Filtrar Tipo de Ação:</label>
                <select
                  id="tipo-acao-filter"
                  value={tipoAcao}
                  onChange={(e) => setTipoAcao(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  {tipoAcaoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="kpi-card" style={{ padding: '1rem' }}>
              <span className="kpi-title">Pontos Exibidos</span>
              <span className="kpi-value">{pointCount.toLocaleString('pt-BR')}</span>
            </div>
            <div className="kpi-card" style={{ padding: '1rem' }}>
              <span className="kpi-title">Categorias</span>
              <span className="kpi-value">{categoryCount.toLocaleString('pt-BR')}</span>
            </div>
            <div className="kpi-card" style={{ padding: '1rem' }}>
              <span className="kpi-title">Carga Horária Média</span>
              <span className="kpi-value">{averageCarga.toFixed(1)}h</span>
            </div>
            <div className="kpi-card" style={{ padding: '1rem' }}>
              <span className="kpi-title">Valor Pago Médio</span>
              <span className="kpi-value">R$ {averageValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="kpi-card" style={{ padding: '1rem' }}>
              <span className="kpi-title">Mediana Carga Horária</span>
              <span className="kpi-value">{medianCarga.toFixed(1)}h</span>
            </div>
            <div className="kpi-card" style={{ padding: '1rem' }}>
              <span className="kpi-title">Mediana Valor Pago</span>
              <span className="kpi-value">R$ {medianValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="chart-inner" style={{ height: '520px' }}>
            {pointCount === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '1rem' }}>
                Não há dados suficientes para exibir o gráfico com o filtro atual.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Carga Horária"
                    unit="h"
                    stroke="var(--text-muted)"
                    label={{ value: 'Carga Horária (h)', position: 'bottom', fill: 'var(--text-muted)', offset: 0 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Valor Pago"
                    unit="R$"
                    stroke="var(--text-muted)"
                    label={{ value: 'Valor Pago por Aluno (R$)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', offset: 0 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ color: 'var(--text)' }} />

                  {scatterGroups.map((group) => (
                    <Scatter
                      key={group.name}
                      name={group.name}
                      data={group.data}
                      fill={group.fill}
                      opacity={0.85}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ScatterTab;
