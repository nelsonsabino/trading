import { supabase } from './services.js';
import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal, openAddModal } from './modals.js';
import { loadAndOpenForEditing, handleRevertStatus } from './handlers.js';
import { getLastCreatedTradeId, setLastCreatedTradeId } from './state.js';

let tradesForEventListeners = [];

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

function getIconForLabel(labelText) {
    const text = labelText.toLowerCase();
    if (text.includes('tendência')) return 'trending_up';
    if (text.includes('rsi')) return 'show_chart';
    if (text.includes('stochastic') || text.includes('estocástico')) return 'moving';
    if (text.includes('suporte')) return 'south';
    if (text.includes('resistência')) return 'north';
    if (text.includes('fibo')) return 'straighten';
    if (text.includes('volume')) return 'database';
    if (text.includes('ema')) return 'timeline';
    if (text.includes('alarme')) return 'alarm';
    if (text.includes('preço')) return 'attach_money';
    if (text.includes('candle')) return 'candlestick_chart';
    if (text.includes('timeframe')) return 'schedule';
    if (text.includes('val ')) return 'magnetism';
    if (text.includes('alvo')) return 'my_location';
    return 'check';
}

function createChecklistItem(item, data) {
    const isRequired = item.required ? 'required' : '';
    const labelText = item.required ? `${item.label} <span class="required-asterisk">*</span>` : item.label;
    const isChecked = data && data[item.id] ? 'checked' : '';
    const element = document.createElement('div');
    element.className = 'checklist-item';
    element.innerHTML = `<span class="material-symbols-outlined">${getIconForLabel(item.label)}</span><input type="checkbox" id="${item.id}" ${isChecked} ${isRequired}><label for="${item.id}">${labelText}</label>`;
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
    element.innerHTML = `<span class="material-symbols-outlined">${getIconForLabel(item.label)}</span><div style="flex-grow: 1;"><label for="${item.id}">${labelText}</label>${fieldHtml}</div>`;
    return element;
}

// ---- EXPORT CORRIGIDO ----
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
// ---- FIM EXPORT ----

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

async function acknowledgeAlarm(assetPair) {
    try {
        const { error } = await supabase
            .from('alarms')
            .update({ acknowledged: true })
            .eq('asset_pair', assetPair)
            .eq('status', 'triggered');

        if (error) throw error;
        console.log(`Alarmes disparados para ${assetPair} reconhecidos com sucesso.`);
    } catch (error) {
        console.error("Erro ao reconhecer alarme:", error);
        alert("Ocorreu um erro ao reconhecer o alarme. Tente novamente.");
    }
}

function openAlarmListModal(assetPair, alarms, mode = 'active') {
    const modal = document.getElementById('alarm-list-modal');
    const title = document.getElementById('alarm-list-title');
    const container = document.getElementById('alarm-list-container');
    const closeBtn = document.getElementById('close-alarm-list-modal');
    const footer = document.getElementById('alarm-list-footer');
    const acknowledgeBtn = document.getElementById('acknowledge-alarms-btn');

    if (!modal || !title || !container || !closeBtn || !footer || !acknowledgeBtn) return;
    
    let filteredAlarms;
    if (mode === 'active') {
        title.textContent = `Alarmes Ativos para ${assetPair}`;
        filteredAlarms = alarms.filter(a => a.asset_pair === assetPair && a.status === 'active');
    } else {
        title.textContent = `Alarmes Disparados para ${assetPair}`;
        filteredAlarms = alarms.filter(a => a.asset_pair === assetPair && a.status === 'triggered' && !a.acknowledged);
    }
    
    container.innerHTML = '';
    if (filteredAlarms.length === 0) {
        container.innerHTML = '<p>Nenhum alarme encontrado.</p>';
    } else {
        filteredAlarms.forEach(alarm => {
            let alarmDescription = `Preço ${alarm.condition} ${alarm.target_price} USD`;
            const item = document.createElement('div');
            item.className = 'alarm-list-item';
            item.innerHTML = `
                <span class="alarm-list-description">${alarmDescription}</span>
                <div class="alarm-list-actions">
                    <a href="alarms-create.html?editAlarmId=${alarm.id}" class="icon-action-btn" title="Editar"><span class="material-symbols-outlined">edit</span></a>
                </div>
            `;
            container.appendChild(item);
        });
    }

    if (mode === 'triggered') {
        footer.style.display = 'block';
        acknowledgeBtn.onclick = async () => {
            await acknowledgeAlarm(assetPair);
            modal.style.display = 'none';
        };
    } else {
        footer.style.display = 'none';
    }

    modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target.id === 'alarm-list-modal') modal.style.display = 'none'; };
}

async function loadAndOpenAlarmModal(assetPair, mode) {
    try {
        const { data: allAlarms, error } = await supabase.from('alarms').select('*');
        if (error) throw error;
        
        openAlarmListModal(assetPair, allAlarms, mode);
    } catch (err) {
        console.error("Erro ao buscar alarmes para o modal:", err);
        alert("Não foi possível carregar os alarmes.");
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
        mainActionButtonClass = 'action-arm'; mainActionButtonIcon = 'bolt';
        mainActionButtonText = 'Armar'; dataAction = 'arm';
    } else if (trade.data.status === 'ARMED') {
        mainActionButtonClass = 'action-execute'; mainActionButtonIcon = 'play_arrow';
        mainActionButtonText = 'Executar'; dataAction = 'execute';
    } else if (trade.data.status === 'LIVE') {
        mainActionButtonClass = 'action-close'; mainActionButtonIcon = 'stop';
        mainActionButtonText = 'Fechar'; dataAction = 'close';
    }
    if (mainActionButtonText) {
        mainActionButtonHtml = `<button class="icon-action-btn ${mainActionButtonClass}" data-action="${dataAction}" title="${mainActionButtonText}"><span class="material-symbols-outlined">${mainActionButtonIcon}</span> <span class="button-text">${mainActionButtonText}</span></button>`;
    }

    // ---- BOTÃO REVERSÃO DE STATUS ----
    let revertButtonHtml = '';
    if (trade.data.status === 'ARMED') {
        revertButtonHtml = `<button class="icon-action-btn action-revert" data-action="revert-status" title="Reverter para Potencial"><span class="material-symbols-outlined">undo</span> <span class="button-text">Reverter</span></button>`;
    }
    if (trade.data.status === 'LIVE') {
        revertButtonHtml = `<button class="icon-action-btn action-revert" data-action="revert-status" title="Reverter para Armado"><span class="material-symbols-outlined">undo</span> <span class="button-text">Reverter</span></button>`;
    }
    // ---- FIM BOTÃO REVERSÃO ----

    let formattedPrice;
    if (assetMarketData.price >= 1.0) {
        formattedPrice = assetMarketData.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        formattedPrice = '$' + assetMarketData.price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
    }

    const notesHtml = trade.data.notes ? `<p class="trade-notes">${trade.data.notes}</p>` : '';

    const relatedAlarms = allAlarms.filter(alarm => alarm.asset_pair === assetName);
    const hasActiveAlarm = relatedAlarms.some(alarm => alarm.status === 'active');
    const hasTriggeredUnacknowledgedAlarm = relatedAlarms.some(alarm => alarm.status === 'triggered' && alarm.acknowledged === false);

    let alarmBellHtml = '';
    let acknowledgeButtonHtml = '';

    if (hasActiveAlarm) {
        alarmBellHtml = `<button class="icon-action-btn alarm-active-bell" data-action="view-alarms" data-asset="${assetName}" title="Ver alarmes ativos"><span class="material-symbols-outlined">notifications_active</span></button>`;
    }
    if (hasTriggeredUnacknowledgedAlarm) {
        card.classList.add('alarm-triggered');
        acknowledgeButtonHtml = `<button class="acknowledge-alarm-btn" data-action="acknowledge-and-view-alarm" data-asset="${assetName}" title="Ver Alarme Disparado"><span class="material-symbols-outlined">alarm</span> OK</button>`;
    }

    card.innerHTML = `
        <div class="card-header-row">
            <h3 class="asset-title-card">
                <a href="asset-details.html?symbol=${assetName}" class="asset-link">${assetName}</a>
                ${alarmBellHtml}
                <button class="icon-action-btn card-edit-btn" data-action="edit" title="Editar"><span class="material-symbols-outlined">edit</span></button>
            </h3>
            <div class="card-main-action-button">
                ${mainActionButtonHtml}
                ${revertButtonHtml}
            </div>
        </div>
        <p class="strategy-name">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
        
        ${notesHtml}

        <div class="card-bottom-row">
            <div class="card-secondary-actions">
                <a href="https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}" target="_blank" rel="noopener noreferrer" class="icon-action-btn action-full-chart" title="Abrir no TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                ${acknowledgeButtonHtml}
            </div>
            <div class="card-sparkline" id="sparkline-card-${trade.id}"></div>
            <div class="card-price-data">
                <div class="card-price">${formattedPrice}</div>
                <div class="${priceChangeClass} price-change-percent">${assetMarketData.change.toFixed(2)}%</div>
            </div>
        </div>
    `;
    return card;
}

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

            const action = button.dataset.action;

            switch (action) {
                case 'edit': 
                    if (tradeId) loadAndOpenForEditing(tradeId); 
                    break;
                case 'arm': 
                    if (tradeId) openArmModal(tradesForEventListeners.find(t => t.id === tradeId)); 
                    break;
                case 'execute': 
                    if (tradeId) openExecModal(tradesForEventListeners.find(t => t.id === tradeId)); 
                    break;
                case 'close': 
                    if (tradeId) openCloseTradeModal(tradesForEventListeners.find(t => t.id === tradeId)); 
                    break;
                case 'view-alarms':
                    loadAndOpenAlarmModal(button.dataset.asset, 'active');
                    break;
                case 'acknowledge-and-view-alarm':
                    const assetSymbol = button.dataset.asset;
                    if (assetSymbol) {
                        loadAndOpenAlarmModal(assetSymbol, 'triggered');
                        // acknowledgeAlarm(assetSymbol); // Ação de reconhecer agora está no botão do modal
                    }
                    break;
                case 'add-to-watchlist':
                   openAddModal();
                   const modalAssetInput = document.getElementById('asset');
                   if (modalAssetInput) {
                       modalAssetInput.value = button.dataset.symbol.replace('BINANCE:', '');
                   }
                   break;
                case 'revert-status':
                    if (tradeId) handleRevertStatus(tradesForEventListeners.find(t => t.id === tradeId));
                    break;
            }
        });
    }
});
