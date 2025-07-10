// js/market-scan.js - VERSÃO COM GRÁFICO EM MODAL

// --- Lógica do Modal do Gráfico ---
const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');
let chartWidget = null;



function openChartModal(symbol) {
    if (!chartModal || !chartContainer) return;

    chartContainer.innerHTML = ''; 

    chartWidget = new TradingView.widget({
        "container_id": "chart-modal-container",
        "autosize": true,
        "symbol": `BINANCE:${symbol}`,
        "interval": "240", // 4 Horas
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "pt",
        "toolbar_bg": "#f1f5f9",
        "enable_publishing": false,
        "hide_side_toolbar": true,
        "save_image": false,
        "allow_symbol_change": true,
        // O array 'studies' aqui muitas vezes é ignorado, por isso vamos usar onChartReady
        "studies": [] 
    });

    // --- CORREÇÃO APLICADA AQUI ---
    // Usamos o evento onChartReady para adicionar o indicador de forma fiável
    chartWidget.onChartReady(function() {
        // O método createStudy recebe o nome do estudo, se deve ser forçado no painel principal,
        // e um objeto com os parâmetros.
        chartWidget.chart().createStudy('Moving Average Exponential', false, false, {
            length: 50
        });
    });

    chartModal.style.display = 'flex';
}



function closeChartModal() {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = ''; // Destrói o widget para libertar recursos
    chartWidget = null;
    chartModal.style.display = 'none';
}

if (chartModal) {
    closeChartModalBtn.addEventListener('click', closeChartModal);
    chartModal.addEventListener('click', (e) => {
        if (e.target.id === 'chart-modal') {
            closeChartModal();
        }
    });
}


// --- Lógica Principal da Página ---

function formatVolume(volume) {
    if (volume >= 1_000_000_000) return (volume / 1_000_000_000).toFixed(2) + 'B';
    if (volume >= 1_000_000) return (volume / 1_000_000).toFixed(2) + 'M';
    if (volume >= 1_000) return (volume / 1_000).toFixed(2) + 'K';
    return volume.toFixed(2);
}

async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;

    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allTickers = await response.json();

        const top30Usdc = allTickers
            .filter(ticker => ticker.symbol.endsWith('USDC') && parseFloat(ticker.quoteVolume) > 0)
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 30);

        if (top30Usdc.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
            return;
        }

        const tableRowsHtml = top30Usdc.map((ticker, index) => {
            const baseAsset = ticker.symbol.replace('USDC', '');
            const price = parseFloat(ticker.lastPrice);
            const volume = parseFloat(ticker.quoteVolume);
            const priceChangePercent = parseFloat(ticker.priceChangePercent);
            const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';

            // Links para outras páginas
            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}`;
            const createAlarmUrl = `alarms.html?assetPair=${ticker.symbol}`;
            const addOpportunityUrl = `index.html?assetPair=${ticker.symbol}`;

            // O botão do gráfico agora tem um atributo 'data-symbol'
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><div class="asset-name"><span>${baseAsset}</span></div></td>
                    <td>${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td>${formatVolume(volume)}</td>
                    <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary view-chart-btn" data-symbol="${ticker.symbol}">Ver Gráfico</button>
                            <a href="${tradingViewUrl}" target="_blank" class="btn edit-btn">App TV</a>
                            <a href="${createAlarmUrl}" class="btn">Alarme</a>
                            <a href="${addOpportunityUrl}" class="btn btn-primary">Add</a>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = tableRowsHtml;

        // Adiciona os event listeners aos novos botões DEPOIS de os inserir no DOM
        document.querySelectorAll('.view-chart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const symbol = e.currentTarget.dataset.symbol;
                openChartModal(symbol);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Não foi possível carregar os dados. Tente novamente.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMarketData();
});
