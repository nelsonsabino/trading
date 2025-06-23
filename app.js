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







const STRATEGIES = {
    'impulso-pos-reset': {
        name: "Impulso Pós-Reset",
        phases: [
            { title: "Fase 0: Filtro de Contexto Cripto", id: "fase0", checks: [
                { id: "check-btc", label: "Direção do BTC favorável?" },
                { id: "check-vol", label: "Volume/Liquidez OK?" }
            ]},
            { title: "Fase 1: Filtro Macro (4h/Diário)", id: "fase1", checks: [
                { id: "check-macro-stoch", label: "Estocástico a resetar?" },
                { id: "check-macro-structure", label: "Estrutura de preço favorável?" }
            ]}
        ]
    },
    'reversao-media': {
        name: "Reversão à Média",
        phases: [
            { title: "Fase A: Contexto de Mercado", id: "faseA", checks: [
                { id: "check-btc-reversao", label: "BTC em range ou estável?" },
                { id: "check-distancia-ema", label: "Preço muito afastado da EMA 21?" }
            ]},
            { title: "Fase B: Sinal de Exaustão", id: "faseB", checks: [
                { id: "check-rsi-extremo", label: "RSI em zona extrema (>70 ou <30)?" },
                { id: "check-candle-reversao", label: "Candle de reversão claro no 1H?" }
            ]}
        ]
    }
};

// --- LÓGICA DA APLICAÇÃO ---

function runApp() {
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const modalContainer = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addOpportunityForm = document.getElementById('add-opportunity-form');
    const watchlistContainer = document.getElementById('watchlist-container');
    const strategySelect = document.getElementById('strategy-select');
    const dynamicChecklistContainer = document.getElementById('dynamic-checklist-container');

    // --- Popular o menu de seleção de estratégias ---
    function populateStrategySelect() {
        for (const strategyId in STRATEGIES) {
            const option = document.createElement('option');
            option.value = strategyId;
            option.textContent = STRATEGIES[strategyId].name;
            strategySelect.appendChild(option);
        }
    }

    // --- Gerar o HTML do checklist dinamicamente ---
    strategySelect.addEventListener('change', () => {
        const selectedStrategyId = strategySelect.value;
        dynamicChecklistContainer.innerHTML = ''; // Limpa o anterior
        if (!selectedStrategyId) return;

        const strategy = STRATEGIES[selectedStrategyId];
        strategy.phases.forEach(phase => {
            const phaseDiv = document.createElement('div');
            phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
            phase.checks.forEach(check => {
                const checkDiv = document.createElement('div');
                checkDiv.className = 'checklist-item';
                checkDiv.innerHTML = `<input type="checkbox" id="${check.id}" name="${check.id}" required><label for="${check.id}">${check.label}</label>`;
                phaseDiv.appendChild(checkDiv);
            });
            dynamicChecklistContainer.appendChild(phaseDiv);
        });
    });
    
    // --- Lógica do Modal ---
    function openModal() { modalContainer.style.display = 'flex'; }
    function closeModal() { modalContainer.style.display = 'none'; }
    addOpportunityBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    // --- Submeter o formulário ---
    addOpportunityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = addOpportunityForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "A Guardar...";

        const selectedStrategyId = strategySelect.value;
        const strategy = STRATEGIES[selectedStrategyId];
        const checklistData = {};

        // Recolher os dados do checklist dinâmico
        strategy.phases.forEach(phase => {
            phase.checks.forEach(check => {
                const checkbox = document.getElementById(check.id);
                checklistData[check.id] = checkbox.checked;
            });
        });

        const newOpportunity = {
            asset: document.getElementById('asset').value,
            notes: document.getElementById('notes').value,
            strategyId: selectedStrategyId,
            strategyName: strategy.name,
            status: "WATCHING",
            dateAdded: new Date(),
            macroSetup: checklistData
        };

        try {
            await addDoc(collection(db, 'trades'), newOpportunity);
            addOpportunityForm.reset();
            dynamicChecklistContainer.innerHTML = ''; // Limpa o formulário
            closeModal();
        } catch (err) {
            console.error("Erro ao guardar:", err);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Guardar na Watchlist";
        }
    });

    // --- Funções de display (modificada para mostrar o nome da estratégia) ---
    function fetchAndDisplayTrades() {
        const q = query(collection(db, 'trades'), where('status', '==', 'WATCHING'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            watchlistContainer.innerHTML = '';
            if (snapshot.empty) {
                watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const trade = doc.data();
                watchlistContainer.appendChild(createTradeCard(trade, doc.id));
            });
        });
    }

    function createTradeCard(trade, id) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.setAttribute('data-id', id);
        card.innerHTML = `
            <h3>${trade.asset}</h3>
            <p style="color: #0056b3; font-weight: bold;">Estratégia: ${trade.strategyName || 'N/A'}</p>
            <p><strong>Status:</strong> ${trade.status}</p>
            <p><strong>Notas:</strong> ${trade.notes}</p>
            <button class="trigger-btn">Procurar Gatilho de Entrada</button>
        `;
        card.querySelector('.trigger-btn').addEventListener('click', () => {
            alert(`A abrir checklist de execução para ${trade.asset}`);
        });
        return card;
    }

    // --- Iniciar a aplicação ---
    populateStrategySelect();
    fetchAndDisplayTrades();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
} else {
    runApp();
}
