// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc,        // <<< ADICIONADO
    updateDoc,  // <<< ADICIONADO
    query, 
    where, 
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

    // Função para apagar um trade
    async function deleteTrade(tradeId) {
        // CONFIRMAÇÃO ESSENCIAL PARA EVITAR ERROS
        if (!confirm("Tem a certeza que quer apagar este trade? Esta ação é irreversível.")) {
            return;
        }

        try {
            const tradeRef = doc(db, 'trades', tradeId);
            await deleteDoc(tradeRef);
            console.log("Trade apagado com sucesso:", tradeId);
        } catch (error) {
            console.error("Erro ao apagar o trade:", error);
            alert("Ocorreu um erro ao tentar apagar o trade.");
        }
    }

    // Função para buscar e mostrar todos os trades
    function fetchAndDisplayAllTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));

        onSnapshot(q, (snapshot) => {
            tableBody.innerHTML = ''; // Limpa a tabela
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="6">Nenhum trade encontrado.</td></tr>';
                return;
            }

            snapshot.forEach(doc => {
                const trade = doc.data();
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', doc.id);

                // Formatar a data para ser mais legível
                const date = trade.dateAdded.toDate().toLocaleString('pt-PT');
                
                // Obter o P&L se o trade estiver fechado
                const pnl = trade.status === 'CLOSED' ? (trade.closeDetails?.pnl || 'N/A') : '-';

                tr.innerHTML = `
                    <td>${trade.asset}</td>
                    <td>${trade.strategyName || 'N/A'}</td>
                    <td><span class="status-badge status-${trade.status.toLowerCase()}">${trade.status}</span></td>
                    <td>${date}</td>
                    <td>${pnl}</td>
                    <td><button class="delete-btn">Apagar</button></td>
                `;

                // Adicionar o evento de clique ao botão de apagar
                const deleteButton = tr.querySelector('.delete-btn');
                deleteButton.addEventListener('click', () => deleteTrade(doc.id));

                tableBody.appendChild(tr);
            });
        });
    }

    // Iniciar a página
    fetchAndDisplayAllTrades();
}

runManagePage();
