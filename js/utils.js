// js/utils.js

import { supabase } from './alarms.js'; // Vamos precisar de uma pequena alteração em alarms.js

/**
 * Anexa a funcionalidade de autocomplete a um campo de input.
 * @param {HTMLInputElement} inputElement - O campo de input onde o utilizador digita.
 * @param {HTMLDivElement} resultsContainer - O div onde os resultados serão mostrados.
 * @param {function(object): void} onCoinSelect - Uma função de callback que é chamada quando uma moeda é selecionada.
 */
export function setupAutocomplete(inputElement, resultsContainer, onCoinSelect) {
    let debounceTimer;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = inputElement.value.trim();
        onCoinSelect(null); // Limpa a seleção anterior

        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const { data: results, error } = await supabase.functions.invoke('search-coins', { body: { query } });
                if (error) throw error;

                resultsContainer.innerHTML = '';
                if (results.length > 0) {
                    results.forEach(coin => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.innerHTML = `<img src="${coin.thumb}" width="20" height="20" style="margin-right: 10px;"> <strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})`;
                        item.addEventListener('click', () => {
                            inputElement.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
                            resultsContainer.style.display = 'none';
                            onCoinSelect(coin); // Chama o callback com a moeda selecionada
                        });
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.style.display = 'none';
                }
            } catch (err) {
                console.error("Erro ao buscar moedas:", err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            resultsContainer.style.display = 'none';
        }
    });
}
