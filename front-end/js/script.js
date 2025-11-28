/*
 * =========================================
 * EGUA.ia - SCRIPT PRINCIPAL
 * =========================================
 */

/**
 * ZONA 1: DADOS E CONFIGURAÇÃO
 * Dicionário para mapear IDs do SVG para Nomes Bonitos na tela.
 */
const nomesBonitos = {
    "curioutinga": "Curió-Utinga",
    "saobraz": "São Brás",
    "terrafirme": "Terra Firme",
    "aguaslindas": "Águas Lindas",
    "valdecaes": "Val-de-Cans",
    "mangueirao": "Mangueirão",
    "bengui": "Benguí",
    "coqueiro": "Coqueiro",
    "marambaia": "Marambaia",
    "souza": "Souza",
    "jurunas": "Jurunas",
    "cremacao": "Cremação",
    "condor": "Condor",
    "guama": "Guamá",
    "canudos": "Canudos",
    "marco": "Marco",
    "pedreira": "Pedreira",
    "sacramenta": "Sacramenta",
    "telegrafo": "Telégrafo",
    "umarizal": "Umarizal",
    "nazare": "Nazaré",
    "reduto": "Reduto",
    "cidadevelha": "Cidade Velha",
    "batistacampos": "Batista Campos",
    "campina": "Campina",
    "saoclemente": "São Clemente",
    "pratinha": "Pratinha",
    "tapana": "Tapanã",
    "parqueverde": "Parque Verde",
    "una": "Una",
    "castanheira": "Castanheira",
    "guanabara": "Guanabara",
    "universitario": "Universitário",
    "paracuri": "Paracuri",
    "parqueguajara": "Parque Guajará",
    "tenone": "Tenoné",
    "cruzeiro": "Cruzeiro",
    "pontagrossa": "Ponta Grossa",
    "agulha": "Agulha",
    "campinadeicoaraci": "Campina de Icoaraci",
    "maracacuera": "Maracacuera",
    "aguasnegras": "Águas Negras",
    "maracangalha": "Maracangalha",
    "miramar": "Miramar",
    "barreiro": "Barreiro",
    "fatima": "Fátima"
};

/**
 * =======================================================
 * ZONA 2: FUNÇÕES AUXILIARES (FERRAMENTAS)
 * =======================================================
 */

/**
 * Normaliza strings para igualar o nome da API com o ID do SVG.
 * Ex: "São Brás" -> "saobraz"
 */
function normalizeString(str) {
    if (!str) return "";

    let normalized = str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/ /g, "") // Remove espaços
        .replace(/-/g, ""); // Remove hífens

    // Correções manuais para inconsistências específicas
    const corrections = {
        "valdecans": "valdecaes",
        "saobras": "saobraz"
    };

    return corrections[normalized] || normalized;
}

/**
 * Formata o ID técnico para um nome apresentável.
 * Usa o dicionário global ou apenas capitaliza a primeira letra.
 */
function getNomeFormatado(id) {
    return nomesBonitos[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

/**
 * Função Principal: Pinta o mapa com base nos dados de risco.
 * Recebe o objeto de riscos da API.
 */
window.applyRiskMap = function(risks) {
    const bairrosGroup = document.getElementById('bairros');
    const LIMITE_RISCO_ALTO = 0.75;
    const LIMITE_RISCO_MEDIO = 0.45;
    
    // Segurança: Se o SVG não carregou, para aqui.
    if (!bairrosGroup) return;

    Object.entries(risks || {}).forEach(([bairroNomeCompleto, data]) => {
        // 1. Acha o elemento no SVG
        const idSVG = normalizeString(bairroNomeCompleto);
        const el = document.getElementById(idSVG);
        
        if (el) {
            // 2. Limpa o estado anterior (faxina)
            el.classList.remove('risco-alto', 'risco-medio', 'risco-baixo');
            
            // 3. Aplica a nova cor baseada no número
            const risco = data.risco; 
            
            if (risco > LIMITE_RISCO_ALTO) {
                el.classList.add('risco-alto');
            } else if (risco > LIMITE_RISCO_MEDIO) {
                el.classList.add('risco-medio');
            } else {
                el.classList.add('risco-baixo');
            }
        }
    });
};

/* =======================================================
   ZONA 3: INICIALIZAÇÃO (EVENT LISTENERS)
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. MENU LATERAL (Todas as Páginas) --- */
    const menuButton = document.getElementById('btn-menu');
    const appMenu = document.getElementById('app-menu');
    const appMenuClose = document.getElementById('app-menu-close');

    if (menuButton && appMenu) {
        menuButton.addEventListener('click', () => appMenu.classList.add('open'));
        appMenuClose.addEventListener('click', () => appMenu.classList.remove('open'));
    }

    /* --- 2. PÁGINA INICIAL (FORMULÁRIO) --- */
    const formPrevisao = document.getElementById('form-previsao');
    
    if (formPrevisao) {
        // A. Botões de Limpar (X)
        document.querySelectorAll('.clear-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById(btn.dataset.target);
                if (input) input.value = '';
            });
        });

        // B. Envio do Formulário (API)
        formPrevisao.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const btnPrever = document.getElementById('btn-prever');
            
            // Feedback Visual
            btnPrever.innerHTML = 'CALCULANDO...';
            btnPrever.disabled = true;

            try {
                const response = await fetch('https://egua-ia-cop30.onrender.com/prever_risco', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        Rainfall_mm: parseFloat(document.getElementById('input-chuva').value), 
                        WaterLevel_m: parseFloat(document.getElementById('input-mare').value)
                    })
                });

                if (!response.ok) throw new Error('Erro na API');

                const riskMap = await response.json();
                
                // Salva no Navegador e Redireciona
                localStorage.setItem('eguaiaRiskMap', JSON.stringify(riskMap));
                window.location.href = 'mapa.html'; 

            } catch (error) {
                console.error(error);
                alert("Erro ao conectar. Tente novamente.");
                btnPrever.innerHTML = 'PREVER RISCO';
                btnPrever.disabled = false;
            }
        });
    }

    /* --- 3. PÁGINA DO MAPA --- */
    const mapaSection = document.getElementById('tela-mapa');
    
    if (mapaSection) {
        
        // A. Carregar Dados Salvos
        const riskData = localStorage.getItem('eguaiaRiskMap');
        if (riskData) {
            window.applyRiskMap(JSON.parse(riskData));
        }

        // B. Botão Voltar
        document.getElementById('btn-voltar')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // C. Lógica do Tooltip (Seguir Mouse)
        const tooltip = document.getElementById('tooltip-mapa'); 
        const paths = document.querySelectorAll('svg path');

        paths.forEach(path => {
            path.addEventListener('mouseenter', function() {
                const nomeDisplay = getNomeFormatado(this.id);
                tooltip.innerText = nomeDisplay;
                tooltip.style.display = 'block';

                this.parentNode.appendChild(this);
            });

            path.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY + 15) + 'px';
            });

            path.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });

        /* --- 4. BUSCADOR DE BAIRROS --- */
        const seletor = document.getElementById('seletor-bairro');
        
        if (seletor) {
            // A. Preencher o Select Automaticamente
            const listaOrdenada = Object.entries(nomesBonitos).sort((a, b) => a[1].localeCompare(b[1]));

            listaOrdenada.forEach(([id, nome]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = nome;
                seletor.appendChild(option);
            });

            // B. Seleção do Usuário
            seletor.addEventListener('change', (e) => {
                const idSelecionado = e.target.value;
                const tooltip = document.getElementById('tooltip-mapa');

                // Limpa destaques anteriores
                document.querySelectorAll('svg path').forEach(p => p.classList.remove('ativo-busca'));
                tooltip.style.display = 'none';

                if (idSelecionado) {
                    const bairroAlvo = document.getElementById(idSelecionado);
                    
                    if (bairroAlvo) {
                        // Acende o bairro
                        bairroAlvo.classList.add('ativo-busca');
                        bairroAlvo.parentNode.appendChild(bairroAlvo);

                        // Mostra o tooltip centralizado no bairro (Opcional, mas útil)
                        const rect = bairroAlvo.getBoundingClientRect();
                        tooltip.innerText = nomesBonitos[idSelecionado];
                        tooltip.style.display = 'block';
                        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
                    }
                }
            });
        }
    }
});