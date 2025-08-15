// js/state.js

let currentTrade = {};

export function getCurrentTrade() {
    return currentTrade;
}

export function setCurrentTrade(trade) {
    currentTrade = trade;
}
