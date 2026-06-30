import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#56b4e9', '#e69f00', '#009e73', '#f0e442', '#0072b2', '#d55e00', '#cc79a7', '#000000'];

const FinancialTab = ({ data, globalModalidade }) => {
  // Filter by global modalidade
  const filteredData = useMemo(() => {
    return globalModalidade === 'Todas' 
      ? data 
      : data.filter(d => d.MODALIDADE === globalModalidade);
  }, [data, globalModalidade]);

  // Aggregate Workload (Carga Horaria) by Tipo de Ação
  const workloadByActionType = useMemo(() => {
    const acc = {};
    filteredData.forEach(item => {
      const type = item.TIPO_DE_ACAO || 'Não Informado';
      const val = Number(item.CARGA_HORARIA) || 0;
      if (!acc[type]) acc[type] = { name: type, totalCarga: 0 };
      acc[type].totalCarga += val;
    });
    return Object.values(acc).sort((a, b) => b.totalCarga - a.totalCarga).slice(0, 5); // top 5
  }, [filteredData]);

  // Total Values
  const totalEmpenhado = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (Number(item.VALOR_EMPENHADO) || 0), 0);
  }, [filteredData]);

  const totalPagoAluno = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (Number(item.VALOR_PAGO_POR_ALUNO) || 0), 0);
  }, [filteredData]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div aria-labelledby="financial-title">
      <h2 id="financial-title" className="visually-hidden">Dashboard Financeiro e Carga Horária</h2>
      
      <div className="kpi-grid">
        <div className="kpi-card" tabIndex="0">
          <span className="kpi-title">Valor Empenhado Total</span>
          <span className="kpi-value" style={{ color: 'var(--color-blue)' }}>{formatCurrency(totalEmpenhado)}</span>
        </div>
        <div className="kpi-card" tabIndex="0">
          <span className="kpi-title">Valor Pago por Aluno (Agregado)</span>
          <span className="kpi-value" style={{ color: 'var(--color-bluish-green)' }}>{formatCurrency(totalPagoAluno)}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container" aria-label="Gráfico de Carga Horária por Tipo de Ação">
          <h3 className="chart-title">Carga Horária (Top 5 Tipos de Ação)</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={workloadByActionType} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-primary)" tick={{fontSize: 12}} />
                <YAxis stroke="var(--text-primary)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="totalCarga" name="Total Carga Horária" fill="var(--color-orange)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;
