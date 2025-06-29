
// A definição das suas estratégias.
export const STRATEGIES = {



/* ------------------------------------------------------------------------ */    
           /* ------------ FURA E TESTA ------------ */
/* ------------------------------------------------------------------------ */           
    
    'fura-testa': {
        name: "Preço fura resistência e testa suporte",
        potentialPhases: [
            { 
                title: "Análise Macro Inicial",
                exampleImageUrl: "https://i.imgur.com/exemplo1.png",
                inputs: [ 
                    { id: "pot-ft-tf", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true }
                ],
                checks: [
                    { id: "pot-ft-hl", label: "Preço com higher Low", required: true },
                    { id: "pot-ft-divergencia", label: "RSI bullish", required: true },
                    { id: "pot-ft-alarme", label: "Algum alarme foi colocado?", required: true }
                ]
            }
        ],
        armedPhases: [
            { 
                title: "Validação do Setup (no TF de Análise)",
                exampleImageUrl: "https://i.imgur.com/exemplo2.png",
                inputs: [ { id: "armed-ft-image-url", label: "Link da Imagem do Gráfico (Fase Armado):", type: "text", required: false } ],
                checks: [
                    { id: "armed-ft-tendencia", label: "Preço furou resistência", required: true },
                    { id: "armed-ft-rhl", label: "RSI está a fazer Higher Lows?", required: true },
                    { id: "armed-ft-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false }
                ]
            }
        ],
        executionPhases: [
            { 
                title: "Gatilho de Precisão",
                exampleImageUrl: "https://i.imgur.com/exemplo3.png",
                inputs: [{ id: "exec-ft-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }],
                checks: [{ id: "exec-ft-rsi-break", label: "Quebra da linha de resistência do RSI", required: true }],
                checks: [{ id: "exec-ft-rsi-break", label: "Preço mantem-se acima da resistência", required: true }],

                radios: {
                    name: "gatilho-final-id", 
                    label: "Escolha o gatilho final:",
                    options: [
                        { id: "exec-ft-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                        { id: "exec-ft-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" }
                    ]
                }
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
           /* ------------ APÓS IMPULSO DO SUPORTE ------------ */
/* ------------------------------------------------------------------------ */       
  
'impulso-suporte': {
        name: "Após impulso do suporte",
        
        potentialPhases: [
            {
                title: "Análise Macro Inicial",
                exampleImageUrl: "https://i.imgur.com/link_exemplo_potencial.png", // SUBSTITUA COM UM LINK REAL

                inputs: [
                    { id: "pot-id-tf-impulso", label: "Timeframe de Análise:", type: "select", options: ["Diário", "4h"], required: true },
                    { id: "pot-id-rsi-ltb-impulso", label: "RSI furou LTB?", type: "select", options: ["Sim, com força", "Não, mas ainda tem espaço", "Não, está encostado"], required: true }
                ],                
                checks: [
                    { id: "pot-is-rsi-hl", label: "RSI com Higher Lows?", required: true },
                    { id: "pot-is-fib", label: "Preço acima de Fibonacci 0.382?", required: true },
                    { id: "pot-is-stoch-corr", label: "Stochastic já está a corrigir?", required: true },
                    { id: "pot-is-ema50", label: "Preço acima da EMA50?", required: true },
                    { id: "pot-is-alarm", label: "Alarme foi colocado?", required: true },
                    { id: "pot-is-rsi-ma", label: "RSI acima da RSI-MA?", required: false }
                ]
            }
        ],
        
        armedPhases: [
            {
                title: "Critérios para Armar (TF Superior)",
                exampleImageUrl: "https://i.imgur.com/link_exemplo_potencial.png", // SUBSTITUA COM UM LINK REAL
               
                inputs: [ { id: "armed-id-image-url", label: "Link da Imagem do Gráfico (Fase Armado):", type: "text", required: false } ],
 
                checks: [
                    { id: "armed-is-stoch-cross", label: "Stochastic TF superior está a cruzar bullish?", required: true },
                    { id: "armed-is-rsi-hl", label: "RSI continua com Higher Lows?", required: true },
                    { id: "armed-is-val", label: "Preço na base do VAL? (Aumenta Prob.)", required: false },
                    { id: "armed-is-rsi-toque3", label: "RSI a fazer 3º toque no suporte? (Aumenta Prob.)", required: false }
                ]
            }
        ],
        
        executionPhases: [
            {
                title: "Gatilho de Precisão",
                exampleImageUrl: "https://i.imgur.com/link_exemplo_potencial.png", // SUBSTITUA COM UM LINK REAL
         
                inputs: [
                    { id: "exec-is-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }
                ],
                checks: [
                    { id: "exec-is-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true }
                ],
                radios: {
                    name: "gatilho-final-is",
                    label: "Escolha o gatilho final:",
                    options: [
                        { id: "exec-is-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                        { id: "exec-is-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" } // Corrigido erro de formatação aqui
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
