// js/version.js - Ponto central de controlo de versão e changelog 

export const changelogData = {
current: {
    number: '15.3.0',
    changes: [
        "**Consistência de Funcionalidade (Monitorização Rápida):**",
        "Substituído o botão '+' na página 'Meus Alarmes' pelo botão 'Monitorizar Ativo', unificando a sua função com a do Market Scanner.",
        "A ação de monitorização rápida agora tem um comportamento e um feedback visual consistentes em toda a aplicação."
    ]
},
releases: [
    {
        number: '15.2.5',
        changes: [
            "**Consistência Visual (Gestão de Alarmes):**",
            "Aplicada a formatação de cor dos botões de ação (verde para gráfico, azul para TradingView) à página 'Meus Alarmes'.",
            "Garantida a consistência do estilo visual dos botões em todas as tabelas da aplicação."
        ]
    },
    {
        number: '15.2.4',
        changes: [
            "**Correção Visual (Botões de Ação):**",
            "Restaurada a formatação de cor dos botões no Market Scanner e na Watchlist de Alarmes, que havia sido perdida na versão anterior.",
            "A lógica de CSS foi corrigida para garantir que os estilos específicos (verde, azul, amarelo) se aplicam corretamente em todas as tabelas relevantes."
        ]
    },
    {
        number: '15.2.3',
        changes: [
            "**Consistência Visual (Botões de Ação):**",
            "Aplicados os estilos de cor dos botões (verde para gráfico, azul para TradingView) à tabela 'Watchlist de Alarmes' do Dashboard.",
            "As regras de CSS foram globalizadas para garantir a consistência visual em toda a aplicação."
        ]
    },
    {
        number: '15.2.2',
        changes: [
            "**Consistência de Alarmes e Correção da Watchlist:**",
            "O alarme rápido 'Monitorizar' no Market Scanner agora usa os mesmos parâmetros padrão (Stoch K=7) do formulário principal, garantindo consistência.",
            "Corrigida a lógica da 'Watchlist de Alarmes' no Dashboard para exibir sempre o alarme mais recente de um ativo, resolvendo o problema de exibição incorreta."
        ]
    },
    {
        number: '15.2.1',
        changes: [
            "**Ajuste Visual (Market Scanner):**",
            "Refinada a cor do botão 'Ver Gráfico' para um tom de verde mais escuro (#134524), melhorando a harmonia visual da interface."
        ]
    },
    {
        number: '15.2.0',
        changes: [
            "**Melhoria de UX e Funcionalidade (Market Scanner):**",
            "Reordenados os botões de ação para uma sequência mais lógica (Monitorizar, Criar Alarme, Ver Gráfico, TradingView).",
            "Adicionadas cores distintas aos botões 'Ver Gráfico' (verde) e 'TradingView' (azul) para melhor identificação visual.",
            "O botão 'Monitorizar' agora reflete o estado real, exibindo um visto amarelo permanente se o ativo já tiver um alarme ativo."
        ]
    },
    {
        number: '15.1.1',
        changes: [
            "**Correção de Layout (Detalhes do Ativo):**",
            "Resolvido um problema de alinhamento em que a coluna de notícias ficava mais alta que a do gráfico.",
            "Ambas as colunas agora partilham uma altura fixa e consistente, garantindo a simetria visual pretendida."
        ]
    },
    {
        number: '15.1.0',
        changes: [
            "**Refinamento do Layout (Detalhes do Ativo):**",
            "Ajustado o layout da página para um ecrã dividido 50/50 entre o gráfico de preço e o feed de notícias.",
            "Ambas as secções agora partilham o mesmo espaço e altura, criando uma experiência de análise mais equilibrada e simétrica."
        ]
    },
    {
        number: '15.0.1',
        changes: [
            "**Refinamento do Feed de Notícias:**",
            "Removidas as imagens do feed de notícias para uma interface mais limpa e focada na informação textual.",
            "Melhorada a formatação dos títulos e metadados para maior legibilidade e um melhor alinhamento visual com o gráfico."
        ]
    },
    {
        number: '15.0.0',
        changes: [
            "**Feature: Feed de Notícias Contextuais:**",
            "Adicionada uma secção de notícias na página de detalhes do ativo, que exibe as últimas notícias em português para a criptomoeda a ser analisada.",
            "A funcionalidade é potenciada por uma nova Supabase Edge Function (`get-crypto-news`) que comunica de forma segura com a API da CryptoCompare.",
            "O layout é responsivo, posicionando as notícias ao lado do gráfico em ecrãs maiores e abaixo em dispositivos móveis."
        ]
    },
    {
        number: '14.9.0',
        changes: [
            "**Melhoria na Gestão de Alarmes (Detalhes do Ativo):**",
            "Substituído o botão genérico 'Gerir' por ícones de ação direta para 'Editar' e 'Apagar' na tabela de alarmes ativos.",
            "Agiliza a gestão de alarmes, permitindo modificá-los ou removê-los diretamente da página de análise do ativo."
        ]
    },
        {
            number: '14.8.0',
            changes: [
                "**Melhoria de UX no Dashboard:**",
                "Adicionado um botão de 'Criar Alarme' diretamente nos cards de trade (Potencial, Armado, Ativo), permitindo a criação rápida de alarmes para ativos que já estão no funil de trading."
            ]
        },
    {
        number: '14.7.2',
        changes: [
            "**Melhoria de UX na Gestão de Alarmes:**",
            "Adicionada a funcionalidade para editar e reativar alarmes diretamente do histórico de alarmes disparados, agilizando a reutilização de setups de alarme."
        ]
    },
    {
        number: '14.7.1',
        changes: [
            "**Melhoria Visual no Sinal STC* do Scanner:**",
            "O asterisco que indica um cruzamento de Estocástico confirmado foi movido para fora do círculo do sinal, melhorando significativamente a sua legibilidade e visibilidade, especialmente no modo escuro."
        ]
    },
    {
        number: '14.7.0',
        changes: [
            "**Melhorias e Correções Gerais no Sistema de Alarmes e UI:**",
            "**Sinal Avançado no Scanner:** O sinal 'STC' agora fica laranja e exibe um '*' se, além da sobrevenda, houver um cruzamento bullish confirmado do Estocástico (4h).",
            "**Gestão de Histórico:** Adicionado um botão na página 'Meus Alarmes' para apagar todo o histórico de alarmes disparados de uma só vez.",
            "**UI do Modal de Alarmes:** O modal de reconhecimento de alarmes no Dashboard agora exibe a data e hora exatas em que o alarme foi disparado.",
            "**Lógica de Cruzamento do Estocástico:** O alarme foi refatorado para ser mais robusto. Agora, exige que o cruzamento se mantenha por duas velas fechadas consecutivas para disparar, eliminando sinais falsos.",
            "**Descrições de Alarme Detalhadas:** As descrições de alarmes complexos (ex: Cruzamento de RSI) agora exibem os parâmetros específicos (intervalo de velas, buffer) definidos pelo utilizador."
        ]
    },
    {
        number: '14.6.0', 
        changes: [
            "**Auditoria e Correção Geral da Fiabilidade dos Alarmes:**",
            "Toda a lógica de verificação de alarmes de indicadores foi refatorada para usar exclusivamente os dados de velas fechadas, eliminando disparos falsos e prematuros causados pela volatilidade da vela em andamento.",
            "As correções foram aplicadas aos alarmes de: Nível de RSI, Nível de Estocástico, Cruzamento de Estocástico, Cruzamento de RSI, Toque de EMA e o alarme Combo.",
            "A lógica de deteção de Linha de Tendência no RSI foi auditada e confirmada como já sendo robusta."
        ]
    },
    {
        number: '14.5.1', 
        changes: [
            "**Correção de Fiabilidade no Alarme de Nível de RSI:**",
            "A lógica do alarme de nível de RSI (sobrecompra/sobrevenda) foi ajustada para usar apenas os dados da última vela fechada.",
            "Esta alteração garante que o alarme só dispara quando o nível é confirmado no fecho da vela, prevenindo disparos incorretos baseados em movimentos de preço intra-vela."
        ]
    },
    {
    number: '14.5.0',
    changes: [
        "**Fiabilidade do Alarme de Cruzamento do Estocástico Melhorada:**",
        "A lógica do alarme de cruzamento do Estocástico foi refatorada para usar apenas os dados de velas fechadas.",
        "O alarme agora só dispara após a confirmação do cruzamento no fecho da vela, eliminando sinais falsos e prematuros que ocorriam durante a formação da vela atual."
    ]
},
    {
        number: '14.4.1',
        changes: [
            "**Correção de UI (Botões de Ação):**",
            "Ajustado o estilo dos botões de ação com ícone nas tabelas (Dashboard e Market Scanner) para garantir que todos têm um tamanho uniforme e quadrado, corrigindo o desalinhamento visual."
        ]
    },
    {
        number: '14.4.0',
        changes: [
            "**Gráfico em Modal no Dashboard:**",
            "A funcionalidade de ver o gráfico detalhado foi unificada. O botão de gráfico na 'Watchlist de Alarmes' agora abre um modal com o gráfico ApexChart, em vez de navegar para outra página, replicando o comportamento do Market Scanner para uma experiência mais fluida e consistente."
        ]
    },
    {
        number: '14.3.2',
        changes: [
            "**Correção do Tooltip dos Gráficos em Modo Escuro:**",
            "Resolvido o bug visual onde o tooltip (caixa de informação) dos gráficos Sparkline tinha um fundo branco ilegível no modo escuro.",
            "A função de renderização de gráficos agora deteta o tema da aplicação e instrui a biblioteca ApexCharts a usar o tema de tooltip correto (claro ou escuro)."
        ]
    },
    {
        number: '14.3.1',
        changes: [
            "**Ajuste Visual na Watchlist de Alarmes:**",
            "A cor do link na coluna 'Ultimo alarme criado' foi ajustada para ter melhor contraste e visibilidade em ambos os temas, claro (verde-escuro) e escuro (verde-claro)."
        ]
    },
    {
        number: '14.3.0',
        changes: [
            "**Melhoria na Gestão de Alarmes da Watchlist:**",
            "A coluna 'Condição do Alarme' na watchlist foi renomeada para 'Ultimo alarme criado' e agora exibe o alarme ativo mais recente.",
            "A descrição do alarme na watchlist é agora um link que abre um modal com a lista de todos os alarmes ativos para o ativo, ordenados por data de criação.",
            "O modal de gestão de alarmes agora permite apagar alarmes diretamente, oferecendo um fluxo de gestão mais rápido e integrado."
        ]
    },
    {
        number: '14.2.1',
        changes: [
            "**Correção Crítica nos Alarmes de Cruzamento do Estocástico:**",
            "Resolvido o bug onde os alarmes de cruzamento do Estocástico disparavam para ambas as direções (bullish e bearish), independentemente da condição definida.",
            "A lógica de verificação na Edge Function `check-price-alarms` foi corrigida para respeitar rigorosamente a direção ('para CIMA' ou 'para BAIXO') definida no alarme."
        ]
    },
    {
        number: '14.2.0',
        changes: [
            "**Correção e Depuração do Alarme de Quebra de L.T.:**",
            "Corrigido o bug na lógica de projeção da linha de tendência que impedia os alarmes de disparar.",
            "A tolerância de alinhamento foi ajustada para 8 pontos para uma deteção de padrões mais realista, e a lógica de deteção foi melhorada para procurar sequências válidas.",
            "Adicionado um modo de depuração à Edge Function para facilitar os testes manuais e garantir a fiabilidade da deteção."
        ]
    },
    {
        number: '14.1.1',
        changes: [
            "**Correção do Fluxo de Trabalho (Reverter para Watchlist):**",
            "Resolvida uma falha na lógica onde reverter um trade 'Potencial' sem alarmes ativos o removia de todas as vistas.",
            "O sistema agora verifica se um ativo revertido tem alarmes. Se não tiver, cria automaticamente um alarme padrão (Stoch 15m), garantindo que o ativo permanece sempre na 'Watchlist de Alarmes' após a reversão."
        ]
    },
    {
        number: '14.1.0',
        changes: [
            "**Consistência Visual (Alarmes Disparados):**",
            "A nova 'Watchlist de Alarmes' no Dashboard agora reage a alarmes disparados, tal como os cards de trade.",
            "As linhas da tabela ficam destacadas com um brilho vermelho e um botão 'OK' aparece, permitindo o reconhecimento do alarme diretamente da lista e unificando a experiência do utilizador."
        ]
    },
    {
        number: '14.0.0',
        changes: [
            "**Versão 14: Implementação da Watchlist de Alarmes e Refatoração do Fluxo de Trabalho:**",
            "**Nova Tabela no Dashboard:** Adicionada uma 'Watchlist de Alarmes' automática ao Dashboard. Qualquer ativo com um alarme ativo, que não esteja no funil de trades (Potencial, Armado, Ativo), aparece agora nesta lista para monitorização.",
            "**Ação Rápida 'Monitorizar':** Adicionado um novo botão 'Monitorizar' (ícone de olho) no Market Scanner e na página de Detalhes do Ativo. Esta ação cria instantaneamente um alarme padrão (cruzamento bullish do Estocástico em 15m) para adicionar o ativo à nova watchlist.",
            "**Novo Fluxo de Reversão:** Trades na coluna 'Potencial' agora têm a opção de 'Reverter para Watchlist', que remove o trade do funil mas mantém os seus alarmes, movendo o ativo de volta para a lista de monitorização."
        ]
    },
    {
        number: '13.8.0',
        changes: [
            "**Refatoração e Simplificação do Scanner de Mercado:**",
            "Removida a funcionalidade de 'Análise Profunda' (botão 'Analisar' e filtro de padrão), tornando a deteção de padrões de Linha de Tendência (LTA/LTB) totalmente automática e mais limpa.",
            "O scanner agora foca-se exclusivamente no sinal de '3º Toque Recente', que alerta quando uma L.T. de 3 pontos é confirmada com Estocástico e expira após 6 velas, priorizando apenas setups recentes e acionáveis.",
            "Removida a lógica anterior de 'Divergência Bullish' para focar a ferramenta na nova funcionalidade principal."
        ]
    },
    {
        number: '13.7.0',
        changes: [
            "**Novo Alarme Avançado (Quebra de Linha de Tendência RSI):**",
            "Implementado um novo tipo de alarme para detetar automaticamente a quebra de uma linha de tendência de RSI estabelecida.",
            "A lógica valida primeiro a existência de uma linha de tendência robusta (3 toques com ritmo proporcional) antes de monitorizar ativamente a sua quebra.",
            "Esta funcionalidade é processada por uma nova Edge Function dedicada (`check-trendline-alarms`) para garantir a performance e o isolamento do sistema principal de alarmes."
        ]
 },
    {
    number: '13.6.0',
    changes: [
        "**Novo Sinal Avançado (Divergência Bullish Clássica):**",
        "Implementado um novo sinal 'Div B' no Market Scanner para detetar divergências bullish clássicas, um dos indicadores de reversão mais fortes.",
        "O sinal é ativado quando são encontrados dois fundos no Estocástico (abaixo de 25), onde o RSI marca um fundo mais alto e o preço marca um fundo igual ou mais baixo.",
        "A lógica é calculada para os timeframes de 1h e 4h, e foi adicionado um filtro 'Apenas Divergência Bullish' para uma análise focada."
    ]
},
    {
        number: '13.5.0',
        changes: [
            "**Novo Sinal de Análise (Momentum Bullish):**",
            "Adicionado um novo sinal 'Mom B' ao Market Scanner para detetar potenciais divergências de momentum em sobrevenda.",
            "O sinal é calculado para os timeframes de 1h e 4h e é ativado quando o Estocástico está abaixo de 30 e o valor do RSI é superior ao da vela anterior.",
            "Incluído um novo filtro 'Apenas Momentum Bullish' para isolar rapidamente os ativos que apresentam esta condição de alta probabilidade."
        ]
    },
    {
    number: '13.4.2',
    changes: [
        "**Correção Final de UI (Alarmes):**",
        "Resolvido o bug visual onde a descrição de alarmes de 'Linha de Tendência RSI' aparecia incorretamente no modal de 'Alarmes Disparados' do Dashboard.",
        "A função de formatação de descrição de alarmes em `ui.js` foi atualizada, garantindo consistência visual em toda a aplicação."
    ]
},
    {
    number: '13.4.2',
    changes: [
        "**Correção Final de UI (Alarmes):**",
        "Resolvido o bug visual onde a descrição de alarmes de 'Linha de Tendência RSI' aparecia incorretamente no modal de 'Alarmes Disparados' do Dashboard.",
        "A função de formatação de descrição de alarmes em `ui.js` foi atualizada, garantindo consistência visual em toda a aplicação."
    ]
},
    {
        number: '13.4.1',
        changes: [
            "**Melhoria Visual (Tema Escuro):**",
            "Aumentado o contraste visual dos cards de trade no Dashboard em modo escuro.",
            "O fundo dos cards é agora ligeiramente mais claro que o fundo da coluna, criando uma melhor separação e profundidade na interface."
        ]
    },
    {
    number: '13.4.0',
    changes: [
        "**Melhoria de UX (Gestão de Alarmes):**",
        "Adicionada a funcionalidade para apagar um alarme diretamente da página de edição ('Criar ou Editar Alarme').",
        "Um botão 'Apagar Alarme' agora fica visível no modo de edição, permitindo uma gestão mais rápida e eficiente sem a necessidade de retornar à lista principal de alarmes."
    ]
},
    {
        number: '13.3.0',
        changes: [
            "**Melhoria de UX (Reconhecimento de Alarmes):**",
            "Ao clicar no botão 'Reconhecer Alarmes' no modal de um alarme disparado, a página da dashboard agora é recarregada automaticamente.",
            "Esta alteração garante um feedback visual imediato, removendo a sinalização vermelha do card do ativo sem a necessidade de uma atualização manual da página."
        ]
    },
      {
    number: '13.2.1',
    changes: [
        "**Refinação da Análise de Padrões RSI:**",
        "O histórico de análise para a deteção de linhas de tendência foi reduzido para as últimas 100 velas, focando a ferramenta em padrões mais recentes e relevantes, conforme solicitado."
    ]
},
     {
        number: '13.2.0',
        changes: [
            "**Melhoria da Análise de Padrões (Ritmo da Tendência):**",
            "A lógica de deteção de linhas de tendência no RSI foi tornada mais inteligente. Para padrões de 3 toques, a função agora analisa o 'ritmo' da tendência, garantindo que a distância entre os toques seja proporcional e evitando falsos positivos causados por pivôs muito distantes no tempo.",
            "O histórico de análise foi ajustado para um período mais focado (300 velas), melhorando a relevância dos padrões encontrados.",
            "Esta nova camada de validação aumenta significativamente a fiabilidade dos sinais de LTA/LTB gerados pelo scanner."
        ]
      },
      {
        number: '13.1.0',
        changes: [
            "**Refatoração da Análise de Padrões RSI (Scanner de Mercado):**",
            "A confirmação com o Estocástico é agora obrigatória e automática na análise de padrões de LTA/LTB do RSI, garantindo que apenas os setups de maior probabilidade são sinalizados.",
            "A lógica foi movida inteiramente para o backend (Edge Function), que agora devolve um resultado claro de 'confirmado' ou 'não confirmado' para cada padrão.",
            "Simplificada a interface do Scanner de Mercado, removendo o checkbox redundante de 'Exigir Confirmação', tornando a experiência do utilizador mais limpa e direta."
        ]
      },
      {
        number: '13.0.2',
        changes: [
            "**Correção de UI (Alarmes):**",
            "Resolvido o bug visual na página 'Meus Alarmes' onde os novos alarmes de 'Linha de Tendência RSI' exibiam uma descrição incorreta de 'Preço abaixo de null'.",
            "A lógica da interface foi atualizada para reconhecer e formatar corretamente a descrição para este tipo de alarme, tanto na lista de alarmes ativos como no histórico de alarmes disparados."
        ]
      },
      {
        number: '13.0.1',
        changes: [
            "**Correção Crítica no Sistema de Alarmes:**",
            "Resolvido o erro que impedia a verificação de todos os alarmes de indicador (RSI, Stoch, EMA, etc.), fazendo com que não fossem disparados.",
            "A causa era a falta da importação da biblioteca `technicalindicators` (com o parâmetro `?target=deno` correto para o ambiente Supabase) na Edge Function `check-price-alarms`.",
            "Com a importação alinhada à que já funcionava noutras partes do sistema, todos os tipos de alarme voltam a ser 100% funcionais."
        ]
      },
      {
        number: '13.0.0',
        changes: [
            "**Versão 13: Implementado o Módulo de Análise de Padrões de RSI (LTA/LTB):**",
            "**Novo Alarme Avançado:** Adicionado um novo tipo de alarme para detetar automaticamente o 'Nº Toque' numa Linha de Tendência de Alta (fundos ascendentes) ou de Baixa (picos descendentes) no RSI.",
            "**Scanner de Mercado Inteligente:** Integrada a mesma lógica no Market Scanner, com um botão opcional para 'Analisar Padrões RSI' num timeframe selecionável (1h, 4h, 1d).",
            "**Confirmação de Momentum:** Adicionada a opção de 'Exigir Confirmação do Estocástico' no scanner, que filtra apenas os padrões de RSI em que cada toque na linha de tendência foi confirmado por um cruzamento do Estocástico, identificando setups de altíssima probabilidade.",
            "**Novos Sinais Visuais:** A tabela do scanner agora exibe 'badges' para os padrões detetados (ex: LTA-3) e um ícone de estrela (★) para os padrões que têm a confirmação do Estocástico."
        ]
      },
      {
        number: '12.15.2',
        changes: [
            "**Melhoria Visual no Alerta de Alarme Disparado:**",
            "A cor da borda e do brilho ('glow') nos cards de alarme disparado foi tornada significativamente mais vibrante para aumentar a visibilidade e a urgência do alerta, especialmente no tema escuro.",
            "Criada uma variável de cor dedicada (`--feedback-alert-glow`) para este efeito, garantindo que a alteração não afeta a legibilidade de outros elementos vermelhos na interface."
        ]
    },
     {
    number: '12.15.1',
    changes: [
        "**Correção Crítica do Alarme RSI/MA Avançado:**",
        "Resolvido o erro que impedia a criação e edição de alarmes de cruzamento RSI/MA devido à falta da coluna `crossover_threshold` na base de dados.",
        "A coluna foi adicionada com sucesso, estabilizando a nova funcionalidade de 'Confirmação Sustentada'."
    ]
},
     {
        number: '12.15.0',
        changes: [
            "**Lógica de Alarme RSI/MA Avançada (Confirmação Sustentada):**",
            "A lógica do alarme de cruzamento RSI/MA foi completamente reescrita para verificar se o RSI *permanece* acima/abaixo da sua MA durante todo o 'Intervalo de Velas' definido.",
            "Adicionado um novo campo 'Buffer de Confirmação' que permite definir uma margem de segurança (em pontos de RSI), garantindo que o alarme só dispara quando o cruzamento é decisivo e não apenas um toque."
        ]
    },
    {
        number: '12.14.2',
        changes: [
            "**Melhoria Visual nos Sinais de P&L:**",
            "Refinada a paleta de cores para introduzir cores de 'feedback' mais vibrantes para lucro (verde) e prejuízo (vermelho), que se mantêm com alto contraste em ambos os temas, claro e escuro.",
            "O texto de variação percentual e o gráfico sparkline nos cards da watchlist agora usam estas novas cores, garantindo que os sinais de mercado sejam imediatamente percetíveis e visualmente consistentes."
        ]
    },
     {
    number: '12.14.1',
    changes: [
        "**Correção Crítica na Funcionalidade de Alarmes:**",
        "Resolvido o erro que impedia a criação de novos alarmes de 'Cruzamento RSI/MA' devido a uma coluna em falta na base de dados (`crossover_interval`). A coluna foi adicionada com sucesso.",
        "Corrigido um erro de JavaScript (`TypeError`) que ocorria na página 'Meus Alarmes', causado pela execução indevida do script da página de criação de alarmes."
    ]
},
     {
        number: '12.14.0',
        changes: [
            "**Alarmes de Cruzamento (RSI/MA) com Intervalo de Confirmação:**",
            "Adicionada a funcionalidade avançada para definir um 'Intervalo de Velas' nos alarmes de cruzamento RSI/MA.",
            "Isto permite criar alarmes que disparam não apenas no cruzamento imediato (intervalo de 1 vela), mas que confirmam a mudança de momentum ao longo de várias velas (ex: 3 velas), tornando o sinal mais robusto e adaptável a diferentes estratégias."
        ]
    },
     {
        number: '12.13.0',
        changes: [
            "**Refatoração Visual e Melhoria do Tema Escuro:**",
            "Implementada uma paleta de cores centralizada com variáveis CSS para garantir consistência visual em toda a aplicação.",
            "O tema escuro foi completamente redesenhado para usar tons de cinzento-escuro em vez de preto puro e texto em branco-suave, reduzindo o contraste e o cansaço visual.",
            "As cores de destaque (verde, amarelo, azul) agora têm tons mais sóbrios e dessaturados no modo escuro, criando uma experiência mais harmoniosa."
        ]
    },
     {
    number: '12.12.2',
    changes: [
        "**Correção Final da Exibição de Imagens da Estratégia (Modais):**",
        "Resolvido o bug onde a imagem de referência da estratégia era adicionada ao modal e imediatamente apagada pela função que desenha a checklist.",
        "A lógica foi corrigida para garantir que a imagem é inserida e mantida corretamente em todos os modais (Adicionar, Armar, Executar), finalizando a implementação da funcionalidade."
    ]
},
     {
        number: '12.12.1',
        changes: [
            "**Correção da Exibição de Imagens da Estratégia:**",
            "Resolvido o problema crítico que impedia a exibição das imagens de referência da estratégia nos modais de Adicionar e Editar trade.",
            "A lógica foi refatorada para garantir que a imagem correta de cada fase (Potencial, Armada, Execução) é carregada e exibida de forma fiável, corrigindo também o erro de `SyntaxError` que impedia o dashboard de carregar."
        ]
    },
     {
    number: '12.12.0',
    changes: [
        "**Melhorias no Construtor de Estratégias (Funcionalidade e UX):**",
        "Implementada a capacidade de reordenar os itens da checklist (checkbox, texto, etc.) através de arrastar e soltar (drag-and-drop) no gestor de estratégias, oferecendo total flexibilidade na construção dos setups.",
        "As imagens de referência definidas para cada fase da estratégia são agora exibidas corretamente no topo dos modais do Dashboard (Adicionar, Armar, Executar), fornecendo um guia visual claro durante a gestão do trade."
    ]
},
     {
    number: '12.11.1',
    changes: [
        "**Correção na Ordenação do Histórico de Alarmes:**",
        "Corrigido o problema na página de 'Detalhes do Ativo' onde o histórico de alarmes disparados não era exibido em ordem cronológica.",
        "A lista de alarmes disparados é agora corretamente ordenada pela data de disparo (`triggered_at`), com os mais recentes a aparecer no topo."
    ]
},
     {
        number: '12.11.0',
        changes: [
            "**Melhorias de Usabilidade e Gestão de Dados (Watchlist):**",
            "A aplicação agora guarda o estado (aberto/fechado) da imagem de análise nos cards da watchlist, mantendo a visualização entre sessões (`localStorage`).",
            "O campo para editar o link da imagem do gráfico foi adicionado a todos os modais de edição de trade (Potencial, Armado, Executar), permitindo que a imagem seja atualizada em qualquer fase do processo."
        ]
    },
     {
    number: '12.10.0',
    changes: [
        "**Dashboard (Watchlist) - Visualização de Imagem Integrada no Card:**",
        "Substituída a funcionalidade de modal de imagem por uma experiência integrada diretamente no card da watchlist.",
        "O botão 'imagem', visível quando um link de análise é guardado, agora expande e recolhe o card com uma animação suave para mostrar ou ocultar a imagem.",
        "Clicar na própria imagem abre-a numa nova janela do navegador para visualização em tamanho real, melhorando o fluxo de análise."
    ]
},
     {
        number: '12.9.4',
        changes: [
            "**Dashboard (Watchlist) - Acesso Rápido à Imagem do Gráfico:**",
            "Adicionado um botão de 'imagem' nos cards da watchlist, que só aparece se um link de imagem de análise foi guardado para o trade.",
            "Ao clicar neste novo botão, a imagem do gráfico é exibida num modal sobreposto, permitindo uma consulta rápida da análise sem sair da dashboard."
        ]
    },
     {
    number: '12.9.3',
    changes: [
        "**Otimização da Dashboard (Performance e Fiabilidade):**",
        "Refatorada a lógica de atualização de dados em `app.js` para separar completamente os 'ouvintes' (listeners) de trades e de alarmes.",
        "Corrigido o problema onde um novo 'ouvinte' de trades era criado a cada atualização de alarmes, o que causava atualizações duplicadas e consumo excessivo de recursos.",
        "Esta alteração garante que a dashboard é atualizada de forma muito mais eficiente e consistente, melhorando a performance geral e a robustez da aplicação."
    ]
},
     {
    number: '12.9.2',
    changes: [
        "**Correção dos Gráficos (EMAs):**",
        "Resolvido o problema crítico que impedia a exibição das EMAs nos gráficos da aplicação (ex: página de Detalhes do Ativo).",
        "A causa foi identificada como uma incompatibilidade na função do Supabase (`get-asset-details-data`) com a forma como a biblioteca `technicalindicators` devolve os dados.",
        "A função foi refatorada para lidar de forma robusta com os diferentes formatos de dados, garantindo que as EMAs são sempre calculadas e exibidas corretamente quando há dados históricos suficientes."
    ]
},
     {
    number: '12.9.1',
    changes: [
        "**Correção das Notificações de Alarme:**",
        "Resolvido o problema onde as notificações de alarmes de indicadores (ex: Estocástico, RSI) mostravam uma mensagem incorreta de 'Alarme de Preço'.",
        "A função do Supabase (`check-price-alarms`) foi corrigida para gerar a mensagem de notificação específica e correta para cada tipo de alarme, garantindo que o alerta recebido corresponde exatamente à condição que o disparou."
    ]
},
     {
    number: '12.9.0',
    changes: [
        "**Dashboard (Watchlist) - Reverter Status do Trade:**",
        "Implementada a funcionalidade para reverter o status de um trade de 'Armado' ou 'Ativo' para um estado anterior.",
        "Nos modais de edição, foram adicionados botões que permitem ao utilizador regredir o status de um trade, por exemplo, de 'Armado' de volta para 'Potencial', oferecendo mais flexibilidade na gestão da watchlist."
    ]
},
     {
    number: '12.8.0',
    changes: [
        "**Dashboard (Watchlist) - Ordem de Prioridade em Mobile:**",
        "A ordem de exibição das colunas da watchlist em dispositivos móveis foi ajustada para seguir a prioridade: 1º Ativo, 2º Armado, 3º Potencial.",
        "Implementada uma lógica para esconder automaticamente as colunas que não contêm trades (tanto em mobile como em desktop), resultando numa interface mais limpa."
    ]
},
     {
    number: '12.7.0',
    changes: [
        "**Dashboard (Watchlist) - Melhorias de UI/UX:**",
        "O botão 'Adicionar à Watchlist' foi revertido para a sua posição na segunda linha de navegação contextual, com texto, para maior clareza e acessibilidade.",
        "Os ícones de sino (para alarmes ativos e disparados) nos cards da watchlist foram atualizados para terem preenchimento vermelho, aumentando a sua visibilidade."
    ]
},
     {
    number: '12.6.0',
    changes: [
        "**Melhorias na Gestão e Visualização de Alarmes:**",
        "A lista de alarmes disparados na página 'Meus Alarmes' é agora corretamente ordenada pela data de disparo, com os mais recentes no topo.",
        "A página de 'Detalhes do Ativo' agora exibe uma nova secção com o histórico de alarmes que já foram disparados para aquele ativo específico."
    ]
},
     {
    number: '12.5.0',
    changes: [
        "**Gestão de Estratégias - Adicionar Imagens de Referência:**",
        "Implementada a funcionalidade para adicionar um link de imagem como um item numa fase de estratégia no `strategies-manager`.",
        "Quando uma estratégia é selecionada no modal de 'Adicionar Ativo à Watchlist', a imagem associada à primeira fase é agora exibida como uma referência visual direta do padrão ou setup."
    ]
},
     {
    number: '12.4.1',
    changes: [
        "**Dashboard (Watchlist) - Melhoria no Fluxo de Reconhecimento de Alarmes:**",
        "O botão 'OK' num card de alarme disparado agora apenas abre o modal com a lista de alarmes, sem fazer o 'reset' automático do estado visual.",
        "Adicionado um novo botão 'Reconhecer Alarmes' dentro do modal de alarmes disparados, que agora é o único responsável por executar a ação de 'reset' do frame vermelho no card.",
        "Esta alteração dá ao utilizador mais controlo e intencionalidade sobre quando o aviso de um alarme disparado é removido."
    ]
},
     {
    number: '12.4.0',
    changes: [
        "**Dashboard (Watchlist) - Gestão de Alarmes Melhorada (Final):**",
        "Removida a funcionalidade do gráfico expansível ApexCharts dos cards para uma interface mais limpa e focada.",
        "O ícone de sino (para alarmes ativos) é agora clicável e abre um modal com uma lista de todos os alarmes ativos para o ativo, com opções para editar.",
        "O botão 'OK' (para alarmes disparados) agora inclui um ícone de sino e, ao ser clicado, abre um modal com o alarme disparado (com opção de editar) antes de fazer o 'reset' do estado visual do card.",
        "Corrigido o erro que impedia a abertura do modal de alarmes, garantindo que os dados são sempre buscados da base de dados no momento do clique."
    ]
},
     {
    number: '12.3.0',
    changes: [
        "**Dashboard (Watchlist) - Gestão de Alarmes Melhorada:**",
        "Removida a funcionalidade do gráfico expansível ApexCharts dos cards para uma interface mais limpa.",
        "O ícone de sino (para alarmes ativos) é agora clicável e abre um modal com uma lista de todos os alarmes ativos para o ativo, com opções para editar.",
        "O botão 'OK' (para alarmes disparados) agora inclui um ícone de sino e, ao ser clicado, abre um modal com o alarme disparado (com opção de editar) antes de fazer o 'reset' do estado visual do card."
    ]
},
     {
    number: '12.2.0',
    changes: [
        "**Market Scanner - Melhorias de Funcionalidade:**",
        "Adicionada a opção para exibir um número configurável de ativos (Top 30, 50, 100, 200).",
        "O título da secção do scanner foi tornado dinâmico para refletir a seleção do 'Mostrar Top'.",
        "O filtro do Estocástico (STOCH) foi alterado para usar o timeframe de 4 horas, mantendo o RSI em 1 hora. A Edge Function `get-sparklines-data` foi atualizada para buscar dados de ambos os timeframes.",
        "A preferência do utilizador para 'Mostrar Top N' é agora guardada entre sessões (`localStorage`)."
    ]
},
     {
    number: '12.1.1',
    changes: [
        "**Correção da Visibilidade dos Ícones em Tabelas:**",
        "Resolvido o problema onde os ícones Google Fonts não apareciam nos botões de ação das tabelas (Market Scanner, Gestão de Alarmes, etc.).",
        "A causa foi identificada como uma regra CSS (`buttons.css`) que ocultava indevidamente os `<span>` dos ícones. A regra foi ajustada para ser mais específica e garantir a visibilidade dos ícones em todos os contextos."
    ]
},
     {
    number: '12.1.0',
    changes: [
        "**Refatoração de Ícones e Estilo de Navegação (UI/UX):**",
        "Substituída a biblioteca de ícones Font Awesome pelos Google Fonts Icons em toda a aplicação para um visual mais moderno e consistente.",
        "O ícone 'Criar Alarme' foi alterado para `alarm_add` e 'Meus Alarmes' para `alarm`.",
        "O botão do Scanner de Mercado foi destacado com uma cor verde para melhor visibilidade, conforme solicitado."
    ]
},
     {
    number: '12.0.0',
    changes: [
        "**Criação de Alarme de Preço (UX Melhorada):**",
        "Implementada uma funcionalidade de duplo clique no campo de preço na página de criação de alarmes.",
        "Ao fazer duplo clique, o campo é agora preenchido automaticamente com o preço atual do ativo selecionado, facilitando a criação de alarmes para moedas com muitas casas decimais."
    ]
},
     {
    number: '11.13.2',
    changes: [
        "**Página de Detalhes do Ativo - Histórico de Trades (Apenas Fechados):**",
        "A tabela 'Histórico de Trades' na página de detalhes do ativo foi corrigida para exibir apenas os trades com o status 'CLOSED'.",
        "A função `getTradesForAsset` em `firebase-service.js` foi atualizada para incluir um filtro `where(\"status\", \"==\", \"CLOSED\")`, garantindo que apenas o histórico relevante é mostrado."
    ]
},
     {
    number: '11.13.1',
    changes: [
        "**Correção do Botão de Tema:**",
        "Resolvido o problema onde o botão para alternar entre o modo claro/escuro não funcionava na página do Dashboard.",
        "A causa foi identificada como um ID duplicado (`theme-toggle-btn`) no HTML, que foi removido para garantir o funcionamento correto do script em todas as páginas."
    ]
},
     {
    number: '11.13.0',
    changes: [
        "**Dashboard (Watchlist) - Opção 'Apagar Trade' no Modal de Edição:**",
        "Adicionado um botão 'Apagar Trade' diretamente no modal de edição/adição de oportunidade, visível apenas ao editar um trade existente.",
        "A funcionalidade permite apagar trades da watchlist de forma rápida e intuitiva.",
        "A lógica foi implementada em `js/handlers.js` e `js/modals.js` para gerir a visibilidade do botão e a operação de eliminação."
    ]
},
     {
    number: '11.12.0', 
    changes: [
        "**Gráfico Principal (Página de Detalhes) e Modal (Market Scanner) - EMAs Completas e Zoom:**",
        "Resolvido o problema onde as médias móveis exponenciais (EMAs 50 e 200) não eram desenhadas na totalidade nos gráficos ApexCharts.",
        "A Edge Function `get-asset-details-data` foi refatorada para sempre buscar dados históricos suficientes da Binance (ex: 450 klines) para o cálculo completo de todas as EMAs, independentemente do 'zoom' pedido pelo frontend.",
        "Os dados de OHLC e indicadores retornados pela Edge Function são agora fatiados (`.slice()`) para corresponder ao `limit` de visualização pedido pelo frontend (ex: 170 klines para 7 dias no TF de 1h), garantindo o 'zoom' desejado sem comprometer o cálculo dos indicadores."
    ]
},
     {
    number: '11.11.0',
    changes: [
        "**Market Scanner - Gráfico do Modal (Zoom Padrão para 7 Dias):**",
        "O gráfico do modal na página do Market Scanner foi ajustado para exibir aproximadamente 7 dias de dados no timeframe de 1h.",
        "O `limit` passado à Edge Function `get-asset-details-data` foi definido para 170 klines, proporcionando o zoom desejado."
    ]
},
     {
    number: '11.10.0', 
    changes: [
        "**Navegação - Botão da Página Ativa:**",
        "O botão de navegação correspondente à página atual é agora destacado com uma cor de 'desativado' (cinzento neutro) e não é clicável.",
        "Esta melhoria visual torna a navegação mais intuitiva e indica claramente onde o utilizador se encontra na aplicação."
    ]
},
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
