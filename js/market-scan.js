// js/market-scan.js - Cérebro da Página de Scanner de Mercado

// Função para formatar números grandes (ex: 1.25B para biliões, 345.M para milhões)
function formatVolume(volume) {
    if (volume >= 1_000_000_000) {
        return (volume / 1_000_000_000).toFixed(2) + 'B';
    } else if (volume >= 1_000_000) {
        return (volume / 1_000_000).toFixed(2) + 'M';
    } else if (volume >= 1_000) {
        return (volume / 1_000).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
}

// Função principal que busca e mostra os dados
async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) {
        console.error("Elemento <tbody> da tabela não encontrado.");
        return;
    }

    try {
        // 1. Buscar os dados de 24h de TODOS os pares da Binance
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allTickers = await response.json();

        // 2. Filtrar, Ordenar e Limitar os dados
        const top30Usdc = allTickers
            // Filtra apenas por pares que terminam em "USDC"
            .filter(ticker => ticker.symbol.endsWith('USDC'))
            // Ordena pelo volume (quoteVolume), do maior para o menor
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            // Pega apenas nos primeiros 30
            .slice(0, 30);

        if (top30Usdc.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
            return;
        }

        // 3. Gerar as linhas da tabela
        const tableRowsHtml = top30Usdc.map((ticker, index) => {
            const baseAsset = ticker.symbol.replace('USDC', ''); // Ex: "BTCUSDC" -> "BTC"
            const price = parseFloat(ticker.lastPrice);
            const volume = parseFloat(ticker.quoteVolume);
            const priceChangePercent = parseFloat(ticker.priceChangePercent);
            
            // Define a cor da variação de preço
            const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';

            // Links dinâmicos
            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}`;
            const createAlarmUrl = `alarms.html?assetSymbol=${baseAsset}`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="asset-name">
                            <!-- Ícone virá de uma fonte externa no futuro, por agora usamos texto -->
                            <span>${baseAsset}</span>
                        </div>
                    </td>
                    <td>${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td>${formatVolume(volume)}</td>
                    <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
                    <td>
                        <div class="action-buttons">
                            <a href="${tradingViewUrl}" target="_blank" class="btn edit-btn">Gráfico</a>
                            <a href="${createAlarmUrl}" class="btn btn-primary">Criar Alarme</a>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = tableRowsHtml;

    } catch (error) {
        console.error("Erro ao carregar os dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Não foi possível carregar os dados. Tente novamente.</td></tr>';
    }
}

// --- LÓGICA EXECUTADA QUANDO A PÁGINA CARREGA ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMarketData();
});
