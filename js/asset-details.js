// js/asset-details.js

import { supabase } from './services.js';
import { getTradesForAsset } from './firebase-service.js';

// NOTA: Obtenha a sua chave de API gratuita em https://min-api.cryptocompare.com/
const CRYPTOCOMPARE_API_KEY = "92d8c73125edcc9a95da0a5f30a6ca4720e5fdba544dba9bae2cd3495039aba7";

/**
 * Renderiza os widgets do TradingView na página.
 * @param {string} symbol - O símbolo do ativo (ex: "BTCUSDC").
 */
function renderTradingViewWidgets(symbol) {
    const mainChartContainer = document.getElementById('main-chart-container');
    const techAnalysisContainer = document.getElementById('tech-analysis-container');
    const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';

    if (mainChartContainer) {
        new TradingView.widget({
            "autosize": true, "symbol": `BINANCE:${symbol}`, "interval": "240", "timezone": "Etc/UTC",
            "theme": currentTheme, "style": "1", "locale": "pt", "hide_side_toolbar": true, "hide_top_toolbar": false,
            "allow_symbol_change": false, "save_image": false, "calendar": false, "details": false,
            "hide_legend": true, "hide_volume": true, "hotlist": false, "withdateranges": false,
            "studies": ["STD;RSI", "STD;Supertrend"], "container_id": "main-chart-container"
        });
    }

    if (techAnalysisContainer) {
        techAnalysisContainer.innerHTML = '';
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
        const config = {
            "width": "100%", "height": "100%", "symbol": `BINANCE:${symbol}`, "interval": "1h",
            "showIntervalTabs": true, "displayMode": "multiple", "locale": "pt",
            "colorTheme": currentTheme, "isTransparent": false
        };
        script.innerHTML = JSON.stringify(config);
        techAnalysisContainer.appendChild(script);
    }
}

/**
 * Busca e exibe as últimas notícias para o símbolo do ativo.
 * @param {string} baseAssetSymbol - O símbolo base do ativo (ex: "BTC").
 */
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
            return `
                <div class="news-article stat-card" style="text-align: left; margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;"><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="asset-link">${article.title}</a></h4>
                    <p style="font-size: 0.9em; color: #6c757d;"><strong>${article.source_info.name}</strong> - ${timeAgo}</p>
                </div>
            `;
        }).join('');

        newsContainer.innerHTML = newsHtml;
    } catch (err) {
        console.error("Erro ao buscar notícias:", err);
        newsContainer.innerHTML = '<p style="color:red;">Não foi possível carregar as notícias.</p>';
    }
}


/**
 * Busca e exibe os alarmes ativos para o símbolo especificado.
 * @param {string} symbol - O símbolo do ativo.
 */
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

/**
 * Busca e exibe os trades para o símbolo especificado.
 * @param {string} symbol - O símbolo do ativo.
 */
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

/**
 * Ponto de entrada do script da página.
 */
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
    renderTradingViewWidgets(assetSymbol);
    
    // --- LIGAÇÃO CORRETA DOS BOTÕES DE AÇÃO ---
    const watchlistBtn = document.getElementById('add-to-watchlist-btn');
    const alarmBtn = document.getElementById('add-alarm-btn');
    const tvBtn = document.getElementById('open-tv-btn');

    if (watchlistBtn) watchlistBtn.href = `index.html?assetPair=${assetSymbol}`;
    if (alarmBtn) alarmBtn.href = `alarms.html?assetPair=${assetSymbol}`;
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
});
