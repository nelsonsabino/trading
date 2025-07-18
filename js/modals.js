// js/modals.js - VERSÃO COM ESTRATÉGIAS DINÂMICAS

import { addModal, armModal, execModal, closeModalObj, imageModal, modalImg } from './dom-elements.js';
import { generateDynamicChecklist } from './ui.js';
import { GESTAO_PADRAO } from './config.js';
import { setCurrentTrade, getStrategies } from './state.js'; // Importa getStrategies

export function openAddModal() { if (addModal.container) addModal.container.style.display = 'flex'; }
export function closeAddModal() { if (addModal.container) { addModal.container.style.display = 'none'; addModal.form.reset(); addModal.checklistContainer.innerHTML = ''; setCurrentTrade({}); } }

export function openArmModal(trade) {
    const strategies = getStrategies(); // Pega as estratégias do estado
    const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
    if (!selectedStrategy) return;

    setCurrentTrade({ id: trade.id, data: trade.data });
    armModal.assetNameSpan.textContent = trade.data.asset;
    armModal.strategyNameSpan.textContent = trade.data.strategyName;
    
    const armedPhase = selectedStrategy.data.phases.find(p => p.id === 'armed');
    generateDynamicChecklist(armModal.checklistContainer, [armedPhase], trade.data.armedSetup);
    
    if (armModal.container) armModal.container.style.display = 'flex';
}
export function closeArmModal() { if (armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); setCurrentTrade({}); } }

export function openExecModal(trade) {
    const strategies = getStrategies(); // Pega as estratégias do estado
    const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
    if (!selectedStrategy) return;

    setCurrentTrade({ id: trade.id, data: trade.data });
    execModal.assetNameSpan.textContent = trade.data.asset;
    execModal.strategyNameSpan.textContent = trade.data.strategyName;
    
    const executionPhase = selectedStrategy.data.phases.find(p => p.id === 'execution');
    // Converte a nossa estrutura para a que a função generateDynamicChecklist espera
    const phasesForChecklist = [];
    if (executionPhase) {
        phasesForChecklist.push({ title: executionPhase.title, items: executionPhase.items });
    }
    // Adiciona o plano de gestão padrão
    phasesForChecklist.push({ title: GESTAO_PADRAO.title, items: GESTAO_PADRAO.inputs.map(i => ({...i, type: i.type})) });
    
    generateDynamicChecklist(execModal.checklistContainer, phasesForChecklist, trade.data.executionDetails);
    
    if (execModal.container) execModal.container.style.display = 'flex';
}
export function closeExecModal() { if (execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); setCurrentTrade({}); } }

export function openCloseTradeModal(trade) { setCurrentTrade({ id: trade.id, data: trade.data }); closeModalObj.assetNameSpan.textContent = trade.data.asset; if (closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
export function closeCloseTradeModal() { if (closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); setCurrentTrade({}); } }

export function openImageModal(imageUrl) { if (imageModal && modalImg) { modalImg.src = imageUrl; imageModal.classList.add('visible'); } }
export function closeImageModal() { if (imageModal && modalImg) { imageModal.classList.remove('visible'); modalImg.src = ''; } }
