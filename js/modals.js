// js/modals.js

import { addModal, armModal, execModal, closeModalObj, imageModal, modalImg } from './dom-elements.js';
import { generateDynamicChecklist } from './ui.js';
import { GESTAO_PADRAO } from './config.js';
import { setCurrentTrade } from './state.js';

export function openAddModal() { if (addModal.container) addModal.container.style.display = 'flex'; }
export function closeAddModal() { if (addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; setCurrentTrade({}); } }
export function openArmModal(trade) { setCurrentTrade({ id: trade.id, data: trade.data }); armModal.assetNameSpan.textContent = trade.data.asset; armModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(armModal.checklistContainer, STRATEGIES[trade.data.strategyId]?.armedPhases, trade.data.armedSetup); if (armModal.container) armModal.container.style.display = 'flex'; }
export function closeArmModal() { if (armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); setCurrentTrade({}); } }
export function openExecModal(trade) { setCurrentTrade({ id: trade.id, data: trade.data }); execModal.assetNameSpan.textContent = trade.data.asset; execModal.strategyNameSpan.textContent = trade.data.strategyName; generateDynamicChecklist(execModal.checklistContainer, [...(STRATEGIES[trade.data.strategyId]?.executionPhases || []), GESTAO_PADRAO], trade.data.executionDetails); if (execModal.container) execModal.container.style.display = 'flex'; }
export function closeExecModal() { if (execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); setCurrentTrade({}); } }
export function openCloseTradeModal(trade) { setCurrentTrade({ id: trade.id, data: trade.data }); closeModalObj.assetNameSpan.textContent = trade.data.asset; if (closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
export function closeCloseTradeModal() { if (closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); setCurrentTrade({}); } }
export function openImageModal(imageUrl) { if (imageModal && modalImg) { modalImg.src = imageUrl; imageModal.classList.add('visible'); } }
export function closeImageModal() { if (imageModal && modalImg) { imageModal.classList.remove('visible'); modalImg.src = ''; } }
