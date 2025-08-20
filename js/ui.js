// js/ui.js

import { supabase } from './services.js';
import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openAddModal } from './modals.js';
import { loadAndOpenForEditing, handleRevertStatus, handleRevertToWatchlist, handleDeleteAlarm } from './handlers.js';
import { openChartModal } from './chart-modal.js';
import { getLastCreatedTradeId, setLastCreatedTradeId, getVisibleImageIds, setVisibleImageIds } from './state.js';

let tradesForEventListeners = [];

const getVisibleImageIdsInternal = () => {
    try {
        const ids = localStorage.getItem('visibleImageTradeIds');
        return ids ? JSON.parse(ids) : [];
    } catch (e) {
        return [];
    }
};

const setVisibleImageIdsInternal = (ids) => {
    try {
        localStorage.setItem('visibleImageTradeIds', JSON.stringify(ids));
    } catch (e) {
        console.error("Erro ao guardar IDs de imagem no localStorage", e);
    }
};

function renderSparkline(containerId, dataSeries) {
    const container = document.getElementById(containerId);
    if (!container || !dataSeries || dataSeries.length < 2) return;
    container.innerHTML = '';
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const computedStyle = getComputedStyle(document.documentElement);
    const positiveColor = computedStyle.getPropertyValue('--feedback-positive').trim();
    const negativeColor = computedStyle.getPropertyValue('--feedback-negative').trim();
    const chartColor = dataSeries[dataSeries.length - 1] >= dataSeries[0] ? positiveColor : negativeColor;
    const options = {
        series: [{ data: dataSeries }], 
        chart: { type: 'line', height: 40, width: 100, sparkline: { enabled: true }},
        stroke: { curve: 'smooth', width: 2 }, 
        colors: [chartColor],
        tooltip: { 
            fixed: { enabled: false }, 
            x: { show: false }, 
            y: { title: { formatter: () => '' } }, 
            marker: { show: false },
            theme: isDarkMode ? 'dark' : 'light'
        }
    };
    new ApexCharts(container, options).render();
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
export function generateDynamicChecklist(container, phases, data = {}) {
    if (!phases || phases.length === 0) return;
    phases.forEach(phase => {
        if (!phase || !Array.isArray(phase.items)) return; 
        const phaseDiv = document.createElement('div');
        const titleEl = document.createElement('h4');
        titleEl.textContent = phase.title;
        phaseDiv.appendChild(titleEl);
        const formItems = phase.items.filter(item => item.type !== 'image');
        formItems.forEach(item => {
            let element;
            switch (item.type) {
                case 'checkbox': element = createChecklistItem(item, data); break;
                case 'select': case 'text': case 'number': element = createInputItem(item, data); break;
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

async function acknowledgeAlarm(assetPair) {
    try {
        const { error } = await supabase.from('alarms').update({ acknowledged: true }).eq('asset_pair', assetPair).eq('status', 'triggered');
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao reconhecer alarme:", error);
        alert("Ocorreu um erro ao reconhecer o alarme.");
    }
}

export function getAlarmDescription(alarm, forTable = false) {
    if (!alarm) return 'N/A';
    const timeframe = `(${alarm.indicator_timeframe})`;
    switch (alarm.alarm_type) {
        case 'stochastic': return `Stoch(${alarm.indicator_period}) ≤ ${alarm.target_price} ${timeframe}`;
        case 'rsi_level': return `RSI(${alarm.indicator_period}) ${alarm.condition === 'above' ? '>' : '<'} ${alarm.target_price} ${timeframe}`;
        case 'stochastic_crossover': return `Stoch %K cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D ${timeframe}`;
        case 'rsi_crossover': {
            let details = [];
            if (alarm.crossover_interval && alarm.crossover_interval > 1) {
                details.push(`em ${alarm.crossover_interval} velas`);
            }
            if (alarm.crossover_threshold && alarm.crossover_threshold > 0) {
                details.push(`buffer ${alarm.crossover_threshold}`);
            }
            const detailsText = details.length > 0 ? `(${details.join(', ')}) ` : '';
            return `RSI cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA ${detailsText}${timeframe}`;
        }
        case 'ema_touch': return `Preço testa EMA(${alarm.ema_period}) ${timeframe}`;
        case 'combo': return `Confluência EMA/Stoch ${timeframe}`;
        case 'rsi_trendline': return `${alarm.touch_count}º toque em L.T. de ${alarm.trendline_type} ${timeframe}`;
        case 'rsi_trendline_break':
            const statusText = forTable ? 'Monitoriza quebra' : (alarm.status === 'triggered' ? 'Quebra da' : 'Monitoriza quebra da');
            return `${statusText} L.T. de ${alarm.trendline_type} ${timeframe}`;
        default: return `Preço ${alarm.condition === 'above' ? '>' : '<'} ${alarm.target_price} USD`;
    }
}

function openAlarmListModal(titleText, alarmsToDisplay) {
    const modal = document.getElementById('alarm-list-modal');
    const title = document.getElementById('alarm-list-title');
    const container = document.getElementById('alarm-list-container');
    const closeBtn = document.getElementById('close-alarm-list-modal');
    const footer = document.getElementById('alarm-list-footer');
    const acknowledgeBtn = document.getElementById('acknowledge-alarms-btn');
    if (!modal) return;
    
    title.textContent = titleText;
    alarmsToDisplay.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    container.innerHTML = alarmsToDisplay.length === 0 ? '<p>Nenhum alarme encontrado.</p>' : alarmsToDisplay.map(alarm => {
        const createdAt = new Date(alarm.created_at).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        let triggeredAtHtml = '';
        if (alarm.status === 'triggered' && alarm.triggered_at) {
            const triggeredAt = new Date(alarm.triggered_at).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            triggeredAtHtml = `<span class="alarm-list-timestamp triggered">Disparado em: ${triggeredAt}</span>`;
        }

        return `
        <div class="alarm-list-item">
            <div>
                <span class="alarm-list-description">${getAlarmDescription(alarm)}</span>
                <span class="alarm-list-timestamp">Criado em: ${createdAt}</span>
                ${triggeredAtHtml}
            </div>
            <div class="alarm-list-actions">
                <a href="alarms-create.html?editAlarmId=${alarm.id}" class="icon-action-btn" title="Editar"><span class="material-symbols-outlined">edit</span></a>
                <button class="icon-action-btn" data-action="delete-alarm" data-alarm-id="${alarm.id}" title="Apagar Alarme"><span class="material-symbols-outlined">delete_forever</span></button>
            </div>
        </div>`;
    }).join('');
    
    const isTriggeredMode = alarmsToDisplay.some(a => a.status === 'triggered');
    footer.style.display = isTriggeredMode ? 'block' : 'none';
    if(isTriggeredMode) {
        const assetPair = alarmsToDisplay.length > 0 ? alarmsToDisplay[0].asset_pair : null;
        if (assetPair) {
            acknowledgeBtn.onclick = async () => {
                await acknowledgeAlarm(assetPair);
                modal.style.display = 'none';
                location.reload(); 
            };
        }
    }

    modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target.id === 'alarm-list-modal') modal.style.display = 'none'; };
}

async function loadAndOpenAlarmModal(assetPair, mode) {
    try {
        const { data, error } = await supabase.from('alarms').select('*').eq('asset_pair', assetPair);
        if (error) throw error;
        const titleText = mode === 'active' ? `Alarmes Ativos para ${assetPair}` : `Alarmes Disparados para ${assetPair}`;
        const alarmsToDisplay = data.filter(a => mode === 'active' ? a.status === 'active' : a.status === 'triggered' && !a.acknowledged);
        openAlarmListModal(titleText, alarmsToDisplay);
    } catch (err) {
        console.error("Erro ao buscar alarmes para o modal:", err);
    }
}

export function createTradeCard(trade, marketData = {}, allAlarms = []) {
    const card = document.createElement('div');
    card.className = 'trade-card';
    card.dataset.tradeId = trade.id;
    const assetName = trade.data.asset;
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${assetName}`;
    const createAlarmUrl = `alarms-create.html?assetPair=${assetName}`;
    const assetMarketData = marketData[assetName] || { price: 0, change: 0, sparkline: [] };
    const priceChangeClass = assetMarketData.change >= 0 ? 'positive-pnl' : 'negative-pnl';
    if (trade.data.status === 'ARMED') card.classList.add('armed');
    if (trade.data.status === 'LIVE') card.classList.add('live');

    let mainActionButtonHtml = '', revertButtonHtml = '';
    if (trade.data.status === 'POTENTIAL') {
        mainActionButtonHtml = `<button class="icon-action-btn action-arm" data-action="arm" title="Armar"><span class="material-symbols-outlined">bolt</span> <span class="button-text">Armar</span></button>`;
        revertButtonHtml = `<button class="btn btn-secondary revert-btn" data-action="revert-to-watchlist" title="Reverter para Watchlist"><span class="material-symbols-outlined">visibility_off</span> <span class="button-text">Reverter</span></button>`;
    } else if (trade.data.status === 'ARMED') {
        mainActionButtonHtml = `<button class="icon-action-btn action-execute" data-action="execute" title="Executar"><span class="material-symbols-outlined">play_arrow</span> <span class="button-text">Executar</span></button>`;
        revertButtonHtml = `<button class="btn btn-secondary revert-btn" data-action="revert-to-potential" title="Reverter para Potencial"><span class="material-symbols-outlined">undo</span> <span class="button-text">Reverter</span></button>`;
    } else if (trade.data.status === 'LIVE') {
        mainActionButtonHtml = `<button class="icon-action-btn action-close" data-action="close" title="Fechar"><span class="material-symbols-outlined">stop</span> <span class="button-text">Fechar</span></button>`;
        revertButtonHtml = `<button class="btn btn-secondary revert-btn" data-action="revert-to-armed" title="Reverter para Armado"><span class="material-symbols-outlined">undo</span> <span class="button-text">Reverter</span></button>`;
    }
    
    let formattedPrice = assetMarketData.price >= 1.0 ? assetMarketData.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + assetMarketData.price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
    const notesHtml = trade.data.notes ? `<p class="trade-notes">${trade.data.notes}</p>` : '';
    const relatedAlarms = allAlarms.filter(alarm => alarm.asset_pair === assetName);
    const hasActiveAlarm = relatedAlarms.some(alarm => alarm.status === 'active');
    const hasTriggeredUnacknowledgedAlarm = relatedAlarms.some(alarm => alarm.status === 'triggered' && !alarm.acknowledged);
    let alarmBellHtml = '', triggeredActionRowHtml = '';
    if (hasActiveAlarm) alarmBellHtml = `<button class="icon-action-btn alarm-active-bell" data-action="view-alarms" data-asset="${assetName}" title="Ver alarmes ativos"><span class="material-symbols-outlined">notifications_active</span></button>`;
    if (hasTriggeredUnacknowledgedAlarm) {
        card.classList.add('alarm-triggered');
        triggeredActionRowHtml = `<div class="card-triggered-action-row"><button class="acknowledge-alarm-btn" data-action="acknowledge-and-view-alarm" data-asset="${assetName}" title="Ver Alarme Disparado"><span class="material-symbols-outlined">alarm</span> OK</button></div>`;
    }
    
    let viewImageButtonHtml = '', imageContainerHtml = '';
    if (trade.data.imageUrl) {
        viewImageButtonHtml = `<button class="icon-action-btn" data-action="toggle-image" title="Mostrar/Esconder Imagem"><span class="material-symbols-outlined">image</span></button>`;
        const isVisibleClass = getVisibleImageIdsInternal().includes(trade.id) ? 'visible' : '';
        imageContainerHtml = `<div class="card-image-container ${isVisibleClass}"><a href="${trade.data.imageUrl}" target="_blank" rel="noopener noreferrer"><img src="${trade.data.imageUrl}" alt="Gráfico" loading="lazy"></a></div>`;
    }

    card.innerHTML = `<div class="card-header-row"><h3 class="asset-title-card"><a href="asset-details.html?symbol=${assetName}" class="asset-link">${assetName}</a>${alarmBellHtml}<button class="icon-action-btn card-edit-btn" data-action="edit" title="Editar"><span class="material-symbols-outlined">edit</span></button></h3><div class="card-main-action-button">${mainActionButtonHtml}</div></div><p class="strategy-name">Estratégia: ${trade.data.strategyName || 'N/A'}</p>${notesHtml}${imageContainerHtml}${triggeredActionRowHtml}<div class="card-bottom-row"><div class="card-secondary-actions">${revertButtonHtml}<a href="${tradingViewUrl}" target="_blank" rel="noopener noreferrer" class="icon-action-btn" title="TradingView"><span class="material-symbols-outlined">open_in_new</span></a><a href="${createAlarmUrl}" class="icon-action-btn" title="Criar Alarme"><span class="material-symbols-outlined">alarm_add</span></a>${viewImageButtonHtml}</div><div class="card-sparkline" id="sparkline-card-${trade.id}"></div><div class="card-price-data"><div class="card-price">${formattedPrice}</div><div class="${priceChangeClass} price-change-percent">${assetMarketData.change.toFixed(2)}%</div></div></div>`;
    return card;
}

export function displayTrades(trades, marketData, allAlarms) {
    tradesForEventListeners = trades;
    potentialTradesContainer.innerHTML = armedTradesContainer.innerHTML = liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum item.</p>';
    let counters = { POTENTIAL: 0, ARMED: 0, LIVE: 0 };
    const containers = { POTENTIAL: potentialTradesContainer, ARMED: armedTradesContainer, LIVE: liveTradesContainer };
    trades.forEach(trade => {
        const status = trade.data.status;
        if (containers[status]) {
            if (counters[status] === 0) containers[status].innerHTML = '';
            containers[status].appendChild(createTradeCard(trade, marketData, allAlarms));
            counters[status]++;
        }
    });
    trades.forEach(trade => renderSparkline(`sparkline-card-${trade.id}`, marketData[trade.data.asset]?.sparkline));
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

export function displayWatchlistTable(allTrades, allAlarms, marketData) {
    // --- INÍCIO DA ALTERAÇÃO ---
    const watchlistSection = document.getElementById('watchlist-section');
    const tbody = document.getElementById('watchlist-alarms-tbody');
    if (!tbody || !watchlistSection) return;
    // --- FIM DA ALTERAÇÃO ---

    const assetsInKanban = new Set(allTrades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status)).map(t => t.data.asset));
    const activeAlarmsByAsset = allAlarms.reduce((acc, alarm) => {
        if (alarm.status === 'active') {
            if (!acc[alarm.asset_pair]) acc[alarm.asset_pair] = [];
            acc[alarm.asset_pair].push(alarm);
        }
        return acc;
    }, {});
    const assetsForWatchlist = Object.keys(activeAlarmsByAsset).filter(asset => !assetsInKanban.has(asset));

    // --- INÍCIO DA ALTERAÇÃO ---
    if (assetsForWatchlist.length === 0) {
        watchlistSection.style.display = 'none';
        return;
    }
    watchlistSection.style.display = 'block';
    // --- FIM DA ALTERAÇÃO ---

    const tableRowsHtml = assetsForWatchlist.map(assetName => {
        const alarmsForAsset = activeAlarmsByAsset[assetName];
        const latestAlarm = [...alarmsForAsset].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        const assetMarketData = marketData[assetName] || { price: 0, sparkline: [] };
        let formattedPrice = assetMarketData.price >= 1.0 ? assetMarketData.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + assetMarketData.price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
        const hasTriggeredUnacknowledgedAlarm = allAlarms.some(a => a.asset_pair === assetName && a.status === 'triggered' && !a.acknowledged);
        const triggeredClass = hasTriggeredUnacknowledgedAlarm ? 'class="alarm-triggered"' : '';
        const acknowledgeButtonHtml = hasTriggeredUnacknowledgedAlarm ? `<button class="acknowledge-alarm-btn" data-action="acknowledge-and-view-alarm" data-asset="${assetName}" title="Ver Alarme Disparado"><span class="material-symbols-outlined">alarm</span> OK</button>` : '';
        
        return `
            <tr ${triggeredClass}>
                <td data-label="Ativo"><strong><a href="asset-details.html?symbol=${assetName}" class="asset-link">${assetName}</a></strong></td>
                <td data-label="Ultimo alarme criado">
                    <a href="#" class="alarm-details-link" data-action="manage-alarms" data-asset="${assetName}">${getAlarmDescription(latestAlarm, true)}</a>
                </td>
                <td data-label="Último Preço">${formattedPrice}</td>
                <td data-label="Sparkline (24h)"><div class="sparkline-container" id="sparkline-watchlist-${assetName}"></div></td>
                <td data-label="Ações">
                    <div class="action-buttons">
                        ${acknowledgeButtonHtml}
                        <button class="icon-action-btn btn-view-chart" data-action="view-chart" data-symbol="${assetName}" title="Ver Gráfico Detalhado"><span class="material-symbols-outlined">monitoring</span></button>
                        <a href="https://www.tradingview.com/chart/?symbol=BINANCE:${assetName}" target="_blank" class="icon-action-btn btn-trading-view" title="TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                        <a href="alarms-create.html?assetPair=${assetName}" class="icon-action-btn" title="Criar Novo Alarme"><span class="material-symbols-outlined">alarm_add</span></a>
                        <button class="icon-action-btn" data-action="add-to-potential" data-symbol="${assetName}" title="Adicionar a Trade Potencial"><span class="material-symbols-outlined">add</span></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    tbody.innerHTML = tableRowsHtml;
    assetsForWatchlist.forEach(assetName => renderSparkline(`sparkline-watchlist-${assetName}`, marketData[assetName]?.sparkline));
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
            const trade = tradeId ? tradesForEventListeners.find(t => t.id === tradeId) : null;
            switch (action) {
                case 'edit': if (tradeId) loadAndOpenForEditing(tradeId); break;
                case 'arm': if (trade) openArmModal(trade); break;
                case 'execute': if (trade) openExecModal(trade); break;
                case 'close': if (trade) openCloseTradeModal(trade); break;
                case 'toggle-image':
                    const imageContainer = card?.querySelector('.card-image-container');
                    if (imageContainer) {
                        imageContainer.classList.toggle('visible');
                        let visibleIds = getVisibleImageIdsInternal();
                        if (imageContainer.classList.contains('visible')) {
                            if (!visibleIds.includes(tradeId)) visibleIds.push(tradeId);
                        } else {
                            visibleIds = visibleIds.filter(id => id !== tradeId);
                        }
                        setVisibleImageIdsInternal(visibleIds);
                    }
                    break;
                case 'view-alarms': loadAndOpenAlarmModal(button.dataset.asset, 'active'); break;
                case 'acknowledge-and-view-alarm': loadAndOpenAlarmModal(button.dataset.asset, 'triggered'); break;
                case 'revert-to-watchlist': if (trade) handleRevertToWatchlist(trade); break;
                case 'revert-to-potential': case 'revert-to-armed': if (trade) handleRevertStatus(trade, action); break;
            }
        });
    }

    const watchlistTable = document.getElementById('watchlist-alarms-tbody');
    if (watchlistTable) {
        watchlistTable.addEventListener('click', (e) => {
            const targetElement = e.target.closest('[data-action]');
            if (!targetElement) return;
            const action = targetElement.dataset.action;
            const symbol = targetElement.dataset.symbol || targetElement.dataset.asset;
            if (action !== 'delete-alarm') e.preventDefault();
            if (action === 'view-chart' && symbol) {
                openChartModal(symbol);
            } else if (action === 'add-to-potential' && symbol) {
                openAddModal();
                const modalAssetInput = document.getElementById('asset');
                if (modalAssetInput) modalAssetInput.value = symbol;
            } else if (action === 'acknowledge-and-view-alarm' && symbol) {
                loadAndOpenAlarmModal(symbol, 'triggered');
            } else if (action === 'manage-alarms' && symbol) {
                loadAndOpenAlarmModal(symbol, 'active');
            }
        });
    }

    const alarmModal = document.getElementById('alarm-list-modal');
    if (alarmModal) {
        alarmModal.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action="delete-alarm"]');
            if (button) {
                e.preventDefault();
                const alarmId = button.dataset.alarmId;
                handleDeleteAlarm(alarmId);
            }
        });
    }
});
