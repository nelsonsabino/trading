// js/asset-details.js

import { supabase } from './services.js';
import { getTradesForAsset } from './firebase-service.js';

const CRYPTOCOMPARE_API_KEY = "92d8c73125edcc9a95da0a5f30a6ca4720e5fdba544dba9bae2cd3495039aba7";

/**
 * Busca dados históricos e renderiza o gráfico principal do ativo com ApexCharts.
 * @param {string} symbol - O símbolo do ativo (ex: "BTCUSDC").
 */
async function renderMainAssetChart(symbol) {
    const chartContainer = document.getElementById('main-asset-chart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '<p>A carregar gráfico...</p>';

    try {
        // Busca os últimos 180 dias de dados diários da Binance
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=180`);
        if (!response.ok) throw new Error('Não foi possível obter os dados do gráfico da Binance.');
        const klines = await response.json();

        // Formata os dados para o formato que o ApexCharts espera
        const seriesData = klines.map(kline => ({
            x: kline[0], // Timestamp de abertura
            y: parseFloat(kline[4]) // Preço de fecho
        }));

        const currentPrice = seriesData[seriesData.length - 1].y;
        const firstPrice = seriesData[0].y;
        const chartColor = currentPrice >= firstPrice ? '#28a745' : '#dc3545';

        const options = {
            series: [{ name: 'Preço (USD)', data: seriesData }],
            chart: {
                type: 'area', height: 400, toolbar: { show: true, tools: { download: false, pan: true } },
                zoom: { enabled: true }
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            colors: [chartColor],
            fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1, } },
            xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'dd MMM \'yy' } },
            yaxis: { labels: { formatter: (val) => `$${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` } },
            tooltip: {
                x: { format: 'dd MMM yyyy' },
                y: { formatter: (val) => `$${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` }
            },
            theme: {
                mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light'
            }
        };

        chartContainer.innerHTML = ''; // Limpa a mensagem "A carregar..."
        const chart = new ApexCharts(chartContainer, options);
        chart.render();

    } catch (err) {
        console.error("Erro ao renderizar o gráfico principal:", err);
        chartContainer.innerHTML = '<p style="color:red;">Não foi possível carregar o gráfico.</p>';
    }
}

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
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;text-align:center;">Erro ao carregar trades.</td></tr>';
    }
}

function editTrade(tradeId) {
    localStorage.setItem('tradeToEdit', tradeId);
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const assetSymbol = urlParams.get('symbol');

    if (!assetSymbol) {
        document.getElementById('asset-title').textContent = 'Ativo não encontrado';
        document.querySelector('main').innerHTML = '<p class="empty-state-message" style="color: red; text-align: center;">Por favor, forneça um símbolo de ativo na URL (ex: ?symbol=BTCUSDC).</p>';
        return;
    }

    document.title = `Detalhes de ${assetSymbol}`;
    document.getElementById('asset-title').textContent = `Análise de ${assetSymbol}`;
    
    const watchlistBtn = document.getElementById('add-to-watchlist-btn');
    const alarmBtn = document.getElementById('add-alarm-btn');
    const tvBtn = document.getElementById('open-tv-btn');
    if (watchlistBtn) watchlistBtn.href = `index.html?assetPair=${assetSymbol}`;
    if (alarmBtn) alarmBtn.href = `alarms.html?assetPair=${assetSymbol}`;
    if (tvBtn) tvBtn.href = `https://www.tradingview.com/chart/?symbol=BINANCE:${assetSymbol}`;

    const baseAsset = assetSymbol.replace(/USDC|USDT|BUSD/, '');

    // Inicia todas as buscas de dados
    renderMainAssetChart(assetSymbol);
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
});
