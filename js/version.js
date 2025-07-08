// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
   current: {
        number: '6.5.0', // <-- VERSÃO ATUALIZADA
        changes: [
            "Adicionado botão 'Gráfico' no histórico de alarmes para análise rápida do momento do disparo.",
        ]
    },
    releases: [
        {
            number: '6.4.2',
            changes: [
                "Melhoria da UX na página de alarmes: o preço atual agora é carregado automaticamente quando o ativo é pré-preenchido.",
                "Correção das notificações do Telegram para exibirem detalhes para todos os tipos de alarme.",
            ]
        },
        {
            number: '6.4.0',
            changes: [
                "Refatoração do sistema de autocomplete para usar a API da Binance, padronizando os pares de moedas em toda a aplicação.",
                "Adicionado autocomplete de pares no modal de 'Adicionar Oportunidade'.",
            ]
        },
        {
            number: '6.3.1',
            changes: [
                "Correção do fluxo de 'Criar Alarme' para ser consistente em toda a aplicação, resolvendo bugs de pré-preenchimento.",
            ]
        },
        {
            number: '6.3.0',
            changes: [
                "Centralização do sistema de versões e criação da página de changelog.",
                "Correção do link 'Gráfico' nos cards da página inicial para abrir a app TradingView no telemóvel.",
            ]
        },
    ]
};


// --- LÓGICA AUTOMÁTICA DE RODAPÉ ---
function injectFooter() {
    let footer = document.querySelector('footer');

    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
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
