// js/firebase-service.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, deleteDoc, query, orderBy, onSnapshot, runTransaction } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './config.js';

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Escuta alterações na coleção de trades em tempo real
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

// Busca um único trade da base de dados
export async function getTrade(tradeId) {
    try {
        const docSnap = await getDoc(doc(db, 'trades', tradeId));
        return docSnap.exists() ? { id: docSnap.id, data: docSnap.data() } : null;
    } catch (error) {
        console.error("Erro ao buscar trade:", error);
        return null;
    }
}

// Adiciona um novo trade à base de dados
export async function addTrade(tradeData) {
    try {
        await addDoc(collection(db, 'trades'), tradeData);
    } catch (error) {
        console.error("Erro ao adicionar trade:", error);
    }
}

// Atualiza um trade existente na base de dados
export async function updateTrade(tradeId, updatedData) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        await updateDoc(tradeRef, updatedData);
    } catch (error) {
        console.error("Erro ao atualizar trade:", error);
    }
}


/**
 * Fecha um trade, atualiza o seu status e adiciona o P&L ao saldo do portfólio.
 * Tudo dentro de uma única transação segura.
 * @param {string} tradeId - O ID do trade a ser fechado.
 * @param {Object} closeDetails - Objeto com os detalhes de fecho (pnl, exitPrice, etc.).
 */
export async function closeTradeAndUpdateBalance(tradeId, closeDetails) {
    const tradeRef = doc(db, 'trades', tradeId);
    const portfolioRef = doc(db, 'portfolio', 'summary');
    const pnlValue = parseFloat(closeDetails.pnl);

    if (isNaN(pnlValue)) {
        // Lança um erro que será apanhado pela função que chama
        throw new Error("Valor de P&L inválido fornecido.");
    }

    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);
            const currentBalance = portfolioDoc.exists() ? portfolioDoc.data().balance : 0;
            const newBalance = currentBalance + pnlValue;

            // 1. Atualiza o documento do trade
            transaction.update(tradeRef, { 
                status: "CLOSED", 
                closeDetails: closeDetails, 
                dateClosed: new Date() 
            });

            // 2. Atualiza o documento do saldo do portfólio
            transaction.set(portfolioRef, { balance: newBalance }, { merge: true });
        });
    } catch (error) {
        console.error("Erro na transação de fecho de trade:", error);
        // Re-lança o erro para que a UI possa notificar o utilizador
        throw error;
    }
}


// Apaga um trade da base de dados (NOVA FUNÇÃO)
export async function deleteTrade(tradeId) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        await deleteDoc(tradeRef);
        console.log("Trade apagado com sucesso do serviço.");
    } catch (error) {
        console.error("Erro no serviço ao apagar trade:", error);
        // Lançar o erro para que a UI possa reagir se necessário
        throw error;
    }
}

// Função para atualizar o portfólio (se precisarmos dela noutros locais)
export async function updatePortfolioBalance(amount) {
    const portfolioRef = doc(db, "portfolio", "summary");
    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);
            const currentBalance = portfolioDoc.exists() ? portfolioDoc.data().balance : 0;
            const newBalance = currentBalance + amount;
            if (newBalance < 0) throw new Error("Saldo do portfólio não pode ser negativo.");
            transaction.set(portfolioRef, { balance: newBalance }, { merge: true });
        });
    } catch (error) {
        console.error("Erro ao atualizar o saldo do portfólio:", error);
        throw error;
    }
}
