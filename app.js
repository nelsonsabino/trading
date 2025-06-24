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
            { title: "Fase 0: Filtro de Contexto Cripto", checks: [{ id: "check-btc", label: "Direção do BTC favorável?" }, { id: "check-vol", label: "Volume/Liquidez OK?" }] },
            { title: "Fase 1: Filtro Macro (4h/Diário)", checks: [{ id: "check-macro-stoch", label: "Estocástico a resetar?" }, { id: "check-macro-structure", label: "Estrutura de preço favorável?" }] }
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
    const watchlistContainer = document.getElementById('watchlist-container');
    const liveTradesContainer = document.getElementById('live-trades-container');

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
        strategy.watchlistPhases.forEach(phase => {
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

    // --- Handlers de Submissão de Formulários ---
    async function handleAddSubmit(e) {
        e.preventDefault();
        const strategyId = addModal.strategySelect.value;
        const checklistData = {};
        STRATEGIES[strategyId].watchlistPhases.forEach(p => p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked));
        const tradeData = {
            asset: document.getElementById('asset').value,
            notes: document.getElementById('notes').value,
            strategyId: strategyId,
            strategyName: STRATEGIES[strategyId].name,
            status: "WATCHING",
            watchlistSetup: checklistData
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
        const updatedTrade = {
            status: "LIVE",
            executionDetails: executionData,
            dateExecuted: new Date()
        };
        try {
            await updateDoc(doc(db, 'trades', currentTrade.id), updatedTrade);
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
        const updatedTrade = {
            status: "CLOSED",
            closeDetails: closeDetails,
            dateClosed: new Date()
        };
        try {
            await updateDoc(doc(db, 'trades', currentTrade.id), updatedTrade);
            closeCloseTradeModal();
        } catch (err) { console.error("Erro ao fechar trade:", err); }
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
            watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada.</p>';
            liveTradesContainer.innerHTML = '<p>Nenhuma operação ativa no momento.</p>';
            let watchingCount = 0, liveCount = 0;
            snapshot.forEach(docSnapshot => {
                const trade = { id: docSnapshot.id, data: docSnapshot.data() };
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
        card.innerHTML = `<h3>${trade.data.asset}</h3><p style="color: #0056b3; font-weight: bold;">Estratégia: ${trade.data.strategyName || 'N/A'}</p><p><strong>Status:</strong> ${trade.data.status}</p><p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;
        
        if (trade.data.status === 'WATCHING') {
            const button = document.createElement('button');
            button.className = 'trigger-btn';
            button.textContent = 'Procurar Gatilho de Entrada';
            button.addEventListener('click', () => openExecModal(trade));
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

    
    // --- Lógica para Edição vinda da página de gestão ---
    async function loadTradeForEditing() {
        const tradeId = localStorage.getItem('tradeToEdit');
        if (!tradeId) {
            console.log("Nenhum trade para editar.");
            return;
        }

        console.log(`Encontrado pedido para editar o trade com ID: ${tradeId}`);
        // Limpa o item para não editar novamente por engano
        localStorage.removeItem('tradeToEdit');

        try {
            const tradeRef = doc(db, 'trades', tradeId);
            const docSnap = await getDoc(tradeRef);

            if (docSnap.exists()) {
                const tradeData = docSnap.data();
                console.log("Dados do trade a editar:", tradeData);
                
                // Define o trade atual para que a função de submissão saiba que está a editar
                currentTrade = { id: tradeId, data: tradeData }; 
                
                if (tradeData.status === 'WATCHING') {
                    console.log("Status é WATCHING. A abrir modal de adição/edição.");
                    
                    // 1. Abre o modal
                    openAddModal();

                    // 2. Pré-seleciona a estratégia no menu dropdown
                    addModal.strategySelect.value = tradeData.strategyId;

                    // 3. Gera o checklist correspondente a essa estratégia
                    // O 'dispatchEvent' simula uma mudança manual para garantir que o 'ouvinte' corre
                    addModal.strategySelect.dispatchEvent(new Event('change'));

                    // 4. Preenche os campos de texto
                    document.getElementById('asset').value = tradeData.asset;
                    document.getElementById('notes').value = tradeData.notes;

                    // 5. DEPOIS de o checklist ser gerado, marca os checkboxes
                    // Usamos um pequeno timeout para garantir que o DOM foi atualizado
                    setTimeout(() => {
                        if (tradeData.watchlistSetup) {
                            Object.keys(tradeData.watchlistSetup).forEach(key => {
                                const checkbox = document.getElementById(key);
                                if (checkbox) {
                                    checkbox.checked = tradeData.watchlistSetup[key];
                                    console.log(`Checkbox '${key}' marcado como ${checkbox.checked}`);
                                } else {
                                    console.warn(`Checkbox com id '${key}' não encontrado.`);
                                }
                            });
                        }
                    }, 100); // 100ms é geralmente mais que suficiente

                } else if (tradeData.status === 'LIVE') {
                    console.log("Status é LIVE. A abrir modal de execução.");
                    openExecModal({ id: tradeId, data: tradeData });
                }

            } else {
                console.error("Trade para editar não encontrado na base de dados:", tradeId);
                alert("O trade que tentou editar não foi encontrado.");
            }
        } catch (error) {
            console.error("Erro ao carregar o trade para edição:", error);
            alert("Ocorreu um erro ao carregar os dados para edição.");
        }
    }


    

    // --- Ponto de Entrada: Inicializar Eventos e Funções ---
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target === addModal.container) closeAddModal(); });
    addModal.form.addEventListener('submit', handleAddSubmit);
    addModal.strategySelect.addEventListener('change', () => generateWatchlistChecklist(addModal.strategySelect.value));
    
    execModal.closeBtn.addEventListener('click', closeExecModal);
    execModal.container.addEventListener('click', e => { if (e.target === execModal.container) closeExecModal(); });
    execModal.form.addEventListener('submit', handleExecSubmit);

    closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
    closeModalObj.container.addEventListener('click', e => { if (e.target === closeModalObj.container) closeCloseTradeModal(); });
    closeModalObj.form.addEventListener('submit', handleCloseSubmit);
    closeModalObj.exitPriceInput.addEventListener('input', calculatePnL);
    


    // --- Ponto de Entrada: Inicializar Eventos e Funções ---
    function initializeApp() {
        // Inicializa os "ouvintes" de eventos para todos os modais
        document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
        addModal.closeBtn.addEventListener('click', closeAddModal);
        addModal.container.addEventListener('click', e => { if (e.target === addModal.container) closeAddModal(); });
        addModal.form.addEventListener('submit', handleAddSubmit);
        addModal.strategySelect.addEventListener('change', () => generateWatchlistChecklist(addModal.strategySelect.value));
        
        execModal.closeBtn.addEventListener('click', closeExecModal);
        execModal.container.addEventListener('click', e => { if (e.target === execModal.container) closeExecModal(); });
        execModal.form.addEventListener('submit', handleExecSubmit);

        closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
        closeModalObj.container.addEventListener('click', e => { if (e.target === closeModalObj.container) closeCloseTradeModal(); });
        closeModalObj.form.addEventListener('submit', handleCloseSubmit);
        closeModalObj.exitPriceInput.addEventListener('input', calculatePnL);
        
        // Prepara o formulário de "Adicionar"
        populateStrategySelect();

        // Carrega os trades para o dashboard
        fetchAndDisplayTrades();
    }

    // --- Ponto de Entrada Principal da Aplicação ---
    // Espera que o HTML esteja completamente carregado
    document.addEventListener('DOMContentLoaded', () => {
        // Inicializa todos os botões e eventos normais da página
        initializeApp();
        
        // DEPOIS de tudo estar inicializado, verifica se há um pedido de edição
        // Isto garante que as funções como openAddModal já existem quando são chamadas
        loadTradeForEditing();
    });

} // Esta é a chave de fecho da função runApp()

// Executa o código principal
runApp();
