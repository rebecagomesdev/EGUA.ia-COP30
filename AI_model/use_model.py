# use_model.py
import os 
import pandas as pd
from joblib import load


# Descobre o caminho ABSOLUTO para este arquivo (use_model.py)
script_path = os.path.abspath(__file__)
# Descobre o caminho para o DIRETÓRIO (pasta) onde ele está
script_dir = os.path.dirname(script_path)
# Cria o caminho completo para o arquivo .joblib
MODEL_FILE_PATH = os.path.join(script_dir, 'random_forest_flood_model.joblib')


def predict_flood_risk(rainfall, water_level, elevation):
    """
    Carrega o modelo salvo e faz uma previsão com os dados de entrada.
    """
    filename = MODEL_FILE_PATH
    
    try:
        # 1. Carregar o modelo salvo
        loaded_model = load(filename)
        print(f"Modelo '{filename}' carregado com sucesso.")

        # 2. Preparar os Novos Dados de Entrada
        new_data = pd.DataFrame({
            'Rainfall_mm': [rainfall], 
            'WaterLevel_m': [water_level], 
            'Elevation_m': [elevation]
        })

        # 3. Fazer a Previsão
        prediction = loaded_model.predict(new_data)

        print("\n--- Resultado da Previsão ---")
        print(f"Entrada: Chuva={rainfall:.1f}mm, Nível da Água={water_level:.1f}, Elevação={elevation:.1f}m")
        print(f"Previsão de Risco/Nível de Enchente: {prediction[0]:.2f}")
        return prediction[0]

    except FileNotFoundError:
        print(f"ERRO: O arquivo do modelo '{filename}' não foi encontrado.")
        print("Certifique-se de que você executou 'train_model.py' primeiro.")
        return None

if __name__ == '__main__':
    # Exemplo de uso: Novos dados para previsão
    chuva_alta = 95.2
    nivel_alto = 4.8
    elevacao_media = 20.0
    
    predict_flood_risk(chuva_alta, nivel_alto, elevacao_media)