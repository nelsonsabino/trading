// js/chart-modal.js - Módulo central para gerir o modal de gráfico ApexCharts

import { supabase } from './services.js';

let chartModal = null;
let closeChartModalBtn = null;
let chartContainer = null;
let aChart = null; // Variável para manter a instância do gráfico

/**
 * Prepara os elementos do modal e adiciona os event listeners.
 * Esta função deve ser chamada uma vez quando a página carrega.
 */
function initializeChartModal() {
    chartModal = document.getElementById('chart-modal');
    closeChartModalBtn = document.getElementById('close-chart-modal');
    chartContainer = document.getElementById('chart-modal-container');

    if (chartModal && closeChartModalBtn && chartContainer) {
        closeChartModalBtn.addEventListener('click', closeChartModal);
        chartModal.addEventListener('click', (e) => {
            if (e.target.id === 'chart-modal') {
                closeChartModal();
            }
        });
    }
}

/**
 * Fecha o modal e destrói a instância do gráfico para libertar memória.
 */
function closeChartModal() {
    if (chartModal) {
        if (aChart) {
            aChart.destroy();
            aChart = null;
        }
        chartContainer.innerHTML = '';
        chartModal.style.display = 'none';
    }
}

/**
 * Abre o modal, busca os dados e renderiza o gráfico detalhado.
 * @param {string} symbol - O símbolo do ativo (ex: 'BTCUSDC').
 */
export async function openChartModal(symbol) {
    if (!chartModal || !chartContainer) {
        console.error("Elementos do modal de gráfico não foram encontrados no DOM.");
        return;
    }

    chartContainer.innerHTML = '<p style="padding: 2rem; text-align: center;">A carregar gráfico detalhado...</p>';
    chartModal.style.display = 'flex';

    try {
        // Busca os dados do gráfico da Edge Function
        const { data: response, error } = await supabase.functions.invoke('get-asset-details-data', {
            body: { symbol: symbol, interval: '1h', limit: 170 }, // ~7 dias de dados
        });
        if (error) throw error;
        if (!response || !response.ohlc || !response.indicators) throw new Error('Dados de gráfico ou indicadores não foram encontrados na resposta da API.');

        const klinesData = response.ohlc;
        const indicatorsData = response.indicators;
        
        // Prepara as séries para o gráfico
        const series = [];
        const closePriceSeriesData = klinesData.map(kline => ({ x: kline[0], y: kline[4] }));
        series.push({ name: 'Preço (USD)', type: 'line', data: closePriceSeriesData });

        if (indicatorsData.ema50_data && indicatorsData.ema50_data.length === klinesData.length) {
            series.push({ name: 'EMA 50', type: 'line', data: indicatorsData.ema50_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal })) });
        }
        if (indicatorsData.ema200_data && indicatorsData.ema200_data.length === klinesData.length) {
            series.push({ name: 'EMA 200', type: 'line', data: indicatorsData.ema200_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal })) });
        }

        // Opções de configuração do ApexChart
        const options = {
            series: series,
            chart: {
                type: 'line',
                height: '100%',
                toolbar: { show: true, autoSelected: 'pan' }
            },
            title: { text: `${symbol} - Gráfico de 1 Hora`, align: 'left' },
            colors: ['#007bff', '#ffc107', '#dc3545'], // Azul, Amarelo, Vermelho
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { type: 'datetime' },
            yaxis: {
                labels: { formatter: (val) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` },
                tooltip: { enabled: true }
            },
            tooltip: { x: { format: 'dd MMM yyyy HH:mm' } },
            theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
        };

        // Limpa o contentor e renderiza o novo gráfico
        chartContainer.innerHTML = '';
        aChart = new ApexCharts(chartContainer, options); // Salva a instância
        aChart.render();

    } catch (err) {
        console.error("Erro ao carregar o gráfico no modal:", err);
        chartContainer.innerHTML = `<p style="padding: 2rem; text-align: center; color: red;">Erro ao carregar o gráfico: ${err.message}</p>`;
    }
}

// Inicializa o módulo assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeChartModal);
