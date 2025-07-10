// js/ui.js - VERSÃO COM BOTÕES DE ÍCONE ATUALIZADOS NO DASHBOARD

import { STRATEGIES } from './strategies.js';
import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal } from './modals.js';
import { loadAndOpenForEditing } from './handlers.js';
import { isAndroid, isIOS } from './utils.js';

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
function createChecklistItem(check, data) {
    const isRequired = check.required === false ? '' : 'required';
    const labelText = check.required === false ? check.label : `${check.label} <span class="required-asterisk">*</span>`;
    const isChecked = data && data[check.id] ? 'checked' : '';
    const item = document.createElement('div');
    item.className = 'checklist-item';
    item.innerHTML = `<i class="${getIconForLabel(check.label)}"></i><input type="checkbox" id="${check.id}" ${isChecked} ${isRequired}><label for="${check.id}">${labelText}</label>`;
    return item;
}
function createInputItem(input, data) {
    const item = document.createElement('div');
    item.className = 'input-item-styled'; 
    const isRequired = input.required === false ? '' : 'required';
    const labelText = input.required === false ? input.label : `${input.label} <span class="required-asterisk">*</span>`;
    const value = data && data[input.id] ? data[input.id] : '';
    let fieldHtml = '';
    if (input.type === 'select') {
        const optionsHtml = input.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('');
        fieldHtml = `<select id="${input.id}" ${isRequired} class="input-item-field"><option value="">-- Selecione --</option>${optionsHtml}</select>`;
    } else {
        fieldHtml = `<input type="${input.type}" id="${input.id}" value="${value}" step="any" ${isRequired} class="input-item-field" placeholder="${input.placeholder || ''}">`;
    }
    item.innerHTML = `<i class="${getIconForLabel(input.label)}"></i><div style="flex-grow: 1;"><label for="${input.id}">${labelText}</label>${fieldHtml}</div>`;
    return item;
}
function createRadioGroup(radioInfo, data) {
    const group = document.createElement('div');
    group.className = 'radio-group';
    group.innerHTML = `<h4><i class="fa-solid fa-bullseye" style="margin-right: 10px; color: #007bff;"></i><strong>${radioInfo.label}</strong></h4>`;
    const checkedValue = data && data[radioInfo.name];
    radioInfo.options.forEach(opt => {
        const isChecked = checkedValue === opt.id ? 'checked' : '';
        const item = document.createElement('div');
        item.className = 'checklist-item';
        item.innerHTML = `<i class="${getIconForLabel(opt.label)}"></i><input type="radio" id="${opt.id}" name="${radioInfo.name}" value="${opt.id}" ${isChecked} required><label for="${opt.id}">${opt.label}</label>`;
        group.appendChild(item);
    });
    return group;
}
export function generateDynamicChecklist(container, phases, data = {}) {
    container.innerHTML = '';
    if (!phases) return;
    phases.forEach(phase => {
        const phaseDiv = document.createElement('div');
        if (phase.exampleImageUrl) {
            const exampleContainer = document.createElement('div');
            exampleContainer.className = 'example-image-container';
            exampleContainer.innerHTML = `<p>Exemplo Visual:</p><img src="${phase.exampleImageUrl}" alt="Exemplo para ${phase.title}">`;
            exampleContainer.querySelector('img').addEventListener('click', (e) => { e.stopPropagation(); openImageModal(phase.exampleImageUrl); });
            phaseDiv.appendChild(exampleContainer);
        }
        const titleEl = document.createElement('h4');
        titleEl.textContent = phase.title;
        phaseDiv.appendChild(titleEl);
        if (phase.inputs) phase.inputs.forEach(input => phaseDiv.appendChild(createInputItem(input, data)));
        if (phase.checks) phase.checks.forEach(check => phaseDiv.appendChild(createChecklistItem(check, data)));
        if (phase.radios) phaseDiv.appendChild(createRadioGroup(phase.radios, data));
        container.appendChild(phaseDiv);
    });
}
export function populateStrategySelect() {
    if (!addModal.strategySelect) return;
    addModal.strategySelect.innerHTML = '<option value="">-- Selecione --</option>';
    for (const id in STRATEGIES) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = STRATEGIES[id].name;
        addModal.strategySelect.appendChild(option);
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

    // --- BOTÕES DE AÇÃO ATUALIZADOS ---

    // Botão 1: Gráfico (abre o widget no card)
    const chartBtn = document.createElement('button');
    chartBtn.className = 'icon-action-btn action-summary';
    chartBtn.innerHTML = `<i class="fa-solid fa-chart-simple"></i> <span>Gráfico</span>`;
    chartBtn.title = "Ver gráfico interativo";
    chartBtn.addEventListener('click', () => {
        toggleAdvancedChart(trade.id, tradingViewSymbol, chartBtn);
    });
    actionsWrapper.appendChild(chartBtn);

    // Botão 2: Análise (abre o TradingView)
    const analysisLink = document.createElement('a');
    analysisLink.href = `https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}`;
    analysisLink.className = 'icon-action-btn action-full-chart';
    analysisLink.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Análise</span>`;
    analysisLink.title = "Abrir no TradingView para análise completa";
    analysisLink.target = '_blank';
    analysisLink.rel = 'noopener noreferrer';
    actionsWrapper.appendChild(analysisLink);

    // Botão 3: Ação Principal (Armar, Executar, Fechar)
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
        
        new TradingView.widget({
            "container_id": chartContainer.id,
            "autosize": true,
            "symbol": symbol,
            "interval": "60",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "pt",
            "hide_side_toolbar": true,
            "hide_volume": true,
            "studies": [
                "STD;MA%Ribbon",
                "STD;RSI"
            ]
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
