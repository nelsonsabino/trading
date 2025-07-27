// js/stats.js

import {
    listenToPortfolioSummary,
    listenToClosedTrades,
    addTransactionAndUpdateBalance,
    adjustPortfolioBalance
} from './firebase-service.js';

// --- Variáveis para os Gráficos ---
let equityCurveChart = null;

// --- FUNÇÕES DE RENDERIZAÇÃO DE GRÁFICOS ---

function renderPnlCurveChart(trades) {
    const chartContainer = document.getElementById('equity-curve-chart');
    if (!chartContainer) return;
    chartContainer.innerHTML = ''; // Limpa o gráfico anterior

    // Ordena os trades por data de fecho
    const sortedTrades = trades.sort((a, b) => a.closeDetails.dateClosed.seconds - b.closeDetails.dateClosed.seconds);

    let cumulativePnl = 0;
    const seriesData = sortedTrades.map(trade => {
        cumulativePnl += parseFloat(trade.closeDetails.pnl);
        const date = new Date(trade.dateClosed.seconds * 1000);
        return {
            x: date,
            y: cumulativePnl.toFixed(2)
        };
    });

    const options = {
        series: [{ name: 'P&L Acumulado', data: seriesData }],
        chart: { type: 'area', height: 350, toolbar: { show: false }, zoom: { enabled: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#007bff'],
        fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.05, } },
        xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'dd MMM' } },
        yaxis: { labels: { formatter: (val) => `$${val}` } },
        tooltip: { x: { format: 'dd MMM yyyy' }, y: { formatter: (val) => `$${val}` } },
        theme: { mode: document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light' }
    };

    equityCurveChart = new ApexCharts(chartContainer, options);
    equityCurveChart.render();
}


function runStatsPage() {
    // --- SELETORES DO DOM ---
    const balanceEl = document.getElementById('current-balance');
    const depositBtn = document.getElementById('deposit-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const adjustBtn = document.getElementById('adjust-btn');
    const transactionModal = {
        container: document.getElementById('transaction-modal'), form: document.getElementById('transaction-form'),
        closeBtn: document.getElementById('close-transaction-modal-btn'), title: document.getElementById('transaction-title')
    };
    
    let currentTransactionType = 'deposit';

    // --- LÓGICA DO PORTFÓLIO (usando o serviço) ---
    listenToPortfolioSummary((data, error) => {
        if (error) { console.error("Erro ao obter dados do portfólio:", error); balanceEl.textContent = '$ Erro'; return; }
        const balance = data.balance || 0;
        balanceEl.textContent = `$${balance.toFixed(2)}`;
    });

    depositBtn.addEventListener('click', () => { currentTransactionType = 'deposit'; transactionModal.title.textContent = 'Registar Depósito'; transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Montante ($):"; transactionModal.container.style.display = 'flex'; });
    withdrawBtn.addEventListener('click', () => { currentTransactionType = 'withdraw'; transactionModal.title.textContent = 'Registar Levantamento'; transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Montante ($):"; transactionModal.container.style.display = 'flex'; });
    adjustBtn.addEventListener('click', () => { currentTransactionType = 'adjust'; transactionModal.title.textContent = 'Ajustar Saldo Final'; transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Novo Saldo Final ($):"; transactionModal.container.style.display = 'flex'; });
    
    function closeTransactionModal() { transactionModal.form.reset(); transactionModal.container.style.display = 'none'; }
    transactionModal.closeBtn.addEventListener('click', closeTransactionModal);
    transactionModal.container.addEventListener('click', (e) => { if (e.target.id === 'transaction-modal') closeTransactionModal(); });

    transactionModal.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountInput = document.getElementById('transaction-amount');
        const notesInput = document.getElementById('transaction-notes');
        let amount = parseFloat(amountInput.value);
        if (isNaN(amount) || (currentTransactionType !== 'adjust' && amount <= 0)) { alert("Por favor, insira um montante válido."); return; }
        if (currentTransactionType === 'adjust') {
            try { await adjustPortfolioBalance(amount); console.log("Saldo ajustado com sucesso."); closeTransactionModal(); } 
            catch (error) { console.error("Erro ao ajustar o saldo:", error); alert("Ocorreu um erro ao ajustar o saldo."); }
        } else {
            const transactionData = { amount: amount, type: currentTransactionType, notes: notesInput.value, date: new Date() };
            try { await addTransactionAndUpdateBalance(transactionData); console.log("Transação registada."); closeTransactionModal(); } 
            catch (error) { console.error("Erro na transação:", error); alert("Ocorreu um erro: " + error.message); }
        }
    });

    // --- LÓGICA DAS ESTATÍSTICAS E GRÁFICOS ---
    function calculateAndDisplayStats() {
        listenToClosedTrades((trades, error) => {
            if (error) { console.error("Erro ao obter trades fechados:", error); return; }

            let totalTrades = 0, totalPnl = 0, winCount = 0, lossCount = 0, totalWinAmount = 0, totalLossAmount = 0;
            const statsByStrategy = {}, statsByReason = {};
            
            const validTrades = trades.filter(trade => trade.closeDetails && !isNaN(parseFloat(trade.closeDetails.pnl)));
            
            validTrades.forEach(trade => {
                totalTrades++;
                const pnl = parseFloat(trade.closeDetails.pnl);
                totalPnl += pnl;
                if (pnl > 0) { winCount++; totalWinAmount += pnl; } else { lossCount++; totalLossAmount += pnl; }
                const strategy = trade.strategyName || 'Sem Estratégia';
                if (!statsByStrategy[strategy]) statsByStrategy[strategy] = { count: 0, pnl: 0 };
                statsByStrategy[strategy].count++; statsByStrategy[strategy].pnl += pnl;
                const reason = trade.closeDetails.closeReason || 'Não especificado';
                if (!statsByReason[reason]) statsByReason[reason] = { count: 0, pnl: 0 };
                statsByReason[reason].count++; statsByReason[reason].pnl += pnl;
            });
            
            const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
            const avgWin = winCount > 0 ? totalWinAmount / winCount : 0;
            const avgLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
            const rrRatio = (avgLoss !== 0) ? Math.abs(avgWin / avgLoss) : 0;
            updateElementText('total-trades', totalTrades);
            updateElementText('total-pnl', `$${totalPnl.toFixed(2)}`, true);
            updateElementText('win-rate', `${winRate.toFixed(1)}%`);
            updateElementText('win-count', winCount);
            updateElementText('loss-count', lossCount);
            updateElementText('avg-win', `$${avgWin.toFixed(2)}`, true);
            updateElementText('avg-loss', `$${avgLoss.toFixed(2)}`, true);
            updateElementText('rr-ratio', rrRatio.toFixed(2));
            generateDetailTable('strategy-stats', 'Estratégia', statsByStrategy);
            generateDetailTable('reason-stats', 'Motivo', statsByReason);

            // Renderiza o gráfico da curva de P&L
            renderPnlCurveChart(validTrades);
        });
    }
    
    function updateElementText(id, text, isPnl = false) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
            if (isPnl) {
                element.classList.remove('positive-pnl', 'negative-pnl');
                if (parseFloat(text.replace('$', '')) > 0) { element.classList.add('positive-pnl'); }
                else if (parseFloat(text.replace('$', '')) < 0) { element.classList.add('negative-pnl'); }
            }
        }
    }    
    
    function generateDetailTable(containerId, header, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const sortedData = Object.entries(data).sort(([, a], [, b]) => b.pnl - a.pnl);
        if (sortedData.length === 0) {
            container.innerHTML = '<p>Não há dados disponíveis.</p>';
            return;
        }
        let tableHtml = `<table><thead><tr><th>${header}</th><th>Nº Trades</th><th>P&L Total</th></tr></thead><tbody>`;
        for (const [key, item] of sortedData) {
            const pnlClass = item.pnl > 0 ? 'positive-pnl' : (item.pnl < 0 ? 'negative-pnl' : '');
            tableHtml += `<tr><td>${key}</td><td>${item.count}</td><td class="${pnlClass}">$${item.pnl.toFixed(2)}</td></tr>`;
        }
        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }
 
    // Iniciar a página
    calculateAndDisplayStats();
}

document.addEventListener('DOMContentLoaded', runStatsPage);
