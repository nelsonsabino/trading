// js/utils.js

import { supabase } from './services.js';

/**
 * Anexa a funcionalidade de autocomplete a um campo de input.
 * ADAPTADO PARA A NOVA API DA BINANCE (lista de strings).
 */
export function setupAutocomplete(inputElement, resultsContainer, onItemSelect) {
    let debounceTimer;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = inputElement.value.trim().toUpperCase(); // Convertemos para maiúsculas
        if (onItemSelect) { onItemSelect(null); }
        if (query.length < 2) { resultsContainer.style.display = 'none'; return; }

        debounceTimer = setTimeout(async () => {
            try {
                // A chamada à função é a mesma, mas a resposta é diferente
                const { data: results, error } = await supabase.functions.invoke('search-coins', { body: { query } });
                if (error) throw error;
                
                resultsContainer.innerHTML = '';
                if (results && results.length > 0) {
                    // 'results' agora é um array de strings, ex: ["BTCUSDC", "BTCDOMUSDC"]
                    results.forEach(pair => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        // Mostramos o par diretamente
                        item.innerHTML = `<strong>${pair}</strong>`;
                        item.addEventListener('click', () => {
                            inputElement.value = pair; // Preenche o input com o par, ex: "BTCUSDC"
                            resultsContainer.style.display = 'none';
                            if (onItemSelect) { 
                                // Passamos o par selecionado para a função de callback
                                onItemSelect(pair); 
                            }
                        });
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.style.display = 'none';
                }
            } catch (err) {
                console.error("Erro ao buscar pares para o autocomplete:", err);
                resultsContainer.style.display = 'none';
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            resultsContainer.style.display = 'none';
        }
    });
}


/**
 * Verifica se o utilizador está num dispositivo Android.
 * (Esta função permanece inalterada)
 */
export function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

/**
 * Verifica se o utilizador está num dispositivo iOS (iPhone, iPad, iPod).
 * (Esta função permanece inalterada)
 */
export function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
