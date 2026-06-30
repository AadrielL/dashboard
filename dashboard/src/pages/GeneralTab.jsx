import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Treemap
} from 'recharts';

// Colorblind-safe Okabe-Ito (mapped to CSS vars)
const COLORS = [
  'var(--chart-c1)', 'var(--chart-c2)', 'var(--chart-c3)', 'var(--chart-c4)',
  'var(--chart-c5)', 'var(--chart-c6)', 'var(--chart-c7)', 'var(--chart-c8)'
];

const median = arr => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const fmtNum = v => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)} Mi`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(2)} Mil`;
  return v.toFixed(1);
};
const fmtPct = (v, total) => `${((v / total) * 100).toFixed(1)}%`;

const tt = {
  contentStyle: {
    background: 'var(--surface)', color: 'var(--text)',
    border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.78rem'
  }
};

// Custom Treemap content renderer
const TreemapContent = (props) => {
  const { x, y, width, height, name, value, index } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height}
        fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={1} rx={2} />
      {width > 50 && height > 24 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle"
          dominantBaseline="middle" style={{ fontSize: '0.65rem', fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}>
          {name.length > 12 ? name.slice(0, 11) + '…' : name}
        </text>
      )}
      {width > 50 && height > 38 && (
        <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle"
          dominantBaseline="middle" style={{ fontSize: '0.6rem', fill: 'rgba(255,255,255,0.85)', pointerEvents: 'none' }}>
          {value}
        </text>
      )}
    </g>
  );
};

// Custom Pie label
const PieLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 18;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"
      style={{ fontSize: '0.65rem', fill: 'var(--text)', fontWeight: 600 }}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export default function GeneralTab({ data, globalModalidade }) {
  const [tipoAcao, setTipoAcao] = useState('Todos');

  const tiposDeAcao = useMemo(() => {
    const s = new Set(data.map(d => d.TIPO_DE_ACAO).filter(Boolean));
    return ['Todos', ...Array.from(s).sort()];
  }, [data]);

  const filtered = useMemo(() => data.filter(d => {
    const m = globalModalidade === 'Todas' || d.MODALIDADE === globalModalidade;
    const t = tipoAcao === 'Todos' || d.TIPO_DE_ACAO === tipoAcao;
    return m && t;
  }), [data, globalModalidade, tipoAcao]);

  // ---- KPI computations ----
  const totalPart  = filtered.length;
  const uniqueSrv  = useMemo(() => new Set(filtered.map(d => d.SIAPE || d.NOME_SERVIDOR)).size, [filtered]);
  const chArr      = useMemo(() => filtered.map(d => Number(d.CARGA_HORARIA) || 0), [filtered]);
  const totalCH    = chArr.reduce((a, b) => a + b, 0);
  const mediaCH    = chArr.length ? totalCH / chArr.length : 0;
  const medianaCH  = median(chArr);
  const vpArr      = useMemo(() => filtered.map(d => Number(d.VALOR_PAGO_POR_ALUNO) || 0).filter(v => v > 0), [filtered]);
  const mediaVP    = vpArr.length ? vpArr.reduce((a, b) => a + b, 0) / vpArr.length : 0;
  const medianaVP  = median(vpArr);
  const concluintes = filtered.filter(d => d.STATUS === 'Concluinte').length;
  const pctConc    = totalPart ? Math.round((concluintes / totalPart) * 100) : 0;
  const completos  = filtered.filter(d => d.Qualidade_Dados_Completos === '100% Completo').length;
  const pctComp    = totalPart ? Math.round((completos / totalPart) * 100) : 0;

  // ---- Chart data ----

  // Bar chart: TIPO_DE_ACAO count per Grupo_Secretaria (stacked)
  const grupos = useMemo(() => {
    const s = new Set(filtered.map(d => d.Grupo_Secretaria).filter(Boolean));
    return Array.from(s);
  }, [filtered]);

  const barByTipo = useMemo(() => {
    const acc = {};
    filtered.forEach(d => {
      const tipo = d.TIPO_DE_ACAO || 'N/I';
      const grupo = d.Grupo_Secretaria || 'N/I';
      if (!acc[tipo]) { acc[tipo] = { name: tipo }; }
      acc[tipo][grupo] = (acc[tipo][grupo] || 0) + 1;
    });
    return Object.values(acc).sort((a, b) => {
      const sumA = grupos.reduce((s, g) => s + (a[g] || 0), 0);
      const sumB = grupos.reduce((s, g) => s + (b[g] || 0), 0);
      return sumB - sumA;
    });
  }, [filtered, grupos]);

  // Pie: STATUS
  const statusData = useMemo(() => {
    const acc = {};
    filtered.forEach(d => { const k = d.STATUS || 'N/I'; acc[k] = (acc[k] || 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Pie: Qualidade
  const qualData = useMemo(() => {
    const acc = {};
    filtered.forEach(d => { const k = d.Qualidade_Dados_Completos || 'N/I'; acc[k] = (acc[k] || 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Pie: Grupo Secretaria
  const grupoData = useMemo(() => {
    const acc = {};
    filtered.forEach(d => { const k = d.Grupo_Secretaria || 'N/I'; acc[k] = (acc[k] || 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Treemap: SECRETARIA_DE_LOTACAO
  const treemapData = useMemo(() => {
    const acc = {};
    filtered.forEach(d => { const k = d.SECRETARIA_DE_LOTACAO || 'N/I'; acc[k] = (acc[k] || 0) + 1; });
    return Object.entries(acc).map(([name, size]) => ({ name, size })).sort((a, b) => b.size - a.size);
  }, [filtered]);

  return (
    <div className="gen-layout" aria-label="Dashboard Visão Geral">
      {/* Local filter */}
      <div className="local-filter">
        <label htmlFor="tipo-acao-sel">Tipo de Ação:</label>
        <select id="tipo-acao-sel" value={tipoAcao} onChange={e => setTipoAcao(e.target.value)} aria-label="Filtrar por tipo de ação">
          {tiposDeAcao.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* KPI Grid - 2 rows × 4 cols Power BI style */}
      <div className="kpi-grid-2row" aria-live="polite" aria-label="Indicadores">
        <div className="kpi-card" tabIndex="0">
          <span className="kpi-label">Total de Ações</span>
          <span className="kpi-value">{totalPart.toLocaleString('pt-BR')}</span>
        </div>
        <div className="kpi-card blue-card" tabIndex="0">
          <span className="kpi-label">Servidores Únicos</span>
          <span className="kpi-value">{uniqueSrv.toLocaleString('pt-BR')}</span>
        </div>
        <div className="kpi-card green-card" tabIndex="0">
          <span className="kpi-label">Total Carga Horária</span>
          <span className="kpi-value">{fmtNum(totalCH)}</span>
          <span className="kpi-sub">horas</span>
        </div>
        <div className="kpi-card verm-card" tabIndex="0">
          <span className="kpi-label">Média Valor Pago/Aluno</span>
          <span className="kpi-value" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.4rem)' }}>
            {mediaVP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="kpi-card" style={{ background: 'var(--c-purple)', color: '#111' }} tabIndex="0">
          <span className="kpi-label">Concluintes</span>
          <span className="kpi-value">{pctConc}%</span>
          <span className="kpi-sub">{concluintes} servidores</span>
        </div>
        <div className="kpi-card" style={{ background: '#2d3748', color: '#fff' }} tabIndex="0">
          <span className="kpi-label">Dados 100% Completos</span>
          <span className="kpi-value">{pctComp}%</span>
          <span className="kpi-sub">{completos} registros</span>
        </div>
        <div className="kpi-card sky-card" tabIndex="0">
          <span className="kpi-label">Média Carga Horária</span>
          <span className="kpi-value">{mediaCH.toFixed(1)}</span>
          <span className="kpi-sub">horas / servidor</span>
        </div>
        <div className="kpi-card" style={{ background: '#5c4033', color: '#fff' }} tabIndex="0">
          <span className="kpi-label">Mediana Valor Pago/Aluno</span>
          <span className="kpi-value" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.4rem)' }}>
            {medianaVP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Charts Grid: 3 cols × 2 rows */}
      <div className="gen-charts">
        {/* LEFT: Stacked Bar - spans 2 rows */}
        <div className="chart-box gen-chart-left" role="img" aria-label="Contagem de Grupo Secretaria por Tipo de Ação">
          <h3>Contagem de Grupo Secretaria por Tipo de Ação</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barByTipo} layout="vertical" margin={{ top: 4, right: 16, left: 130, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} width={130} />
                <RTooltip {...tt} />
                <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                {grupos.slice(0, 5).map((g, i) => (
                  <Bar key={g} dataKey={g} name={g} stackId="a" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" aria-label="Dados do gráfico de barras por tipo de ação">
            <thead><tr><th>Tipo de Ação</th>{grupos.map(g => <th key={g}>{g}</th>)}</tr></thead>
            <tbody>{barByTipo.map(r => (<tr key={r.name}><td>{r.name}</td>{grupos.map(g => <td key={g}>{r[g] || 0}</td>)}</tr>))}</tbody>
          </table>
        </div>

        {/* CENTER-TOP: Pie STATUS */}
        <div className="chart-box" role="img" aria-label="Distribuição de Status dos servidores">
          <h3>Total — Contagem de Status por Status</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius="58%" dataKey="value" labelLine={false} label={PieLabel}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip {...tt} formatter={(v, n) => [v, n]} />
                <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" aria-label="Dados de status">
            <thead><tr><th>Status</th><th>Total</th></tr></thead>
            <tbody>{statusData.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.value}</td></tr>)}</tbody>
          </table>
        </div>

        {/* CENTER-BOTTOM: Pie Qualidade */}
        <div className="chart-box" role="img" aria-label="Qualidade dos dados">
          <h3>Total — Qualidade dos Dados</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={qualData} cx="50%" cy="50%" outerRadius="58%" dataKey="value" labelLine={false} label={PieLabel}>
                  {qualData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip {...tt} />
                <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" aria-label="Dados de qualidade">
            <thead><tr><th>Qualidade</th><th>Total</th></tr></thead>
            <tbody>{qualData.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.value}</td></tr>)}</tbody>
          </table>
        </div>

        {/* RIGHT-TOP: Pie Grupo Secretaria */}
        <div className="chart-box" role="img" aria-label="Contagem de secretaria de lotação por grupo">
          <h3>Secretaria de Lotação por Grupo</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={grupoData} cx="50%" cy="50%" outerRadius="58%" dataKey="value" labelLine={false} label={PieLabel}>
                  {grupoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RTooltip {...tt} />
                <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" aria-label="Dados por grupo de secretaria">
            <thead><tr><th>Grupo</th><th>Total</th></tr></thead>
            <tbody>{grupoData.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.value}</td></tr>)}</tbody>
          </table>
        </div>

        {/* RIGHT-BOTTOM: Treemap SECRETARIA_DE_LOTACAO */}
        <div className="chart-box" role="img" aria-label="Treemap de Secretaria de Lotação">
          <h3>Contagem por Secretaria de Lotação</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                content={<TreemapContent />}
              >
                <RTooltip {...tt} formatter={(v, n, p) => [v, p.payload.name]} />
              </Treemap>
            </ResponsiveContainer>
          </div>
          <table className="sr-only" aria-label="Dados de secretaria de lotação">
            <thead><tr><th>Secretaria</th><th>Total</th></tr></thead>
            <tbody>{treemapData.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.size}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
