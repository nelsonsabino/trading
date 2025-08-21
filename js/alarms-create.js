// js/alarms-create.js

import { supabase } from './services.js';
import { setupAutocomplete } from './utils.js';
import { setLastCreatedAlarmId } from './state.js';
import { openChartModal } from './chart-modal.js';

let editingAlarmId = null;
let currentAssetPrice = null;

async function fetchPriceForPair(pair) {
    const priceDisplay = document.getElementById('asset-current-price');
    if (!priceDisplay || !pair) { 
        if (priceDisplay) priceDisplay.textContent = ''; 
        currentAssetPrice = null;
        return; 
    }
    priceDisplay.textContent = 'A obter preço...';
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        if (!response.ok) throw new Error('Par não encontrado na Binance');
        const data = await response.json();
        const price = parseFloat(data.price);
        currentAssetPrice = price;
        let formattedPrice = price >= 1.0 
            ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
        priceDisplay.innerHTML = `Preço Atual: <span style="color: #28a745;">${formattedPrice}</span>`;
    } catch (error) { 
        priceDisplay.textContent = 'Preço não disponível.';
        currentAssetPrice = null;
    }
}

async function deleteAlarm() {
    if (!editingAlarmId) return;

    const confirmed = confirm("Tem a certeza que quer apagar permanentemente este alarme?");
    if (confirmed) {
        const feedbackDiv = document.getElementById('alarm-feedback');
        feedbackDiv.textContent = 'A apagar alarme...';
        try {
            const { error } = await supabase
                .from('alarms')
                .delete()
                .eq('id', editingAlarmId);

            if (error) throw error;

            alert('Alarme apagado com sucesso!');
            window.location.href = 'alarms-manage.html';
        } catch (error) {
            console.error("Erro ao apagar alarme:", error);
            feedbackDiv.textContent = `Erro ao apagar alarme: ${error.message}`;
        }
    }
}

function enterEditMode(alarm) {
    editingAlarmId = alarm.id;
    document.getElementById('alarm-asset').value = alarm.asset_pair;
    fetchPriceForPair(alarm.asset_pair);
    const alarmType = alarm.alarm_type || 'price';
    document.getElementById('alarm-type-select').value = alarmType;
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));

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
        
        const isSpecific = alarm.crossover_level_type === 'specific';
        const checkbox = document.getElementById('stoch-cross-level-specific-checkbox');
        checkbox.checked = isSpecific;
        document.getElementById('stoch-cross-level-value-container').style.display = isSpecific ? 'block' : 'none';
        if (isSpecific) {
            document.getElementById('stoch-cross-level-value').value = alarm.crossover_level_value || '';
        }

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
    } else if (alarmType === 'rsi_trendline') {
        document.getElementById('rsi-trendline-type').value = alarm.trendline_type || 'support';
        document.getElementById('rsi-trendline-touches').value = alarm.touch_count || 3;
        document.getElementById('rsi-trendline-period').value = alarm.indicator_period || 14;
        document.getElementById('rsi-trendline-timeframe').value = alarm.indicator_timeframe || '1h';
    } else if (alarmType === 'rsi_trendline_break') {
        document.getElementById('rsi-trendline-break-type').value = alarm.trendline_type || 'support';
        document.getElementById('rsi-trendline-break-period').value = alarm.indicator_period || 14;
        document.getElementById('rsi-trendline-break-timeframe').value = alarm.indicator_timeframe || '1h';
    } else { // price
        document.getElementById('alarm-condition-standalone').value = alarm.condition; 
        document.getElementById('alarm-price-standalone').value = alarm.target_price; 
    }
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Atualizar Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    document.getElementById('delete-alarm-btn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitEditMode() {
    editingAlarmId = null;
    document.getElementById('alarm-form').reset();
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change'));
    
    document.getElementById('stoch-period').value = 7;
    document.getElementById('stoch-cross-k-period').value = 7;

    const checkbox = document.getElementById('stoch-cross-level-specific-checkbox');
    checkbox.checked = false;
    document.getElementById('stoch-cross-level-value').value = '';
    document.getElementById('stoch-cross-level-value-container').style.display = 'none';

    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Definir Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('delete-alarm-btn').style.display = 'none';
    document.getElementById('asset-current-price').textContent = '';
    window.history.replaceState({}, document.title, window.location.pathname);
}

export { enterEditMode };

document.addEventListener('DOMContentLoaded', () => {
    const alarmForm = document.getElementById('alarm-form');
    if (!alarmForm) return;

    document.getElementById('stoch-period').value = 7;
    document.getElementById('stoch-cross-k-period').value = 7;

    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const alarmTypeSelect = document.getElementById('alarm-type-select');
    const priceInput = document.getElementById('alarm-price-standalone');
    
    const deleteBtn = document.getElementById('delete-alarm-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteAlarm);

    if (priceInput) {
        priceInput.addEventListener('dblclick', () => {
            if (currentAssetPrice !== null && !isNaN(currentAssetPrice)) {
                priceInput.value = currentAssetPrice.toString();
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
        rsi_trendline: document.getElementById('rsi-trendline-fields'),
        rsi_trendline_break: document.getElementById('rsi-trendline-break-fields')
    };
    
    alarmTypeSelect.addEventListener('change', () => {
        const selectedType = alarmTypeSelect.value;
        for (const type in fields) { 
            if (fields[type]) { 
                fields[type].style.display = type === selectedType ? 'block' : 'none'; 
            } 
        }
    });

    const stochLevelCheckbox = document.getElementById('stoch-cross-level-specific-checkbox');
    const stochLevelValueContainer = document.getElementById('stoch-cross-level-value-container');
    
    stochLevelCheckbox.addEventListener('change', (event) => {
        stochLevelValueContainer.style.display = event.target.checked ? 'block' : 'none';
    });

    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    const alarmIdToEdit = urlParams.get('editAlarmId');
    
    const alarmTypeFromUrl = urlParams.get('alarmType');
    const trendlineTypeFromUrl = urlParams.get('trendlineType');
    const timeframeFromUrl = urlParams.get('timeframe');

    if (assetPairFromUrl) {
        const pair = assetPairFromUrl.toUpperCase();
        assetInput.value = pair;
        fetchPriceForPair(pair); 
    }

    if (alarmTypeFromUrl === 'rsi_trendline_break') {
        alarmTypeSelect.value = 'rsi_trendline_break';
        alarmTypeSelect.dispatchEvent(new Event('change'));
        
        if (trendlineTypeFromUrl && fields.rsi_trendline_break) {
            document.getElementById('rsi-trendline-break-type').value = trendlineTypeFromUrl;
        }
        if (timeframeFromUrl && fields.rsi_trendline_break) {
            document.getElementById('rsi-trendline-break-timeframe').value = timeframeFromUrl;
        }
    }

    if (alarmIdToEdit) {
        const fetchAndEditAlarm = async (id) => {
            feedbackDiv.textContent = 'A carregar dados do alarme para edição...';
            try {
                const { data: alarmToEdit, error } = await supabase.from('alarms').select('*').eq('id', id).single();
                if (error) throw error;
                if (alarmToEdit) {
                    feedbackDiv.textContent = '';
                    enterEditMode(alarmToEdit);
                }
            } catch (err) {
                console.error("Erro ao buscar alarme para edição:", err);
            }
        };
        fetchAndEditAlarm(alarmIdToEdit);
    }
    
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
                alarmData.condition = document.getElementById('alarm-condition-standalone').value; 
                alarmData.target_price = parseFloat(document.getElementById('alarm-price-standalone').value); 
            } else if (alarmType === 'rsi_level') { 
                alarmData.condition = document.getElementById('rsi-level-condition').value; 
                alarmData.target_price = parseFloat(document.getElementById('rsi-level-value').value); 
                alarmData.indicator_period = parseInt(document.getElementById('rsi-level-period').value); 
                alarmData.indicator_timeframe = document.getElementById('rsi-level-timeframe').value; 
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
                
                const isSpecificCheckbox = document.getElementById('stoch-cross-level-specific-checkbox');
                if (isSpecificCheckbox.checked) {
                    alarmData.crossover_level_type = 'specific';
                    const levelValue = parseFloat(document.getElementById('stoch-cross-level-value').value);
                    if (isNaN(levelValue)) throw new Error("O valor do nível específico para o Estocástico é inválido.");
                    alarmData.crossover_level_value = levelValue;
                } else {
                    alarmData.crossover_level_type = 'any';
                    alarmData.crossover_level_value = null;
                }
            } else if (alarmType === 'rsi_crossover') { 
                alarmData.condition = document.getElementById('rsi-condition').value; 
                alarmData.indicator_timeframe = document.getElementById('rsi-timeframe').value; 
                alarmData.crossover_interval = parseInt(document.getElementById('rsi-crossover-interval').value) || 1;
                alarmData.crossover_threshold = parseFloat(document.getElementById('rsi-crossover-threshold').value) || 1.0;
                alarmData.rsi_period = 14; 
                alarmData.rsi_ma_period = 14; 
            } else if (alarmType === 'rsi_trendline') {
                alarmData.trendline_type = document.getElementById('rsi-trendline-type').value;
                alarmData.touch_count = parseInt(document.getElementById('rsi-trendline-touches').value) || 3;
                alarmData.indicator_period = parseInt(document.getElementById('rsi-trendline-period').value) || 14;
                alarmData.indicator_timeframe = document.getElementById('rsi-trendline-timeframe').value;
            } else if (alarmType === 'rsi_trendline_break') {
                alarmData.trendline_type = document.getElementById('rsi-trendline-break-type').value;
                alarmData.indicator_period = parseInt(document.getElementById('rsi-trendline-break-period').value) || 14;
                alarmData.indicator_timeframe = document.getElementById('rsi-trendline-break-timeframe').value;
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

            if (editingAlarmId) {
                alarmData.status = 'active';
                alarmData.triggered_at = null;
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
        } catch (error) { 
            console.error("Erro na operação do alarme:", error); 
            feedbackDiv.textContent = `Erro: ${error.message}`; 
        } finally { 
            submitButton.disabled = false; 
        }
    });
});
