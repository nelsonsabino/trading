// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
    current: {
        number: '9.3.1', // <-- VERSÃO ATUALIZADA (Remoção da secção de notícias)
        changes: [
            "**Simplificação da Página de Detalhes:** Removida a secção de notícias da página de detalhes do ativo para uma interface mais limpa e focada na análise técnica e nos dados da aplicação."
        ]
    },
    releases: [
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
        {
            number: '8.10.2',
            changes: [
                "**Correções Críticas de UI:**",
                "Resolvido o problema de inconsistência de tamanho e estilo dos botões de ação com ícone em todas as tabelas (Scanner, Alarmes, Gestão e Detalhes do Ativo), garantindo uma aparência compacta e uniforme.",
                "Corrigida a formatação de preços em moedas de baixo valor no Market Scanner, exibindo a precisão correta (mais casas decimais).",
                "O botão 'Ver Gráfico no Modal' nas tabelas agora é um link (`<a>`) para garantir consistência de estilo com os outros botões de ação.",
            ]
        },
        {
            number: '8.10.1',
            changes: [
                "**Sinais de Mercado Otimizados:**",
                "Os sinais visuais de RSI e Estocástico no Market Scanner agora são calculados para o timeframe de **1 hora** (revertendo a alteração anterior de 5 minutos para RSI e adicionando Estocástico em 1h), oferecendo uma perspetiva diária mais estável.",
                "Os gráficos Sparkline continuam a mostrar consistentemente os dados das últimas **24 horas** (timeframe de 1 hora), independentemente dos timeframes dos indicadores. A Edge Function `get-sparklines-data` foi ajustada para buscar dados de múltiplos timeframes em paralelo, garantindo a informação completa."
            ]
        },
        {
            number: '8.10.0',
            changes: [
                "**Scanner de Mercado Otimizado (Ordenação e Filtros):**",
                "Adicionadas opções para ordenar os ativos por Volume, Variação Percentual (Ascendente/Descendente) e Símbolo (A-Z).",
                "Implementados filtros para exibir apenas ativos com RSI < 45 (1h) e/ou Estocástico < 20 (1h), permitindo uma análise mais direcionada.",
                "A ordenação e filtragem são aplicadas no frontend sobre os dados em cache, resultando numa experiência de utilizador fluida e instantânea.",
            ]
        },
        {
            number: '8.9.1',
            changes: [
                "**Sinais de Mercado Otimizados:**",
                "Os sinais visuais de RSI e Estocástico no Market Scanner agora são calculados para o timeframe de **1 hora** (revertendo a alteração anterior de 5 minutos para RSI e adicionando Estocástico em 1h), oferecendo uma perspetiva diária mais estável.",
                "Os gráficos Sparkline continuam a mostrar consistentemente os dados das últimas **24 horas** (timeframe de 1 hora), independentemente dos timeframes dos indicadores. A Edge Function `get-sparklines-data` foi ajustada para buscar dados de múltiplos timeframes em paralelo, garantindo a informação completa."
            ]
        },
        {
            number: '8.9.0',
            changes: [
                "**Sinais de Mercado Expandidos:**",
                "Adicionado um novo sinal visual 'STC' (Estocástico) no Market Scanner para ativos cujo Estocástico de 15 minutos (%K ou %D) esteja abaixo de 20 (Sobrevenda).",
                "Os gráficos Sparkline no Market Scanner agora mostram consistentemente os dados das últimas **24 horas** (timeframe de 1 hora), independentemente do timeframe usado para calcular os sinais de RSI ou Estocástico. A Edge Function `get-sparklines-data` foi significativamente melhorada para buscar dados de múltiplos timeframes em paralelo."
            ]
        },
        {
            number: '8.8.1',
            changes: [
                "**Sinal de RSI Ajustado:** O sinal de RSI no Market Scanner agora é calculado para o timeframe de **5 minutos** (em vez de 1 hora), permitindo uma análise mais rápida das condições de sobrevenda no curto prazo. A Edge Function `get-sparklines-data` foi ajustada para refletir esta alteração."
            ]
        },
        {
            number: '8.8.0',
            changes: [
                "**Análise Adicional no Scanner:** Adicionado um sinal visual 'RSI' no Market Scanner para ativos cujo RSI de 1 hora esteja abaixo de 45, ajudando a identificar rapidamente potenciais oportunidades de sobrevenda.",
                "O cálculo do RSI é agora efetuado de forma eficiente no backend através de uma Edge Function melhorada."
            ]
        },
        {
            number: '8.7.0',
            changes: [
                "**Redesign Visual:** Substituídos os widgets do TradingView na página de detalhes do ativo por um gráfico limpo e customizado (ApexCharts) para uma melhor estética, performance e consistência visual com o resto da aplicação."
            ]
        },
        {
            number: '8.6.0',
            changes: [
                "**Melhorias na Página de Detalhes do Ativo:**",
                "Configuração do gráfico principal melhorada para uma análise mais limpa.",
                "Adicionado um widget de Análise Técnica avançado com múltiplos timeframes.",
                "Integrada uma nova secção com as últimas notícias do ativo (via CryptoCompare).",
                "Adicionados botões de ação rápida no cabeçalho (Adicionar à Watchlist, Criar Alarme, Análise TV).",
                "Implementado um layout 50/50 para os gráficos em ecrãs maiores para melhor visualização."
            ]
        },
        {
            number: '8.5.0',
            changes: [
                "**Nova Funcionalidade: Página de Detalhe do Ativo.**",
                "Adicionada uma nova página (`asset-details.html`) que centraliza todas as informações de um ativo específico.",
                "A página exibe um gráfico avançado, análise técnica, e tabelas com todos os alarmes e trades relacionados ao ativo.",
                "Os nomes dos ativos no Dashboard, Scanner de Mercado e página de Alarmes são agora links diretos para esta nova página de análise."
            ]
        },
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
