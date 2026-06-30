import pandas as pd

# 1. Carregar o DataFrame com as hierarquias criadas no Processo 2
nome_arquivo = 'DADOS_CETREMEC_HIERARQUIA.xlsx'
print(f"Lendo o arquivo: {nome_arquivo}...")
df = pd.read_excel(nome_arquivo)

# 2. Definir as colunas pelas quais vamos agrupar (nossas dimensões)
colunas_agrupamento = ['Grupo_Secretaria', 'TIPO_DE_ACAO', 'MODALIDADE']

# 3. Realizar o agrupamento (groupby) e aplicar as agregações
# Como não temos certeza se há uma coluna ID, usaremos a contagem da própria linha usando a coluna 'TIPO_DE_ACAO' como referência de tamanho
df_kpis = df.groupby(colunas_agrupamento).agg(
    Total_de_Acoes=('TIPO_DE_ACAO', 'size'),           # Conta o número de linhas no grupo
    Total_de_Servidores_Unicos=('SIAPE', 'nunique'),   # Conta SIAPEs únicos
    Carga_Horaria_Media=('CARGA_HORARIA', 'mean'),     # Média da carga horária
    Carga_Horaria_Mediana=('CARGA_HORARIA', 'median'), # Mediana da carga horária
    Valor_Pago_por_Aluno_Media=('VALOR_PAGO_POR_ALUNO', 'mean'),     # Média do valor pago
    Valor_Pago_por_Aluno_Mediana=('VALOR_PAGO_POR_ALUNO', 'median')  # Mediana do valor pago
).reset_index()

# 4. Renomear as colunas para o formato visual amigável solicitado
df_kpis.rename(columns={
    'Total_de_Acoes': 'Total de Ações',
    'Total_de_Servidores_Unicos': 'Total de Servidores Únicos',
    'Carga_Horaria_Media': 'Carga Horária (Média)',
    'Carga_Horaria_Mediana': 'Carga Horária (Mediana)',
    'Valor_Pago_por_Aluno_Media': 'Valor Pago por Aluno (Média)',
    'Valor_Pago_por_Aluno_Mediana': 'Valor Pago por Aluno (Mediana)'
}, inplace=True)

# 5. Exibir as 5 primeiras linhas conforme solicitado
print("\n--- AS 5 PRIMEIRAS LINHAS DA TABELA DE MÉTRICAS (df_kpis) ---")
print(df_kpis.head())

# 6. Salvar o DataFrame em um arquivo Excel para facilitar a importação no Power BI
arquivo_saida = 'DADOS_CETREMEC_KPIS.xlsx'
df_kpis.to_excel(arquivo_saida, index=False)
print(f"\n✅ O DataFrame df_kpis foi salvo com sucesso no arquivo: {arquivo_saida}")
