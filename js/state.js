// js/state.js

// Declaração ÚNICA das variáveis de estado no topo.
let currentTrade = {};
let strategies = [];
let lastCreatedTradeId = null; // NOVO: Guarda o ID do último trade criado
let lastCreatedAlarmId = null; // NOVO: Guarda o ID do último alarme criado

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

// --- NOVAS FUNÇÕES PARA GERIR O ESTADO DO DESTAQUE ---

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
