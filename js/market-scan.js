// js/market-scan.js

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

async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) {
        console.error("Elemento <tbody> da tabela não encontrado.");
        return;
    }

    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allTickers = await response.json();

        const top30Usdc = allTickers
            .filter(ticker => ticker.symbol.endsWith('USDC'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 30);

        if (top30Usdc.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
            return;
        }

        const tableRowsHtml = top30Usdc.map((ticker, index) => {
            // 'ticker.symbol' já é o par completo, ex: "BTCUSDC"
            const baseAsset = ticker.symbol.replace('USDC', ''); // Apenas para exibição
            const price = parseFloat(ticker.lastPrice);
            const volume = parseFloat(ticker.quoteVolume);
            const priceChangePercent = parseFloat(ticker.priceChangePercent);
            
            const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';

            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}`;
            
            // --- ALTERAÇÕES APLICADAS AQUI ---
            // Enviamos o par completo para ambas as páginas
            const createAlarmUrl = `alarms.html?assetPair=${ticker.symbol}`;
            const addOpportunityUrl = `index.html?assetPair=${ticker.symbol}`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><div class="asset-name"><span>${baseAsset}</span></div></td>
                    <td>${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td>${formatVolume(volume)}</td>
                    <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
                    <td>
                        <div class="action-buttons">
                            <a href="${tradingViewUrl}" target="_blank" class="btn edit-btn">Gráfico</a>
                            <a href="${createAlarmUrl}" class="btn btn-secondary">Criar Alarme</a>
                            <a href="${addOpportunityUrl}" class="btn btn-primary">Add Oportunidade</a>
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

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMarketData();
});
