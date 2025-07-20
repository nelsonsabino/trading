// js/handlers.js - VERSÃO COM VALIDAÇÃO DE INPUTS

import { addModal } from './dom-elements.js';
import { GESTAO_PADRAO } from './config.js';
import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';
import { getCurrentTrade, setCurrentTrade, getStrategies } from './state.js';
import { closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, openAddModal, openArmModal, openExecModal } from './modals.js';
import { generateDynamicChecklist } from './ui.js';

export async function handleAddSubmit(e) {
    e.preventDefault();
    
    const redirectToAlarmCheckbox = document.getElementById('redirect-to-alarm-checkbox');
    const shouldRedirect = redirectToAlarmCheckbox.checked;
    const assetInput = document.getElementById('asset');
    const assetName = assetInput.value.trim().toUpperCase();

    const strategies = getStrategies();
    const strategyId = addModal.strategySelect.value;
    const selectedStrategy = strategies.find(s => s.id === strategyId);
    if (!selectedStrategy) {
        alert("Por favor, selecione uma estratégia válida.");
        return;
    }
    
    const checklistData = {};
    const potentialPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) ? selectedStrategy.data.phases[0] : null;
    if (potentialPhase && potentialPhase.items) {
        potentialPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                checklistData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }

    const tradeData = {
        asset: assetName,
        imageUrl: document.getElementById('image-url').value,
        notes: document.getElementById('notes').value,
        strategyId: strategyId,
        strategyName: selectedStrategy.data.name || 'N/A',
        status: "POTENTIAL",
        potentialSetup: checklistData
    };

    const currentTrade = getCurrentTrade();
    if (currentTrade.id) {
        tradeData.dateAdded = currentTrade.data.dateAdded;
        await updateTrade(currentTrade.id, tradeData);
    } else {
        tradeData.dateAdded = new Date();
        await addTrade(tradeData);
    }
    
    closeAddModal();

    if (shouldRedirect) {
        if (assetName) {
            window.location.href = `alarms.html?assetPair=${assetName}`;
        } else {
            window.location.href = 'alarms.html';
        }
    }
}

export async function handleArmSubmit(e) {
    e.preventDefault();
    const strategies = getStrategies();
    const currentTrade = getCurrentTrade();
    
    const selectedStrategy = strategies.find(s => s.id === currentTrade.data.strategyId);
    if (!selectedStrategy) return;

    const checklistData = {};
    const armedPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 1) ? selectedStrategy.data.phases[1] : null;

    if (armedPhase && armedPhase.items) {
        armedPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                checklistData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }

    await updateTrade(currentTrade.id, { status: "ARMED", armedSetup: checklistData, dateArmed: new Date() });
    closeArmModal();
}

export async function handleExecSubmit(e) {
    e.preventDefault();
    const strategies = getStrategies();
    const currentTrade = getCurrentTrade();
    const executionData = {};

    // --- VALIDAÇÃO ADICIONADA ---
    for (const input of GESTAO_PADRAO.inputs) {
        const element = document.getElementById(input.id);
        if (element) {
            const value = parseFloat(element.value);
            if (input.required && (isNaN(value) || value <= 0)) {
                alert(`Por favor, insira um valor válido e positivo para "${input.label}".`);
                return; // Para a execução da função
            }
            executionData[input.id] = element.value;
        }
    }
    // --- FIM DA VALIDAÇÃO ---

    const selectedStrategy = strategies.find(s => s.id === currentTrade.data.strategyId);
    if (!selectedStrategy) return;
    
    const executionPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 2) ? selectedStrategy.data.phases[2] : null;
    
    if (executionPhase && executionPhase.items) {
        executionPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if(element) {
                executionData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }

    await updateTrade(currentTrade.id, { status: "LIVE", executionDetails: executionData, dateExecuted: new Date() });
    closeExecModal();
}

export async function handleCloseSubmit(e) {
    e.preventDefault();
    
    // --- VALIDAÇÃO ADICIONADA ---
    const exitPriceValue = parseFloat(document.getElementById('exit-price').value);
    const pnlValue = parseFloat(document.getElementById('final-pnl').value);

    if (isNaN(exitPriceValue) || exitPriceValue <= 0) {
        alert("Por favor, insira um Preço de Saída válido e positivo.");
        return;
    }
    if (isNaN(pnlValue)) {
        // Esta validação já existia, mas foi mantida pela sua importância.
        alert("Por favor, insira um valor de P&L válido (pode ser negativo).");
        return;
    }
    // --- FIM DA VALIDAÇÃO ---

    const currentTrade = getCurrentTrade();
    const closeDetails = {
        exitPrice: exitPriceValue,
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

export async function loadAndOpenForEditing(tradeId) {
    const strategies = getStrategies();
    const trade = await getTrade(tradeId);
    if (trade) {
        setCurrentTrade(trade);
        const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
        if (!selectedStrategy) return;

        if (trade.data.status === 'POTENTIAL') {
            openAddModal();
            addModal.strategySelect.value = trade.data.strategyId;
            const potentialPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) ? selectedStrategy.data.phases[0] : null;
            generateDynamicChecklist(addModal.checklistContainer, [potentialPhase], trade.data.potentialSetup);
            
            const modalAssetInput = document.getElementById('asset');
            modalAssetInput.value = trade.data.asset;
            document.getElementById('image-url').value = trade.data.imageUrl || '';
            document.getElementById('notes').value = trade.data.notes;

        } else if (trade.data.status === 'ARMED') {
            openArmModal(trade);
        } else if (trade.data.status === 'LIVE') {
            openExecModal(trade);
        }
    }
}
