// js/handlers.js 

// CORREÇÃO: Importações separadas e corretas
import { addModal } from './dom-elements.js';
import { STRATEGIES } from './strategies.js';
import { GESTAO_PADRAO } from './config.js';

import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';
import { getCurrentTrade, setCurrentTrade } from './state.js';
import { closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, openAddModal, openArmModal, openExecModal } from './modals.js';
import { generateDynamicChecklist } from './ui.js';

export async function handleAddSubmit(e) {
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
    const currentTrade = getCurrentTrade();
    if (currentTrade.id) {
        tradeData.dateAdded = currentTrade.data.dateAdded;
        await updateTrade(currentTrade.id, tradeData);
    } else {
        tradeData.dateAdded = new Date();
        await addTrade(tradeData);
    }
    closeAddModal();
}

export async function handleArmSubmit(e) {
    e.preventDefault();
    const currentTrade = getCurrentTrade();
    const checklistData = {};
    const strategy = STRATEGIES[currentTrade.data.strategyId];
    strategy.armedPhases.forEach(p => {
        if (p.inputs) p.inputs.forEach(i => checklistData[i.id] = document.getElementById(i.id).value);
        if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
    });
    await updateTrade(currentTrade.id, { status: "ARMED", armedSetup: checklistData, dateArmed: new Date() });
    closeArmModal();
}

export async function handleExecSubmit(e) {
    e.preventDefault();
    const currentTrade = getCurrentTrade();
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
    const trade = await getTrade(tradeId);
    if (trade) {
        setCurrentTrade(trade);
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
