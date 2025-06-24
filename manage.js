// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    deleteDoc, 
    query, 
    orderBy, 
    onSnapshot
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
    const tableBody = document.getElementById('trades-table-body');
    if (!tableBody) return;

    // Função para apagar (sem alterações)
    async function deleteTrade(tradeId) { /* ... */ }
    deleteTrade = async function(tradeId) {
        if (!confirm("Tem a certeza que quer apagar este trade?")) return;
        try {
            await deleteDoc(doc(db, 'trades', tradeId));
        } catch (error) { console.error("Erro ao apagar:", error); }
    }

    // Função para redirecionar para edição
    function editTrade(tradeId) {
        // Guarda o ID do trade que queremos editar no localStorage do browser
        localStorage.setItem('tradeToEdit', tradeId);
        // Redireciona para a página principal
        window.location.href = 'index.html';
    }

    function fetchAndDisplayAllTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            tableBody.innerHTML = ''; 
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="6">Nenhum trade encontrado.</td></tr>';
                return;
            }
            snapshot.forEach(docSnapshot => {
                const trade = docSnapshot.data();
                const tr = document.createElement('tr');
                // ... (código de preenchimento da linha da tabela) ...
                const pnl = trade.status === 'CLOSED' ? (trade.closeDetails?.pnl || '0.00') : '-';
                let dateStr = trade.dateAdded?.toDate()?.toLocaleString('pt-PT') || 'N/A';

                tr.innerHTML = `
                    <td>${trade.asset || 'N/A'}</td>
                    <td>${trade.strategyName || 'N/A'}</td>
                    <td><span class="status-badge status-${(trade.status || 'unknown').toLowerCase()}">${trade.status || 'UNKNOWN'}</span></td>
                    <td>${dateStr}</td>
                    <td>${pnl}</td>
                    <td class="action-buttons">
                        <button class="edit-btn">Editar</button>
                        <button class="delete-btn">Apagar</button>
                    </td>
                `;

                // Adicionar eventos aos botões
                tr.querySelector('.edit-btn').addEventListener('click', () => editTrade(docSnapshot.id));
                tr.querySelector('.delete-btn').addEventListener('click', () => deleteTrade(docSnapshot.id));
                
                tableBody.appendChild(tr);
            });
        });
    }

    fetchAndDisplayAllTrades();
}
runManagePage();
