
// js/config.js

// Não há inicialização do Firebase aqui.

// A sua configuração da web app do Firebase. A palavra 'export' permite que outros ficheiros a importem.
export const firebaseConfig = {
  apiKey: "AIzaSyAoKtcIsVOcvI5O6gH_14AXL3bF2I6X8Qc",
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.firebasestorage.app",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};




// O plano de gestão padrão.
export const GESTAO_PADRAO = {
    title: "Plano de Gestão", 
    inputs: [
        { id: "entry-price", label: "Preço de Entrada:", type: "number", required: true },
        { id: "stop-loss", label: "Stop-Loss:", type: "number", required: true },
        { id: "take-profit", label: "Take-Profit:", type: "number", required: true },
        { id: "quantity", label: "Quantidade:", type: "number", required: true }
    ]
};



// --- NOVAS CONFIGURAÇÕES PARA SERVIÇOS DE ALARMES ---

// Cole as suas credenciais da Supabase aqui
export const supabaseUrl = 'https://styiycllsahfcioasqpm.supabase.co'; 
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eWl5Y2xsc2FoZmNpb2FzcXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzgyMDQsImV4cCI6MjA2NzExNDIwNH0.DLOcuDrnfVDd72BplLF0qSuP05nvgT34f4zKgutHBr4';


