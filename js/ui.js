// js/ui.js - VERSÃO COM generateDynamicChecklist CORRIGIDO

import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal } from './modals.js';
import { loadAndOpenForEditing } from './handlers.js';
import { isAndroid, isIOS } from './utils.js';

// --- FUNÇÕES HELPER PARA CRIAR ELEMENTOS DE FORMULÁRIO ---
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

// --- FUNÇÃO PRINCIPAL DE GERAÇÃO DE CHECKLIST (CORRIGIDA) ---
export function generateDynamicChecklist(container, phases, data = {}) {
    container.innerHTML = '';
    if (!phases || phases.length === 0) return;

    phases.forEach(phase => {
        // Verifica se a fase e os itens existem
        if (!phase || !Array.isArray(phase.items)) return; 
        
        const phaseDiv = document.createElement('div');
        const titleEl = document.createElement('h4');
        titleEl.textContent = phase.title;
        phaseDiv.appendChild(titleEl);

        // Itera sobre o array 'items' da nossa nova estrutura de dados
        phase.items.forEach(item => {
            let element;
            switch (item.type) {
                case 'checkbox':
                    element = createChecklistItem(item, data);
                    break;
                case 'select':
                case 'text':
                case 'number':
                    element = createInputItem(item, data);
                    break;
                default:
                    console.warn(`Tipo de item desconhecido: ${item.type}`);
            }
            if (element) {
                phaseDiv.appendChild(element);
            }
        });

        container.appendChild(phaseDiv);
    });
}

// --- OUTRAS FUNÇÕES ---

export function populateStrategySelect(strategies) {
    if (!addModal.strategySelect) return;
    addModal.strategySelect.innerHTML = '<option value="">-- Selecione uma Estratégia --</option>'; // Texto melhorado
    
    // Adiciona uma verificação para garantir que 'strategies' é um array
    if (strategies && Array.isArray(strategies)) {
        strategies.forEach(strategy => {
            const option = document.createElement('option');
            option.value = strategy.id;
            option.textContent = strategy.data.name;
            addModal.strategySelect.appendChild(option);
        });
    }
}

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
    chartContainer.className = 'mini-chart-container';
    chartContainer.id = `advanced-chart-${trade.id}`;
    card.appendChild(chartContainer);

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'card-actions';

    const chartBtn = document.createElement('button');
    chartBtn.className = 'icon-action-btn action-summary';
    chartBtn.innerHTML = `<i class="fa-solid fa-chart-simple"></i> <span>Gráfico</span>`;
    chartBtn.title = "Ver gráfico interativo";
    chartBtn.addEventListener('click', () => {
        toggleAdvancedChart(trade.id, tradingViewSymbol, chartBtn);
    });
    actionsWrapper.appendChild(chartBtn);

    const analysisLink = document.createElement('a');
    analysisLink.href = `https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}`;
    analysisLink.className = 'icon-action-btn action-full-chart';
    analysisLink.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Análise</span>`;
    analysisLink.title = "Abrir no TradingView para análise completa";
    analysisLink.target = '_blank';
    analysisLink.rel = 'noopener noreferrer';
    actionsWrapper.appendChild(analysisLink);

    let mainActionButton;
    if (trade.data.status === 'POTENTIAL') {
        card.classList.remove('armed', 'live');
        mainActionButton = document.createElement('button');
        mainActionButton.className = 'icon-action-btn action-arm';
        mainActionButton.innerHTML = `<i class="fa-solid fa-bolt"></i> <span>Armar</span>`;
        mainActionButton.title = "Validar e Armar Setup";
        mainActionButton.addEventListener('click', () => openArmModal(trade));
    } else if (trade.data.status === 'ARMED') {
        card.classList.add('armed');
        mainActionButton = document.createElement('button');
        mainActionButton.className = 'icon-action-btn action-execute';
        mainActionButton.innerHTML = `<i class="fa-solid fa-play"></i> <span>Executar</span>`;
        mainActionButton.title = "Executar Trade";
        mainActionButton.addEventListener('click', () => openExecModal(trade));
    } else if (trade.data.status === 'LIVE') {
        card.classList.add('live');
        const details = trade.data.executionDetails;
        if (details) { 
            const p = document.createElement('p'); 
            p.innerHTML = `<strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}`; 
            card.appendChild(p); 
        }
        mainActionButton = document.createElement('button');
        mainActionButton.className = 'icon-action-btn action-close';
        mainActionButton.innerHTML = `<i class="fa-solid fa-stop"></i> <span>Fechar</span>`;
        mainActionButton.title = "Fechar Trade";
        mainActionButton.addEventListener('click', () => openCloseTradeModal(trade));
    }
    
    if (mainActionButton) {
        actionsWrapper.appendChild(mainActionButton);
    }

    card.appendChild(actionsWrapper);
    
    card.querySelector('.card-edit-btn').addEventListener('click', (e) => { e.stopPropagation(); loadAndOpenForEditing(trade.id); });
    return card;
}

function toggleAdvancedChart(tradeId, symbol, button) {
    const chartContainer = document.getElementById(`advanced-chart-${tradeId}`);
    if (!chartContainer) return;

    const isVisible = chartContainer.classList.contains('visible');

    if (isVisible) {
        chartContainer.innerHTML = '';
        chartContainer.classList.remove('visible');
        button.innerHTML = `<i class="fa-solid fa-chart-simple"></i> <span>Gráfico</span>`;
    } else {
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>A Carregar...</span>`;
        
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';

        new TradingView.widget({
            "container_id": chartContainer.id,
            "autosize": true,
            "symbol": symbol,
            "interval": "60",
            "timezone": "Etc/UTC",
            "theme": currentTheme,
            "style": "1",
            "locale": "pt",
            "toolbar_bg": "#f1f5f9",
            "enable_publishing": false,
            "hide_side_toolbar": true,
            "hide_top_toolbar": true,
            "hide_legend": true,
            "save_image": false,
            "allow_symbol_change": false
        });

        chartContainer.classList.add('visible');
        button.innerHTML = `<i class="fa-solid fa-eye-slash"></i> <span>Esconder</span>`;
    }
}

export function displayTrades(trades) {
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
