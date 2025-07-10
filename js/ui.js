// js/ui.js

import { STRATEGIES } from './strategies.js';
import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal } from './modals.js';
import { loadAndOpenForEditing } from './handlers.js';
import { isAndroid, isIOS } from './utils.js';

// ... (as funções getIconForLabel, createChecklistItem, etc., permanecem inalteradas) ...
function getIconForLabel(labelText) { /* ... */ }
function createChecklistItem(check, data) { /* ... */ }
function createInputItem(input, data) { /* ... */ }
function createRadioGroup(radioInfo, data) { /* ... */ }
export function generateDynamicChecklist(container, phases, data = {}) { /* ... */ }
export function populateStrategySelect() { /* ... */ }


export function createTradeCard(trade) {
    const card = document.createElement('div');
    card.className = 'trade-card';
    card.dataset.tradeId = trade.id;

    const assetName = trade.data.asset;
    const tradingViewSymbol = `BINANCE:${assetName}`;

    card.innerHTML = `
        <button class="card-edit-btn">Editar</button>
        <h3>${assetName}</h3>
        <p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
        <p><strong>Status:</strong> ${trade.data.status}</p>
        <p><strong>Notas:</strong> ${trade.data.notes || ''}</p>
    `;

    const imageUrlToShow = trade.data.imageUrl;
    if (imageUrlToShow) {
        const img = document.createElement('img');
        img.src = imageUrlToShow;
        img.className = 'card-screenshot';
        img.alt = `Gráfico de ${assetName}`;
        card.appendChild(img);
    }
    
    const chartContainer = document.createElement('div');
    chartContainer.className = 'mini-chart-container'; // Reutilizamos a classe CSS
    chartContainer.id = `advanced-chart-${trade.id}`;
    card.appendChild(chartContainer);

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'card-actions';

    const fullChartLink = document.createElement('a');
    fullChartLink.href = `https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}`;
    fullChartLink.className = 'btn edit-btn';
    fullChartLink.textContent = 'Gráfico';
    fullChartLink.target = '_blank';
    fullChartLink.rel = 'noopener noreferrer';
    actionsWrapper.appendChild(fullChartLink);
    
    const summaryBtn = document.createElement('button');
    summaryBtn.className = 'btn btn-summary';
    summaryBtn.textContent = 'Ver Gráfico'; // Texto alterado
    summaryBtn.addEventListener('click', () => {
        // Passamos o objeto 'trade' inteiro para a função ter acesso aos dados
        toggleAdvancedChart(trade, summaryBtn);
    });
    actionsWrapper.appendChild(summaryBtn);

    let actionButton;
    if (trade.data.status === 'POTENTIAL') {
        actionButton = document.createElement('button');
        actionButton.className = 'trigger-btn btn-potential';
        actionButton.textContent = 'Validar Setup (Armar)';
        actionButton.addEventListener('click', () => openArmModal(trade));
    } else if (trade.data.status === 'ARMED') {
        card.classList.add('armed');
        actionButton = document.createElement('button');
        actionButton.className = 'trigger-btn btn-armed';
        actionButton.textContent = 'Executar Gatilho';
        actionButton.addEventListener('click', () => openExecModal(trade));
    } else if (trade.data.status === 'LIVE') {
        card.classList.add('live');
        const details = trade.data.executionDetails;
        if (details) { 
            const p = document.createElement('p'); 
            p.innerHTML = `<strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}`; 
            card.appendChild(p); 
        }
        actionButton = document.createElement('button');
        actionButton.className = 'trigger-btn btn-live';
        actionButton.textContent = 'Fechar Trade';
        actionButton.addEventListener('click', () => openCloseTradeModal(trade));
    }
    
    if (actionButton) {
        actionsWrapper.appendChild(actionButton);
    }

    card.appendChild(actionsWrapper);
    
    card.querySelector('.card-edit-btn').addEventListener('click', (e) => { e.stopPropagation(); loadAndOpenForEditing(trade.id); });
    return card;
}

// --- FUNÇÃO PARA MAPEAMENTO DE TIMEFRAME ---
function mapTimeframeToTV(timeframe) {
    if (!timeframe) return '60'; // Default para 1 Hora
    const tf = timeframe.toLowerCase();
    if (tf.includes('1d') || tf.includes('diário')) return 'D';
    if (tf.includes('4h')) return '240';
    if (tf.includes('1h')) return '60';
    if (tf.includes('15m')) return '15';
    if (tf.includes('5m')) return '5';
    return '60'; // Fallback
}

// --- FUNÇÃO ATUALIZADA PARA O GRÁFICO AVANÇADO ---
function toggleAdvancedChart(trade, button) {
    const chartContainer = document.getElementById(`advanced-chart-${trade.id}`);
    if (!chartContainer) return;

    const isVisible = chartContainer.classList.contains('visible');

    if (isVisible) {
        chartContainer.innerHTML = '';
        chartContainer.classList.remove('visible');
        button.textContent = 'Ver Gráfico';
    } else {
        button.textContent = 'A Carregar...';

        // Lógica para encontrar o timeframe de análise nos dados do trade
        let analysisTimeframe = '1h'; // Default
        if (trade.data.potentialSetup) {
            const potentialData = trade.data.potentialSetup;
            // Procura por uma chave que inclua '-tf' (ex: 'pot-rb-tf')
            const tfKey = Object.keys(potentialData).find(key => key.includes('-tf'));
            if (tfKey && potentialData[tfKey]) {
                analysisTimeframe = potentialData[tfKey];
            }
        }
        const tvInterval = mapTimeframeToTV(analysisTimeframe);

        // Cria o widget com as suas configurações específicas
        new TradingView.widget({
            "container_id": chartContainer.id,
            "autosize": true,
            "symbol": `BINANCE:${trade.data.asset}`,
            "interval": tvInterval,
            "timezone": "Etc/UTC",
            "theme": "dark", // Tema escuro
            "style": "1", // 1 = Velas
            "locale": "pt",
            "toolbar_bg": "#f1f5f9",
            "enable_publishing": false,
            "hide_top_toolbar": true, // Esconde a barra de topo
            "hide_volume": true, // Esconde o volume
            "save_image": false,
            "allow_symbol_change": false, // Impede a mudança de símbolo
            "details": true,
            "studies": [
                { "id": "MovingAverageExponential@tv-basicstudies", "inputs": { "length": 50 } },
                { "id": "MovingAverageExponential@tv-basicstudies", "inputs": { "length": 200 } }
            ]
        });

        chartContainer.classList.add('visible');
        button.textContent = 'Esconder Gráfico';
    }
}

export function displayTrades(trades) {
    // A função displayTrades permanece inalterada
    if (!potentialTradesContainer) return;
    potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma oportunidade potencial.</p>';
    armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
    liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
    let potentialCount = 0, armedCount = 0, liveCount = 0;
    trades.forEach(trade => {
        const card = createTradeCard(trade); 
        if (trade.data.status === 'POTENTIAL') { if (potentialCount === 0) potentialTradesContainer.innerHTML = ''; potentialTradesContainer.appendChild(card); potentialCount++; }
        else if (trade.data.status === 'ARMED') { if (armedCount === 0) armedTradesContainer.innerHTML = ''; armedTradesContainer.appendChild(card); armedCount++; }
        else if (trade.data.status === 'LIVE') { if (liveCount === 0) liveTradesContainer.innerHTML = ''; liveTradesContainer.appendChild(card); liveCount++; }
    });
}
