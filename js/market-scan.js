// js/market-scan.js

import { supabase } from './services.js';

const CACHE_KEY_DATA = 'marketScannerCache';
const CACHE_KEY_TIMESTAMP = 'marketScannerCacheTime';
const CACHE_DURATION_MS = 2 * 60 * 1000;

let allTickersData = [];
let allExtraData = {};
let currentSortBy = 'volume';
let filterRsi = false;
let filterStoch = false;
let showSparklines = true;
let currentTopN = 50;
let rsiPatternFilter = 'none'; // --- NOVO: Estado para o filtro de padrão RSI

const chartModal = document.getElementById('chart-modal');
const closeChartModalBtn = document.getElementById('close-chart-modal');
const chartContainer = document.getElementById('chart-modal-container');

// ... (funções openChartModal, closeChartModal, renderSparkline permanecem iguais) ...

function renderPageContent(processedTickers) {
    // ... (lógica existente) ...

    const finalTickersToDisplay = processedTickers.slice(0, currentTopN); 

    const tableRowsHtml = finalTickersToDisplay.map((ticker, index) => createTableRow(ticker, index, allExtraData)).join('');
    tbody.innerHTML = tableRowsHtml;
    
    // ... (lógica existente) ...
}

function formatVolume(volume) {
    // ... (lógica existente) ...
}

function createTableRow(ticker, index, extraData) {
    // ... (lógica existente) ...

    let rsiSignalHtml = '';
    let stochSignalHtml = '';
    let rsiTrendSignalHtml = ''; // --- NOVO: Para o sinal de padrão de tendência

    const assetExtraData = extraData[ticker.symbol];
    
    if (assetExtraData?.rsi_1h < 45) {
        rsiSignalHtml = `<span class="rsi-signal" ...>RSI</span>`;
    }
    
    if (assetExtraData?.stoch_4h < 35) {
        stochSignalHtml = `<span class="stoch-signal" ...>STC</span>`;
    }
    
    // --- INÍCIO DA ALTERAÇÃO: Adiciona o "badge" do padrão de RSI ---
    if (assetExtraData?.rsiTrend) {
        const trend = assetExtraData.rsiTrend;
        const trendText = trend.type === 'support' ? `LTA-${trend.touches}` : `LTB-${trend.touches}`;
        const trendTooltip = trend.type === 'support' ? `${trend.touches} Fundos Ascendentes` : `${trend.touches} Picos Descendentes`;
        rsiTrendSignalHtml = `<span class="rsi-trend-signal" data-tooltip="${trendTooltip}">${trendText}</span>`;
    }
    // --- FIM DA ALTERAÇÃO ---

    // ... (resto da lógica de criação da linha da tabela) ...

    return `
        <tr>
            <td data-label="#">${index + 1}</td>
            <td data-label="Ativo"><div class="asset-name"><strong><a href="asset-details.html?symbol=${ticker.symbol}" class="asset-link">${baseAsset}</a></strong> ${rsiSignalHtml} ${stochSignalHtml} ${rsiTrendSignalHtml}</div></td>
            // ... (resto do HTML da linha) ...
        </tr>`;
}


function applyFiltersAndSort() {
    let processedTickers = [...allTickersData];
    
    // ... (filtros RSI e STOCH existentes) ...

    // --- INÍCIO DA ALTERAÇÃO: Novo filtro de padrão de RSI ---
    if (rsiPatternFilter !== 'none') {
        processedTickers = processedTickers.filter(ticker => {
            const trend = allExtraData[ticker.symbol]?.rsiTrend;
            if (!trend) return false;

            const [type, touches] = rsiPatternFilter.split('_');
            return trend.type === type && trend.touches >= parseInt(touches);
        });
    }
    // --- FIM DA ALTERAÇÃO ---
    
    // ... (lógica de ordenação existente) ...
    
    renderPageContent(processedTickers);
}


async function fetchAndDisplayMarketData() {
    // ... (lógica existente de cache e fetch) ...
}

// --- INÍCIO DA ALTERAÇÃO: Nova função para análise de padrões RSI ---
async function handleRsiPatternAnalysis() {
    const analyzeBtn = document.getElementById('analyze-rsi-patterns-btn');
    const statusIndicator = document.getElementById('rsi-analysis-status');
    const filterSelect = document.getElementById('filter-rsi-trend');

    analyzeBtn.disabled = true;
    statusIndicator.textContent = 'A analisar...';

    try {
        const symbolsToAnalyze = allTickersData.slice(0, currentTopN).map(t => t.symbol);
        
        // Esta é a chamada para a nova Edge Function que vamos criar
        const { data: analysisData, error } = await supabase.functions.invoke('analyze-rsi-trends', {
            body: { symbols: symbolsToAnalyze },
        });

        if (error) throw error;
        
        // Atualiza o nosso objeto de dados extra com os novos padrões
        Object.assign(allExtraData, analysisData);

        // Atualiza o cache com os novos dados
        const dataToCache = { tickers: allTickersData, extraData: allExtraData };
        sessionStorage.setItem(CACHE_KEY_DATA, JSON.stringify(dataToCache));

        statusIndicator.textContent = 'Análise concluída!';
        filterSelect.disabled = false; // Ativa o filtro
        applyFiltersAndSort(); // Re-renderiza a tabela para mostrar os novos "badges"
    
    } catch (err) {
        console.error("Erro na análise de padrões RSI:", err);
        statusIndicator.textContent = 'Erro na análise.';
    } finally {
        analyzeBtn.disabled = false;
    }
}
// --- FIM DA ALTERAÇÃO ---


document.addEventListener('DOMContentLoaded', () => {
    // ... (declarações de variáveis existentes) ...
    const analyzeRsiPatternsBtn = document.getElementById('analyze-rsi-patterns-btn');
    const rsiTrendFilterSelect = document.getElementById('filter-rsi-trend');

    // ... (lógica de inicialização existente) ...
    
    // --- INÍCIO DA ALTERAÇÃO: Listeners para os novos controlos ---
    if (analyzeRsiPatternsBtn) {
        analyzeRsiPatternsBtn.addEventListener('click', handleRsiPatternAnalysis);
    }

    if (rsiTrendFilterSelect) {
        rsiTrendFilterSelect.addEventListener('change', (e) => {
            rsiPatternFilter = e.target.value;
            applyFiltersAndSort();
        });
    }
    // --- FIM DA ALTERAÇÃO ---

    fetchAndDisplayMarketData();
});
