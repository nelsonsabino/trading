// js/asset-details.js

import { supabase } from './services.js';
import { getTradesForAsset } from './firebase-service.js';

const CRYPTOCOMPARE_API_KEY = "92d8c73125edcc9a95da0a5f30a6ca4720e5fdba544dba9bae2cd3495039aba7";

let currentAssetSymbol = null; 
let currentChartTimeframe = '1h'; 
let currentChartType = 'area'; 

/**
 * Busca dados de klines e indicadores da Edge Function e renderiza o gráfico principal do ativo.
 * @param {string} symbol - O símbolo do ativo (ex: "BTCUSDC").
 * @param {string} interval - O intervalo de tempo (ex: "1h", "1d").
 * @param {string} chartType - O tipo de gráfico (ex: "area", "candlestick", "bar", "line").
 */
async function renderMainAssetChart(symbol, interval = '1h', chartType = 'area') {
    const chartContainer = document.getElementById('main-asset-chart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '<p>A carregar gráfico...</p>';

    currentAssetSymbol = symbol; 
    currentChartTimeframe = interval; 
    currentChartType = chartType; 

    try {
        // Invoca a NOVA Edge Function para obter dados de klines e indicadores
        const { data: edgeFunctionResponse, error: edgeFunctionError } = await supabase.functions.invoke('get-asset-details-data', {
            body: { symbol: symbol, interval: interval },
        });

        if (edgeFunctionError) throw edgeFunctionError;
        if (!edgeFunctionResponse || !edgeFunctionResponse.ohlc || !edgeFunctionResponse.indicators) {
            throw new Error('Dados de gráfico ou indicadores não encontrados na Edge Function.');
        }

        const klinesData = edgeFunctionResponse.ohlc; // [timestamp, open, high, low, close]
        const indicatorsData = edgeFunctionResponse.indicators; // Contém ema50_data, ema200_data, etc.

        if (klinesData.length === 0) {
            chartContainer.innerHTML = '<p style="color:red;">Não há dados de preço para este timeframe.</p>';
            return;
        }

        let series = [];
        
        // Formatação dos dados primários (preço)
        if (chartType === 'candlestick' || chartType === 'bar') {
            const ohlcSeriesData = klinesData.map(kline => ({
                x: kline[0], // Timestamp
                y: [kline[1], kline[2], kline[3], kline[4]] // Open, High, Low, Close
            }));
            series.push({ name: 'Preço', type: chartType, data: ohlcSeriesData });
        } else { // 'area' ou 'line'
            const closePriceSeriesData = klinesData.map(kline => ({
                x: kline[0],
                y: kline[4] // Close price
            }));
            series.push({ name: 'Preço (USD)', type: chartType, data: closePriceSeriesData });
        }
        
        // Adiciona as EMAs como séries de linha secundárias
        // A Edge Function já preenche com null, então podemos mapear diretamente
        if (indicatorsData.ema50_data && indicatorsData.ema50_data.length > 0) {
            const ema50SeriesData = indicatorsData.ema50_data.map((emaVal, index) => ({
                x: klinesData[index][0], // Usa o timestamp da vela correspondente
                y: emaVal // emaVal pode ser null
            }));
            series.push({ name: 'EMA 50', type: 'line', data: ema50SeriesData });
        }
        if (indicatorsData.ema200_data && indicatorsData.ema200_data.length > 0) {
            const ema200SeriesData = indicatorsData.ema200_data.map((emaVal, index) => ({
                x: klinesData[index][0],
                y: emaVal
            }));
            series.push({ name: 'EMA 200', type: 'line', data: ema200SeriesData });
        }
        
        // Define as cores do gráfico principal e das EMAs
        const currentPriceVal = klinesData[klinesData.length - 1][4];
        const firstPriceVal = klinesData[0][4];
        const priceChartColor = currentPriceVal >= firstPriceVal ? '#28a745' : '#dc3545';
        const ema50Color = '#ffc107'; // Amarelo
        const ema200Color = '#0d6efd'; // Azul
        // As cores serão aplicadas na ordem das séries
        const colors = [];
        if (chartType === 'candlestick' || chartType === 'bar') { /* Cores para velas/barras são definidas em plotOptions */ }
        else { colors.push(priceChartColor); } // A cor da série de preço (area/line)
        colors.push(ema50Color);
        colors.push(ema200Color);


        let options = {
            series: series,
            chart: {
                type: chartType, // Usa o tipo de plotagem selecionado (candlestick, bar, area, line)
                height: 400, toolbar: { show: true, tools: { download: false, pan: true } },
                zoom: { enabled: true }
            },
            dataLabels: { enabled: false },
            colors: colors, // Aplica as cores às séries
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
                        // Para a série de preço principal (vela/barra)
                        if ((chartType === 'candlestick' || chartType === 'bar') && seriesIndex === 0) {
                            if (Array.isArray(val)) { // Para velas/barras, o val é um array [O, H, L, C]
                                return `O: $${val[0].toLocaleString()} H: $${val[1].toLocaleString()} L: $${val[2].toLocaleString()} C: $${val[3].toLocaleString()}`;
                            }
                        }
                        // Para as EMAs ou gráficos de área/linha, é um valor único
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
                },
                bar: {
                    colors: {
                        ranges: [{ from: -Infinity, to: 0, color: '#dc3545' }, { from: 0, to: Infinity, color: '#28a745' }]
                    }
                }
            },
            theme: {
                mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' 
            }
        };

        // Condicionalmente adiciona stroke e fill com base no chartType (para evitar conflitos)
        if (chartType === 'area' || chartType === 'line') {
            options.stroke = {
                curve: 'smooth',
                width: 2
            };
            options.fill = {
                type: 'gradient',
                gradient: { opacityFrom: 0.6, opacityTo: 0.1 }
            };
        } else { // Para 'candlestick' e 'bar'
            options.stroke = {
                width: 1, // Uma borda fina para velas/barras
                colors: ['#333'] // Cor da borda
            };
            // O fill para candlestick/bar é definido em plotOptions.candlestick.colors / plotOptions.bar.colors.ranges
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


// --- Funções de Notícias, Alarmes e Trades (sem alterações) ---
async function displayNewsForAsset(baseAssetSymbol) {
    const newsContainer = document.getElementById('asset-news-container');
    if (!newsContainer) return;
    if (!CRYPTOCOMPARE_API_KEY || CRYPTOCOMPARE_API_KEY.includes("COLOQUE A SUA CHAVE")) {
        newsContainer.innerHTML = `<p style="color: #ffc107;">Por favor, adicione uma chave de API da CryptoCompare no ficheiro 'asset-details.js' para ver as notícias.</p>`;
        return;
    }
    const apiUrl = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${baseAssetSymbol}&api_key=${CRYPTOCOMPARE_API_KEY}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);
        const newsData = await response.json();
        if (newsData.Type !== 100 || newsData.Data.length === 0) {
            newsContainer.innerHTML = '<p>Nenhuma notícia recente encontrada para este ativo.</p>';
            return;
        }
        const newsHtml = newsData.Data.slice(0, 3).map(article => {
            const timeAgo = new Date(article.published_on * 1000).toLocaleString('pt-PT');
            return `<div class="news-article stat-card" style="text-align: left; margin-bottom: 1rem;"><h4 style="margin-bottom: 0.5rem;"><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="asset-link">${article.title}</a></h4><p style="font-size: 0.9em; color: #6c757d;"><strong>${article.source_info.name}</strong> - ${timeAgo}</p></div>`;
        }).join('');
        newsContainer.innerHTML = newsHtml;
    } catch (err) {
        console.error("Erro ao buscar notícias:", err);
        newsContainer.innerHTML = '<p style="color:red;">Não foi possível carregar as notícias.</p>';
    }
}
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
        if (trades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum trade encontrado para este ativo.</td></tr>';
            return;
        }
        const tradesHtml = trades.map(trade => {
            const pnl = trade.data.status === 'CLOSED' ? (trade.data.closeDetails?.pnl || 0) : '-';
            const pnlClass = parseFloat(pnl) > 0 ? 'positive-pnl' : (parseFloat(pnl) < 0 ? 'negative-pnl' : '');
            const dateStr = trade.data.dateAdded?.toDate().toLocaleString('pt-PT') || 'N/A';
            const status = trade.data.status || 'UNKNOWN';
            return `<tr data-trade-id="${trade.id}"><td>${trade.data.strategyName || 'N/A'}</td><td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td><td>${dateStr}</td><td class="${pnlClass}">${pnl !== '-' ? `$${parseFloat(pnl).toFixed(2)}` : '-'}</td><td><button class="btn edit-btn" style="padding: 5px 10px; font-size: 0.9em;">Ver/Editar</button></td></tr>`;
        }).join('');
        tbody.innerHTML = tradesHtml;
    } catch (err) {
        console.error("Erro ao buscar trades para o ativo:", err);
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">Erro ao carregar trades.</td></td>';
    }
}
function editTrade(tradeId) {
    localStorage.setItem('tradeToEdit', tradeId);
    window.location.href = 'index.html';
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
        const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'area';
        renderMainAssetChart(assetSymbol, selectedTimeframe, selectedChartType);
    };

    if (timeframeSelect) timeframeSelect.addEventListener('change', loadChart);
    if (chartTypeSelect) chartTypeSelect.addEventListener('change', loadChart);
    
    loadChart(); 

    const watchlistBtn = document.getElementById('add-to-watchlist-btn');
    const alarmBtn = document.getElementById('add-alarm-btn');
    const tvBtn = document.getElementById('open-tv-btn');
    if (watchlistBtn) watchlistBtn.href = `index.html?assetPair=${assetSymbol}`;
    if (alarmBtn) alarmBtn.href = `alarms-create.html?assetPair=${assetSymbol}`;
    if (tvBtn) tvBtn.href = `https://www.tradingview.com/chart/?symbol=BINANCE:${assetSymbol}`;

    const baseAsset = assetSymbol.replace(/USDC|USDT|BUSD/, '');

    displayNewsForAsset(baseAsset);
    displayAlarmsForAsset(assetSymbol);
    displayTradesForAsset(assetSymbol);

    const tradesTable = document.getElementById('trades-table');
    if (tradesTable) {
        tradesTable.addEventListener('click', (e) => {
            const button = e.target.closest('.edit-btn');
            if (button) {
                const tradeId = button.closest('tr').dataset.tradeId;
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
