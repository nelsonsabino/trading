// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
    current: {
        number: '10.0.0', // <-- VERSÃO ATUALIZADA (Major release - Segurança e Estabilidade)
        changes: [
            "**Segurança de Chaves API (Versão 10):**",
            "Implementado um sistema de segurança robusto para proteger as chaves de API (Firebase, Supabase, CryptoCompare) utilizando GitHub Secrets e GitHub Actions. As chaves secretas foram removidas do código fonte e são agora injetadas de forma segura durante o processo de deploy.",
            "As Regras de Segurança do Firebase foram atualizadas para permitir a leitura pública de dados (trades e estratégias), garantindo que a watchlist e outras funcionalidades da aplicação carregam corretamente, mantendo as permissões de escrita seguras.",
            "Corrigidos os caminhos dos ficheiros para o Service Worker e o `site.webmanifest`, resolvendo os erros 404 e garantindo que a funcionalidade PWA (Progressive Web App) funciona corretamente no ambiente do GitHub Pages.",
        ]
    },
    releases: [
        {
            number: '9.3.1',
            changes: [
                "**Simplificação da Página de Detalhes:** Removida a secção de notícias da página de detalhes do ativo para uma interface mais limpa e focada na análise técnica e nos dados da aplicação."
            ]
        },
        {
            number: '9.3.0',
            changes: [
                "**Gráfico Principal Otimizado (Página de Detalhes do Ativo):**",
                "Adicionadas as linhas de EMA 50 e EMA 200 ao gráfico principal do ApexCharts.",
                "Implementada a funcionalidade de alterar o tipo de gráfico (Linha ou Velas) e o timeframe dinamicamente.",
                "Aumentada a quantidade de dados históricos solicitados para garantir que a EMA 200 é desenhada na sua totalidade.",
                "Corrigidos todos os bugs de renderização, incluindo o problema das EMAs incompletas no gráfico de linha e a falha na exibição dos gráficos de velas.",
                "Restauradas todas as ferramentas de navegação do gráfico (zoom, arrastar/pan e reset) no toolbar do ApexCharts."
            ]
        },
        {
            number: '9.2.0',
            changes: [
                "**Funcionalidade PWA (Progressive Web App):**",
                "A aplicação agora é totalmente funcional como uma PWA, permitindo a instalação no ecrã inicial de dispositivos móveis e desktop.",
                "Implementado um Service Worker (`service-worker.js`) para caching dos assets estáticos da aplicação, permitindo que a app funcione offline e carregue instantaneamente após a primeira visita.",
                "O ficheiro `site.webmanifest` foi atualizado com metadados completos para uma melhor experiência de instalação e integração com o sistema operativo.",
            ]
        },
        {
            number: '9.1.7',
            changes: [
                "**Correções e Otimizações Finais de UI:**",
                "Resolvidos todos os problemas de layout e alinhamento nos cards do Dashboard, garantindo a compactação, o posicionamento correto do lápis de edição (visível no hover), e o alinhamento em linha do sparkline, preço e percentagem.",
                "Restaurado o comportamento de tabela clássico em ecrãs móveis para o Market Scanner (e todas as tabelas), permitindo scroll horizontal em vez de quebrar em blocos, melhorando a visualização de dados tabulares.",
                "Ajustes finos em espaçamentos e alinhamentos CSS para garantir a consistência e o aspeto profissional em toda a aplicação.",
            ]
        },
        {
            number: '9.1.6',
            changes: [
                "**Correção de Tema em Gráficos (Página de Detalhes):**",
                "Resolvido o problema onde os gráficos (ApexCharts e widget de Análise Técnica TradingView) na página de detalhes do ativo não mudavam de tema (claro/escuro) dinamicamente.",
                "Implementado um sistema de notificação de mudança de tema (`CustomEvent`) para que os gráficos se redesenhem automaticamente com o tema correto ao alternar.",
            ]
        },
        {
            number: '9.1.5',
            changes: [
                "**Correção de Visualização:** Corrigido o problema de carregamento incompleto do widget de 'Análise Técnica Detalhada' do TradingView na página de detalhes do ativo, garantindo que o gráfico é exibido na sua totalidade.",
                "Ajustada a altura do contentor do widget para garantir que a biblioteca TradingView tem espaço suficiente para renderizar."
            ]
        },
        {
            number: '9.1.4',
            changes: [
                "**Otimização da Página de Detalhes do Ativo (Final):**",
                "O gráfico principal do ativo agora permite a seleção de diferentes timeframes (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M) via dropdown, permitindo uma análise flexível da ação de preço.",
                "O widget de 'Análise Técnica' do TradingView foi reintroduzido na página de detalhes do ativo, substituindo a tentativa de replicação com ApexCharts, para fornecer as recomendações agregadas de 'Strong Buy/Sell' em múltiplos timeframes.",
                "As chamadas à API da Binance para dados de gráfico e indicadores são agora centralizadas na Edge Function `get-sparklines-data` para otimização e processamento no backend, garantindo performance e fiabilidade.",
            ]
        },
        {
            number: '9.1.3',
            changes: [
                "**Correções e Otimizações Finais de UI:**",
                "Resolvidos todos os problemas de layout e alinhamento nos cards do Dashboard, garantindo a compactação, o posicionamento correto do lápis de edição (visível no hover), e o alinhamento em linha do sparkline, preço e percentagem.",
                "Restaurado o comportamento de tabela clássico em ecrãs móveis para o Market Scanner (e todas as tabelas), permitindo scroll horizontal em vez de quebrar em blocos, melhorando a visualização de dados tabulares.",
                "Ajustes finos em espaçamentos e alinhamentos CSS para garantir a consistência e o aspeto profissional em toda a aplicação.",
            ]
        },
        {
            number: '9.1.2',
            changes: [
                "**Otimização de UI - Cards do Dashboard:**",
                "Reduzido o tamanho dos cards no Dashboard principal para torná-los mais compactos e permitir uma visualização mais densa de ativos.",
                "Removido o texto dos botões 'Gráfico' e 'Análise' nos cards, exibindo apenas os ícones para um visual mais limpo.",
                "O mini-gráfico, preço e variação percentual são agora exibidos na mesma linha para maior eficiência de espaço.",
                "As 'Notas' do trade só aparecem se houver conteúdo, evitando linhas vazias desnecessárias.",
                "O status do trade foi removido do corpo do card, uma vez que a coluna Kanban já indica essa informação.",
                "O botão de ação principal (Armar/Executar/Fechar) foi reposicionado na parte superior do card para maior proeminência e acessibilidade."
            ]
        },
        {
            number: '9.1.1',
            changes: [
                "**Correções de UI Pós-Reestruturação da Navegação:**",
                "Resolvidos múltiplos problemas de layout e alinhamento em todas as tabelas (Dashboard, Scanner, Alarmes, Gestão e Detalhes do Ativo), tanto em desktop como em mobile, restaurando a aparência original e consistente.",
                "Corrigido o layout dos cards do Dashboard, garantindo que o gráfico Sparkline e os dados de preço são exibidos corretamente lado a lado.",
                "As tabelas de análise na página de Estatísticas agora estão alinhadas corretamente à esquerda e formatadas de forma consistente.",
                "Garantida a compatibilidade total com o novo sistema de navegação e as correções de CSS anteriores.",
                "Correção do ícone para 'Criar Alarme' na navegação principal, alterado para `fa-plus-circle` para exibição correta."
            ]
        },
        {
            number: '9.1.0',
            changes: [
                "**Reestruturação da Navegação (UI/UX):**",
                "Menu de navegação principal simplificado, utilizando ícones sugestivos para as páginas mais usadas (Dashboard, Scanner, Criar Alarme, Meus Alarmes).",
                "Páginas de gestão e análise (Gerir Estratégias, Todas as Operações, Ver Estatísticas) agrupadas num menu suspenso acessível através de um ícone de roda dentada, reduzindo a sobrecarga visual.",
                "Um novo script (`js/navigation.js`) foi adicionado para gerir a lógica de abrir/fechar este menu, proporcionando uma experiência de utilizador mais limpa e organizada em todas as páginas.",
            ]
        },
        {
            number: '9.0.0',
            changes: [
                "**Reestruturação do CSS (Versão 9):** O ficheiro `style.css` foi dividido em múltiplos ficheiros CSS modulares (ex: `base.css`, `layout.css`, `components.css`, `buttons.css`, etc.) para melhorar a manutenibilidade e organização do projeto.",
                "**Melhoria do Layout Responsivo:** O layout das tabelas em ecrãs de telemóvel foi alterado. Em vez de se transformarem em blocos, as tabelas agora mantêm o seu formato de colunas com scroll horizontal, melhorando a análise de dados em dispositivos móveis.",
                "Correções gerais de layout em toda a aplicação para garantir a consistência visual após a reestruturação do CSS."
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
