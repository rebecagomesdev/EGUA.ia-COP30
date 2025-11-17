# train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from joblib import dump
import numpy as np
import os
import kagglehub

def train_and_save_model():
    """
    Baixa o dataset do Kaggle, treina o modelo Random Forest e o salva.
    """
    print("Iniciando o download do dataset do Kaggle...")

    try:
        # Download latest version of the dataset
        # O path será o diretório onde os arquivos foram salvos (ex: .../metro-manila-flood-prediction-20162020-daily)
        path = kagglehub.dataset_download("denvermagtibay/metro-manila-flood-prediction-20162020-daily")
        
        print(f"Dataset baixado para: {path}")

        # O nome do arquivo CSV dentro do dataset é geralmente o nome do dataset ou similar.
        # Procurando o arquivo CSV (o nome real do arquivo pode variar, verifique o seu download)
        # Vamos assumir que o arquivo principal se chama 'manila_flood_prediction.csv' ou similar.
        # Você deve verificar o nome correto do arquivo no diretório baixado.
        
        # Tentativa de carregar o arquivo CSV principal (ajuste o nome se necessário)
        csv_file_path = os.path.join(path, 'Flood_Prediction_NCR_Philippines.csv') # Nome ajustado
        
        # Se o nome do arquivo for diferente, mude a linha acima ou use glob para encontrá-lo
        
        df = pd.read_csv(csv_file_path)
        print(f"Dataset carregado com {len(df)} linhas.")

    except Exception as e:
        print(f"ERRO ao baixar ou carregar o dataset: {e}")
        return

    # 1. Preparação dos Dados - Ajuste as colunas com base no seu arquivo CSV
    # Baseado nas colunas solicitadas: rainfall_mm, water_level, elevation_m
    # ATENÇÃO: Verifique os nomes exatos das colunas no seu CSV real.
    
    # As colunas de entrada (Features)
    features = ['Rainfall_mm', 'WaterLevel_m', 'Elevation_m'] 
    
    # A variável alvo (Target) - Se você estiver prevendo um nível de enchente (regressão)
    target_column = 'FloodOccurrence' # Exemplo: ajuste para o nome real da coluna alvo (nível de enchente)

    # Filtrar o DataFrame para garantir que as colunas existam e lidar com NaNs
    if not all(col in df.columns for col in features + [target_column]):
        print("ERRO: O DataFrame não contém as colunas necessárias. Verifique os nomes das colunas.")
        print(f"Colunas esperadas: {features + [target_column]}")
        print(f"Colunas presentes: {list(df.columns)}")
        return

    # Limpeza básica: remover linhas com valores faltantes nas colunas usadas
    df_clean = df.dropna(subset=features + [target_column]).copy()
    
    # Se o dataset contém colunas de data/hora, você pode precisar de engenharia de features, 
    # mas para este modelo inicial, vamos usar apenas as features numéricas.

    X = df_clean[features]
    y = df_clean[target_column] 
    
    # Dividir os dados em conjuntos de treino e teste
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Dados prontos para o treinamento.")

    # 2. Treinamento do Modelo
    # Random Forest Regressor é adequado se 'flood_level' for um valor contínuo
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1) 
    
    print("Iniciando o treinamento do Random Forest...")
    model.fit(X_train, y_train)

    # 3. Avaliação
    score = model.score(X_test, y_test)
    print(f"Score de Teste do Modelo (R²): {score:.4f}") 

    # 4. Salvar o Modelo Treinado
    filename = 'random_forest_flood_model.joblib'
    dump(model, filename) 
    print(f"Modelo treinado e salvo com sucesso como: {filename}")

if __name__ == '__main__':
    # Certifique-se de ter o 'kagglehub' instalado: pip install kagglehub
    train_and_save_model()


