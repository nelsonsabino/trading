// js/strategies-manager.js

// Importa a função de apagar que acabámos de criar.
import { listenToStrategies, deleteStrategy } from './firebase-service.js';

/**
 * Cria o HTML para um único card de estratégia.
 * (Função inalterada)
 */
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

/**
 * Carrega as estratégias do Firebase e exibe-as na página.
 * (Função inalterada)
 */
function loadAndDisplayStrategies() {
    const container = document.getElementById('strategies-container');
    if (!container) return;

    listenToStrategies((strategies, error) => {
        if (error) {
            container.innerHTML = '<p class="empty-state-message" style="color: red;">Ocorreu um erro ao carregar as estratégias.</p>';
            return;
        }

        if (strategies.length === 0) {
            container.innerHTML = '<p class="empty-state-message">Nenhuma estratégia encontrada. Clique em "Criar Nova Estratégia" para começar.</p>';
            return;
        }

        const cardsHtml = strategies.map(createStrategyCard).join('');
        container.innerHTML = cardsHtml;
    });
}


// Ponto de entrada do script
document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('create-strategy-btn');
    const container = document.getElementById('strategies-container');

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            alert('A funcionalidade de criar/editar será implementada na próxima fase!');
        });
    }

    // --- LÓGICA DE EVENTOS ATUALIZADA ---
    if (container) {
        container.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            
            if (deleteButton) {
                const strategyId = deleteButton.dataset.id;
                
                if (confirm('Tem a certeza que quer apagar esta estratégia? Esta ação é irreversível.')) {
                    try {
                        await deleteStrategy(strategyId);
                        // A lista irá atualizar-se automaticamente graças ao onSnapshot!
                        console.log('Estratégia apagada com sucesso.');
                    } catch (error) {
                        alert('Ocorreu um erro ao apagar a estratégia.');
                    }
                }
            }

            // (Aqui, no futuro, adicionaremos a lógica para o botão de editar)
            const editButton = e.target.closest('.action-edit');
            if (editButton) {
                alert('A funcionalidade de editar será implementada a seguir!');
            }
        });
    }

    loadAndDisplayStrategies();
});
