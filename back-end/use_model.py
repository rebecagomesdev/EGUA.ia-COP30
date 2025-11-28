import pandas as pd
from joblib import load
import os
import sys


base_dir = os.path.dirname(os.path.abspath(__file__))


model_path = os.path.join(base_dir, '..', 'machine_learning', 'artifacts', 'random_forest_flood_model.joblib')
model_path = os.path.normpath(model_path) # Limpa o caminho para evitar erros de sintaxe


modelo = None

if os.path.exists(model_path):
    try:
        modelo = load(model_path)
        print(f"✅ [use_model] Modelo carregado com sucesso de: {model_path}")
    except Exception as e:
        print(f"❌ [use_model] Erro ao ler o arquivo joblib: {e}")
else:
    print(f"⚠️ [use_model] ALERTA: Modelo não encontrado.")
    print(f"   Caminho buscado: {model_path}")

# --- 3. FUNÇÃO DE PREVISÃO ---
def predict_flood_risk(rainfall, water_level, elevation):
    """
    Recebe chuva, nível do rio e elevação.
    Retorna a probabilidade de risco (float entre 0.0 e 1.0).
    Retorna None se o modelo não estiver disponível.
    """
    
    # Se o modelo não carregou, aborta a missão sem travar o servidor
    if modelo is None:
        print("❌ Tentativa de previsão cancelada: Modelo não carregado.")
        return None

    try:
        # Preparar os dados exatamente como no treino (nomes das colunas importam!)
        # IMPORTANTE: Mantendo 'Elevation_m' conforme seu arquivo original
        new_data = pd.DataFrame({
            'Rainfall_mm': [rainfall], 
            'WaterLevel_m': [water_level], 
            'Elevation_m': [elevation] 
        })

        # Tenta pegar a probabilidade (0% a 100%) para um risco mais refinado
        if hasattr(modelo, "predict_proba"):
            # Pega a chance da classe 1 (Enchente)
            prediction = modelo.predict_proba(new_data)[0][1]
        else:
            # Se o modelo for simples e só retornar 0 ou 1
            prediction = float(modelo.predict(new_data)[0])

        return prediction

    except Exception as e:
        print(f"❌ Erro matemático na predição: {e}")
        return None

# Teste local (só roda se você executar este arquivo direto)
if __name__ == '__main__':
    print("--- Teste de Mesa ---")
    resultado = predict_flood_risk(95.2, 4.8, 20.0)
    print(f"Resultado do teste: {resultado}")