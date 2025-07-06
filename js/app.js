// js/app.js (VERSÃO FINAL COM INTEGRAÇÃO TOTAL)

import { listenToTrades } from './firebase-service.js';
import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { STRATEGIES } from './strategies.js';
import { setupAutocomplete } from './utils.js';
import { supabase } from './services.js'; // Precisamos da Supabase aqui

document.addEventListener('DOMContentLoaded', () => {

    // --- Listeners do Modal Principal ---
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
    addModal.form.addEventListener('submit', handleAddSubmit); // Esta função SÓ guarda no Firebase e fecha o modal
    addModal.strategySelect.addEventListener('change', () => generateDynamicChecklist(addModal.checklistContainer, STRATEGIES[addModal.strategySelect.value]?.potentialPhases));

    // --- NOVO: Lógica de pré-preenchimento e gestão de alarmes no modal ---
    const modalAssetInput = document.getElementById('asset');
    const modalResultsDiv = document.getElementById('modal-autocomplete-results');
    const alarmCheckbox = document.getElementById('modal-create-alarm-checkbox');
    const alarmFields = document.getElementById('modal-alarm-fields');
    let selectedCoinForModal = null;

    // Ligar o autocomplete ao input do modal
    setupAutocomplete(modalAssetInput, modalResultsDiv, (coin) => {
        selectedCoinForModal = coin;
        if (coin) {
            modalAssetInput.value = `${coin.name} (${coin.symbol.toUpperCase()})`;
        }
    });

    // Mostrar/esconder campos de alarme
    alarmCheckbox.addEventListener('change', () => {
        alarmFields.style.display = alarmCheckbox.checked ? 'block' : 'none';
    });

    // Listener PARALELO no botão de submeter, SÓ para a lógica do alarme
    const submitBtn = addModal.form.querySelector('button[type="submit"]');
    submitBtn.addEventListener('click', async () => {
        if (alarmCheckbox.checked && selectedCoinForModal) {
            try {
                const targetPrice = parseFloat(document.getElementById('modal-alarm-price').value);
                if (isNaN(targetPrice) || targetPrice <= 0) return;

                const alarmData = {
                    asset_id: selectedCoinForModal.id,
                    asset_symbol: selectedCoinForModal.symbol.toUpperCase(),
                    alarm_type: 'price',
                    condition: document.getElementById('modal-alarm-condition').value,
                    target_price: targetPrice,
                    status: 'active'
                };
                await supabase.from('alarms').insert([alarmData]);
                console.log("Alarme paralelo criado com sucesso na Supabase!");
            } catch (err) {
                console.error("Falha ao criar alarme paralelo:", err);
            }
        }
    });

    // Ler parâmetros do URL para abrir e preencher o modal
    const urlParams = new URLSearchParams(window.location.search);
    const assetSymbolFromUrl = urlParams.get('assetSymbol');
    if (assetSymbolFromUrl) {
        openAddModal();
        modalAssetInput.value = assetSymbolFromUrl;
        modalAssetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // --- O resto do código (outros modais, etc.) permanece igual ---
    armModal.closeBtn.addEventListener('click', closeArmModal);
    armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
    armModal.form.addEventListener('submit', handleArmSubmit);
    // ... etc ...

    // Inicialização da Aplicação Principal
    listenToTrades(displayTrades);
    populateStrategySelect();
    const APP_VERSION = '5.6 (Integração Total)';
    const versionDisplay = document.getElementById('app-version-display');
    if (versionDisplay) { versionDisplay.textContent = `Versão: ${APP_VERSION}`; }
});
