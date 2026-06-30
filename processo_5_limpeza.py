import pandas as pd

print("--- INICIANDO PROCESSO DE LIMPEZA DE NULOS NOS DADOS ---")

arquivo = 'DADOS_POWERBI_PRONTOS.xlsx'

# Carregar os dados que geramos
df_base = pd.read_excel(arquivo, sheet_name='Base_Detalhada')
df_kpis = pd.read_excel(arquivo, sheet_name='Indicadores_Agrupados')

# Limpar nulos na Base_Detalhada
for col in df_base.columns:
    if df_base[col].dtype == 'object':
        df_base[col] = df_base[col].fillna("Não Informado")
    else:
        df_base[col] = df_base[col].fillna(0)

# Limpar nulos na tabela de KPIs
for col in df_kpis.columns:
    if df_kpis[col].dtype == 'object':
        df_kpis[col] = df_kpis[col].fillna("Não Informado")
    else:
        df_kpis[col] = df_kpis[col].fillna(0)

# Sobrescrever o arquivo garantindo dados perfeitos
with pd.ExcelWriter('DADOS_POWERBI_LIMPOS.xlsx', engine='openpyxl') as writer:
    df_base.to_excel(writer, sheet_name='Base_Detalhada', index=False)
    df_kpis.to_excel(writer, sheet_name='Indicadores_Agrupados', index=False)

print("✅ Todos os nulos foram substituidos por 0 ou 'Não Informado'. Dados perfeitos!")
