import { GESTAO_PADRAO } from './config.js';
import { STRATEGIES } from './strategies.js';
import { listenToTrades, getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';

// A função wrapper que cria o escopo correto, como no seu ficheiro antigo
function runApp() {

    // --- 3. ESTADO DA APLICAÇÃO ---
    let currentTrade = {};
    
    // --- 4. SELETORES DO DOM (serão preenchidos quando o DOM estiver pronto) ---
    let addModal, armModal, execModal, closeModalObj, lightbox;
    let potentialTradesContainer, armedTradesContainer, liveTradesContainer;








    // --- 5. FUNÇÕES DE CONTROLO DE MODAIS E LIGHTBOX ---
function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTrade = {}; } }
function openArmModal(trade) { currentTrade = { id: trade.id, data: trade.data }; armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases, trade.data.armedSetup); if(armModal.container) armModal.container.style.display = 'flex'; }
function closeArmModal() { if(armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); currentTrade = {}; } }
function openExecModal(trade) { currentTrade = { id: trade.id, data: trade.data }; execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if(execModal.container) execModal.container.style.display = 'flex'; }
function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTrade = {}; } }
function openCloseTradeModal(trade) { currentTrade = { id: trade.id, data: trade.data }; closeModalObj.assetNameSpan.textContent = trade.data.asset; if(closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTrade = {}; } }

// --- VERSÃO COM A CORREÇÃO DE TIMING (setTimeout) ---
function openLightbox(imageUrl) {
    setTimeout(() => {
        const lightboxContainer = document.getElementById('image-lightbox');
        const lightboxImage = document.getElementById('lightbox-image');

        if (lightboxContainer && lightboxImage) {
            lightboxImage.src = imageUrl;
            lightboxContainer.style.display = 'flex';
        }
    }, 0); // O '0' coloca esta função no final da fila de execução atual.
}

function closeLightbox() {
    setTimeout(() => {
        const lightboxContainer = document.getElementById('image-lightbox');
        if (lightboxContainer) {
            lightboxContainer.style.display = 'none';
        }
    }, 0);
}



    

    

    // --- 6. FUNÇÕES DE GERAÇÃO DE UI (Interface do Utilizador) ---
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
            if (phase.exampleImageUrl) {
                const exampleContainer = document.createElement('div');
                exampleContainer.className = 'example-image-container';
                exampleContainer.innerHTML = `<p>Exemplo Visual:</p><img src="${phase.exampleImageUrl}" alt="Exemplo para ${phase.title}">`;
                exampleContainer.querySelector('img').addEventListener('click', (e) => { e.stopPropagation(); openLightbox(phase.exampleImageUrl); });
                phaseDiv.appendChild(exampleContainer);
            }
            const titleEl = document.createElement('h4');
            titleEl.textContent = phase.title;
            phaseDiv.appendChild(titleEl);
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
    function createTradeCard(trade) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.innerHTML = `<button class="card-edit-btn">Editar</button><h3>${trade.data.asset}</h3><p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p><p><strong>Status:</strong> ${trade.data.status}</p><p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;
        const potentialImageUrl = trade.data.imageUrl;
        let armedImageUrl = null;
        if (trade.data.armedSetup) {
            const key = Object.keys(trade.data.armedSetup).find(k => k.includes('image-url'));
            if (key) armedImageUrl = trade.data.armedSetup[key];
        }
        const imageUrlToShow = armedImageUrl || potentialImageUrl;
        if (imageUrlToShow) {
            const img = document.createElement('img');
            img.src = imageUrlToShow;
            img.className = 'card-screenshot';
            img.alt = `Gráfico de ${trade.data.asset}`;
            // A LINHA ORIGINAL E FUNCIONAL, DE VOLTA AO SEU LUGAR
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
            if (details) { const p = document.createElement('p'); p.innerHTML = `<strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}`; card.appendChild(p); }
            actionButton = document.createElement('button');
            actionButton.className = 'trigger-btn btn-live';
            actionButton.textContent = 'Fechar Trade';
            actionButton.addEventListener('click', () => openCloseTradeModal(trade));
        }
        if (actionButton) card.appendChild(actionButton);
        card.querySelector('.card-edit-btn').addEventListener('click', (e) => { e.stopPropagation(); loadAndOpenForEditing(trade.id); });
        return card;
    }
    function displayTrades(trades) {
        potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma oportunidade potencial.</p>';
        armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
        liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
        let potentialCount = 0, armedCount = 0, liveCount = 0;
        trades.forEach(trade => {
            const card = createTradeCard(trade);
            if (trade.data.status === 'POTENTIAL') { if (potentialCount === 0) potentialTradesContainer.innerHTML = ''; potentialTradesContainer.appendChild(card); potentialCount++; }
            else if (trade.data.status === 'ARMED') { if (armedCount === 0) armedTradesContainer.innerHTML = ''; armedTradesContainer.appendChild(card); armedCount++; }
            else if (trade.data.status === 'LIVE') { if (liveCount === 0) liveTradesContainer.innerHTML = ''; liveTradesContainer.appendChild(card); liveCount++; }
        });
    }



// --- 7. FUNÇÕES DE LÓGICA DE DADOS (HANDLERS) ---
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
    if (currentTrade.id) {
        tradeData.dateAdded = currentTrade.data.dateAdded;
        await updateTrade(currentTrade.id, tradeData);
    } else {
        tradeData.dateAdded = new Date();
        await addTrade(tradeData);
    }
    closeAddModal();
}

async function handleArmSubmit(e) {
    e.preventDefault();
    const checklistData = {};
    const strategy = STRATEGIES[currentTrade.data.strategyId];
    strategy.armedPhases.forEach(p => {
        if (p.inputs) p.inputs.forEach(i => checklistData[i.id] = document.getElementById(i.id).value);
        if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
    });
    await updateTrade(currentTrade.id, { status: "ARMED", armedSetup: checklistData, dateArmed: new Date() });
    closeArmModal();
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
    await updateTrade(currentTrade.id, { status: "LIVE", executionDetails: executionData, dateExecuted: new Date() });
    closeExecModal();
}

async function handleCloseSubmit(e) {
    e.preventDefault();
    const pnlValue = parseFloat(document.getElementById('final-pnl').value);
    if (isNaN(pnlValue)) {
        alert("Por favor, insira um valor de P&L válido.");
        return;
    }
    const closeDetails = {
        exitPrice: document.getElementById('exit-price').value,
        pnl: pnlValue,
        closeReason: document.getElementById('close-reason').value,
        finalNotes: document.getElementById('final-notes').value,
        exitScreenshotUrl: document.getElementById('exit-screenshot-url').value
    };
    try {
        await closeTradeAndUpdateBalance(currentTrade.id, closeDetails);
        closeCloseTradeModal();
    } catch (error) {
        console.error("Erro ao fechar trade (UI):", error);
        alert("Ocorreu um erro ao fechar o trade. Verifique a consola para mais detalhes.");
    }
}

function calculatePnL() {
    const exitPrice = parseFloat(closeModalObj.exitPriceInput.value);
    const entryPrice = parseFloat(currentTrade.data?.executionDetails?.['entry-price']);
    const quantity = parseFloat(currentTrade.data?.executionDetails?.['quantity']);
    if (!isNaN(exitPrice) && !isNaN(entryPrice) && !isNaN(quantity)) {
        closeModalObj.pnlInput.value = ((exitPrice - entryPrice) * quantity).toFixed(2);
    }
}

    
// --- 8. LÓGICA DE EDIÇÃO ---
async function loadAndOpenForEditing(tradeId) {
    const trade = await getTrade(tradeId);
    if (trade) {
        currentTrade = trade;
        if (trade.data.status === 'POTENTIAL') {
            openAddModal();
            addModal.strategySelect.value = trade.data.strategyId;
            generateDynamicChecklist(addModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.potentialPhases, trade.data.potentialSetup);
            document.getElementById('asset').value = trade.data.asset;
            document.getElementById('image-url').value = trade.data.imageUrl || '';
            document.getElementById('notes').value = trade.data.notes;
        } else if (trade.data.status === 'ARMED') {
            openArmModal(trade);
        } else if (trade.data.status === 'LIVE') {
            openExecModal(trade);
        }
    }
}


    
    // --- 9. INICIALIZAÇÃO DA APLICAÇÃO (DENTRO DO DOMContentLoaded) ---
    document.addEventListener('DOMContentLoaded', () => {
        // Preenche as variáveis dos seletores do DOM
        addModal = { container: document.getElementById('add-opportunity-modal'), form: document.getElementById('add-opportunity-form'), closeBtn: document.getElementById('close-modal-btn'), strategySelect: document.getElementById('strategy-select'), checklistContainer: document.getElementById('dynamic-checklist-container') };
        armModal = { container: document.getElementById('arm-trade-modal'), form: document.getElementById('arm-trade-form'), closeBtn: document.getElementById('close-arm-trade-modal-btn'), assetNameSpan: document.getElementById('arm-trade-asset-name'), strategyNameSpan: document.getElementById('arm-trade-strategy-name'), checklistContainer: document.getElementById('arm-checklist-container')};
        execModal = { container: document.getElementById('execution-modal'), form: document.getElementById('execution-form'), closeBtn: document.getElementById('close-execution-modal-btn'), assetNameSpan: document.getElementById('execution-asset-name'), strategyNameSpan: document.getElementById('execution-strategy-name'), checklistContainer: document.getElementById('execution-checklist-container') };
        closeModalObj = { container: document.getElementById('close-trade-modal'), form: document.getElementById('close-trade-form'), closeBtn: document.getElementById('close-close-trade-modal-btn'), assetNameSpan: document.getElementById('close-trade-asset-name'), exitPriceInput: document.getElementById('exit-price'), pnlInput: document.getElementById('final-pnl') };
        lightbox = { container: document.getElementById('image-lightbox'), image: document.getElementById('lightbox-image'), closeBtn: document.getElementById('close-lightbox-btn') };
        potentialTradesContainer = document.getElementById('potential-trades-container');
        armedTradesContainer = document.getElementById('armed-trades-container');
        liveTradesContainer = document.getElementById('live-trades-container');

        // Anexa os event listeners
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
        lightbox.closeBtn.addEventListener('click', closeLightbox);
        lightbox.container.addEventListener('click', (e) => { if (e.target.id === 'image-lightbox') closeLightbox(); });

        // Inicia a aplicação
        listenToTrades(displayTrades);
        populateStrategySelect();
        const tradeIdToEdit = localStorage.getItem('tradeToEdit');
        if (tradeIdToEdit) {
            localStorage.removeItem('tradeToEdit');
            loadAndOpenForEditing(tradeIdToEdit);
        }
    });
}

// Chama a função principal para iniciar tudo
runApp();
