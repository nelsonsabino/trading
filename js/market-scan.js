// js/market-scan.js

// =================================================================================
// 1. LÓGICA E INICIALIZAÇÃO DO MODAL DO GRÁFICO
// =================================================================================

const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

/**
 * Abre o modal e carrega o widget do TradingView com a configuração do utilizador.
 * @param {string} symbol - O símbolo do par (ex: "BTCUSDC").
 */
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
        "toolbar_bg": "#f1f5f9",
        "hide_side_toolbar": true,
        "hide_top_toolbar": false,
        "hide_legend": true,
        "hide_volume": true,
        "hotlist": false,
        "calendar": false,
        "details": false,
        "enable_publishing": false,
        "save_image": false,
        "allow_symbol_change": false,
        "studies": [
            "STD;MA%Ribbon",
            "STD;RSI"
        ]
    });
    chartModal.style.display = 'flex';
}

/**
 * Fecha o modal do gráfico e destrói o widget.
 */
function closeChartModal() {
    if (!chartModal || !chartContainer) return;
    chartContainer.innerHTML = '';
    chartModal.style.display = 'none';
}

// Adiciona os eventos de fecho ao modal.
if (chartModal) {
    closeChartModalBtn.addEventListener('click', closeChartModal);
    chartModal.addEventListener('click', (e) => {
        if (e.target.id === 'chart-modal') {
            closeChartModal();
        }
    });
}


// =================================================================================
// 2. FUNÇÕES HELPER E DE LÓGICA DE DADOS
// =================================================================================

/**
 * Formata um número grande para uma string compacta (ex: 1.2M, 3.4B).
 * @param {number} volume - O número a ser formatado.
 * @returns {string} O volume formatado.
 */
function formatVolume(volume) {
    if (volume >= 1_000_000_000) return (volume / 1_000_000_000).toFixed(2) + 'B';
    if (volume >= 1_000_000) return (volume / 1_000_000).toFixed(2) + 'M';
    if (volume >= 1_000) return (volume / 1_000).toFixed(2) + 'K';
    return volume.toFixed(2);
}

/**
 * Cria a string HTML para uma única linha da tabela, com os novos botões de ícone.
 * @param {object} ticker - O objeto de dados do ticker da Binance.
 * @param {number} index - O índice da linha na tabela.
 * @returns {string} A string HTML da linha da tabela (<tr>).
 */
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
            <td>${formatVolume(volume)}</td>
            <td class="${priceChangeClass}">${priceChangePercent.toFixed(2)}%</td>
            <td>
                <div class="action-buttons">
                    <button class="icon-action-btn view-chart-btn" data-symbol="${ticker.symbol}" title="Ver Gráfico no Modal">
                        <i class="fa-solid fa-chart-simple"></i>
                    </button>
                    <a href="${tradingViewUrl}" target="_blank" class="icon-action-btn" title="Abrir no TradingView">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                    <a href="${createAlarmUrl}" class="icon-action-btn" title="Criar Alarme">
                        <i class="fa-solid fa-bell"></i>
                    </a>
                    <a href="${addOpportunityUrl}" class="icon-action-btn" title="Adicionar Oportunidade">
                        <i class="fa-solid fa-plus"></i>
                    </a>
                </div>
            </td>
        </tr>
    `;
}


// =================================================================================
// 3. FUNÇÃO PRINCIPAL DE EXECUÇÃO
// =================================================================================

/**
 * Busca os dados da API da Binance e renderiza a tabela do mercado.
 */
async function fetchAndDisplayMarketData() {
    const tbody = document.getElementById('market-scan-tbody');
    if (!tbody) return;

    try {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">A carregar dados...</td></tr>';
        
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Falha ao comunicar com a API da Binance.');
        const allTickers = await response.json();

        const top30Usdc = allTickers
            .filter(ticker => ticker.symbol.endsWith('USDC') && parseFloat(ticker.quoteVolume) > 0)
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 30);

        if (top30Usdc.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Não foram encontrados pares com USDC com volume significativo.</td></tr>';
            return;
        }

        const tableRowsHtml = top30Usdc.map(createTableRow).join('');
        tbody.innerHTML = tableRowsHtml;

    } catch (error) {
        console.error("Erro ao carregar dados do mercado:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Não foi possível carregar os dados.</td></tr>';
    }
}


// =================================================================================
// 4. PONTO DE ENTRADA DA PÁGINA
// =================================================================================

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
