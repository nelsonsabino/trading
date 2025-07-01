// js/ui-renderer.js

// Importações necessárias para estas funções
import { createChecklistItem, createInputItem, createRadioGroup } from './ui-helpers.js';
import { addModal, imageModal, modalImg } from './dom-elements.js';
import { STRATEGIES } from './strategies.js';
import { potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';

// ATENÇÃO: Esta é uma importação circular. Vamos ter de resolver isto.
// Por agora, vamos assumir que o app.js irá exportar estas funções.
// Importaremos as funções que são chamadas pelos botões.
import { openArmModal, openExecModal, openCloseTradeModal, loadAndOpenForEditing } from '../app.js';




export function generateDynamicChecklist(container, phases, data = {}) {
    container.innerHTML = '';
    if (!phases) return;
    phases.forEach(phase => {
        const phaseDiv = document.createElement('div');
        if (phase.exampleImageUrl) {
            const exampleContainer = document.createElement('div');
            exampleContainer.className = 'example-image-container';
            exampleContainer.innerHTML = `<p>Exemplo Visual:</p><img src="${phase.exampleImageUrl}" alt="Exemplo para ${phase.title}">`;
            exampleContainer.querySelector('img').addEventListener('click', (e) => { 
                e.stopPropagation(); 
                // Usar o novo modal de imagem para exemplos
                if (imageModal && modalImg) {
                    modalImg.src = phase.exampleImageUrl;
                    imageModal.classList.add('visible');
                } else {
                    // Fallback, caso os elementos do modal não sejam encontrados (não deve acontecer com HTML correto)
                    window.open(phase.exampleImageUrl, '_blank');
                }
            });
            phaseDiv.appendChild(exampleContainer);
        }
        const titleEl = document.createElement('h4');
        titleEl.textContent = phase.title;
        phaseDiv.appendChild(titleEl);
        if (phase.inputs) phase.inputs.forEach(input => phaseDiv.appendChild(createInputItem(input, data)));
        if (phase.checks) phase.checks.forEach(check => phaseDiv.appendChild(createChecklistItem(check, data)));
        if (phase.radios) phaseDiv.appendChild(createRadioGroup(phase.radios, data));
        container.appendChild(phaseDiv);
    });
}

export function populateStrategySelect() {
    if (!addModal.strategySelect) return;
    addModal.strategySelect.innerHTML = '<option value="">-- Selecione --</option>';
    for (const id in STRATEGIES) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = STRATEGIES[id].name;
        addModal.strategySelect.appendChild(option);
    }
}


// Adicione este código ao final do seu js/ui-renderer.js

// Importações adicionais necessárias para estas novas funções
import { potentialTradesContainer, armedTradesContainer, liveTradesContainer } from './dom-elements.js';
import { openArmModal, openExecModal, openCloseTradeModal, loadAndOpenForEditing } from '../app.js'; // Note a importação do app.js

export function createTradeCard(trade) {
    const card = document.createElement('div');
    card.className = 'trade-card';
    card.innerHTML = `<button class="card-edit-btn">Editar</button><h3>${trade.data.asset}</h3><p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p><p><strong>Status:</strong> ${trade.data.status}</p><p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;
    const potentialImageUrl = trade.data.imageUrl;
    let armedImageUrl = null;
    if (trade.data.armedSetup) {
        const key = Object.keys(trade.data.armedSetup).find(k => k.includes('image-url'));
        if (key) armedImageUrl = trade.data.armedSetup[key];
    }
    const imageUrlToShow = armedImageUrl || potentialImageUrl;
   
    if (imageUrlToShow) {
        const img = document.createElement('img');
        img.src = imageUrlToShow;
        img.className = 'card-screenshot'; 
        img.alt = `Gráfico de ${trade.data.asset}`;
        card.appendChild(img);
    }
    
    let actionButton;
    if (trade.data.status === 'POTENTIAL') {
        actionButton = document.createElement('button');
        actionButton.className = 'trigger-btn btn-potential';
        actionButton.textContent = 'Validar Setup (Armar)';
        actionButton.addEventListener('click', () => openArmModal(trade));
    } else if (trade.data.status === 'ARMED') {
        card.classList.add('armed');
        actionButton = document.createElement('button');
        actionButton.className = 'trigger-btn btn-armed';
        actionButton.textContent = 'Executar Gatilho';
        actionButton.addEventListener('click', () => openExecModal(trade));
    } else if (trade.data.status === 'LIVE') {
        card.classList.add('live');
        const details = trade.data.executionDetails;
        if (details) { const p = document.createElement('p'); p.innerHTML = `<strong>Entrada:</strong> ${details['entry-price'] || 'N/A'} | <strong>Quantidade:</strong> ${details['quantity'] || 'N/A'}`; card.appendChild(p); }
        actionButton = document.createElement('button');
        actionButton.className = 'trigger-btn btn-live';
        actionButton.textContent = 'Fechar Trade';
        actionButton.addEventListener('click', () => openCloseTradeModal(trade));
    }
    if (actionButton) card.appendChild(actionButton);
    card.querySelector('.card-edit-btn').addEventListener('click', (e) => { e.stopPropagation(); loadAndOpenForEditing(trade.id); });
    return card;
}

export function displayTrades(trades) {
    if (!potentialTradesContainer) return;
    potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma oportunidade potencial.</p>';
    armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
    liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
    let potentialCount = 0, armedCount = 0, liveCount = 0;
    trades.forEach(trade => {
        const card = createTradeCard(trade);
        if (trade.data.status === 'POTENTIAL') { if (potentialCount === 0) potentialTradesContainer.innerHTML = ''; potentialTradesContainer.appendChild(card); potentialCount++; }
        else if (trade.data.status === 'ARMED') { if (armedCount === 0) armedTradesContainer.innerHTML = ''; armedTradesContainer.appendChild(card); armedCount++; }
        else if (trade.data.status === 'LIVE') { if (liveCount === 0) liveTradesContainer.innerHTML = ''; liveTradesContainer.appendChild(card); liveCount++; }
    });
}
