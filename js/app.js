// js/app.js - VERSÃO COM ESTRATÉGIAS DINÂMICAS

import { listenToTrades } from './firebase-service.js';
// --- NOVA IMPORTAÇÃO ---
import { fetchActiveStrategies } from './firebase-service.js';

import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
// --- STRATEGIES.js JÁ NÃO É IMPORTADO ---
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies } from './state.js'; // Importar a nova função de estado

async function initializeApp() {
    // 1. Buscar as estratégias da base de dados
    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies); // Guarda as estratégias no estado global

    // 2. Popular o dropdown com as estratégias buscadas
    populateStrategySelect(strategies);

    // 3. Configurar os listeners que dependem das estratégias
    addModal.strategySelect.addEventListener('change', () => {
        const selectedStrategyId = addModal.strategySelect.value;
        const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            // Encontra a fase 'potential'
            const potentialPhase = selectedStrategy.data.phases.find(p => p.id === 'potential');
            generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
        }
    });

    // 4. Iniciar a escuta de trades (comportamento antigo)
    listenToTrades(displayTrades);
    
    // O resto da inicialização...
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Listeners que não dependem de dados assíncronos
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
    addModal.form.addEventListener('submit', handleAddSubmit);

    armModal.closeBtn.addEventListener('click', closeArmModal);
    armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
    armModal.form.addEventListener('submit', handleArmSubmit);
    
    // ... (restantes listeners de modais) ...

    const modalAssetInput = document.getElementById('asset');
    const modalResultsDiv = document.getElementById('modal-autocomplete-results');
    if (modalAssetInput && modalResultsDiv) {
        setupAutocomplete(modalAssetInput, modalResultsDiv, (selectedPair) => {});
    }

    const urlParams = new URLSearchParams(window.location.search);
    const assetPairFromUrl = urlParams.get('assetPair');
    if (assetPairFromUrl) {
        openAddModal();
        modalAssetInput.value = assetPairFromUrl; 
    }
    
    // Inicia a aplicação
    initializeApp();
});
