// js/handlers.js - VERSÃO COM CORREÇÃO NO REDIRECIONAMENTO PARA ALARMES

import { addModal } from './dom-elements.js';
import { GESTAO_PADRAO } from './config.js';
import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';
import { getCurrentTrade, setCurrentTrade, getStrategies } from './state.js';
import { closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, openAddModal, openArmModal, openExecModal } from './modals.js';
import { generateDynamicChecklist } from './ui.js';

export async function handleAddSubmit(e) {
    e.preventDefault();
    
    // --- CORREÇÃO APLICADA AQUI ---
    // 1. Captura o estado da checkbox e o nome do ativo ANTES de qualquer outra coisa.
    const redirectToAlarmCheckbox = document.getElementById('redirect-to-alarm-checkbox');
    const shouldRedirect = redirectToAlarmCheckbox.checked;
    const assetInput = document.getElementById('asset');
    const assetName = assetInput.value.trim().toUpperCase();

    // 2. Pega as estratégias e processa o formulário
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

    // 3. Guarda os dados no Firebase
    const currentTrade = getCurrentTrade();
    if (currentTrade.id) {
        tradeData.dateAdded = currentTrade.data.dateAdded;
        await updateTrade(currentTrade.id, tradeData);
    } else {
        tradeData.dateAdded = new Date();
        await addTrade(tradeData);
    }
    
    // 4. Fecha o modal (o que vai limpar a checkbox)
    closeAddModal();

    // 5. AGORA, verifica a variável que guardámos no início
    if (shouldRedirect) {
        if (assetName) {
            window.location.href = `alarms.html?assetPair=${assetName}`;
        } else {
            window.location.href = 'alarms.html';
        }
    }
}

// O resto das funções permanece inalterado
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
    
    const selectedStrategy = strategies.find(s => s.id === currentTrade.data.strategyId);
    if (!selectedStrategy) return;

    const executionData = {};
    const executionPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 2) ? selectedStrategy.data.phases[2] : null;
    
    if (executionPhase && executionPhase.items) {
        executionPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if(element) {
                executionData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }

    GESTAO_PADRAO.inputs.forEach(input => {
        const element = document.getElementById(input.id);
        if(element) {
            executionData[input.id] = element.value;
        }
    });

    await updateTrade(currentTrade.id, { status: "LIVE", executionDetails: executionData, dateExecuted: new Date() });
    closeExecModal();
}

export async function handleCloseSubmit(e) {
    e.preventDefault();
    const currentTrade = getCurrentTrade();
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
