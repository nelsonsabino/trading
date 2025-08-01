// js/app.js - VERSÃO COM REGISTO DO SERVICE WORKER E CAMINHO CORRETO

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { supabase, listenToAlarms } from './services.js';
import { addModal, armModal, execModal, closeModalObj } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

let currentAlarms = [];

async function fetchMarketDataForDashboard(trades) {
    if (trades.length === 0) return {};
    const symbols = [...new Set(trades.map(trade => trade.data.asset))];

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

async function initializeApp() {
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    if (!potentialTradesContainer) return;

    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    
    listenToTrades(async (trades) => {
        const activeTrades = trades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status));
        const marketData = await fetchMarketDataForDashboard(activeTrades);
        displayTrades(activeTrades, marketData, currentAlarms);
        hideEmptyDashboardCardsMobile(); // <- ADICIONADO
    });

    listenToAlarms((alarms, error) => {
        if (error) {
            console.error("Erro ao escutar alarmes:", error);
            currentAlarms = [];
        } else {
            currentAlarms = alarms;
        }
        listenToTrades(async (trades) => {
            const activeTrades = trades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status));
            const marketData = await fetchMarketDataForDashboard(activeTrades);
            displayTrades(activeTrades, marketData, currentAlarms);
            hideEmptyDashboardCardsMobile(); // <- ADICIONADO
        });
    });

    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const serviceWorkerPath = '/trading/service-worker.js'; 
            navigator.serviceWorker.register(serviceWorkerPath)
                .then(registration => {
                    console.log('Service Worker registado com sucesso:', registration.scope);
                })
                .catch(error => {
                    console.error('Falha no registo do Service Worker:', error);
                });
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
            
            addModal.checklistContainer.innerHTML = ''; // Limpa sempre o container primeiro

            if (selectedStrategy && selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) {
                const potentialPhase = selectedStrategy.data.phases[0];
                if (potentialPhase) {
                    
                    // Procura por um item do tipo 'image' na fase
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


// ----------- ESCONDER CARDS VAZIOS NO TELEMÓVEL -----------

function hideEmptyDashboardCardsMobile() {
    if (window.innerWidth > 768) {
        // Reexibe todos os cards se não for mobile!
        document.querySelectorAll('.dashboard-hide-mobile').forEach(card => {
            card.classList.remove('dashboard-hide-mobile');
        });
        return;
    }

    const cards = [
        { card: document.querySelector('.live-trades'),   container: document.getElementById('live-trades-container') },
        { card: document.querySelector('.armed-trades'),  container: document.getElementById('armed-trades-container') },
        { card: document.querySelector('.potential-trades'), container: document.getElementById('potential-trades-container') }
    ];

    cards.forEach(({ card, container }) => {
        if (card && container) {
            // Se só tem .empty-state-message e nada mais, ou está totalmente vazio
            const onlyEmptyState = (
                container.children.length === 1 &&
                container.firstElementChild.classList.contains('empty-state-message')
            );
            // Se não tem filhos ou está totalmente vazio
            const isEmpty = container.children.length === 0 || !container.textContent.trim();

            // Só esconde se estiver mesmo vazio OU só tiver mensagem de estado
            if (isEmpty || onlyEmptyState) {
                card.classList.add('dashboard-hide-mobile');
            } else {
                card.classList.remove('dashboard-hide-mobile');
            }
        }
    });
}

// Executa ao carregar, ao redimensionar, e depois de atualizar os cards
window.addEventListener('DOMContentLoaded', hideEmptyDashboardCardsMobile);
window.addEventListener('resize', hideEmptyDashboardCardsMobile);
