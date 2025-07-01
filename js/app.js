// js/app.js - Versão 2.8 (com ui-renderer importado)

import { GESTAO_PADRAO } from './config.js';
import { STRATEGIES } from './strategies.js';
import { listenToTrades, getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';

// Importar todos os seletores DOM
import { 
    addModal, armModal, execModal, closeModalObj, 
    potentialTradesContainer, armedTradesContainer, liveTradesContainer,
    imageModal, modalImg, closeImageModalBtn // Continua a ser usado para o modal de imagem principal
} from './dom-elements.js';

// Importar funções de criação de elementos UI básicos
import { createChecklistItem, createInputItem, createRadioGroup } from './ui-helpers.js';

// NOVO: Importar funções de renderização de UI
import { generateDynamicChecklist, populateStrategySelect } from './ui-renderer.js';




// --- 2. PONTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 3. ESTADO DA APLICAÇÃO ---
    let currentTrade = {};
    
   



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
    const APP_VERSION = '2.8';
    const versionDisplay = document.getElementById('app-version-display');
    // NOTE: Se o script de versão no index.html ainda estiver lá, ele irá sobrepor este.
    // O ideal é ter apenas uma única forma de definir e exibir a versão.
    if (versionDisplay) {
        versionDisplay.textContent = `Versão: ${APP_VERSION}`;
    }
});
