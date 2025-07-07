// js/strategies.js 

export const STRATEGIES = {

    /* ------------------------------------------------------------------------ */    
    /* ------------ Resistance-Breakout ------------ */
    /* ------------------------------------------------------------------------ */ 

   'Resistance-Breakout': {
    name: "Resistance Breakout into Support",
    potentialPhases: [
        {
            title: "Fase 1: Rompimento da resistência (TF 1h, 4h ou D)",
            exampleImageUrl: "pic/Resistencia-suporte_1h.png", 
            inputs: [
                { 
                    id: "pot-rb-tf",
                    label: "Timeframe de Análise:", 
                    type: "select", 
                    options: ["1h", "4h", "1d"],
                    required: true 
                }
               
            ],
            checks: [
                { id: "pot-rb-ema", label: "Preço acima de EMA50, ou 200", required: true },
                { id: "pot-rb-rsi-hl", label: "RSI está com Higher Low, ou divergência bullish", required: true },
                { id: "pot-rb-resistance-break", label: "Preço rompeu resistência e está acima de niveis com confluência (ex.Fib.+EMA)", required: true },
                { id: "pot-rb-rsi-breakout", label: "RSI rompeu a linha de tendência num TF maior (confirmação de força)", required: true },
                { id: "pot-rb-alarm", label: "Colocar alarme em suporte", required: true }
            ]
        }
    ],
    armedPhases: [
        {
            title: "Fase 2: Confirmação (15 ou 5min.)",
            exampleImageUrl: "pic/Resistencia-suporte_15m.png", 
            inputs: [
                { 
                    id: "armed-rb-tf",
                    label: "Timeframe de Confirmação:", 
                    type: "select", 
                    options: ["15m", "5m"], 
                    required: true 
                }
               
            ],                
            checks: [
                { id: "armed-rb-fib-ext", label: "Do <strong> topo até à base da correção antes da entrada</strong>, verificar suportes 0.25, 0.382 ou 0.5, e marcar alvos com <strong> extensões de Fibonacci: 1.272 / 1.414 / 1.618</strong>", required: true },
                { id: "armed-rb-stoch-reset", label: "Estocástico está em (sobrevenda)", required: false },
                { id: "armed-rb-price-line", label: "Linha de tendência descendente do preço marcada", required: true },
                { id: "armed-rb-alarm", label: "Alarmes criado (Rompimento do RSI em MA, ou stocastico", required: true }
            ]
        }
    ],
    executionPhases: [
        {
            title: "Fase 3: Gatilho e Registo dos Alvos de Gestão",
            checks: [
                { id: "exec-rb-resistance-break", label: "Preço rompeu resistências (tendência, VAL)", required: true },
                { id: "exec-rb-stoch-bull", label: "Estocástico cruzou bullish", required: true },
                { id: "exec-rb-rsi-ma", label: "RSI passou MA", required: true }
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
