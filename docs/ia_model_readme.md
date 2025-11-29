
# 📖 README do Motor de Previsão de Risco de Enchentes (Random Forest + FastAPI)

Este projeto demonstra como treinar um modelo de Machine Learning (**Random Forest Regressor**) usando dados climáticos do Kaggle e, em seguida, como utilizá-lo dentro de uma API em FastAPI para prever o risco de enchente nos bairros de Belém.

-----

## 1. ⚙️ Pré-requisitos e Instalação

Para executar este projeto, é necessário ter **Python 3.10+** e instalar as seguintes dependências:

```bash
pip install pandas scikit-learn joblib numpy kagglehub fastapi uvicorn
```

-----

## 2. 📂 Estrutura do Projeto

O projeto é organizado em três camadas principais:

- **machine_learning/train_model.py** – Treina o modelo e salva o artefato.  
- **use_model.py** – Carrega o modelo salvo e faz previsões individuais.  
- **main.py** – API FastAPI que usa a IA + regras de negócio + elevação dos bairros.  
- **machine_learning/artifacts/random_forest_flood_model.joblib** – Modelo treinado.

Arquivos do front-end:

- **index.html**, **about.html**, **mapa.html**  
- **script.js**, **style.css**  
- **assets/** (logo EGUA.ia, mapa SVG, etc.)

-----

## 3. Como Usar

### Passo 1 – Treinar o modelo

```bash
python machine_learning/train_model.py
```

Após o treinamento, o artefato será salvo em:

```
machine_learning/artifacts/random_forest_flood_model.joblib
```

### Passo 2 – Testar o modelo

```bash
python use_model.py
```

### Passo 3 – Iniciar a API

```bash
uvicorn main:app --reload
```

A API estará disponível em:

```
POST /prever_risco
```

Exemplo de requisição:

```json
{
  "Rainfall_mm": 80.0,
  "WaterLevel_m": 3.6
}
```

-----

## 4. Personalização do use_model.py

Para testar valores manualmente:

```python
resultado = predict_flood_risk(90.0, 3.8, 12.0)
```

A ordem correta é:

1. Rainfall_mm  
2. WaterLevel_m  
3. Elevation_m  

-----

## 5. 🖥️ Integração com o Front-end EGUA.ia

O EGUA.ia possui um front-end completo em HTML, CSS e JavaScript que consome diretamente o endpoint da API FastAPI para exibir:

- O mapa oficial dos bairros de Belém (SVG)  
- As cores de risco (Baixo / Médio / Alto)  
- Tooltip com nome do bairro  
- Busca por bairro  
- Interface de entrada para chuva e maré

### Comunicação com o backend

O front-end envia ao backend:

```javascript
fetch("https://egua-ia-cop30.onrender.com/prever_risco", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        Rainfall_mm: parseFloat(document.getElementById("input-chuva").value),
        WaterLevel_m: parseFloat(document.getElementById("input-mare").value)
    })
})
```

O backend responde um JSON no formato:

```json
{
  "Jurunas": {
    "risco": 0.87,
    "elevacao_media": 4.0,
    "classificacao": "Alto"
  },
  "Nazaré": {
    "risco": 0.12,
    "elevacao_media": 13.0,
    "classificacao": "Baixo"
  }
}
```

### Como o mapa é pintado

No arquivo **script.js**, a função abaixo colore automaticamente cada bairro:

```javascript
window.applyRiskMap = function(risks) {
    const LIMITE_RISCO_ALTO = 0.75;
    const LIMITE_RISCO_MEDIO = 0.45;

    Object.entries(risks || {}).forEach(([bairroNome, data]) => {
        const idSVG = normalizeString(bairroNome);
        const el = document.getElementById(idSVG);

        if (el) {
            el.classList.remove("risco-alto","risco-medio","risco-baixo");

            if (data.risco > LIMITE_RISCO_ALTO) el.classList.add("risco-alto");
            else if (data.risco > LIMITE_RISCO_MEDIO) el.classList.add("risco-medio");
            else el.classList.add("risco-baixo");
        }
    });
};
```

### Como rodar o front localmente

Basta abrir os arquivos:

- `index.html` – Tela inicial de inputs  
- `mapa.html` – Tela com o mapa colorido  
- `about.html` – Página institucional do projeto

Se quiser rodar com servidor local:

```bash
python -m http.server 8080
```

E acessar:

```
http://localhost:8080/index.html
```

-----

## 6. 🎯 Resumo Final

- **Back-end (FastAPI)** → Previsão de risco + regras de negócio  
- **IA (Random Forest)** → Probabilidade base por bairro  
- **Front-end (HTML/CSS/JS)** → Interface visual + mapa interativo de Belém  
- **Objetivo** → Fornecer previsões acessíveis e visuais para a população de Belém

O EGUA.ia integra ciência, IA, design e utilidade pública em uma solução completa. 🌧️🌎

