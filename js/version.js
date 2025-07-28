// js/version.js - Ponto central de controlo de versão e changelog

export const changelogData = {
current: {
    number: '11.10.0', // <-- NOVA VERSÃO ATUALIZADA
    changes: [
        "**Navegação - Botão da Página Ativa:**",
        "O botão de navegação correspondente à página atual é agora destacado com uma cor de 'desativado' (cinzento neutro) e não é clicável.",
        "Esta melhoria visual torna a navegação mais intuitiva e indica claramente onde o utilizador se encontra na aplicação."
    ]
},
 releases: [
  
{
    number: '11.9.4', // 
    changes: [
        "**Dashboard (Watchlist) - Redirecionamento de Alarme Corrigido:**",
        "Resolvido o problema onde a opção 'Criar um alarme para este ativo após guardar' nos modais de criação/edição de trades redirecionava para uma página inexistente (`alarms.html`).",
        "O redirecionamento agora aponta corretamente para a página de criação de alarmes (`alarms-create.html`), garantindo um fluxo de trabalho contínuo."
    ]
},     
{
    number: '11.9.3', 
    changes: [
        "**Página de Detalhes do Ativo - Botão 'Gerir Alarme':**",
        "Corrigido o link do botão 'Gerir' na tabela de alarmes ativos, na página de detalhes do ativo.",
        "O botão agora redireciona corretamente para a página de gestão de alarmes (`alarms-manage.html`), garantindo que o utilizador pode gerir os seus alarmes sem erros 404."
    ]
},
     {
    number: '11.9.2',
    changes: [
        "**Página de Detalhes do Ativo - Histórico de Trades:**",
        "Corrigida a funcionalidade de exibição do histórico de trades para um ativo específico.",
        "A tabela agora carrega e exibe corretamente os trades relacionados à moeda, incluindo informações de status, data e P&L.",
        "O botão 'Ver/Editar' nos trades da tabela agora redireciona corretamente para o Dashboard para edição."
    ]
},
     {
    number: '11.9.1',  
    changes: [
        "**Dashboard de Estatísticas - Correção da Curva de Capital (Final):**",
        "Resolvido o problema onde o gráfico 'Curva de Capital' não era renderizado ou mostrava comportamento inesperado, especialmente com múltiplos trades.",
        "A causa foi identificada e corrigida ao garantir que os trades fechados são ordenados cronologicamente na base de dados (`firebase-service.js`), eliminando a 'curva dupla' e assegurando a representação correta do P&L acumulado.",
        "Criado o índice composto necessário no Firebase Firestore para a consulta eficiente de trades fechados, resolvendo o `FirebaseError` de permissões."
    ]
},
  {
    number: '11.9.0',  
    changes: [
        "**Dashboard de Estatísticas - Histórico de Trades Fechados:**",
        "Adicionada uma nova secção expansível no final da página de Estatísticas para exibir um histórico detalhado de todos os trades fechados.",
        "Os trades são listados do mais recente para o mais antigo, com informações como ativo, estratégia, preços de entrada/saída, P&L, razão de fecho e notas.",
        "Incluído um link para o screenshot de saída do trade (se disponível), com visualização em modal.",
        "A secção pode ser expandida e recolhida para otimizar o espaço na página."
    ]
},  
  {
        number: '11.8.0', 
        changes: [
            "**Dashboard de Estatísticas - Correção da Curva de Capital:**",
            "Resolvido o problema onde o gráfico 'Curva de Capital' não era renderizado corretamente com um ou dois trades realizados.",
            "A função de renderização foi otimizada para garantir que os dados são formatados de forma robusta e que instâncias anteriores do gráfico são destruídas antes de criar uma nova."
        ]
    },
    {
        number: '11.7.0', 
        changes: [
            "**Dashboard de Estatísticas - Remoção de Gráfico:**",
            "Removido o gráfico 'Desempenho por Estratégia' da página de Estatísticas para simplificar a visualização e focar nas métricas principais."
        ]
    },
    {
        number: '11.6.0', 
        changes: [
            "**Market Scanner - Zoom nos Gráficos do Modal:**",
            "A visualização de gráficos no modal do Market Scanner foi otimizada para exibir um período de tempo mais curto (~9 dias para o timeframe de 1h), proporcionando um 'zoom' automático nos dados mais recentes.",
            "A Edge Function `get-asset-details-data` foi atualizada para aceitar um parâmetro `limit`, permitindo que o frontend solicite um número específico de klines.",
            "Resolvidos múltiplos erros de deploy e `Module not found` na Edge Function, estabilizando a importação de bibliotecas externas (`technicalindicators`)."
        ]
    },
    {
        number: '11.5.0', 
        changes: [
            "**Market Scanner - Controlo de Top N Moedas:**",
            "Implementada a opção para exibir um número configurável de ativos (Top 30, 50, 100, 200) na tabela do Market Scanner.",
            "O estado da seleção do 'Top N' é persistente: a aplicação lembra a preferência do utilizador entre sessões (utilizando `localStorage`).",
            "A lista de tickers é agora inicialmente buscada em maior quantidade (Top 200) para garantir que todas as opções de exibição de 'Top N' estão disponíveis sem novas chamadas de API."
        ]
    },
    {
        number: '11.4.0', 
        changes: [
            "**Market Scanner - Controlo de Sparklines e Persistência:**",
            "Implementada a opção para ligar/desligar a exibição dos sparklines na tabela do Market Scanner, através de um novo checkbox.",
            "Quando desativados, a coluna 'Sparkline (24h)' é agora completamente oculta (cabeçalho e células), otimizando o espaço.",
            "O estado da exibição dos sparklines é persistente: a aplicação lembra a preferência do utilizador entre sessões (utilizando `localStorage`).",
            "Resolvido o `ReferenceError` no filtro do Estocástico no `market-scan.js` e assegurada a sua funcionalidade correta, ajustando a condição de volta para `< 20`."
        ]
    },
     {
        number: '11.3.3', 
        changes: [
            "**Sinalização e Gestão de Alarmes nos Cards da Watchlist (Dashboard):**",
            "Implementada a visualização de alarmes ativos nos cards do dashboard com um ícone de sino vermelho.",
            "Cards de ativos com alarmes disparados e não reconhecidos são agora realçados com uma borda vermelha e sombra.",
            "Adicionado um botão 'OK' no card para 'reconhecer' alarmes disparados, removendo a sinalização visual do card (atualiza o campo `acknowledged` no Supabase).",
            "Corrigido o erro de subscrição em tempo real de alarmes (`TypeError`) no `services.js` para garantir a atualização dinâmica dos cards com base no estado dos alarmes."
        ]
    },
    {
        number: '11.3.2', 
        changes: [
            "**Correção do Sinal e Filtro Estocástico (Market Scanner):**",
            "Resolvido o problema onde o sinal do Estocástico (STOCH) não aparecia e o filtro não devolvia resultados no Market Scanner.",
            "Corrigida a incompatibilidade na leitura dos dados do Estocástico da Edge Function (`get-sparklines-data`) no `market-scan.js`, garantindo que o valor K é interpretado corretamente.",
            "Ajustada a condição para exibir o sinal e para o filtro, com o valor padrão de `< 20` para os níveis do Estocástico."
        ]
    },  
    {
        number: '11.3.1', 
        changes: [
            "**Refatoração do Código de Autenticação:**",
            "Centralizada toda a configuração de autenticação do Firebase no ficheiro `firebase-service.js`, incluindo a inicialização e a definição da persistência da sessão.",
            "Esta alteração melhora a organização do código e estabelece uma base mais limpa para futuras depurações do sistema de login."
        ]
    },
    {
            number: '11.3.0',
            changes: [
                "**Reorganização do Menu de Navegação (UI/UX):**",
                "O cabeçalho foi reestruturado com uma navegação de duas linhas para melhor clareza e organização.",
                "A primeira linha (`main-nav`) contém a navegação global e a gestão de sessão (logout).",
                "A segunda linha (`contextual-nav`) agora exibe botões de ação específicos da página atual (ex: 'Adicionar à Watchlist' no Dashboard), com um estilo visual distinto.",
                "O botão para alternar o tema (claro/escuro) foi movido para uma posição fixa no canto superior direito do ecrã, garantindo acesso constante em todas as páginas."
            ]
        },
        {
            number: '11.2.0',
            changes: [
                "**Implementação Completa de Acesso Privado e Landing Page:**",
                "Criada uma nova 'Landing Page' (`index.html`) como a página de entrada pública da aplicação.",
                "O Dashboard principal foi renomeado para `dashboard.html` e agora é uma página privada, acessível apenas após o login.",
                "Implementada uma 'whitelist' de acesso: apenas o email do administrador configurado em `js/auth.js` tem permissão para fazer login e aceder às funcionalidades da aplicação. Outros utilizadores Google são bloqueados.",
                "Todas as ligações internas da aplicação foram atualizadas para refletir a nova estrutura de `index.html` (landing page) e `dashboard.html` (dashboard principal).",
                "Resolvidos todos os problemas de redirecionamento e autenticação que impediam o fluxo de login e acesso exclusivo."
            ]
        },
        {
            number: '11.1.1',
            changes: [
                "**Correção de Estilo (Página de Estatísticas):**",
                "Ajustado o layout da secção 'Gestão de Portfólio' para corresponder ao design visual de referência, incluindo o aumento do título, a adição de um separador e o correto alinhamento do saldo."
            ]
        },
        {
            number: '11.1.0',
            changes: [
                "**Correção e Finalização do Sistema de Autenticação:**",
                "Resolvido o problema de falha no login com Google nos ambientes de produção (GitHub Pages e Netlify).",
                "Corrigida a configuração de segurança autorizando os domínios da aplicação tanto no 'Firebase Authentication' (Domínios Autorizados) como na 'Google Cloud Console' (Restrições de Chave de API).",
                "O fluxo de login está agora totalmente funcional e seguro em todos os domínios."
            ]
        },
        {
            number: '11.0.0',
            changes: [
                "**Implementação do Sistema de Autenticação (Versão 11):**",
                "Adicionado sistema de login seguro utilizando Firebase Authentication com o provedor Google.",
                "Criada uma nova página de login (`login.html`) como porta de entrada para a aplicação.",
                "Implementada a proteção de rotas: utilizadores não autenticados são automaticamente redirecionados para a página de login.",
                "Adicionada a secção do utilizador no cabeçalho de todas as páginas, exibindo a foto do perfil e um botão de logout.",
                "As Regras de Segurança do Firestore foram atualizadas para exigir autenticação para todas as operações de escrita e eliminação, protegendo a integridade dos dados."
            ]
        },
        {
            number: '10.2.1',
            changes: [
                "**Correção de Permissões (Firebase):**",
                "Resolvido o erro de 'permissões insuficientes' que impedia a eliminação de trades na página de Gestão e o registo de transações na página de Estatísticas.",
                "A causa foi identificada como regras de segurança restritivas do Firebase, que foram ajustadas para permitir operações de escrita e eliminação durante o desenvolvimento.",
                "Melhorada a estrutura do `manage.js` para garantir que o script só é executado após o carregamento completo da página."
            ]
        },
        {
            number: '10.2.0',
            changes: [
                "**Gráfico do Market Scanner Melhorado:**",
                "O gráfico de visualização rápida no modal da página do Market Scanner foi substituído.",
                "Agora utiliza o mesmo motor de gráfico avançado (ApexCharts) da página de detalhes do ativo, exibindo por defeito um gráfico de linhas com as EMAs 50 e 200.",
                "Esta alteração unifica a experiência de análise, proporcionando uma ferramenta consistente e poderosa em toda a aplicação."
            ]
        },
        {
            number: '10.1.0',
            changes: [
                "**Correção da Edição de Alarmes (Multi-dispositivo):**",
                "Resolvido o problema onde a edição de um alarme falhava ao navegar entre páginas ou dispositivos.",
                "A página de criação/edição de alarmes (`alarms-create.js`) agora busca os dados do alarme a ser editado diretamente da base de dados (Supabase) em vez de depender de um cache local, garantindo que a funcionalidade de edição é robusta e funciona de forma consistente em qualquer cenário."
            ]
        },
        {
            number: '10.0.0',
            changes: [
                "**Segurança de Chaves API (Versão 10):**",
                "Implementado um sistema de segurança robusto para proteger as chaves de API (Firebase, Supabase, CryptoCompare) utilizando GitHub Secrets e GitHub Actions. As chaves secretas foram removidas do código fonte e são agora injetadas de forma segura durante o processo de deploy.",
                "As Regras de Segurança do Firebase foram atualizadas para permitir a leitura pública de dados (trades e estratégias), garantindo que a watchlist e outras funcionalidades da aplicação carregam corretamente, mantendo as permissões de escrita seguras.",
                "Corrigidos os caminhos dos ficheiros para o Service Worker e o `site.webmanifest`, resolvendo os erros 404 e garantindo que a funcionalidade PWA (Progressive Web App) funciona corretamente no ambiente do GitHub Pages."
            ]
        },
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
