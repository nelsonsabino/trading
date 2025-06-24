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

    'zona-interesse': {
        name: "Preço em Zona de Interesse",
        potentialPhases: [
            { title: "Análise Macro Inicial",
              inputs: [{ id: "pot-zi-tf", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true }],
              checks: [
                  { id: "pot-zi-suporte", label: "Preço está em zona de suporte?", required: true },
                  { id: "pot-zi-ema50", label: "EMA50 a suportar ou com espaço?", required: true },
                  { id: "pot-zi-divergencia", label: "Divergência bullish nos indicadores?", required: false }
              ]
            }
        ],
        armedPhases: [
            { title: "Validação do Setup (no TF de Análise)",
              checks: [
                  { id: "armed-zi-tendencia", label: "Preço quebrou LTB ou tem espaço?", required: true },
                  { id: "armed-zi-stoch", label: "Stochastic baixo e a cruzar Bullish?", required: true },
                  { id: "armed-zi-vah", label: "Preço NÃO está no limite do VAH?", required: true },
                  { id: "armed-zi-rhl", label: "RSI está a fazer Higher Lows?", required: true },
                  { id: "armed-zi-rsi-ma", label: "RSI > RSI-MA? (Aumenta Prob.)", required: false },
                  { id: "armed-zi-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                  { id: "armed-zi-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
              ]
            }
        ],
        executionPhases: [
            { title: "Gatilho de Precisão",
              inputs: [{ id: "exec-zi-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }],
              checks: [{ id: "exec-zi-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true }],
              radios: {
                  name: "gatilho-final",
                  label: "Escolha o gatilho final:",
                  options: [
                      { id: "exec-zi-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                      { id: "exec-zi-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" }
                  ]
              }
            }
        ]
    }
};

const GESTAO_PADRAO = {
    title: "Plano de Gestão", 
    inputs: [
        { id: "entry-price", label: "Preço de Entrada:", type: "number", required: true },
        { id: "stop-loss", label: "Stop-Loss:", type: "number", required: true },
        { id: "take-profit", label: "Take-Profit:", type: "number", required: true },
        { id: "quantity", label: "Quantidade:", type: "number", required: true }
    ]
};

function runApp() {
    let currentTrade = {};
    const addModal = { container: document.getElementById('add-opportunity-modal'), form: document.getElementById('add-opportunity-form'), closeBtn: document.getElementById('close-modal-btn'), strategySelect: document.getElementById('strategy-select'), checklistContainer: document.getElementById('dynamic-checklist-container') };
    const armModal = { container: document.getElementById('arm-trade-modal'), form: document.getElementById('arm-trade-form'), closeBtn: document.getElementById('close-arm-trade-modal-btn'), assetNameSpan: document.getElementById('arm-trade-asset-name'), strategyNameSpan: document.getElementById('arm-trade-strategy-name'), checklistContainer: document.getElementById('arm-checklist-container')};
    const execModal = { container: document.getElementById('execution-modal'), form: document.getElementById('execution-form'), closeBtn: document.getElementById('close-execution-modal-btn'), assetNameSpan: document.getElementById('execution-asset-name'), strategyNameSpan: document.getElementById('execution-strategy-name'), checklistContainer: document.getElementById('execution-checklist-container') };
    const closeModalObj = { container: document.getElementById('close-trade-modal'), form: document.getElementById('close-trade-form'), closeBtn: document.getElementById('close-close-trade-modal-btn'), assetNameSpan: document.getElementById('close-trade-asset-name'), exitPriceInput: document.getElementById('exit-price'), pnlInput: document.getElementById('final-pnl') };
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    const armedTradesContainer = document.getElementById('armed-trades-container');
    const liveTradesContainer = document.getElementById('live-trades-container');

    function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
    function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTrade = {}; } }
    function openArmModal(trade) { currentTrade = { id: trade.id, data: trade.data }; armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases); if(armModal.container) armModal.container.style.display = 'flex'; }
    function closeArmModal() { if(armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); currentTrade = {}; } }
    function openExecModal(trade) { currentTrade = { id: trade.id, data: trade.data }; execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if(execModal.container) execModal.container.style.display = 'flex'; }
    function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTrade = {}; } }
    function openCloseTradeModal(trade) { currentTrade = { id: trade.id, data: trade.data }; closeModalObj.assetNameSpan.textContent = trade.data.asset; if(closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
    function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTrade = {}; } }

    function createChecklistItem(check, data) {
        const isRequired = check.required === false ? '' : '';
        const labelText = check.required === false ? check.label : `<strong>${check.label}</strong>`;
        const isChecked = data && data[check.id] ? 'checked' : '';
        const item = document.createElement('div');
        item.className = 'checklist-item';
        item.innerHTML = `<input type="checkbox" id="${check.id}" ${isChecked} ${isRequired}><label for="${check.id}">${labelText}</label>`;
        return item;
    }
    function createInputItem(input, data) {
        const item = document.createElement('div');
        item.className = 'input-item';
        const isRequired = input.required === false ? '' : 'required';
        const labelText = input.required === false ? input.label : `<strong>${input.label}</strong>`;
        let inputHtml = `<label for="${input.id}">${labelText}</label>`;
        const value = data && data[input.id] ? data[input.id] : '';
        if (input.type === 'select') {
            const optionsHtml = input.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('');
            inputHtml += `<select id="${input.id}" ${isRequired}><option value="">-- Selecione --</option>${optionsHtml}</select>`;
        } else {
            inputHtml += `<input type="${input.type}" id="${input.id}" value="${value}" step="any" ${isRequired}>`;
        }
        item.innerHTML = inputHtml;
        return item;
    }
    function createRadioGroup(radioInfo, data) {
        const group = document.createElement('div');
        group.className = 'radio-group';
        group.innerHTML = `<label><strong>${radioInfo.label}</strong></label>`;
        const checkedValue = data && data[radioInfo.name];
        radioInfo.options.forEach(opt => {
            const isChecked = checkedValue === opt.id ? 'checked' : '';
            const item = document.createElement('div');
            item.className = 'checklist-item';
            item.innerHTML = `<input type="radio" id="${opt.id}" name="${radioInfo.name}" value="${opt.id}" ${isChecked} required><label for="${opt.id}">${opt.label}</label>`;
            group.appendChild(item);
        });
        return group;
    }
    function generateDynamicChecklist(container, phases, data = {}) {
        container.innerHTML = '';
        if (!phases) return;
        phases.forEach(phase => {
            const phaseDiv = document.createElement('div');
            phaseDiv.innerHTML = `<h4>${phase.title}</h4>`;
            if (phase.inputs) phase.inputs.forEach(input => phaseDiv.appendChild(createInputItem(input, data)));
            if (phase.checks) phase.checks.forEach(check => phaseDiv.appendChild(createChecklistItem(check, data)));
            if (phase.radios) phaseDiv.appendChild(createRadioGroup(phase.radios, data));
            container.appendChild(phaseDiv);
        });
    }
    function populateStrategySelect() {
        addModal.strategySelect.innerHTML = '<option value="">-- Selecione --</option>';
        for (const id in STRATEGIES) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = STRATEGIES[id].name;
            addModal.strategySelect.appendChild(option);
        }
    }

    async function handleAddSubmit(e) { /* ... (código existente sem alterações) ... */ }
    async function handleArmSubmit(e) {
        e.preventDefault();
        const checklistData = {};
        const strategy = STRATEGIES[currentTrade.data.strategyId];
        strategy.armedPhases.forEach(p => {
            if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
        });
        const updatedTrade = { status: "ARMED", armedSetup: checklistData, dateArmed: new Date() };
        try { await updateDoc(doc(db, 'trades', currentTrade.id), updatedTrade); closeArmModal(); }
        catch (err) { console.error("Erro ao armar o trade:", err); }
    }
    async function handleExecSubmit(e) { /* ... (código existente sem alterações) ... */ }
    async function handleCloseSubmit(e) { /* ... (código existente sem alterações) ... */ }
    
    function calculatePnL() { /* ... (código existente sem alterações) ... */ }
    function fetchAndDisplayTrades() { /* ... (código existente sem alterações) ... */ }
    function createTradeCard(trade) { /* ... (código existente sem alterações) ... */ }
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
                generateDynamicChecklist(addModal.checklistContainer, STRATEGIES[tradeData.strategyId]?.potentialPhases, tradeData.potentialSetup);
                document.getElementById('asset').value = tradeData.asset;
                document.getElementById('notes').value = tradeData.notes;
                currentTrade = { id: tradeId, data: tradeData };
            } else if (tradeData.status === 'ARMED') {
                openArmModal({ id: tradeId, data: tradeData });
                generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[tradeData.strategyId]?.armedPhases, tradeData.armedSetup);
            } else if (tradeData.status === 'LIVE') {
                openExecModal({ id: tradeId, data: tradeData });
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
        addModal.closeBtn.addEventListener('click', closeAddModal);
        addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
        addModal.form.addEventListener('submit', handleAddSubmit);
        addModal.strategySelect.addEventListener('change', () => generateDynamicChecklist(addModal.checklistContainer, STRATEGIES[addModal.strategySelect.value]?.potentialPhases));

        armModal.closeBtn.addEventListener('click', closeArmModal);
        armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
        armModal.form.addEventListener('submit', handleArmSubmit);
        
        execModal.closeBtn.addEventListener('click', closeExecModal);
        execModal.container.addEventListener('click', e => { if (e.target.id === 'execution-modal') closeExecModal(); });
        execModal.form.addEventListener('submit', handleExecSubmit);

        closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
        closeModalObj.container.addEventListener('click', e => { if (e.target.id === 'close-trade-modal') closeCloseTradeModal(); });
        closeModalObj.form.addEventListener('submit', handleCloseSubmit);
        closeModalObj.exitPriceInput.addEventListener('input', calculatePnL);
        
        populateStrategySelect();
        fetchAndDisplayTrades();
        loadTradeForEditing();
    });
}
runApp();
