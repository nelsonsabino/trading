// js/version.js - Ponto central de controlo de versão e changelog

// O único sítio que precisa de editar para atualizar a versão e as alterações.
export const versionInfo = {
    number: '6.3.0', // <-- NOVO NÚMERO DE VERSÃO
    changes: [
        "Centralização do sistema de versões e criação da página de changelog.",
        "Correção do link 'Gráfico' nos cards da página inicial para abrir a app TradingView no telemóvel.",
        // Adicione aqui novas alterações no futuro
    ]
};


// --- LÓGICA AUTOMÁTICA DE RODAPÉ ---
// Esta função corre em todas as páginas que importam este script.
function injectFooter() {
    // Procura por um elemento <footer> no documento atual.
    let footer = document.querySelector('footer');

    // Se não existir um <footer>, cria um e anexa-o ao body.
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    // Constrói o HTML do rodapé, incluindo o número da versão e um link para o changelog.
    footer.innerHTML = `
        <p>
            Versão: ${versionInfo.number} | <a href="changelog.html" style="color: #0d6efd;">Histórico de Alterações</a>
        </p>
    `;
    // Adiciona estilos básicos para garantir consistência.
    footer.style.textAlign = 'center';
    footer.style.padding = '1rem 0';
    footer.style.marginTop = '2rem';
    footer.style.color = '#6c757d';
    footer.style.fontSize = '0.9em';
    footer.style.borderTop = '1px solid #e9ecef';
}

// Garante que o DOM está carregado antes de injetar o rodapé.
document.addEventListener('DOMContentLoaded', injectFooter);
