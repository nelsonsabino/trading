// js/app.js (VERSÃO FINAL E CORRIGIDA, INDEPENDENTE)

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { listenToTrades } from './firebase-service.js';
import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { STRATEGIES } from './strategies.js';
import { setupAutocomplete } from './utils.js';

// Cria uma instância local do cliente Supabase para esta página
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {

    // --- Listeners dos Modais ---
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

    // Lógica para ativar o autocomplete no modal de adicionar trade
    const modalAssetInput = document.getElementById('asset');
    const modalResultsDiv = document.getElementById('modal-autocomplete-results');
    if (modalAssetInput && modalResultsDiv) {
        // Passamos a nossa instância local da supabase para a função
        setupAutocomplete(supabase, modalAssetInput, modalResultsDiv, (coin) => {
            if (coin) {
                modalAssetInput.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
            }
        });
    }

    // Lógica para ler o URL e pré-preencher o modal
    const urlParams = new URLSearchParams(window.location.search);
    const assetSymbolFromUrl = urlParams.get('assetSymbol');
    if (assetSymbolFromUrl && modalAssetInput) {
        openAddModal();
        modalAssetInput.value = assetSymbolFromUrl;
        modalAssetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Listeners do Modal de Imagem
    if (closeImageModalBtn) { closeImageModalBtn.addEventListener('click', closeImageModal); }
    if (imageModal) { imageModal.addEventListener('click', (e) => { if (e.target === imageModal) { closeImageModal(); } }); }
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('card-screenshot')) {
            e.preventDefault();
            if (imageModal && document.getElementById('modal-image')) {
                document.getElementById('modal-image').src = e.target.src;
                imageModal.classList.add('visible');
            }
        }
    });

    // Inicialização da Aplicação Principal
    listenToTrades(displayTrades);
    populateStrategySelect();
    
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }

    // --- LÓGICA DA VERSÃO ---
    const APP_VERSION = '6.3 (Refatoração Final)';
    const versionDisplay = document.getElementById('app-version-display');
    if (versionDisplay) {
        versionDisplay.textContent = `Versão: ${APP_VERSION}`;
    }
});
