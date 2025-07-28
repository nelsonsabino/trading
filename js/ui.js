// js/ui.js

import { supabase } from './services.js';
import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal, openAddModal } from './modals.js';
import { loadAndOpenForEditing } from './handlers.js';
import { getLastCreatedTradeId, setLastCreatedTradeId } from './state.js';

// Mapa para armazenar instâncias de gráficos ApexCharts por tradeId
const activeCharts = {}; // NOVO: Guarda as instâncias de gráficos

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

async function toggleAdvancedChart(tradeId, symbol, button) {
    const chartContainer = document.getElementById(`advanced-chart-${tradeId}`);
    if (!chartContainer) return;

    // Obtém o estado atual da visibilidade e da instância ANTES de qualquer modificação
    const isVisibleBeforeToggle = chartContainer.classList.contains('visible');
    const chartInstanceExists = !!activeCharts[tradeId]; // Verifica se a instância existe no mapa

    console.log(`[UI Debug] Click: ${tradeId}, isVisible CSS: ${isVisibleBeforeToggle}, chartInstance Map: ${chartInstanceExists}`);

    if (isVisibleBeforeToggle && chartInstanceExists) {
        // Lógica para FECHAR o gráfico
        console.log(`[UI Debug] FECHAR: Chamando destroy e limpando para ${tradeId}.`);
        activeCharts[tradeId].destroy(); // Destroi explicitamente a instância
        delete activeCharts[tradeId]; // Remove do mapa
        chartContainer.innerHTML = ''; // Limpa o conteúdo (duplicado, mas seguro)
        chartContainer.classList.remove('visible'); // Remove a classe CSS
        button.innerHTML = `<i class="fa-solid fa-chart-simple"></i>`; // Restaura o ícone original
        return; // Sai da função após fechar
    }

    // Lógica para ABRIR o gráfico (se não estiver visível ou não tiver instância ativa)
    console.log(`[UI Debug] ABRIR: Tentando renderizar para ${tradeId}.`);
    chartContainer.classList.add('visible'); // Torna o contentor visível
    chartContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">A carregar gráfico...</p>'; // Mensagem de carregamento
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`; // Ícone de carregamento

    try {
        const cleanSymbol = symbol.replace('BINANCE:', '');
        const { data: response, error } = await supabase.functions.invoke('get-asset-details-data', {
            body: { symbol: cleanSymbol, interval: '1h', limit: 220 },
        });

        if (error) throw error;
        if (!response || !response.ohlc || !response.indicators) {
            throw new Error('Dados de gráfico ou indicadores não foram encontrados.');
        }

        const klinesData = response.ohlc;
        const indicatorsData = response.indicators;
        let series = [];

        const closePriceSeriesData = klinesData.map(kline => ({ x: kline[0], y: kline[4] }));
        series.push({ name: 'Preço (USD)', type: 'line', data: closePriceSeriesData });

        if (indicatorsData.ema50_data) {
            const ema50SeriesData = indicatorsData.ema50_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal }));
            series.push({ name: 'EMA 50', type: 'line', data: ema50SeriesData });
        }
        if (indicatorsData.ema200_data) {
            const ema200SeriesData = indicatorsData.ema200_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal }));
            series.push({ name: 'EMA 200', type: 'line', data: ema200SeriesData });
        }

        const options = {
            series: series,
            chart: { type: 'line', height: 400, toolbar: { show: true, autoSelected: 'pan' } },
            colors: ['#007bff', '#ffc107', '#dc3545'],
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { type: 'datetime' },
            yaxis: { labels: { formatter: (val) => `$${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}` }, tooltip: { enabled: true } },
            tooltip: { x: { format: 'dd MMM yyyy HH:mm' } },
            theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
        };

        chartContainer.innerHTML = '';
        const chart = new ApexCharts(chartContainer, options);
        activeCharts[tradeId] = chart; // Armazena a nova instância
        chart.render();
        button.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`; // Ícone para fechar
        console.log(`[UI Debug] ABERTO: Gráfico para ${tradeId} renderizado e instância armazenada.`);

    } catch (err) {
        console.error("Erro ao carregar o gráfico no card:", err);
        chartContainer.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Erro ao carregar: ${err.message}</p>`;
        button.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i>`;
        chartContainer.classList.remove('visible'); // Esconde em caso de erro
        delete activeCharts[tradeId]; // Garante que a instância é removida em caso de erro
        console.log(`[UI Debug] ERRO: Limpeza após falha para ${tradeId}.`);
    }
}

// Nova função para reconhecer alarmes
async function acknowledgeAlarm(assetPair) {
    if (!confirm(`Tem certeza que quer reconhecer os alarmes disparados para ${assetPair}?`)) {
        return;
    }
    try {
        const { data, error } = await supabase
            .from('alarms')
            .update({ acknowledged: true })
            .eq('asset_pair', assetPair)
            .eq('status', 'triggered');

        if (error) throw error;
        console.log(`Alarmes disparados para ${assetPair} reconhecidos com sucesso.`);
        // A re-renderização do dashboard será acionada pelo listener em app.js
    } catch (error) {
        console.error("Erro ao reconhecer alarme:", error);
        alert("Ocorreu um erro ao reconhecer o alarme. Tente novamente.");
    }
}


export function createTradeCard(trade, marketData = {}, allAlarms = []) {
    const card = document.createElement('div');
    card.className = 'trade-card';
    card.dataset.tradeId = trade.id;
    const assetName = trade.data.asset;
    const tradingViewSymbol = `BINANCE:${assetName}`;
    const assetMarketData = marketData[assetName] || { price: 0, change: 0, sparkline: [] };
    const priceChangeClass = assetMarketData.change >= 0 ? 'positive-pnl' : 'negative-pnl';

    if (trade.data.status === 'ARMED') card.classList.add('armed');
    if (trade.data.status === 'LIVE') card.classList.add('live');

    let mainActionButtonHtml = '';
    let mainActionButtonClass = '';
    let mainActionButtonIcon = '';
    let mainActionButtonText = '';
    let dataAction = '';

    if (trade.data.status === 'POTENTIAL') {
        mainActionButtonClass = 'action-arm';
        mainActionButtonIcon = 'fa-solid fa-bolt';
        mainActionButtonText = 'Armar';
        dataAction = 'arm';
    } else if (trade.data.status === 'ARMED') {
        mainActionButtonClass = 'action-execute';
        mainActionButtonIcon = 'fa-solid fa-play';
        mainActionButtonText = 'Executar';
        dataAction = 'execute';
    } else if (trade.data.status === 'LIVE') {
        mainActionButtonClass = 'action-close';
        mainActionButtonIcon = 'fa-solid fa-stop';
        mainActionButtonText = 'Fechar';
        dataAction = 'close';
    }
    if (mainActionButtonText) {
        mainActionButtonHtml = `<button class="icon-action-btn ${mainActionButtonClass}" data-action="${dataAction}" title="${mainActionButtonText}"><i class="${mainActionButtonIcon}"></i> <span>${mainActionButtonText}</span></button>`;
    }
    
    let formattedPrice;
    if (assetMarketData.price >= 1.0) {
        formattedPrice = assetMarketData.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        formattedPrice = '$' + assetMarketData.price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
    }

    const notesHtml = trade.data.notes 
        ? `<p class="trade-notes">${trade.data.notes}</p>` 
        : '';

    // Lógica para sinalização de alarmes
    const relatedAlarms = allAlarms.filter(alarm => alarm.asset_pair === assetName);
    const hasActiveAlarm = relatedAlarms.some(alarm => alarm.status === 'active');
    const hasTriggeredUnacknowledgedAlarm = relatedAlarms.some(alarm => alarm.status === 'triggered' && alarm.acknowledged === false);

    let alarmBellHtml = '';
    let acknowledgeButtonHtml = '';

    if (hasActiveAlarm) {
        alarmBellHtml = `<i class="fa-solid fa-bell alarm-active-bell" title="Alarme ativo para este ativo."></i>`;
    }
    if (hasTriggeredUnacknowledgedAlarm) {
        card.classList.add('alarm-triggered');
        acknowledgeButtonHtml = `<button class="acknowledge-alarm-btn" data-action="acknowledge-alarm" data-asset="${assetName}" title="Reconhecer Alarme"><i class="fa-solid fa-check"></i> OK</button>`;
    }


    card.innerHTML = `
        <div class="card-header-row">
            <h3 class="asset-title-card">
                <a href="asset-details.html?symbol=${assetName}" class="asset-link">${assetName}</a>
                ${alarmBellHtml}
                <button class="icon-action-btn card-edit-btn" data-action="edit" title="Editar"><i class="fas fa-pencil"></i></button>
            </h3>
            <div class="card-main-action-button">${mainActionButtonHtml}</div>
        </div>
        <p class="strategy-name">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
        
        ${notesHtml}

        <div class="card-bottom-row">
            <div class="card-secondary-actions">
                <button class="icon-action-btn action-summary" data-action="toggle-chart" data-symbol="${tradingViewSymbol}" title="Ver gráfico interativo"><i class="fa-solid fa-chart-simple"></i></button>
                <a href="https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}" target="_blank" rel="noopener noreferrer" class="icon-action-btn action-full-chart" title="Abrir no TradingView para análise completa"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                ${acknowledgeButtonHtml}
            </div>
            <div class="card-sparkline" id="sparkline-card-${trade.id}"></div>
            <div class="card-price-data">
                <div class="card-price">${formattedPrice}</div>
                <div class="${priceChangeClass} price-change-percent">${assetMarketData.change.toFixed(2)}%</div>
            </div>
        </div>
        <div class="mini-chart-container" id="advanced-chart-${trade.id}"></div>
    `;
    return card;
}

let tradesForEventListeners = [];
export function displayTrades(trades, marketData, allAlarms) {
    tradesForEventListeners = trades;
    if (!potentialTradesContainer) return;
    potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum ativo na watchlist.</p>';
    armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
    liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
    let potentialCount = 0, armedCount = 0, liveCount = 0;
    trades.forEach(trade => {
        const card = createTradeCard(trade, marketData, allAlarms);
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
                case 'toggle-chart':
                    e.stopPropagation();
                    console.log(`[UI Debug] Ação de toggle chart recebida para ${tradeId}. Visível: ${chartContainer.classList.contains('visible')}`);
                    toggleAdvancedChart(tradeId, button.dataset.symbol, button);
                    break;
                case 'edit': loadAndOpenForEditing(tradeId); break;
                case 'arm': openArmModal(trade); break;
                case 'execute': openExecModal(trade); break;
                case 'close': openCloseTradeModal(trade); break;
                case 'add-to-watchlist':
                   openAddModal();
                   const modalAssetInput = document.getElementById('asset');
                   if (modalAssetInput) {
                       modalAssetInput.value = button.dataset.symbol.replace('BINANCE:', '');
                   }
                   break;
                case 'acknowledge-alarm':
                    const assetSymbol = button.dataset.asset;
                    if (assetSymbol) {
                        acknowledgeAlarm(assetSymbol);
                    }
                    break;
            }
        });
    }
});
