// js/market-scan.js - VERSÃO COM SPARKLINE CHARTS

import { supabase } from './services.js';

// --- Lógica do Modal do Gráfico ---
const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

function openChartModal(symbol) {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    new TradingView.widget({
        "container_id": "chart-modal-container",
        "autosize": true,
        "symbol": `BINANCE:${symbol}`,
        "interval": "240",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "pt",
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
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


// --- LÓGICA DO SPARKLINE ---
function renderSparkline(containerId, dataSeries) {
    if (!dataSeries || dataSeries.length < 2) return;

    const firstPrice = dataSeries[0];
    const lastPrice = dataSeries[dataSeries.length - 1];
    const chartColor = lastPrice >= firstPrice ? '#28a745' : '#dc3545';

    const options = {
        series: [{ data: dataSeries }],
        chart: { type: 'line', height: 50, sparkline: { enabled: true }},
        stroke: { curve: 'smooth', width: 2 },
        colors: [chartColor],
        tooltip: {
            fixed: { enabled: false },
            x: { show: false },
            y: { title: { formatter: () => '' }, formatter: (val) => val.toFixed(5) },
            marker: { show: false }
        }
    };
    const chart = new ApexCharts(document.getElementById(containerId), options);
    chart.render();
}


// --- LÓGICA PRINCIPAL DA PÁGINA ---
function formatVolume(volume) {
    if (volume >= 1_000_000_000) return (volume / 1_000_000_000).toFixed(2) + 'B';
    if (volume >= 1_000_000) return (volume / 1_000_000).toFixed(2) + 'M';
    if (volume >= 1_000) return (volume / 1_000).toFixed(2) + 'K';
    return volume.toFixed(2);
}

function createTableRow(ticker, index) {
    const baseAsset = ticker.symbol.replace('USDC', '');
    const price = parseFloat(ticker.lastPrice);
    const volume = parseFloat(ticker.quoteVolume);
    const priceChangePercent = parseFloat(ticker.priceChangePercent);
    const priceChangeClass = priceChangePercent >= 0 ? 'positive-pnl' : 'negative-pnl';

    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker.symbol}`;
    const createAlarmUrl = `alarms.html?assetPair=${ticker.symbol}`;
    const addOpportunityUrl = `index.html?assetPair=${ticker.symbol}`;

    return `
        <tr>
            <td>${index + 1}</td>
            <td><div class="asset-name"><span>${baseAsset}</span></div></td>
            <td>${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td class="sparkline-cell">
                <div class="sparkline-container" id="sparkline-${ticker.symbol}"></div>
            </td>
            <td>${formatVolume(volume)}</td>
            <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
            <td>
                <div class="action-buttons">
                    <button class="icon-action-btn view-chart-btn" data-symbol="${ticker.symbol}" title="Ver Gráfico no Modal"><i class="fa-solid fa-chart-simple"></i></button>
                    <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    <a href="${createAlarmUrl}" class="icon-action-btn" title="Criar Alarme"><i class="fa-solid fa-bell"></i></a>
                    <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar Oportunidade"><i class="fa-solid fa-plus"></i></a>
                </div>
            </td>
        </tr>
    `;
}

async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;

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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
            return;
        }

        const symbols = top30Usdc.map(t => t.symbol);
        const { data: sparklinesData, error: sparklinesError } = await supabase.functions.invoke('get-sparklines-data', {
            body: { symbols },
        });
        if (sparklinesError) throw sparklinesError;

        const tableRowsHtml = top30Usdc.map((ticker, index) => createTableRow(ticker, index)).join('');
        tbody.innerHTML = tableRowsHtml;

        top30Usdc.forEach(ticker => {
            const data = sparklinesData[ticker.symbol];
            renderSparkline(`sparkline-${ticker.symbol}`, data);
        });

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
