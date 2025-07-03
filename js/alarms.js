// js/alarms.js (VERSÃO COM AUTOCOMPLETE)

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let coinList = [];
let selectedCoinId = null;

// Função para buscar a lista de moedas da CoinGecko
async function fetchCoinList() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (!response.ok) throw new Error('Falha ao carregar a lista de moedas.');
        coinList = await response.json();
        console.log(`Lista de ${coinList.length} moedas carregada da CoinGecko.`);
    } catch (error) {
        console.error("Erro ao buscar a lista de moedas:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Busca a lista de moedas assim que a página carrega
    fetchCoinList();

    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    const assetInput = document.getElementById('alarm-asset');
    const resultsDiv = document.getElementById('autocomplete-results');

    if (!alarmForm || !supabase || !assetInput || !resultsDiv) {
        console.error("ERRO: Um ou mais elementos do formulário de alarme não foram encontrados.");
        return;
    }

    // Lógica do Autocomplete
    assetInput.addEventListener('input', () => {
        const query = assetInput.value.toLowerCase();
        selectedCoinId = null; // Reseta a seleção se o utilizador digita novamente
        if (query.length < 2) {
            resultsDiv.innerHTML = '';
            resultsDiv.style.display = 'none';
            return;
        }

        const filtered = coinList.filter(coin => 
            coin.id.toLowerCase().includes(query) || 
            coin.name.toLowerCase().includes(query) || 
            coin.symbol.toLowerCase().includes(query)
        ).slice(0, 50); // Limita a 50 resultados para performance

        resultsDiv.innerHTML = '';
        if (filtered.length > 0) {
            filtered.forEach(coin => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.innerHTML = `<strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})`;
                item.addEventListener('click', () => {
                    assetInput.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
                    selectedCoinId = coin.id; // Guarda o ID correto
                    resultsDiv.style.display = 'none';
                });
                resultsDiv.appendChild(item);
            });
            resultsDiv.style.display = 'block';
        } else {
            resultsDiv.style.display = 'none';
        }
    });

    // Esconde os resultados se o utilizador clicar fora
    document.addEventListener('click', (e) => {
        if (e.target !== assetInput) {
            resultsDiv.style.display = 'none';
        }
    });


    // Lógica de Submissão do Formulário
    async function createAlarm() {
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
            if (!selectedCoinId) {
                throw new Error("Por favor, selecione uma moeda válida da lista de sugestões.");
            }

            const assetName = assetInput.value; // O nome completo para a mensagem de feedback
            const condition = document.getElementById('alarm-condition-standalone').value;
            const targetPrice = parseFloat(document.getElementById('alarm-price-standalone').value);

            if (isNaN(targetPrice) || targetPrice <= 0) {
                throw new Error("Por favor, preencha um preço alvo válido.");
            }
            
            const alarmData = {
                asset_id: selectedCoinId, // Usa o ID guardado
                asset_symbol: assetName.match(/\(([^)]+)\)/)[1], // Extrai o símbolo de dentro dos parênteses
                condition: condition,
                target_price: targetPrice,
                status: 'active'
            };

            const { error } = await supabase.from('alarms').insert([alarmData]);
            if (error) throw error;

            feedbackDiv.textContent = `✅ Alarme para ${assetName} criado com sucesso!`;
            feedbackDiv.style.color = '#28a745';
            alarmForm.reset();

        } catch (error) {
            console.error("Erro ao criar alarme:", error);
            feedbackDiv.textContent = `Erro: ${error.message}`;
            feedbackDiv.style.color = '#dc3545';
        } finally {
            submitButton.disabled = false;
        }
    }

    alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createAlarm();
    });
});
