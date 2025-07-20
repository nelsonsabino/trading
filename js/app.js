// js/app.js - VERSÃO COM BUSCA DE DADOS DE MERCADO PARA O DASHBOARD

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { supabase } from './services.js'; // Importar o supabase para a Edge Function
import { addModal, armModal, execModal, closeModalObj, imageModal, closeImageModalBtn } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, closeImageModal } from './modals.js';
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
        // --- MELHORIA: Usa Promise.allSettled para maior resiliência ---
        const results = await Promise.allSettled([
            fetch('https://api.binance.com/api/v3/ticker/24hr'),
            supabase.functions.invoke('get-sparklines-data', { body: { symbols } })
        ]);

        const marketData = {};
        
        // Processa o resultado da API da Binance (tickers)
        const tickerResult = results[0];
        let tickerMap = new Map();
        if (tickerResult.status === 'fulfilled' && tickerResult.value.ok) {
            const allTickers = await tickerResult.value.json();
            tickerMap = new Map(allTickers.map(t => [t.symbol, t]));
        } else {
            console.error("Falha ao buscar dados de ticker da Binance:", tickerResult.reason || 'Resposta não ok');
        }

        // Processa o resultado da Edge Function (sparklines)
        const sparklinesResult = results[1];
        let sparklinesData = {};
        if (sparklinesResult.status === 'fulfilled') {
            const { data, error } = sparklinesResult.value;
            if (error) {
                console.error("Erro na função de sparkline:", error);
            } else {
                sparklinesData = data;
            }
        } else {
            console.error("Falha ao invocar a função de sparkline:", sparklinesResult.reason);
        }

        // Constrói o objeto final com os dados disponíveis
        symbols.forEach(symbol => {
            const ticker = tickerMap.get(symbol);
            marketData[symbol] = {
                price: ticker ? parseFloat(ticker.lastPrice) : 0,
                change: ticker ? parseFloat(ticker.priceChangePercent) : 0,
                sparkline: sparklinesData[symbol] || [] // Usa o sparkline se existir, senão um array vazio
            };
        });

        return marketData;

    } catch (error) {
        console.error("Erro geral ao buscar dados de mercado para o dashboard:", error);
        return {}; // Retorna um objeto vazio em caso de falha geral
    }
}


/**
 * Função principal que inicializa a lógica da página do dashboard.
 */
async function initializeApp() {
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    if (!potentialTradesContainer) return; // Se não estamos no dashboard, não continua.

    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    
    // Ouve por alterações nos trades. Quando eles mudam, busca os dados de mercado e redesenha tudo.
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
    
    // Configura os listeners que não dependem de dados assíncronos
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    if (addOpportunityBtn) {
        addOpportunityBtn.addEventListener('click', openAddModal);
    }
    
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
        if (modalResultsDiv) {
            setupAutocomplete(modalAssetInput, modalResultsDiv, (selectedPair) => {});
        }
        const urlParams = new URLSearchParams(window.location.search);
        const assetPairFromUrl = urlParams.get('assetPair');
        if (assetPairFromUrl) {
            openAddModal();
            modalAssetInput.value = assetPairFromUrl; 
        }
    }
    
    // Inicia a aplicação
    initializeApp();
});
