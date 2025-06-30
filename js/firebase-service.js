import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, collection, addDoc, doc, updateDoc, getDoc, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para ouvir os trades em tempo real
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
        callback([], error); // Informa a UI sobre o erro
    });
}

// Função para buscar um único trade (para edição)
export async function getTrade(tradeId) {
    try {
        const docSnap = await getDoc(doc(db, 'trades', tradeId));
        if (docSnap.exists()) {
            return { id: docSnap.id, data: docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar trade:", error);
        return null;
    }
}

// Função para adicionar um novo trade
export async function addTrade(tradeData) {
    try {
        await addDoc(collection(db, 'trades'), tradeData);
    } catch (error) {
        console.error("Erro ao adicionar trade:", error);
        throw error; // Lança o erro para a UI poder lidar com ele
    }
}

// Função para atualizar um trade existente
export async function updateTrade(tradeId, updatedData) {
    try {
        const tradeRef = doc(db, 'trades', tradeId);
        await updateDoc(tradeRef, updatedData);
    } catch (error) {
        console.error("Erro ao atualizar trade:", error);
        throw error;
    }
}
