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
        watchlistPhases: [
            { title: "Fase 0: Filtro de Contexto Cripto", id: "fase0", checks: [{ id: "check-btc", label: "Direção do BTC favorável?" },{ id: "check-vol", label: "Volume/Liquidez OK?" }] },
            { title: "Fase 1: Filtro Macro (4h/Diário)", id: "fase1", checks: [{ id: "check-macro-stoch", label: "Estocástico a resetar?" },{ id: "check-macro-structure", label: "Estrutura de preço favorável?" }] }
        ],
        executionPhases: [
            { title: "Fase 2: Setup de Entrada (1H)", id: "fase2", checks: [{ id: "exec-check-structure-break", label: "Estrutura de curto prazo quebrada (ex: LTB)?" },{ id: "exec-check-volume-increase", label: "Volume a confirmar a quebra?" }] },
            { title: "Fase 3: Gatilho de Precisão (5m/15m)", id: "fase3", checks: [{ id: "exec-check-candle-confirm", label: "Candle de confirmação fechado?" }] },
            { title: "Fase 4: Plano de Gestão", id: "fase4", inputs: [
                { id: "entry-price", label: "Preço de Entrada:", type: "number" },
                { id: "stop-loss", label: "Stop-Loss:", type: "number" },
                { id: "take-profit", label: "Take-Profit:", type: "number" }
            ]}
        ]
    } // Adicione outras estratégias aqui
};

// --- FUNÇÃO PRINCIPAL DA APLICAÇÃO ---
function runApp() {
    // Seletores do DOM
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const watchlistContainer = document.getElementById('watchlist-container');
    const liveTradesContainer = document.getElementById('live-trades-container');
    
    // Variável de estado para saber qual trade estamos a executar
    let currentExecutingTrade = { id: null, strategyId: null };

    // --- LÓGICA DO MODAL DE "ADICIONAR OPORTUNIDADE" ---
    const addModal = {
        container: document.getElementById('modal-container'),
        form: document.getElementById('add-opportunity-form'),
        closeBtn: document.getElementById('close-modal-btn'),
        strategySelect: document.getElementById('strategy-select'),
        checklistContainer: document.getElementById('dynamic-checklist-container'),

        open: () => addModal.container.style.display = 'flex',
        close: () => addModal.container.style.display = 'none',
        
        init: () => {
            addOpportunityBtn.addEventListener('click', addModal.open);
            addModal.closeBtn.addEventListener('click', addModal.close);
            addModal.container.addEventListener('click', (e) => { if (e.target === addModal.container) addModal.close(); });
            addModal.form.addEventListener('submit', addModal.handleSubmit);
            addModal.strategySelect.addEventListener('change', addModal.generateChecklist);
            addModal.populateSelect();
        },

        populateSelect: () => {
            for (const id in STRATEGIES) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = STRATEGIES[id].name;
                addModal.strategySelect.appendChild(option);
            }
        },

        generateChecklist: () => {
            const strategyId = addModal.strategySelect.value;
            addModal.checklistContainer.innerHTML = '';
            if (!strategyId) return;

            const strategy = STRATEGIES[strategyId];
            strategy.watchlistPhases.forEach(phase => {
                const phaseDiv = document.createElement('div');
                phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
                phase.checks.forEach(check => {
                    const checkDiv = document.createElement('div');
                    checkDiv.className = 'checklist-item';
                    checkDiv.innerHTML = `<input type="checkbox" id="${check.id}" required><label for="${check.id}">${check.label}</label>`;
                    phaseDiv.appendChild(checkDiv);
                });
                addModal.checklistContainer.appendChild(phaseDiv);
            });
        },
        
        handleSubmit: async (e) => {
            e.preventDefault();
            const strategyId = addModal.strategySelect.value;
            const checklistData = {};
            STRATEGIES[strategyId].watchlistPhases.forEach(p => p.checks.forEach(c => {
                checklistData[c.id] = document.getElementById(c.id).checked;
            }));
            
            const newOpportunity = {
                asset: document.getElementById('asset').value,
                notes: document.getElementById('notes').value,
                strategyId: strategyId,
                strategyName: STRATEGIES[strategyId].name,
                status: "WATCHING",
                dateAdded: new Date(),
                watchlistSetup: checklistData
            };
            
            try {
                await addDoc(collection(db, 'trades'), newOpportunity);
                addModal.form.reset();
                addModal.checklistContainer.innerHTML = '';
                addModal.close();
            } catch (err) { console.error("Erro ao guardar:", err); }
        }
    };

    // --- LÓGICA DO MODAL DE "EXECUÇÃO DE TRADE" ---
    const execModal = {
        container: document.getElementById('execution-modal-container'),
        form: document.getElementById('execution-form'),
        closeBtn: document.getElementById('close-execution-modal-btn'),
        assetNameSpan: document.getElementById('execution-asset-name'),
        strategyNameSpan: document.getElementById('execution-strategy-name'),
        checklistContainer: document.getElementById('execution-checklist-container'),
        
        open: (trade) => {
            currentExecutingTrade = { id: trade.id, strategyId: trade.data.strategyId };
            execModal.assetNameSpan.textContent = trade.data.asset;
            execModal.strategyNameSpan.textContent = trade.data.strategyName;
            execModal.generateChecklist(trade.data.strategyId);
            execModal.container.style.display = 'flex';
        },
        close: () => execModal.container.style.display = 'none',
        
        init: () => {
            execModal.closeBtn.addEventListener('click', execModal.close);
            execModal.container.addEventListener('click', (e) => { if (e.target === execModal.container) execModal.close(); });
            execModal.form.addEventListener('submit', execModal.handleSubmit);
        },

        generateChecklist: (strategyId) => {
            execModal.checklistContainer.innerHTML = '';
            if (!strategyId || !STRATEGIES[strategyId]) return;

            const strategy = STRATEGIES[strategyId];
            strategy.executionPhases.forEach(phase => {
                const phaseDiv = document.createElement('div');
                phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
                if(phase.checks) {
                    phase.checks.forEach(check => {
                        const checkDiv = document.createElement('div');
                        checkDiv.className = 'checklist-item';
                        checkDiv.innerHTML = `<input type="checkbox" id="${check.id}" required><label for="${check.id}">${check.label}</label>`;
                        phaseDiv.appendChild(checkDiv);
                    });
                }
                if(phase.inputs) {
                    phase.inputs.forEach(input => {
                        const inputDiv = document.createElement('div');
                        inputDiv.className = 'input-item';
                        inputDiv.innerHTML = `<label for="${input.id}">${input.label}</label><input type="${input.type}" id="${input.id}" step="any" required>`;
                        phaseDiv.appendChild(inputDiv);
                    });
                }
                execModal.checklistContainer.appendChild(phaseDiv);
            });
        },
        
        handleSubmit: async (e) => {
            e.preventDefault();
            const strategy = STRATEGIES[currentExecutingTrade.strategyId];
            const executionData = {};
            strategy.executionPhases.forEach(p => {
                if (p.checks) p.checks.forEach(c => executionData[c.id] = document.getElementById(c.id).checked);
                if (p.inputs) p.inputs.forEach(i => executionData[i.id] = document.getElementById(i.id).value);
            });
            
            const updatedTrade = {
                status: "LIVE",
                executionDetails: executionData,
                dateExecuted: new Date()
            };

            const tradeRef = doc(db, 'trades', currentExecutingTrade.id);
            try {
                await updateDoc(tradeRef, updatedTrade);
                execModal.form.reset();
                execModal.checklistContainer.innerHTML = '';
                execModal.close();
            } catch (err) { console.error("Erro ao atualizar:", err); }
        }
    };
    
    // --- Funções de Display no Dashboard ---
    function fetchAndDisplayTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            watchlistContainer.innerHTML = '';
            liveTradesContainer.innerHTML = '';

            if (snapshot.empty) {
                watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada.</p>';
                liveTradesContainer.innerHTML = '<p>Nenhuma operação ativa no momento.</p>';
            }
            
            snapshot.forEach(doc => {
                const trade = { id: doc.id, data: doc.data() };
                const card = createTradeCard(trade);
                
                if (trade.data.status === 'WATCHING') {
                    watchlistContainer.appendChild(card);
                } else if (trade.data.status === 'LIVE') {
                    liveTradesContainer.appendChild(card);
                }
            });
        });
    }

    function createTradeCard(trade) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.setAttribute('data-id', trade.id);

        card.innerHTML = `
            <h3>${trade.data.asset}</h3>
            <p style="color: #0056b3; font-weight: bold;">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
            <p><strong>Status:</strong> ${trade.data.status}</p>
            <p><strong>Notas:</strong> ${trade.data.notes || ''}</p>
        `;
        
        if (trade.data.status === 'WATCHING') {
            const button = document.createElement('button');
            button.className = 'trigger-btn';
            button.textContent = 'Procurar Gatilho de Entrada';
            button.addEventListener('click', () => execModal.open(trade));
            card.appendChild(button);
        } else if (trade.data.status === 'LIVE') {
            card.classList.add('live');
            const details = trade.data.executionDetails;
            card.innerHTML += `<p><strong>Entrada:</strong> ${details['entry-price']} | <strong>SL:</strong> ${details['stop-loss']}</p>`;
        }
        return card;
    }

    // --- INICIALIZAR TUDO ---
    addModal.init();
    execModal.init();
    fetchAndDisplayTrades();
}

// Iniciar a aplicação
runApp();
