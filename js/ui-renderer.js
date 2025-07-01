// js/ui-renderer.js

// Importações necessárias para estas funções
import { createChecklistItem, createInputItem, createRadioGroup } from './ui-helpers.js';
import { addModal, imageModal, modalImg } from './dom-elements.js';
import { STRATEGIES } from './strategies.js';


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
