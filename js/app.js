// js/app.js (VERSÃO CORRIGIDA)

// ... (todas as suas importações normais)
import { listenToTrades } from './firebase-service.js';
import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { STRATEGIES } from './strategies.js';
import { initializeServices, supabase } from './services-init.js'; // Importamos também o supabase

document.addEventListener('DOMContentLoaded', () => {

    initializeServices();

    // --- Listeners dos Modais ---
    document.getElementById('add-opportunity-btn').addEventListener('click', openAddModal);
    addModal.closeBtn.addEventListener('click', closeAddModal);
    addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
    
    // Ligamos o handleAddSubmit ao evento de submissão. Ele agora SÓ guarda o trade.
    addModal.form.addEventListener('submit', handleAddSubmit);

    // *** A NOVA LÓGICA DO ALARME ESTÁ AQUI ***
    // Adicionamos um listener no PRÓPRIO BOTÃO de submissão.
    const submitBtn = addModal.form.querySelector('button[type="submit"]');
    submitBtn.addEventListener('click', async () => {
        const alarmCheckbox = document.getElementById('create-alarm-checkbox');
        if (alarmCheckbox && alarmCheckbox.checked) {
            const assetName = document.getElementById('asset').value;
            const alarmPrice = parseFloat(document.getElementById('alarm-price').value);

            if (isNaN(alarmPrice) || alarmPrice <= 0) {
                // Não fazemos alert para não ser chato, simplesmente não guardamos.
                console.log("Preço de alarme inválido, alarme não será criado.");
                return;
            }

            // O código abaixo só corre se a checkbox estiver marcada
            const playerId = await window.OneSignal.getUserId();
            if (!playerId) {
                alert("Não foi possível obter a sua subscrição de notificações. Tente recarregar a página.");
                return;
            }

            const alarmData = {
                asset_id: assetName.split('/')[0].toLowerCase().trim(),
                asset_symbol: assetName.split('/')[0].toUpperCase().trim(),
                condition: document.getElementById('alarm-condition').value,
                target_price: alarmPrice,
                onesignal_player_id: playerId,
                status: 'active'
            };

            try {
                const { error } = await supabase.from('alarms').insert([alarmData]);
                if (error) throw error;
                console.log("Alarme guardado na Supabase com sucesso!");
            } catch (error) {
                console.error("Erro ao guardar alarme na Supabase:", error);
            }
        }
    });

    addModal.strategySelect.addEventListener('change', () => generateDynamicChecklist(addModal.checklistContainer, STRATEGIES[addModal.strategySelect.value]?.potentialPhases));

    // ... (o resto do seu app.js continua exatamente igual)
    armModal.closeBtn.addEventListener('click', closeArmModal);
    armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
    armModal.form.addEventListener('submit', handleArmSubmit);
    execModal.closeBtn.addEventListener('click', closeExecModal);
    execModal.container.addEventListener('click', e => { if (e.target.id === 'execution-modal') closeExecModal(); });
    execModal.form.addEventListener('submit', handleExecSubmit);
    closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
    closeModalObj.container.addEventListener('click', e => { if (e.target.id === 'close-trade-modal') closeCloseTradeModal(); });
    closeModalObj.form.addEventListener('submit', handleCloseSubmit);
    const alarmCheckbox = document.getElementById('create-alarm-checkbox');
    const alarmFieldsContainer = document.getElementById('alarm-fields-container');
    if (alarmCheckbox && alarmFieldsContainer) {
        alarmCheckbox.addEventListener('change', () => {
            alarmFieldsContainer.style.display = alarmCheckbox.checked ? 'block' : 'none';
        });
    }
    if (closeImageModalBtn) {
        closeImageModalBtn.addEventListener('click', closeImageModal);
    }
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('card-screenshot')) {
            e.preventDefault();
            if (imageModal && document.getElementById('modal-image')) {
                document.getElementById('modal-image').src = e.target.src;
                imageModal.classList.add('visible');
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
    const APP_VERSION = '3.2';
    const versionDisplay = document.getElementById('app-version-display');
    if (versionDisplay) {
        versionDisplay.textContent = `Versão: ${APP_VERSION}`;
    }
});
