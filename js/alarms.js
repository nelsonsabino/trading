// js/alarms.js

import { supabase } from './services.js';
import { setupAutocomplete } from './utils.js';

let editingAlarmId = null;
window.alarmsData = [];

// --- LÓGICA DO MODAL DO GRÁFICO ---
const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

function openChartModal(symbol) {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    new TradingView.widget({
        "container_id": "chart-modal-container", "autosize": true, "symbol": `BINANCE:${symbol}`,
        "interval": "240", "timezone": "Etc/UTC", "theme": currentTheme, "style": "1", "locale": "pt",
        "hide_side_toolbar": false, "allow_symbol_change": true,
        "studies": ["STD;MA%Ribbon", "STD;RSI"]
    });
    chartModal.style.display = 'flex';
}

function closeChartModal() {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    chartModal.style.display = 'none';
}

if (chartModal) {
    closeChartModalBtn.addEventListener('click', closeChartModal);
    chartModal.addEventListener('click', (e) => { if (e.target.id === 'chart-modal') closeChartModal(); });
}


// --- LÓGICA DA PÁGINA DE ALARMES ---

async function fetchPriceForPair(pair) {
    const priceDisplay = document.getElementById('asset-current-price');
    if (!priceDisplay || !pair) {
        if (priceDisplay) priceDisplay.textContent = '';
        return;
    }
    priceDisplay.textContent = 'A obter preço...';
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        if (!response.ok) throw new Error('Par não encontrado na Binance');
        const data = await response.json();
        const price = parseFloat(data.price);
        let formattedPrice;
        if (price >= 1.0) {
            formattedPrice = price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            formattedPrice = '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
        }
        priceDisplay.innerHTML = `Preço Atual: <span style="color: #28a745;">${formattedPrice}</span>`;
    } catch (error) { 
        priceDisplay.textContent = 'Preço não disponível.';
    }
}

async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');
    if (!activeTbody || !triggeredTbody) return;

    try {
        activeTbody.innerHTML = '<tr><td colspan="4">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        const { data, error } = await supabase.from('alarms').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        window.alarmsData = data;
        const activeAlarmsHtml = [], triggeredAlarmsHtml = [];

        for (const alarm of data) {
            const isBullish = ['above', 'test_support'].includes(alarm.condition);
            const conditionClass = isBullish ? 'condition-above' : 'condition-below';
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            const assetDisplay = alarm.asset_pair || `${alarm.asset_id} (${alarm.asset_symbol})`;

            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'rsi_level') { alarmDescription = `RSI(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'stochastic_crossover') { alarmDescription = `Estocástico %K(${alarm.indicator_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D(${alarm.combo_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço testa a EMA(${alarm.ema_period}) como ${alarm.condition === 'test_support' ? 'SUPORTE' : 'RESISTÊNCIA'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'test_support' ? `testa a EMA (Suporte)` : `testa a EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }
            
            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${alarm.asset_pair}`;
            const addOpportunityUrl = `index.html?assetPair=${alarm.asset_pair}`;

            if (alarm.status === 'active') {
                activeAlarmsHtml.push(`
                    <tr>
                        <td data-label="Ativo"><span class="cell-value"><strong>${assetDisplay}</strong></span></td>
                        <td data-label="Condição" class="${conditionClass}"><span class="cell-value description">${alarmDescription}</span></td>
                        <td data-label="Data Criação"><span class="cell-value">${formattedDate}</span></td>
                        <td data-label="Ações">
                            <div class="action-buttons cell-value">
                                <button class="icon-action-btn edit-btn" data-id="${alarm.id}" title="Editar Alarme"><i class="fa-solid fa-pencil"></i></button>
                                <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme"><i class="fa-solid fa-trash"></i></button>
                                <button class="icon-action-btn view-chart-btn" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></button>
                                <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                                <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><i class="fa-solid fa-plus"></i></a>
                            </div>
                        </td>
                    </tr>`);
            } else {
                const triggeredDate = alarm.triggered_at ? new Date(alarm.triggered_at).toLocaleString('pt-PT') : new Date(alarm.created_at).toLocaleString('pt-PT');
                triggeredAlarmsHtml.push(`
                    <tr>
                        <td data-label="Ativo"><span class="cell-value"><strong>${assetDisplay}</strong></span></td>
                        <td data-label="Condição" class="${conditionClass}"><span class="cell-value description">${alarmDescription}</span></td>
                        <td data-label="Status"><span class="cell-value"><span class="status-badge status-closed">Disparado</span></span></td>
                        <td data-label="Data Disparo"><span class="cell-value">${triggeredDate}</span></td>
                        <td data-label="Ações">
                            <div class="action-buttons cell-value">
                                <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme"><i class="fa-solid fa-trash"></i></button>
                                <button class="icon-action-btn view-chart-btn" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></button>
                                <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                                <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><i class="fa-solid fa-plus"></i></a>
                            </div>
                        </td>
                    </tr>`);
            }
        }
        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';
    } catch (error) { console.error("Erro ao buscar alarmes:", error); }
}

async function deleteAlarm(alarmId) { /* ...código inalterado... */ }
function enterEditMode(alarm) { /* ...código inalterado... */ }
function exitEditMode() { /* ...código inalterado... */ }

document.addEventListener('DOMContentLoaded', () => { /* ...código inalterado... */ });
