// js/modals.js - VERSÃO COM ESTRATÉGIAS DINÂMICAS E LÓGICA DE FASES ROBUSTA

import { addModal, armModal, execModal, closeModalObj, imageModal, modalImg } from './dom-elements.js';
import { generateDynamicChecklist } from './ui.js';
import { GESTAO_PADRAO } from './config.js';
import { setCurrentTrade, getStrategies } from './state.js';

export function openAddModal() { if (addModal.container) addModal.container.style.display = 'flex'; }
export function closeAddModal() { 
    if (addModal.container) { 
        addModal.container.style.display = 'none'; 
        addModal.form.reset(); 
        addModal.checklistContainer.innerHTML = ''; 
        setCurrentTrade({}); 
        const deleteBtn = document.getElementById('delete-opportunity-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
            deleteBtn.onclick = null;
        }
    } 
}

export function openArmModal(trade) {
    const strategies = getStrategies();
    const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
    if (!selectedStrategy) return;

    setCurrentTrade({ id: trade.id, data: trade.data });
    armModal.assetNameSpan.textContent = trade.data.asset;
    armModal.strategyNameSpan.textContent = trade.data.strategyName;
    armModal.checklistContainer.innerHTML = ''; // Limpa o container primeiro

    const armedPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 1) ? selectedStrategy.data.phases[1] : null;
    
    if (armedPhase) {
        // Procura e exibe a imagem de referência para a fase "Armada"
        const imageItem = armedPhase.items.find(item => item.type === 'image');
        if (imageItem && imageItem.url) {
            const imgElement = document.createElement('img');
            imgElement.src = imageItem.url;
            imgElement.style.maxWidth = '100%';
            imgElement.style.borderRadius = '8px';
            imgElement.style.marginBottom = '1.5rem';
            armModal.checklistContainer.appendChild(imgElement);
        }
        generateDynamicChecklist(armModal.checklistContainer, [armedPhase], trade.data.armedSetup);
    }
    
    const imageUrlInput = document.getElementById('image-url-arm');
    if (imageUrlInput) {
        imageUrlInput.value = trade.data.imageUrl || '';
    }

    if (armModal.container) armModal.container.style.display = 'flex';
}
export function closeArmModal() { if (armModal.container) { armModal.container.style.display = 'none'; armModal.form.reset(); setCurrentTrade({}); } }

export function openExecModal(trade) {
    const strategies = getStrategies();
    const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
    if (!selectedStrategy) return;

    setCurrentTrade({ id: trade.id, data: trade.data });
    execModal.assetNameSpan.textContent = trade.data.asset;
    execModal.strategyNameSpan.textContent = trade.data.strategyName;
    execModal.checklistContainer.innerHTML = ''; // Limpa o container primeiro
    
    const executionPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 2) ? selectedStrategy.data.phases[2] : null;
    const phasesForChecklist = [];
    
    if (executionPhase) {
        // Procura e exibe a imagem de referência para a fase "Execução"
        const imageItem = executionPhase.items.find(item => item.type === 'image');
        if (imageItem && imageItem.url) {
            const imgElement = document.createElement('img');
            imgElement.src = imageItem.url;
            imgElement.style.maxWidth = '100%';
            imgElement.style.borderRadius = '8px';
            imgElement.style.marginBottom = '1.5rem';
            execModal.checklistContainer.appendChild(imgElement);
        }
        phasesForChecklist.push(executionPhase);
    }
    
    const gestaoPhase = {
        title: GESTAO_PADRAO.title,
        items: GESTAO_PADRAO.inputs.map(input => ({ ...input, type: input.type }))
    };
    phasesForChecklist.push(gestaoPhase);
    
    generateDynamicChecklist(execModal.checklistContainer, phasesForChecklist, trade.data.executionDetails);
    
    const imageUrlInput = document.getElementById('image-url-exec');
    if (imageUrlInput) {
        imageUrlInput.value = trade.data.imageUrl || '';
    }

    if (execModal.container) execModal.container.style.display = 'flex';
}
export function closeExecModal() { if (execModal.container) { execModal.container.style.display = 'none'; execModal.form.reset(); setCurrentTrade({}); } }

export function openCloseTradeModal(trade) { setCurrentTrade({ id: trade.id, data: trade.data }); closeModalObj.assetNameSpan.textContent = trade.data.asset; if (closeModalObj.container) closeModalObj.container.style.display = 'flex'; }
export function closeCloseTradeModal() { if (closeModalObj.container) { closeModalObj.container.style.display = 'none'; closeModalObj.form.reset(); setCurrentTrade({}); } }

export function openImageModal(imageUrl) { if (imageModal && modalImg) { modalImg.src = imageUrl; imageModal.classList.add('visible'); } }
export function closeImageModal() { if (imageModal && modalImg) { imageModal.classList.remove('visible'); modalImg.src = ''; } }
