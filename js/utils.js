// js/utils.js - Módulo de Funções Reutilizáveis

// Importamos a instância do cliente Supabase do alarms.js
import { supabase } from './services.js';

/**
 * Anexa a funcionalidade de autocomplete a um campo de input.
 * @param {HTMLInputElement} inputElement - O campo de input onde o utilizador digita.
 * @param {HTMLDivElement} resultsContainer - O div onde os resultados serão mostrados.
 * @param {function(object | null): void} onCoinSelect - Uma função de callback que é chamada quando uma moeda é selecionada ou a seleção é limpa.
 */
export function setupAutocomplete(inputElement, resultsContainer, onCoinSelect) {
    let debounceTimer;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = inputElement.value.trim();
        
        // Limpa a seleção anterior sempre que o utilizador digita
        if (onCoinSelect) {
            onCoinSelect(null);
        }

        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        // Debounce: espera 300ms depois de o utilizador parar de digitar
        debounceTimer = setTimeout(async () => {
            try {
                // Chama a nossa Edge Function 'search-coins'
                const { data: results, error } = await supabase.functions.invoke('search-coins', {
                    body: { query }
                });

                if (error) throw error;

                resultsContainer.innerHTML = '';
                if (results && results.length > 0) {
                    results.forEach(coin => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.innerHTML = `<img src="${coin.thumb}" width="20" height="20" style="margin-right: 10px;"> <strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})`;
                        
                        item.addEventListener('click', () => {
                            inputElement.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
                            resultsContainer.style.display = 'none';
                            
                            // Chama o callback com o objeto da moeda selecionada
                            if (onCoinSelect) {
                                onCoinSelect(coin);
                            }
                        });
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.style.display = 'none';
                }
            } catch (err) {
                console.error("Erro ao buscar moedas para o autocomplete:", err);
                resultsContainer.style.display = 'none';
            }
        }, 300);
    });

    // Esconde os resultados se o utilizador clicar fora do input
    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            resultsContainer.style.display = 'none';
        }
    });
}


/**
 * Verifica se o utilizador está a aceder a partir de um dispositivo móvel.
 * @returns {boolean} - True se for um dispositivo móvel, caso contrário false.
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
