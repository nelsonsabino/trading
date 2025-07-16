// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
   current: {
        number: '7.1.3', // <-- VERSÃO ATUALIZADA
        changes: [
            "Melhorada a UX do alarme de nível de Estocástico com rótulos mais claros e valores alvo automáticos (30/70).",
        ]
    },
    releases: [
        {
            number: '7.1.2',
            changes: [
                "Gráficos do TradingView agora adaptam o seu tema (claro/escuro) ao tema da aplicação.",
                "Corrigido bug visual nos cards de alarme no modo escuro em ecrãs de telemóvel.",
            ]
        },
        {
            number: '7.1.1',
            changes: [
                "Correção dos estilos das tabelas no Modo Escuro para garantir a legibilidade.",
            ]
        },
        {
            number: '7.1.0',
            changes: [
                "Implementado Modo Escuro (Dark Mode) em toda a aplicação.",
                "Adicionado botão para alternar entre temas, com a preferência guardada no browser.",
            ]
        },
        {
            number: '6.8.1',
            changes: [
                "Redesenhados os botões de ação nos cards do dashboard para um design mais compacto com ícones e texto.",
            ]
        },
        {
            number: '6.8.0',
            changes: [
                "Substituído o 'Mini-Gráfico' por um 'Gráfico Avançado' interativo dentro dos cards do dashboard.",
                "O gráfico agora carrega com uma configuração limpa e minimalista por defeito.",
            ]
        },
        {
            number: '6.7.0',
            changes: [
                "Adicionada a funcionalidade de 'Mini-Gráfico' em tempo real nos cards do dashboard.",
            ]
        },
        {
            number: '6.6.0',
            changes: [
                "Adicionado novo tipo de alarme: Nível de RSI (sobrecompra/sobrevenda).",
            ]
        },
        {
            number: '6.5.4',
            changes: [
                "Melhorada a exibição do preço atual na página de alarmes para mostrar mais casas decimais em ativos de baixo valor.",
            ]
        },
        {
            number: '6.5.3',
            changes: [
                "Correção do link 'Gráfico' no histórico de alarmes para garantir a compatibilidade com a app móvel do TradingView.",
            ]
        },
        {
            number: '6.5.2',
            changes: [
                "Correção do bug que impedia a edição de alarmes existentes (devido a política de RLS do Supabase).",
            ]
        },
        {
            number: '6.5.1',
            changes: [
                "Tornada a página de alarmes totalmente responsiva para telemóveis, convertendo as tabelas em 'cards' para evitar scroll horizontal.",
            ]
        },
        {
            number: '6.5.0',
            changes: [
                "Adicionado botão 'Gráfico' no histórico de alarmes para análise rápida do momento do disparo.",
            ]
        },
        {
            number: '6.4.2',
            changes: [
                "Melhoria da UX na página de alarmes: o preço atual agora é carregado automaticamente quando o ativo é pré-preenchido.",
                "Correção das notificações do Telegram para exibirem detalhes para todos os tipos de alarme.",
            ]
        },
        {
            number: '6.4.1',
            changes: [
                "Correção do redirecionamento da checkbox 'Criar Alarme' no modal de oportunidades.",
                "Correção do link 'Gráfico' nos cards do dashboard para evitar o erro de 'símbolo inválido'.",
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
