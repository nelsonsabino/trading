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
    onSnapshot} 
import { getStorage, ref, uploadBytes, getDownloadURL }     
from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


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
const storage = getStorage(app);






/* ------------ STRATEGIES ------------ */
const STRATEGIES = {
    'preco-suporte': {
        name: "Preço em suporte com confluências",
        potentialPhases: [
            { title: "Análise Macro Inicial",
              inputs: [
                  { id: "pot-id-tf", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true },
                  { id: "pot-id-rsi-ltb", label: "RSI furou LTB?", type: "select", options: ["Sim, com força", "Não, mas ainda tem espaço", "Não, está encostado"], required: true },
                  { id: "pot-id-screenshot", label: "Screenshot (Potencial):", type: "file", required: false } // Campo de upload
              ],
              checks: [
                  { id: "pot-id-suporte", label: "Preço está em zona de suporte?", required: true },
                  { id: "pot-id-ema50", label: "EMA50 a suportar ou com espaço?", required: true },
                  { id: "pot-id-divergencia", label: "Divergência bullish nos indicadores?", required: false },
                  { id: "pot-id-alarme", label: "Algum alarme foi colocado?", required: true }
              ]
            }
        ],
        armedPhases: [
            { title: "Validação do Setup (no TF de Análise)",
              inputs: [ { id: "armed-id-screenshot", label: "Screenshot (Armado):", type: "file", required: false } ], // Campo de upload
              checks: [
                  { id: "armed-id-tendencia", label: "Preço quebrou LTB ou tem espaço?", required: true },
                  { id: "armed-id-stoch", label: "Stochastic baixo e a cruzar Bullish?", required: true },
                  { id: "armed-id-vah", label: "Preço NÃO está no limite do VAH?", required: true },
                  { id: "armed-id-rhl", label: "RSI está a fazer Higher Lows?", required: true },
                  { id: "armed-id-rsi-ma", label: "RSI > RSI-MA? (Aumenta Prob.)", required: false }, 
                  { id: "armed-id-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                  { id: "armed-id-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
              ]
            }
        ],
        executionPhases: [
            { title: "Gatilho de Precisão",
              inputs: [ { id: "exec-id-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true } ],
              checks: [ { id: "exec-id-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true } ],
              radios: {
                  name: "gatilho-final-id",
                  label: "Escolha o gatilho final:",
                  options: [
                      { id: "exec-id-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                      { id: "exec-id-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" }
                  ]
              }
            }
        ]
    }, 
    'impulso-suporte': {
        name: "Após impulso do suporte",
        potentialPhases: [
            { title: "Análise Macro Inicial",
              inputs: [
                  { id: "pot-is-tf", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true },
                  { id: "pot-is-screenshot", label: "Screenshot (Potencial):", type: "file", required: false } // Campo de upload
              ],                
              checks: [
                  { id: "pot-is-rsi-hl", label: "RSI com Higher Lows?", required: true },
                  { id: "pot-is-fib", label: "Preço acima de Fibonacci 0.382?", required: true },
                  { id: "pot-is-stoch-corr", label: "Stochastic já está a corrigir?", required: true },
                  { id: "pot-is-ema50", label: "Preço acima da EMA50?", required: true },
                  { id: "pot-is-alarm", label: "Alarme foi colocado?", required: true },
                  { id: "pot-is-rsi-ma", label: "RSI acima da RSI-MA?", required: false }
              ]
            }
        ],
        armedPhases: [
            { title: "Critérios para Armar (TF Superior)",
              inputs: [ { id: "armed-is-screenshot", label: "Screenshot (Armado):", type: "file", required: false } ], // Campo de upload
              checks: [
                  { id: "armed-is-stoch-cross", label: "Stochastic TF superior está a cruzar bullish?", required: true },
                  { id: "armed-is-rsi-hl", label: "RSI continua com Higher Lows?", required: true },
                  { id: "armed-is-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                  { id: "armed-is-rsi-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
              ]
            }
        ],
        executionPhases: [
            { title: "Gatilho de Precisão",
              inputs: [ { id: "exec-is-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true } ],
              checks: [ { id: "exec-is-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true } ],
              radios: {
                  name: "gatilho-final-is",
                  label: "Escolha o gatilho final:",
                  options: [
                      { id: "exec-is-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                      { id: "exec-is-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" }
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

// --- FUNÇÃO AUXILIAR PARA UPLOAD DE IMAGEM ---
async function uploadScreenshot(file, tradeId, type) {
    if (!file) return null;
    const storageRef = ref(storage, `screenshots/${tradeId}_${type}_${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Upload concluído. URL: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error(`Erro no upload:`, error);
        return null;
    }
}

function runApp() {
    let currentTrade = {};
    const addModal = { container: document.getElementById('add-opportunity-modal'), form: document.getElementById('add-opportunity-form'), closeBtn: document.getElementById('close-modal-btn'), strategySelect: document.getElementById('strategy-select'), checklistContainer: document.getElementById('dynamic-checklist-container') };
    const armModal = { container: document.getElementById('arm-trade-modal'), form: document.getElementById('arm-trade-form'), closeBtn: document.getElementById('close-arm-trade-modal-btn'), assetNameSpan: document.getElementById('arm-trade-asset-name'), strategyNameSpan: document.getElementById('arm-trade-strategy-name'), checklistContainer: document.getElementById('arm-checklist-container')};
    const execModal = { container: document.getElementById('execution-modal'), form: document.getElementById('execution-form'), closeBtn: document.getElementById('close-execution-modal-btn'), assetNameSpan: document.getElementById('execution-asset-name'), strategyNameSpan: document.getElementById('execution-strategy-name'), checklistContainer: document.getElementById('execution-checklist-container') };
    const closeModalObj = { container: document.getElementById('close-trade-modal'), form: document.getElementById('close-trade-form'), closeBtn: document.getElementById('close-close-trade-modal-btn'), assetNameSpan: document.getElementById('close-trade-asset-name'), exitPriceInput: document.getElementById('exit-price'), pnlInput: document.getElementById('final-pnl') };
    const imageViewerModal = { container: document.getElementById('image-viewer-modal'), closeBtn: document.getElementById('close-image-viewer-modal-btn'), imageElement: document.getElementById('viewer-image') };
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    const armedTradesContainer = document.getElementById('armed-trades-container');
    const liveTradesContainer = document.getElementById('live-trades-container');

    // --- Funções de Controlo dos Modais ---
    function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
    function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTrade = {}; } }
    function openArmModal(trade) { currentTrade = { id: trade.id, data: trade.data }; armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases, trade.data.armedSetup); if(armModal.container) armModal.container.style.display = 'flex'; }
    function closeArmModal() { if(armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); currentTrade = {}; } }
    function openExecModal(trade) { currentTrade = { id: trade.id, data: trade.data }; execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if(execModal.container) execModal.container.style.display = 'flex'; }
    function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTrade = {}; } }
    function openCloseTradeModal(trade) { currentTrade = { id: trade.id, data: trade.data }; closeModalObj.assetNameSpan.textContent = trade.data.asset; if(closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
    function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTrade = {}; } }
    function openImageViewerModal(imageUrl) { imageViewerModal.imageElement.src = imageUrl; if(imageViewerModal.container) imageViewerModal.container.style.display = 'flex'; }
    function closeImageViewerModal() { if(imageViewerModal.container) { imageViewerModal.container.style.display = 'none'; imageViewerModal.imageElement.src = ''; } }
    
    // --- Geradores de Checklist ---
    function createChecklistItem(check, data) {
        const isRequired = check.required === false ? '' : 'required';
        const labelText = check.required === false ? check.label : `${check.label} <span class="required-asterisk">*</span>`;
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
        const labelText = input.required === false ? input.label : `${input.label} <span class="required-asterisk">*</span>`;
        let inputHtml = `<label for="${input.id}">${labelText}</label>`;
        const value = data && data[input.id] ? data[input.id] : '';
        if (input.type === 'select') {
            const optionsHtml = input.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('');
            inputHtml += `<select id="${input.id}" ${isRequired}><option value="">-- Selecione --</option>${optionsHtml}</select>`;
        } else if (input.type === 'file') {
            inputHtml += `<input type="file" id="${input.id}" ${isRequired}>`;
            if (value) inputHtml += `<p class="file-info">Ficheiro atual: <a href="${value}" target="_blank">Ver Imagem</a></p>`;
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

    // --- Handlers de Submissão ---
    async function handleAddSubmit(e) {
        e.preventDefault();
        const strategyId = addModal.strategySelect.value;
        const checklistData = {};
        let screenshotFile = null;
        STRATEGIES[strategyId].potentialPhases.forEach(p => {
            if (p.inputs) p.inputs.forEach(i => {
                if (i.type === 'file') screenshotFile = document.getElementById(i.id)?.files[0];
                else checklistData[i.id] = document.getElementById(i.id).value;
            });
            if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
        });
        const tradeData = {
            asset: document.getElementById('asset').value,
            notes: document.getElementById('notes').value,
            strategyId: strategyId,
            strategyName: STRATEGIES[strategyId].name,
            status: "POTENTIAL",
            potentialSetup: checklistData
        };
        try {
            let docId = currentTrade.id;
            if (!docId) {
                const docRef = await addDoc(collection(db, 'trades'), { ...tradeData, dateAdded: new Date() });
                docId = docRef.id;
            }
            if (screenshotFile) {
                tradeData.potentialSetup.screenshotUrl = await uploadScreenshot(screenshotFile, docId, 'potential');
            } else if (currentTrade.id && currentTrade.data.potentialSetup?.screenshotUrl) {
                tradeData.potentialSetup.screenshotUrl = currentTrade.data.potentialSetup.screenshotUrl;
            }
            await updateDoc(doc(db, 'trades', docId), tradeData);
            closeAddModal();
        } catch (err) { console.error("Erro:", err); }
    }
    async function handleArmSubmit(e) {
        e.preventDefault();
        const checklistData = {};
        let screenshotFile = null;
        const strategy = STRATEGIES[currentTrade.data.strategyId];
        strategy.armedPhases.forEach(p => {
            if (p.inputs) p.inputs.forEach(i => {
                if (i.type === 'file') screenshotFile = document.getElementById(i.id)?.files[0];
                else checklistData[i.id] = document.getElementById(i.id).value;
            });
            if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
        });
        const updatedTradeData = { status: "ARMED", armedSetup: checklistData, dateArmed: new Date() };
        try {
            if (screenshotFile) {
                updatedTradeData.armedSetup.screenshotUrl = await uploadScreenshot(screenshotFile, currentTrade.id, 'armed');
            } else if (currentTrade.data.armedSetup?.screenshotUrl) {
                updatedTradeData.armedSetup.screenshotUrl = currentTrade.data.armedSetup.screenshotUrl;
            }
            await updateDoc(doc(db, 'trades', currentTrade.id), updatedTradeData);
            closeArmModal();
        } catch (err) { console.error("Erro ao armar:", err); }
    }
    async function handleExecSubmit(e) {
        e.preventDefault();
        const executionData = {};
        const strategy = STRATEGIES[currentTrade.data.strategyId];
        const phasesToProcess = [...(strategy.executionPhases || []), GESTAO_PADRAO];
        phasesToProcess.forEach(p => {
            if (p.inputs) p.inputs.forEach(i => executionData[i.id] = document.getElementById(i.id).value);
            if (p.checks) p.checks.forEach(c => executionData[c.id] = document.getElementById(c.id).checked);
            if (p.radios) {
                const checkedRadio = document.querySelector(`input[name="${p.radios.name}"]:checked`);
                executionData[p.radios.name] = checkedRadio ? checkedRadio.value : null;
            }
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
        const closeDetails = { exitPrice: closeModalObj.exitPriceInput.value, pnl: closeModalObj.pnlInput.value, closeReason: document.getElementById('close-reason').value, finalNotes: document.getElementById('final-notes').value };
        try { await updateDoc(doc(db, 'trades', currentTrade.id), { status: "CLOSED", closeDetails: closeDetails, dateClosed: new Date() }); closeCloseTradeModal(); }
        catch (err) { console.error("Erro ao fechar trade:", err); }
    }
    
    // --- Outras Funções ---
    function calculatePnL() {
        const exitPrice = parseFloat(closeModalObj.exitPriceInput.value);
        const entryPrice = parseFloat(currentTrade.data?.executionDetails?.['entry-price']);
        const quantity = parseFloat(currentTrade.data?.executionDetails?.['quantity']);
        if (!isNaN(exitPrice) && !isNaN(entryPrice) && !isNaN(quantity)) {
            closeModalObj.pnlInput.value = ((exitPrice - entryPrice) * quantity).toFixed(2);
        }
    }
    function fetchAndDisplayTrades() {
        const q = query(collection(db, 'trades'), orderBy('dateAdded', 'desc'));
        onSnapshot(q, (snapshot) => {
            potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma oportunidade potencial.</p>';
            armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
            liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
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
    function createTradeCard(trade) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.innerHTML = `<h3>${trade.data.asset}</h3><p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p><p><strong>Status:</strong> ${trade.data.status}</p><p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;
        
        let screenshotUrl = null;
        if (trade.data.status === 'POTENTIAL' && trade.data.potentialSetup?.screenshotUrl) screenshotUrl = trade.data.potentialSetup.screenshotUrl;
        else if (trade.data.status === 'ARMED' && trade.data.armedSetup?.screenshotUrl) screenshotUrl = trade.data.armedSetup.screenshotUrl;

        if (screenshotUrl) {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'screenshot-preview';
            const img = document.createElement('img');
            img.src = screenshotUrl;
            img.alt = `Screenshot (${trade.data.status})`;
            imgDiv.appendChild(img);
            imgDiv.addEventListener('click', () => openImageViewerModal(screenshotUrl));
            card.appendChild(imgDiv);
        }
        
        const actionButtonsDiv = document.createElement('div');
        actionButtonsDiv.className = 'action-buttons-card';

        if (trade.data.status === 'POTENTIAL' || trade.data.status === 'ARMED') {
            const editButton = document.createElement('button');
            editButton.className = 'trigger-btn btn-edit';
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => loadTradeForEditing(trade.id));
            actionButtonsDiv.appendChild(editButton);
        }

        let primaryActionButton;
        if (trade.data.status === 'POTENTIAL') {
            card.style.borderLeftColor = '#6c757d';
            primaryActionButton = document.createElement('button');
            primaryActionButton.className = 'trigger-btn btn-potential';
            primaryActionButton.textContent = 'Validar Setup (Armar)';
            primaryActionButton.addEventListener('click', () => openArmModal(trade));
        } else if (trade.data.status === 'ARMED') {
            card.classList.add('armed');
            primaryActionButton = document.createElement('button');
            primaryActionButton.className = 'trigger-btn btn-armed';
            primaryActionButton.textContent = 'Executar Gatilho';
            primaryActionButton.addEventListener('click', () => openExecModal(trade));
        } else if (trade.data.status === 'LIVE') {
            card.classList.add('live');
            const details = trade.data.executionDetails;
            if (details) card.innerHTML += `<p><strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}</p>`;
            primaryActionButton = document.createElement('button');
            primaryActionButton.className = 'trigger-btn btn-live';
            primaryActionButton.textContent = 'Fechar Trade';
            primaryActionButton.addEventListener('click', () => openCloseTradeModal(trade));
        }
        
        if (primaryActionButton) actionButtonsDiv.appendChild(primaryActionButton);
        card.appendChild(actionButtonsDiv);
        return card;
    }
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

    // --- Ponto de Entrada da Aplicação ---
    document.addEventListener('DOMContentLoaded', () => {
        const addOpportunityBtn = document.getElementById('add-opportunity-btn');

        addOpportunityBtn.addEventListener('click', openAddModal);
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
        
        imageViewerModal.closeBtn.addEventListener('click', closeImageViewerModal);
        imageViewerModal.container.addEventListener('click', e => { if (e.target.id === 'image-viewer-modal') closeImageViewerModal(); });
        
        populateStrategySelect();
        fetchAndDisplayTrades();
        loadTradeForEditing();
    });
}
runApp();
