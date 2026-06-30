import pandas as pd

print("--- INICIANDO O PROCESSO 4: EXPORTAÇÃO FINAL ---")

# 1. Carregar os dois DataFrames que preparamos anteriormente
print("Lendo a base detalhada com as novas hierarquias (DADOS_CETREMEC_HIERARQUIA.xlsx)...")
df_base = pd.read_excel('DADOS_CETREMEC_HIERARQUIA.xlsx')

print("Lendo a base agrupada de indicadores (DADOS_CETREMEC_KPIS.xlsx)...")
df_kpis = pd.read_excel('DADOS_CETREMEC_KPIS.xlsx')

# 2. Preparar o ambiente para exportação multi-abas (ExcelWriter)
arquivo_final = 'DADOS_POWERBI_PRONTOS.xlsx'

print(f"\nEmpacotando os dados no arquivo final: {arquivo_final}...")
# Utilizamos o ExcelWriter para conseguir salvar múltiplas abas no mesmo arquivo
with pd.ExcelWriter(arquivo_final, engine='openpyxl') as writer:
    # Salvando a base detalhada na primeira aba, sem incluir a coluna de índice (index=False)
    df_base.to_excel(writer, sheet_name='Base_Detalhada', index=False)
    
    # Salvando a tabela de KPIs na segunda aba, sem incluir a coluna de índice
    df_kpis.to_excel(writer, sheet_name='Indicadores_Agrupados', index=False)

print("\nConcluido! O arquivo DADOS_POWERBI_PRONTOS.xlsx esta pronto para ser consumido pelo Power BI.")
