// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
    current: {
        number: '8.5.0', // <-- VERSÃO ATUALIZADA
        changes: [
            "**Nova Funcionalidade: Página de Detalhe do Ativo.**",
            "Adicionada uma nova página (`asset-details.html`) que centraliza todas as informações de um ativo específico.",
            "A página exibe um gráfico avançado, análise técnica, e tabelas com todos os alarmes e trades relacionados ao ativo.",
            "Os nomes dos ativos no Dashboard, Scanner de Mercado e página de Alarmes são agora links diretos para esta nova página de análise."
        ]
    },
    releases: [
        {
            number: '8.4.0',
            changes: [
                "**Melhoria de UX e Análise:** Adicionados gráficos de 'Curva de Capital' e 'Desempenho por Estratégia' à página de Estatísticas, permitindo uma análise visual mais rápida e intuitiva da performance."
            ]
        },
        {
            number: '8.3.0',
            changes: [
                "**Melhoria de UX:** Itens recém-criados (tanto na Watchlist quanto nos Alarmes) são agora destacados com uma animação visual e a página rola até eles, fornecendo um feedback imediato ao utilizador."
            ]
        },
        {
            number: '8.2.0',
            changes: [
                "**Performance:** Implementado um sistema de cache de 2 minutos no Market Scanner. A página agora carrega instantaneamente em visitas repetidas, melhorando a experiência do utilizador e reduzindo chamadas às APIs.",
            ]
        },
        {
            number: '8.1.0',
            changes: [
                "**Robustez da Aplicação (Refatoração Interna):**",
                "Centralizada toda a lógica de acesso ao Firebase no `firebase-service.js`, removendo a inicialização duplicada do `stats.js` para maior consistência.",
                "Melhorada a resiliência do dashboard: o carregamento de preços e sparklines agora usa `Promise.allSettled`, garantindo que o dashboard carrega mesmo que uma das fontes de dados falhe.",
                "Adicionada validação de inputs nos formulários de execução e fecho de trade para prevenir a entrada de dados inválidos (ex: preços a zero ou negativos).",
            ]
        },
        {
            number: '8.0.4',
            changes: [
                "Corrigido o 'flash' do tema claro ao carregar a página no Modo Escuro.",
            ]
        },
        {
            number: '8.0.3', 
            changes: [
                "Corrigido bug que impedia o redirecionamento para a página de alarmes após guardar uma nova oportunidade.",
            ]
        },
        {
            number: '8.0.2',
            changes: [
                "Otimizado o construtor de estratégias: as fases (Potential, Armed, Execution) são agora adicionadas automaticamente, simplificando a criação.",
                "Corrigido bug que impedia o construtor de guardar estratégias com itens de checklist.",
            ]
        },
        {
            number: '8.0.1',
            changes: [
                "Finalizada a integração do sistema de estratégias dinâmicas na aplicação principal.",
                "Dropdown de estratégias e checklists dos modais agora usam os dados do Firebase.",
            ]
        },
        {
            number: '8.0.0',
            changes: [
                "Introduzido o Construtor de Estratégias Dinâmico.",
                "Criada nova página para criar, editar e apagar estratégias de trading.",
                "As estratégias são agora guardadas e lidas a partir da base de dados (Firebase).",
            ]
        },
        {
            number: '7.1.3',
            changes: [
                "Melhorada a UX do alarme de nível de Estocástico com rótulos mais claros e valores alvo automáticos (30/70).",
            ]
        },
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
            number: '6.9.0',
            changes: [
                "Adicionada a funcionalidade de 'Ver Gráfico' em um modal na página do Market Scanner para análise rápida.",
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
