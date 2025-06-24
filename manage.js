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

    // Função para buscar e mostrar todos os trades (MAIS ROBUSTA)
    function fetchAndDisplayAllTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));

        onSnapshot(q, (snapshot) => {
            console.log(`Recebidos ${snapshot.size} documentos do Firebase.`); // Diagnóstico
            tableBody.innerHTML = ''; 
            
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="6">Nenhum trade encontrado na base de dados.</td></tr>';
                return;
            }

            snapshot.forEach(doc => {
                const trade = doc.data();
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', doc.id);

                // --- Verificações de segurança para cada campo ---
                const asset = trade.asset || 'N/A';
                const strategyName = trade.strategyName || 'N/A';
                const status = trade.status || 'UNKNOWN';
                
                // Verificação segura para a data
                let dateStr = 'Data inválida';
                if (trade.dateAdded && typeof trade.dateAdded.toDate === 'function') {
                    dateStr = trade.dateAdded.toDate().toLocaleString('pt-PT', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                }
                
                // Verificação segura para o P&L
                const pnl = trade.status === 'CLOSED' ? (trade.closeDetails?.pnl || '0.00') : '-';

                tr.innerHTML = `
                    <td>${asset}</td>
                    <td>${strategyName}</td>
                    <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                    <td>${dateStr}</td>
                    <td>${pnl}</td>
                    <td><button class="delete-btn">Apagar</button></td>
                `;

                // Adicionar o evento de clique ao botão de apagar
                const deleteButton = tr.querySelector('.delete-btn');
                if (deleteButton) {
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Previne outros eventos
                        deleteTrade(doc.id);
                    });
                }
                
                tableBody.appendChild(tr);
            });
        }, (error) => {
            // Este bloco corre se houver um erro na ligação com o Firebase (ex: regras, índices)
            console.error("Erro no onSnapshot do Firebase:", error);
            tableBody.innerHTML = `<tr><td colspan="6" style="color: red;">Erro ao carregar os dados. Verifique a consola para mais detalhes.</td></tr>`;
        });
    }

    // Iniciar a página
    fetchAndDisplayAllTrades();
}

runManagePage();
}

runManagePage();
