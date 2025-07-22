// js/ui.js - VERSÃO COM CARDS DO DASHBOARD OTIMIZADOS

import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal } from './modals.js';
import { loadAndOpenForEditing } from './handlers.js';
import { getLastCreatedTradeId, setLastCreatedTradeId } from './state.js';

function renderSparkline(containerId, dataSeries) {
    const container = document.getElementById(containerId);
    if (!container || !dataSeries || dataSeries.length < 2) return;
    container.innerHTML = '';
    const firstPrice = dataSeries[0];
    const lastPrice = dataSeries[dataSeries.length - 1];
    const chartColor = lastPrice >= firstPrice ? '#28a745' : '#dc3545';
    const options = {
        series: [{ data: dataSeries }], chart: { type: 'line', height: 40, width: 100, sparkline: { enabled: true }},
        stroke: { curve: 'smooth', width: 2 }, colors: [chartColor],
        tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' }, formatter: (val) => val.toFixed(5) }, marker: { show: false }}
    };
    const chart = new ApexCharts(container, options);
    chart.render();
}

// --- Funções de Geração de Formulário (sem alterações) ---
function getIconForLabel(labelText) {
    const text = labelText.toLowerCase();
    if (text.includes('tendência')) return 'fa-solid fa-chart-line';
    if (text.includes('rsi')) return 'fa-solid fa-wave-square';
    if (text.includes('stochastic') || text.includes('estocástico')) return 'fa-solid fa-arrows-down-to-line';
    if (text.includes('suporte')) return 'fa-solid fa-arrow-down';
    if (text.includes('resistência')) return 'fa-solid fa-arrow-up';
    if (text.includes('fibo')) return 'fa-solid fa-ruler-vertical';
    if (text.includes('volume')) return 'fa-solid fa-database';
    if (text.includes('ema')) return 'fa-solid fa-chart-simple';
    if (text.includes('alarme')) return 'fa-solid fa-bell';
    if (text.includes('preço')) return 'fa-solid fa-dollar-sign';
    if (text.includes('candle')) return 'fa-solid fa-bars-staggered';
    if (text.includes('timeframe')) return 'fa-solid fa-clock';
    if (text.includes('val ')) return 'fa-solid fa-magnet';
    if (text.includes('alvo')) return 'fa-solid fa-crosshairs';
    return 'fa-solid fa-check';
}
function createChecklistItem(item, data) {
    const isRequired = item.required ? 'required' : '';
    const labelText = item.required ? `${item.label} <span class="required-asterisk">*</span>` : item.label;
    const isChecked = data && data[item.id] ? 'checked' : '';
    const element = document.createElement('div');
    element.className = 'checklist-item';
    element.innerHTML = `<i class="${getIconForLabel(item.label)}"></i><input type="checkbox" id="${item.id}" ${isChecked} ${isRequired}><label for="${item.id}">${labelText}</label>`;
    return element;
}
function createInputItem(item, data) {
    const element = document.createElement('div');
    element.className = 'input-item-styled'; 
    const isRequired = item.required ? 'required' : '';
    const labelText = item.required ? `${item.label} <span class="required-asterisk">*</span>` : item.label;
    const value = data && data[item.id] ? data[item.id] : '';
    let fieldHtml = '';
    if (item.type === 'select') {
        const optionsHtml = item.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('');
        fieldHtml = `<select id="${item.id}" ${isRequired} class="input-item-field"><option value="">-- Selecione --</option>${optionsHtml}</select>`;
    } else {
        fieldHtml = `<input type="${item.type}" id="${item.id}" value="${value}" step="any" ${isRequired} class="input-item-field" placeholder="${item.placeholder || ''}">`;
    }
    element.innerHTML = `<i class="${getIconForLabel(item.label)}"></i><div style="flex-grow: 1;"><label for="${item.id}">${labelText}</label>${fieldHtml}</div>`;
    return element;
}
export function generateDynamicChecklist(container, phases, data = {}) {
    container.innerHTML = '';
    if (!phases || phases.length === 0) return;
    phases.forEach(phase => {
        if (!phase || !Array.isArray(phase.items)) return; 
        const phaseDiv = document.createElement('div');
        const titleEl = document.createElement('h4');
        titleEl.textContent = phase.title;
        phaseDiv.appendChild(titleEl);
        phase.items.forEach(item => {
            let element;
            switch (item.type) {
                case 'checkbox': element = createChecklistItem(item, data); break;
                case 'select': case 'text': case 'number': element = createInputItem(item, data); break;
                default: console.warn(`Tipo de item desconhecido: ${item.type}`);
            }
            if (element) phaseDiv.appendChild(element);
        });
        container.appendChild(phaseDiv);
    });
}
export function populateStrategySelect(strategies) {
    if (!addModal.strategySelect) return;
    addModal.strategySelect.innerHTML = '<option value="">-- Selecione uma Estratégia --</option>';
    if (strategies && Array.isArray(strategies)) {
        strategies.forEach(strategy => {
            const option = document.createElement('option');
            option.value = strategy.id;
            option.textContent = strategy.data.name;
            addModal.strategySelect.appendChild(option);
        });
    }
}

// --- LÓGICA DE CRIAÇÃO E EXIBIÇÃO DE CARDS (OTIMIZADA) ---
export function createTradeCard(trade, marketData = {}) {
    const card = document.createElement('div');
    card.className = 'trade-card';
    card.dataset.tradeId = trade.id;
    const assetName = trade.data.asset;
    const tradingViewSymbol = `BINANCE:${assetName}`;
    const assetMarketData = marketData[assetName] || { price: 0, change: 0, sparkline: [] };
    const priceChangeClass = assetMarketData.change >= 0 ? 'positive-pnl' : 'negative-pnl';

    // Aplica classes de status ao card
    if (trade.data.status === 'ARMED') card.classList.add('armed');
    if (trade.data.status === 'LIVE') card.classList.add('live');

    // Botão de ação principal (Armar / Executar / Fechar)
    let mainActionButtonHtml = '';
    let mainActionButtonClass = '';
    let mainActionButtonIcon = '';
    let mainActionButtonTitle = '';

    if (trade.data.status === 'POTENTIAL') {
        mainActionButtonClass = 'action-arm';
        mainActionButtonIcon = 'fa-solid fa-bolt';
        mainActionButtonTitle = 'Validar e Armar Setup';
        mainActionButtonHtml = `<button class="icon-action-btn ${mainActionButtonClass}" data-action="arm" title="${mainActionButtonTitle}"><i class="${mainActionButtonIcon}"></i></button>`;
    } else if (trade.data.status === 'ARMED') {
        mainActionButtonClass = 'action-execute';
        mainActionButtonIcon = 'fa-solid fa-play';
        mainActionButtonTitle = 'Executar Trade';
        mainActionButtonHtml = `<button class="icon-action-btn ${mainActionButtonClass}" data-action="execute" title="${mainActionButtonTitle}"><i class="${mainActionButtonIcon}"></i></button>`;
    } else if (trade.data.status === 'LIVE') {
        mainActionButtonClass = 'action-close';
        mainActionButtonIcon = 'fa-solid fa-stop';
        mainActionButtonTitle = 'Fechar Trade';
        mainActionButtonHtml = `<button class="icon-action-btn ${mainActionButtonClass}" data-action="close" title="${mainActionButtonTitle}"><i class="${mainActionButtonIcon}"></i></button>`;
    }
    
    // Formatação de preço (reutilizado do Market Scanner)
    let formattedPrice;
    if (assetMarketData.price >= 1.0) {
        formattedPrice = assetMarketData.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        formattedPrice = '$' + assetMarketData.price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
    }

    // Geração condicional das notas
    const notesHtml = trade.data.notes 
        ? `<p class="trade-notes">${trade.data.notes}</p>` 
        : '';

    card.innerHTML = `
        <div class="card-top-row">
            <h3 class="asset-title-card"><a href="asset-details.html?symbol=${assetName}" class="asset-link">${assetName}</a></h3>
            <div class="card-top-buttons">
                ${mainActionButtonHtml}
                <button class="icon-action-btn card-edit-btn" data-action="edit" title="Editar"><i class="fas fa-pencil"></i></button>
            </div>
        </div>
        <p class="strategy-name">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
        
        ${notesHtml}

        <div class="card-market-data">
            <div class="card-sparkline" id="sparkline-card-${trade.id}"></div>
            <div class="card-price-data">
                <div class="card-price">${formattedPrice}</div>
                <div class="${priceChangeClass} price-change-percent">${assetMarketData.change.toFixed(2)}%</div>
            </div>
        </div>
        
        <div class="card-bottom-actions">
            <button class="icon-action-btn action-summary" data-action="toggle-chart" data-symbol="${tradingViewSymbol}" title="Ver gráfico interativo"><i class="fa-solid fa-chart-simple"></i></button>
            <a href="https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}" target="_blank" rel="noopener noreferrer" class="icon-action-btn action-full-chart" title="Abrir no TradingView para análise completa"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
        </div>
    `;
    return card;
}

function toggleAdvancedChart(tradeId, symbol, button) {
    const chartContainer = document.getElementById(`advanced-chart-${tradeId}`);
    if (!chartContainer) return;
    const isVisible = chartContainer.classList.contains('visible');
    if (isVisible) {
        chartContainer.innerHTML = ''; chartContainer.classList.remove('visible');
        button.innerHTML = `<i class="fa-solid fa-chart-simple"></i> <span>Gráfico</span>`;
    } else {
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>A Carregar...</span>`;
        const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
        new TradingView.widget({
            "container_id": chartContainer.id, "autosize": true, "symbol": symbol, "interval": "60", "timezone": "Etc/UTC", 
            "theme": currentTheme, "style": "1", "locale": "pt", "hide_side_toolbar": true, "hide_top_toolbar": true, "hide_legend": true,
            "save_image": false, "allow_symbol_change": false
        });
        chartContainer.classList.add('visible');
        button.innerHTML = `<i class="fa-solid fa-eye-slash"></i> <span>Esconder</span>`;
    }
}

let tradesForEventListeners = [];

export function displayTrades(trades, marketData) {
    tradesForEventListeners = trades;
    if (!potentialTradesContainer) return;
    potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum ativo na watchlist.</p>';
    armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
    liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
    let potentialCount = 0, armedCount = 0, liveCount = 0;
    trades.forEach(trade => {
        const card = createTradeCard(trade, marketData); 
        if (trade.data.status === 'POTENTIAL') { if (potentialCount === 0) potentialTradesContainer.innerHTML = ''; potentialTradesContainer.appendChild(card); potentialCount++; }
        else if (trade.data.status === 'ARMED') { if (armedCount === 0) armedTradesContainer.innerHTML = ''; armedTradesContainer.appendChild(card); armedCount++; }
        else if (trade.data.status === 'LIVE') { if (liveCount === 0) liveTradesContainer.innerHTML = ''; liveTradesContainer.appendChild(card); liveCount++; }
    });

    trades.forEach(trade => {
        const assetMarketData = marketData[trade.data.asset];
        if (assetMarketData && assetMarketData.sparkline) {
            renderSparkline(`sparkline-card-${trade.id}`, assetMarketData.sparkline);
        }
    });

    const lastId = getLastCreatedTradeId();
    if (lastId) {
        const newCard = document.querySelector(`.trade-card[data-trade-id="${lastId}"]`);
        if (newCard) {
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newCard.classList.add('new-item-flash');
        }
        setLastCreatedTradeId(null);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.querySelector('.dashboard-columns');
    if (dashboard) {
        dashboard.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;
            const card = button.closest('.trade-card');
            const tradeId = card ? card.dataset.tradeId : null;
            if (!tradeId) return;
            const trade = tradesForEventListeners.find(t => t.id === tradeId);
            if (!trade) return;
            const action = button.dataset.action;
            switch (action) {
                case 'toggle-chart': toggleAdvancedChart(tradeId, button.dataset.symbol, button); break;
                case 'edit': loadAndOpenForEditing(tradeId); break;
                case 'arm': openArmModal(trade); break;
                case 'execute': openExecModal(trade); break;
                case 'close': openCloseTradeModal(trade); break;
            }
        });
    }
});
