// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, doc, query, where, onSnapshot, runTransaction, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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





function runStatsPage() {
    // --- SELETORES DO DOM ---
    const balanceEl = document.getElementById('current-balance');
    const depositBtn = document.getElementById('deposit-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const adjustBtn = document.getElementById('adjust-btn'); // NOVO
    const transactionModal = {
        container: document.getElementById('transaction-modal'),
        form: document.getElementById('transaction-form'),
        closeBtn: document.getElementById('close-transaction-modal-btn'),
        title: document.getElementById('transaction-title')
    };
    
    let currentTransactionType = 'deposit'; // 'deposit', 'withdraw', ou 'adjust'

    // --- LÓGICA DO PORTFÓLIO ---
    onSnapshot(doc(db, "portfolio", "summary"), (doc) => { /* ... (sem alterações) ... */ });

    // Abre o modal para depósito
    depositBtn.addEventListener('click', () => {
        currentTransactionType = 'deposit';
        transactionModal.title.textContent = 'Registar Depósito';
        transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Montante (€):";
        transactionModal.container.style.display = 'flex';
    });
    
    // Abre o modal para levantamento
    withdrawBtn.addEventListener('click', () => {
        currentTransactionType = 'withdraw';
        transactionModal.title.textContent = 'Registar Levantamento';
        transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Montante (€):";
        transactionModal.container.style.display = 'flex';
    });

    // NOVO: Abre o modal para ajuste
    adjustBtn.addEventListener('click', () => {
        currentTransactionType = 'adjust';
        transactionModal.title.textContent = 'Ajustar Saldo Final';
        // Muda o texto do label para ser mais claro
        transactionModal.form.querySelector('label[for="transaction-amount"]').textContent = "Novo Saldo Final (€):";
        transactionModal.container.style.display = 'flex';
    });
    
    // Fecha o modal
    function closeTransactionModal() { /* ... (sem alterações) ... */ }
    transactionModal.closeBtn.addEventListener('click', closeTransactionModal);
    transactionModal.container.addEventListener('click', (e) => { if (e.target.id === 'transaction-modal') closeTransactionModal(); });

    // Lida com a submissão do formulário (LÓGICA ATUALIZADA)
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

        // LÓGICA DIFERENTE PARA CADA TIPO DE TRANSAÇÃO
        if (currentTransactionType === 'adjust') {
            // AJUSTE DIRETO: Define o saldo para o novo valor
            try {
                await setDoc(portfolioRef, { balance: amount });
                console.log("Saldo ajustado com sucesso para:", amount);
                closeTransactionModal();
            } catch (error) {
                console.error("Erro ao ajustar o saldo:", error);
                alert("Ocorreu um erro ao ajustar o saldo.");
            }
        } else {
            // DEPÓSITO/LEVANTAMENTO: Adiciona ou subtrai do saldo atual
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

    // --- LÓGICA DAS ESTATÍSTICAS DE TRADES (sem alterações) ---
    function calculateAndDisplayStats() { /* ... */ }
    function updateElementText(id, text, isPnl = false) { /* ... */ }
    function generateDetailTable(containerId, header, data) { /* ... */ }

    // Iniciar
    calculateAndDisplayStats();
}

runStatsPage();
