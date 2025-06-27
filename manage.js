// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, collection, doc, deleteDoc, query, orderBy, onSnapshot, runTransaction
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// A sua configuração da web app do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAoKtcIsVOcvI5O6gH_14AXL3bF2I6X8Qc",
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.firebasestorage.app",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);








function runManagePage() {
    // --- LÓGICA PARA A TABELA DE TRADES ---
    const tradesTableBody = document.getElementById('trades-table-body');

    async function deleteTrade(tradeId) {
        if (!confirm("Tem a certeza que quer apagar este trade?")) return;
        try { await deleteDoc(doc(db, 'trades', tradeId)); } catch (e) { console.error("Erro ao apagar trade:", e); }
    }

    function editTrade(tradeId) {
        localStorage.setItem('tradeToEdit', tradeId);
        window.location.href = 'index.html';
    }

    function fetchAndDisplayAllTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            if(!tradesTableBody) return;
            tradesTableBody.innerHTML = '';
            if (snapshot.empty) {
                tradesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum trade encontrado.</td></tr>';
                return;
            }
            snapshot.forEach(docSnapshot => {
                const trade = docSnapshot.data();
                const tr = document.createElement('tr');
                const pnl = trade.status === 'CLOSED' ? (trade.closeDetails?.pnl || '0.00') : '-';
                const pnlClass = parseFloat(pnl) > 0 ? 'positive-pnl' : (parseFloat(pnl) < 0 ? 'negative-pnl' : '');
                const dateStr = trade.dateAdded?.toDate()?.toLocaleString('pt-PT') || 'N/A';
                tr.innerHTML = `
                    <td><strong>${trade.asset || 'N/A'}</strong></td>
                    <td>${trade.strategyName || 'N/A'}</td>
                    <td><span class="status-badge status-${(trade.status || 'unknown').toLowerCase()}">${trade.status || 'UNKNOWN'}</span></td>
                    <td>${dateStr}</td>
                    <td class="${pnlClass}">${pnl}</td>
                    <td><div class="action-buttons"><button class="btn edit-btn">Editar</button><button class="btn delete-btn">Apagar</button></div></td>`;
                tr.querySelector('.edit-btn').addEventListener('click', () => editTrade(docSnapshot.id));
                tr.querySelector('.delete-btn').addEventListener('click', () => deleteTrade(docSnapshot.id));
                tradesTableBody.appendChild(tr);
            });
        });
    }

    // --- LÓGICA PARA A TABELA DE TRANSAÇÕES DO PORTFÓLIO ---
    const transactionsTableBody = document.getElementById('transactions-table-body');

    async function deleteTransaction(transactionId, amount, type) {
        if (!confirm("Tem a certeza que quer apagar esta transação? O seu saldo do portfólio será ajustado. Esta ação é irreversível.")) return;
        const amountToRevert = type === 'deposit' ? -amount : amount;
        const transactionRef = doc(db, 'transactions', transactionId);
        const portfolioRef = doc(db, 'portfolio', 'summary');
        try {
            await runTransaction(db, async (transaction) => {
                const portfolioDoc = await transaction.get(portfolioRef);
                if (!portfolioDoc.exists()) throw new Error("Documento do portfólio não encontrado!");
                const newBalance = (portfolioDoc.data().balance || 0) + amountToRevert;
                transaction.update(portfolioRef, { balance: newBalance });
                transaction.delete(transactionRef);
            });
        } catch (error) {
            console.error("Erro ao apagar transação:", error);
            alert("Ocorreu um erro: " + error.message);
        }
    }

    function fetchAndDisplayTransactions() {
        const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        onSnapshot(q, (snapshot) => {
            if(!transactionsTableBody) return;
            transactionsTableBody.innerHTML = '';
            if (snapshot.empty) {
                transactionsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum registo de depósito ou levantamento.</td></tr>';
                return;
            }
            snapshot.forEach(docSnapshot => {
                const transaction = docSnapshot.data();
                const tr = document.createElement('tr');
                const date = transaction.date?.toDate().toLocaleString('pt-PT') || 'N/A';
                const type = transaction.type === 'deposit' ? 'Depósito' : 'Levantamento';
                const amount = transaction.amount || 0;
                const notes = transaction.notes || '-';
                const amountClass = transaction.type === 'deposit' ? 'positive-pnl' : 'negative-pnl';
                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${type}</td>
                    <td class="${amountClass}">$${amount.toFixed(2)}</td>
                    <td>${notes}</td>
                    <td><div class="action-buttons"><button class="btn delete-btn">Apagar</button></div></td>`;
                tr.querySelector('.delete-btn').addEventListener('click', () => deleteTransaction(docSnapshot.id, amount, transaction.type));
                transactionsTableBody.appendChild(tr);
            });
        });
    }

    // --- INICIAR A PÁGINA ---
    if(tradesTableBody) fetchAndDisplayAllTrades();
    if(transactionsTableBody) fetchAndDisplayTransactions();
}

runManagePage();
