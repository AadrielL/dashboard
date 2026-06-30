import React from 'react';

const ReportTab = () => {
  return (
    <article className="report-content" aria-labelledby="report-title">
      <h2 id="report-title">Relatório e Objetivo do Dashboard</h2>
      
      <section aria-labelledby="objective-title">
        <h3 id="objective-title">1. Objetivo Principal</h3>
        <p>
          O objetivo deste dashboard é proporcionar uma visualização dinâmica, interativa e altamente acessível dos dados de capacitação de servidores. 
          Ele permite analisar a distribuição de ações de desenvolvimento por diferentes modalidades, secretarias e tipos de ações, facilitando 
          a gestão e a tomada de decisão com base em dados de qualidade e investimentos.
        </p>
      </section>

      <section aria-labelledby="accessibility-title">
        <h3 id="accessibility-title">2. Acessibilidade e Escolhas de Design</h3>
        <p>
          Este dashboard foi desenvolvido pensando na inclusão. As seguintes medidas de acessibilidade foram implementadas:
        </p>
        <ul>
          <li>
            <strong>Cores para Daltônicos:</strong> Utilizamos uma paleta de cores baseada em diretrizes de acessibilidade visual (inspirada na paleta Okabe-Ito), 
            que assegura contraste adequado e distinção clara entre elementos gráficos, mesmo para usuários com deuteranopia, protanopia ou tritanopia.
          </li>
          <li>
            <strong>Tamanho de Fonte Dinâmico:</strong> Disponibilizamos um controle no topo da tela para aumentar o tamanho da fonte em todos os elementos da interface, auxiliando pessoas com baixa visão.
          </li>
          <li>
            <strong>Modo Alto Contraste (Modo Escuro):</strong> Opção para alterar o fundo da aplicação, reduzindo o brilho e aumentando a legibilidade.
          </li>
          <li>
            <strong>Suporte a Leitores de Tela:</strong> A interface foi estruturada usando HTML semântico (tags de navegação, cabeçalhos lógicos, etc.) e 
            atributos <code>aria-labels</code> (Acessible Rich Internet Applications). Gráficos complexos podem não ser lidos com perfeição por leitores, 
            porém tabelas sumárias de dados são usadas onde aplicável para garantir o acesso total à informação.
          </li>
        </ul>
      </section>

      <section aria-labelledby="data-struct-title">
        <h3 id="data-struct-title">3. Dinamicidade dos Dados</h3>
        <p>
          Todas as abas são controladas por um <strong>filtro global de Modalidade</strong> (Presencial, EaD, etc.). 
          Na Visão Geral, você encontrará filtros secundários que ajustam todos os totalizadores instantaneamente, permitindo cruzar categorias 
          como o "Tipo de Ação" e visualizar o desempenho agregado de cada "Grupo Secretaria" (Médias e Medianas).
        </p>
        <p>
          A aba de Dispersão substitui as abas individuais de Carga Horária e Valor Pago, unificando ambos os indicadores em um único 
          gráfico de pontos com opções de categorização por Tipo de Ação ou Grupo de Secretaria.
        </p>
      </section>
    </article>
  );
};

export default ReportTab;
