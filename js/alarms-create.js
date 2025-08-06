// js/alarms-create.js

import { supabase } from './services.js';
import { setupAutocomplete } from './utils.js';
import { setLastCreatedAlarmId } from './state.js';
import { openChartModal } from './alarms-manage.js';

let editingAlarmId = null;
let currentAssetPrice = null; // Variável para guardar o preço atual do ativo

// --- FUNÇÕES ESPECÍFICAS DE ALARMS-CREATE ---

async function fetchPriceForPair(pair) {
    const priceDisplay = document.getElementById('asset-current-price');
    if (!priceDisplay || !pair) { 
        if (priceDisplay) priceDisplay.textContent = ''; 
        currentAssetPrice = null; // Limpa o preço
        return; 
    }
    priceDisplay.textContent = 'A obter preço...';
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        if (!response.ok) throw new Error('Par não encontrado na Binance');
        const data = await response.json();
        const price = parseFloat(data.price);
        currentAssetPrice = price; // Guarda o preço bruto
        let formattedPrice = price >= 1.0 
            ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
        priceDisplay.innerHTML = `Preço Atual: <span style="color: #28a745;">${formattedPrice}</span>`;
    } catch (error) { 
        priceDisplay.textContent = 'Preço não disponível.';
        currentAssetPrice = null; // Limpa o preço em caso de erro
    }
}

function enterEditMode(alarm) {
    editingAlarmId = alarm.id;
    document.getElementById('alarm-asset').value = alarm.asset_pair;
    fetchPriceForPair(alarm.asset_pair);
    const alarmType = alarm.alarm_type || 'price';
    document.getElementById('alarm-type-select').value = alarmType;
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));

    // Preenche os campos do formulário com base no tipo de alarme
    if (alarmType === 'stochastic') { 
        document.getElementById('stoch-condition').value = alarm.condition; 
        document.getElementById('stoch-value').value = alarm.target_price; 
        document.getElementById('stoch-period').value = alarm.indicator_period; 
        document.getElementById('stoch-timeframe').value = alarm.indicator_timeframe; 
    } else if (alarmType === 'rsi_level') { 
        document.getElementById('rsi-level-condition').value = alarm.condition; 
        document.getElementById('rsi-level-value').value = alarm.target_price; 
        document.getElementById('rsi-level-period').value = alarm.indicator_period; 
        document.getElementById('rsi-level-timeframe').value = alarm.indicator_timeframe; 
    } else if (alarmType === 'stochastic_crossover') { 
        document.getElementById('stoch-cross-condition').value = alarm.condition; 
        document.getElementById('stoch-cross-k-period').value = alarm.indicator_period; 
        document.getElementById('stoch-cross-d-period').value = alarm.combo_period; 
        document.getElementById('stoch-cross-timeframe').value = alarm.indicator_timeframe; 
    } else if (alarmType === 'rsi_crossover') { 
        document.getElementById('rsi-condition').value = alarm.condition; 
        document.getElementById('rsi-timeframe').value = alarm.indicator_timeframe; 
        document.getElementById('rsi-crossover-interval').value = alarm.crossover_interval || 1;
        document.getElementById('rsi-crossover-threshold').value = alarm.crossover_threshold || 1.0;
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
    // --- INÍCIO DA ALTERAÇÃO ---
    } else if (alarmType === 'rsi_trendline') {
        document.getElementById('rsi-trendline-type').value = alarm.trendline_type || 'support';
        document.getElementById('rsi-trendline-touches').value = alarm.touch_count || 3;
        document.getElementById('rsi-trendline-period').value = alarm.indicator_period || 14;
        document.getElementById('rsi-trendline-timeframe').value = alarm.indicator_timeframe || '1h';
    // --- FIM DA ALTERAÇÃO ---
    } else { // price
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
    window.history.replaceState({}, document.title, window.location.pathname);
}

export { enterEditMode };


// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    const alarmForm = document.getElementById('alarm-form');
    if (!alarmForm) {
        return;
    }

    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const mainContainer = document.querySelector('main');
    const alarmTypeSelect = document.getElementById('alarm-type-select');
    const priceInput = document.getElementById('alarm-price-standalone');
    
    if (priceInput) {
        priceInput.addEventListener('dblclick', () => {
            if (currentAssetPrice !== null && !isNaN(currentAssetPrice)) {
                priceInput.value = currentAssetPrice.toString();
                priceInput.style.transition = 'background-color 0.3s';
                priceInput.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    priceInput.style.backgroundColor = '';
                }, 500);
            } else {
                console.warn("Preço atual não disponível para preenchimento automático.");
            }
        });
    }
    
    const fields = { 
        price: document.getElementById('price-fields'), 
        rsi_level: document.getElementById('rsi-level-fields'), 
        stochastic: document.getElementById('stochastic-fields'), 
        stochastic_crossover: document.getElementById('stoch-crossover-fields'), 
        rsi_crossover: document.getElementById('rsi-fields'), 
        ema_touch: document.getElementById('ema-fields'), 
        combo: document.getElementById('combo-fields'),
        // --- INÍCIO DA ALTERAÇÃO ---
        rsi_trendline: document.getElementById('rsi-trendline-fields')
        // --- FIM DA ALTERAÇÃO ---
    };
    
    alarmTypeSelect.addEventListener('change', () => {
        const selectedType = alarmTypeSelect.value;
        for (const type in fields) { 
            if (fields[type]) { 
                fields[type].style.display = type === selectedType ? 'block' : 'none'; 
            } 
        }
        if (selectedType === 'rsi_level') { document.getElementById('rsi-level-condition').dispatchEvent(new Event('change')); }
        if (selectedType === 'stochastic') { document.getElementById('stoch-condition').dispatchEvent(new Event('change')); }
    });

    // ... (restante dos listeners de change que já existem) ...

    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    const alarmIdToEdit = urlParams.get('editAlarmId');
    
    if (assetPairFromUrl && assetInput) {
        const pair = assetPairFromUrl.toUpperCase();
        assetInput.value = pair;
        fetchPriceForPair(pair); 
    }

    if (alarmIdToEdit) {
        // ... (código existente para carregar alarme para edição) ...
    }

    // ... (restante do código de inicialização) ...
    
    document.getElementById('cancel-edit-btn').addEventListener('click', exitEditMode);

    setupAutocomplete(assetInput, resultsDiv, async (selectedPair) => fetchPriceForPair(selectedPair));

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
            
            if (alarmType === 'price') { 
                // ...
            } else if (alarmType === 'rsi_level') { 
                // ...
            } else if (alarmType === 'stochastic') { 
                // ...
            } else if (alarmType === 'stochastic_crossover') { 
                // ...
            } else if (alarmType === 'rsi_crossover') { 
                alarmData.condition = document.getElementById('rsi-condition').value; 
                alarmData.indicator_timeframe = document.getElementById('rsi-timeframe').value; 
                alarmData.crossover_interval = parseInt(document.getElementById('rsi-crossover-interval').value) || 1;
                alarmData.crossover_threshold = parseFloat(document.getElementById('rsi-crossover-threshold').value) || 1.0;
                alarmData.rsi_period = 14; 
                alarmData.rsi_ma_period = 14; 
            // --- INÍCIO DA ALTERAÇÃO ---
            } else if (alarmType === 'rsi_trendline') {
                alarmData.trendline_type = document.getElementById('rsi-trendline-type').value;
                alarmData.touch_count = parseInt(document.getElementById('rsi-trendline-touches').value) || 3;
                alarmData.indicator_period = parseInt(document.getElementById('rsi-trendline-period').value) || 14;
                alarmData.indicator_timeframe = document.getElementById('rsi-trendline-timeframe').value;
            // --- FIM DA ALTERAÇÃO ---
            } else if (alarmType === 'ema_touch') { 
                // ...
            } else if (alarmType === 'combo') { 
                // ...
            }

            if (editingAlarmId) {
                const { error } = await supabase.from('alarms').update(alarmData).eq('id', editingAlarmId);
                if (error) throw error;
                setLastCreatedAlarmId(null);
                window.location.href = 'alarms-manage.html';
            } else {
                alarmData.status = 'active';
                const { data, error } = await supabase.from('alarms').insert([alarmData]).select('id').single();
                if (error) throw error;
                setLastCreatedAlarmId(data.id);
                window.location.href = 'alarms-manage.html';
            }

            feedbackDiv.textContent = `✅ Operação concluída com sucesso!`;
        } catch (error) { 
            console.error("Erro na operação do alarme:", error); 
            feedbackDiv.textContent = `Erro: ${error.message}`; 
        } finally { 
            submitButton.disabled = false; 
        }
    });
});
