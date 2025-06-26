// js/firebase-service.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './config.js'; // Importa a configuração

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Escuta alterações na coleção de trades em tempo real
export function listenToTrades(callback) {
    const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
    onSnapshot(q, (snapshot) => {
        const trades = [];
        snapshot.forEach(doc => {
            trades.push({ id: doc.id, data: doc.data() });
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
