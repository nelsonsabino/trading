// js/asset-details.js

import { supabase } from './services.js';
import { getTradesForAsset } from './firebase-service.js';

let currentAssetSymbol = null; 
let currentChartTimeframe = '1h'; 
let currentChartType = 'line'; 

/**
 * Busca dados de klines e indicadores da Edge Function e renderiza o gráfico principal do ativo.
 * @param {string} symbol - O símbolo do ativo (ex: "BTCUSDC").
 * @param {string} interval - O intervalo de tempo (ex: "1h", "1d").
 * @param {string} chartType - O tipo de gráfico (ex: "line", "candlestick").
 */
async function renderMainAssetChart(symbol, interval = '1h', chartType = 'line') {
    const chartContainer = document.getElementById('main-asset-chart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '<p>A carregar gráfico...</p>';

    currentAssetSymbol = symbol; 
    currentChartTimeframe = interval; 
    currentChartType = chartType; 

    try {
        const { data: edgeFunctionResponse, error: edgeFunctionError } = await supabase.functions.invoke('get-asset-details-data', {
            body: { symbol: symbol, interval: interval },
        });

        if (edgeFunctionError) throw edgeFunctionError;
        if (!edgeFunctionResponse || !edgeFunctionResponse.ohlc || !edgeFunctionResponse.indicators) {
            throw new Error('Dados de gráfico ou indicadores não encontrados na Edge Function.');
        }

        const klinesData = edgeFunctionResponse.ohlc;
        const indicatorsData = edgeFunctionResponse.indicators;

        if (klinesData.length === 0) {
            chartContainer.innerHTML = '<p style="color:red;">Não há dados de preço para este timeframe.</p>';
            return;
        }

        let series = [];
        
        if (chartType === 'candlestick') {
            const ohlcSeriesData = klinesData.map(kline => ({
                x: kline[0], 
                y: [kline[1], kline[2], kline[3], kline[4]] 
            }));
            series.push({ name: 'Preço', type: 'candlestick', data: ohlcSeriesData });
        } else { // 'line'
            const closePriceSeriesData = klinesData.map(kline => ({
                x: kline[0],
                y: kline[4] 
            }));
            series.push({ name: 'Preço (USD)', type: 'line', data: closePriceSeriesData });
        }
        
        if (indicatorsData.ema50_data && indicatorsData.ema50_data.length === klinesData.length) {
            const ema50SeriesData = indicatorsData.ema50_data.map((emaVal, index) => ({
                x: klinesData[index][0], 
                y: emaVal 
            }));
            series.push({ name: 'EMA 50', type: 'line', data: ema50SeriesData });
        }
        if (indicatorsData.ema200_data && indicatorsData.ema200_data.length === klinesData.length) {
            const ema200SeriesData = indicatorsData.ema200_data.map((emaVal, index) => ({
                x: klinesData[index][0],
                y: emaVal
            }));
            series.push({ name: 'EMA 200', type: 'line', data: ema200SeriesData });
        }
        
        const currentPriceVal = klinesData[klinesData.length - 1][4];
        const firstPriceVal = klinesData[0][4];
        const priceChartColor = currentPriceVal >= firstPriceVal ? '#28a745' : '#dc3545';
        const ema50Color = '#ffc107'; 
        const ema200Color = '#0d6efd'; 
        const colors = [priceChartColor, ema50Color, ema200Color];

        let options = {
            series: series,
            chart: {
                type: 'line', 
                height: 400, 
                toolbar: { 
                    show: true, 
                    autoSelected: 'pan' 
                },
                zoom: { enabled: true }
            },
            dataLabels: { enabled: false },
            colors: colors, 
            stroke: { 
                curve: 'smooth',
                width: 2
            },
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'dd MMM \'yy' } },
            yaxis: { 
                labels: { 
                    formatter: (val) => `$${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                },
                tooltip: { enabled: true } 
            },
            tooltip: {
                x: { format: 'dd MMM yyyy HH:mm' },
                y: { 
                    formatter: (val, { seriesIndex, dataPointIndex, w }) => {
                        if (chartType === 'candlestick' && seriesIndex === 0) {
                            const ohlc = w.globals.initialSeries[0].data[dataPointIndex].y;
                            return `O: $${ohlc[0].toLocaleString()} H: $${ohlc[1].toLocaleString()} L: $${ohlc[2].toLocaleString()} C: $${ohlc[3].toLocaleString()}`;
                        }
                        const seriesName = w.globals.seriesNames[seriesIndex];
                        return `${seriesName}: $${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8})}`; 
                    }
                }
            },
            plotOptions: { 
                candlestick: {
                    colors: {
                        upward: '#28a745', 
                        downward: '#dc3545' 
                    }
                }
            },
            theme: {
                mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' 
            }
        };

        if (chartType === 'candlestick') {
            options.stroke = {
                width: 1, 
                colors: undefined 
            };
        }

        chartContainer.innerHTML = '';
        const chart = new ApexCharts(chartContainer, options);
        chart.render();

    } catch (err) {
        console.error("Erro ao renderizar o gráfico principal:", err);
        chartContainer.innerHTML = '<p style="color:red;">Não foi possível carregar o gráfico. ' + err.message + '</p>';
    }
}

/**
 * Renderiza o widget de Análise Técnica da TradingView.
 * @param {string} symbol - O símbolo do ativo.
 */
function renderTradingViewTechnicalAnalysisWidget(symbol) {
    const container = document.getElementById('tradingview-tech-analysis-container');
    if (!container) return;
    container.innerHTML = ''; 
    
    const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    
    const config = {
        "width": "100%", "height": "100%", "symbol": `BINANCE:${symbol}`, "interval": "1h", 
        "showIntervalTabs": true, "displayMode": "multiple", "locale": "pt", 
        "colorTheme": currentTheme, 
        "isTransparent": false
    };

    script.innerHTML = JSON.stringify(config); 
    container.appendChild(script); 
}

// --- Funções de Notícias, Alarmes e Trades ---
async function displayAlarmsForAsset(symbol) {
    const tbody = document.getElementById('asset-alarms-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3">A carregar alarmes...</td></tr>';
    try {
        const { data: alarms, error } = await supabase.from('alarms').select('*')
            .eq('asset_pair', symbol).eq('status', 'active')
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (alarms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhum alarme ativo para este ativo.</td></tr>';
            return;
        }
        const alarmsHtml = alarms.map(alarm => {
            let alarmDescription = `Preço ${alarm.condition} ${alarm.target_price} USD`;
            return `<tr><td>${alarmDescription}</td><td>${new Date(alarm.created_at).toLocaleString('pt-PT')}</td><td><a href="alarms.html" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.9em;">Gerir</a></td></tr>`;
        }).join('');
        tbody.innerHTML = alarmsHtml;
    } catch (err) {
        console.error("Erro ao buscar alarmes para o ativo:", err);
        tbody.innerHTML = '<tr><td colspan="3" style="color:red;text-align:center;">Erro ao carregar alarmes.</td></tr>';
    }
}

async function displayTradesForAsset(symbol) {
    const tbody = document.getElementById('asset-trades-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5">A carregar trades...</td></tr>';
    try {
        const trades = await getTradesForAsset(symbol);
        // DEBUG: Log dos trades recebidos
        console.log(`Trades recebidos para ${symbol}:`, trades);

        if (trades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum trade encontrado para este ativo.</td></tr>';
            return;
        }
        const tradesHtml = trades.map(trade => {
            // Assegura que as propriedades existem antes de tentar aceder
            const pnl = trade.data.status === 'CLOSED' ? (trade.data.closeDetails?.pnl || 0) : '-';
            const pnlClass = parseFloat(pnl) > 0 ? 'positive-pnl' : (parseFloat(pnl) < 0 ? 'negative-pnl' : '');
            const dateStr = trade.data.dateAdded?.toDate().toLocaleString('pt-PT') || 'N/A';
            const status = trade.data.status || 'UNKNOWN';

            const strategyName = trade.data.strategyName || 'N/A';
            const tradeId = trade.id; // Assume que o ID do documento é o trade.id

            // Adicionar data-label para responsividade
            return `<tr data-trade-id="${trade.id}">
                <td data-label="Estratégia">${strategyName}</td>
                <td data-label="Status"><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                <td data-label="Data Criação">${dateStr}</td>
                <td data-label="P&L ($)" class="${pnlClass}">${pnl !== '-' ? `$${parseFloat(pnl).toFixed(2)}` : '-'}</td>
                <td data-label="Ações"><button class="btn edit-btn" data-trade-id="${tradeId}" style="padding: 5px 10px; font-size: 0.9em;">Ver/Editar</button></td>
            </tr>`;
        }).join('');
        tbody.innerHTML = tradesHtml;
    } catch (err) {
        console.error("Erro ao buscar trades para o ativo:", err);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">Erro ao carregar trades.</td></td>';
    }
}

function editTrade(tradeId) {
    localStorage.setItem('tradeToEdit', tradeId);
    window.location.href = 'dashboard.html';
}

// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const assetSymbol = urlParams.get('symbol');

    if (!assetSymbol) {
        document.getElementById('asset-title').textContent = 'Ativo não encontrado';
        document.querySelector('main').innerHTML = '<p style="color: red; text-align: center;">Por favor, forneça um símbolo de ativo na URL (ex: ?symbol=BTCUSDC).</p>';
        return;
    }

    document.title = `Detalhes de ${assetSymbol}`;
    document.getElementById('asset-title').textContent = `Análise de ${assetSymbol}`;
    
    const timeframeSelect = document.getElementById('chart-timeframe-select');
    const chartTypeSelect = document.getElementById('chart-type-select'); 

    const loadChart = () => {
        const selectedTimeframe = timeframeSelect ? timeframeSelect.value : '1h';
        const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'line';
        renderMainAssetChart(assetSymbol, selectedTimeframe, selectedChartType);
    };

    if (timeframeSelect) timeframeSelect.addEventListener('change', loadChart);
    if (chartTypeSelect) chartTypeSelect.addEventListener('change', loadChart);
    
    loadChart(); 

    const watchlistBtn = document.getElementById('add-to-watchlist-btn');
    const alarmBtn = document.getElementById('add-alarm-btn');
    const tvBtn = document.getElementById('open-tv-btn');
    if (watchlistBtn) watchlistBtn.href = `dashboard.html?assetPair=${assetSymbol}`;
    if (alarmBtn) alarmBtn.href = `alarms-create.html?assetPair=${assetSymbol}`;
    if (tvBtn) tvBtn.href = `https://www.tradingview.com/chart/?symbol=BINANCE:${assetSymbol}`;

    const baseAsset = assetSymbol.replace(/USDC|USDT|BUSD/, '');

    displayAlarmsForAsset(assetSymbol);
    displayTradesForAsset(assetSymbol);

    const tradesTable = document.getElementById('trades-table');
    if (tradesTable) {
        tradesTable.addEventListener('click', (e) => {
            const button = e.target.closest('.edit-btn');
            if (button) {
                const tradeId = button.dataset.tradeId;
                if (tradeId) {
                    editTrade(tradeId);
                }
            }
        });
    }

    document.addEventListener('themeChange', () => {
        loadChart(); 
        renderTradingViewTechnicalAnalysisWidget(assetSymbol); 
    });

    renderTradingViewTechnicalAnalysisWidget(assetSymbol);
});
