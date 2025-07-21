// js/market-scan.js

import { supabase } from './services.js';

const CACHE_KEY_DATA = 'marketScannerCache';
const CACHE_KEY_TIMESTAMP = 'marketScannerCacheTime';
const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutos

// NOVO: Variáveis para armazenar os dados brutos e o estado de ordenação/filtragem
let allTickersData = []; // Armazenará os tickers originais da Binance
let allExtraData = {};  // Armazenará os dados de indicadores da Edge Function
let currentSortBy = 'volume'; // Valor inicial do dropdown
let filterRsi = false;       // Estado inicial do filtro RSI
let filterStoch = false;     // Estado inicial do filtro Estocástico

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

// ALTERADO: A função de renderização agora espera uma lista já ordenada/filtrada
function renderPageContent(processedTickers) {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;
    if (processedTickers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum ativo corresponde aos filtros.</td></tr>';
        return;
    }
    const tableRowsHtml = processedTickers.map((ticker, index) => createTableRow(ticker, index, allExtraData)).join('');
    tbody.innerHTML = tableRowsHtml;
    processedTickers.forEach(ticker => {
        const symbolData = allExtraData[ticker.symbol];
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
                    <button class="icon-action-btn view-chart-btn" data-symbol="${ticker.symbol}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></button>
                    <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    <a href="${createAlarmUrl}" class="icon-action-btn" title="Criar Alarme"><i class="fa-solid fa-bell"></i></a>
                    <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar à Watchlist"><i class="fa-solid fa-plus"></i></a>
                </div>
            </td>
        </tr>`;
}

/**
 * Aplica os filtros e ordenação atuais e renderiza a tabela.
 */
function applyFiltersAndSort() {
    let processedTickers = [...allTickersData]; // Começa com uma cópia dos dados brutos

    // 1. Aplica filtros
    if (filterRsi) {
        processedTickers = processedTickers.filter(ticker => {
            const assetExtraData = allExtraData[ticker.symbol];
            return assetExtraData && assetExtraData.rsi_1h !== null && assetExtraData.rsi_1h < 45;
        });
    }
    if (filterStoch) {
        processedTickers = processedTickers.filter(ticker => {
            const assetExtraData = allExtraData[ticker.symbol];
            return assetExtraData && assetExtraData.stoch_1h !== null && 
                   (assetExtraData.stoch_1h.k < 20 || assetExtraData.stoch_1h.d < 20);
        });
    }

    // 2. Aplica ordenação
    processedTickers.sort((a, b) => {
        if (currentSortBy === 'volume') {
            return parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume);
        } else if (currentSortBy === 'price_change_percent_desc') {
            return parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
        } else if (currentSortBy === 'price_change_percent_asc') {
            return parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent);
        } else if (currentSortBy === 'symbol_asc') {
            return a.symbol.localeCompare(b.symbol);
        }
        return 0; // Se nenhuma opção de ordenação for selecionada
    });

    renderPageContent(processedTickers); // Renderiza os dados processados
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
        allTickersData = cachedData.tickers; // Guarda os dados brutos do cache
        allExtraData = cachedData.extraData;
        applyFiltersAndSort(); // Aplica e renderiza
        return;
    }
    
    console.log("Cache do scanner inválido. A buscar novos dados da API.");
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allFetchedTickers = await response.json(); // Renomeado para evitar conflito

        // Filtra para ter apenas pares USDC com volume (os 50 primeiros)
        const initialFilteredTickers = allFetchedTickers
            .filter(ticker => ticker.symbol.endsWith('USDC') && parseFloat(ticker.quoteVolume) > 0)
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 50);

        const symbols = initialFilteredTickers.map(t => t.symbol);
        const { data: extraData, error: extraDataError } = await supabase.functions.invoke('get-sparklines-data', { body: { symbols } });
        if (extraDataError) throw extraDataError;

        // Guarda os dados brutos após a busca bem-sucedida
        allTickersData = initialFilteredTickers;
        allExtraData = extraData;

        const dataToCache = { tickers: allTickersData, extraData: allExtraData };
        sessionStorage.setItem(CACHE_KEY_DATA, JSON.stringify(dataToCache));
        sessionStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now());

        applyFiltersAndSort(); // Aplica e renderiza
    } catch (error) {
        console.error("Erro ao carregar dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Não foi possível carregar os dados.</td></tr>';
    }
}


// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('market-scan-tbody');
    const sortBySelect = document.getElementById('sort-by');
    const filterRsiCheckbox = document.getElementById('filter-rsi');
    const filterStochCheckbox = document.getElementById('filter-stoch');

    // Inicializa o estado de ordenação e filtro com os valores da UI, se existirem
    if (sortBySelect) {
        currentSortBy = sortBySelect.value;
        sortBySelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value;
            applyFiltersAndSort();
        });
    }
    if (filterRsiCheckbox) {
        filterRsi = filterRsiCheckbox.checked;
        filterRsiCheckbox.addEventListener('change', (e) => {
            filterRsi = e.target.checked;
            applyFiltersAndSort();
        });
    }
    if (filterStochCheckbox) {
        filterStoch = filterStochCheckbox.checked;
        filterStochCheckbox.addEventListener('change', (e) => {
            filterStoch = e.target.checked;
            applyFiltersAndSort();
        });
    }

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
