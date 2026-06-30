import pandas as pd
import numpy as np

# 1. Carregar o DataFrame resultante do Processo 1
nome_arquivo = 'DADOS_CETREMEC_QUALIDADE.xlsx'
print(f"Lendo o arquivo: {nome_arquivo}...")
df = pd.read_excel(nome_arquivo)

# 2. Garantir que a coluna alvo está como string limpa
# (Embora já tenhamos limpo no Processo 1, é uma boa prática garantir)
if 'SECRETARIA_DE_LOTACAO' in df.columns:
    secretarias = df['SECRETARIA_DE_LOTACAO'].astype(str).str.strip()
else:
    raise ValueError("A coluna 'SECRETARIA_DE_LOTACAO' não foi encontrada!")

# 3. Definir as listas de hierarquia fornecidas
grupo_orgaos_centrais = ['SETEC', 'SERES', 'SEB', 'SECADI', 'GM', 'SE', 'SEGAPE', 'SASE', 'SESU', 'SPO', 'SNPPI']
grupo_conselhos = ['CNE', 'CONJUR', 'CORREGEDORIA', 'STIC']
grupo_vinculadas = ['VINCULADAS', 'UFPEL', 'ENAP', 'INEP', 'UnB']

# 4. Configurar as condições e escolhas para o np.select (Grupo)
condicoes = [
    secretarias.isin(grupo_orgaos_centrais),
    secretarias.isin(grupo_conselhos),
    secretarias.isin(grupo_vinculadas)
]

escolhas = [
    'Órgãos Centrais/MEC',
    'Conselhos e Apoio',
    'Vinculadas e Externas'
]

# np.select avalia cada linha e aplica o primeiro grupo correspondente.
# Se não achar correspondência nas 3 listas, preenche com 'Outros' (conforme regra)
df['Grupo_Secretaria'] = np.select(condicoes, escolhas, default='Outros')

# 5. Criar a coluna de Subcategoria
# A regra dita que a subcategoria seja o próprio nome da secretaria para os grupos mapeados.
# Para os valores não mapeados (que caíram no grupo 'Outros' ou são nulos), vamos
# padronizar a subcategoria como 'Outros' também (ou usar o valor original se preferir, 
# mas para padronização de hierarquia de BI, se o Grupo é Outros, a subcategoria também será Outros
# a menos que seja um caso específico).
df['Subcategoria_Secretaria'] = np.where(
    df['Grupo_Secretaria'] == 'Outros',
    'Outros',
    df['SECRETARIA_DE_LOTACAO']
)

# 6. Salvar e gerar relatório rápido
arquivo_saida = 'DADOS_CETREMEC_HIERARQUIA.xlsx'
df.to_excel(arquivo_saida, index=False)

print("\n--- RESUMO DO PROCESSO 2 ---")
print("Distribuição das Secretarias por Grupo:")
print(df['Grupo_Secretaria'].value_counts())
print(f"\nDataFrame atualizado com a hierarquia salvo em: {arquivo_saida}")
