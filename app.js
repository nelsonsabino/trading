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





const STRATEGIES = {
    'impulso-pos-reset': {
        name: "Impulso Pós-Reset",
        watchlistPhases: [
            { title: "Fase 0: Filtro de Contexto Cripto", checks: [{ id: "check-btc", label: "Direção do BTC favorável?" },{ id: "check-vol", label: "Volume/Liquidez OK?" }] },
            { title: "Fase 1: Filtro Macro (4h/Diário)", checks: [{ id: "check-macro-stoch", label: "Estocástico a resetar?" },{ id: "check-macro-structure", label: "Estrutura de preço favorável?" }] }
        ],
        executionPhases: [
            { title: "Fase 2: Setup de Entrada (1H)", checks: [{ id: "exec-check-structure-break", label: "Estrutura de curto prazo quebrada?" },{ id: "exec-check-volume-increase", label: "Volume a confirmar?" }] },
            { title: "Fase 3: Gatilho (5m/15m)", checks: [{ id: "exec-check-candle-confirm", label: "Candle de confirmação fechado?" }] },
            { title: "Fase 4: Plano de Gestão", inputs: [
                { id: "entry-price", label: "Preço de Entrada:", type: "number" },
                { id: "stop-loss", label: "Stop-Loss:", type: "number" },
                { id: "take-profit", label: "Take-Profit:", type: "number" },
                { id: "quantity", label: "Quantidade:", type: "number" }
            ]}
        ]
    } 
};

function runApp() {
    // --- SELETORES GLOBAIS ---
    const watchlistContainer = document.getElementById('watchlist-container');
    const liveTradesContainer = document.getElementById('live-trades-container');
    let currentTrade = {}; // Guarda o estado do trade em edição

    // --- LÓGICA DO MODAL "ADICIONAR OPORTUNIDADE" ---
    const addModal = {
        container: document.getElementById('add-opportunity-modal'),
        form: document.getElementById('add-opportunity-form'),
        closeBtn: document.getElementById('close-modal-btn'),
        strategySelect: document.getElementById('strategy-select'),
        checklistContainer: document.getElementById('dynamic-checklist-container')
    };

    function openAddModal() { addModal.container.style.display = 'flex'; }
    function closeAddModal() { addModal.container.style.display = 'none'; }

    function populateStrategySelect() {
        addModal.strategySelect.innerHTML = '<option value="">-- Selecione --</option>';
        for (const id in STRATEGIES) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = STRATEGIES[id].name;
            addModal.strategySelect.appendChild(option);
        }
    }

    function generateWatchlistChecklist() {
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
    }

    async function handleAddSubmit(e) {
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
            closeAddModal();
        } catch (err) { console.error("Erro ao guardar:", err); }
    }

    // --- LÓGICA DO MODAL "EXECUÇÃO DE TRADE" ---
    const execModal = {
        container: document.getElementById('execution-modal'),
        form: document.getElementById('execution-form'),
        closeBtn: document.getElementById('close-execution-modal-btn'),
        assetNameSpan: document.getElementById('execution-asset-name'),
        strategyNameSpan: document.getElementById('execution-strategy-name'),
        checklistContainer: document.getElementById('execution-checklist-container'),
    };

    function openExecModal(trade) {
        currentTrade = { id: trade.id, strategyId: trade.data.strategyId };
        execModal.assetNameSpan.textContent = trade.data.asset;
        execModal.strategyNameSpan.textContent = trade.data.strategyName;
        generateExecutionChecklist(trade.data.strategyId);
        execModal.container.style.display = 'flex';
    }
    function closeExecModal() { execModal.container.style.display = 'none'; }
    
    function generateExecutionChecklist(strategyId) {
        execModal.checklistContainer.innerHTML = '';
        if (!strategyId || !STRATEGIES[strategyId]) return;
        const strategy = STRATEGIES[strategyId];
        strategy.executionPhases.forEach(phase => {
            const phaseDiv = document.createElement('div');
            phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
            if (phase.checks) phase.checks.forEach(check => {
                const checkDiv = document.createElement('div');
                checkDiv.className = 'checklist-item';
                checkDiv.innerHTML = `<input type="checkbox" id="${check.id}" required><label for="${check.id}">${check.label}</label>`;
                phaseDiv.appendChild(checkDiv);
            });
            if (phase.inputs) phase.inputs.forEach(input => {
                const inputDiv = document.createElement('div');
                inputDiv.className = 'input-item';
                inputDiv.innerHTML = `<label for="${input.id}">${input.label}</label><input type="${input.type}" id="${input.id}" step="any" required>`;
                phaseDiv.appendChild(inputDiv);
            });
            execModal.checklistContainer.appendChild(phaseDiv);
        });
    }

    async function handleExecSubmit(e) {
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
            execModal.form.reset();
            closeExecModal();
        } catch (err) { console.error("Erro ao atualizar:", err); }
    }

    // --- LÓGICA DO MODAL "FECHAR TRADE" ---
    const closeModalObj = {
        container: document.getElementById('close-trade-modal'),
        form: document.getElementById('close-trade-form'),
        closeBtn: document.getElementById('close-close-trade-modal-btn'),
        assetNameSpan: document.getElementById('close-trade-asset-name'),
        exitPriceInput: document.getElementById('exit-price'),
        pnlInput: document.getElementById('final-pnl'),
    };

    function openCloseTradeModal(trade) {
        const details = trade.data.executionDetails;
        if (!details || !details['entry-price'] || !details['quantity']) {
            alert("Erro: Faltam detalhes de execução para este trade.");
            return;
        }
        currentTrade = {
            id: trade.id,
            entryPrice: parseFloat(details['entry-price']),
            quantity: parseFloat(details['quantity'])
        };
        closeModalObj.assetNameSpan.textContent = trade.data.asset;
        closeModalObj.container.style.display = 'flex';
    }
    function closeCloseTradeModal() {
        closeModalObj.form.reset();
        closeModalObj.container.style.display = 'none';
    }
    
    function calculatePnL() {
        const exitPrice = parseFloat(closeModalObj.exitPriceInput.value);
        if (!isNaN(exitPrice) && !isNaN(currentTrade.entryPrice) && !isNaN(currentTrade.quantity)) {
            const pnl = (exitPrice - currentTrade.entryPrice) * currentTrade.quantity;
            closeModalObj.pnlInput.value = pnl.toFixed(2);
        } else {
            closeModalObj.pnlInput.value = '';
        }
    }
    
    async function handleCloseSubmit(e) {
        e.preventDefault();
        const closeDetails = {
            exitPrice: closeModalObj.exitPriceInput.value,
            pnl: closeModalObj.pnlInput.value,
            closeReason: document.getElementById('close-reason').value,
            finalNotes: document.getElementById('final-notes').value
        };
        const updatedTrade = {
            status: "CLOSED",
            closeDetails: closeDetails,
            dateClosed: new Date()
        };
        const tradeRef = doc(db, 'trades', currentTrade.id);
        try {
            await updateDoc(tradeRef, updatedTrade);
            closeCloseTradeModal();
        } catch (err) { console.error("Erro ao fechar o trade:", err); }
    }

    // --- LÓGICA DE DISPLAY NO DASHBOARD ---
    function fetchAndDisplayTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada.</p>';
            liveTradesContainer.innerHTML = '<p>Nenhuma operação ativa no momento.</p>';
            let watchingCount = 0, liveCount = 0;
            snapshot.forEach(doc => {
                const trade = { id: doc.id, data: doc.data() };
                const card = createTradeCard(trade);
                if (trade.data.status === 'WATCHING') {
                    if (watchingCount === 0) watchlistContainer.innerHTML = '';
                    watchlistContainer.appendChild(card);
                    watchingCount++;
                } else if (trade.data.status === 'LIVE') {
                    if (liveCount === 0) liveTradesContainer.innerHTML = '';
                    liveTradesContainer.appendChild(card);
                    liveCount++;
                }
            });
        });
    }

    function createTradeCard(trade) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.innerHTML = `<h3>${trade.data.asset}</h3><p>Estratégia: ${trade.data.strategyName}</p><p>Status: ${trade.data.status}</p><p>Notas: ${trade.data.notes || ''}</p>`;
        if (trade.data.status === 'WATCHING') {
            const button = document.createElement('button');
            button.className = 'trigger-btn';
            button.textContent = 'Procurar Gatilho de Entrada';
            button.addEventListener('click', () => openExecModal(trade));
            card.appendChild(button);
        } else if (trade.data.status === 'LIVE') {
            card.classList.add('live');
            const details = trade.data.executionDetails;
            if (details) card.innerHTML += `<p>Entrada: ${details['entry-price']} | SL: ${details['stop-loss']}</p>`;
            const closeButton = document.createElement('button');
            closeButton.className = 'trigger-btn close-trade-btn';
            closeButton.textContent = 'Fechar Trade';
            closeButton.addEventListener('click', () => openCloseTradeModal(trade));
            card.appendChild(closeButton);
        }
        return card;
    }

    // --- INICIALIZAÇÃO DOS EVENTOS ---
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target === addModal.container) closeAddModal(); });
    addModal.form.addEventListener('submit', handleAddSubmit);
    addModal.strategySelect.addEventListener('change', generateWatchlistChecklist);
    
    execModal.closeBtn.addEventListener('click', closeExecModal);
    execModal.container.addEventListener('click', e => { if (e.target === execModal.container) closeExecModal(); });
    execModal.form.addEventListener('submit', handleExecSubmit);

    closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
    closeModalObj.container.addEventListener('click', e => { if (e.target === closeModalObj.container) closeCloseTradeModal(); });
    closeModalObj.form.addEventListener('submit', handleCloseSubmit);
    closeModalObj.exitPriceInput.addEventListener('input', calculatePnL);
    
    populateStrategySelect();
    fetchAndDisplayTrades();
}

runApp();
