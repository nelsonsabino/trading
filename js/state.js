// js/state.js

// Declaração ÚNICA das variáveis de estado no topo.
let currentTrade = {};
let strategies = [];
let lastCreatedTradeId = null;
let lastCreatedAlarmId = null; 
let alarmsData = []; // NOVO: Armazena os dados de alarmes

// Funções para gerir o trade atual
export function getCurrentTrade() {
    return currentTrade;
}

export function setCurrentTrade(trade) {
    currentTrade = trade;
}

// Funções para gerir as estratégias carregadas
export function getStrategies() {
    return strategies;
}

export function setCurrentStrategies(loadedStrategies) {
    strategies = loadedStrategies;
}

// Funções para gerir o estado do destaque
export function getLastCreatedTradeId() {
    return lastCreatedTradeId;
}

export function setLastCreatedTradeId(id) {
    lastCreatedTradeId = id;
}

export function getLastCreatedAlarmId() {
    return lastCreatedAlarmId;
}

export function setLastCreatedAlarmId(id) {
    lastCreatedAlarmId = id;
}

// NOVAS Funções para gerir os dados de alarmes
export function getAlarmsData() {
    return alarmsData;
}

export function setAlarmsData(data) {
    alarmsData = data;
}

// --- INÍCIO DA ALTERAÇÃO ---
// Funções para gerir o estado das imagens visíveis no localStorage
export function getVisibleImageIds() {
    try {
        const ids = localStorage.getItem('visibleImageTradeIds');
        return ids ? JSON.parse(ids) : [];
    } catch (e) {
        console.error("Erro ao ler IDs de imagem do localStorage", e);
        return [];
    }
}

export function setVisibleImageIds(ids) {
    try {
        localStorage.setItem('visibleImageTradeIds', JSON.stringify(ids));
    } catch (e) {
        console.error("Erro ao guardar IDs de imagem no localStorage", e);
    }
}
// --- FIM DA ALTERAÇÃO ---
