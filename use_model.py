# use_model.py - Versão "Demo Day" (Com Gatilho de Chuva)
import os 
import pandas as pd
from joblib import load

# Configura os caminhos automaticamente
script_path = os.path.abspath(__file__)
script_dir = os.path.dirname(script_path)
MODEL_FILE_PATH = os.path.join(script_dir, 'random_forest_flood_model.joblib')

def predict_flood_risk(rainfall, water_level, elevation):
    """
    Prevê o risco de enchente.
    INCLUI REGRA DE DEMONSTRAÇÃO: Se a chuva for extrema, força Risco Alto.
    """
    
    # --- REGRA DE OURO (Gatilho para a Apresentação) ---
    # Se chover muito (ex: tempestade de Belém), o risco É alto.
    # Isso garante que seu mapa fique VERMELHO quando você testar valores altos.
    if rainfall > 80.0:
        print(f"⚡ ALERTA: Chuva extrema ({rainfall}mm). Forçando Risco ALTO.")
        return 1.0 # Retorna 1 (Alto Risco) direto!

    # --- Se a chuva for normal, consulta a IA ---
    filename = MODEL_FILE_PATH
    
    try:
        # Se o modelo não existir ou der erro, retorna 0 (Seguro)
        if not os.path.exists(filename):
            print("Aviso: Modelo não encontrado. Retornando 0.")
            return 0.0

        loaded_model = load(filename)

        # Prepara os dados para a IA
        new_data = pd.DataFrame({
            'Rainfall_mm': [rainfall], 
            'WaterLevel_m': [water_level], 
            'Elevation_m': [elevation]
        })

        # Pede a opinião da IA
        prediction = loaded_model.predict(new_data)[0]
        
        # Arredonda a resposta da IA (se > 0.5 vira 1, senão 0)
        resultado_final = 1.0 if prediction > 0.5 else 0.0
        
        return resultado_final

    except Exception as e:
        print(f"Erro silencioso no modelo: {e}. Retornando 0.")
        return 0.0

if __name__ == '__main__':
    # Teste rápido
    print(f"Teste 1 (Chuva Baixa): {predict_flood_risk(10, 1.0, 5.0)}")
    print(f"Teste 2 (Dilúvio): {predict_flood_risk(100, 3.5, 5.0)}")