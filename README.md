# 🌊 EGUA.ia - Estratégia Guiada Urbana contra Alagamentos

> **Solução de Inteligência Artificial para monitoramento e previsão de riscos de alagamentos em Belém-PA, desenvolvida no contexto da COP30.**

[![Vercel](https://img.shields.io/badge/Acesse%20o%20Projeto-Ao%20Vivo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://egua-ia-cop-30.vercel.app/)
![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python&logoColor=white)

---

## 📍 Sobre o Projeto

O **EGUA.ia** é uma plataforma preditiva que utiliza **Machine Learning** e análise geoespacial para mitigar os impactos das fortes chuvas na região metropolitana de Belém. 

O projeto cruza dados de **pluviometria**, **tábua de marés** e **relevo topográfico** para identificar zonas de risco em tempo real, auxiliando na tomada de decisão e no planejamento urbano resiliente frente às mudanças climáticas.

Este projeto foi desenvolvido como parte de uma iniciativa de capacitação técnica internacional (Brasil-Canadá) focada em soluções tecnológicas para a **COP30**.

---

## 🔗 Demonstração

A plataforma está implantada e disponível para acesso público:

### [👉 Clique aqui para acessar o EGUA.ia (Live Demo)](https://egua-ia-cop-30.vercel.app/)

---

## 🧠 Como Funciona (Arquitetura)

O sistema opera integrando dados ambientais e processando-os através de um modelo treinado:

1.  **Coleta de Dados (`/data`):**
    * 🌧️ **Pluviometria:** Dados históricos e em tempo real de chuvas.
    * 🌊 **Marés:** Dados da tábua de marés (crítico para Belém).
    * 🗺️ **Geoespacial:** Malha urbana e dados de relevo (`.tif`, `.graphml`).

2.  **Processamento & IA (`/machine_learning`):**
    * Utilizamos um modelo **Random Forest** (`random_forest_flood_model.joblib`) treinado para classificar o risco de alagamento com base nas variáveis ambientais.
    * O script de treinamento (`model_train.py`) processa os dados brutos e gera o artefato do modelo.

3.  **Aplicação Web:**
    * Interface interativa com mapas de calor e alertas para a população.
    * Deploy contínuo via Vercel.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Python 3
* **Machine Learning:** Scikit-Learn (Random Forest)
* **Manipulação de Dados:** Pandas, NumPy
* **Geoespacial:** Rasterio, NetworkX (para malha viária)
* **Front-end:** HTML5, CSS3, JavaScript (Leaflet/Mapas)
* **Deploy:** Vercel

---

## 🚀 Rodando Localmente (Desenvolvedores)

Caso queira executar o código fonte na sua máquina:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/rebecagomesdev/EGUA.ia-COP30.git](https://github.com/rebecagomesdev/EGUA.ia-COP30.git)
    ```

2.  **Instale as dependências:**
    ```bash
    cd back-end
    pip install -r requirements.txt
    ```

3.  **Execute o Backend:**
    ```bash
    python main.py
    ```

---

## 👥 Autores

Projeto desenvolvido por uma equipe multidisciplinar:

* **Rebeca Gomes**
* **Daniel Diniz**
* **Gabriel Gadelha**
* **Javan Almeida**
* **Lucas Costa**
* **Thais Marques**

---

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---
*Desenvolvido com 💚 para a COP30.*
