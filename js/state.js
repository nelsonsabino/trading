// js/state.js

// Declaração ÚNICA das variáveis de estado no topo.
let currentTrade = {};
let strategies = [];

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
