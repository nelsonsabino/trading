// js/strategies-manager.js

// Importa a nova função que acabámos de criar.
import { listenToStrategies } from './firebase-service.js';

/**
 * Cria o HTML para um único card de estratégia.
 * @param {object} strategy - O objeto da estratégia vindo do Firebase.
 * @returns {string} A string HTML para o card.
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
                <button class="icon-action-btn action-close" data-id="${strategy.id}" title="Apagar Estratégia">
                    <i class="fas fa-trash"></i> <span>Apagar</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Carrega as estratégias do Firebase e exibe-as na página.
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

        // Gera o HTML para cada card e junta tudo.
        const cardsHtml = strategies.map(createStrategyCard).join('');
        container.innerHTML = cardsHtml;
    });
}

// Ponto de entrada do script
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o listener de eventos ao botão de criar (por enquanto, só mostra um alerta).
    const createBtn = document.getElementById('create-strategy-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            alert('A funcionalidade de criar/editar será implementada na próxima fase!');
        });
    }

    // Carrega as estratégias existentes.
    loadAndDisplayStrategies();
});
