// js/alarms-create.js

import { supabase } from './services.js';
import { setupAutocomplete } from './utils.js';
import { setLastCreatedAlarmId, getAlarmsData, setAlarmsData } from './state.js'; // Importa funções de estado
import { openChartModal } from './alarms-manage.js'; // Reutiliza o modal de gráfico daqui

let editingAlarmId = null;

// --- FUNÇÕES ESPECÍFICAS DE ALARMS-CREATE ---

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
        let formattedPrice = price >= 1.0 
            ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
        priceDisplay.innerHTML = `Preço Atual: <span style="color: #28a745;">${formattedPrice}</span>`;
    } catch (error) { 
        priceDisplay.textContent = 'Preço não disponível.';
    }
}

function enterEditMode(alarm) {
    editingAlarmId = alarm.id;
    document.getElementById('alarm-asset').value = alarm.asset_pair;
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
        document.getElementById('rsi-period').value = alarm.rsi_period; // Certifica-se que estes existem ou são definidos
        document.getElementById('rsi-ma-period').value = alarm.rsi_ma_period;
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
        document.getElementById('combo-period').value = alarm.combo_period; // Certifica-se que este existe
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
    document.getElementById('alarm-type-select').dispatchEvent(new Event('change')); // Para esconder/mostrar campos corretamente
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Definir Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('asset-current-price').textContent = '';
}

// Exporta enterEditMode para que alarms-manage.js possa chamá-la
export { enterEditMode };


// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const mainContainer = document.querySelector('main'); // Necessário para delegation de eventos
    const alarmTypeSelect = document.getElementById('alarm-type-select');
    
    // Mapeamento dos campos para cada tipo de alarme
    const fields = { 
        price: document.getElementById('price-fields'), 
        rsi_level: document.getElementById('rsi-level-fields'), 
        stochastic: document.getElementById('stochastic-fields'), 
        stochastic_crossover: document.getElementById('stoch-crossover-fields'), 
        rsi_crossover: document.getElementById('rsi-fields'), 
        ema_touch: document.getElementById('ema-fields'), 
        combo: document.getElementById('combo-fields') 
    };
    
    // Listener para mudar os campos visíveis com base no tipo de alarme
    alarmTypeSelect.addEventListener('change', () => {
        const selectedType = alarmTypeSelect.value;
        for (const type in fields) { 
            if (fields[type]) { 
                fields[type].style.display = type === selectedType ? 'block' : 'none'; 
            } 
        }
        // Dispara eventos para preencher valores por defeito para RSI/Stoch
        if (selectedType === 'rsi_level') { document.getElementById('rsi-level-condition').dispatchEvent(new Event('change')); }
        if (selectedType === 'stochastic') { document.getElementById('stoch-condition').dispatchEvent(new Event('change')); }
    });

    // Listeners para preencher valores por defeito no RSI e Estocástico
    const rsiLevelConditionSelect = document.getElementById('rsi-level-condition');
    if(rsiLevelConditionSelect) { rsiLevelConditionSelect.addEventListener('change', (e) => { const rsiValueInput = document.getElementById('rsi-level-value'); if(e.target.value === 'below') { rsiValueInput.value = 35; } else { rsiValueInput.value = 70; } }); }

    const stochConditionSelect = document.getElementById('stoch-condition');
    if (stochConditionSelect) {
        stochConditionSelect.addEventListener('change', (e) => {
            const stochValueInput = document.getElementById('stoch-value');
            if (e.target.value === 'below') { stochValueInput.value = 30; } else { stochValueInput.value = 70; }
        });
    }

    // Pré-preenchimento do ativo se vier da URL
    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    const alarmIdToEdit = urlParams.get('editAlarmId'); // NOVO: Para modo de edição
    
    if (assetPairFromUrl && assetInput) {
        const pair = assetPairFromUrl.toUpperCase();
        assetInput.value = pair;
        fetchPriceForPair(pair); 
    }

    // Se estiver em modo de edição, busca o alarme e preenche o formulário
    if (alarmIdToEdit) {
        const alarmsData = getAlarmsData();
        const alarmToEdit = alarmsData.find(a => a.id === alarmIdToEdit);
        if (alarmToEdit) {
            enterEditMode(alarmToEdit);
        } else {
            // Se o alarme não estiver nos dados atuais (ex: página de gestão ainda não carregou),
            // podemos fazer um fetch direto (mas por agora, o estado é mais eficiente)
            console.warn("Alarme a editar não encontrado nos dados em cache.");
        }
    }


    // Listener para o modal de gráfico (reutilizado)
    mainContainer.addEventListener('click', (e) => {
        const chartBtn = e.target.closest('.view-chart-btn');
        if (chartBtn) {
            // Aqui o botão de ver gráfico abre o modal que pertence a alarms-manage.js
            const symbol = chartBtn.dataset.symbol;
            if (symbol) openChartModal(symbol); // openChartModal é importado de alarms-manage.js
        }
    });
    
    // Listener para o botão de cancelar edição
    document.getElementById('cancel-edit-btn').addEventListener('click', exitEditMode);

    // Setup do autocomplete para o campo de ativo
    setupAutocomplete(assetInput, resultsDiv, async (selectedPair) => fetchPriceForPair(selectedPair));

    // Handler para submissão do formulário de alarme
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
            
            // Recolha de dados do formulário com base no tipo de alarme
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

            if (editingAlarmId) {
                const { error } = await supabase.from('alarms').update(alarmData).eq('id', editingAlarmId);
                if (error) throw error;
                setLastCreatedAlarmId(null); // Limpa o ID se for uma edição
                // Redireciona para a página de gestão após a edição
                window.location.href = 'alarms-manage.html'; 
            } else {
                alarmData.status = 'active';
                const { data, error } = await supabase.from('alarms').insert([alarmData]).select('id').single();
                if (error) throw error;
                setLastCreatedAlarmId(data.id);
                // Redireciona para a página de gestão após a criação
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
