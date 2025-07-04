// js/alarms.js (VERSÃO COM BUSCA NO BACKEND)

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
let selectedCoin = null; // Guarda o objeto da moeda selecionada {id, name, symbol}
let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');

    // Lógica do Autocomplete com busca no backend
    assetInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = assetInput.value.trim();
        selectedCoin = null;

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        // Debounce: espera 300ms depois de o utilizador parar de digitar
        debounceTimer = setTimeout(async () => {
            try {
                // Chama a nossa nova Edge Function
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
                            selectedCoin = coin; // Guarda o objeto inteiro
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

        } catch (error) {
            console.error("Erro ao criar alarme:", error);
            feedbackDiv.textContent = `Erro: ${error.message}`;
            feedbackDiv.style.color = '#dc3545';
        } finally {
            submitButton.disabled = false;
        }
    });
});
