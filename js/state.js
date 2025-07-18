// js/state.js

let currentTrade = {};

export function getCurrentTrade() {
    return currentTrade;
}

export function setCurrentTrade(trade) {
    currentTrade = trade;
}

let currentTrade = {};
let strategies = []; // <-- NOVA VARIÁVEL GLOBAL

export function getCurrentTrade() { return currentTrade; }
export function setCurrentTrade(trade) { currentTrade = trade; }

// --- NOVAS FUNÇÕES ---
export function getStrategies() { return strategies; }
export function setCurrentStrategies(loadedStrategies) { strategies = loadedStrategies; }
