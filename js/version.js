// js/version.js - Ponto central de controlo de versão e changelog

// Estrutura completa com histórico de versões.
// Para adicionar uma nova versão, copie o bloco da 'current',
// cole-o no início do array 'releases', e atualize o novo bloco 'current'.
export const changelogData = {
    current: {
        number: '6.4.1',
        changes: [
            "Correção do redirecionamento da checkbox 'Criar Alarme' no modal de oportunidades.",
            "Correção do link 'Gráfico' nos cards do dashboard para evitar o erro de 'símbolo inválido'.",
        ]
    },
    releases: [
        {
            number: '6.4.0',
            changes: [
                "Refatoração do sistema de autocomplete para usar a API da Binance, padronizando os pares de moedas em toda a aplicação.",
                "Adicionado autocomplete de pares no modal de 'Adicionar Oportunidade'.",
            ]
        },
        {
            number: '6.3.0',
            changes: [
                "Centralização do sistema de versões e criação da página de changelog.",
                "Correção do link 'Gráfico' nos cards da página inicial para abrir a app TradingView no telemóvel.",
            ]
        },
        // Adicione aqui futuras versões antigas
    ]
};


// --- LÓGICA AUTOMÁTICA DE RODAPÉ ---
// Esta função corre em todas as páginas que importam este script.
function injectFooter() {
    let footer = document.querySelector('footer');

    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    // O rodapé mostra sempre o número da versão 'current'
    footer.innerHTML = `
        <p>
            Versão: ${changelogData.current.number} | <a href="changelog.html" style="color: #0d6efd;">Histórico de Alterações</a>
        </p>
    `;
    footer.style.textAlign = 'center';
    footer.style.padding = '1rem 0';
    footer.style.marginTop = '2rem';
    footer.style.color = '#6c757d';
    footer.style.fontSize = '0.9em';
    footer.style.borderTop = '1px solid #e9ecef';
}

document.addEventListener('DOMContentLoaded', injectFooter);
