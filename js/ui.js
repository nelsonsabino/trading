// js/ui.js

import { supabase } from './services.js';
import { addModal, potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, openImageModal, openAddModal } from './modals.js';
import { loadAndOpenForEditing } from './handlers.js';
import { getLastCreatedTradeId, setLastCreatedTradeId } from './state.js';

// Mapa para armazenar instâncias de gráficos ApexCharts por tradeId
const activeCharts = {}; // NOVO: Guarda as instâncias de gráficos

// ... (renderSparkline, getIconForLabel, createChecklistItem, createInputItem, generateDynamicChecklist, populateStrategySelect - sem alterações) ...

async function toggleAdvancedChart(tradeId, symbol, button) {
    const chartContainer = document.getElementById(`advanced-chart-${tradeId}`);
    if (!chartContainer) return;

    // Verifica se o gráfico está atualmente visível E tem uma instância ativa
    const isVisible = chartContainer.classList.contains('visible');
    const chartInstance = activeCharts[tradeId];

    if (isVisible && chartInstance) {
        // Lógica para FECHAR o gráfico
        console.log(`[UI Debug] Fechar gráfico para ${tradeId}. Destruindo instância.`); // Debug log
        chartInstance.destroy(); // Destroi explicitamente a instância do gráfico
        delete activeCharts[tradeId]; // Remove do mapa
        chartContainer.innerHTML = ''; // Limpa o conteúdo
        chartContainer.classList.remove('visible'); // Esconde o contentor
        button.innerHTML = `<i class="fa-solid fa-chart-simple"></i>`; // Restaura o ícone original
        return; // Sai da função após fechar
    }

    // Lógica para ABRIR o gráfico (se não estiver visível ou não tiver instância ativa)
    console.log(`[UI Debug] Abrir gráfico para ${tradeId}.`); // Debug log
    chartContainer.classList.add('visible'); // Torna o contentor visível
    chartContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">A carregar gráfico...</p>'; // Mensagem de carregamento
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`; // Ícone de carregamento

    try {
        const cleanSymbol = symbol.replace('BINANCE:', '');
        const { data: response, error } = await supabase.functions.invoke('get-asset-details-data', {
            body: { symbol: cleanSymbol, interval: '1h', limit: 220 },
        });

        if (error) throw error;
        if (!response || !response.ohlc || !response.indicators) {
            throw new Error('Dados de gráfico ou indicadores não foram encontrados.');
        }

        const klinesData = response.ohlc;
        const indicatorsData = response.indicators;
        let series = [];

        const closePriceSeriesData = klinesData.map(kline => ({ x: kline[0], y: kline[4] }));
        series.push({ name: 'Preço (USD)', type: 'line', data: closePriceSeriesData });

        if (indicatorsData.ema50_data) {
            const ema50SeriesData = indicatorsData.ema50_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal }));
            series.push({ name: 'EMA 50', type: 'line', data: ema50SeriesData });
        }
        if (indicatorsData.ema200_data) {
            const ema200SeriesData = indicatorsData.ema200_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal }));
            series.push({ name: 'EMA 200', type: 'line', data: ema200SeriesData });
        }

        const options = {
            series: series,
            chart: { type: 'line', height: 400, toolbar: { show: true, autoSelected: 'pan' } },
            colors: ['#007bff', '#ffc107', '#dc3545'],
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { type: 'datetime' },
            yaxis: { labels: { formatter: (val) => `$${val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}` }, tooltip: { enabled: true } },
            tooltip: { x: { format: 'dd MMM yyyy HH:mm' } },
            theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
        };

        chartContainer.innerHTML = '';
        const chart = new ApexCharts(chartContainer, options);
        activeCharts[tradeId] = chart; // Armazena a nova instância do gráfico no mapa
        chart.render();
        button.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`; // Ícone para fechar
        console.log(`[UI Debug] Gráfico para ${tradeId} renderizado com sucesso.`); // Debug log

    } catch (err) {
        console.error("Erro ao carregar o gráfico no card:", err);
        chartContainer.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Erro ao carregar: ${err.message}</p>`;
        button.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i>`; // Ícone de erro
        chartContainer.classList.remove('visible'); // Esconde em caso de erro
        delete activeCharts[tradeId]; // Limpa a instância do mapa em caso de erro
    }
}

// ... (createTradeCard, displayTrades - sem alterações) ...

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.querySelector('.dashboard-columns');
    if (dashboard) {
        dashboard.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;
            const card = button.closest('.trade-card');
            const tradeId = card ? card.dataset.tradeId : null;
            if (!tradeId) return;
            const trade = tradesForEventListeners.find(t => t.id === tradeId);
            if (!trade) return;
            const action = button.dataset.action;
            switch (action) {
                case 'toggle-chart':
                    e.stopPropagation(); // Impede que o evento se propague e cause cliques duplos
                    console.log(`[UI Debug] Ação de toggle chart recebida para ${tradeId}. Visível: ${chartContainer.classList.contains('visible')}`); // Mais detalhes de debug
                    toggleAdvancedChart(tradeId, button.dataset.symbol, button);
                    break;
                case 'edit': loadAndOpenForEditing(tradeId); break;
                case 'arm': openArmModal(trade); break;
                case 'execute': openExecModal(trade); break;
                case 'close': openCloseTradeModal(trade); break;
                case 'add-to-watchlist':
                   openAddModal();
                   const modalAssetInput = document.getElementById('asset');
                   if (modalAssetInput) {
                       modalAssetInput.value = button.dataset.symbol.replace('BINANCE:', '');
                   }
                   break;
                case 'acknowledge-alarm':
                    const assetSymbol = button.dataset.asset;
                    if (assetSymbol) {
                        acknowledgeAlarm(assetSymbol);
                    }
                    break;
            }
        });
    }
});
