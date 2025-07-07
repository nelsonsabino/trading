// js/utils.js (VERSÃO COM DETEÇÃO DE ANDROID/IOS)

import { supabase } from './services.js';

/**
 * Anexa a funcionalidade de autocomplete a um campo de input.
 * (Esta função permanece inalterada)
 */
export function setupAutocomplete(inputElement, resultsContainer, onCoinSelect) {
    let debounceTimer;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = inputElement.value.trim();
        if (onCoinSelect) { onCoinSelect(null); }
        if (query.length < 2) { resultsContainer.style.display = 'none'; return; }

        debounceTimer = setTimeout(async () => {
            try {
                const { data: results, error } = await supabase.functions.invoke('search-coins', { body: { query } });
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
                            if (onCoinSelect) { onCoinSelect(coin); }
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

    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            resultsContainer.style.display = 'none';
        }
    });
}

/**
 * NOVO: Verifica se o utilizador está num dispositivo Android.
 * @returns {boolean}
 */
export function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

/**
 * NOVO: Verifica se o utilizador está num dispositivo iOS (iPhone, iPad, iPod).
 * @returns {boolean}
 */
export function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
