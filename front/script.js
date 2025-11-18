/*
 * =========================================
 * EGUA.ia - SCRIPT PRINCIPAL (v2 Refatorado)
 * =========================================
 * * Este arquivo controla a lógica de TODAS as páginas.
 * 1. Controla o menu de navegação.
 * 2. Controla o formulário da 'index.html'.
 * 3. Controla a pintura do mapa na 'mapa.html'.
 */

/**
 * -------------------------------------
 * ZONA 1: FUNÇÕES AUXILIARES GLOBAIS
 * -------------------------------------
 * Funções que podem ser chamadas de qualquer lugar.
 */

/**
 * Converte o JSON de risco (ex: {Jurunas: 0.8})
 * para um JSON de classe (ex: {Jurunas: 'alto'})
 * que o nosso CSS entende.
 */
// Define a função 'classificarRisco', que aceita 'riskMap'.
function classificarRisco(riskMap) {
    // Declara um objeto vazio 'classificado'.
    const classificado = {};
    // Itera sobre cada par [key, value] do objeto 'riskMap'.
    for (const [key, value] of Object.entries(riskMap)) {
        // SE 'value' for maior que 0.7...
        if (value > 0.7) {
            // ...define a propriedade 'key' em 'classificado' como 'alto'.
            classificado[key] = 'alto';
        // SENÃO, SE 'value' for maior que 0.4...
        } else if (value > 0.4) {
            // ...define a propriedade 'key' em 'classificado' como 'medio'.
            classificado[key] = 'medio';
        // SENÃO (para todos os outros casos)...
        } else {
            // ...define a propriedade 'key' em 'classificado' como 'baixo'.
            classificado[key] = 'baixo';
        }
    // Fecha o bloco do loop 'for'.
    }
    // Retorna o objeto 'classificado' preenchido.
    return classificado;
// Fecha o bloco da função.
}

/**
 * Aplica as classes de risco (ex: 'zone-alto') aos
 * polígonos (paths) do SVG.
 * Esta função é chamada pela lógica da 'mapa.html'.
 */
// Define uma função global 'applyRiskMap', que aceita 'risks'.
window.applyRiskMap = function(risks) {
    // Busca o elemento com ID 'bairros' e armazena em 'bairrosGroup'.
    const bairrosGroup = document.getElementById('bairros');
    // SE 'bairrosGroup' não for encontrado...
    if (!bairrosGroup) {
        // ...exibe um erro no console.
        console.error("Não foi possível achar o grupo <g id='bairros'> no SVG.");
        // ...interrompe a função.
        return;
    }

    // Busca todos os '<path>' dentro de 'bairrosGroup'.
    // Para cada ('forEach') path ('p')...
    bairrosGroup.querySelectorAll('path').forEach(p => {
        // ...remove as classes de 'p'.
        p.classList.remove('zone-alto', 'zone-medio', 'zone-baixo');
    // Fecha o loop 'forEach'.
    });

    // Itera sobre cada par [id, level] do objeto 'risks' (ou de um objeto vazio "{}" se 'risks' for nulo).
    Object.entries(risks || {}).forEach(([id, level]) => {
        // Busca o elemento pelo 'id' (ex: "jurunas") e armazena em 'el'.
        const el = document.getElementById(id);
        // SE 'el' não for encontrado...
        if (!el) {
            // ...exibe um aviso no console.
            console.warn(`Bairro não encontrado no SVG: ${id}`);
            // ...pula para a próxima iteração do loop.
            return;
        }
        
        // SE 'level' for 'alto', adiciona a classe 'zone-alto' a 'el'.
        if (level === 'alto') el.classList.add('zone-alto');
        // SENÃO, SE 'level' for 'medio', adiciona a classe 'zone-medio' a 'el'.
        else if (level === 'medio') el.classList.add('zone-medio');
        // SENÃO, SE 'level' for 'baixo', adiciona a classe 'zone-baixo' a 'el'.
        else if (level === 'baixo') el.classList.add('zone-baixo');
    // Fecha o loop 'forEach'.
    });
// Fecha o bloco da função.
}

/**
 * -----------------------------------------------
 * ZONA 2: LÓGICA PRINCIPAL (QUANDO A PÁGINA CARREGA)
 * -----------------------------------------------
 * O 'DOMContentLoaded' espera o HTML estar pronto.
 */
// Adiciona um "ouvinte" ao documento para o evento 'DOMContentLoaded' (HTML pronto).
// Executa a função anônima '() => { ... }' quando o evento disparar.
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica do Menu (Comum a todas as páginas) ---
    // Busca o elemento com ID 'btn-menu' e armazena em 'menuButton'.
    const menuButton = document.getElementById('btn-menu');
    // Busca o elemento com ID 'app-menu' e armazena em 'appMenu'.
    const appMenu = document.getElementById('app-menu');
    // Busca o elemento com ID 'app-menu-close' e armazena em 'appMenuClose'.
    const appMenuClose = document.getElementById('app-menu-close');

    // Define a constante 'openMenu' como uma função que adiciona a classe 'open' a 'appMenu'.
    const openMenu = () => { if (appMenu) appMenu.classList.add('open'); }
    // Define a constante 'closeMenu' como uma função que remove a classe 'open' de 'appMenu'.
    const closeMenu = () => { if (appMenu) appMenu.classList.remove('open'); }

    // SE 'menuButton' existir...
    if (menuButton) {
        // ...adiciona um "ouvinte" de 'click' a ele.
        menuButton.addEventListener('click', (e) => {
            // Impede a ação padrão do clique.
            e.preventDefault();
            // SE 'appMenu' existir E 'appMenu' contiver a classe 'open'...
            if (appMenu && appMenu.classList.contains('open')) closeMenu();
            // SENÃO...
            else openMenu();
        // Fecha o bloco do "ouvinte".
        });
    }
    // SE 'appMenuClose' existir...
    if (appMenuClose) {
        // ...adiciona um "ouvinte" de 'click' a ele, que chama 'closeMenu'.
        appMenuClose.addEventListener('click', closeMenu);
    }
    // Adiciona um "ouvinte" de 'click' ao documento inteiro.
    document.addEventListener('click', (e) => {
        // SE 'appMenu' não existir OU 'appMenu' não contiver a classe 'open', interrompe a função.
        if (!appMenu || !appMenu.classList.contains('open')) return;
        // Armazena o alvo do clique em 'target'.
        const target = e.target;
        // SE 'appMenu' NÃO contiver o 'target' E 'menuButton' NÃO contiver o 'target'...
        if (!appMenu.contains(target) && !menuButton.contains(target)) {
            // ...chama 'closeMenu'.
            closeMenu();
        }
    // Fecha o bloco do "ouvinte".
    });

    // --- Lógica dos Tooltips (Dicas Flutuantes) ---
    // Declara 'tooltip' buscando o elemento com ID 'map-tooltip'.
    let tooltip = document.getElementById('map-tooltip');
    // SE 'tooltip' não existir...
    if (!tooltip) {
        // ...cria um novo elemento 'div'.
        tooltip = document.createElement('div');
        // ...define o ID do novo elemento como 'map-tooltip'.
        tooltip.id = 'map-tooltip';
        // ...anexa o novo elemento 'tooltip' ao 'body' do documento.
        document.body.appendChild(tooltip);
    }
    // Define a constante 'showTooltip' como uma função que aceita 'text', 'x', e 'y'.
    const showTooltip = (text, x, y) => {
        // Define o texto de 'tooltip' como 'text'.
        tooltip.textContent = text;
        // Define o 'left' (posição X) do estilo de 'tooltip'.
        tooltip.style.left = (x + 10) + 'px'; // 10px à direita do mouse
        // Define o 'top' (posição Y) do estilo de 'tooltip'.
        tooltip.style.top = (y + 10) + 'px'; // 10px abaixo do mouse
        // Define o 'display' do estilo de 'tooltip' como 'block' (torna visível).
        tooltip.style.display = 'block';
    // Fecha o bloco da função 'showTooltip'.
    };
    // Define a constante 'hideTooltip' como uma função.
    const hideTooltip = () => {
        // Define o 'display' do estilo de 'tooltip' como 'none' (torna invisível).
        tooltip.style.display = 'none';
    // Fecha o bloco da função 'hideTooltip'.
    };


    // =======================================================
    // --- LÓGICA DA PÁGINA INICIAL (index.html) ---
    // =======================================================
    // Busca o elemento com ID 'form-previsao' e armazena em 'formPrevisao'.
    const formPrevisao = document.getElementById('form-previsao');
    // SE 'formPrevisao' existir (estamos na 'index.html')...
    if (formPrevisao) {
        
        // --- Botões de Limpar ---
        // Busca todos os elementos com classe '.clear-btn'.
        // Para cada ('forEach') botão ('btn')...
        document.querySelectorAll('.clear-btn').forEach(btn => {
            // ...adiciona um "ouvinte" de 'click' a ele.
            btn.addEventListener('click', () => {
                // Pega o valor do atributo 'data-target' do botão.
                const targetId = btn.getAttribute('data-target');
                // Busca o elemento pelo 'targetId' (ex: 'input-chuva').
                const input = document.getElementById(targetId);
                // SE 'input' existir...
                if (input) { 
                    // ...define o valor de 'input' como vazio ('').
                    input.value = ''; 
                    // ...coloca o foco do cursor em 'input'.
                    input.focus(); 
                }
            // Fecha o bloco do "ouvinte" de clique.
            });
        // Fecha o loop 'forEach'.
        });

        // --- Lógica de Envio do Formulário ---
        // Adiciona um "ouvinte" ao 'formPrevisao' para o evento 'submit'.
        // A função é 'async' (assíncrona) e aceita o evento 'e'.
        formPrevisao.addEventListener('submit', async (e) => {
            // Impede o comportamento padrão de 'submit' (recarregar a página).
            e.preventDefault(); 

            // Busca o elemento com ID 'btn-prever' e armazena em 'btnPrever'.
            const btnPrever = document.getElementById('btn-prever');
            // Busca o elemento com ID 'input-chuva' e armazena em 'inputChuva'.
            const inputChuva = document.getElementById('input-chuva');
            // Busca o elemento com ID 'input-mare' e armazena em 'inputMare'.
            const inputMare = document.getElementById('input-mare');

            // Pega o valor de 'inputChuva', converte para número (float) e armazena em 'chuva'.
            const chuva = parseFloat(inputChuva.value);
            // Pega o valor de 'inputMare', converte para número (float) e armazena em 'mare'.
            const mare = parseFloat(inputMare.value);

            // --- Feedback visual ---
            // Define o texto de 'btnPrever' para 'CALCULANDO...'.
            btnPrever.textContent = 'CALCULANDO...';
            // Desabilita 'btnPrever'.
            btnPrever.disabled = true;

            // Inicia um bloco 'try' para capturar erros.
            try {
                // Inicia uma requisição 'fetch' (busca) assíncrona.
                // 'await' pausa a função até a requisição terminar.
                // O alvo é o arquivo local 'mock_risco.json'.
                // O método é 'GET' (ler dados).
                const response = await fetch('http://127.0.0.1:8000/prever_risco_mapa', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					Rainfall_mm: chuva, // A variável 'chuva' do formulário
					WaterLevel_m: mare  // A variável 'mare' do formulário
				})
			});

                // SE a 'response' (resposta) não estiver 'ok' (ex: erro 404)...
                if (!response.ok) {
                    // ...lança ('throw') um novo Erro com uma mensagem.
                    throw new Error(`Falha na API: ${response.statusText}`);
                }

                // ... (dentro do 'try' do formulário)
                // 2. Pega o JSON da resposta (A "Caixa Térmica")
                const responseData = await response.json(); 
                
                // 2.5. ABRE A CAIXA! Pega só o mapa de dentro.
                const riskMap = responseData.riscos_por_bairro; // <-- ABRIU A CAIXA
                
                console.log("API Respondeu:", riskMap);


                // Acessa o 'localStorage' (armazenamento do navegador).
                // Grava um item 'eguaiaRiskMap'.
                // 'JSON.stringify(riskMap)' converte o objeto 'riskMap' de volta para texto.
                localStorage.setItem('eguaiaRiskMap', JSON.stringify(riskMap));

                // Redireciona o navegador do usuário para 'mapa.html'.
                window.location.href = 'mapa.html';

            // Fecha o bloco 'try'.
            // Inicia o bloco 'catch' se o 'try' falhar, capturando o 'error'.
            } catch (error) {
                // Exibe o 'error' no console.
                console.error("Erro ao prever risco:", error);
                // Exibe um alerta 'alert' para o usuário.
                alert("Erro ao conectar com o servidor. Tente novamente.");
                // --- Devolve o botão ao normal ---
                // Define o texto de 'btnPrever' de volta para 'PREVER RISCO'.
                btnPrever.textContent = 'PREVER RISCO';
                // Reabilita 'btnPrever'.
                btnPrever.disabled = false;
            // Fecha o bloco 'catch'.
            }
        // Fecha o bloco do "ouvinte" de 'submit'.
        });
    // Fecha o bloco 'if (formPrevisao)'.
    }


    // =======================================================
    // --- LÓGICA DA PÁGINA DO MAPA (mapa.html) ---
    // =======================================================
    // Busca o elemento com ID 'mapa-container' e armazena em 'mapaContainer'.
    const mapaContainer = document.getElementById('tela-mapa');
    // SE 'mapaContainer' existir (estamos na 'mapa.html')...
    if (mapaContainer) {
        
        // --- Botão Voltar ---
        // Busca o elemento com ID 'btn-voltar'.
        const btnVoltar = document.getElementById('btn-voltar');
        // SE 'btnVoltar' existir...
        if (btnVoltar) {
            // ...adiciona um "ouvinte" de 'click' a ele.
            btnVoltar.addEventListener('click', () => {
                // Redireciona o navegador do usuário para 'index.html'.
                window.location.href = 'index.html';
            // Fecha o bloco do "ouvinte".
            });
        // Fecha o bloco 'if (btnVoltar)'.
        }

        // --- Lógica de Pintar o Mapa ---
        // Lê o item 'eguaiaRiskMap' do 'localStorage'.
        // Armazena o texto (string) em 'riskData'.
        const riskData = localStorage.getItem('eguaiaRiskMap');

        // SE 'riskData' (o texto) existir...
        if (riskData) {
            // ...exibe uma mensagem no console.
            console.log("Dados de risco encontrados!", riskData);
            // Converte o texto 'riskData' de volta para um objeto JSON 'riskMap'.
            const riskMap = JSON.parse(riskData);
            
            // Chama a função 'classificarRisco' (da ZONA 1).
            // Passa 'riskMap' (números) e recebe 'riskMapClassificado' (textos 'alto'/'medio'/'baixo').
            const riskMapClassificado = classificarRisco(riskMap);
            
            // Chama a função global 'applyRiskMap' (da ZONA 1).
            // Passa 'riskMapClassificado' (os textos) para pintar o SVG.
            window.applyRiskMap(riskMapClassificado);

            // Remove o item 'eguaiaRiskMap' do 'localStorage' (limpa a "ponte").
            localStorage.removeItem('eguaiaRiskMap');

        // SENÃO (se 'riskData' for nulo)...
        } else {
            // ...exibe um aviso no console.
            console.warn("Nenhum dado de risco encontrado. Voltando ao início.");
            // Exibe um alerta 'alert' para o usuário.
            alert("Não há dados de simulação. Por favor, inicie uma nova previsão.");
            // Redireciona o navegador do usuário para 'index.html'.
            window.location.href = 'index.html';
        // Fecha o bloco 'if/else'.
        }

        // --- Ativar Tooltips no SVG ---
        // Busca o elemento com ID 'bairros' e armazena em 'bairrosGroup'.
        const bairrosGroup = document.getElementById('bairros');
        // SE 'bairrosGroup' existir...
        if (bairrosGroup) {
            // ...busca todos os '<path>' que tenham um atributo 'id'.
            // Para cada ('forEach') 'path' encontrado...
            bairrosGroup.querySelectorAll('path[id]').forEach(path => {
                // ...acessa o estilo de 'path' e define 'cursor' como 'pointer' (mãozinha).
                path.style.cursor = 'pointer';
                // Pega o 'id' de 'path' (ex: "terra_firme").
                // Troca ('replace') todos os '_' (underscores) por ' ' (espaços).
                // Armazena o resultado (ex: "terra firme") em 'name'.
                const name = path.id.replace(/_/g, ' ');
                
                // Adiciona um "ouvinte" de 'mousemove' (mouse movendo sobre) a 'path'.
                // 'ev' contém os dados do evento (como posição do mouse 'ev.clientX').
                // Chama 'showTooltip' passando o 'name' e a posição do mouse.
                path.addEventListener('mousemove', (ev) => showTooltip(name, ev.clientX, ev.clientY));
                // Adiciona um "ouvinte" de 'mouseleave' (mouse saindo) a 'path'.
                // Chama 'hideTooltip' (para esconder a dica).
                path.addEventListener('mouseleave', hideTooltip);
            // Fecha o loop 'forEach'.
            });
        // Fecha o bloco 'if (bairrosGroup)'.
        }
    // Fecha o bloco 'if (mapaContainer)'.
    }

// Fecha o bloco do "ouvinte" 'DOMContentLoaded'.
});