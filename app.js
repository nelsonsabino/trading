// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


// A sua configuração da web app do Firebase
const firebaseConfig = {
  apiKey: "AIzaSy...xxxxxxxxxxxx", // SUBSTITUA PELA SUA API KEY REAL
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.appspot.com",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};


// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);










// --- CONFIGURAÇÃO DAS ESTRATÉGIAS ---
const STRATEGIES = {
    'impulso-pos-reset': {
        name: "Impulso Pós-Reset",
        phases: [
            {
                title: "Fase 0: Filtro de Contexto Cripto",
                id: "fase0",
                checks: [
                    { id: "check-btc", label: "Direção do BTC favorável?" },
                    { id: "check-vol", label: "Volume/Liquidez OK?" }
                ]
            },
            {
                title: "Fase 1: Filtro Macro (4h/Diário)",
                id: "fase1",
                checks: [
                    { id: "check-macro-stoch", label: "Estocástico a resetar?" },
                    { id: "check-macro-structure", label: "Estrutura de preço favorável?" }
                ]
            }
        ]
    },
    'reversao-media': {
        name: "Reversão à Média",
        phases: [
            {
                title: "Fase A: Contexto de Mercado",
                id: "faseA",
                checks: [
                    { id: "check-btc-reversao", label: "BTC em range ou estável?" },
                    { id: "check-distancia-ema", label: "Preço muito afastado da EMA 21?" }
                ]
            },
            {
                title: "Fase B: Sinal de Exaustão",
                id: "faseB",
                checks: [
                    { id: "check-rsi-extremo", label: "RSI em zona extrema (>70 ou <30)?" },
                    { id: "check-candle-reversao", label: "Candle de reversão claro no 1H?" }
                ]
            }
        ]
    }
    // No futuro, para adicionar uma nova estratégia, basta adicionar um novo objeto aqui.
};

// --- O resto do app.js continua abaixo ---
function runApp() {
    // ...
}









// --- LÓGICA DA APLICAÇÃO ---

function runApp() {
    console.log("runApp() iniciada.");

    // --- Seletores do DOM ---
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const modalContainer = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addOpportunityForm = document.getElementById('add-opportunity-form');
    const watchlistContainer = document.getElementById('watchlist-container');

    if (!addOpportunityBtn || !modalContainer || !closeModalBtn || !addOpportunityForm) {
        console.error("ERRO CRÍTICO: Um ou mais elementos do DOM não foram encontrados. Verifique os IDs no HTML.");
        return;
    }

    // --- LÓGICA DO MODAL (MODIFICADA PARA USAR 'display') ---
    function openModal() {
        console.log("A abrir modal...");
        if (modalContainer) modalContainer.style.display = 'flex';
    }

    function closeModal() {
        console.log("A fechar modal...");
        if (modalContainer) modalContainer.style.display = 'none';
    }

    addOpportunityBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    // --- Submeter o formulário de nova oportunidade ---
    addOpportunityForm.addEventListener('submit', async (e) => {
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
            console.log("Oportunidade guardada com sucesso! ID:", docRef.id);
            addOpportunityForm.reset();
            closeModal(); // Usa a nossa nova função para fechar
        } catch (err) {
            console.error("Erro ao guardar:", err);
            alert("Ocorreu um erro ao guardar. Verifique a consola.");
        } finally {
            submitButton.textContent = "Guardar na Watchlist";
            submitButton.disabled = false;
        }
    });

    // --- Carregar e mostrar as oportunidades do Firebase ---
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

    // --- Função para criar um "Card" de trade ---
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

    // Iniciar a busca de dados
    fetchAndDisplayTrades();
}

// O ponto de entrada da nossa aplicação.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
} else {
    runApp();
}
