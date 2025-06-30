export const STRATEGIES = {
    'preco-suporte': {
        name: "Preço em suporte com confluências",
        potentialPhases: [
            { title: "Análise Macro Inicial",
              exampleImageUrl: "https://i.imgur.com/link_exemplo_potencial.png",
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
            { title: "Validação do Setup (no TF de Análise)",
              exampleImageUrl: "https://i.imgur.com/link_exemplo_potencial.png",
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
            { title: "Gatilho de Precisão",
              exampleImageUrl: "https://i.imgur.com/link_exemplo_potencial.png",
              inputs: [{ id: "exec-id-tf", label: "Timeframe de Execução:", type: "select", options: ["1h", "15min", "5min"], required: true }],
              checks: [{ id: "exec-id-rsi-break", label: "Quebra da linha de resistência do RSI?", required: true }],
              radios: {
                  name: "gatilho-final-id", label: "Escolha o gatilho final:",
                  options: [
                      { id: "exec-id-gatilho-base", label: "Preço na base local do FRVP + Stoch reset?" },
                      { id: "exec-id-gatilho-acima", label: "Preço acima da base local do FRVP + Stoch reset?" }
                  ]
              }
            }
        ]
    }, 
    'impulso-suporte': {
        name: "Após impulso do suporte",
        potentialPhases: [ { /* ... (resto das suas estratégias) ... */ } ],
        armedPhases: [ { /* ... */ } ],
        executionPhases: [ { /* ... */ } ]
    },
    'convergencia-3tf': {
        name: "Convergência 3 TFs",
        potentialPhases: [ { /* ... */ } ],
        armedPhases: [ { /* ... */ } ],
        executionPhases: [ { /* ... */ } ]
    }
};
// NOTA: Tive de encurtar as outras estratégias para o limite de texto, mas copie as suas estratégias completas do ficheiro antigo para aqui.
