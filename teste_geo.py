# teste_geo.py (v2 - O Teste de Cálculo REAL)

import geopandas
import rasterio
from rasterstats import zonal_stats
import sys

print("--- INICIANDO SPIKE v2: O Teste de Cálculo ---")

# --- 1. Importar a IA (que já consertamos) ---
try:
    sys.path.append('AI_model')
    from use_model import predict_flood_risk
    print("✅ SUCESSO: [1/3] Modelo de IA importado.")
except Exception as e:
    print(f"❌ FALHA: [1/3] Não consegui importar 'use_model': {e}")
    sys.exit()

# Definir os caminhos dos arquivos
TIF_FILE = 'data/raw/relevo.tif' # O mapa de elevação
JSON_FILE = 'SC2022_RMBEL_CEM_V2.json' # O GeoJSON dos bairros

elevacao_media_real = None

# --- 2. Carregar Polígonos e Calcular Elevação Média ---
try:
    # Carregar o GeoJSON com os polígonos dos bairros
    gdf = geopandas.read_file(JSON_FILE)
    print(f"✅ SUCESSO: [2/3] GeoJSON '{JSON_FILE}' carregado.")
    
    # Pegar apenas o PRIMEIRO polígono (bairro) do arquivo para o nosso teste
    primeiro_bairro_poligono = gdf.geometry.iloc[0]
    print(f"   -> Testando com o primeiro polígono (tipo: {primeiro_bairro_poligono.geom_type})")

    # Esta é a mágica:
    # "Calcule as estatísticas ('mean') do TIF_FILE
    # que caírem DENTRO do 'primeiro_bairro_poligono'"
    stats = zonal_stats(primeiro_bairro_poligono, TIF_FILE, stats="mean")
    
    # O 'stats' será uma lista, ex: [{'mean': 12.345}]
    elevacao_media_real = stats[0]['mean']
    
    print(f"   -> !! PROVA REAL !!")
    print(f"   -> Elevação média calculada para este bairro: {elevacao_media_real:.2f} metros")

except Exception as e:
    print(f"❌ FALHA: [2/3] Erro ao calcular elevação média: {e}")
    sys.exit()


# --- 3. Teste Final: Chamar a IA com Dados REAIS ---
try:
    print(f"\n✅ SUCESSO: [3/3] Chamando a IA com elevação REAL...")
    
    chuva_falsa = 50.0  # Valor de teste
    mare_falsa = 2.5    # Valor de teste
    
    # Usando a elevação que ACABAMOS de calcular
    risco = predict_flood_risk(chuva_falsa, mare_falsa, elevacao_media_real)
    
    print(f"   -> !! PROJETO VIÁVEL !!")
    print(f"   -> Risco calculado para este bairro: {risco:.4f}")

except Exception as e:
    print(f"❌ FALHA: [3/3] Erro ao chamar a IA com dado real: {e}")

print("\n--- SPIKE v2 CONCLUÍDO ---")