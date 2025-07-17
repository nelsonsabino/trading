// js/strategies-manager.js

import { listenToStrategies, deleteStrategy } from './firebase-service.js';

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

// --- FUNÇÕES DE GESTÃO DO MODAL ---
function openStrategyModal() {
    strategyModal.container.style.display = 'flex';
    strategyModal.title.textContent = 'Criar Nova Estratégia';
    strategyModal.form.reset();
    strategyModal.phasesContainer.innerHTML = '';
}

function closeStrategyModal() {
    strategyModal.container.style.display = 'none';
}


// --- LÓGICA DO CONSTRUTOR VISUAL ---

/**
 * Adiciona um novo bloco de fase ao formulário do modal.
 */
function addPhaseBlock() {
    const phaseIndex = strategyModal.phasesContainer.children.length;

    const phaseDiv = document.createElement('div');
    phaseDiv.className = 'phase-block';
    phaseDiv.innerHTML = `
        <div class="phase-block-header">
            <h5>Fase ${phaseIndex + 1}</h5>
            <button type="button" class="btn delete-btn" style="padding: 4px 8px; font-size: 0.8em;">Remover Fase</button>
        </div>
        <div class="form-row">
            <div class="input-item">
                <label>ID da Fase (ex: potential, armed)</label>
                <input type="text" class="phase-id" required>
            </div>
            <div class="input-item">
                <label>Título da Fase</label>
                <input type="text" class="phase-title" required>
            </div>
        </div>
        <div class="phase-items-container">
            <h6>Itens da Checklist</h6>
            <!-- Os itens (checkbox, select, etc.) serão adicionados aqui -->
            <button type="button" class="btn btn-secondary" style="font-size: 0.9em; padding: 6px 10px;">
                <i class="fas fa-plus"></i> Adicionar Item
            </button>
        </div>
    `;

    phaseDiv.querySelector('.delete-btn').addEventListener('click', () => {
        phaseDiv.remove();
    });

    strategyModal.phasesContainer.appendChild(phaseDiv);
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
                    <i class="fas fa-pencil"></i> <span>Editar</span>
                </button>
                <button class="icon-action-btn action-close delete-btn" data-id="${strategy.id}" title="Apagar Estratégia">
                    <i class="fas fa-trash"></i> <span>Apagar</span>
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
    
    if (createBtn) {
        createBtn.addEventListener('click', openStrategyModal);
    }
    if (strategyModal.closeBtn) {
        strategyModal.closeBtn.addEventListener('click', closeStrategyModal);
    }
    if (strategyModal.container) {
        strategyModal.container.addEventListener('click', (e) => {
            if (e.target.id === 'strategy-modal') {
                closeStrategyModal();
            }
        });
    }

    if (strategyModal.addPhaseBtn) {
        strategyModal.addPhaseBtn.addEventListener('click', addPhaseBlock);
    }

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
                alert('A funcionalidade de editar será implementada a seguir!');
            }
        });
    }

    loadAndDisplayStrategies();
});
