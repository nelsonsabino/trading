// js/alarms.js - VERSÃO COM ALARME DE NÍVEL DE RSI

import { supabase } from './services.js';
import { setupAutocomplete } from './utils.js';

let editingAlarmId = null;
window.alarmsData = [];

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
            // --- ATUALIZAÇÃO DA DESCRIÇÃO ---
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'rsi_level') { alarmDescription = `RSI(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; }
            else if (alarm.alarm_type === 'stochastic_crossover') { alarmDescription = `Estocástico %K(${alarm.indicator_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D(${alarm.combo_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço testa a EMA(${alarm.ema_period}) como ${alarm.condition === 'test_support' ? 'SUPORTE' : 'RESISTÊNCIA'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'test_support' ? `testa a EMA (Suporte)` : `testa a EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }
            
            if (alarm.status === 'active') {
                activeAlarmsHtml.push(`<tr><td data-label="Ativo"><span class="cell-value"><strong>${assetDisplay}</strong></span></td><td data-label="Condição" class="${conditionClass}"><span class="cell-value description">${alarmDescription}</span></td><td data-label="Data Criação"><span class="cell-value">${formattedDate}</span></td><td data-label="Ações"><div class="action-buttons cell-value"><button class="btn edit-btn" data-id="${alarm.id}">Editar</button><button class="btn delete-btn" data-id="${alarm.id}">Apagar</button></div></td></tr>`);
            } else {
                const triggeredDate = alarm.triggered_at ? new Date(alarm.triggered_at).toLocaleString('pt-PT') : new Date(alarm.created_at).toLocaleString('pt-PT');
                let tradingViewUrl = '#';
                if (alarm.asset_pair) {
                    tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${alarm.asset_pair}`;
                }
                const chartButtonHtml = `<a href="${tradingViewUrl}" target="_blank" class="btn edit-btn" style="margin-right: 5px;">Gráfico</a>`;
                const deleteButtonHtml = `<button class="btn delete-btn" data-id="${alarm.id}">Apagar</button>`;
                triggeredAlarmsHtml.push(`<tr><td data-label="Ativo"><span class="cell-value"><strong>${assetDisplay}</strong></span></td><td data-label="Condição" class="${conditionClass}"><span class="cell-value description">${alarmDescription}</span></td><td data-label="Status"><span class="cell-value"><span class="status-badge status-closed">Disparado</span></span></td><td data-label="Data Disparo"><span class="cell-value">${triggeredDate}</span></td><td data-label="Ações"><div class="action-buttons cell-value">${chartButtonHtml}${deleteButtonHtml}</div></td></tr>`);
            }
        }
        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';
    } catch (error) { console.error("Erro ao buscar alarmes:", error); }
}

async function deleteAlarm(alarmId) {
    if (!confirm("Tem a certeza que quer apagar este registo?")) return;
    try { await supabase.from('alarms').delete().eq('id', alarmId); fetchAndDisplayAlarms(); } catch (error) { console.error("Erro ao apagar alarme:", error); }
}

function enterEditMode(alarm) {
    editingAlarmId = alarm.id;
    document.getElementById('alarm-asset').value = alarm.asset_pair;
    const alarmType = alarm.alarm_type || 'price';
    document.getElementById('alarm-type-select').value = alarmType;
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));

    // --- ATUALIZAÇÃO PARA EDIÇÃO ---
    if (alarmType === 'stochastic') { /*...*/ }
    else if (alarmType === 'rsi_level') {
        document.getElementById('rsi-level-condition').value = alarm.condition;
        document.getElementById('rsi-level-value').value = alarm.target_price;
        document.getElementById('rsi-level-period').value = alarm.indicator_period;
        document.getElementById('rsi-level-timeframe').value = alarm.indicator_timeframe;
    }
    // ... resto da lógica de edição ...
    else if (alarmType === 'stochastic_crossover') { /*...*/ }
    else if (alarmType === 'rsi_crossover') { /*...*/ }
    else if (alarmType === 'ema_touch') { /*...*/ }
    else if (alarmType === 'combo') { /*...*/ }
    else { /*...*/ }
    
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Atualizar Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitEditMode() {
    editingAlarmId = null;
    document.getElementById('alarm-form').reset();
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Definir Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('asset-current-price').textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayAlarms();
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const mainContainer = document.querySelector('main');
    const alarmTypeSelect = document.getElementById('alarm-type-select');
    
    // --- ATUALIZAÇÃO PARA MOSTRAR/ESCONDER CAMPOS ---
    const fields = {
        price: document.getElementById('price-fields'),
        rsi_level: document.getElementById('rsi-level-fields'), // NOVO
        stochastic: document.getElementById('stochastic-fields'),
        stochastic_crossover: document.getElementById('stoch-crossover-fields'),
        rsi_crossover: document.getElementById('rsi-fields'),
        ema_touch: document.getElementById('ema-fields'),
        combo: document.getElementById('combo-fields')
    };

    alarmTypeSelect.addEventListener('change', () => {
        const selectedType = alarmTypeSelect.value;
        for (const type in fields) {
            if (fields[type]) {
                fields[type].style.display = type === selectedType ? 'block' : 'none';
            }
        }
        // Pré-preenche os valores por defeito para o RSI
        if (selectedType === 'rsi_level') {
            const rsiCondition = document.getElementById('rsi-level-condition');
            const rsiValueInput = document.getElementById('rsi-level-value');
            if (rsiCondition.value === 'below') {
                rsiValueInput.value = 35;
            } else {
                rsiValueInput.value = 70;
            }
        }
    });

    // Listener para alterar o valor default do RSI ao mudar a condição
    const rsiLevelConditionSelect = document.getElementById('rsi-level-condition');
    if(rsiLevelConditionSelect) {
        rsiLevelConditionSelect.addEventListener('change', (e) => {
            const rsiValueInput = document.getElementById('rsi-level-value');
            if(e.target.value === 'below') {
                rsiValueInput.value = 35;
            } else {
                rsiValueInput.value = 70;
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    if (assetPairFromUrl && assetInput) {
        const pair = assetPairFromUrl.toUpperCase();
        assetInput.value = pair;
        fetchPriceForPair(pair); 
    }

    mainContainer.addEventListener('click', (e) => { /*...*/ });
    document.getElementById('cancel-edit-btn').addEventListener('click', exitEditMode);
    setupAutocomplete(assetInput, resultsDiv, async (selectedPair) => fetchPriceForPair(selectedPair));

    // --- ATUALIZAÇÃO NA SUBMISSÃO DO FORMULÁRIO ---
    alarmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        try {
            const assetPair = assetInput.value.trim().toUpperCase();
            if (!assetPair) throw new Error("Por favor, selecione um par válido.");
            const alarmType = alarmTypeSelect.value;
            let alarmData = { asset_pair: assetPair, alarm_type: alarmType };

            if (alarmType === 'price') { /*...*/ }
            else if (alarmType === 'rsi_level') {
                alarmData.condition = document.getElementById('rsi-level-condition').value;
                alarmData.target_price = parseFloat(document.getElementById('rsi-level-value').value);
                alarmData.indicator_period = parseInt(document.getElementById('rsi-level-period').value);
                alarmData.indicator_timeframe = document.getElementById('rsi-level-timeframe').value;
            }
            // ... resto da lógica de submissão ...
            else if (alarmType === 'stochastic') { /*...*/ } 
            else if (alarmType === 'stochastic_crossover') { /*...*/ } 
            else if (alarmType === 'rsi_crossover') { /*...*/ } 
            else if (alarmType === 'ema_touch') { /*...*/ } 
            else if (alarmType === 'combo') { /*...*/ }
            
            let error;
            if (editingAlarmId) { const { error: updateError } = await supabase.from('alarms').update(alarmData).eq('id', editingAlarmId); error = updateError; } 
            else { alarmData.status = 'active'; const { error: insertError } = await supabase.from('alarms').insert([alarmData]); error = insertError; }
            if (error) throw error;
            feedbackDiv.textContent = `✅ Operação concluída com sucesso!`;
            exitEditMode();
            fetchAndDisplayAlarms();
        } catch (error) { console.error("Erro na operação do alarme:", error); feedbackDiv.textContent = `Erro: ${error.message}`; } 
        finally { submitButton.disabled = false; }
    });
});
