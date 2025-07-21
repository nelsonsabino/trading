// js/market-scan.js

import { supabase } from './services.js';

const CACHE_KEY_DATA = 'marketScannerCache';
const CACHE_KEY_TIMESTAMP = 'marketScannerCacheTime';
const CACHE_DURATION_MS = 2 * 60 * 1000;

const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

function openChartModal(symbol) {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = ''; 
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    new TradingView.widget({
        "container_id": "chart-modal-container", "autosize": true, "symbol": `BINANCE:${symbol}`,
        "interval": "240", "timezone": "Etc/UTC", "theme": currentTheme, "style": "1", "locale": "pt",
        "hide_side_toolbar": false, "allow_symbol_change": true,
        "studies": ["STD;MA%Ribbon", "STD;RSI"]
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
    chartModal.addEventListener('click', (e) => { if (e.target.id === 'chart-modal') closeChartModal(); });
}

function renderSparkline(containerId, dataSeries) {
    if (!dataSeries || dataSeries.length < 2) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const firstPrice = dataSeries[0];
    const lastPrice = dataSeries[dataSeries.length - 1];
    const chartColor = lastPrice >= firstPrice ? '#28a745' : '#dc3545';
    const options = {
        series: [{ data: dataSeries }], chart: { type: 'line', height: 50, sparkline: { enabled: true }},
        stroke: { curve: 'smooth', width: 2 }, colors: [chartColor],
        tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' }, formatter: (val) => val.toFixed(5) }, marker: { show: false }}
    };
    const chart = new ApexCharts(container, options);
    chart.render();
}

function renderPageContent(tickers, extraData) {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;
    if (tickers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
        return;
    }
    const tableRowsHtml = tickers.map((ticker, index) => createTableRow(ticker, index, extraData)).join('');
    tbody.innerHTML = tableRowsHtml;
    tickers.forEach(ticker => {
        const symbolData = extraData[ticker.symbol];
        if (symbolData && symbolData.sparkline) {
            renderSparkline(`sparkline-${ticker.symbol}`, symbolData.sparkline);
        }
    });
}

function formatVolume(volume) {
    if (volume >= 1_000_000_000) return (volume / 1_000_000_000).toFixed(2) + 'B';
    if (volume >= 1_000_000) return (volume / 1_000_000).toFixed(2) + 'M';
    if (volume >= 1_000) return (volume / 1_000).toFixed(2) + 'K';
    return volume.toFixed(2);
}

function createTableRow(ticker, index, extraData) {
    const baseAsset = ticker.symbol.replace('USDC', '');
    const price = parseFloat(ticker.lastPrice);
    const volume = parseFloat(ticker.quoteVolume);
    const priceChangePercent = parseFloat(ticker.priceChangePercent);
    const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}`;
    const createAlarmUrl = `alarms.html?assetPair=${ticker.symbol}`;
    const addOpportunityUrl = `index.html?assetPair=${ticker.symbol}`;

    let rsiSignalHtml = '';
    let stochSignalHtml = '';

    const assetExtraData = extraData[ticker.symbol];
    
    if (assetExtraData && assetExtraData.rsi_1h !== null && assetExtraData.rsi_1h < 45) {
        const rsiValue = assetExtraData.rsi_1h.toFixed(1);
        rsiSignalHtml = `<span class="rsi-signal" data-tooltip="RSI (1h) está em ${rsiValue}">RSI</span>`;
    }
    
    if (assetExtraData && assetExtraData.stoch_1h !== null) {
        const stochK = assetExtraData.stoch_1h.k;
        const stochD = assetExtraData.stoch_1h.d;
        if (stochK < 20 || stochD < 20) {
            stochSignalHtml = `<span class="stoch-signal" data-tooltip="Stoch (1h) K:${stochK.toFixed(1)} D:${stochD.toFixed(1)}">STC</span>`;
        }
    }

    return `
        <tr>
            <td>${index + 1}</td>
            <td><div class="asset-name"><strong><a href="asset-details.html?symbol=${ticker.symbol}" class="asset-link">${baseAsset}</a></strong> ${rsiSignalHtml} ${stochSignalHtml}</div></td>
            <td>${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td class="sparkline-cell"><div class="sparkline-container" id="sparkline-${ticker.symbol}"></div></td>
            <td>${formatVolume(volume)}</td>
            <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
            <td>
                <div class="action-buttons">
                    <!-- ALTERAÇÃO: Adicionadas classes de cor para consistência -->
                    <button class="icon-action-btn action-summary view-chart-btn" data-symbol="${ticker.symbol}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></button>
                    <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn action-full-chart" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    <a href="${createAlarmUrl}" class="icon-action-btn action-bell" title="Criar Alarme"><i class="fa-solid fa-bell"></i></a>
                    <a href="${addOpportunityUrl}" class="icon-action-btn action-plus" title="Adicionar à Watchlist"><i class="fa-solid fa-plus"></i></a>
                </div>
            </td>
        </tr>`;
}

async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">A carregar dados...</td></tr>';
    const cachedDataJSON = sessionStorage.getItem(CACHE_KEY_DATA);
    const cacheTimestamp = sessionStorage.getItem(CACHE_KEY_TIMESTAMP);

    if (cachedDataJSON && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION_MS)) {
        console.log("A carregar dados do scanner a partir do cache.");
        const cachedData = JSON.parse(cachedDataJSON);
        renderPageContent(cachedData.tickers, cachedData.extraData);
        return;
    }
    
    console.log("Cache do scanner inválido. A buscar novos dados da API.");
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allTickers = await response.json();

        const top50Usdc = allTickers
            .filter(ticker => ticker.symbol.endsWith('USDC') && parseFloat(ticker.quoteVolume) > 0)
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 50);

        if (top50Usdc.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
            return;
        }

        const symbols = top50Usdc.map(t => t.symbol);
        const { data: extraData, error: extraDataError } = await supabase.functions.invoke('get-sparklines-data', { body: { symbols } });
        if (extraDataError) throw extraDataError;

        const dataToCache = { tickers: top50Usdc, extraData: extraData };
        sessionStorage.setItem(CACHE_KEY_DATA, JSON.stringify(dataToCache));
        sessionStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now());

        renderPageContent(top50Usdc, extraData);

    } catch (error) {
        console.error("Erro ao carregar dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Não foi possível carregar os dados.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('market-scan-tbody');
    if (tbody) {
        tbody.addEventListener('click', function(e) {
            const button = e.target.closest('.view-chart-btn');
            if (button) {
                const symbol = button.dataset.symbol;
                openChartModal(symbol);
            }
        });
    }
    fetchAndDisplayMarketData();
});
