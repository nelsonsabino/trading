import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, collection, addDoc, doc, updateDoc, getDoc, query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './config.js';

// 1. Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Exporta as funções que a aplicação vai usar
export function listenToTrades(callback) {
    const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
    onSnapshot(q, (snapshot) => {
        const trades = [];
        snapshot.forEach(docSnapshot => {
            trades.push({ id: docSnapshot.id, data: docSnapshot.data() });
        });
        callback(trades);
    });
}

export async function getTrade(tradeId) {
    const docSnap = await getDoc(doc(db, 'trades', tradeId));
    return docSnap.exists() ? { id: docSnap.id, data: docSnap.data() } : null;
}

export function addTrade(tradeData) {
    return addDoc(collection(db, 'trades'), tradeData);
}

export function updateTrade(tradeId, updatedData) {
    const tradeRef = doc(db, 'trades', tradeId);
    return updateDoc(tradeRef, updatedData);
}
