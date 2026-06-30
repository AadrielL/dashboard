import pandas as pd
import numpy as np

# 1. Carregar o DataFrame
# Notei que na pasta o arquivo se chama 'DADOS_CETREMEC_TRATADO.xlsx', então utilizei este nome.
# Caso seu arquivo realmente se chame 'DADOS_CETREMEC_TRATADO (1).xlsx', basta alterar aqui!
nome_arquivo = 'DADOS_CETREMEC_TRATADO.xlsx'
df = pd.read_excel(nome_arquivo)

# 2. Remover espaços em branco no início e no final de todas as strings da coluna SECRETARIA_DE_LOTACAO
if 'SECRETARIA_DE_LOTACAO' in df.columns:
    # astype(str) garante que não teremos erros caso haja valores nulos/floats misturados com strings
    df['SECRETARIA_DE_LOTACAO'] = df['SECRETARIA_DE_LOTACAO'].astype(str).str.strip()
else:
    print("Aviso: A coluna 'SECRETARIA_DE_LOTACAO' não foi encontrada no DataFrame.")

# 3. Criar a coluna 'Qualidade_Dados_Completos'
colunas_verificar = [
    'CARGA_HORARIA', 'VALOR_PAGO_POR_ALUNO', 'SIAPE', 
    'TIPO_DE_ACAO', 'MODALIDADE', 'STATUS'
]

# Vamos criar uma máscara que verifica se há valores nulos ou strings vazias
# Primeiro verifica nulos nativos do pandas (NaN, None, NaT)
is_missing = df[colunas_verificar].isna()

# Em seguida, verifica também se existem strings vazias ou só com espaços em branco ('', '   ')
for col in colunas_verificar:
    if col in df.columns:
        if df[col].dtype == 'object':
            # Se for string, preencher nulos com espaço temporariamente para aplicar o strip sem erro
            is_missing[col] = is_missing[col] | (df[col].fillna('').astype(str).str.strip() == '')
        # Outra checagem importante: Pandas às vezes lê arquivos do excel e coloca strings 'nan'
            is_missing[col] = is_missing[col] | (df[col].astype(str).str.lower() == 'nan')

# Se qualquer uma (any) das colunas_verificar tiver is_missing = True, a linha é incompleta
linhas_incompletas_mask = is_missing.any(axis=1)

# Atribuindo os valores de acordo com a regra solicitada
df['Qualidade_Dados_Completos'] = np.where(
    linhas_incompletas_mask, 
    'Incompleto', 
    '100% Completo'
)

# 4. Imprimir a porcentagem geral de linhas incompletas no dataset
total_linhas = len(df)
total_incompletas = linhas_incompletas_mask.sum()

if total_linhas > 0:
    porcentagem_incompleta = (total_incompletas / total_linhas) * 100
    print(f"Porcentagem de linhas incompletas: {porcentagem_incompleta:.2f}%")
else:
    print("O DataFrame está vazio.")

# Opcional: Salvar o DataFrame modificado em um novo arquivo para você poder conferir o resultado
arquivo_saida = 'DADOS_CETREMEC_QUALIDADE.xlsx'
df.to_excel(arquivo_saida, index=False)
print(f"O resultado foi salvo em: {arquivo_saida}")
