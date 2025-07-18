// js/app.js - VERSÃO COM LÓGICA DE FASES MAIS ROBUSTA

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

/**
 * Função principal que inicializa a aplicação.
 */
async function initializeApp() {
    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    listenToTrades(displayTrades);
    
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}


// --- PONTO DE ENTRADA DO SCRIPT ---

document.addEventListener('DOMContentLoaded', () => {
    
    // Configura os listeners que não dependem de dados assíncronos
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
    addModal.form.addEventListener('submit', handleAddSubmit);

    addModal.strategySelect.addEventListener('change', () => {
        const strategies = getStrategies(); 
        const selectedStrategyId = addModal.strategySelect.value;
        const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
        
        // Lógica corrigida: assume que a primeira fase é a 'potential'.
        if (selectedStrategy && selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) {
            const potentialPhase = selectedStrategy.data.phases[0]; // Pega o primeiro elemento do array
            
            if (potentialPhase) {
                generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
            } else {
                addModal.checklistContainer.innerHTML = '';
            }
        } else {
            addModal.checklistContainer.innerHTML = ''; 
        }
    });

    // Restantes listeners de modais
    armModal.closeBtn.addEventListener('click', closeArmModal);
    armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
    armModal.form.addEventListener('submit', handleArmSubmit);
    execModal.closeBtn.addEventListener('click', closeExecModal);
    execModal.container.addEventListener('click', e => { if (e.target.id === 'execution-modal') closeExecModal(); });
    execModal.form.addEventListener('submit', handleExecSubmit);
    closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
    closeModalObj.container.addEventListener('click', e => { if (e.target.id === 'close-trade-modal') closeCloseTradeModal(); });
    closeModalObj.form.addEventListener('submit', handleCloseSubmit);

    // Autocomplete
    const modalAssetInput = document.getElementById('asset');
    const modalResultsDiv = document.getElementById('modal-autocomplete-results');
    if (modalAssetInput && modalResultsDiv) {
        setupAutocomplete(modalAssetInput, modalResultsDiv, (selectedPair) => {});
    }

    // Pré-preenchimento via URL
    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    if (assetPairFromUrl) {
        openAddModal();
        if(modalAssetInput) modalAssetInput.value = assetPairFromUrl; 
    }
    
    // Inicia a aplicação (busca dados, etc.)
    initializeApp();
});
