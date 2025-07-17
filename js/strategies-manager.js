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
    strategyModal.form.reset(); // Limpa o formulário para uma nova entrada
    strategyModal.phasesContainer.innerHTML = ''; // Limpa as fases
}

function closeStrategyModal() {
    strategyModal.container.style.display = 'none';
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
    
    // Listeners para abrir e fechar o modal
    if (createBtn) {
        createBtn.addEventListener('click', openStrategyModal);
    }
    if (strategyModal.closeBtn) {
        strategyModal.closeBtn.addEventListener('click', closeStrategyModal);
    }
    if (strategyModal.container) {
        // Permite fechar o modal clicando fora dele
        strategyModal.container.addEventListener('click', (e) => {
            if (e.target.id === 'strategy-modal') {
                closeStrategyModal();
            }
        });
    }

    // Listener de eventos para os botões nos cards (delegação)
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

    // Carrega as estratégias na página
    loadAndDisplayStrategies();
});
