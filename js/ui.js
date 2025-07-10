// js/ui.js

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




// js/ui.js

export function createTradeCard(trade) {
    const card = document.createElement('div');
    card.className = 'trade-card';
    card.dataset.tradeId = trade.id; // Adiciona um ID para referência

    const assetName = trade.data.asset;
    const tradingViewSymbol = `BINANCE:${assetName}`;

    // --- HTML BÁSICO DO CARD ---
    card.innerHTML = `
        <button class="card-edit-btn">Editar</button>
        <h3>${assetName}</h3>
        <p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
        <p><strong>Status:</strong> ${trade.data.status}</p>
        <p><strong>Notas:</strong> ${trade.data.notes || ''}</p>
    `;

    // --- IMAGEM DE SCREENSHOT (se existir) ---
    const imageUrlToShow = trade.data.imageUrl; // Mostra apenas a imagem inicial
    if (imageUrlToShow) {
        const img = document.createElement('img');
        img.src = imageUrlToShow;
        img.className = 'card-screenshot';
        img.alt = `Gráfico de ${assetName}`;
        card.appendChild(img);
    }
    
    // --- CONTENTOR DO MINI-GRÁFICO (escondido por defeito) ---
    const chartContainer = document.createElement('div');
    chartContainer.className = 'mini-chart-container';
    // Damos um ID único a cada contentor para o widget saber onde se desenhar
    chartContainer.id = `mini-chart-${trade.id}`;
    card.appendChild(chartContainer);

    // --- BOTÕES DE AÇÃO ---
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'card-actions';

    // Botão 1: Gráfico Completo
    const fullChartLink = document.createElement('a');
    fullChartLink.href = `https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}`;
    fullChartLink.className = 'btn edit-btn';
    fullChartLink.textContent = 'Gráfico';
    fullChartLink.target = '_blank';
    fullChartLink.rel = 'noopener noreferrer';
    actionsWrapper.appendChild(fullChartLink);
    
    // Botão 2: Ver Resumo (Mini-gráfico)
    const summaryBtn = document.createElement('button');
    summaryBtn.className = 'btn btn-summary';
    summaryBtn.textContent = 'Ver Resumo';
    summaryBtn.addEventListener('click', () => {
        toggleMiniChart(trade.id, tradingViewSymbol, summaryBtn);
    });
    actionsWrapper.appendChild(summaryBtn);

    // Botão 3: Ação principal (Armar, Executar, Fechar)
    let actionButton;
    if (trade.data.status === 'POTENTIAL') { /*...*/ }
    else if (trade.data.status === 'ARMED') { /*...*/ }
    else if (trade.data.status === 'LIVE') { /*...*/ }
    // (a lógica destes botões permanece a mesma, pode copiá-la da sua versão atual)
    if (actionButton) {
        actionsWrapper.appendChild(actionButton);
    }

    card.appendChild(actionsWrapper);
    
    card.querySelector('.card-edit-btn').addEventListener('click', (e) => { e.stopPropagation(); loadAndOpenForEditing(trade.id); });
    return card;
}

// --- NOVA FUNÇÃO HELPER PARA GERIR O MINI-GRÁFICO ---
function toggleMiniChart(tradeId, symbol, button) {
    const chartContainer = document.getElementById(`mini-chart-${tradeId}`);
    if (!chartContainer) return;

    // Verifica se o gráfico já está visível
    const isVisible = chartContainer.classList.contains('visible');

    if (isVisible) {
        // Se está visível, esconde-o
        chartContainer.innerHTML = ''; // Limpa o conteúdo para destruir o widget
        chartContainer.classList.remove('visible');
        button.textContent = 'Ver Resumo';
    } else {
        // Se está escondido, mostra-o
        button.textContent = 'A Carregar...';
        
        // Cria o widget do TradingView
        new TradingView.widget({
            "container_id": chartContainer.id,
            "width": "100%",
            "height": "100%",
            "symbol": symbol,
            "interval": "60", // 1 Hora
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "3", // Gráfico de Área
            "hide_top_toolbar": true,
            "hide_legend": true,
            "save_image": false,
            "locale": "pt"
        });

        chartContainer.classList.add('visible');
        button.textContent = 'Esconder Resumo';
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
