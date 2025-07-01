// js/app.js - Versão 2.7 (com ui-helpers importado)

import { GESTAO_PADRAO } from './config.js';
import { STRATEGIES } from './strategies.js';
import { listenToTrades, getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';

// Importar todos os seletores DOM
import { 
    addModal, armModal, execModal, closeModalObj, 
    potentialTradesContainer, armedTradesContainer, liveTradesContainer,
    imageModal, modalImg, closeImageModalBtn
} from './dom-elements.js';

// NOVO: Importar funções de criação de elementos UI
import { createChecklistItem, createInputItem, createRadioGroup } from './ui-helpers.js';



// --- 2. PONTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 3. ESTADO DA APLICAÇÃO ---
    let currentTrade = {};
    
   

    // --- 5. FUNÇÕES DE CONTROLO DE MODAIS (Gerais) ---
    function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
    function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTrade = {}; } }
    function openArmModal(trade) { currentTrade = { id: trade.id, data: trade.data }; armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases, trade.data.armedSetup); if(armModal.container) armModal.container.style.display = 'flex'; }
    function closeArmModal() { if(armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); currentTrade = {}; } }
    function openExecModal(trade) { currentTrade = { id: trade.id, data: trade.data }; execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if(execModal.container) execModal.container.style.display = 'flex'; }
    function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTrade = {}; } }
    function openCloseTradeModal(trade) { currentTrade = { id: trade.id, data: trade.data }; closeModalObj.assetNameSpan.textContent = trade.data.asset; if(closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
    function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTrade = {}; } }

    // --- FUNÇÕES DE GERAÇÃO DE UI (Interface do Utilizador) ---
  
  
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
            // Não adicionamos listener aqui, pois o clique será tratado por delegação de evento (mais abaixo)
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
        if (!potentialTradesContainer) return;
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
    // A função calculatePnL foi removida como solicitado.

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
    
    // --- 9. INICIALIZAÇÃO DA APLICAÇÃO ---
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
    // A linha do event listener para o cálculo do P&L foi removida.

    // NOVO: Event listeners para o modal de imagem
    if (closeImageModalBtn) {
        closeImageModalBtn.addEventListener('click', () => {
            if (imageModal) imageModal.classList.remove('visible');
            if (modalImg) modalImg.src = ''; // Limpa a imagem ao fechar
        });
    }
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            // Fecha o modal apenas se o clique for no overlay (não na imagem)
            if (e.target === imageModal) {
                imageModal.classList.remove('visible');
                if (modalImg) modalImg.src = ''; // Limpa a imagem ao fechar
            }
        });
    }
    // NOVO: Delegacão de evento para abrir modal de imagem ao clicar em .card-screenshot (cards de trades)
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('card-screenshot')) {
            e.preventDefault(); // Previne qualquer comportamento padrão de links ou botões
            if (imageModal && modalImg) {
                modalImg.src = e.target.src;
                imageModal.classList.add('visible');
            } else {
                console.error('Elementos do modal de imagem não encontrados ao clicar em .card-screenshot.');
                // Fallback para abrir numa nova aba se o modal não for encontrado
                window.open(e.target.src, '_blank');
            }
        }
    });

    listenToTrades(displayTrades);
    populateStrategySelect();
    
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }

    // --- LÓGICA DA VERSÃO ---
    const APP_VERSION = '2.7';
    const versionDisplay = document.getElementById('app-version-display');
    // NOTE: Se o script de versão no index.html ainda estiver lá, ele irá sobrepor este.
    // O ideal é ter apenas uma única forma de definir e exibir a versão.
    if (versionDisplay) {
        versionDisplay.textContent = `Versão: ${APP_VERSION}`;
    }
});
