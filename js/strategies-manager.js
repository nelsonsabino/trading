// js/strategies-manager.js - VERSÃO COM FASES AUTOMÁTICAS

import { listenToStrategies, deleteStrategy, addStrategy, updateStrategy, getStrategy } from './firebase-service.js';

// --- ELEMENTOS DO DOM ---
const strategiesContainer = document.getElementById('strategies-container');
const createBtn = document.getElementById('create-strategy-btn');
const strategyModal = {
    container: document.getElementById('strategy-modal'),
    closeBtn: document.getElementById('close-strategy-modal'),
    form: document.getElementById('strategy-form'),
    title: document.getElementById('strategy-modal-title'),
    nameInput: document.getElementById('strategy-name'),
    phasesContainer: document.getElementById('phases-container'),
    addPhaseBtn: document.getElementById('add-phase-btn')
};
const addItemModal = {
    container: document.getElementById('add-item-type-modal'),
    buttonsContainer: document.getElementById('item-type-buttons'),
    cancelBtn: document.getElementById('cancel-add-item')
};
let currentPhaseItemsContainer = null;
let editingStrategyId = null;


// --- FUNÇÕES DE GESTÃO DO MODAL ---
function openStrategyModal(strategy = null) {
    strategyModal.form.reset();
    strategyModal.phasesContainer.innerHTML = '';
    
    if (strategy && strategy.data) {
        editingStrategyId = strategy.id;
        strategyModal.title.textContent = `Editar Estratégia`;
        strategyModal.nameInput.value = strategy.data.name;
        
        if (strategy.data.phases && Array.isArray(strategy.data.phases)) {
            strategy.data.phases.forEach(phase => {
                const phaseBlock = addPhaseBlock();
                if (!phaseBlock) return; // Não adiciona mais de 3 fases

                const itemsListContainer = phaseBlock.querySelector('.items-list');
                if (phase.items && Array.isArray(phase.items)) {
                    phase.items.forEach(item => {
                        const itemBlock = createItemBlock(item.type);
                        itemBlock.querySelector('.item-id').value = item.id || '';
                        itemBlock.querySelector('.item-label').value = item.label || '';
                        itemBlock.querySelector('.item-required').checked = item.required || false;

                        if (item.type === 'select' && item.options) {
                            itemBlock.querySelector('.item-options').value = item.options.join(', ');
                        }
                        itemsListContainer.appendChild(itemBlock);
                    });
                }
            });
        }
    } else {
        editingStrategyId = null;
        strategyModal.title.textContent = 'Criar Nova Estratégia';
    }
    strategyModal.container.style.display = 'flex';
}

function closeStrategyModal() { strategyModal.container.style.display = 'none'; }
function openAddItemModal(targetContainer) {
    currentPhaseItemsContainer = targetContainer;
    addItemModal.container.style.display = 'flex';
}
function closeAddItemModal() {
    currentPhaseItemsContainer = null;
    addItemModal.container.style.display = 'none';
}


// --- LÓGICA DO CONSTRUTOR VISUAL ---
function createItemBlock(type) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'phase-block';
    itemDiv.style.backgroundColor = '#fff';
    itemDiv.dataset.type = type;
    let fieldsHtml = `
        <div class="phase-block-header">
            <h5>Item: ${type.charAt(0).toUpperCase() + type.slice(1)}</h5>
            <button type="button" class="btn delete-btn" style="padding: 4px 8px; font-size: 0.8em;">Remover Item</button>
        </div>
        <div class="form-row">
            <div class="input-item"><label>ID do Item</label><input type="text" class="item-id" required></div>
            <div class="input-item"><label>Rótulo (Label)</label><input type="text" class="item-label" required></div>
        </div>
        <div class="input-item" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" class="item-required" style="width: auto; margin: 0;">
            <label style="margin: 0;">Obrigatório?</label>
        </div>
    `;
    if (type === 'select') {
        fieldsHtml += `<div class="input-item"><label>Opções (separadas por vírgula)</label><input type="text" class="item-options" placeholder="Ex: Opção 1, Opção 2"></div>`;
    }
    itemDiv.innerHTML = fieldsHtml;
    itemDiv.querySelector('.delete-btn').addEventListener('click', () => itemDiv.remove());
    return itemDiv;
}

function addPhaseBlock() {
    const phaseIndex = strategyModal.phasesContainer.children.length;
    const phaseTitles = ["Fase Potencial", "Fase Armada", "Fase de Execução"];
    const phaseIds = ["potential", "armed", "execution"];
    
    if (phaseIndex >= phaseIds.length) {
        alert("Só pode adicionar um máximo de 3 fases.");
        return null;
    }
    
    const phaseTitle = phaseTitles[phaseIndex];
    const phaseId = phaseIds[phaseIndex];

    const phaseDiv = document.createElement('div');
    phaseDiv.className = 'phase-block';
    phaseDiv.dataset.phaseId = phaseId;

    phaseDiv.innerHTML = `
        <div class="phase-block-header">
            <h5>${phaseTitle}</h5>
            <button type="button" class="btn delete-btn" style="padding: 4px 8px; font-size: 0.8em;">Remover Fase</button>
        </div>
        <div class="phase-items-container">
            <h6>Itens da Checklist</h6>
            <div class="items-list" style="padding-left: 1rem; border-left: 2px solid #e9ecef;"></div>
            <button type="button" class="btn btn-secondary add-item-btn" style="font-size: 0.9em; padding: 6px 10px; margin-top: 1rem;">
                <i class="fas fa-plus"></i> Adicionar Item
            </button>
        </div>
    `;

    phaseDiv.querySelector('.delete-btn').addEventListener('click', () => phaseDiv.remove());
    phaseDiv.querySelector('.add-item-btn').addEventListener('click', (e) => {
        const itemsContainer = e.target.closest('.phase-items-container').querySelector('.items-list');
        openAddItemModal(itemsContainer);
    });

    strategyModal.phasesContainer.appendChild(phaseDiv);
    return phaseDiv;
}

function buildStrategyDataFromForm() {
    const strategyData = { name: strategyModal.nameInput.value.trim(), phases: [] };
    const phaseTitles = ["Fase Potencial", "Fase Armada", "Fase de Execução"];
    
    const phaseBlocks = strategyModal.phasesContainer.querySelectorAll(':scope > .phase-block');
    phaseBlocks.forEach((phaseBlock, index) => {
        const phaseObject = {
            id: phaseBlock.dataset.phaseId,
            title: phaseTitles[index], // Usa o título correspondente à ordem
            items: []
        };
        const itemBlocks = phaseBlock.querySelectorAll('.items-list .phase-block');
        itemBlocks.forEach(itemBlock => {
            const itemObject = {
                type: itemBlock.dataset.type,
                id: itemBlock.querySelector('.item-id').value.trim(),
                label: itemBlock.querySelector('.item-label').value.trim(),
                required: itemBlock.querySelector('.item-required').checked
            };
            if (itemObject.type === 'select') {
                const optionsInput = itemBlock.querySelector('.item-options');
                if (optionsInput) itemObject.options = optionsInput.value.split(',').map(opt => opt.trim()).filter(Boolean);
            }
            phaseObject.items.push(itemObject);
        });
        strategyData.phases.push(phaseObject);
    });
    return strategyData;
}

async function handleSaveStrategy(e) {
    e.preventDefault();
    const strategyData = buildStrategyDataFromForm();
    try {
        if (editingStrategyId) {
            await updateStrategy(editingStrategyId, strategyData);
            alert('Estratégia atualizada com sucesso!');
        } else {
            await addStrategy(strategyData);
            alert('Estratégia criada com sucesso!');
        }
        closeStrategyModal();
    } catch (error) {
        alert('Ocorreu um erro ao guardar a estratégia.');
        console.error("Erro ao guardar estratégia:", error);
    }
}


// --- FUNÇÕES DE RENDERIZAÇÃO ---
function createStrategyCard(strategy) {
    const phaseCount = strategy.data.phases ? strategy.data.phases.length : 0;
    const date = strategy.data.createdAt?.toDate().toLocaleDateString('pt-PT') || 'N/A';
    return `
        <div class="trade-card">
            <h3>${strategy.data.name}</h3>
            <p><strong>Fases:</strong> ${phaseCount}</p>
            <p><strong>Criada em:</strong> ${date}</p>
            <div class="card-actions" style="justify-content: flex-end; gap: 0.5rem;">
                <button class="icon-action-btn action-edit" data-id="${strategy.id}" title="Editar Estratégia">
                    <span class="material-symbols-outlined">edit</span> <span>Editar</span>
                </button>
                <button class="icon-action-btn action-close delete-btn" data-id="${strategy.id}" title="Apagar Estratégia">
                    <span class="material-symbols-outlined">delete</span> <span>Apagar</span>
                </button>
            </div>
        </div>
    `;
}

function loadAndDisplayStrategies() {
    if (!strategiesContainer) return;
    listenToStrategies((strategies, error) => {
        if (error) {
            strategiesContainer.innerHTML = '<p class="empty-state-message" style="color: red;">Ocorreu um erro ao carregar as estratégias.</p>';
            return;
        }
        if (strategies.length === 0) {
            strategiesContainer.innerHTML = '<p class="empty-state-message">Nenhuma estratégia encontrada. Clique em "Criar Nova Estratégia" para começar.</p>';
            return;
        }
        const cardsHtml = strategies.map(createStrategyCard).join('');
        strategiesContainer.innerHTML = cardsHtml;
    });
}


// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    
    if (createBtn) { createBtn.addEventListener('click', () => openStrategyModal()); }
    if (strategyModal.closeBtn) { strategyModal.closeBtn.addEventListener('click', closeStrategyModal); }
    if (strategyModal.container) { strategyModal.container.addEventListener('click', (e) => { if (e.target.id === 'strategy-modal') closeStrategyModal(); }); }
    if (strategyModal.form) { strategyModal.form.addEventListener('submit', handleSaveStrategy); }
    
    if (addItemModal.cancelBtn) { addItemModal.cancelBtn.addEventListener('click', closeAddItemModal); }
    if (addItemModal.buttonsContainer) {
        addItemModal.buttonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-type]');
            if (button && currentPhaseItemsContainer) {
                const itemType = button.dataset.type;
                const newItemBlock = createItemBlock(itemType);
                currentPhaseItemsContainer.appendChild(newItemBlock);
                closeAddItemModal();
            }
        });
    }

    if (strategyModal.addPhaseBtn) { strategyModal.addPhaseBtn.addEventListener('click', addPhaseBlock); }
    
    if (strategiesContainer) {
        strategiesContainer.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            const editButton = e.target.closest('.action-edit');

            if (deleteButton) {
                const strategyId = deleteButton.dataset.id;
                if (confirm('Tem a certeza que quer apagar esta estratégia? Esta ação é irreversível.')) {
                    try {
                        await deleteStrategy(strategyId);
                    } catch (error) {
                        alert('Ocorreu um erro ao apagar a estratégia.');
                    }
                }
            } else if (editButton) {
                const strategyId = editButton.dataset.id;
                const strategy = await getStrategy(strategyId);
                if (strategy) {
                    openStrategyModal(strategy);
                } else {
                    alert('Não foi possível encontrar a estratégia para editar.');
                }
            }
        });
    }
    loadAndDisplayStrategies();
});
