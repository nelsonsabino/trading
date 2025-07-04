// js/alarms.js (VERSÃO COM ALARMES DE PREÇO, ESTOCÁSTICO E RSI-MA)

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
let selectedCoin = null;
let debounceTimer;
let editingAlarmId = null;
window.alarmsData = [];

// --- FUNÇÃO PRINCIPAL PARA BUSCAR E MOSTRAR TODOS OS ALARMES ---
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
        
        const activeAlarmsHtml = [];
        const triggeredAlarmsHtml = [];

        for (const alarm of data) {
            const conditionClass = alarm.condition === 'above' ? 'condition-above' : 'condition-below';
            const conditionText = alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO';
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            const assetDisplay = `${alarm.asset_id} (${alarm.asset_symbol})`;

            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') {
                alarmDescription = `Estocástico(${alarm.indicator_period}) ${conditionText} de ${alarm.target_price} no ${alarm.indicator_timeframe}`;
            } else if (alarm.alarm_type === 'rsi_crossover') {
                 alarmDescription = `RSI(${alarm.rsi_period}) cruza ${conditionText} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`;
            } else {
                alarmDescription = `Preço ${conditionText} de ${alarm.target_price} USD`;
            }

            if (alarm.status === 'active') {
                activeAlarmsHtml.push(`
                    <tr>
                        <td><strong>${assetDisplay}</strong></td>
                        <td class="${conditionClass}">${alarmDescription}</td>
                        <td>${formattedDate}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn edit-btn" data-id="${alarm.id}">Editar</button>
                                <button class="btn delete-btn" data-id="${alarm.id}">Apagar</button>
                            </div>
                        </td>
                    </tr>
                `);
            } else {
                triggeredAlarmsHtml.push(`
                    <tr>
                        <td><strong>${assetDisplay}</strong></td>
                        <td class="${conditionClass}">${alarmDescription}</td>
                        <td><span class="status-badge status-closed">Disparado</span></td>
                        <td>${formattedDate}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn delete-btn" data-id="${alarm.id}">Apagar</button>
                            </div>
                        </td>
                    </tr>
                `);
            }
        }

        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';

    } catch (error) {
        console.error("Erro ao buscar alarmes:", error);
    }
}

// --- FUNÇÃO PARA APAGAR UM ALARME ---
async function deleteAlarm(alarmId) {
    if (!confirm("Tem a certeza que quer apagar este registo?")) return;
    try {
        const { error } = await supabase.from('alarms').delete().eq('id', alarmId);
        if (error) throw error;
        fetchAndDisplayAlarms();
    } catch (error) {
        console.error("Erro ao apagar alarme:", error);
        alert("Não foi possível apagar o alarme.");
    }
}

// --- FUNÇÕES PARA GERIR O MODO DE EDIÇÃO ---
function enterEditMode(alarm) {
    editingAlarmId = alarm.id;
    selectedCoin = { id: alarm.asset_id, name: alarm.asset_id, symbol: alarm.asset_symbol };

    document.getElementById('alarm-asset').value = `${alarm.asset_id} (${alarm.asset_symbol})`;
    const alarmType = alarm.alarm_type || 'price';
    document.getElementById('alarm-type-select').value = alarmType;
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));

    if (alarmType === 'stochastic') {
        document.getElementById('stoch-condition').value = alarm.condition;
        document.getElementById('stoch-value').value = alarm.target_price;
        document.getElementById('stoch-period').value = alarm.indicator_period;
        document.getElementById('stoch-timeframe').value = alarm.indicator_timeframe;
   } else if (alarmType === 'rsi_crossover') {
    document.getElementById('rsi-condition').value = alarm.condition;
    document.getElementById('rsi-timeframe').value = alarm.indicator_timeframe;    
} else {
        document.getElementById('alarm-condition-standalone').value = alarm.condition;
        document.getElementById('alarm-price-standalone').value = alarm.target_price;
    }
    
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Atualizar Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitEditMode() {
    editingAlarmId = null;
    selectedCoin = null;
    document.getElementById('alarm-form').reset();
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Definir Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}


// --- LÓGICA PRINCIPAL QUANDO A PÁGINA CARREGA ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayAlarms();

    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const mainContainer = document.querySelector('main');
    const alarmTypeSelect = document.getElementById('alarm-type-select');
    const priceFields = document.getElementById('price-fields');
    const stochasticFields = document.getElementById('stochastic-fields');
    const rsiFields = document.getElementById('rsi-fields');

    alarmTypeSelect.addEventListener('change', () => {
        const type = alarmTypeSelect.value;
        priceFields.style.display = type === 'price' ? 'block' : 'none';
        stochasticFields.style.display = type === 'stochastic' ? 'block' : 'none';
        rsiFields.style.display = type === 'rsi_crossover' ? 'block' : 'none';
    });

    mainContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-btn')) {
            deleteAlarm(target.getAttribute('data-id'));
        }
        if (target.classList.contains('edit-btn')) {
            const alarmToEdit = window.alarmsData.find(a => a.id === target.getAttribute('data-id'));
            if (alarmToEdit) enterEditMode(alarmToEdit);
        }
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', exitEditMode);

    assetInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = assetInput.value.trim();
        if (editingAlarmId) exitEditMode();
        selectedCoin = null;
        if (query.length < 2) { resultsDiv.style.display = 'none'; return; }
        debounceTimer = setTimeout(async () => {
            try {
                const { data: results, error } = await supabase.functions.invoke('search-coins', { body: { query } });
                if (error) throw error;
                resultsDiv.innerHTML = '';
                if (results.length > 0) {
                    results.forEach(coin => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.innerHTML = `<img src="${coin.thumb}" width="20" height="20" style="margin-right: 10px;"> <strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})`;
                        item.addEventListener('click', () => {
                            assetInput.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
                            selectedCoin = coin;
                            resultsDiv.style.display = 'none';
                        });
                        resultsDiv.appendChild(item);
                    });
                    resultsDiv.style.display = 'block';
                } else {
                    resultsDiv.style.display = 'none';
                }
            } catch (err) {
                console.error("Erro ao buscar moedas:", err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => { if (e.target !== assetInput) resultsDiv.style.display = 'none'; });

    alarmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
            if (!selectedCoin) {
                throw new Error("Por favor, selecione uma moeda válida da lista de sugestões.");
            }

            const alarmType = document.getElementById('alarm-type-select').value;
            let alarmData = {
                asset_id: selectedCoin.id,
                asset_symbol: selectedCoin.symbol.toUpperCase(),
                alarm_type: alarmType,
            };

            if (alarmType === 'price') {
                const targetPrice = parseFloat(document.getElementById('alarm-price-standalone').value);
                if (isNaN(targetPrice) || targetPrice <= 0) throw new Error("Preço alvo inválido.");
                alarmData.condition = document.getElementById('alarm-condition-standalone').value;
                alarmData.target_price = targetPrice;
            } else if (alarmType === 'stochastic') {
                const targetValue = parseFloat(document.getElementById('stoch-value').value);
                const period = parseInt(document.getElementById('stoch-period').value);
                if (isNaN(targetValue) || isNaN(period)) throw new Error("Valores do indicador inválidos.");
                alarmData.condition = document.getElementById('stoch-condition').value;
                alarmData.target_price = targetValue;
                alarmData.indicator_period = period;
                alarmData.indicator_timeframe = document.getElementById('stoch-timeframe').value;
           } else { // rsi_crossover
    // Os períodos agora são definidos diretamente no código
    const rsiPeriod = 14;
    const rsiMaPeriod = 14;
    
    alarmData.condition = document.getElementById('rsi-condition').value;
    alarmData.indicator_timeframe = document.getElementById('rsi-timeframe').value;
    alarmData.rsi_period = rsiPeriod; // Sempre 14
    alarmData.rsi_ma_period = rsiMaPeriod; // Sempre 14
    alarmData.target_price = null; // Não aplicável para crossover
}

            let error;
            if (editingAlarmId) {
                const { error: updateError } = await supabase.from('alarms').update(alarmData).eq('id', editingAlarmId);
                error = updateError;
            } else {
                alarmData.status = 'active';
                const { error: insertError } = await supabase.from('alarms').insert([alarmData]);
                error = insertError;
            }

            if (error) throw error;

            feedbackDiv.textContent = `✅ Operação concluída com sucesso!`;
            feedbackDiv.style.color = '#28a745';
            exitEditMode();
            fetchAndDisplayAlarms();

        } catch (error) {
            console.error("Erro na operação do alarme:", error);
            feedbackDiv.textContent = `Erro: ${error.message}`;
            feedbackDiv.style.color = '#dc3545';
        } finally {
            submitButton.disabled = false;
        }
    });
});
