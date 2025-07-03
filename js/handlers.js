// js/handlers.js

// Importações de Módulos
import { addModal } from './dom-elements.js';
import { STRATEGIES } from './strategies.js';
import { GESTAO_PADRAO } from './config.js';
import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance } from './firebase-service.js';
import { getCurrentTrade, setCurrentTrade } from './state.js';
import { closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, openAddModal, openArmModal, openExecModal } from './modals.js';
import { generateDynamicChecklist } from './ui.js';
import { supabase } from './services-init.js'; // Importa o cliente Supabase

export async function handleAddSubmit(e) {
    e.preventDefault();
    
    // 1. Recolha de dados do formulário
    const assetName = document.getElementById('asset').value;
    const strategyId = addModal.strategySelect.value;
    const checklistData = {};
    STRATEGIES[strategyId].potentialPhases.forEach(p => {
        if (p.inputs) p.inputs.forEach(i => checklistData[i.id] = document.getElementById(i.id).value);
        if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
    });
    const tradeData = {
        asset: assetName,
        imageUrl: document.getElementById('image-url').value,
        notes: document.getElementById('notes').value,
        strategyId: strategyId,
        strategyName: STRATEGIES[strategyId].name,
        status: "POTENTIAL",
        potentialSetup: checklistData
    };

    // 2. Lógica de guardar trade no Firebase (Firestore)
    try {
        const currentTrade = getCurrentTrade();
        if (currentTrade.id) {
            tradeData.dateAdded = currentTrade.data.dateAdded;
            await updateTrade(currentTrade.id, tradeData);
        } else {
            tradeData.dateAdded = new Date();
            await addTrade(tradeData);
        }
    } catch (firebaseError) {
        console.error("Erro ao guardar o trade no Firebase:", firebaseError);
        alert("Ocorreu um erro ao guardar os dados do trade.");
        return; // Interrompe a execução se o trade não puder ser guardado
    }


    // 3. Lógica para criar o alarme na Supabase
    const alarmCheckbox = document.getElementById('create-alarm-checkbox');
    if (alarmCheckbox && alarmCheckbox.checked) {
        
        try {
            const alarmPrice = parseFloat(document.getElementById('alarm-price').value);
            if (isNaN(alarmPrice) || alarmPrice <= 0) {
                alert("Por favor, insira um preço de alarme válido.");
                return; 
            }

            const playerId = await window.OneSignal.getUserId();
            if (!playerId) {
                alert("Não foi possível obter a sua subscrição de notificações. Por favor, verifique se permitiu as notificações e recarregue a página.");
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

            const { error } = await supabase.from('alarms').insert([alarmData]);
            if (error) {
                // Lança o erro para ser apanhado pelo bloco catch
                throw error;
            }

        } catch (alarmError) {
            console.error("Erro ao processar e guardar o alarme:", alarmError);
            alert("Ocorreu um erro ao guardar o seu alarme. O trade foi criado, mas o alarme falhou.");
            // Não interrompemos aqui, para que o modal possa fechar mesmo que o alarme falhe.
        }
    }

    // 4. Fechar o modal (agora executa mesmo que o alarme falhe)
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
        if (p.checks) p.checks.forEach(c => checklistData[c.id] = document.getElementById(c.id).checked);
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
