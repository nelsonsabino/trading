// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc,
    updateDoc,
    getDoc,  
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





/* ------------ STRATEGIES ------------ */

const STRATEGIES = {
    'impulso-pos-reset': {
        name: "Impulso Pós-Reset",
        potentialPhases: [
            { title: "Fase 0: Filtro de Contexto Cripto", checks: [{ id: "check-btc", label: "Direção do BTC favorável?" }, { id: "check-vol", label: "Volume/Liquidez OK?" }] },
            { title: "Fase 1: Filtro Macro (4h/Diário)", checks: [{ id: "check-macro-stoch", label: "Estocástico a resetar?" }, { id: "check-macro-structure", label: "Estrutura de preço favorável?" }] }
        ],
        armedPhases: [
            { title: "Validação do Setup (4h)", checks: [{ id: "armed-check-rsi-ma", label: "RSI > RSI-MA? (Obrigatório)" }, { id: "armed-check-stoch-cross", label: "Stochastic baixo e a cruzar Bullish? (Obrigatório)" }] }
        ],
        executionPhases: [
            { title: "Fase 2: Setup de Entrada (1H)", checks: [{ id: "exec-check-structure-break", label: "Estrutura de curto prazo quebrada?" }, { id: "exec-check-volume-increase", label: "Volume a confirmar?" }] },
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
    let currentTrade = {};
    
    // --- Seletores do DOM ---
    const addModal = { container: document.getElementById('add-opportunity-modal'), form: document.getElementById('add-opportunity-form'), closeBtn: document.getElementById('close-modal-btn'), strategySelect: document.getElementById('strategy-select'), checklistContainer: document.getElementById('dynamic-checklist-container') };
    const execModal = { container: document.getElementById('execution-modal'), form: document.getElementById('execution-form'), closeBtn: document.getElementById('close-execution-modal-btn'), assetNameSpan: document.getElementById('execution-asset-name'), strategyNameSpan: document.getElementById('execution-strategy-name'), checklistContainer: document.getElementById('execution-checklist-container') };
    const closeModalObj = { container: document.getElementById('close-trade-modal'), form: document.getElementById('close-trade-form'), closeBtn: document.getElementById('close-close-trade-modal-btn'), assetNameSpan: document.getElementById('close-trade-asset-name'), exitPriceInput: document.getElementById('exit-price'), pnlInput: document.getElementById('final-pnl') };
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    const liveTradesContainer = document.getElementById('live-trades-container');
    const armedTradesContainer = document.getElementById('armed-trades-container'); 

    // --- Funções de Controlo dos Modais ---
    function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
    function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTrade = {}; } }
    
    function openExecModal(trade) {
        currentTrade = { id: trade.id, data: trade.data };
        execModal.assetNameSpan.textContent = trade.data.asset;
        execModal.strategyNameSpan.textContent = trade.data.strategyName;
        generateExecutionChecklist(trade.data.strategyId, trade.data.executionDetails);
        if(execModal.container) execModal.container.style.display = 'flex';
    }
    function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTrade = {}; } }

    function openCloseTradeModal(trade) {
        currentTrade = { id: trade.id, data: trade.data };
        closeModalObj.assetNameSpan.textContent = trade.data.asset;
        if(closeModalObj.container) closeModalObj.container.style.display = 'flex';
    }
    function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTrade = {}; } }


    //  Funções de controlo para o modal ARMED ---
    const armModal = {
        container: document.getElementById('arm-trade-modal'),
        form: document.getElementById('arm-trade-form'),
        closeBtn: document.getElementById('close-arm-trade-modal-btn'),
        assetNameSpan: document.getElementById('arm-trade-asset-name'),
        strategyNameSpan: document.getElementById('arm-trade-strategy-name'),
        checklistContainer: document.getElementById('arm-checklist-container'),
    };

    function openArmModal(trade) {
        currentTrade = { id: trade.id, data: trade.data };
        armModal.assetNameSpan.textContent = trade.data.asset;
        armModal.strategyNameSpan.textContent = trade.data.strategyName;
        generateArmedChecklist(trade.data.strategyId);
        if (armModal.container) armModal.container.style.display = 'flex';
    }

    function closeArmModal() {
        if (armModal.container) {
            armModal.container.style.display = 'none';
            armModal.form.reset();
        }
    }

    
    // --- Geradores de Checklist Dinâmicos ---
    function populateStrategySelect() {
        addModal.strategySelect.innerHTML = '<option value="">-- Selecione --</option>';
        for (const id in STRATEGIES) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = STRATEGIES[id].name;
            addModal.strategySelect.appendChild(option);
        }
    }
    
    function generateWatchlistChecklist(strategyId, data = {}) {
        addModal.checklistContainer.innerHTML = '';
        if (!strategyId || !STRATEGIES[strategyId]) return;
        const strategy = STRATEGIES[strategyId];
        strategy.potentialPhases.forEach(phase => { 
            const phaseDiv = document.createElement('div');
            phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
            phase.checks.forEach(check => {
                const isChecked = data[check.id] ? 'checked' : '';
                const item = document.createElement('div');
                item.className = 'checklist-item';
                item.innerHTML = `<input type="checkbox" id="${check.id}" ${isChecked} required><label for="${check.id}">${check.label}</label>`;
                phaseDiv.appendChild(item);
            });
            addModal.checklistContainer.appendChild(phaseDiv);
        });
    }

    function generateExecutionChecklist(strategyId, data = {}) {
        execModal.checklistContainer.innerHTML = '';
        if (!strategyId || !STRATEGIES[strategyId]) return;
        const strategy = STRATEGIES[strategyId];
        strategy.executionPhases.forEach(phase => {
            const phaseDiv = document.createElement('div');
            phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
            if (phase.checks) phase.checks.forEach(check => {
                const isChecked = data && data[check.id] ? 'checked' : '';
                const item = document.createElement('div');
                item.className = 'checklist-item';
                item.innerHTML = `<input type="checkbox" id="${check.id}" ${isChecked} required><label for="${check.id}">${check.label}</label>`;
                phaseDiv.appendChild(item);
            });
            if (phase.inputs) phase.inputs.forEach(input => {
                const value = data && data[input.id] ? data[input.id] : '';
                const item = document.createElement('div');
                item.className = 'input-item';
                item.innerHTML = `<label for="${input.id}">${input.label}</label><input type="${input.type}" id="${input.id}" value="${value}" step="any" required>`;
                phaseDiv.appendChild(item);
            });
            execModal.checklistContainer.appendChild(phaseDiv);
        });
    }


    function generateArmedChecklist(strategyId, data = {}) {
        armModal.checklistContainer.innerHTML = '';
        const strategy = STRATEGIES[strategyId];
        if (!strategy || !strategy.armedPhases) return;

        strategy.armedPhases.forEach(phase => {
            const phaseDiv = document.createElement('div');
            phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
            phase.checks.forEach(check => {
                const isChecked = data[check.id] ? 'checked' : '';
                const item = document.createElement('div');
                item.className = 'checklist-item';
                item.innerHTML = `<input type="checkbox" id="${check.id}" ${isChecked} required><label for="${check.id}">${check.label}</label>`;
                phaseDiv.appendChild(item);
            });
            armModal.checklistContainer.appendChild(phaseDiv);
        });
    }


    
    // --- Handlers de Submissão de Formulários ---
    async function handleAddSubmit(e) {
        e.preventDefault();
        const strategyId = addModal.strategySelect.value;
        const checklistData = {};
        STRATEGIES[strategyId].potentialPhases.forEach(p => p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked));
        const tradeData = {
            asset: document.getElementById('asset').value,
            notes: document.getElementById('notes').value,
            strategyId: strategyId,
            strategyName: STRATEGIES[strategyId].name,
            status: "POTENTIAL",
            potentialSetup: checklistData,
        };
        try {
            if (currentTrade.id) {
                tradeData.dateAdded = currentTrade.data.dateAdded; 
                await updateDoc(doc(db, 'trades', currentTrade.id), tradeData);
            } else {
                tradeData.dateAdded = new Date();
                await addDoc(collection(db, 'trades'), tradeData);
            }
            closeAddModal();
        } catch (err) { console.error("Erro ao guardar/atualizar oportunidade:", err); }
    }

    async function handleExecSubmit(e) {
        e.preventDefault();
        const executionData = {};
        STRATEGIES[currentTrade.data.strategyId].executionPhases.forEach(p => {
            if (p.checks) p.checks.forEach(c => executionData[c.id] = document.getElementById(c.id).checked);
            if (p.inputs) p.inputs.forEach(i => executionData[i.id] = document.getElementById(i.id).value);
        });
        const updatedTrade = { ...currentTrade.data.executionDetails, ...executionData };
        try {
            await updateDoc(doc(db, 'trades', currentTrade.id), {
                status: "LIVE",
                executionDetails: updatedTrade,
                dateExecuted: new Date()
            });
            closeExecModal();
        } catch (err) { console.error("Erro ao executar trade:", err); }
    }

    async function handleCloseSubmit(e) {
        e.preventDefault();
        const closeDetails = {
            exitPrice: closeModalObj.exitPriceInput.value,
            pnl: closeModalObj.pnlInput.value,
            closeReason: document.getElementById('close-reason').value,
            finalNotes: document.getElementById('final-notes').value
        };
        try {
            await updateDoc(doc(db, 'trades', currentTrade.id), {
                status: "CLOSED",
                closeDetails: closeDetails,
                dateClosed: new Date()
            });
            closeCloseTradeModal();
        } catch (err) { console.error("Erro ao fechar trade:", err); }
    }


   async function handleArmSubmit(e) {
        e.preventDefault();
        const checklistData = {};
        const strategy = STRATEGIES[currentTrade.data.strategyId];
        strategy.armedPhases.forEach(p => p.checks.forEach(c => {
            checklistData[c.id] = document.getElementById(c.id).checked;
        }));

        const updatedTrade = {
            status: "ARMED",
            armedSetup: checklistData,
            dateArmed: new Date()
        };

        try {
            await updateDoc(doc(db, 'trades', currentTrade.id), updatedTrade);
            closeArmModal();
        } catch (err) {
            console.error("Erro ao armar o trade:", err);
        }
    }


    
    // --- Lógica de Cálculo de P&L ---
    function calculatePnL() {
        const exitPrice = parseFloat(closeModalObj.exitPriceInput.value);
        const entryPrice = parseFloat(currentTrade.data?.executionDetails?.['entry-price']);
        const quantity = parseFloat(currentTrade.data?.executionDetails?.['quantity']);
        if (!isNaN(exitPrice) && !isNaN(entryPrice) && !isNaN(quantity)) {
            closeModalObj.pnlInput.value = ((exitPrice - entryPrice) * quantity).toFixed(2);
        }
    }
    
    // --- Lógica de Display do Dashboard ---
    function fetchAndDisplayTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            potentialTradesContainer.innerHTML = '<p>Nenhuma oportunidade potencial encontrada.</p>';
            armedTradesContainer.innerHTML = '<p>Nenhum setup armado no momento.</p>';
            liveTradesContainer.innerHTML = '<p>Nenhuma operação ativa no momento.</p>';
            let potentialCount = 0, armedCount = 0, liveCount = 0;
            snapshot.forEach(docSnapshot => {
                const trade = { id: docSnapshot.id, data: docSnapshot.data() };
                const card = createTradeCard(trade);
                if (trade.data.status === 'POTENTIAL') {
                    if (potentialCount === 0) potentialTradesContainer.innerHTML = '';
                    potentialTradesContainer.appendChild(card);
                    potentialCount++;
                } else if (trade.data.status === 'ARMED') {
                    if (armedCount === 0) armedTradesContainer.innerHTML = '';
                    armedTradesContainer.appendChild(card);
                    armedCount++;
                } else if (trade.data.status === 'LIVE') {
                    if (liveCount === 0) liveTradesContainer.innerHTML = '';
                    liveTradesContainer.appendChild(card);
                    liveCount++;
                }
            });
        });
    }

// ---  createTradeCard  ---
    function createTradeCard(trade) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.innerHTML = `<h3>${trade.data.asset}</h3><p style="color: #0056b3; font-weight: bold;">Estratégia: ${trade.data.strategyName || 'N/A'}</p><p><strong>Status:</strong> ${trade.data.status}</p><p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;
        
        if (trade.data.status === 'POTENTIAL') {
            card.style.borderLeftColor = '#6c757d';
            const button = document.createElement('button');
            button.className = 'trigger-btn';
            button.style.backgroundColor = '#ffc107';
            button.style.color = '#212529';
            button.textContent = 'Validar Setup (Armar)';
            button.addEventListener('click', () => openArmModal(trade)); // <--- LIGAÇÃO FEITA
            card.appendChild(button);
        } else if (trade.data.status === 'ARMED') {
            card.classList.add('armed');
            const button = document.createElement('button');
            button.className = 'trigger-btn';
            button.textContent = 'Executar Gatilho';
            button.addEventListener('click', () => openExecModal(trade)); // <--- LIGAÇÃO FEITA
            card.appendChild(button);
        } else if (trade.data.status === 'LIVE') {
            card.classList.add('live');
            const details = trade.data.executionDetails;
            if (details) card.innerHTML += `<p><strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}</p>`;
            const closeButton = document.createElement('button');
            closeButton.className = 'trigger-btn close-trade-btn';
            closeButton.textContent = 'Fechar Trade';
            closeButton.addEventListener('click', () => openCloseTradeModal(trade));
            card.appendChild(closeButton);
        }
        return card;
    }
    

    // --- Lógica para Edição ---
    async function loadTradeForEditing() {
        const tradeId = localStorage.getItem('tradeToEdit');
        if (!tradeId) return;
        localStorage.removeItem('tradeToEdit');
        const docSnap = await getDoc(doc(db, 'trades', tradeId));
        if (docSnap.exists()) {
            const tradeData = docSnap.data();
            if (tradeData.status === 'POTENTIAL') {
                openAddModal();
                addModal.strategySelect.value = tradeData.strategyId;
                addModal.strategySelect.dispatchEvent(new Event('change'));
                document.getElementById('asset').value = tradeData.asset;
                document.getElementById('notes').value = tradeData.notes;
                currentTrade = { id: tradeId, data: tradeData }; 
                setTimeout(() => {
                    if (tradeData.potentialSetup) {
                        Object.keys(tradeData.potentialSetup).forEach(key => {
                            const checkbox = document.getElementById(key);
                            if (checkbox) checkbox.checked = tradeData.potentialSetup[key];
                        });
                    }
                }, 100);
            } else if (tradeData.status === 'LIVE') {
                openExecModal({ id: tradeId, data: tradeData });
            }
        }
    }


    // --- Ponto de Entrada da Aplicação ---
    document.addEventListener('DOMContentLoaded', () => {
        // Seletores locais para os botões e formulários dos modais
        const addOpportunityBtn = document.getElementById('add-opportunity-btn');
        const addModalForm = document.getElementById('add-opportunity-form');
        const addModalStrategySelect = document.getElementById('strategy-select');
        
        const execModalForm = document.getElementById('execution-form');
        
        const armModalForm = document.getElementById('arm-trade-form');
        
        const closeModalForm = document.getElementById('close-trade-form');
        const closeModalExitPriceInput = document.getElementById('exit-price');
        
        // Eventos para o Modal de ADICIONAR
        addOpportunityBtn.addEventListener('click', openAddModal);
        document.getElementById('close-modal-btn').addEventListener('click', closeAddModal);
        document.getElementById('add-opportunity-modal').addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
        addModalForm.addEventListener('submit', handleAddSubmit);
        addModalStrategySelect.addEventListener('change', () => generateWatchlistChecklist(addModalStrategySelect.value));

        // Eventos para o Modal de EXECUTAR
        document.getElementById('close-execution-modal-btn').addEventListener('click', closeExecModal);
        document.getElementById('execution-modal').addEventListener('click', e => { if (e.target.id === 'execution-modal') closeExecModal(); });
        execModalForm.addEventListener('submit', handleExecSubmit);

        // Eventos para o Modal de ARMAR
        document.getElementById('close-arm-trade-modal-btn').addEventListener('click', closeArmModal);
        document.getElementById('arm-trade-modal').addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
        armModalForm.addEventListener('submit', handleArmSubmit);
        
        // Eventos para o Modal de FECHAR
        document.getElementById('close-close-trade-modal-btn').addEventListener('click', closeCloseTradeModal);
        document.getElementById('close-trade-modal').addEventListener('click', e => { if (e.target.id === 'close-trade-modal') closeCloseTradeModal(); });
        closeModalForm.addEventListener('submit', handleCloseSubmit);
        closeModalExitPriceInput.addEventListener('input', calculatePnL);
        
        // Funções de arranque da página
        populateStrategySelect();
        fetchAndDisplayTrades();
        loadTradeForEditing();
    });

} // Fim da função runApp()

// Executa a aplicação
runApp();
