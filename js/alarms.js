// js/alarms.js (VERSÃO FINAL COM EDIÇÃO E EXCLUSÃO DO HISTÓRICO)

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
let selectedCoin = null;
let debounceTimer;
let editingAlarmId = null; // A nossa variável de estado: null = modo de criação, ID = modo de edição
window.alarmsData = []; // Guarda os dados globalmente para fácil acesso na edição

// --- FUNÇÃO PRINCIPAL PARA BUSCAR E MOSTRAR TODOS OS ALARMES ---
async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');
    if (!activeTbody || !triggeredTbody) return;

    try {
        activeTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="6">A carregar...</td></tr>';

        const { data, error } = await supabase.from('alarms').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        window.alarmsData = data; // Atualiza os dados guardados
        
        const activeAlarmsHtml = [];
        const triggeredAlarmsHtml = [];

        for (const alarm of data) {
            const conditionClass = alarm.condition === 'above' ? 'condition-above' : 'condition-below';
            const conditionText = alarm.condition === 'above' ? 'Acima de' : 'Abaixo de';
            const formattedDate = new Date(alarm.created_at).toLocaleString('pt-PT');
            const assetDisplay = `${alarm.asset_id} (${alarm.asset_symbol})`;

            if (alarm.status === 'active') {
                activeAlarmsHtml.push(`
                    <tr>
                        <td><strong>${assetDisplay}</strong></td>
                        <td class="${conditionClass}">${conditionText}</td>
                        <td>${alarm.target_price} USD</td>
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
                        <td class="${conditionClass}">${conditionText}</td>
                        <td>${alarm.target_price} USD</td>
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

        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="6" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';

    } catch (error) {
        console.error("Erro ao buscar alarmes:", error);
    }
}

// --- FUNÇÃO PARA APAGAR UM ALARME (ATIVO OU DO HISTÓRICO) ---
async function deleteAlarm(alarmId) {
    const confirmationText = "Tem a certeza que quer apagar este registo? Esta ação é irreversível.";
    if (!confirm(confirmationText)) return;
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
    document.getElementById('alarm-condition-standalone').value = alarm.condition;
    document.getElementById('alarm-price-standalone').value = alarm.target_price;
    
    document.querySelector('#alarm-form button[type="submit"]').textContent = 'Atualizar Alarme';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitEditMode() {
    editingAlarmId = null;
    selectedCoin = null;

    document.getElementById('alarm-form').reset();
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

    // Listener unificado para todos os cliques em botões nas tabelas
    mainContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-btn')) {
            const alarmId = target.getAttribute('data-id');
            deleteAlarm(alarmId);
        }
        if (target.classList.contains('edit-btn')) {
            const alarmId = target.getAttribute('data-id');
            const alarmToEdit = window.alarmsData.find(a => a.id === alarmId);
            if (alarmToEdit) {
                enterEditMode(alarmToEdit);
            }
        }
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', exitEditMode);

    // Lógica do Autocomplete
    assetInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = assetInput.value.trim();
        if (editingAlarmId) exitEditMode();
        selectedCoin = null;

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

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

    // Lógica de Submissão (agora cria OU atualiza)
    alarmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
            if (!selectedCoin) {
                throw new Error("Por favor, selecione uma moeda válida da lista de sugestões.");
            }

            const targetPrice = parseFloat(document.getElementById('alarm-price-standalone').value);
            if (isNaN(targetPrice) || targetPrice <= 0) {
                throw new Error("Por favor, preencha um preço alvo válido.");
            }
            
            const alarmData = {
                asset_id: selectedCoin.id,
                asset_symbol: selectedCoin.symbol.toUpperCase(),
                condition: document.getElementById('alarm-condition-standalone').value,
                target_price: targetPrice
            };

            let error;
            if (editingAlarmId) {
                // MODO DE EDIÇÃO
                const { error: updateError } = await supabase.from('alarms').update(alarmData).eq('id', editingAlarmId);
                error = updateError;
            } else {
                // MODO DE CRIAÇÃO
                alarmData.status = 'active'; // Adiciona o status apenas ao criar
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
