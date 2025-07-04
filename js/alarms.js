// js/alarms.js (VERSÃO COM FORMULÁRIO COMBO INTELIGENTE E VALORES AUTOMÁTICOS)

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
        const activeAlarmsHtml = [], triggeredAlarmsHtml = [];

        for (const alarm of data) {
            const conditionClass = (alarm.condition === 'above' || alarm.condition === 'touch_from_below') ? 'condition-above' : 'condition-below';
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            const assetDisplay = `${alarm.asset_id} (${alarm.asset_symbol})`;

            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') {
                alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`;
            } else if (alarm.alarm_type === 'rsi_crossover') {
                alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`;
            } else if (alarm.alarm_type === 'ema_touch') {
                alarmDescription = `Preço toca na EMA(${alarm.ema_period}) por ${alarm.condition === 'touch_from_below' ? 'BAIXO (Suporte)' : 'CIMA (Resistência)'} no ${alarm.indicator_timeframe}`;
            } else if (alarm.alarm_type === 'combo') {
                const primaryCondition = alarm.condition === 'touch_from_above' ? 'toca na EMA (Suporte)' : 'toca na EMA (Resistência)';
                const secondaryCondition = alarm.combo_condition === 'below' ? 'está abaixo de' : 'está acima de';
                alarmDescription = `CONFLUÊNCIA: ${primaryCondition} E Estocástico ${secondaryCondition} ${alarm.combo_target_price} no ${alarm.indicator_timeframe}`;
            } else {
                alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`;
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
                        <td><div class="action-buttons"><button class="btn delete-btn" data-id="${alarm.id}">Apagar</button></div></td>
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

async function deleteAlarm(alarmId) {
    if (!confirm("Tem a certeza que quer apagar este registo?")) return;
    try {
        await supabase.from('alarms').delete().eq('id', alarmId);
        fetchAndDisplayAlarms();
    } catch (error) {
        console.error("Erro ao apagar alarme:", error);
    }
}

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
    } else if (alarmType === 'ema_touch') {
        document.getElementById('ema-condition').value = alarm.condition;
        document.getElementById('ema-period').value = alarm.ema_period;
        document.getElementById('ema-timeframe').value = alarm.indicator_timeframe;
    } else if (alarmType === 'combo') {
        document.getElementById('combo-primary-trigger').value = alarm.condition;
        document.getElementById('combo-ema-period').value = alarm.ema_period;
        document.getElementById('combo-stoch-condition').value = alarm.combo_condition;
        document.getElementById('combo-stoch-value').value = alarm.combo_target_price;
        document.getElementById('combo-timeframe').value = alarm.indicator_timeframe;
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
    const emaFields = document.getElementById('ema-fields');
    const comboFields = document.getElementById('combo-fields');
    const comboStochCondition = document.getElementById('combo-stoch-condition');
    const comboStochValue = document.getElementById('combo-stoch-value');

    // Lógica para mudar o valor alvo do Estocástico automaticamente no formulário Combo
    if (comboStochCondition && comboStochValue) {
        comboStochCondition.addEventListener('change', () => {
            comboStochValue.value = (comboStochCondition.value === 'below') ? 20 : 80;
        });
    }

    alarmTypeSelect.addEventListener('change', () => {
        const type = alarmTypeSelect.value;
        priceFields.style.display = type === 'price' ? 'block' : 'none';
        stochasticFields.style.display = type === 'stochastic' ? 'block' : 'none';
        rsiFields.style.display = type === 'rsi_crossover' ? 'block' : 'none';
        emaFields.style.display = type === 'ema_touch' ? 'block' : 'none';
        comboFields.style.display = type === 'combo' ? 'block' : 'none';
    });

    mainContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-btn')) deleteAlarm(target.getAttribute('data-id'));
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
            } catch (err) { console.error("Erro ao buscar moedas:", err); }
        }, 300);
    });

    document.addEventListener('click', (e) => { if (e.target !== assetInput) resultsDiv.style.display = 'none'; });

    alarmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
            if (!selectedCoin) throw new Error("Por favor, selecione uma moeda válida.");

            const alarmType = alarmTypeSelect.value;
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
                if (isNaN(targetValue) || isNaN(period)) throw new Error("Valores do Estocástico inválidos.");
                alarmData.condition = document.getElementById('stoch-condition').value;
                alarmData.target_price = targetValue;
                alarmData.indicator_period = period;
                alarmData.indicator_timeframe = document.getElementById('stoch-timeframe').value;
            } else if (alarmType === 'rsi_crossover') {
                alarmData.condition = document.getElementById('rsi-condition').value;
                alarmData.indicator_timeframe = document.getElementById('rsi-timeframe').value;
                alarmData.rsi_period = 14;
                alarmData.rsi_ma_period = 14;
            } else if (alarmType === 'ema_touch') {
                const period = parseInt(document.getElementById('ema-period').value);
                if (isNaN(period)) throw new Error("Período da EMA inválido.");
                alarmData.condition = document.getElementById('ema-condition').value;
                alarmData.indicator_timeframe = document.getElementById('ema-timeframe').value;
                alarmData.ema_period = period;
            } else if (alarmType === 'combo') {
                alarmData.condition = document.getElementById('combo-primary-trigger').value;
                alarmData.indicator_timeframe = document.getElementById('combo-timeframe').value;
                alarmData.ema_period = parseInt(document.getElementById('combo-ema-period').value);
                alarmData.combo_indicator = 'stochastic';
                alarmData.combo_condition = document.getElementById('combo-stoch-condition').value;
                alarmData.combo_target_price = parseInt(document.getElementById('combo-stoch-value').value);
                alarmData.combo_period = 14; // Período do Estocástico fixo em 14
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
            exitEditMode();
            fetchAndDisplayAlarms();

        } catch (error) {
            console.error("Erro na operação do alarme:", error);
            feedbackDiv.textContent = `Erro: ${error.message}`;
        } finally {
            submitButton.disabled = false;
        }
    });
});
