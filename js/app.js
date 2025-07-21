// js/app.js - VERSÃO AJUSTADA PARA O NOME REVERTIDO DA EDGE FUNCTION

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { supabase } from './services.js';
import { addModal, armModal, execModal, closeModalObj } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

/**
 * Busca os dados de mercado (preço, variação, sparkline) para os ativos no dashboard.
 * @param {Array} trades - A lista de trades atuais no dashboard.
 * @returns {object} Um objeto com os dados de mercado agregados.
 */
async function fetchMarketDataForDashboard(trades) {
    if (trades.length === 0) return {};
    const symbols = [...new Set(trades.map(trade => trade.data.asset))];

    try {
        const results = await Promise.allSettled([
            fetch('https://api.binance.com/api/v3/ticker/24hr'),
            // ALTERAÇÃO: Revertido para o nome original da Edge Function
            supabase.functions.invoke('get-sparklines-data', { body: { symbols } })
        ]);

        const marketData = {};
        let tickerMap = new Map();
        
        const tickerResult = results[0];
        if (tickerResult.status === 'fulfilled' && tickerResult.value.ok) {
            const allTickers = await tickerResult.value.json();
            tickerMap = new Map(allTickers.map(t => [t.symbol, t]));
        } else {
            console.error("Falha ao buscar dados de ticker da Binance:", tickerResult.reason || 'Resposta não ok');
        }

        let extraData = {};
        const extraDataResult = results[1];
        if (extraDataResult.status === 'fulfilled') {
            const { data, error } = extraDataResult.value;
            if (error) {
                console.error("Erro na função get-sparklines-data:", error);
            } else {
                extraData = data;
            }
        } else {
            console.error("Falha ao invocar a função get-sparklines-data:", extraDataResult.reason);
        }

        symbols.forEach(symbol => {
            const ticker = tickerMap.get(symbol);
            const symbolExtraData = extraData[symbol] || {};
            marketData[symbol] = {
                price: ticker ? parseFloat(ticker.lastPrice) : 0,
                change: ticker ? parseFloat(ticker.priceChangePercent) : 0,
                sparkline: symbolExtraData.sparkline || []
            };
        });

        return marketData;
    } catch (error) {
        console.error("Erro geral ao buscar dados de mercado para o dashboard:", error);
        return {};
    }
}

async function initializeApp() {
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    if (!potentialTradesContainer) return;

    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    
    listenToTrades(async (trades) => {
        const activeTrades = trades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status));
        const marketData = await fetchMarketDataForDashboard(activeTrades);
        displayTrades(activeTrades, marketData);
    });
    
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}

// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', () => {
    
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    if (addOpportunityBtn) addOpportunityBtn.addEventListener('click', openAddModal);
    
    if (addModal.container) {
        addModal.closeBtn.addEventListener('click', closeAddModal);
        addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
        addModal.form.addEventListener('submit', handleAddSubmit);
        addModal.strategySelect.addEventListener('change', () => {
            const strategies = getStrategies(); 
            const selectedStrategyId = addModal.strategySelect.value;
            const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
            if (selectedStrategy && selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) {
                const potentialPhase = selectedStrategy.data.phases[0];
                if (potentialPhase) {
                    generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
                } else {
                    addModal.checklistContainer.innerHTML = '';
                }
            } else {
                addModal.checklistContainer.innerHTML = ''; 
            }
        });
    }

    if (armModal.container) {
        armModal.closeBtn.addEventListener('click', closeArmModal);
        armModal.container.addEventListener('click', e => { if (e.target.id === 'arm-trade-modal') closeArmModal(); });
        armModal.form.addEventListener('submit', handleArmSubmit);
    }
    
    if (execModal.container) {
        execModal.closeBtn.addEventListener('click', closeExecModal);
        execModal.container.addEventListener('click', e => { if (e.target.id === 'execution-modal') closeExecModal(); });
        execModal.form.addEventListener('submit', handleExecSubmit);
    }

    if (closeModalObj.container) {
        closeModalObj.closeBtn.addEventListener('click', closeCloseTradeModal);
        closeModalObj.container.addEventListener('click', e => { if (e.target.id === 'close-trade-modal') closeCloseTradeModal(); });
        closeModalObj.form.addEventListener('submit', handleCloseSubmit);
    }

    const modalAssetInput = document.getElementById('asset');
    if (modalAssetInput) {
        const modalResultsDiv = document.getElementById('modal-autocomplete-results');
        if (modalResultsDiv) setupAutocomplete(modalAssetInput, modalResultsDiv, () => {});
        const urlParams = new URLSearchParams(window.location.search);
        const assetPairFromUrl = urlParams.get('assetPair');
        if (assetPairFromUrl) {
            openAddModal();
            modalAssetInput.value = assetPairFromUrl; 
        }
    }
    
    initializeApp();
});
