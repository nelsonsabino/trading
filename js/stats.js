// js/stats.js

import {
    listenToPortfolioSummary,
    listenToClosedTrades,
    addTransactionAndUpdateBalance,
    adjustPortfolioBalance,
    deleteTrade // Importa deleteTrade para o botão de apagar no futuro, se necessário (mas não fazemos aqui)
} from './firebase-service.js';

// --- Variáveis para os Gráficos ---
let equityCurveChart = null;

// --- FUNÇÕES DE RENDERIZAÇÃO DE GRÁFICOS ---

function renderPnlCurveChart(trades) {
    const chartContainer = document.getElementById('equity-curve-chart');
    if (!chartContainer) return;

    // Destruir o gráfico existente antes de criar um novo, se existir
    if (equityCurveChart) {
        equityCurveChart.destroy();
        equityCurveChart = null;
    }
    chartContainer.innerHTML = ''; // Limpa o contentor


    // Ordena os trades por data de fecho
    const sortedTrades = trades.sort((a, b) => {
        const dateA = a.closeDetails?.dateClosed?.seconds || 0;
        const dateB = b.closeDetails?.dateClosed?.seconds || 0;
        return dateA - dateB;
    });

    let cumulativePnl = 0;
    const seriesData = sortedTrades.map(trade => {
        const pnl = parseFloat(trade.closeDetails?.pnl || 0); // Garante que é um número
        cumulativePnl += pnl;
        const date = new Date(trade.dateClosed?.seconds * 1000 || Date.now()); // Garante que a data é válida
        return {
            x: date,
            y: parseFloat(cumulativePnl.toFixed(2)) // Garante que o Y é um número
        };
    });

    // DEBUG: Log dos dados que estão a ser passados para o gráfico
    console.log("Dados para o Gráfico Curva de Capital (seriesData):", seriesData);
    if (seriesData.length < 1) { // Garante que há pelo menos 1 ponto para renderizar
        chartContainer.innerHTML = '<p style="text-align:center; color: #6c757d;">Sem dados suficientes para a Curva de Capital.</p>';
        return;
    }

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


// --- FUNÇÕES PARA O HISTÓRICO DE TRADES FECHADOS ---
function displayClosedTradesHistory(trades) {
    const tbody = document.getElementById('closed-trades-table-body');
    if (!tbody) return;
    tbody.innerHTML = ''; // Limpa a tabela

    const closedTrades = trades.filter(trade => trade.status === 'CLOSED'); // Garante que só os fechados são mostrados
    if (closedTrades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2rem;">Nenhum trade fechado no histórico.</td></tr>';
        return;
    }

    // Ordena do mais recente para o mais antigo
    const sortedClosedTrades = closedTrades.sort((a, b) => {
        const dateA = a.dateClosed?.seconds || 0;
        const dateB = b.dateClosed?.seconds || 0;
        return dateB - dateA; // Ordem descendente
    });

    sortedClosedTrades.forEach(trade => {
        const tr = document.createElement('tr');
        const pnl = parseFloat(trade.closeDetails?.pnl || 0);
        const pnlClass = pnl > 0 ? 'positive-pnl' : (pnl < 0 ? 'negative-pnl' : '');
        
        const dateAddedStr = trade.dateAdded?.toDate().toLocaleString('pt-PT') || 'N/A';
        const dateClosedStr = trade.dateClosed?.toDate().toLocaleString('pt-PT') || 'N/A';
        const entryPrice = trade.executionDetails?.['entry-price'] || 'N/A';
        const exitPrice = trade.closeDetails?.exitPrice || 'N/A';
        const closeReason = trade.closeDetails?.closeReason || 'Não especificado';
        const finalNotes = trade.closeDetails?.finalNotes || '';
        const screenshotUrl = trade.closeDetails?.exitScreenshotUrl || '';

        const screenshotHtml = screenshotUrl 
            ? `<a href="${screenshotUrl}" target="_blank" class="screenshot-link-btn"><i class="fas fa-image"></i> Ver</a>`
            : '-';

        tr.innerHTML = `
            <td data-label="Ativo"><strong><a href="asset-details.html?symbol=${trade.asset}" class="asset-link">${trade.asset || 'N/A'}</a></strong></td>
            <td data-label="Estratégia">${trade.strategyName || 'N/A'}</td>
            <td data-label="Entrada">${entryPrice !== 'N/A' ? `$${entryPrice}` : 'N/A'} (${dateAddedStr})</td>
            <td data-label="Saída">${exitPrice !== 'N/A' ? `$${exitPrice}` : 'N/A'} (${dateClosedStr})</td>
            <td data-label="P&L ($)" class="${pnlClass}">${pnl !== 0 ? `$${pnl.toFixed(2)}` : 'N/A'}</td>
            <td data-label="Razão Fecho">${closeReason}</td>
            <td data-label="Notas Finais" class="notes-cell">${finalNotes || '-'}</td>
            <td data-label="Screenshot">${screenshotHtml}</td>
        `;
        tbody.appendChild(tr);
    });
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
            
            // Renderiza o histórico de trades fechados
            displayClosedTradesHistory(trades); // Passa 'trades' (todos os fechados)
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

    // Listener para expandir/recolher histórico de trades fechados
    const toggleClosedTradesBtn = document.getElementById('toggle-closed-trades');
    const closedTradesHistoryDiv = document.getElementById('closed-trades-history');

    if (toggleClosedTradesBtn && closedTradesHistoryDiv) {
        toggleClosedTradesBtn.addEventListener('click', () => {
            const isHidden = closedTradesHistoryDiv.style.display === 'none';
            closedTradesHistoryDiv.style.display = isHidden ? 'block' : 'none';
            toggleClosedTradesBtn.innerHTML = isHidden 
                ? '<i class="fas fa-chevron-up"></i> Recolher Histórico' 
                : '<i class="fas fa-chevron-down"></i> Expandir Histórico';
        });
    }
}

document.addEventListener('DOMContentLoaded', runStatsPage);
