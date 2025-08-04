// js/app.js - VERSÃO REATORIZADA E OTIMIZADA

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { supabase, listenToAlarms } from './services.js';
import { addModal, armModal, execModal, closeModalObj } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

// --- Variáveis de Estado da Dashboard ---
let allTrades = [];
let currentAlarms = [];

// --- Função Central de Atualização da UI ---
/**
 * Pega nos dados mais recentes de trades e alarmes, busca os dados de mercado,
 * e atualiza a interface da dashboard.
 */
async function refreshDashboardView() {
    console.log("A atualizar a vista da dashboard...");
    const activeTrades = allTrades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status));
    
    // Busca dados de mercado apenas para os trades ativos
    const marketData = await fetchMarketDataForDashboard(activeTrades);
    
    // Exibe os trades com os dados de mercado e alarmes mais recentes
    displayTrades(activeTrades, marketData, currentAlarms);
    
    // Garante que os cards vazios são escondidos
    hideEmptyDashboardCards();
}


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

    // 1. Busca dados estáticos essenciais
    const strategies = await fetchActiveStrategies();
    setCurrentStrategies(strategies);
    populateStrategySelect(strategies);
    
    // 2. Inicia os "ouvintes" (listeners) de forma independente
    listenToTrades((trades) => {
        console.log("Dados de trades recebidos/atualizados.");
        allTrades = trades;
        refreshDashboardView(); // Chama a função central de atualização
    });

    listenToAlarms((alarms, error) => {
        console.log("Dados de alarmes recebidos/atualizados.");
        if (error) {
            console.error("Erro ao escutar alarmes:", error);
            currentAlarms = [];
        } else {
            currentAlarms = alarms;
        }
        refreshDashboardView(); // Chama a função central de atualização
    });

    // 3. Verifica se um trade foi marcado para edição
    const tradeIdToEdit = localStorage.getItem('tradeToEdit');
    if (tradeIdToEdit) {
        localStorage.removeItem('tradeToEdit');
        loadAndOpenForEditing(tradeIdToEdit);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const serviceWorkerPath = './service-worker.js'; // Caminho corrigido para a raiz
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
        
        // --- INÍCIO DA ALTERAÇÃO (Lógica de exibição da imagem restaurada) ---
        addModal.strategySelect.addEventListener('change', () => {
            const strategies = getStrategies(); 
            const selectedStrategyId = addModal.strategySelect.value;
            const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
            
            addModal.checklistContainer.innerHTML = ''; // Limpa sempre o container primeiro

            if (selectedStrategy && selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) {
                const potentialPhase = selectedStrategy.data.phases[0];
                if (potentialPhase) {
                    
                    // Procura por um item do tipo 'image' na fase e exibe-o
                    const imageItem = potentialPhase.items.find(item => item.type === 'image');
                    if (imageItem && imageItem.url) {
                        const imgElement = document.createElement('img');
                        imgElement.src = imageItem.url;
                        imgElement.style.maxWidth = '100%';
                        imgElement.style.borderRadius = '8px';
                        imgElement.style.marginBottom = '1.5rem';
                        // Adiciona a imagem ANTES de gerar a checklist
                        addModal.checklistContainer.appendChild(imgElement);
                    }

                    // Agora gera a checklist (que irá ignorar o item da imagem)
                    generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
                }
            }
        });
        // --- FIM DA ALTERAÇÃO ---
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


// ----------- ESCONDER CARDS VAZIOS EM TODAS AS RESOLUÇÕES -----------

function hideEmptyDashboardCards() {
    const cards = [
        { card: document.querySelector('.live-trades'),   container: document.getElementById('live-trades-container') },
        { card: document.querySelector('.armed-trades'),  container: document.getElementById('armed-trades-container') },
        { card: document.querySelector('.potential-trades'), container: document.getElementById('potential-trades-container') }
    ];

    cards.forEach(({ card, container }) => {
        if (card && container) {
            const hasContent = container.querySelector('.trade-card');
            if (hasContent) {
                card.classList.remove('dashboard-hide');
            } else {
                card.classList.add('dashboard-hide');
            }
        }
    });
}

// Executa ao carregar e ao redimensionar
window.addEventListener('DOMContentLoaded', hideEmptyDashboardCards);
window.addEventListener('resize', hideEmptyDashboardCards);
