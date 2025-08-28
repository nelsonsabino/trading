// js/app.js - VERSÃO REATORIZADA E OTIMIZADA

import { listenToTrades, fetchActiveStrategies } from './firebase-service.js';
import { supabase, listenToAlarms } from './services.js';
import { addModal, armModal, execModal, closeModalObj } from './dom-elements.js';
import { openAddModal, closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal } from './modals.js';
import { displayTrades, populateStrategySelect, generateDynamicChecklist, displayWatchlistTable } from './ui.js';
import { handleAddSubmit, handleArmSubmit, handleExecSubmit, handleCloseSubmit, loadAndOpenForEditing } from './handlers.js';
import { setupAutocomplete } from './utils.js';
import { setCurrentStrategies, getStrategies } from './state.js';

let allTrades = [];
let currentAlarms = [];

// START OF MODIFICATION: Logic to order Kanban columns by priority
function orderKanbanColumns() {
    const container = document.querySelector('.dashboard-columns');
    if (!container) return;

    const liveSection = document.querySelector('.live-trades');
    const armedSection = document.querySelector('.armed-trades');
    const potentialSection = document.querySelector('.potential-trades');
    
    // Define a ordem de prioridade. Appending move o elemento para o final,
    // então o último a ser adicionado será o mais à esquerda (maior prioridade).
    const priorityOrder = [potentialSection, armedSection, liveSection];

    priorityOrder.forEach(section => {
        if (section) {
            // Apenas move a secção se ela tiver conteúdo visível
            const contentContainer = section.querySelector('[id$="-trades-container"]');
            if (contentContainer && contentContainer.querySelector('.trade-card')) {
                container.appendChild(section);
            }
        }
    });
}
// END OF MODIFICATION

function manageEmptySectionsVisibility() {
    const kanbanColumns = [
        { section: document.querySelector('.potential-trades'), container: document.getElementById('potential-trades-container') },
        { section: document.querySelector('.armed-trades'), container: document.getElementById('armed-trades-container') },
        { section: document.querySelector('.live-trades'), container: document.getElementById('live-trades-container') }
    ];

    let hasVisibleKanbanCard = false;
    kanbanColumns.forEach(({ section, container }) => {
        if (section && container) {
            const hasContent = container.querySelector('.trade-card');
            section.style.display = hasContent ? '' : 'none';
            if (hasContent) {
                hasVisibleKanbanCard = true;
            }
        }
    });
    
    const watchlistDivider = document.getElementById('watchlist-divider');
    const watchlistSection = document.getElementById('watchlist-section');
    if (watchlistDivider && watchlistSection) {
        const isWatchlistVisible = watchlistSection.style.display !== 'none';
        watchlistDivider.style.display = (hasVisibleKanbanCard && isWatchlistVisible) ? 'block' : 'none';
    }
}

async function displayGeneralNews() {
    const container = document.getElementById('general-news-container');
    if (!container) return;

    container.innerHTML = '<p>A carregar notícias...</p>';

    try {
        const { data: news, error } = await supabase.functions.invoke('get-general-crypto-news');
        if (error) throw error;

        if (!news || news.length === 0) {
            container.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
            return;
        }

        const newsHtml = news.map(article => {
             const publishedDate = new Date(article.published_on * 1000).toLocaleString('pt-PT', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `
                <div class="news-article">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-article-title">${article.title}</a>
                    <span class="news-article-meta">${article.source} &bull; ${publishedDate}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = newsHtml;
    } catch (err) {
        console.error("Erro ao buscar notícias gerais:", err);
        container.innerHTML = '<p style="color:red;">Não foi possível carregar as notícias.</p>';
    }
}

async function refreshDashboardView() {
    console.log("A atualizar a vista da dashboard...");
    const activeTrades = allTrades.filter(t => ['POTENTIAL', 'ARMED', 'LIVE'].includes(t.data.status));
    
    const marketData = await fetchMarketDataForDashboard(activeTrades, currentAlarms);
    
    displayTrades(activeTrades, marketData, currentAlarms);
    displayWatchlistTable(allTrades, currentAlarms, marketData);
    
    orderKanbanColumns(); // Call the ordering function
    
    manageEmptySectionsVisibility();
}

async function fetchMarketDataForDashboard(trades, alarms) {
    const tradeSymbols = trades.map(trade => trade.data.asset);
    
    const alarmSymbols = alarms
        .filter(a => a.status === 'active' || (a.status === 'triggered' && !a.acknowledged))
        .map(a => a.asset_pair);
    
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
    
    displayGeneralNews();

    setInterval(refreshDashboardView, 5 * 60 * 1000); // 5 minutos
}

document.addEventListener('DOMContentLoaded', () => {
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const serviceWorkerPath = './service-worker.js';
            navigator.serviceWorker.register(serviceWorkerPath)
                .then(registration => console.log('Service Worker registado com sucesso:', registration.scope))
                .catch(error => console.error('Falha no registo do Service Worker:', error));
        });
    }
    
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
