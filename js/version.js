// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
    current: {
        number: '8.0.4', // <-- VERSÃO ATUALIZADA E CORRETA
        changes: [
            "Corrigido o 'flash' do tema claro ao carregar a página no Modo Escuro.",
        ]
    },
    releases: [
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
        // ... (o seu histórico anterior completo) ...
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
