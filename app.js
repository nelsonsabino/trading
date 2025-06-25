// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
   getFirestore, collection, addDoc, doc, updateDoc, getDoc, query, where, orderBy, onSnapshot
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






/*----------------------------------------------------------------------- */
/* ------------------------------ STRATEGIES ---------------------------- */
/* ---------------------------------------------------------------------- */


const STRATEGIES = {
    'preco-suporte': {
        name: "Preço em suporte com confluências",
        potentialPhases: [
            { title: "Análise Macro Inicial",
              inputs: [
                  { id: "pot-id-tf", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true },
                  { id: "pot-id-rsi-ltb", label: "RSI furou LTB?", type: "select", options: ["Sim, com força", "Não, mas ainda tem espaço", "Não, está encostado"], required: true }
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
              checks: [
                  { id: "armed-id-tendencia", label: "Preço quebrou LTB ou tem espaço?", required: true },
                  { id: "armed-id-stoch", label: "Stochastic baixo e a cruzar Bullish?", required: true },
                  { id: "armed-id-vah", label: "Preço NÃO está no limite do VAH?", required: true },
                  { id: "armed-id-rhl", label: "RSI está a fazer Higher Lows?", required: true },
                  { id: "armed-id-rsi-ma", label: "RSI > RSI-MA? (Aumenta Prob.)", required: false }, 
                  { id: "armed-id-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                  { id: "armed-id-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
              ],

                inputs: [
                    { id: "armed-id-image-url", label: "Link da Imagem do Gráfico (Fase Armado):", type: "text", required: false } 
            }
        ],
        executionPhases: [
            { title: "Gatilho de Precisão",
              inputs: [{ id: "exec-id-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }],
              checks: [{ id: "exec-id-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true }],
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
                  { id: "pot-is-tf-impulso", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true },
                  { id: "pot-is-rsi-ltb-impulso", label: "RSI furou LTB?", type: "select", options: ["Sim, com força", "Não, mas ainda tem espaço", "Não, está encostado"], required: true }
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
              checks: [
                  { id: "armed-is-stoch-cross", label: "Stochastic TF superior está a cruzar bullish?", required: true },
                  { id: "armed-is-rsi-hl", label: "RSI continua com Higher Lows?", required: true },
                  { id: "armed-is-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                  { id: "armed-is-rsi-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
              ],

          inputs: [
                    { id: "armed-id-image-url", label: "Link da Imagem do Gráfico (Fase Armado):", type: "text", required: false }
            }
        ],
        executionPhases: [
            { title: "Gatilho de Precisão",
              inputs: [{ id: "exec-is-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }],
              checks: [{ id: "exec-is-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true }],
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

function runApp() {
    let currentTrade = {};
    const addModal = { container: document.getElementById('add-opportunity-modal'), form: document.getElementById('add-opportunity-form'), closeBtn: document.getElementById('close-modal-btn'), strategySelect: document.getElementById('strategy-select'), checklistContainer: document.getElementById('dynamic-checklist-container') };
    const armModal = { container: document.getElementById('arm-trade-modal'), form: document.getElementById('arm-trade-form'), closeBtn: document.getElementById('close-arm-trade-modal-btn'), assetNameSpan: document.getElementById('arm-trade-asset-name'), strategyNameSpan: document.getElementById('arm-trade-strategy-name'), checklistContainer: document.getElementById('arm-checklist-container')};
    const execModal = { container: document.getElementById('execution-modal'), form: document.getElementById('execution-form'), closeBtn: document.getElementById('close-execution-modal-btn'), assetNameSpan: document.getElementById('execution-asset-name'), strategyNameSpan: document.getElementById('execution-strategy-name'), checklistContainer: document.getElementById('execution-checklist-container') };
    const closeModalObj = { container: document.getElementById('close-trade-modal'), form: document.getElementById('close-trade-form'), closeBtn: document.getElementById('close-close-trade-modal-btn'), assetNameSpan: document.getElementById('close-trade-asset-name'), exitPriceInput: document.getElementById('exit-price'), pnlInput: document.getElementById('final-pnl') };
    const lightbox = { container: document.getElementById('image-lightbox'), image: document.getElementById('lightbox-image'), closeBtn: document.getElementById('close-lightbox-btn') };
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    const armedTradesContainer = document.getElementById('armed-trades-container');
    const liveTradesContainer = document.getElementById('live-trades-container');

    function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
    function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTrade = {}; } }
    function openArmModal(trade) { currentTrade = { id: trade.id, data: trade.data }; armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases, trade.data.armedSetup); if(armModal.container) armModal.container.style.display = 'flex'; }
    function closeArmModal() { if(armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); currentTrade = {}; } }
    function openExecModal(trade) { currentTrade = { id: trade.id, data: trade.data }; execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if(execModal.container) execModal.container.style.display = 'flex'; }
    function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTrade = {}; } }
    function openCloseTradeModal(trade) { currentTrade = { id: trade.id, data: trade.data }; closeModalObj.assetNameSpan.textContent = trade.data.asset; if(closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
    function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTrade = {}; } }
    function openLightbox(imageUrl) { if (lightbox.container && lightbox.image) { lightbox.image.src = imageUrl; lightbox.container.style.display = 'flex'; } }
    function closeLightbox() { if (lightbox.container) lightbox.container.style.display = 'none'; }

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

    async function handleAddSubmit(e) {
        e.preventDefault();
        const strategyId = addModal.strategySelect.value;
        const checklistData = {};
        STRATEGIES[strategyId].potentialPhases.forEach(p => {
            if (p.inputs) p.inputs.forEach(i => checklistData[i.id] = document.getElementById(i.id).value);
            if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
        });
        const tradeData = {
            asset: document.getElementById('asset').value,
            imageUrl: document.getElementById('image-url').value,
            notes: document.getElementById('notes').value,
            strategyId: strategyId,
            strategyName: STRATEGIES[strategyId].name,
            status: "POTENTIAL",
            potentialSetup: checklistData
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
    async function handleArmSubmit(e) {
        e.preventDefault();
        const checklistData = {};
        const strategy = STRATEGIES[currentTrade.data.strategyId];
        strategy.armedPhases.forEach(p => {
            if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
            if (p.inputs) p.inputs.forEach(i => checklistData[i.id] = document.getElementById(i.id).value); 
            if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
        });
        const updatedTrade = { status: "ARMED", armedSetup: checklistData, dateArmed: new Date() };
        try { await updateDoc(doc(db, 'trades', currentTrade.id), updatedTrade); closeArmModal(); }
        catch (err) { console.error("Erro ao armar o trade:", err); }
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
        const updatedTrade = { status: "LIVE", executionDetails: executionData, dateExecuted: new Date() };
        try { await updateDoc(doc(db, 'trades', currentTrade.id), updatedTrade); closeExecModal(); } 
        catch (err) { console.error("Erro ao executar trade:", err); }
    }
    async function handleCloseSubmit(e) {
        e.preventDefault();
        const closeDetails = {
            exitPrice: closeModalObj.exitPriceInput.value,
            pnl: closeModalObj.pnlInput.value,
            closeReason: document.getElementById('close-reason').value,
            finalNotes: document.getElementById('final-notes').value,
            exitScreenshotUrl: document.getElementById('exit-screenshot-url').value
        };
        try { await updateDoc(doc(db, 'trades', currentTrade.id), { status: "CLOSED", closeDetails: closeDetails, dateClosed: new Date() }); closeCloseTradeModal(); }
        catch (err) { console.error("Erro ao fechar trade:", err); }
    }
    
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
        card.innerHTML = `<button class="card-edit-btn">Editar</button>
            <h3>${trade.data.asset}</h3>
            <p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p>
            <p><strong>Status:</strong> ${trade.data.status}</p>
            <p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;

        // Pega os URLs das imagens das fases POTENTIAL e ARMED
        const potentialImageUrl = trade.data.potentialSetup?.imageUrl; // O seu campo antigo era imageUrl, vamos mantê-lo
        const armedImageUrl = trade.data.armedSetup ? Object.values(trade.data.armedSetup).find(val => typeof val === 'string' && val.startsWith('http')) : null;

        // Mostra a imagem mais recente disponível
        const imageUrlToShow = armedImageUrl || potentialImageUrl;

        if (imageUrlToShow) {
            const img = document.createElement('img');
            img.src = imageUrlToShow;
            img.className = 'card-screenshot';
            img.alt = `Gráfico de ${trade.data.asset}`;
            img.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(imageUrlToShow); });
            card.appendChild(img);
        }

        let actionButton;
        if (trade.data.status === 'POTENTIAL') {
            actionButton = document.createElement('button');
            actionButton.className = 'trigger-btn btn-potential';
            actionButton.textContent = 'Validar Setup (Armar)';
            actionButton.addEventListener('click', () => openArmModal(trade));
        } else if (trade.data.status === 'ARMED') {
            card.classList.add('armed');
            actionButton = document.createElement('button');
            actionButton.className = 'trigger-btn btn-armed';
            actionButton.textContent = 'Executar Gatilho';
            actionButton.addEventListener('click', () => openExecModal(trade));
        } else if (trade.data.status === 'LIVE') {
            card.classList.add('live');
            const details = trade.data.executionDetails;
            if (details) {
                const p = document.createElement('p');
                p.innerHTML = `<strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}`;
                card.appendChild(p);
            }
            actionButton = document.createElement('button');
            actionButton.className = 'trigger-btn btn-live';
            actionButton.textContent = 'Fechar Trade';
            actionButton.addEventListener('click', () => openCloseTradeModal(trade));
        }
        
        if (actionButton) {
            card.appendChild(actionButton);
        }

        card.querySelector('.card-edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            loadAndOpenForEditing(trade.id);
        });

        return card;
    }

    async function loadAndOpenForEditing(tradeId) {
        if (!tradeId) return;
        const docSnap = await getDoc(doc(db, 'trades', tradeId));
        if (docSnap.exists()) {
            const tradeData = docSnap.data();
            currentTrade = { id: tradeId, data: tradeData };
            if (tradeData.status === 'POTENTIAL') {
                openAddModal();
                addModal.strategySelect.value = tradeData.strategyId;
                generateDynamicChecklist(addModal.checklistContainer, STRATEGIES[tradeData.strategyId]?.potentialPhases, tradeData.potentialSetup);
                document.getElementById('asset').value = tradeData.asset;
                document.getElementById('image-url').value = tradeData.imageUrl || '';
                document.getElementById('notes').value = tradeData.notes;
            } else if (tradeData.status === 'ARMED') {
                openArmModal({ id: tradeId, data: tradeData });
                generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[tradeData.strategyId]?.armedPhases, tradeData.armedSetup);
            } else if (tradeData.status === 'LIVE') {
                openExecModal({ id: tradeId, data: tradeData });
            }
        }
    }
    
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
        
        lightbox.closeBtn.addEventListener('click', closeLightbox);
        lightbox.container.addEventListener('click', (e) => { if (e.target.id === 'image-lightbox') closeLightbox(); });

        async function init() {
            populateStrategySelect();
            fetchAndDisplayTrades();
            const tradeIdToEdit = localStorage.getItem('tradeToEdit');
            if (tradeIdToEdit) {
                localStorage.removeItem('tradeToEdit');
                await loadAndOpenForEditing(tradeIdToEdit);
            }
        }
        init();
    });
}
runApp();
