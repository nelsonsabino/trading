// js/firebase-service.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, getIdToken } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, doc, updateDoc, getDoc, deleteDoc,
    query, orderBy, onSnapshot, runTransaction, getDocs, where, setDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './config.js';
import { supabase } from './services.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Persistência de autenticação configurada para LOCAL."))
  .catch((error) => console.error("Erro ao configurar persistência:", error));

async function deleteTradeImage(imageUrl) {
    if (!imageUrl || !imageUrl.includes('supabase.co')) {
        console.log("Nenhuma imagem válida do Supabase Storage para apagar.");
        return;
    }
    try {
        const token = await getCurrentUserToken();
        if (!token) throw new Error("Não foi possível obter o token do utilizador para apagar a imagem.");
        
        await supabase.auth.setSession({ access_token: token, refresh_token: '' });

        const urlParts = imageUrl.split('/trade_images/');
        if (urlParts.length < 2) {
            throw new Error("URL da imagem inválido ou não reconhecido.");
        }
        const filePath = urlParts[1];

        console.log(`A tentar apagar a imagem do Storage no caminho: ${filePath}`);
        const { error } = await supabase.storage.from('trade_images').remove([filePath]);
        if (error) throw error;

        console.log(`Imagem ${filePath} apagada com sucesso do Supabase Storage.`);
    } catch (error) {
        console.error("Erro ao apagar a imagem do Supabase Storage. O ficheiro pode ter de ser removido manualmente.", error);
    }
}

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

export async function getTradesForAsset(assetSymbol) {
    try {
        const q = query(
            collection(db, 'trades'),
            where("asset", "==", assetSymbol),
            where("status", "==", "CLOSED"),
            orderBy('dateAdded', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const trades = [];
        querySnapshot.forEach((doc) => {
            trades.push({ id: doc.id, data: doc.data() });
        });
        return trades;
    } catch (error) {
        console.error(`Erro ao buscar trades para o ativo ${assetSymbol}:`, error);
        return [];
    }
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
        const docRef = await addDoc(collection(db, 'trades'), tradeData);
        return docRef.id;
    } catch (error) {
        console.error("Erro ao adicionar trade:", error);
        throw error;
    }
}

export async function updateTrade(tradeId, updatedData) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        await updateDoc(tradeRef, updatedData);
    } catch (error) {
        console.error("Erro ao atualizar trade:", error);
        throw error;
    }
}

export async function deleteTrade(tradeId) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        const tradeDoc = await getDoc(tradeRef);
        if (tradeDoc.exists()) {
            const tradeData = tradeDoc.data();
            if (tradeData.imageUrl) {
                await deleteTradeImage(tradeData.imageUrl);
            }
        }
        await deleteDoc(tradeRef);
    } catch (error) {
        console.error("Erro no serviço ao apagar trade:", error);
        throw error;
    }
}

export function listenToPortfolioSummary(callback) {
    const portfolioRef = doc(db, "portfolio", "summary");
    return onSnapshot(portfolioRef, (doc) => {
        const data = doc.exists() ? doc.data() : { balance: 0 };
        callback(data);
    }, (error) => {
        console.error("Erro ao escutar o sumário do portfólio:", error);
        callback(null, error);
    });
}

export function listenToClosedTrades(callback) {
    const q = query(collection(db, 'trades'), where('status', '==', 'CLOSED'), orderBy('dateClosed', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const closedTrades = [];
        snapshot.forEach(doc => { closedTrades.push(doc.data()); });
        callback(closedTrades);
    }, (error) => {
        console.error("Erro ao escutar trades fechados:", error);
        callback([], error);
    });
}

export async function addTransactionAndUpdateBalance(transactionData) {
    const portfolioRef = doc(db, "portfolio", "summary");
    const amountToApply = transactionData.type === 'withdraw' ? -transactionData.amount : transactionData.amount;
    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);
            const currentBalance = portfolioDoc.exists() ? portfolioDoc.data().balance : 0;
            const newBalance = currentBalance + amountToApply;
            if (newBalance < 0) throw new Error("O saldo do portfólio não pode ficar negativo.");
            transaction.set(doc(collection(db, "transactions")), transactionData);
            transaction.set(portfolioRef, { balance: newBalance }, { merge: true });
        });
    } catch (error) { console.error("Erro na transação de adicionar:", error); throw error; }
}

export async function adjustPortfolioBalance(newBalance) {
    const portfolioRef = doc(db, "portfolio", "summary");
    try { await setDoc(portfolioRef, { balance: newBalance }); } 
    catch (error) { console.error("Erro no serviço ao ajustar saldo:", error); throw error; }
}

export function listenToTransactions(callback) {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach(docSnapshot => { transactions.push({ id: docSnapshot.id, data: docSnapshot.data() }); });
        callback(transactions);
    }, (error) => { console.error("Erro ao escutar transações:", error); callback([], error); });
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
    } catch (error) { console.error("Erro na transação de apagar:", error); throw error; }
}

export async function closeTradeAndUpdateBalance(tradeId, closeDetails) {
    const tradeRef = doc(db, 'trades', tradeId);
    const portfolioRef = doc(db, 'portfolio', 'summary');
    const pnlValue = parseFloat(closeDetails.pnl);
    if (isNaN(pnlValue)) throw new Error("Valor de P&L inválido fornecido.");
    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);
            const currentBalance = portfolioDoc.exists() ? portfolioDoc.data().balance : 0;
            const newBalance = currentBalance + pnlValue;
            transaction.update(tradeRef, { status: "CLOSED", closeDetails: closeDetails, dateClosed: new Date() });
            transaction.set(portfolioRef, { balance: newBalance }, { merge: true });
        });
    } catch (error) { console.error("Erro na transação de fecho de trade:", error); throw error; }
}

export function listenToStrategies(callback) {
    const q = query(collection(db, 'strategies'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        const strategies = [];
        snapshot.forEach(docSnapshot => { strategies.push({ id: docSnapshot.id, data: docSnapshot.data() }); });
        callback(strategies);
    }, (error) => { console.error("Erro ao escutar por estratégias:", error); callback([], error); });
}

export async function getStrategy(strategyId) {
    try {
        const docSnap = await getDoc(doc(db, 'strategies', strategyId));
        return docSnap.exists() ? { id: docSnap.id, data: docSnap.data() } : null;
    } catch (error) { console.error("Erro ao buscar estratégia:", error); return null; }
}

export async function fetchActiveStrategies() {
    try {
        const q = query(collection(db, 'strategies'), where("isActive", "==", true), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const strategies = [];
        querySnapshot.forEach((doc) => { strategies.push({ id: doc.id, data: doc.data() }); });
        return strategies;
    } catch (error) { console.error("Erro ao buscar estratégias ativas:", error); return []; }
}

export async function addStrategy(strategyData) {
    try {
        const dataToSave = { ...strategyData, createdAt: new Date(), isActive: true };
        const docRef = await addDoc(collection(db, 'strategies'), dataToSave);
        return docRef.id;
    } catch (error) { console.error("Erro no serviço ao adicionar estratégia:", error); throw error; }
}

export async function updateStrategy(strategyId, strategyData) {
    try {
        const strategyRef = doc(db, 'strategies', strategyId);
        await updateDoc(strategyRef, strategyData);
    } catch (error) { console.error("Erro no serviço ao atualizar estratégia:", error); throw error; }
}

export async function deleteStrategy(strategyId) {
    try {
        const strategyRef = doc(db, 'strategies', strategyId);
        await deleteDoc(strategyRef);
    } catch (error) { console.error("Erro no serviço ao apagar estratégia:", error); throw error; }
}

export async function getCurrentUserToken() {
    const user = auth.currentUser;
    if (user) {
        return await getIdToken(user);
    }
    return null;
}
