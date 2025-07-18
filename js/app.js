// js/app.js - VERSÃO COM DEBUG LOGS

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

async function initializeApp() {
    console.log("Inicializando a aplicação...");
    const strategies = await fetchActiveStrategies();
    console.log("Estratégias carregadas do Firebase:", strategies);
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    listenToTrades(displayTrades);
    
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
    addModal.form.addEventListener('submit', handleAddSubmit);

    addModal.strategySelect.addEventListener('change', () => {
        console.log("Dropdown da estratégia mudou.");
        const strategies = getStrategies(); 
        const selectedStrategyId = addModal.strategySelect.value;
        const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
        
        console.log("Estratégia selecionada:", selectedStrategy);

        if (selectedStrategy && selectedStrategy.data.phases && Array.isArray(selectedStrategy.data.phases)) {
            const potentialPhase = selectedStrategy.data.phases.find(p => p.id === 'potential');
            
            console.log("Fase 'potential' encontrada:", potentialPhase);
            
            if (potentialPhase) {
                generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
            } else {
                console.log("Nenhuma fase 'potential' encontrada para esta estratégia.");
                addModal.checklistContainer.innerHTML = '';
            }
        } else {
            console.log("Estratégia inválida ou sem fases.");
            addModal.checklistContainer.innerHTML = ''; 
        }
    });

    // Restantes listeners...
    armModal.closeBtn.addEventListener('click', closeArmModal);
    armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
    armModal.form.addEventListener('submit', handleArmSubmit);
    execModal.closeBtn.addEventListener('click', closeExecModal);
    execModal.container.addEventListener('click', e => { if (e.target.id === 'execution-modal') closeExecModal(); });
    execModal.form.addEventListener('submit', handleExecSubmit);
    closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
    closeModalObj.container.addEventListener('click', e => { if (e.target.id === 'close-trade-modal') closeCloseTradeModal(); });
    closeModalObj.form.addEventListener('submit', handleCloseSubmit);

    const modalAssetInput = document.getElementById('asset');
    const modalResultsDiv = document.getElementById('modal-autocomplete-results');
    if (modalAssetInput && modalResultsDiv) {
        setupAutocomplete(modalAssetInput, modalResultsDiv, (selectedPair) => {});
    }

    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    if (assetPairFromUrl) {
        openAddModal();
        if(modalAssetInput) modalAssetInput.value = assetPairFromUrl; 
    }
    
    initializeApp();
});
