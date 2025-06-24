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
                { id: "take-profit", label: "Take-Profit:", type: "number" },
                { id: "quantity", label: "Quantidade (Ex: 0.5 BTC, 100 ADA):", type: "number" }
            ]}
        ]
    } 
};

function runApp() {
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const watchlistContainer = document.getElementById('watchlist-container');
    const liveTradesContainer = document.getElementById('live-trades-container');
    
    let currentTrade = { id: null, strategyId: null, entryPrice: 0, quantity: 0 };

    const addModal = {
        container: document.getElementById('add-opportunity-modal'),
        form: document.getElementById('add-opportunity-form'),
        closeBtn: document.getElementById('close-modal-btn'),
        strategySelect: document.getElementById('strategy-select'),
        checklistContainer: document.getElementById('dynamic-checklist-container'),
        open: function() { if (this.container) this.container.style.display = 'flex'; },
        close: function() { if (this.container) this.container.style.display = 'none'; },
        init: function() {
            addOpportunityBtn.addEventListener('click', this.open.bind(this));
            this.closeBtn.addEventListener('click', this.close.bind(this));
            this.container.addEventListener('click', (e) => { if (e.target === this.container) this.close(); });
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            this.strategySelect.addEventListener('change', this.generateChecklist.bind(this));
            this.populateSelect();
        },
        populateSelect: function() {
            this.strategySelect.innerHTML = '<option value="">-- Selecione --</option>';
            for (const id in STRATEGIES) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = STRATEGIES[id].name;
                this.strategySelect.appendChild(option);
            }
        },
        generateChecklist: function() {
            const strategyId = this.strategySelect.value;
            this.checklistContainer.innerHTML = '';
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
                this.checklistContainer.appendChild(phaseDiv);
            });
        },
        handleSubmit: async function(e) {
            e.preventDefault();
            const strategyId = this.strategySelect.value;
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
                this.form.reset();
                this.checklistContainer.innerHTML = '';
                this.close();
            } catch (err) { console.error("Erro ao guardar:", err); }
        }
    };

    const execModal = {
        container: document.getElementById('execution-modal'),
        form: document.getElementById('execution-form'),
        closeBtn: document.getElementById('close-execution-modal-btn'),
        assetNameSpan: document.getElementById('execution-asset-name'),
        strategyNameSpan: document.getElementById('execution-strategy-name'),
        checklistContainer: document.getElementById('execution-checklist-container'),
        open: function(trade) {
            currentTrade = { id: trade.id, strategyId: trade.data.strategyId };
            this.assetNameSpan.textContent = trade.data.asset;
            this.strategyNameSpan.textContent = trade.data.strategyName;
            this.generateChecklist(trade.data.strategyId);
            if (this.container) this.container.style.display = 'flex';
        },
        close: function() { if (this.container) this.container.style.display = 'none'; },
        init: function() {
            this.closeBtn.addEventListener('click', this.close.bind(this));
            this.container.addEventListener('click', (e) => { if (e.target === this.container) this.close(); });
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        },
        generateChecklist: function(strategyId) {
            this.checklistContainer.innerHTML = '';
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
                this.checklistContainer.appendChild(phaseDiv);
            });
        },
        handleSubmit: async function(e) {
            e.preventDefault();
            const strategy = STRATEGIES[currentTrade.strategyId];
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
            const tradeRef = doc(db, 'trades', currentTrade.id);
            try {
                await updateDoc(tradeRef, updatedTrade);
                this.form.reset();
                this.checklistContainer.innerHTML = '';
                this.close();
            } catch (err) { console.error("Erro ao atualizar:", err); }
        }
    };

    const closeModalObj = {
        container: document.getElementById('close-trade-modal'),
        form: document.getElementById('close-trade-form'),
        closeBtn: document.getElementById('close-close-trade-modal-btn'),
        assetNameSpan: document.getElementById('close-trade-asset-name'),
        exitPriceInput: document.getElementById('exit-price'),
        pnlInput: document.getElementById('final-pnl'),
        
        open: function(trade) {
            const details = trade.data.executionDetails;
            if (!details || !details['entry-price'] || !details['quantity']) {
                alert("Erro: Faltam detalhes de execução (preço de entrada ou quantidade) para este trade.");
                return;
            }
            currentTrade = { 
                id: trade.id,
                entryPrice: parseFloat(details['entry-price']),
                quantity: parseFloat(details['quantity'])
            };
            this.assetNameSpan.textContent = trade.data.asset;
            if (this.container) this.container.style.display = 'flex';
        },
        close: function() { 
            if (this.container) this.container.style.display = 'none'; 
            this.form.reset();
        },
        
        calculatePnL: function() {
            const exitPrice = parseFloat(this.exitPriceInput.value);
            if (!isNaN(exitPrice) && !isNaN(currentTrade.entryPrice) && !isNaN(currentTrade.quantity)) {
                const pnl = (exitPrice - currentTrade.entryPrice) * currentTrade.quantity;
                this.pnlInput.value = pnl.toFixed(2);
            } else {
                this.pnlInput.value = '';
            }
        },

        init: function() {
            this.closeBtn.addEventListener('click', this.close.bind(this));
            this.container.addEventListener('click', (e) => { if (e.target === this.container) this.close(); });
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            this.exitPriceInput.addEventListener('input', this.calculatePnL.bind(this));
        },
        
        handleSubmit: async function(e) {
            e.preventDefault();
            const closeDetails = {
                exitPrice: this.exitPriceInput.value,
                pnl: this.pnlInput.value,
                closeReason: document.getElementById('close-reason').value,
                finalNotes: document.getElementById('final-notes').value
            };
            const updatedTrade = { status: "CLOSED", closeDetails: closeDetails, dateClosed: new Date() };
            const tradeRef = doc(db, 'trades', currentTrade.id);
            try {
                await updateDoc(tradeRef, updatedTrade);
                this.close();
            } catch (err) { console.error("Erro ao fechar o trade:", err); }
        }
    };
    
    function fetchAndDisplayTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada.</p>';
            liveTradesContainer.innerHTML = '<p>Nenhuma operação ativa no momento.</p>';
            let watchingCount = 0;
            let liveCount = 0;
            snapshot.forEach(doc => {
                const trade = { id: doc.id, data: doc.data() };
                if (trade.data.status === 'WATCHING') {
                    if (watchingCount === 0) watchlistContainer.innerHTML = '';
                    watchlistContainer.appendChild(createTradeCard(trade));
                    watchingCount++;
                } else if (trade.data.status === 'LIVE') {
                    if (liveCount === 0) liveTradesContainer.innerHTML = '';
                    liveTradesContainer.appendChild(createTradeCard(trade));
                    liveCount++;
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
            if (details) {
                card.innerHTML += `<p><strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>SL:</strong> ${details['stop-loss'] || 'N/A'}</p>`;
            }
            const closeButton = document.createElement('button');
            closeButton.className = 'trigger-btn close-trade-btn';
            closeButton.textContent = 'Fechar Trade';
            closeButton.addEventListener('click', () => closeModalObj.open(trade));
            card.appendChild(closeButton);
        }
        return card;
    }

    addModal.init();
    execModal.init();
    closeModalObj.init();
    fetchAndDisplayTrades();
}

runApp();
