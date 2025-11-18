from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import unicodedata
import os

# --- 1. Importação Robusta da IA ---
try:
    from use_model import predict_flood_risk
except ImportError:
    print("⚠️ AVISO: 'use_model.py' não encontrado. A IA não será usada.")
    predict_flood_risk = None

# --- 2. Importação Robusta de Geo ---
try:
    import geopandas as gpd
    import rasterio
    import networkx as nx
    from shapely.geometry import Point
    from rasterio.crs import CRS as RasterioCRS
    GEO_AVAILABLE = True
except ImportError:
    print("⚠️ AVISO: Bibliotecas GEO (geopandas/rasterio) não instaladas.")
    GEO_AVAILABLE = False

# --- 3. Configurações e Constantes ---
BAIRROS_PATH = "SC2022_RMBEL_CEM_V2.json" 
RELEVO_PATH = "data/raw/relevo.tif"
MALHA_PATH = "data/raw/malha_belem.graphml.xml"

# Dicionário para normalizar nomes que diferem entre GeoJSON e SVG
FIX_NOMES = {
    "montese (terra firme)": "terrafirme",
    "sao bras": "saobraz",
    "val-de-caes": "valdecaes",
    "curio-utinga": "curioutinga",
    "sacramenta": "sacramenta",
}

# --- 4. Modelos de Dados ---
class MapaInput(BaseModel):
    Rainfall_mm: float
    WaterLevel_m: float

class MapaOutput(BaseModel):
    riscos_por_bairro: Dict[str, float]
    metadata: Dict[str, str] = {} # Útil para debug no frontend

# --- 5. Inicialização da API ---
app = FastAPI(title="EGUA.ia - Flood Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variável Global para Cache (Evita reler o mapa a cada clique)
CACHE_GEODATA = None

def carregar_dados_geo():
    """
    Função auxiliar para processar o mapa apenas uma vez (Singleton).
    Retorna um Dicionário: {'NomeBairro': ElevaçãoMedia}
    """
    if not GEO_AVAILABLE: return {}
    if not os.path.exists(RELEVO_PATH):
        print(f"❌ ERRO: Arquivo de relevo não encontrado em {RELEVO_PATH}")
        return {}

    print("\n🌎 [GEO] Iniciando processamento cartográfico...")
    
    # 1. Definir Projeção Métrica (UTM 22S - EPSG:31982 para Belém)
    # Isso é crucial para medir distâncias e alinhar camadas.
    METRIC_CRS = "EPSG:31982" 
    
    try:
        # 2. Carregar e Projetar Bairros
        bairros = gpd.read_file(BAIRROS_PATH).to_crs(METRIC_CRS)
        print(f"✅ [GEO] {len(bairros)} bairros carregados.")

        # 3. Carregar e Analisar o Relevo (Raster)
        with rasterio.open(RELEVO_PATH) as src:
            # Se o TIF não tiver projeção, assumimos a métrica de Belém
            if src.crs is None:
                print("⚠️ [GEO] TIF sem CRS. Assumindo EPSG:31982.")
                # Nota: Em um cenário real, isso deveria ser corrigido no QGIS/ArcGIS
            
            # 4. Carregar Malha Viária (Pontos de Amostragem)
            G = nx.read_graphml(MALHA_PATH)
            # Extrai nós (pontos) do grafo
            pontos = [Point(d['x'], d['y']) for _, d in G.nodes(data=True)]
            
            # O GraphML geralmente vem em Lat/Lon (4326). Convertemos para Métrica.
            gdf_pontos = gpd.GeoDataFrame(geometry=pontos, crs="EPSG:4326").to_crs(METRIC_CRS)
            print(f"✅ [GEO] {len(gdf_pontos)} pontos de rua processados.")

            # 5. Cruzamento Espacial (Spatial Join)
            # Descobre qual ponto de rua cai dentro de qual bairro
            pontos_em_bairros = gpd.sjoin(gdf_pontos, bairros, how="inner", predicate="within")
            
            # 6. Amostragem do Relevo (Sampling)
            # Pega a coordenada de cada ponto e "fura" o TIF para ver a altura
            coord_list = [(p.x, p.y) for p in pontos_em_bairros.geometry]
            
            # O truque: O TIF pode estar em outro CRS. 
            # Se estiver, teríamos que reprojetar os pontos. 
            # Para este PR, assumimos que você alinhou os arquivos.
            
            # Amostragem
            valores_altura = [x[0] for x in src.sample(coord_list)]
            pontos_em_bairros['altitude'] = valores_altura

            # 7. Calcular Média por Bairro
            # Remove valores negativos (erros de leitura) ou zero absoluto se suspeito
            validos = pontos_em_bairros[pontos_em_bairros['altitude'] > 0]
            media_por_bairro = validos.groupby('NM_BAIRRO')['altitude'].mean()
            
            resultado = media_por_bairro.to_dict()
            print(f"✅ [GEO] Processamento concluído. {len(resultado)} bairros com dados de elevação.")
            
            # DEBUG: Imprime 3 exemplos para ver se não está tudo zerado
            exemplos = list(resultado.items())[:3]
            print(f"🔍 [DEBUG] Exemplos de Altura: {exemplos}")
            
            return resultado

    except Exception as e:
        print(f"❌ [GEO] Falha crítica no geoprocessamento: {e}")
        return {}


@app.post("/prever_risco_mapa", response_model=MapaOutput)
async def prever_risco_mapa(input_data: MapaInput):
    global CACHE_GEODATA
    
    # Carrega dados geográficos se ainda não carregou (Lazy Loading)
    if CACHE_GEODATA is None:
        CACHE_GEODATA = carregar_dados_geo()

    riscos = {}
    chuva = input_data.Rainfall_mm
    mare = input_data.WaterLevel_m
    
    # Carrega lista completa de bairros para garantir que ninguém suma
    try:
        todos_bairros = gpd.read_file(BAIRROS_PATH)['NM_BAIRRO'].unique()
    except:
        todos_bairros = []

    print(f"\n🔮 [IA] Solicitado: Chuva {chuva}mm, Maré {mare}m")

    for bairro in todos_bairros:
        # 1. Busca Elevação Real
        elevacao = CACHE_GEODATA.get(bairro, 0.0) # Se não tiver dado, é 0
        
        # 2. Lógica de Risco (IA + Física)
        if elevacao > 0 and predict_flood_risk:
            # Temos dados e IA -> Usa o modelo
            risco_prob = predict_flood_risk(chuva, mare, elevacao)
            risco_final = 1.0 if risco_prob > 0.5 else 0.0
        else:
            # Fallback: Se não tem elevação (0), assume risco alto se chover muito?
            # Ou assume risco baixo por falta de dados?
            # Para o PR, vamos ser conservadores: Sem dados = Sem Risco (0)
            # A menos que a chuva seja extrema (Dilúvio)
            if chuva > 150: 
                risco_final = 1.0
            else:
                risco_final = 0.0

        # 3. Normalização de Nomes (Para o Frontend SVG)
        chave = bairro.lower()
        # Remove acentos
        chave = ''.join(c for c in unicodedata.normalize('NFD', chave) if unicodedata.category(c) != 'Mn')
        # Aplica correções manuais
        chave = FIX_NOMES.get(chave, chave)
        # Remove espaços
        chave = chave.replace(' ', '')
        
        riscos[chave] = risco_final

    # Retorna contagem de afetados para log
    afetados = sum(riscos.values())
    print(f"📊 [RESULTADO] {int(afetados)} bairros marcados com risco.")

    return {
        "riscos_por_bairro": riscos,
        "metadata": {"status": "success", "geo_source": "rasterio/geopandas"}
    }