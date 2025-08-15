// js/market-scan.js

import { supabase } from './services.js';
import { openChartModal } from './chart-modal.js';

const CACHE_KEY_DATA = 'marketScannerCache';
const CACHE_KEY_TIMESTAMP = 'marketScannerCacheTime';
const CACHE_DURATION_MS = 2 * 60 * 1000;

let allTickersData = [];
let allExtraData = {};
let currentSortBy = 'volume';
let filterRsi = false;
let filterStoch = false;
let filterThirdTouch = false;
let showSparklines = true;
let currentTopN = 50;

function renderSparkline(containerId, dataSeries) {
    if (!dataSeries || dataSeries.length < 2) return;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const firstPrice = dataSeries[0];
    const lastPrice = dataSeries[dataSeries.length - 1];
    const chartColor = lastPrice >= firstPrice ? '#28a745' : '#dc3545';
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const options = {
        series: [{ data: dataSeries }], 
        chart: { type: 'line', height: 50, sparkline: { enabled: true }},
        stroke: { curve: 'smooth', width: 2 }, 
        colors: [chartColor],
        tooltip: { 
            fixed: { enabled: false }, 
            x: { show: false }, 
            y: { title: { formatter: () => '' }, formatter: (val) => val.toFixed(5) }, 
            marker: { show: false },
            theme: isDarkMode ? 'dark' : 'light'
        }
    };
    const chart = new ApexCharts(container, options);
    chart.render();
}

function renderPageContent(processedTickers) {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;
    const marketTable = tbody.closest('.market-table'); 
    if (marketTable) {
        marketTable.classList.toggle('hide-sparkline-column', !showSparklines);
    }
    if (processedTickers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum ativo corresponde aos filtros.</td></tr>';
        return;
    }
    const finalTickersToDisplay = processedTickers.slice(0, currentTopN); 
    tbody.innerHTML = finalTickersToDisplay.map((ticker, index) => createTableRow(ticker, index, allExtraData)).join('');
    
    if (showSparklines) {
        finalTickersToDisplay.forEach(ticker => {
            const symbolData = allExtraData[ticker.symbol];
            if (symbolData && symbolData.sparkline) {
                renderSparkline(`sparkline-${ticker.symbol}`, symbolData.sparkline);
            }
        });
    }
}

function formatVolume(volume) {
    if (volume >= 1_000_000_000) return (volume / 1_000_000_000).toFixed(2) + 'B';
    if (volume >= 1_000_000) return (volume / 1_000_000).toFixed(2) + 'M';
    if (volume >= 1_000) return (volume / 1_000).toFixed(2) + 'K';
    return volume.toFixed(2);
}

async function handleMonitorAssetClick(symbol) {
    const button = document.querySelector(`button[data-action="monitor"][data-symbol="${symbol}"]`);
    if (button) button.disabled = true;

    try {
        const alarmData = {
            asset_pair: symbol,
            alarm_type: 'stochastic_crossover',
            condition: 'above',
            indicator_timeframe: '15m',
            indicator_period: 14,
            combo_period: 3,
            status: 'active'
        };
        const { error } = await supabase.from('alarms').insert([alarmData]);
        if (error) throw error;
        if (button) {
            const originalIcon = button.innerHTML;
            button.innerHTML = `<span class="material-symbols-outlined">check</span>`;
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error(`Erro ao criar alarme para ${symbol}:`, error);
        alert(`Não foi possível criar o alarme para ${symbol}. Verifique se já existe um alarme similar.`);
        if (button) button.disabled = false;
    }
}

function createTableRow(ticker, index, extraData) {
    const baseAsset = ticker.symbol.replace('USDC', '');
    const price = parseFloat(ticker.lastPrice);
    const volume = parseFloat(ticker.quoteVolume);
    const priceChangePercent = parseFloat(ticker.priceChangePercent);
    const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}`;
    const createAlarmUrl = `alarms-create.html?assetPair=${ticker.symbol}`;

    let rsiSignalHtml = '', stochSignalHtml = '', thirdTouchSignalHtml = '';
    const assetExtraData = extraData[ticker.symbol];
    if (assetExtraData) {
        if (assetExtraData.rsi_1h !== null && assetExtraData.rsi_1h < 45) {
            rsiSignalHtml = `<span class="rsi-signal" data-tooltip="RSI (1h) está em ${assetExtraData.rsi_1h.toFixed(1)}">RSI</span>`;
        }
        
        if (assetExtraData.stoch_4h !== null && typeof assetExtraData.stoch_4h === 'number' && assetExtraData.stoch_4h < 35) {
            const hasConfirmedCross = assetExtraData.stoch_4h_bullish_cross;
            const signalClass = hasConfirmedCross ? 'stoch-signal crossover-confirmed' : 'stoch-signal';
            // --- INÍCIO DA ALTERAÇÃO ---
            const signalText = 'STC'; // O asterisco será adicionado via CSS
            // --- FIM DA ALTERAÇÃO ---
            const tooltipText = hasConfirmedCross
                ? `Stoch (4h) K:${assetExtraData.stoch_4h.toFixed(1)} com Cruzamento Bullish Confirmado`
                : `Stoch (4h) K:${assetExtraData.stoch_4h.toFixed(1)}`;

            stochSignalHtml = `<span class="${signalClass}" data-tooltip="${tooltipText}">${signalText}</span>`;
        }

        if (assetExtraData.thirdTouchSignal_1h) {
            const { type } = assetExtraData.thirdTouchSignal_1h;
            thirdTouchSignalHtml += `<span class="third-touch-signal ${type === 'LTA' ? 'support' : 'resistance'}" data-tooltip="3º Toque em ${type} (1h)">${type}-3 1h</span>`;
        }
        if (assetExtraData.thirdTouchSignal_4h) {
            const { type } = assetExtraData.thirdTouchSignal_4h;
            thirdTouchSignalHtml += `<span class="third-touch-signal ${type === 'LTA' ? 'support' : 'resistance'}" data-tooltip="3º Toque em ${type} (4h)">${type}-3 4h</span>`;
        }
    }

    let formattedPrice = price >= 1.0 ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumSignificantDigits: 8 });
    const sparklineCellHtml = showSparklines ? `<td data-label="Sparkline (24h)" class="sparkline-cell"><div class="sparkline-container" id="sparkline-${ticker.symbol}"></div></td>` : `<td></td>`;
    
    return `
        <tr>
            <td data-label="#">${index + 1}</td>
            <td data-label="Ativo"><div class="asset-name"><strong><a href="asset-details.html?symbol=${ticker.symbol}" class="asset-link">${baseAsset}</a></strong> ${rsiSignalHtml} ${stochSignalHtml} ${thirdTouchSignalHtml}</div></td>
            <td data-label="Último Preço">${formattedPrice}</td>
            ${sparklineCellHtml}
            <td data-label="Volume (24h)">${formatVolume(volume)}</td>
            <td data-label="Variação (24h)" class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button class="icon-action-btn" data-action="monitor" data-symbol="${ticker.symbol}" title="Monitorizar Ativo (Cria Alarme Stoch 15m)"><span class="material-symbols-outlined">visibility</span></button>
                    <button class="icon-action-btn" data-action="view-chart" data-symbol="${ticker.symbol}" title="Ver Gráfico"><span class="material-symbols-outlined">monitoring</span></button>
                    <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="TradingView"><span class="material-symbols-outlined">open_in_new</span></a>
                    <a href="${createAlarmUrl}" class="icon-action-btn" title="Criar Alarme Detalhado"><span class="material-symbols-outlined">alarm_add</span></a>
                </div>
            </td>
        </tr>`;
}

function applyFiltersAndSort() {
    let processedTickers = [...allTickersData];
    if (filterRsi) processedTickers = processedTickers.filter(t => allExtraData[t.symbol]?.rsi_1h < 45);
    if (filterStoch) processedTickers = processedTickers.filter(t => allExtraData[t.symbol]?.stoch_4h < 35);
    if (filterThirdTouch) {
        processedTickers = processedTickers.filter(t => {
            const extra = allExtraData[t.symbol];
            return extra && (extra.thirdTouchSignal_1h || extra.thirdTouchSignal_4h);
        });
    }

    processedTickers.sort((a, b) => {
        if (currentSortBy === 'volume') return parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume);
        if (currentSortBy === 'price_change_percent_desc') return parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent);
        if (currentSortBy === 'price_change_percent_asc') return parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent);
        if (currentSortBy === 'symbol_asc') return a.symbol.localeCompare(b.symbol);
        return 0;
    });
    renderPageContent(processedTickers);
}

async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">A carregar dados...</td></tr>';
    
    const cachedDataJSON = sessionStorage.getItem(CACHE_KEY_DATA);
    const cacheTimestamp = sessionStorage.getItem(CACHE_KEY_TIMESTAMP);

    if (cachedDataJSON && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION_MS)) {
        const cachedData = JSON.parse(cachedDataJSON);
        allTickersData = cachedData.tickers;
        allExtraData = cachedData.extraData;
        applyFiltersAndSort();
        return;
    }
    
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allFetchedTickers = await response.json();
        const initialFilteredTickers = allFetchedTickers.filter(t => t.symbol.endsWith('USDC') && parseFloat(t.quoteVolume) > 0).sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        const symbolsForExtraData = initialFilteredTickers.slice(0, 200).map(t => t.symbol);
        const { data, error } = await supabase.functions.invoke('get-sparklines-data', { body: { symbols: symbolsForExtraData } });
        if (error) throw error;
        allTickersData = initialFilteredTickers;
        allExtraData = data;
        sessionStorage.setItem(CACHE_KEY_DATA, JSON.stringify({ tickers: allTickersData, extraData: allExtraData }));
        sessionStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now());
        applyFiltersAndSort();
    } catch (error) {
        console.error("Erro ao carregar dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Não foi possível carregar os dados.</td></tr>';
    }
}

function updateMarketScanTitle() {
    const titleElement = document.getElementById('market-scan-title');
    if (titleElement) {
        const textNode = [...titleElement.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = ` Top ${currentTopN} Pares com Maior Volume (USDC)`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('market-scan-tbody');
    const sortBySelect = document.getElementById('sort-by');
    const filterRsiCheckbox = document.getElementById('filter-rsi');
    const filterStochCheckbox = document.getElementById('filter-stoch');
    const filterThirdTouchCheckbox = document.getElementById('filter-third-touch');
    const toggleSparklinesCheckbox = document.getElementById('toggle-sparklines');
    const topNSelect = document.getElementById('top-n-select');

    const savedSparklinesState = localStorage.getItem('showSparklines');
    if (savedSparklinesState !== null) {
        showSparklines = JSON.parse(savedSparklinesState);
        if (toggleSparklinesCheckbox) toggleSparklinesCheckbox.checked = showSparklines;
    }
    const savedTopNState = localStorage.getItem('marketScannerTopN');
    if (savedTopNState !== null) {
        currentTopN = parseInt(savedTopNState);
        if (topNSelect) topNSelect.value = currentTopN.toString();
    }
    updateMarketScanTitle();

    if (toggleSparklinesCheckbox) toggleSparklinesCheckbox.addEventListener('change', (e) => { showSparklines = e.target.checked; localStorage.setItem('showSparklines', JSON.stringify(showSparklines)); applyFiltersAndSort(); });
    if (topNSelect) topNSelect.addEventListener('change', (e) => { currentTopN = parseInt(e.target.value); localStorage.setItem('marketScannerTopN', currentTopN.toString()); updateMarketScanTitle(); fetchAndDisplayMarketData(); });
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => { currentSortBy = e.target.value; applyFiltersAndSort(); });
    if (filterRsiCheckbox) filterRsiCheckbox.addEventListener('change', (e) => { filterRsi = e.target.checked; applyFiltersAndSort(); });
    if (filterStochCheckbox) filterStochCheckbox.addEventListener('change', (e) => { filterStoch = e.target.checked; applyFiltersAndSort(); });
    if (filterThirdTouchCheckbox) filterThirdTouchCheckbox.addEventListener('change', (e) => { filterThirdTouch = e.target.checked; applyFiltersAndSort(); });
    
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const button = e.target.closest('button, a');
            if (!button) return;
            const action = button.dataset.action;
            const symbol = button.dataset.symbol;

            if (action === 'monitor' && symbol) {
                e.preventDefault();
                handleMonitorAssetClick(symbol);
            } else if (action === 'view-chart' && symbol) {
                e.preventDefault();
                openChartModal(symbol);
            }
        });
    }
    
    fetchAndDisplayMarketData();
});
