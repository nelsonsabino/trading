// js/alarms-manage.js

import { supabase } from './services.js';
import { setAlarmsData, getLastCreatedAlarmId, setLastCreatedAlarmId } from './state.js';
import { enterEditMode } from './alarms-create.js';

// --- LÓGICA DO MODAL DO GRÁFICO ---

let chartModal = null;
let closeChartModalBtn = null;
let chartContainer = null;

export function openChartModal(symbol) {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
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


// --- FUNÇÕES DE GESTÃO DE ALARMES ---

async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');
    if (!activeTbody || !triggeredTbody) return;

    try {
        activeTbody.innerHTML = '<tr><td colspan="4">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        
        const [activeAlarmsResponse, triggeredAlarmsResponse] = await Promise.all([
            supabase.from('alarms').select('*').eq('status', 'active').order('created_at', { ascending: false }),
            supabase.from('alarms').select('*').eq('status', 'triggered').order('triggered_at', { ascending: false })
        ]);

        if (activeAlarmsResponse.error) throw activeAlarmsResponse.error;
        if (triggeredAlarmsResponse.error) throw triggeredAlarmsResponse.error;

        const activeAlarms = activeAlarmsResponse.data;
        const triggeredAlarms = triggeredAlarmsResponse.data;
        const allAlarms = [...activeAlarms, ...triggeredAlarms];

        setAlarmsData(allAlarms);
        sessionStorage.setItem('allAlarmsData', JSON.stringify(allAlarms));

        const activeAlarmsHtml = [], triggeredAlarmsHtml = [];

        for (const alarm of activeAlarms) {
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'rsi_level') { alarmDescription = `RSI(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'stochastic_crossover') { alarmDescription = `Estocástico %K(${alarm.indicator_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D(${alarm.combo_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço testa a EMA(${alarm.ema_period}) como ${alarm.condition === 'test_support' ? 'SUPORTE' : 'RESISTÊNCIA'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'test_support' ? `testa a EMA (Suporte)` : `testa a EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_trendline') { 
                const trendTypeText = alarm.trendline_type === 'support' ? 'Suporte (Fundos Ascendentes)' : 'Resistência (Picos Descendentes)';
                alarmDescription = `Aguardando ${alarm.touch_count}º toque na L.T. de ${trendTypeText} no ${alarm.indicator_timeframe}`;
            }
            else if (alarm.alarm_type === 'rsi_trendline_break') {
                const trendTypeText = alarm.trendline_type === 'support' ? 'Suporte (LTA)' : 'Resistência (LTB)';
                alarmDescription = `A monitorizar quebra da L.T. de ${trendTypeText} no ${alarm.indicator_timeframe}`;
            }
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }
            
            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${alarm.asset_pair}`;
            const addOpportunityUrl = `dashboard.html?assetPair=${alarm.asset_pair}`;
            const assetHtml = `<strong><a href="asset-details.html?symbol=${alarm.asset_pair}" class="asset-link">${alarm.asset_pair}</a></strong>`;

            // --- INÍCIO DA ALTERAÇÃO ---
            activeAlarmsHtml.push(`
                <tr data-alarm-id="${alarm.id}">
                    <td data-label="Ativo"><span class="cell-value">${assetHtml}</span></td>
                    <td data-label="Condição"><span class="cell-value description">${alarmDescription}</span></td>
                    <td data-label="Data Criação"><span class="cell-value">${formattedDate}</span></td>
                    <td data-label="Ações">
                        <div class="action-buttons cell-value">
                            <a href="alarms-create.html?editAlarmId=${alarm.id}" class="icon-action-btn" title="Editar Alarme"><span class="material-symbols-outlined">edit</span></a>
                            <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme"><span class="material-symbols-outlined">delete</span></button>
                            <a href="#" class="icon-action-btn view-chart-btn btn-view-chart" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><span class="material-symbols-outlined">monitoring</span></a>
                            <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn btn-trading-view" title="Abrir no TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                            <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><span class="material-symbols-outlined">add</span></a>
                        </div>
                    </td>
                </tr>`);
            // --- FIM DA ALTERAÇÃO ---
        }

        for (const alarm of triggeredAlarms) {
            const triggeredDate = alarm.triggered_at ? new Date(alarm.triggered_at).toLocaleString('pt-PT') : new Date(alarm.created_at).toLocaleString('pt-PT');
            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'rsi_level') { alarmDescription = `RSI(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'stochastic_crossover') { alarmDescription = `Estocástico %K(${alarm.indicator_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D(${alarm.combo_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço testa a EMA(${alarm.ema_period}) como ${alarm.condition === 'test_support' ? 'SUPORTE' : 'RESISTÊNCIA'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'test_support' ? `testa a EMA (Suporte)` : `testa a EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_trendline') { 
                const trendTypeText = alarm.trendline_type === 'support' ? 'Suporte (Fundos Ascendentes)' : 'Resistência (Picos Descendentes)';
                alarmDescription = `Detetado ${alarm.touch_count}º toque na L.T. de ${trendTypeText} no ${alarm.indicator_timeframe}`;
            }
            else if (alarm.alarm_type === 'rsi_trendline_break') {
                const trendTypeText = alarm.trendline_type === 'support' ? 'Suporte (LTA)' : 'Resistência (LTB)';
                alarmDescription = `Quebra da L.T. de ${trendTypeText} no ${alarm.indicator_timeframe}`;
            }
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }

            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${alarm.asset_pair}`;
            const addOpportunityUrl = `dashboard.html?assetPair=${alarm.asset_pair}`;
            const assetHtml = `<strong><a href="asset-details.html?symbol=${alarm.asset_pair}" class="asset-link">${alarm.asset_pair}</a></strong>`;

            // --- INÍCIO DA ALTERAÇÃO ---
            triggeredAlarmsHtml.push(`
                <tr data-alarm-id="${alarm.id}">
                    <td data-label="Ativo"><span class="cell-value">${assetHtml}</span></td>
                    <td data-label="Condição"><span class="cell-value description">${alarmDescription}</span></td>
                    <td data-label="Status"><span class="cell-value"><span class="status-badge status-closed">Disparado</span></span></td>
                    <td data-label="Data Disparo"><span class="cell-value">${triggeredDate}</span></td>
                    <td data-label="Ações">
                        <div class="action-buttons cell-value">
                            <a href="alarms-create.html?editAlarmId=${alarm.id}" class="icon-action-btn" title="Editar / Reativar Alarme"><span class="material-symbols-outlined">edit</span></a>
                            <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme do Histórico"><span class="material-symbols-outlined">delete</span></button>
                            <a href="#" class="icon-action-btn view-chart-btn btn-view-chart" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><span class="material-symbols-outlined">monitoring</span></a>
                            <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn btn-trading-view" title="Abrir no TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                            <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><span class="material-symbols-outlined">add</span></a>
                        </div>
                    </td>
                </tr>`);
            // --- FIM DA ALTERAÇÃO ---
        }
        
        activeTbody.innerHTML = activeAlarms.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarms.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';

        const lastId = getLastCreatedAlarmId();
        if (lastId) {
            const newRow = document.querySelector(`tr[data-alarm-id="${lastId}"]`);
            if (newRow) {
                newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newRow.classList.add('new-item-flash');
            }
            setLastCreatedAlarmId(null);
        }

    } catch (error) { 
        console.error("Erro ao buscar alarmes:", error); 
        activeTbody.innerHTML = '<tr><td colspan="4" style="color:red;text-align:center;">Erro ao carregar alarmes.</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">Erro ao carregar alarmes.</td></tr>';
    }
}

async function deleteAlarm(alarmId) {
    if (!confirm("Tem a certeza que quer apagar este registo?")) return;
    try { 
        await supabase.from('alarms').delete().eq('id', alarmId); 
        fetchAndDisplayAlarms();
    } catch (error) { 
        console.error("Erro ao apagar alarme:", error); 
        alert("Erro ao apagar alarme.");
    }
}

async function deleteAllTriggeredAlarms() {
    const confirmation = confirm("TEM A CERTEZA?\n\nEsta ação irá apagar permanentemente TODO o histórico de alarmes disparados. Esta ação é irreversível.");
    if (confirmation) {
        try {
            const { error } = await supabase
                .from('alarms')
                .delete()
                .eq('status', 'triggered');

            if (error) throw error;

            alert("Histórico de alarmes apagado com sucesso!");
            fetchAndDisplayAlarms();
        } catch (error) {
            console.error("Erro ao apagar o histórico de alarmes:", error);
            alert("Ocorreu um erro ao apagar o histórico. Verifique a consola para mais detalhes.");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    chartModal = document.getElementById('chart-modal');
    closeChartModalBtn = document.getElementById('close-chart-modal');
    chartContainer = document.getElementById('chart-modal-container');

    if (chartModal && closeChartModalBtn) {
        closeChartModalBtn.addEventListener('click', closeChartModal);
        chartModal.addEventListener('click', (e) => { if (e.target.id === 'chart-modal') closeChartModal(); });
    }

    const mainContainer = document.querySelector('main');
    const activeAlarmsTable = document.getElementById('active-alarms-tbody');
    if (!mainContainer || !activeAlarmsTable) {
        return; 
    }

    mainContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            deleteAlarm(deleteBtn.getAttribute('data-id'));
            return;
        }
        const chartBtn = e.target.closest('.view-chart-btn');
        if (chartBtn) {
            e.preventDefault();
            const symbol = chartBtn.dataset.symbol;
            if (symbol) openChartModal(symbol);
            return;
        }
    });

    const deleteHistoryBtn = document.getElementById('delete-history-btn');
    if (deleteHistoryBtn) {
        deleteHistoryBtn.addEventListener('click', deleteAllTriggeredAlarms);
    }

    fetchAndDisplayAlarms();
});
