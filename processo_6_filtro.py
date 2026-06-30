import pandas as pd

print("--- INICIANDO PROCESSO 6: FILTRO DE COLUNAS ESSENCIAIS ---")

arquivo = 'DADOS_POWERBI_LIMPOS.xlsx'
print(f"Lendo o arquivo: {arquivo}...")

# Carregar as abas
df_base = pd.read_excel(arquivo, sheet_name='Base_Detalhada')
df_kpis = pd.read_excel(arquivo, sheet_name='Indicadores_Agrupados')

# Lista exata das colunas que queremos manter na base detalhada
colunas_para_manter = [
    'SIAPE',
    'SECRETARIA_DE_LOTACAO',
    'TIPO_DE_ACAO',
    'MODALIDADE',
    'STATUS',
    'CARGA_HORARIA',
    'VALOR_PAGO_POR_ALUNO',
    'Qualidade_Dados_Completos',
    'Grupo_Secretaria',
    'Subcategoria_Secretaria'
]

# Filtrar o DataFrame mantendo apenas as colunas desejadas
df_base_filtrada = df_base[colunas_para_manter]

print(f"A base foi reduzida de {df_base.shape[1]} colunas para {df_base_filtrada.shape[1]} colunas.")
print("Removendo a coluna vazia causadora do erro...")

# Exportar novamente sobrepondo o mesmo arquivo
print(f"Salvando o arquivo otimizado...")
with pd.ExcelWriter(arquivo, engine='openpyxl') as writer:
    df_base_filtrada.to_excel(writer, sheet_name='Base_Detalhada', index=False)
    # A aba de KPIs já é um resumo, então mantemos ela inteira
    df_kpis.to_excel(writer, sheet_name='Indicadores_Agrupados', index=False)

print("✅ Concluido! Arquivo ultra leve e sem colunas problemáticas gerado com sucesso.")
