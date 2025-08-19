// js/alarms-manage.js

import { supabase } from './services.js';
import { setAlarmsData, getLastCreatedAlarmId, setLastCreatedAlarmId } from './state.js';
import { enterEditMode } from './alarms-create.js';
import { openChartModal } from './chart-modal.js';

let chartModal = null;
let closeChartModalBtn = null;
let chartContainer = null;
let monitoredAssets = new Set();
let currentApexChart = null; 

async function openRsiTrendlineChartModal(alarm) {
    if (!chartModal || !chartContainer) return;
    
    if (currentApexChart) {
        currentApexChart.destroy();
        currentApexChart = null;
    }
    
    chartContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">A gerar visualização da linha de tendência...</p>';
    chartModal.style.display = 'flex';

    try {
        const { data, error } = await supabase.functions.invoke('get-rsi-trendline-data', {
            body: {
                asset_pair: alarm.asset_pair,
                indicator_timeframe: alarm.indicator_timeframe,
                indicator_period: alarm.indicator_period,
                trendline_type: alarm.trendline_type
            }
        });
        
        if (error) {
            const errorMessage = data ? data.error : (error.message || "Erro desconhecido.");
            throw new Error(errorMessage);
        }

        const options = {
            series: [
                { name: 'RSI', type: 'line', data: data.rsi_series },
                { name: 'Linha de Tendência', type: 'line', data: data.trendline_series }
            ],
            chart: { type: 'line', height: '100%', toolbar: { show: true } },
            stroke: {
                width: [1, 2],
                dashArray: [0, 5]
            },
            colors: ['#008FFB', '#00E396'],
            annotations: {
                points: [
                    { x: data.p1.x, y: data.p1.y, marker: { size: 4, fillColor: '#FF4560', strokeColor: '#fff', strokeWidth: 2, radius: 2 } },
                    { x: data.p2.x, y: data.p2.y, marker: { size: 4, fillColor: '#FF4560', strokeColor: '#fff', strokeWidth: 2, radius: 2 } },
                    { x: data.p3.x, y: data.p3.y, marker: { size: 4, fillColor: '#FF4560', strokeColor: '#fff', strokeWidth: 2, radius: 2 } }
                ]
            },
            tooltip: {
                enabled: true,
                shared: false,
                intersect: true,
                y: {
                    formatter: function (value, { seriesIndex }) {
                        if (seriesIndex === 1) return undefined;
                        return value ? value.toFixed(2) : value;
                    }
                }
            },
            title: {
                text: `Visualização da Linha de Tendência RSI para ${alarm.asset_pair} (${alarm.indicator_timeframe})`,
                align: 'center'
            },
            xaxis: { type: 'numeric', title: { text: 'Índice da Vela' } },
            yaxis: { title: { text: 'Valor do RSI' } },
            theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
        };

        chartContainer.innerHTML = '';
        currentApexChart = new ApexCharts(chartContainer, options);
        currentApexChart.render();

    } catch (err) {
        console.error("Erro ao gerar gráfico de L.T.:", err);
        chartContainer.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Não foi possível gerar a visualização: ${err.message}</p>`;
    }
}

async function fetchMonitoredAssets() {
    try {
        const { data, error } = await supabase
            .from('alarms')
            .select('asset_pair')
            .eq('status', 'active');
        if (error) {
            console.error("Erro ao buscar ativos monitorizados:", error);
            return;
        }
        monitoredAssets = new Set(data.map(item => item.asset_pair));
    } catch (err) {
        console.error("Exceção ao buscar ativos monitorizados:", err);
    }
}

async function handleMonitorAssetClick(symbol) {
    const button = document.querySelector(`button[data-action="monitor"][data-symbol="${symbol}"]`);
    if (button) button.disabled = true;

    try {
        const alarmData = {
            asset_pair: symbol,
            alarm_type: 'stochastic_crossover',
            condition: 'above',
            indicator_timeframe: '15m',
            indicator_period: 7,
            combo_period: 3,
            status: 'active'
        };
        const { error } = await supabase.from('alarms').insert([alarmData]);
        if (error) throw error;

        if (button) {
            monitoredAssets.add(symbol);
            button.innerHTML = `<span class="material-symbols-outlined">check</span>`;
            button.classList.add('monitored');
            button.title = "Ativo já está a ser monitorizado";
        }
    } catch (error) {
        console.error(`Erro ao criar alarme para ${symbol}:`, error);
        alert(`Não foi possível criar o alarme para ${symbol}. Verifique se já existe um alarme similar.`);
        if (button) button.disabled = false;
    }
}

async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');
    if (!activeTbody || !triggeredTbody) return;

    try {
        activeTbody.innerHTML = '<tr><td colspan="4">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        
        await fetchMonitoredAssets();

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
            const assetHtml = `<strong><a href="asset-details.html?symbol=${alarm.asset_pair}" class="asset-link">${alarm.asset_pair}</a></strong>`;
            
            const isMonitored = monitoredAssets.has(alarm.asset_pair);
            const monitorButtonHtml = isMonitored
                ? `<button class="icon-action-btn monitored" title="Ativo já está a ser monitorizado" disabled><span class="material-symbols-outlined">check</span></button>`
                : `<button class="icon-action-btn" data-action="monitor" data-symbol="${alarm.asset_pair}" title="Monitorizar Ativo"><span class="material-symbols-outlined">visibility</span></button>`;
            
            let trendlineButtonHtml = '';
            if (alarm.alarm_type === 'rsi_trendline_break') {
                const alarmDataString = encodeURIComponent(JSON.stringify(alarm));
                trendlineButtonHtml = `<button class="icon-action-btn btn-view-trendline" data-action="view-trendline" data-alarm='${alarmDataString}' title="Visualizar Linha de Tendência"><span class="material-symbols-outlined">analytics</span></button>`;
            }

            activeAlarmsHtml.push(`
                <tr data-alarm-id="${alarm.id}">
                    <td data-label="Ativo"><span class="cell-value">${assetHtml}</span></td>
                    <td data-label="Condição"><span class="cell-value description">${alarmDescription}</span></td>
                    <td data-label="Data Criação"><span class="cell-value">${formattedDate}</span></td>
                    <td data-label="Ações">
                        <div class="action-buttons cell-value">
                            <a href="alarms-create.html?editAlarmId=${alarm.id}" class="icon-action-btn" title="Editar Alarme"><span class="material-symbols-outlined">edit</span></a>
                            <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme"><span class="material-symbols-outlined">delete</span></button>
                            ${trendlineButtonHtml}
                            <a href="#" class="icon-action-btn view-chart-btn btn-view-chart" data-action="view-chart" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><span class="material-symbols-outlined">monitoring</span></a>
                            <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn btn-trading-view" title="Abrir no TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                            ${monitorButtonHtml} 
                        </div>
                    </td>
                </tr>`);
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
            const assetHtml = `<strong><a href="asset-details.html?symbol=${alarm.asset_pair}" class="asset-link">${alarm.asset_pair}</a></strong>`;
            
            const isMonitored = monitoredAssets.has(alarm.asset_pair);
            const monitorButtonHtml = isMonitored
                ? `<button class="icon-action-btn monitored" title="Ativo já está a ser monitorizado" disabled><span class="material-symbols-outlined">check</span></button>`
                : `<button class="icon-action-btn" data-action="monitor" data-symbol="${alarm.asset_pair}" title="Monitorizar Ativo"><span class="material-symbols-outlined">visibility</span></button>`;

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
                            <a href="#" class="icon-action-btn view-chart-btn btn-view-chart" data-action="view-chart" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><span class="material-symbols-outlined">monitoring</span></a>
                            <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn btn-trading-view" title="Abrir no TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                            ${monitorButtonHtml}
                        </div>
                    </td>
                </tr>`);
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
        chartModal.addEventListener('click', (e) => { 
            if (e.target.id === 'chart-modal' || e.target.id === 'close-chart-modal') {
                if (currentApexChart) {
                    currentApexChart.destroy();
                    currentApexChart = null;
                }
                chartContainer.innerHTML = '';
                chartModal.style.display = 'none';
            }
        });
    }

    const mainContainer = document.querySelector('main');
    if (!mainContainer) return; 

    mainContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button, a');
        if (!targetButton) return;

        const action = targetButton.dataset.action;
        const symbol = targetButton.dataset.symbol;
        const alarmId = targetButton.dataset.id;

        if (targetButton.classList.contains('delete-btn') && alarmId) {
            deleteAlarm(alarmId);
            return;
        }
        
        if (action === 'view-chart' && symbol) {
            e.preventDefault();
            openChartModal(symbol, '15m');
            return;
        }
        
        if (action === 'monitor' && symbol) {
            e.preventDefault();
            handleMonitorAssetClick(symbol);
            return;
        }
        if (action === 'view-trendline') {
            e.preventDefault();
            const alarmData = JSON.parse(decodeURIComponent(targetButton.dataset.alarm));
            openRsiTrendlineChartModal(alarmData);
            return;
        }
    });

    const deleteHistoryBtn = document.getElementById('delete-history-btn');
    if (deleteHistoryBtn) {
        deleteHistoryBtn.addEventListener('click', deleteAllTriggeredAlarms);
    }

    fetchAndDisplayAlarms();
});
