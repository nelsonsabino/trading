// js/chart-modal.js - Módulo central para gerir o modal de gráfico ApexCharts

import { supabase } from './services.js';

let chartModal = null;
let closeChartModalBtn = null;
let chartContainer = null;
let currentApexChart = null; // Guarda a instância do gráfico atual para ser destruída

/**
 * Prepara os elementos do modal e adiciona os event listeners.
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
 * Fecha o modal e destrói qualquer instância de gráfico existente.
 */
function closeChartModal() {
    if (chartModal) {
        if (currentApexChart) {
            currentApexChart.destroy();
            currentApexChart = null;
        }
        chartContainer.innerHTML = '';
        chartModal.style.display = 'none';
    }
}

/**
 * Abre o modal, busca os dados e renderiza o gráfico detalhado.
 * @param {string} symbol - O símbolo do ativo (ex: 'BTCUSDC').
 * @param {string} [timeframe='1h'] - O timeframe do gráfico (ex: '15m', '1h', '4h').
 */
export async function openChartModal(symbol, timeframe = '1h') {
    if (!chartModal || !chartContainer) {
        console.error("Elementos do modal de gráfico não foram encontrados no DOM.");
        return;
    }

    // --- CORREÇÃO DE BUG: Destrói qualquer gráfico anterior ---
    if (currentApexChart) {
        currentApexChart.destroy();
        currentApexChart = null;
    }

    chartContainer.innerHTML = `<p style="padding: 2rem; text-align: center;">A carregar gráfico de ${timeframe}...</p>`;
    chartModal.style.display = 'flex';

    try {
        const { data: response, error } = await supabase.functions.invoke('get-asset-details-data', {
            body: { symbol: symbol, interval: timeframe, limit: 170 },
        });
        if (error) throw error;
        if (!response || !response.ohlc || !response.indicators) throw new Error('Dados de gráfico ou indicadores não foram encontrados.');

        const klinesData = response.ohlc;
        const indicatorsData = response.indicators;
        
        const series = [];
        const closePriceSeriesData = klinesData.map(kline => ({ x: kline[0], y: kline[4] }));
        series.push({ name: 'Preço (USD)', type: 'line', data: closePriceSeriesData });

        if (indicatorsData.ema50_data && indicatorsData.ema50_data.length === klinesData.length) {
            series.push({ name: 'EMA 50', type: 'line', data: indicatorsData.ema50_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal })) });
        }
        if (indicatorsData.ema200_data && indicatorsData.ema200_data.length === klinesData.length) {
            series.push({ name: 'EMA 200', type: 'line', data: indicatorsData.ema200_data.map((emaVal, index) => ({ x: klinesData[index][0], y: emaVal })) });
        }

        const options = {
            series: series,
            chart: { type: 'line', height: '100%', toolbar: { show: true, autoSelected: 'pan' } },
            title: { text: `${symbol} - Gráfico de ${timeframe}`, align: 'left' },
            colors: ['#008FFB', '#ffc107', '#0d6efd'],
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { type: 'datetime' },
            yaxis: {
                labels: { formatter: (val) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}` },
                tooltip: { enabled: true }
            },
            tooltip: { x: { format: 'dd MMM yyyy HH:mm' } },
            theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
        };

        chartContainer.innerHTML = '';
        currentApexChart = new ApexCharts(chartContainer, options);
        currentApexChart.render();

    } catch (err) {
        console.error("Erro ao carregar o gráfico no modal:", err);
        chartContainer.innerHTML = `<p style="padding: 2rem; text-align: center; color: red;">Erro ao carregar o gráfico: ${err.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initializeChartModal);
