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
    if (!tableBody) {
        console.error("Elemento 'trades-table-body' não encontrado. Verifique o seu HTML.");
        return;
    }

    // Função para apagar um trade
    async function deleteTrade(tradeId) {
        if (!confirm("Tem a certeza que quer apagar este trade? Esta ação é irreversível.")) {
            return;
        }
        try {
            await deleteDoc(doc(db, 'trades', tradeId));
            console.log("Trade apagado com sucesso:", tradeId);
        } catch (error) {
            console.error("Erro ao apagar o trade:", error);
            alert("Ocorreu um erro ao tentar apagar o trade.");
        }
    }
    
    // Função para redirecionar para edição
    function editTrade(tradeId) {
        localStorage.setItem('tradeToEdit', tradeId);
        window.location.href = 'index.html';
    }

    // Função para buscar e mostrar todos os trades
    function fetchAndDisplayAllTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));

        onSnapshot(q, (snapshot) => {
            tableBody.innerHTML = ''; 
            
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Nenhum trade encontrado na base de dados.</td></tr>';
                return;
            }

            snapshot.forEach(docSnapshot => {
                const trade = docSnapshot.data();
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', docSnapshot.id);

                const asset = trade.asset || 'N/A';
                const strategyName = trade.strategyName || 'N/A';
                const status = trade.status || 'UNKNOWN';
                
                let dateStr = 'Data inválida';
                if (trade.dateAdded && typeof trade.dateAdded.toDate === 'function') {
                    dateStr = trade.dateAdded.toDate().toLocaleString('pt-PT', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                    });
                }
                
                const pnl = trade.status === 'CLOSED' ? (trade.closeDetails?.pnl || '0.00') : '-';
                const pnlClass = pnl > 0 ? 'positive-pnl' : (pnl < 0 ? 'negative-pnl' : '');

                tr.innerHTML = `
                    <td><strong>${asset}</strong></td>
                    <td>${strategyName}</td>
                    <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                    <td>${dateStr}</td>
                    <td class="${pnlClass}">${pnl}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn edit-btn">Editar</button>
                            <button class="btn delete-btn">Apagar</button>
                        </div>
                    </td>
                `;

                const editButton = tr.querySelector('.edit-btn');
                const deleteButton = tr.querySelector('.delete-btn');
                
                if (editButton) editButton.addEventListener('click', () => editTrade(docSnapshot.id));
                if (deleteButton) deleteButton.addEventListener('click', () => deleteTrade(docSnapshot.id));
                
                tableBody.appendChild(tr);
            });
        }, (error) => {
            console.error("Erro no onSnapshot do Firebase:", error);
            tableBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Erro ao carregar os dados. Verifique a consola.</td></tr>`;
        });
    }

    // Iniciar a página
    fetchAndDisplayAllTrades();
}

runManagePage();
