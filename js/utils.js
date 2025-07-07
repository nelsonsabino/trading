// js/utils.js (VERSÃO FINAL E INDEPENDENTE)

/**
 * Anexa a funcionalidade de autocomplete a um campo de input.
 * @param {object} supabase - A instância do cliente Supabase.
 * @param {HTMLInputElement} inputElement - O campo de input.
 * @param {HTMLDivElement} resultsContainer - O div para os resultados.
 * @param {function(object | null): void} onCoinSelect - O callback.
 */
export function setupAutocomplete(supabase, inputElement, resultsContainer, onCoinSelect) {
    let debounceTimer;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = inputElement.value.trim();
        if (onCoinSelect) onCoinSelect(null);
        if (query.length < 2) { resultsContainer.style.display = 'none'; return; }

        debounceTimer = setTimeout(async () => {
            try {
                // Chama a Edge Function 'search-coins'
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
                            if (onCoinSelect) onCoinSelect(coin);
                        });
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.style.display = 'none';
                }
            } catch (err) {
                console.error("Erro no autocomplete:", err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (e.target !== inputElement) {
            resultsContainer.style.display = 'none';
        }
    });
}
