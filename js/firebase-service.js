// js/firebase-service.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    getDoc, 
    deleteDoc,
    query, 
    orderBy, 
    onSnapshot, 
    runTransaction,
    getDocs,
    where
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './config.js';

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNÇÕES PARA A COLEÇÃO "TRADES" ---

export function listenToTrades(callback) {
    const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
    onSnapshot(q, (snapshot) => {
        const trades = [];
        snapshot.forEach(docSnapshot => {
            trades.push({ id: docSnapshot.id, data: docSnapshot.data() });
        });
        callback(trades);
    }, (error) => {
        console.error("Erro ao escutar trades:", error);
        callback([], error);
    });
}

export async function getTrade(tradeId) {
    try {
        const docSnap = await getDoc(doc(db, 'trades', tradeId));
        return docSnap.exists() ? { id: docSnap.id, data: docSnap.data() } : null;
    } catch (error) {
        console.error("Erro ao buscar trade:", error);
        return null;
    }
}

export async function addTrade(tradeData) {
    try {
        await addDoc(collection(db, 'trades'), tradeData);
    } catch (error) {
        console.error("Erro ao adicionar trade:", error);
    }
}

export async function updateTrade(tradeId, updatedData) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        await updateDoc(tradeRef, updatedData);
    } catch (error) {
        console.error("Erro ao atualizar trade:", error);
    }
}

export async function deleteTrade(tradeId) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        await deleteDoc(tradeRef);
    } catch (error) {
        console.error("Erro no serviço ao apagar trade:", error);
        throw error;
    }
}

// --- FUNÇÕES PARA A COLEÇÃO "TRANSACTIONS" ---

export function listenToTransactions(callback) {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach(docSnapshot => {
            transactions.push({ id: docSnapshot.id, data: docSnapshot.data() });
        });
        callback(transactions);
    }, (error) => {
        console.error("Erro ao escutar transações:", error);
        callback([], error);
    });
}

export async function deleteTransaction(transactionId, amount, type) {
    const amountToRevert = type === 'deposit' ? -amount : amount;
    const transactionRef = doc(db, 'transactions', transactionId);
    const portfolioRef = doc(db, 'portfolio', 'summary');

    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);
            if (!portfolioDoc.exists()) throw new Error("Documento do portfólio não encontrado!");
            
            const currentBalance = portfolioDoc.data().balance || 0;
            const newBalance = currentBalance + amountToRevert;

            transaction.update(portfolioRef, { balance: newBalance });
            transaction.delete(transactionRef);
        });
    } catch (error) {
        console.error("Erro na transação de apagar:", error);
        throw error;
    }
}

// --- FUNÇÃO PARA ATUALIZAR O PORTFÓLIO DIRETAMENTE ---

export async function closeTradeAndUpdateBalance(tradeId, closeDetails) {
    const tradeRef = doc(db, 'trades', tradeId);
    const portfolioRef = doc(db, 'portfolio', 'summary');
    const pnlValue = parseFloat(closeDetails.pnl);

    if (isNaN(pnlValue)) {
        throw new Error("Valor de P&L inválido fornecido.");
    }

    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);
            const currentBalance = portfolioDoc.exists() ? portfolioDoc.data().balance : 0;
            const newBalance = currentBalance + pnlValue;

            transaction.update(tradeRef, { 
                status: "CLOSED", 
                closeDetails: closeDetails, 
                dateClosed: new Date() 
            });
            transaction.set(portfolioRef, { balance: newBalance }, { merge: true });
        });
    } catch (error) {
        console.error("Erro na transação de fecho de trade:", error);
        throw error;
    }
}


// --- FUNÇÕES PARA A NOVA COLEÇÃO "STRATEGIES" ---

export function listenToStrategies(callback) {
    const q = query(collection(db, 'strategies'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        const strategies = [];
        snapshot.forEach(docSnapshot => {
            strategies.push({ id: docSnapshot.id, data: docSnapshot.data() });
        });
        callback(strategies);
    }, (error) => {
        console.error("Erro ao escutar por estratégias:", error);
        callback([], error);
    });
}

export async function getStrategy(strategyId) {
    try {
        const docSnap = await getDoc(doc(db, 'strategies', strategyId));
        return docSnap.exists() ? { id: docSnap.id, data: docSnap.data() } : null;
    } catch (error) {
        console.error("Erro ao buscar estratégia:", error);
        return null;
    }
}

export async function fetchActiveStrategies() {
    try {
        const q = query(collection(db, 'strategies'), where("isActive", "==", true), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const strategies = [];
        querySnapshot.forEach((doc) => {
            strategies.push({ id: doc.id, data: doc.data() });
        });
        return strategies;
    } catch (error) {
        console.error("Erro ao buscar estratégias ativas:", error);
        return [];
    }
}

export async function addStrategy(strategyData) {
    try {
        const dataToSave = {
            ...strategyData,
            createdAt: new Date(),
            isActive: true
        };
        await addDoc(collection(db, 'strategies'), dataToSave);
    } catch (error) {
        console.error("Erro no serviço ao adicionar estratégia:", error);
        throw error;
    }
}

export async function updateStrategy(strategyId, strategyData) {
    try {
        const strategyRef = doc(db, 'strategies', strategyId);
        await updateDoc(strategyRef, strategyData);
    } catch (error) {
        console.error("Erro no serviço ao atualizar estratégia:", error);
        throw error;
    }
}

export async function deleteStrategy(strategyId) {
    try {
        const strategyRef = doc(db, 'strategies', strategyId);
        await deleteDoc(strategyRef);
    } catch (error) {
        console.error("Erro no serviço ao apagar estratégia:", error);
        throw error;
    }
}
