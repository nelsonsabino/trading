// js/market-scan.js - VERSÃO COM O WIDGET DE ANÁLISE CORRETO (TICKER)

// --- Lógica do Modal do Gráfico ---
const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

function openChartModal(symbol) {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    new TradingView.widget({
        "container_id": "chart-modal-container",
        "allow_symbol_change": true,
        "hide_side_toolbar": false,
        "hide_top_toolbar": false,
        "autosize": true,
        "symbol": `BINANCE:${symbol}`,
        "interval": "240",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "pt",
        "studies": [
            "STD;MA%Ribbon",
            "STD;RSI"
        ]
    });
    chartModal.style.display = 'flex';
}
function closeChartModal() {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    chartModal.style.display = 'none';
}
if (chartModal) {
    closeChartModalBtn.addEventListener('click', closeChartModal);
    chartModal.addEventListener('click', (e) => { if (e.target.id === 'tech-analysis-modal') closeChartModal(); });
}

// --- Lógica do Modal da Análise Técnica ---
const techAnalysisModal = document.getElementById('tech-analysis-modal');
const closeTechAnalysisBtn = document.getElementById('close-tech-analysis-modal');
const techAnalysisContainer = document.getElementById('tech-analysis-container');

function openTechAnalysisModal(symbol) {
    if (!techAnalysisModal || !techAnalysisContainer) return;
    techAnalysisContainer.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "interval": "1D", "width": "100%", "isTransparent": false, "height": "100%",
        "symbol": `BINANCE:${symbol}`, "showIntervalTabs": true, "locale": "pt", "colorTheme": "dark"
    });
    techAnalysisContainer.appendChild(script);
    techAnalysisModal.style.display = 'flex';
}
function closeTechAnalysisModal() {
    if (!techAnalysisModal || !techAnalysisContainer) return;
    techAnalysisContainer.innerHTML = '';
    techAnalysisModal.style.display = 'none';
}
if (techAnalysisModal) {
    closeTechAnalysisBtn.addEventListener('click', closeTechAnalysisModal);
    techAnalysisModal.addEventListener('click', (e) => { if (e.target.id === 'tech-analysis-modal') closeTechAnalysisModal(); });
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

    tbody.addEventListener('click', function(e) {
        const chartBtn = e.target.closest('.view-chart-btn');
        if (chartBtn) {
            openChartModal(chartBtn.dataset.symbol);
            return;
        }
        const analysisWidget = e.target.closest('.ticker-widget-wrapper');
        if (analysisWidget) {
            openTechAnalysisModal(analysisWidget.dataset.symbol);
            return;
        }
    });

    try {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">A carregar dados...</td></tr>';
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allTickers = await response.json();

        const top30Usdc = allTickers
            .filter(ticker => ticker.symbol.endsWith('USDC') && parseFloat(ticker.quoteVolume) > 0)
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 30);

        if (top30Usdc.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum par encontrado.</td></tr>';
            return;
        }

        let tableRowsHtml = '';
        top30Usdc.forEach((ticker, index) => {
            const baseAsset = ticker.symbol.replace('USDC', '');
            const price = parseFloat(ticker.lastPrice);
            const volume = parseFloat(ticker.quoteVolume);
            const priceChangePercent = parseFloat(ticker.priceChangePercent);
            const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';

            tableRowsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td><div class="asset-name"><span>${baseAsset}</span></div></td>
                    <td>${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td>${formatVolume(volume)}</td>
                    <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
                    <td class="tech-analysis-cell">
                        <div class="ticker-widget-wrapper" data-symbol="${ticker.symbol}" id="ticker-widget-${ticker.symbol}">
                            <!-- O widget Ticker será carregado aqui -->
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary view-chart-btn" data-symbol="${ticker.symbol}">Gráfico</button>
                            <a href="https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}" target="_blank" class="btn edit-btn">App TV</a>
                            <a href="alarms.html?assetPair=${ticker.symbol}" class="btn">Alarme</a>
                            <a href="index.html?assetPair=${ticker.symbol}" class="btn btn-primary">Add</a>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = tableRowsHtml;

        top30Usdc.forEach(ticker => {
            const container = document.getElementById(`ticker-widget-${ticker.symbol}`);
            if (container) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-tickers.js';
                script.async = true;
                script.innerHTML = JSON.stringify({
                    "symbols": [
                        {
                            "description": "",
                            "proName": `BINANCE:${ticker.symbol}`
                        }
                    ],
                    "showSymbolLogo": false,
                    "isTransparent": true,
                    "displayMode": "adaptive",
                    "colorTheme": "light",
                    "locale": "pt"
                });
                container.appendChild(script);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Não foi possível carregar os dados.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMarketData();
});
