// js/strategies.js (VERSÃO COM 'Fib VAL Breakout')

export const STRATEGIES = {

    /* ------------------------------------------------------------------------ */    
    /* ------------ Fib VAL Breakout (NOVA VERSÃO) ------------ */
    /* ------------------------------------------------------------------------ */ 

    'Fib-VAL-Breakout': {
        name: "Fib VAL Breakout",
        potentialPhases: [
            {
                title: "Fase 1: Contexto e Zonas de Interesse (Diário ou 4h)",
                checks: [
                    { id: "pot-pi-tendencia", label: "Identificar tendência", required: false },
                    { id: "pot-pi-val-marcado", label: "Marcar VAL desde o <strong> topo até à base </strong> na correção principal", required: true },
                    { id: "pot-pi-fibo-marcado", label: "Desde a <strong> base até ao topo </strong> do 1º pullback, verificar que zona de Fibonacci faz <strong> confluência com o VAL </strong> (0.382, 0.5, 0.618).", required: true },
                    { id: "pot-pi-alarmes", label: "Alarmes colocados nas zonas de interesse (VAL, Fibo, topo)?", required: true }
                ]
            }
        ],
        armedPhases: [
            {
                title: "Fase 2: Confirmação e Gatilho (1h ou 15min.)",
                checks: [
                    { id: "armed-pi-fibo-ext-marcado", label: "Do <strong> topo até à base da correção antes da entrada</strong>, marcar alvos com <strong> extensões de Fibonacci: 1.272 / 1.414 / 1.618</strong>", required: true },
                    { id: "armed-pi-volume-ok", label: "Volume da subida <strong> é maior </strong> que o volume da correção (análise com Date Range).", required: true },
                    { id: "armed-pi-stoch-reset", label: "Estocástico fez reset (sobrevenda)", required: true },
                    { id: "armed-pi-rsi-break", label: "RSI quebrou a LTB (linha de tendência de baixa)", required: true },
                    { id: "armed-pi-alarmes-gatilho", label: "Alarmes de gatilho colocados (RSI, Stoch)?", required: true }
                ]
            }
        ],
        executionPhases: [
            {
                title: "Fase 3: Registo dos Alvos de Gestão",
                // Nota: Os campos de Entrada, Stop Loss e Quantidade virão do GESTAO_PADRAO automaticamente.
                inputs: [
                    // Alterei para um check, pois parece fazer mais sentido do que um campo de texto aqui.
                    { id: "exec-pi-alarmes-alvo", label: "Alarmes colocados em cada alvo para gestão ativa (1.272 / 1.414 / 1.618)?", type: "checkbox", required: true }
                ]
            }
        ]
    },


    /* ------------------------------------------------------------------------ */    
               /* ------------ PREÇO EM SUPORTE ------------ */
    /* ------------------------------------------------------------------------ */           
    
    'preco-suporte': {
        name: "Preço em suporte com confluencias",
        potentialPhases: [
            { 
                title: "Análise Macro Inicial",
                exampleImageUrl: "https://i.imgur.com/exemplo1.png",
                inputs: [ 
                    { id: "pot-id-tf", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true },
                    { id: "pot-id-rsi-ltb", label: "RSI furou LTB?", type: "select", options: ["Sim, com força", "Não, mas ainda tem espaço", "Não, está encostado"], required: true }
                ],
                checks: [
                    { id: "pot-id-suporte", label: "Preço está em zona de suporte?", required: true },
                    { id: "pot-id-ema50", label: "EMA50 a suportar ou com espaço?", required: true },
                    { id: "pot-id-divergencia", label: "Divergência bullish nos indicadores?", required: false },
                    { id: "pot-id-alarme", label: "Algum alarme foi colocado?", required: true }
                ]
            }
        ],
        armedPhases: [
            { 
                title: "Validação do Setup (no TF de Análise)",
                exampleImageUrl: "https://i.imgur.com/exemplo2.png",
                inputs: [ { id: "armed-id-image-url", label: "Link da Imagem do Gráfico (Fase Armado):", type: "text", required: false } ],
                checks: [
                    { id: "armed-id-tendencia", label: "Preço quebrou LTB ou tem espaço?", required: true },
                    { id: "armed-id-stoch", label: "Stochastic baixo e a cruzar Bullish?", required: true },
                    { id: "armed-id-vah", label: "Preço NÃO está no limite do VAH?", required: true },
                    { id: "armed-id-rhl", label: "RSI está a fazer Higher Lows?", required: true },
                    { id: "armed-id-rsi-ma", label: "RSI > RSI-MA? (Aumenta Prob.)", required: false }, 
                    { id: "armed-id-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                    { id: "armed-id-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
                ]
            }
        ],
        executionPhases: [
            { 
                title: "Gatilho de Precisão",
                exampleImageUrl: "https://i.imgur.com/exemplo3.png",
                inputs: [{ id: "exec-id-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }],
                checks: [{ id: "exec-id-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true }],
                radios: {
                    name: "gatilho-final-id", 
                    label: "Escolha o gatilho final:",
                    options: [
                        { id: "exec-id-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                        { id: "exec-id-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" }
                    ]
                }
            }
        ]
    }, 

    /* ------------------------------------------------------------------------ */    
               /* ------------ EMA50 4h ------------ */
    /* ------------------------------------------------------------------------ */       
   
    'EMA50 4h': {
        name: "EMA50 4h",
       
        potentialPhases: [
            { 
                title: "Fase Potencial (Análise 4h)",         
                exampleImageUrl: "pic/stoch4.png", 
                checks: [
                    { id: "pot-c3-stoch-reset", label: "Stochastic fez reset?", required: true },
                    { id: "pot-c3-confluencia", label: "Preço em zona de suporte com confluências (EMA, Fib. RSI...)", required: true },
                    { id: "pot-c3-rse_resistencia", label: "RSI afastado da resistência", required: true },
                    { id: "pot-c3-target", label: "Target price definido", required: true }

                ]
            }
        ],
       
        armedPhases: [
            {
                title: "Fase Armar (Confirmação 1h)",
                exampleImageUrl: "pic/stoch1.png", 
                checks: [
                    { id: "armed-c3-rsi-ma", label: "Preço e RSI inverteram tendência descendente", required: true },
                    { id: "armed-c3-stoch-subir", label: "Stochastic (1h) está prestes a fazer reset", required: true },
                    { id: "armed-c3-base-frvp", label: "Preço acima da base local do FRVP", required: true },
                    { id: "armed-c3-hl-rsi", label: "Higher low do RSI", required: false }
                        
                ]
            }
        ],
       
        executionPhases: [
            {
                title: "Fase Executar (Gatilho 15min)",
                exampleImageUrl: "pic/stoch15.jpg", 
                checks: [
                    { id: "exec-c3-stoch-reset", label: "Entrar no próximo reset do Stochastic (15m)?", required: true },
                    { id: "exec-c3-rsi-hl", label: "RSI fez um Higher Low neste reset?", required: true },
                    { id: "exec-c3-rsi-toque3", label: "Este é o 3º toque no suporte do RSI? (Aumenta Prob.)", required: false }
                ]
            }
        ]
    }

};
