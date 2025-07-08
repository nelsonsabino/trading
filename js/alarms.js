// js/alarms.js - VERSÃO ADAPTADA PARA PARES DA BINANCE (ex: BTCUSDC)

import { supabase } from './services.js';
import { setupAutocomplete } from './utils.js';

let editingAlarmId = null;
window.alarmsData = []; // Para manter os dados para edição




// ---- NOVA FUNÇÃO REUTILIZÁVEL ----
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
        priceDisplay.innerHTML = `Preço Atual: <span style="color: #28a745;">${parseFloat(data.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>`;
    } catch (error) { 
        priceDisplay.textContent = 'Preço não disponível.';
    }
}



// ---- FUNÇÕES DE DADOS (CRUD) ----

async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');
    if (!activeTbody || !triggeredTbody) return;

    try {
        activeTbody.innerHTML = '<tr><td colspan="4">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        const { data, error } = await supabase.from('alarms').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        window.alarmsData = data; // Guarda os dados para edição
        const activeAlarmsHtml = [], triggeredAlarmsHtml = [];

        for (const alarm of data) {
            const isBullish = ['above', 'test_support'].includes(alarm.condition);
            const conditionClass = isBullish ? 'condition-above' : 'condition-below';
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            
            // O campo agora é 'asset_pair' e contém o par completo, ex: BTCUSDC
            const assetDisplay = alarm.asset_pair || `${alarm.asset_id} (${alarm.asset_symbol})`; // Fallback para dados antigos

            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'stochastic_crossover') { alarmDescription = `Estocástico %K(${alarm.indicator_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} de %D(${alarm.combo_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço testa a EMA(${alarm.ema_period}) como ${alarm.condition === 'test_support' ? 'SUPORTE' : 'RESISTÊNCIA'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'test_support' ? `testa a EMA (Suporte)` : `testa a EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }
            
            if (alarm.status === 'active') { activeAlarmsHtml.push(`<tr><td><strong>${assetDisplay}</strong></td><td class="${conditionClass}">${alarmDescription}</td><td>${formattedDate}</td><td><div class="action-buttons"><button class="btn edit-btn" data-id="${alarm.id}">Editar</button><button class="btn delete-btn" data-id="${alarm.id}">Apagar</button></div></td></tr>`); } 
            else { const triggeredDate = alarm.triggered_at ? new Date(alarm.triggered_at).toLocaleString('pt-PT') : new Date(alarm.created_at).toLocaleString('pt-PT'); triggeredAlarmsHtml.push(`<tr><td><strong>${assetDisplay}</strong></td><td class="${conditionClass}">${alarmDescription}</td><td><span class="status-badge status-closed">Disparado</span></td><td>${triggeredDate}</td><td><div class="action-buttons"><button class="btn delete-btn" data-id="${alarm.id}">Apagar</button></div></td></tr>`); }
        }
        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';
    } catch (error) { console.error("Erro ao buscar alarmes:", error); }
}

async function deleteAlarm(alarmId) { if (!confirm("Tem a certeza que quer apagar este registo?")) return; try { await supabase.from('alarms').delete().eq('id', alarmId); fetchAndDisplayAlarms(); } catch (error) { console.error("Erro ao apagar alarme:", error); } }

function enterEditMode(alarm) {
    editingAlarmId = alarm.id;
    // O campo agora guarda o par completo
    document.getElementById('alarm-asset').value = alarm.asset_pair;
    
    const alarmType = alarm.alarm_type || 'price';
    document.getElementById('alarm-type-select').value = alarmType;
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));

    if (alarmType === 'stochastic') {
        document.getElementById('stoch-condition').value = alarm.condition;
        document.getElementById('stoch-value').value = alarm.target_price;
        document.getElementById('stoch-period').value = alarm.indicator_period;
        document.getElementById('stoch-timeframe').value = alarm.indicator_timeframe;
    } else if (alarmType === 'stochastic_crossover') {
        document.getElementById('stoch-cross-condition').value = alarm.condition;
        document.getElementById('stoch-cross-k-period').value = alarm.indicator_period;
        document.getElementById('stoch-cross-d-period').value = alarm.combo_period;
        document.getElementById('stoch-cross-timeframe').value = alarm.indicator_timeframe;
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
    document.getElementById('alarm-form').reset();
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Definir Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('asset-current-price').textContent = '';
}

// ---- EVENT LISTENERS E INICIALIZAÇÃO ----

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayAlarms();

    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const priceDisplay = document.getElementById('asset-current-price');
    const mainContainer = document.querySelector('main');
    const alarmTypeSelect = document.getElementById('alarm-type-select');
    
    // Esconder/Mostrar campos do formulário
    const fields = {
        price: document.getElementById('price-fields'),
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
    });

    // Lógica para pré-preenchimento vindo do URL
    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair'); // <-- MUDOU PARA assetPair
    
    if (assetPairFromUrl && assetInput) {
        assetInput.value = assetPairFromUrl.toUpperCase();
        assetInput.dispatchEvent(new Event('input', { bubbles: true })); // Ativa a busca de preço
    }

    // Event delegation para botões de apagar/editar
    mainContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-btn')) deleteAlarm(target.getAttribute('data-id'));
        if (target.classList.contains('edit-btn')) {
            const alarmToEdit = window.alarmsData.find(a => a.id === target.getAttribute('data-id'));
            if (alarmToEdit) enterEditMode(alarmToEdit);
        }
    });
    
    document.getElementById('cancel-edit-btn').addEventListener('click', exitEditMode);

    // Configura o Autocomplete e a busca de preço
    setupAutocomplete(assetInput, resultsDiv, async (selectedPair) => {
        if (selectedPair) {
            priceDisplay.textContent = 'A obter preço...';
            try {
                // A API da Binance aceita o par diretamente, ex: BTCUSDC
                const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${selectedPair}`);
                if (!response.ok) throw new Error('Par não encontrado na Binance');
                const data = await response.json();
                priceDisplay.innerHTML = `Preço Atual: <span style="color: #28a745;">${parseFloat(data.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>`;
            } catch (error) { 
                priceDisplay.textContent = 'Preço não disponível.';
            }
        } else {
            priceDisplay.textContent = '';
        }
    });

    // Submissão do Formulário
    alarmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';

        try {
            const assetPair = assetInput.value.trim().toUpperCase();
            if (!assetPair) throw new Error("Por favor, selecione um par válido.");

            const alarmType = alarmTypeSelect.value;
            // Objeto base para os dados do alarme
            let alarmData = {
                asset_pair: assetPair, // NOVO CAMPO
                alarm_type: alarmType,
            };

            // Preenche os dados específicos de cada tipo de alarme
            if (alarmType === 'price') {
                alarmData.condition = document.getElementById('alarm-condition-standalone').value;
                alarmData.target_price = parseFloat(document.getElementById('alarm-price-standalone').value);
            } else if (alarmType === 'stochastic') {
                alarmData.condition = document.getElementById('stoch-condition').value;
                alarmData.target_price = parseFloat(document.getElementById('stoch-value').value);
                alarmData.indicator_period = parseInt(document.getElementById('stoch-period').value);
                alarmData.indicator_timeframe = document.getElementById('stoch-timeframe').value;
            } else if (alarmType === 'stochastic_crossover') {
                alarmData.condition = document.getElementById('stoch-cross-condition').value;
                alarmData.indicator_period = parseInt(document.getElementById('stoch-cross-k-period').value);
                alarmData.combo_period = parseInt(document.getElementById('stoch-cross-d-period').value);
                alarmData.indicator_timeframe = document.getElementById('stoch-cross-timeframe').value;
            } else if (alarmType === 'rsi_crossover') {
                alarmData.condition = document.getElementById('rsi-condition').value;
                alarmData.indicator_timeframe = document.getElementById('rsi-timeframe').value;
                alarmData.rsi_period = 14;
                alarmData.rsi_ma_period = 14;
            } else if (alarmType === 'ema_touch') {
                alarmData.condition = document.getElementById('ema-condition').value;
                alarmData.indicator_timeframe = document.getElementById('ema-timeframe').value;
                alarmData.ema_period = parseInt(document.getElementById('ema-period').value);
            } else if (alarmType === 'combo') {
                alarmData.condition = document.getElementById('combo-primary-trigger').value;
                alarmData.indicator_timeframe = document.getElementById('combo-timeframe').value;
                alarmData.ema_period = parseInt(document.getElementById('combo-ema-period').value);
                alarmData.combo_indicator = 'stochastic';
                alarmData.combo_condition = document.getElementById('combo-stoch-condition').value;
                alarmData.combo_target_price = parseInt(document.getElementById('combo-stoch-value').value);
                alarmData.combo_period = 14;
            }
            
            // Lógica para inserir ou atualizar
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
