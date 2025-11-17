# main.py
from fastapi import FastAPI
from pydantic import BaseModel, Field

# --- 1. Importar a função REAL da IA ---
# Importa a função do arquivo 'use_model.py'
try:
    from use_model import predict_flood_risk
except ImportError:
    print("ERRO: Não foi possível importar 'predict_flood_risk' do arquivo 'use_model.py'")
    predict_flood_risk = None


# --- 2. Definição do NOVO Contrato (Plano B) ---

# ENTRADA: O que o Frontend vai enviar (Baseado no README)
class RiscoInput(BaseModel):
    Rainfall_mm: float = Field(..., description="Chuva em milímetros (mm)")
    WaterLevel_m: float = Field(..., description="Nível da água/maré em metros (m)")
    Elevation_m: float = Field(..., description="Elevação da área em metros (m)")

# SAÍDA: O que sua API vai devolver (Simples: 0 ou 1)
class RiscoOutput(BaseModel):
    risco_calculado: float # Alterado para float para aceitar a saída do Regressor
    classificacao: str = Field(description="Texto amigável da classificação")


# --- 3. Criação da API ---
app = FastAPI(
    title="EGUA.ia - Motor de Previsão de Risco",
    description="API que prevê risco de enchente com base no modelo Random Forest."
)


# --- 4. Endpoint Modificado (Conectado à IA Real) ---

@app.post("/prever_risco", response_model=RiscoOutput)
async def prever_risco(dados_entrada: RiscoInput):
    """
    Recebe dados de chuva, nível da água e elevação, 
    e retorna o risco de enchente (0 ou 1).
    """
    
    if predict_flood_risk is None:
        return {
            "risco_calculado": -1.0,
            "classificacao": "ERRO: Modelo de IA não foi carregado."
        }

    # --- CORREÇÃO APLICADA AQUI ---
    # Os nomes dos parâmetros (rainfall, water_level, elevation)
    # agora batem com a função em 'use_model.py'
    
    previsao_bruta = predict_flood_risk(
        rainfall=dados_entrada.Rainfall_mm, 
        water_level=dados_entrada.WaterLevel_m,
        elevation=dados_entrada.Elevation_m
    )
    
    # 2. Converter o resultado para um texto amigável
    # O modelo é um REGRESSOR, então ele retorna um número (ex: 0.87 ou 0.12)
    # Vamos classificar: se for > 0.5, consideramos Risco (1).
    
    classificacao_texto = "Sem Risco de Enchente"
    risco_final = 0 # Valor binário
    
    if previsao_bruta > 0.5: # Limite de decisão (threshold)
        classificacao_texto = "ALERTA: Risco de Enchente Detectado"
        risco_final = 1
    elif previsao_bruta < 0:
         classificacao_texto = "ERRO: Falha no cálculo do modelo"


    # 3. Retornar a resposta no formato do "RiscoOutput"
    return {
        "risco_calculado": previsao_bruta, # Retorna o valor exato (ex: 0.87)
        "classificacao": classificacao_texto # Retorna o texto amigável
    }