// js/config.js

// Estes são placeholders que serão substituídos pelo GitHub Actions.
export const firebaseConfig = {
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.firebasestorage.app",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};

export const GESTAO_PADRAO = {
    title: "Plano de Gestão", 
    inputs: [
        { id: "entry-price", label: "Preço de Entrada:", type: "number", required: true },
        { id: "stop-loss", label: "Stop-Loss:", type: "number", required: true },
        { id: "take-profit", label: "Take-Profit:", type: "number", required: true },
        { id: "quantity", label: "Quantidade:", type: "number", required: true }
    ]
};

// Placeholders para as credenciais da Supabase.
export const supabaseUrl = "__SUPABASE_URL__"; 
export const supabaseAnonKey = "__SUPABASE_ANON_KEY__";
