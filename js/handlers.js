// js/handlers.js - VERSÃO COM CAPTURA DE ID PARA DESTAQUE

import { addModal } from './dom-elements.js';
import { GESTAO_PADRAO } from './config.js';
import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance, deleteTrade } from './firebase-service.js';
import { getCurrentTrade, setCurrentTrade, getStrategies, setLastCreatedTradeId } from './state.js';
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

    try {
        const currentTrade = getCurrentTrade();
        if (currentTrade.id) {
            tradeData.dateAdded = currentTrade.data.dateAdded;
            await updateTrade(currentTrade.id, tradeData);
            setLastCreatedTradeId(null);
        } else {
            tradeData.dateAdded = new Date();
            const newTradeId = await addTrade(tradeData);
            setLastCreatedTradeId(newTradeId);
        }
    } catch (error) {
        alert("Ocorreu um erro ao guardar o trade. Verifique a consola.");
        return;
    }
    
    closeAddModal();

    if (shouldRedirect) {
        if (assetName) {
            window.location.href = `alarms-create.html?assetPair=${assetName}`;
        } else {
            window.location.href = 'alarms-create.html';
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

    const imageUrl = document.getElementById('image-url-arm').value;
    const updateData = {
        status: "ARMED",
        armedSetup: checklistData,
        dateArmed: new Date(),
        imageUrl: imageUrl
    };
    await updateTrade(currentTrade.id, updateData);

    closeArmModal();
}

export async function handleExecSubmit(e) {
    e.preventDefault();
    const strategies = getStrategies();
    const currentTrade = getCurrentTrade();
    const executionData = {};

    for (const input of GESTAO_PADRAO.inputs) {
        const element = document.getElementById(input.id);
        if (element) {
            const value = parseFloat(element.value);
            if (input.required && (isNaN(value) || value <= 0)) {
                alert(`Por favor, insira um valor válido e positivo para "${input.label}".`);
                return;
            }
            executionData[input.id] = element.value;
        }
    }

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

    const imageUrl = document.getElementById('image-url-exec').value;
    const updateData = {
        status: "LIVE",
        executionDetails: executionData,
        dateExecuted: new Date(),
        imageUrl: imageUrl
    };
    await updateTrade(currentTrade.id, updateData);

    closeExecModal();
}

export async function handleCloseSubmit(e) {
    e.preventDefault();
    
    const exitPriceValue = parseFloat(document.getElementById('exit-price').value);
    const pnlValue = parseFloat(document.getElementById('final-pnl').value);

    if (isNaN(exitPriceValue) || exitPriceValue <= 0) {
        alert("Por favor, insira um Preço de Saída válido e positivo.");
        return;
    }
    if (isNaN(pnlValue)) {
        alert("Por favor, insira um valor de P&L válido (pode ser negativo).");
        return;
    }

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
    
    const deleteBtn = document.getElementById('delete-opportunity-btn');

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

            if (deleteBtn) {
                deleteBtn.style.display = 'inline-block';
                deleteBtn.onclick = async () => {
                    if (confirm("Tem certeza que quer apagar este trade? Esta ação é irreversível.")) {
                        try {
                            await deleteTrade(trade.id);
                            alert("Trade apagado com sucesso!");
                            closeAddModal();
                        } catch (error) {
                            console.error("Erro ao apagar trade:", error);
                            alert("Ocorreu um erro ao apagar o trade.");
                        }
                    }
                };
            }

        } else if (trade.data.status === 'ARMED') {
            openArmModal(trade);
            if (deleteBtn) deleteBtn.style.display = 'none';
        } else if (trade.data.status === 'LIVE') {
            openExecModal(trade);
            if (deleteBtn) deleteBtn.style.display = 'none';
        } else if (trade.data.status === 'CLOSED') {
            alert("Este trade já está fechado e não pode ser editado através deste modal.");
            closeAddModal();
        }
    }
}

export async function handleRevertStatus(trade, action) {
    const newStatus = action === 'revert-to-potential' ? 'POTENTIAL' : 'ARMED';
    const confirmationMessage = `Tem a certeza que quer reverter o status deste trade para "${newStatus}"?`;

    if (confirm(confirmationMessage)) {
        try {
            await updateTrade(trade.id, { status: newStatus });
        } catch (error) {
            console.error("Erro ao reverter o status do trade:", error);
            alert("Ocorreu um erro ao reverter o status do trade.");
        }
    }
}

// --- INÍCIO DA ALTERAÇÃO: Nova função para reverter de "Potencial" para a watchlist de alarmes ---
export async function handleRevertToWatchlist(trade) {
    const confirmationMessage = `Tem a certeza que quer remover este trade da coluna "Potencial"?\n\nO ativo continuará a ser monitorizado na Watchlist de Alarmes enquanto tiver alarmes ativos.`;
    if (confirm(confirmationMessage)) {
        try {
            await deleteTrade(trade.id);
            // Não é preciso fazer reload, o listener do Firebase/Supabase irá atualizar a UI
        } catch (error) {
            console.error("Erro ao reverter para a watchlist:", error);
            alert("Ocorreu um erro ao reverter o trade para a watchlist.");
        }
    }
}
// --- FIM DA ALTERAÇÃO ---
