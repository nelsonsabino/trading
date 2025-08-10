// js/app.js - VERSÃO REATORIZADA E OTIMIZADA

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { supabase, listenToAlarms } from './services.js';
import { addModal, armModal, execModal, closeModalObj } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist, displayWatchlistTable } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

// --- Variáveis de Estado da Dashboard ---
let allTrades = [];
let currentAlarms = [];

// --- Função Central de Atualização da UI ---
async function refreshDashboardView() {
    console.log("A atualizar a vista da dashboard...");
    const activeTrades = allTrades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status));
    
    const marketData = await fetchMarketDataForDashboard(activeTrades, currentAlarms);
    
    displayTrades(activeTrades, marketData, currentAlarms);
    displayWatchlistTable(allTrades, currentAlarms, marketData);
    
    hideEmptyDashboardCards();
}

async function fetchMarketDataForDashboard(trades, alarms) {
    const tradeSymbols = trades.map(trade => trade.data.asset);
    const alarmSymbols = alarms.filter(a => a.status === 'active').map(a => a.asset_pair);
    
    const symbols = [...new Set([...tradeSymbols, ...alarmSymbols])];
    if (symbols.length === 0) return {};

    try {
        const results = await Promise.allSettled([
            fetch('https://api.binance.com/api/v3/ticker/24hr'),
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

// --- INÍCIO DA ALTERAÇÃO: Lógica de sincronização ---
async function initializeApp() {
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    if (!potentialTradesContainer) return;

    let tradesReady = false;
    let alarmsReady = false;

    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    
    listenToTrades((trades) => {
        console.log("Dados de trades recebidos/atualizados.");
        allTrades = trades;
        tradesReady = true;
        if (alarmsReady) {
            refreshDashboardView();
        }
    });

    listenToAlarms((alarms, error) => {
        console.log("Dados de alarmes recebidos/atualizados.");
        if (error) {
            console.error("Erro ao escutar alarmes:", error);
            currentAlarms = [];
        } else {
            currentAlarms = alarms;
        }
        alarmsReady = true;
        if (tradesReady) {
            refreshDashboardView();
        }
    });

    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}
// --- FIM DA ALTERAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const serviceWorkerPath = './service-worker.js';
            navigator.serviceWorker.register(serviceWorkerPath)
                .then(registration => console.log('Service Worker registado com sucesso:', registration.scope))
                .catch(error => console.error('Falha no registo do Service Worker:', error));
        });
    }

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
            
            addModal.checklistContainer.innerHTML = '';

            if (selectedStrategy && selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) {
                const potentialPhase = selectedStrategy.data.phases[0];
                if (potentialPhase) {
                    const imageItem = potentialPhase.items.find(item => item.type === 'image');
                    if (imageItem && imageItem.url) {
                        const imgElement = document.createElement('img');
                        imgElement.src = imageItem.url;
                        imgElement.style.maxWidth = '100%';
                        imgElement.style.borderRadius = '8px';
                        imgElement.style.marginBottom = '1.5rem';
                        addModal.checklistContainer.appendChild(imgElement);
                    }
                    generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
                }
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

function hideEmptyDashboardCards() {
    const cards = [
        { card: document.querySelector('.live-trades'),   container: document.getElementById('live-trades-container') },
        { card: document.querySelector('.armed-trades'),  container: document.getElementById('armed-trades-container') },
        { card: document.querySelector('.potential-trades'), container: document.getElementById('potential-trades-container') }
    ];

    cards.forEach(({ card, container }) => {
        if (card && container) {
            const hasContent = container.querySelector('.trade-card');
            card.classList.toggle('dashboard-hide', !hasContent);
        }
    });
}

window.addEventListener('DOMContentLoaded', hideEmptyDashboardCards);
window.addEventListener('resize', hideEmptyDashboardCards);
