// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, collection, addDoc, query, 
    where, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSy...xxxxxxxxxxxx", // A SUA API KEY REAL AQUI
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.appspot.com",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LÓGICA DA APLICAÇÃO ---

function runApp() {
    console.log("runApp() iniciada. O DOM está pronto.");

    // --- Seletores do DOM ---
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const modalContainer = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addOpportunityForm = document.getElementById('add-opportunity-form');
    const watchlistContainer = document.getElementById('watchlist-container');

    // --- DIAGNÓSTICO: VERIFICA SE OS ELEMENTOS FORAM ENCONTRADOS ---
    console.log("Elemento addOpportunityBtn:", addOpportunityBtn);
    console.log("Elemento modalContainer:", modalContainer);
    console.log("Elemento closeModalBtn:", closeModalBtn); // <<<<<< IMPORTANTE

    if (!addOpportunityBtn || !modalContainer || !closeModalBtn || !addOpportunityForm) {
        console.error("ERRO CRÍTICO: Um ou mais elementos do DOM não foram encontrados. Verifique os IDs no HTML.");
        return;
    }

    // --- Lógica do Modal ---
    addOpportunityBtn.addEventListener('click', () => {
        console.log("Botão 'Adicionar' clicado. A abrir modal.");
        modalContainer.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        // <<<<<< ESTA MENSAGEM É A CHAVE. ELA APARECE QUANDO CLICA NO "X"?
        console.log("Botão 'X' de fechar foi CLICADO! A tentar fechar o modal."); 
        modalContainer.classList.add('hidden');
    });

    modalContainer.addEventListener('click', (e) => {
        console.log("Clique detetado na área do modal.");
        if (e.target === modalContainer) {
            console.log("O clique foi no fundo cinzento. A fechar o modal.");
            modalContainer.classList.add('hidden');
        } else {
            console.log("O clique foi num elemento filho do modal, não no fundo.");
        }
    });

    // --- Submeter o formulário de nova oportunidade ---
    addOpportunityForm.addEventListener('submit', async (e) => {
        //... (o resto desta função pode permanecer igual, não é relevante para o bug de fecho)
        e.preventDefault();
        const submitButton = addOpportunityForm.querySelector('button[type="submit"]');
        submitButton.textContent = "A Guardar...";
        submitButton.disabled = true;

        const newOpportunity = {
            asset: document.getElementById('asset').value,
            notes: document.getElementById('notes').value,
            status: "WATCHING",
            dateAdded: new Date(),
            macroSetup: {
                btcFavorable: document.getElementById('check-btc').checked,
                volumeOk: document.getElementById('check-vol').checked,
                stochReset: document.getElementById('check-macro-stoch').checked,
                structureOk: document.getElementById('check-macro-structure').checked
            }
        };

        try {
            const docRef = await addDoc(collection(db, 'trades'), newOpportunity);
            addOpportunityForm.reset();
            modalContainer.classList.add('hidden');
        } catch (err) {
            console.error("Erro ao guardar:", err);
            alert("Ocorreu um erro ao guardar. Verifique a consola.");
        } finally {
            submitButton.textContent = "Guardar na Watchlist";
            submitButton.disabled = false;
        }
    });

    // Função fetchAndDisplayTrades pode permanecer igual
    function fetchAndDisplayTrades() {
        const tradesCollection = collection(db, 'trades');
        const q = query(tradesCollection, where('status', '==', 'WATCHING'), orderBy('dateAdded', 'desc'));

        onSnapshot(q, (snapshot) => {
            if (!watchlistContainer) return;
            watchlistContainer.innerHTML = '';
            if (snapshot.empty) {
                watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada. Adicione uma!</p>';
                return;
            }
            snapshot.forEach(doc => {
                const trade = doc.data();
                const card = createTradeCard(trade, doc.id);
                watchlistContainer.appendChild(card);
            });
        }, (error) => {
            console.error("Erro ao buscar trades:", error);
            if (watchlistContainer) {
                watchlistContainer.innerHTML = '<p style="color: red;">Erro ao carregar os dados. Verifique a consola.</p>';
            }
        });
    }

    function createTradeCard(trade, id) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.setAttribute('data-id', id);
        card.innerHTML = `
            <h3>${trade.asset}</h3>
            <p><strong>Status:</strong> ${trade.status}</p>
            <p><strong>Notas:</strong> ${trade.notes}</p>
            <button class="trigger-btn">Procurar Gatilho de Entrada</button>
        `;
        card.querySelector('.trigger-btn').addEventListener('click', () => {
            alert(`A abrir checklist de execução para ${trade.asset} (ID: ${id}). Próximo passo!`);
        });
        return card;
    }
    
    fetchAndDisplayTrades();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
} else {
    runApp();
}
