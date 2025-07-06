// js/alarms.js (VERSÃO FINAL QUE MOSTRA A DATA DO DISPARO)

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
            const assetDisplay = `${alarm.asset_id} (${alarm.asset_symbol})`;

            let alarmDescription = '';
            if (alarm.alarm_type === 'stochastic') { alarmDescription = `Estocástico(${alarm.indicator_period}) ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'rsi_crossover') { alarmDescription = `RSI(${alarm.rsi_period}) cruza ${alarm.condition === 'above' ? 'para CIMA' : 'para BAIXO'} da MA(${alarm.rsi_ma_period}) no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'ema_touch') { alarmDescription = `Preço toca na EMA(${alarm.ema_period}) por ${alarm.condition === 'touch_from_below' ? 'BAIXO (Suporte)' : 'CIMA (Resistência)'} no ${alarm.indicator_timeframe}`; } 
            else if (alarm.alarm_type === 'combo') { const primaryTriggerText = alarm.condition === 'touch_from_above' ? `toca na EMA (Suporte)` : `toca na EMA (Resistência)`; const secondaryTriggerText = `Estocástico(${alarm.combo_period}) ${alarm.combo_condition === 'below' ? 'abaixo de' : 'acima de'} ${alarm.combo_target_price}`; alarmDescription = `CONFLUÊNCIA: ${primaryTriggerText} E ${secondaryTriggerText} no ${alarm.indicator_timeframe}`; } 
            else { alarmDescription = `Preço ${alarm.condition === 'above' ? 'acima de' : 'abaixo de'} ${alarm.target_price} USD`; }

            if (alarm.status === 'active') {
                const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
                activeAlarmsHtml.push(`
                    <tr>
                        <td><strong>${assetDisplay}</strong></td>
                        <td class="${conditionClass}">${alarmDescription}</td>
                        <td>${formattedDate}</td>
                        <td><div class="action-buttons"><button class="btn edit-btn" data-id="${alarm.id}">Editar</button><button class="btn delete-btn" data-id="${alarm.id}">Apagar</button></div></td>
                    </tr>
                `);
            } else {
                // **** AQUI ESTÁ A ALTERAÇÃO ****
                // Usa a data do disparo (triggered_at), ou a de criação se aquela não existir (para alarmes antigos)
                const triggeredDate = alarm.triggered_at ? new Date(alarm.triggered_at).toLocaleString('pt-PT') : new Date(alarm.created_at).toLocaleString('pt-PT');
                
                triggeredAlarmsHtml.push(`
                    <tr>
                        <td><strong>${assetDisplay}</strong></td>
                        <td class="${conditionClass}">${alarmDescription}</td>
                        <td><span class="status-badge status-closed">Disparado</span></td>
                        <td>${triggeredDate}</td>
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

// ... (o resto do ficheiro, deleteAlarm, enterEditMode, etc., continua exatamente igual)
async function deleteAlarm(alarmId) { if (!confirm("Tem a certeza que quer apagar este registo?")) return; try { await supabase.from('alarms').delete().eq('id', alarmId); fetchAndDisplayAlarms(); } catch (error) { console.error("Erro ao apagar alarme:", error); } }
function enterEditMode(alarm) { /* ...código inalterado... */ }
function exitEditMode() { /* ...código inalterado... */ }
document.addEventListener('DOMContentLoaded', () => { /* ...código inalterado... */ });
