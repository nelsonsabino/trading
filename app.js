// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---

// Importa as funções necessárias do Firebase
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


// A sua configuração da web app do Firebase - SUBSTITUA PELAS SUAS CHAVES REAIS NO SEU FICHEIRO LOCAL
const firebaseConfig = {
  apiKey: "AIzaSy...xxxxxxxxxxxx", // A SUA API KEY REAL AQUI
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.appspot.com",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};


// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LÓGICA DA APLICAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores do DOM ---
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const modalContainer = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addOpportunityForm = document.getElementById('add-opportunity-form');
    const watchlistContainer = document.getElementById('watchlist-container');

    
// --- Lógica do Modal ---
addOpportunityBtn.addEventListener('click', () => {
    modalContainer.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    modalContainer.classList.add('hidden');
});

// NOVO - Fecha o modal se clicar no fundo cinzento
modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
        modalContainer.classList.add('hidden');
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
            // ADICIONAR um documento usando a sintaxe v9
            const docRef = await addDoc(collection(db, 'trades'), newOpportunity);
            console.log("Oportunidade guardada com sucesso! ID:", docRef.id);
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

    // --- Carregar e mostrar as oportunidades do Firebase ---
    function fetchAndDisplayTrades() {
        // Cria a query usando a sintaxe v9
        const tradesCollection = collection(db, 'trades');
        const q = query(tradesCollection, where('status', '==', 'WATCHING'), orderBy('dateAdded', 'desc'));

        // Ouve as alterações em tempo real com onSnapshot
        onSnapshot(q, (snapshot) => {
            watchlistContainer.innerHTML = ''; // Limpa sempre antes de redesenhar
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
            watchlistContainer.innerHTML = '<p style="color: red;">Erro ao carregar os dados. Verifique a consola.</p>';
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
            // Futuramente: window.location.href = `execution.html?id=${id}`;
        });

        return card;
    }

    // Iniciar a aplicação
    fetchAndDisplayTrades();
});
