export const GESTAO_PADRAO = {
    title: "Plano de Gestão", 
    inputs: [
        { id: "entry-price", label: "Preço de Entrada:", type: "number", required: true },
        { id: "stop-loss", label: "Stop-Loss:", type: "number", required: true },
        { id: "take-profit", label: "Take-Profit:", type: "number", required: true },
        { id: "quantity", label: "Quantidade:", type: "number", required: true }
    ]
};
