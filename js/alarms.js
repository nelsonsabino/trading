// js/alarms.js (VERSÃO COMPLETA PARA A PÁGINA DE GESTÃO DE ALARMES)

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
let selectedCoin = null;
let debounceTimer;

// --- FUNÇÃO PRINCIPAL PARA BUSCAR E MOSTRAR TODOS OS ALARMES ---
async function fetchAndDisplayAlarms() {
    const activeTbody = document.getElementById('active-alarms-tbody');
    const triggeredTbody = document.getElementById('triggered-alarms-tbody');

    if (!activeTbody || !triggeredTbody) {
        console.log("Tabelas de alarmes não encontradas nesta página.");
        return;
    }

    try {
        activeTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5">A carregar...</td></tr>';

        const { data, error } = await supabase
            .from('alarms')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
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
                                <button class="btn delete-btn" data-id="${alarm.id}">Apagar</button>
                            </div>
                        </td>
                    </tr>
                `);
            } else { // 'triggered'
                triggeredAlarmsHtml.push(`
                    <tr>
                        <td><strong>${assetDisplay}</strong></td>
                        <td class="${conditionClass}">${conditionText}</td>
                        <td>${alarm.target_price} USD</td>
                        <td><span class="status-badge status-closed">Disparado</span></td>
                        <td>${formattedDate}</td>
                    </tr>
                `);
            }
        }

        activeTbody.innerHTML = activeAlarmsHtml.length > 0 ? activeAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme ativo.</td></tr>';
        triggeredTbody.innerHTML = triggeredAlarmsHtml.length > 0 ? triggeredAlarmsHtml.join('') : '<tr><td colspan="5" style="text-align:center;">Nenhum alarme no histórico.</td></tr>';

    } catch (error) {
        console.error("Erro ao buscar alarmes:", error);
        activeTbody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">Erro ao carregar alarmes.</td></tr>';
        triggeredTbody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">Erro ao carregar histórico.</td></tr>';
    }
}


// --- FUNÇÃO PARA APAGAR UM ALARME ---
async function deleteAlarm(alarmId) {
    if (!confirm("Tem a certeza que quer apagar este alarme?")) {
        return;
    }
    try {
        const { error } = await supabase.from('alarms').delete().eq('id', alarmId);
        if (error) throw error;
        fetchAndDisplayAlarms(); // Atualiza a lista após apagar
    } catch (error) {
        console.error("Erro ao apagar alarme:", error);
        alert("Não foi possível apagar o alarme.");
    }
}


// --- LÓGICA EXECUTADA QUANDO A PÁGINA CARREGA ---
document.addEventListener('DOMContentLoaded', () => {
    // Busca os alarmes assim que a página está pronta
    fetchAndDisplayAlarms();

    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');
    const activeTbody = document.getElementById('active-alarms-tbody');

    if (!alarmForm || !supabase || !assetInput || !resultsDiv || !activeTbody) {
        console.error("ERRO: Um ou mais elementos essenciais da página de alarmes não foram encontrados.");
        return;
    }

    // Listener para apagar (usando delegação de eventos para performance)
    activeTbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const alarmId = e.target.getAttribute('data-id');
            deleteAlarm(alarmId);
        }
    });

    // Lógica do Autocomplete
    assetInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = assetInput.value.trim();
        selectedCoin = null;

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const { data: results, error } = await supabase.functions.invoke('search-coins', {
                    body: { query }
                });

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
                resultsDiv.style.display = 'none';
            }
        }, 300);
    });

    // Esconde os resultados se o utilizador clicar fora
    document.addEventListener('click', (e) => {
        if (e.target !== assetInput) {
            resultsDiv.style.display = 'none';
        }
    });

    // Lógica de Submissão do Formulário
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
                target_price: targetPrice,
                status: 'active'
            };

            const { error } = await supabase.from('alarms').insert([alarmData]);
            if (error) throw error;

            feedbackDiv.textContent = `✅ Alarme para ${selectedCoin.name} criado com sucesso!`;
            feedbackDiv.style.color = '#28a745';
            alarmForm.reset();
            
            fetchAndDisplayAlarms(); // ATUALIZA A LISTA!

        } catch (error) {
            console.error("Erro ao criar alarme:", error);
            feedbackDiv.textContent = `Erro: ${error.message}`;
            feedbackDiv.style.color = '#dc3545';
        } finally {
            submitButton.disabled = false;
        }
    });
});
