// js/alarms-manage.js

import { supabase } from './services.js';
import { setAlarmsData, getAlarmsData, getLastCreatedAlarmId, setLastCreatedAlarmId } from './state.js';
import { enterEditMode } from './alarms-create.js'; // Importa a função de edição do alarms-create.js

// --- LÓGICA DO MODAL DO GRÁFICO (CENTRALIZADA AQUI PARA ALARMES) ---
const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

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

// Configura os listeners do modal de gráfico
if (chartModal) {
    closeChartModalBtn.addEventListener('click', closeChartModal);
    chartModal.addEventListener('click', (e) => { if (e.target.id === 'chart-modal') closeChartModal(); });
}

// --- FUNÇÕES DE GESTÃO DE ALARMES ---

async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');
    if (!activeTbody || !triggeredTbody) return;

    try {
        activeTbody.innerHTML = '<tr><td colspan="4">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        
        const { data, error } = await supabase.from('alarms').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        setAlarmsData(data); // Guarda os dados no estado global
        const activeAlarmsHtml = [], triggeredAlarmsHtml = [];

        for (const alarm of data) {
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            let alarmDescription = '';
            // Lógica de descrição do alarme (mantida)
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'rsi_level') { alarmDescription = `RSI(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'stochastic_crossover') { alarmDescription = `Estocástico %K(${alarm.indicator_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D(${alarm.combo_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço testa a EMA(${alarm.ema_period}) como ${alarm.condition === 'test_support' ? 'SUPORTE' : 'RESISTÊNCIA'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'test_support' ? `testa a EMA (Suporte)` : `testa a EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }
            
            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${alarm.asset_pair}`;
            const addOpportunityUrl = `index.html?assetPair=${alarm.asset_pair}`;
            const assetHtml = `<strong><a href="asset-details.html?symbol=${alarm.asset_pair}" class="asset-link">${alarm.asset_pair}</a></strong>`;

            if (alarm.status === 'active') {
                activeAlarmsHtml.push(`
                    <tr data-alarm-id="${alarm.id}">
                        <td data-label="Ativo"><span class="cell-value">${assetHtml}</span></td>
                        <td data-label="Condição"><span class="cell-value description">${alarmDescription}</span></td>
                        <td data-label="Data Criação"><span class="cell-value">${formattedDate}</span></td>
                        <td data-label="Ações">
                            <div class="action-buttons cell-value">
                                <a href="alarms-create.html?editAlarmId=${alarm.id}" class="icon-action-btn" title="Editar Alarme"><i class="fa-solid fa-pencil"></i></a>
                                <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme"><i class="fa-solid fa-trash"></i></button>
                                <a href="#" class="icon-action-btn view-chart-btn" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></a>
                                <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                                <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><i class="fa-solid fa-plus"></i></a>
                            </div>
                        </td>
                    </tr>`);
            } else {
                const triggeredDate = alarm.triggered_at ? new Date(alarm.triggered_at).toLocaleString('pt-PT') : new Date(alarm.created_at).toLocaleString('pt-PT');
                triggeredAlarmsHtml.push(`
                    <tr data-alarm-id="${alarm.id}">
                        <td data-label="Ativo"><span class="cell-value">${assetHtml}</span></td>
                        <td data-label="Condição"><span class="cell-value description">${alarmDescription}</span></td>
                        <td data-label="Status"><span class="cell-value"><span class="status-badge status-closed">Disparado</span></span></td>
                        <td data-label="Data Disparo"><span class="cell-value">${triggeredDate}</span></td>
                        <td data-label="Ações">
                            <div class="action-buttons cell-value">
                                <button class="icon-action-btn delete-btn" data-id="${alarm.id}" title="Apagar Alarme"><i class="fa-solid fa-trash"></i></button>
                                <a href="#" class="icon-action-btn view-chart-btn" data-symbol="${alarm.asset_pair}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></a>
                                <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                                <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><i class="fa-solid fa-plus"></i></a>
                            </div>
                        </td>
                    </tr>`);
            }
        }
        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';

        // Lógica de destaque do último alarme criado
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
        fetchAndDisplayAlarms(); // Atualiza a tabela após apagar
    } catch (error) { 
        console.error("Erro ao apagar alarme:", error); 
        alert("Erro ao apagar alarme.");
    }
}


// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    // Listener para delegação de eventos para botões de ação nas tabelas
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                deleteAlarm(deleteBtn.getAttribute('data-id'));
                return;
            }
            const chartBtn = e.target.closest('.view-chart-btn');
            if (chartBtn) {
                e.preventDefault(); // Impede o link de navegar
                const symbol = chartBtn.dataset.symbol;
                if (symbol) openChartModal(symbol);
                return;
            }
            // NOVO: Redireciona para a página de criação/edição ao clicar no botão de editar
            const editLink = e.target.closest('a[href^="alarms-create.html?editAlarmId="]');
            if (editLink) {
                // Ao clicar no link, o browser já fará a navegação,
                // mas garantimos que a lógica de estado é preparada, se necessário,
                // ou que o alarms-create.js pode ler o ID da URL.
            }
        });
    }

    // Busca e exibe os alarmes ao carregar a página
    fetchAndDisplayAlarms();
});
