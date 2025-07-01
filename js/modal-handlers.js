// js/modal-handlers.js

import { addModal, armModal, execModal, closeModalObj } from './dom-elements.js';
import { generateDynamicChecklist } from './ui-renderer.js';
import { STRATEGIES } from './strategies.js';
import { GESTAO_PADRAO } from './config.js';

let currentTradeRef; // Referência ao estado atual do trade

export function initModalHandlers(getCurrentTrade, setCurrentTrade) {
    currentTradeRef = { getCurrentTrade, setCurrentTrade };
}

export function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
export function closeAddModal() { if(addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; currentTradeRef.setCurrentTrade({}); } }
export function openArmModal(trade) { currentTradeRef.setCurrentTrade({ id: trade.id, data: trade.data }); armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases, trade.data.armedSetup); if(armModal.container) armModal.container.style.display = 'flex'; }
export function closeArmModal() { if(armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); currentTradeRef.setCurrentTrade({}); } }
export function openExecModal(trade) { currentTradeRef.setCurrentTrade({ id: trade.id, data: trade.data }); execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if(execModal.container) execModal.container.style.display = 'flex'; }
export function closeExecModal() { if(execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); currentTradeRef.setCurrentTrade({}); } }
export function openCloseTradeModal(trade) { currentTradeRef.setCurrentTrade({ id: trade.id, data: trade.data }); closeModalObj.assetNameSpan.textContent = trade.data.asset; if(closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
export function closeCloseTradeModal() { if(closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); currentTradeRef.setCurrentTrade({}); } }
