
// Importa a instância 'db' já inicializada e outras funções necessárias do Firebase
import { db } from './firebase-service.js';
import { 
    collection, 
    doc, 
    query, 
    where, 
    onSnapshot, 
    runTransaction, 
    addDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";







function runStatsPage() {
    // --- SELETORES DO DOM ---
    const balanceEl = document.getElementById('current-balance');
    const depositBtn = document.getElementById('deposit-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const adjustBtn = document.getElementById('adjust-btn');
    const transactionModal = {
        container: document.getElementById('transaction-modal'),
        form: document.getElementById('transaction-form'),
        closeBtn: document.getElementById('close-transaction-modal-btn'),
        title: document.getElementById('transaction-title')
    };
    
    let currentTransactionType = 'deposit';

    // --- LÓGICA DO PORTFÓLIO COMPLETA ---
    onSnapshot(doc(db, "portfolio", "summary"), (doc) => {
        if (doc.exists()) {
            const balance = doc.data().balance || 0;
            balanceEl.textContent = `$${balance.toFixed(2)}`;
        } else {
            balanceEl.textContent = '$0.00';
        }
    });

    depositBtn.addEventListener('click', () => {
        currentTransactionType = 'deposit';
        transactionModal.title.textContent = 'Registar Depósito';
        transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Montante ($):";
        transactionModal.container.style.display = 'flex';
    });
    
    withdrawBtn.addEventListener('click', () => {
        currentTransactionType = 'withdraw';
        transactionModal.title.textContent = 'Registar Levantamento';
        transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Montante ($):";
        transactionModal.container.style.display = 'flex';
    });

    adjustBtn.addEventListener('click', () => {
        currentTransactionType = 'adjust';
        transactionModal.title.textContent = 'Ajustar Saldo Final';
        transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Novo Saldo Final ($):";
        transactionModal.container.style.display = 'flex';
    });
    
    function closeTransactionModal() {
        transactionModal.form.reset();
        transactionModal.container.style.display = 'none';
    }
    transactionModal.closeBtn.addEventListener('click', closeTransactionModal);
    transactionModal.container.addEventListener('click', (e) => { if (e.target.id === 'transaction-modal') closeTransactionModal(); });

    transactionModal.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountInput = document.getElementById('transaction-amount');
        const notesInput = document.getElementById('transaction-notes');
        let amount = parseFloat(amountInput.value);

        if (isNaN(amount) || (currentTransactionType !== 'adjust' && amount <= 0)) {
            alert("Por favor, insira um montante válido.");
            return;
        }

        const portfolioRef = doc(db, "portfolio", "summary");

        if (currentTransactionType === 'adjust') {
            try {
                await setDoc(portfolioRef, { balance: amount });
                console.log("Saldo ajustado com sucesso para:", amount);
                closeTransactionModal();
            } catch (error) {
                console.error("Erro ao ajustar o saldo:", error);
                alert("Ocorreu um erro ao ajustar o saldo.");
            }
        } else {
            const transactionData = {
                amount: amount,
                type: currentTransactionType,
                notes: notesInput.value,
                date: new Date()
            };
            const amountToApply = currentTransactionType === 'withdraw' ? -amount : amount;
            try {
                await addDoc(collection(db, "transactions"), transactionData);
                await runTransaction(db, async (transaction) => {
                    const portfolioDoc = await transaction.get(portfolioRef);
                    const currentBalance = portfolioDoc.exists() ? portfolioDoc.data().balance : 0;
                    const newBalance = currentBalance + amountToApply;
                    if (newBalance < 0) throw new Error("Saldo não pode ser negativo.");
                    transaction.set(portfolioRef, { balance: newBalance }, { merge: true });
                });
                console.log("Transação registada com sucesso!");
                closeTransactionModal();
            } catch (error) {
                console.error("Erro na transação:", error);
                alert("Ocorreu um erro: " + error.message);
            }
        }
    });

    // --- LÓGICA DAS ESTATÍSTICAS DE TRADES COMPLETA ---
    function calculateAndDisplayStats() {
        const q = query(collection(db, 'trades'), where('status', '==', 'CLOSED'));
        onSnapshot(q, (snapshot) => {
            let totalTrades=0, totalPnl=0, winCount=0, lossCount=0, totalWinAmount=0, totalLossAmount=0;
            const statsByStrategy = {}, statsByReason = {};
            snapshot.forEach(doc => {
                const trade = doc.data();
                if (!trade.closeDetails || isNaN(parseFloat(trade.closeDetails.pnl))) return;
                totalTrades++;
                const pnl = parseFloat(trade.closeDetails.pnl);
                totalPnl += pnl;
                if (pnl > 0) { winCount++; totalWinAmount += pnl; } else { lossCount++; totalLossAmount += pnl; }
                const strategy = trade.strategyName || 'Sem Estratégia';
                if (!statsByStrategy[strategy]) statsByStrategy[strategy] = { count: 0, pnl: 0 };
                statsByStrategy[strategy].count++; statsByStrategy[strategy].pnl += pnl;
                const reason = trade.closeDetails.closeReason || 'Não especificado';
                if (!statsByReason[reason]) statsByReason[reason] = { count: 0, pnl: 0 };
                statsByReason[reason].count++;
                statsByReason[reason].pnl += pnl;
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
        let tableHtml = `<table><thead><tr><th>${header}</th><th>Nº Trades</th><th>P&L Total</th></tr></thead><tbody>`;
        for (const key in data) {
            const item = data[key];
            const pnlClass = item.pnl > 0 ? 'positive-pnl' : (item.pnl < 0 ? 'negative-pnl' : '');
            tableHtml += `<tr><td>${key}</td><td>${item.count}</td><td class="${pnlClass}">$${item.pnl.toFixed(2)}</td></tr>`;
        }
        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }
 
    // Iniciar
    calculateAndDisplayStats();
}

runStatsPage();
