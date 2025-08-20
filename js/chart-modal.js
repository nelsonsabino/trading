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
 * Abre o modal de gráfico de preço padrão.
 * @param {string} symbol - O símbolo do ativo (ex: 'BTCUSDC').
 * @param {string} [timeframe='1h'] - O timeframe do gráfico (ex: '15m', '1h', '4h').
 */
export async function openChartModal(symbol, timeframe = '1h') {
    if (!chartModal || !chartContainer) return;

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
        series.push({ name: 'Preço (USD)', type: 'line', data: klinesData.map(kline => ({ x: kline[0], y: kline[4] })) });
        if (indicatorsData.ema50_data) series.push({ name: 'EMA 50', type: 'line', data: indicatorsData.ema50_data.map((ema, i) => ({ x: klinesData[i][0], y: ema })) });
        if (indicatorsData.ema200_data) series.push({ name: 'EMA 200', type: 'line', data: indicatorsData.ema200_data.map((ema, i) => ({ x: klinesData[i][0], y: ema })) });

        const options = {
            series: series,
            // --- INÍCIO DA ALTERAÇÃO ---
            chart: { type: 'line', height: '100%', toolbar: { show: false } },
            // --- FIM DA ALTERAÇÃO ---
            title: { text: `${symbol} - Gráfico de ${timeframe}`, align: 'left' },
            colors: ['#008FFB', '#ffc107', '#0d6efd'],
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { type: 'datetime' },
            yaxis: { labels: { formatter: (val) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}` }, tooltip: { enabled: true } },
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

/**
 * Abre o modal e renderiza o gráfico de linha de tendência RSI.
 * @param {object} alarm - O objeto do alarme contendo os parâmetros.
 * @param {object|null} creationParams - Se fornecido, adiciona um botão para criar o alarme.
 */
export async function openRsiTrendlineChartModal(alarm, creationParams = null) {
    if (!chartModal || !chartContainer) return;
    
    if (currentApexChart) {
        currentApexChart.destroy();
        currentApexChart = null;
    }
    
    chartContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">A gerar visualização da linha de tendência...</p>';
    chartModal.style.display = 'flex';

    try {
        const { data, error } = await supabase.functions.invoke('get-rsi-trendline-data', {
            body: {
                asset_pair: alarm.asset_pair,
                indicator_timeframe: alarm.indicator_timeframe,
                indicator_period: alarm.indicator_period,
                trendline_type: alarm.trendline_type
            }
        });
        
        if (error) {
            const errorMessage = data ? data.error : (error.message || "Erro desconhecido.");
            throw new Error(errorMessage);
        }

        const options = {
            series: [
                { name: 'RSI', type: 'line', data: data.rsi_series },
                { name: 'Linha de Tendência', type: 'line', data: data.trendline_series }
            ],
            // --- INÍCIO DA ALTERAÇÃO ---
            chart: { type: 'line', height: '100%', toolbar: { show: false } },
            // --- FIM DA ALTERAÇÃO ---
            stroke: {
                width: [1, 2],
                dashArray: [0, 5]
            },
            colors: ['#008FFB', '#00E396'],
            annotations: {
                points: [
                    { x: data.p1.x, y: data.p1.y, marker: { size: 4, fillColor: '#FF4560', strokeColor: '#fff', strokeWidth: 2, radius: 2 } },
                    { x: data.p2.x, y: data.p2.y, marker: { size: 4, fillColor: '#FF4560', strokeColor: '#fff', strokeWidth: 2, radius: 2 } },
                    { x: data.p3.x, y: data.p3.y, marker: { size: 4, fillColor: '#FF4560', strokeColor: '#fff', strokeWidth: 2, radius: 2 } }
                ]
            },
            tooltip: {
                enabled: true, shared: false, intersect: true,
                y: { formatter: (value, { seriesIndex }) => (seriesIndex === 1) ? undefined : (value ? value.toFixed(2) : value) }
            },
            title: {
                text: `Visualização da Linha de Tendência RSI para ${alarm.asset_pair} (${alarm.indicator_timeframe})`,
                align: 'center'
            },
            xaxis: { type: 'numeric', title: { text: 'Índice da Vela' } },
            yaxis: { title: { text: 'Valor do RSI' } },
            theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
        };

        chartContainer.innerHTML = '';
        currentApexChart = new ApexCharts(chartContainer, options);
        currentApexChart.render();
        
        if (creationParams) {
            const footer = document.createElement('div');
            footer.className = 'chart-modal-footer';
            const createAlarmUrl = `alarms-create.html?assetPair=${creationParams.assetPair}&alarmType=rsi_trendline_break&trendlineType=${creationParams.trendlineType}&timeframe=${creationParams.timeframe}`;
            footer.innerHTML = `<a href="${createAlarmUrl}" class="btn btn-contextual"><span class="material-symbols-outlined">alarm_add</span> Criar Alarme de Quebra</a>`;
            chartContainer.appendChild(footer);
        }

    } catch (err) {
        console.error("Erro ao gerar gráfico de L.T.:", err);
        chartContainer.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Não foi possível gerar a visualização: ${err.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initializeChartModal);
