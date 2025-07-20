// js/asset-details.js

import { supabase } from './services.js';
import { getTradesForAsset } from './firebase-service.js';

/**
 * Renderiza os widgets do TradingView na página.
 * @param {string} symbol - O símbolo do ativo (ex: "BTCUSDC").
 */
function renderTradingViewWidgets(symbol) {
    const mainChartContainer = document.getElementById('main-chart-container');
    const techAnalysisContainer = document.getElementById('tech-analysis-container');
    const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';

    if (mainChartContainer) {
        // --- ALTERAÇÃO: Novas configurações do gráfico ---
        const chartBackgroundColor = currentTheme === 'light' ? '#ffffff' : '#1e1e1e';
        const chartGridColor = currentTheme === 'light' ? 'rgba(46, 46, 46, 0.06)' : 'rgba(255, 255, 255, 0.1)';

        new TradingView.widget({
            "autosize": true,
            "symbol": `BINANCE:${symbol}`,
            "interval": "240",
            "timezone": "Etc/UTC",
            "theme": currentTheme,
            "style": "1",
            "locale": "pt", // Mantido em Português para consistência
            "hide_side_toolbar": true, // Esconde a barra de ferramentas lateral
            "hide_top_toolbar": false, // Mostra a barra de ferramentas superior
            "allow_symbol_change": false, // Não permite mudar o símbolo no gráfico
            "save_image": false,
            "calendar": false,
            "details": false,
            "hide_legend": true,
            "hide_volume": true,
            "hotlist": false,
            "withdateranges": false,
            "backgroundColor": chartBackgroundColor,
            "gridColor": chartGridColor,
            "studies": [ // Novos indicadores
                "STD;RSI",
                "STD;Supertrend"
            ],
            "container_id": "main-chart-container"
        });
    }

    if (techAnalysisContainer) {
        // O widget de análise técnica permanece o mesmo
        new TradingView.widget({
            "container_id": "tech-analysis-container", "width": "100%", "height": "100%", "symbol": `BINANCE:${symbol}`,
            "interval": "1D", "timezone": "Etc/UTC", "theme": currentTheme, "style": "1", "locale": "pt"
        });
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

/**
 * Lógica para redirecionar para a página principal para editar um trade.
 * @param {string} tradeId - O ID do trade a ser editado.
 */
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
