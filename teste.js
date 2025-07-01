// teste.js - Versão Simplificada (apenas com a funcionalidade do Lightbox)

// IMPORTAÇÕES
// Apenas as necessárias para carregar e exibir os trades
import { listenToTrades } from './js/firebase-service.js';

// --- PONTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {

    console.log("A executar teste.js (versão simplificada para lightbox).");

    // --- SELETORES DO DOM ---
    // Apenas os necessários para o lightbox e para exibir os cards
    const lightbox = { 
        container: document.getElementById('image-lightbox'), 
        image: document.getElementById('lightbox-image'), 
        closeBtn: document.getElementById('close-lightbox-btn') 
    };
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    const armedTradesContainer = document.getElementById('armed-trades-container');
    const liveTradesContainer = document.getElementById('live-trades-container');
    
    // --- FUNÇÕES DE CONTROLO DE MODAIS E LIGHTBOX ---
    // Apenas as funções do lightbox são necessárias
    function openLightbox(imageUrl) {
        // Verificação de segurança para garantir que os elementos existem
        if (lightbox.container && lightbox.image) {
            lightbox.image.src = imageUrl;
            lightbox.container.style.display = 'flex';
        } else {
            console.error("Erro: Elementos do lightbox não encontrados no HTML.");
        }
    }
    
    function closeLightbox() {
        if (lightbox.container) {
            lightbox.container.style.display = 'none';
        }
    }

    // --- FUNÇÕES DE GERAÇÃO DE UI ---
    // A função createTradeCard com o clique direto na imagem, que provou funcionar
    function createTradeCard(trade) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        // HTML simplificado, sem o botão "Editar" para não causar erros
        card.innerHTML = `<h3>${trade.data.asset}</h3><p style="color: #007bff; font-weight: 500;">Estratégia: ${trade.data.strategyName || 'N/A'}</p><p><strong>Status:</strong> ${trade.data.status}</p><p><strong>Notas:</strong> ${trade.data.notes || ''}</p>`;
        
        const potentialImageUrl = trade.data.imageUrl;
        let armedImageUrl = null;
        if (trade.data.armedSetup) {
            const key = Object.keys(trade.data.armedSetup).find(k => k.includes('image-url'));
            if (key) armedImageUrl = trade.data.armedSetup[key];
        }
        
        const imageUrlToShow = armedImageUrl || potentialImageUrl;
        if (imageUrlToShow) {
            const img = document.createElement('img');
            img.src = imageUrlToShow;
            img.className = 'card-screenshot';
            img.alt = `Gráfico de ${trade.data.asset}`;
            
            // O event listener que funciona
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(imageUrlToShow);
            });
            card.appendChild(img);
        }

        // Não adicionamos os outros botões para manter o teste focado e evitar erros
        return card;
    }

    // Função para exibir os trades
    function displayTrades(trades) {
        // Verificação para garantir que os contentores existem
        if (!potentialTradesContainer || !armedTradesContainer || !liveTradesContainer) {
            console.error("Erro: Contentores de trades não encontrados no HTML.");
            return;
        }

        potentialTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma oportunidade potencial.</p>';
        armedTradesContainer.innerHTML = '<p class="empty-state-message">Nenhum setup armado.</p>';
        liveTradesContainer.innerHTML = '<p class="empty-state-message">Nenhuma operação ativa.</p>';
        
        let potentialCount = 0, armedCount = 0, liveCount = 0;
        trades.forEach(trade => {
            const card = createTradeCard(trade);
            if (trade.data.status === 'POTENTIAL') { if (potentialCount === 0) potentialTradesContainer.innerHTML = ''; potentialTradesContainer.appendChild(card); potentialCount++; }
            else if (trade.data.status === 'ARMED') { if (armedCount === 0) armedTradesContainer.innerHTML = ''; armedTradesContainer.appendChild(card); armedCount++; }
            else if (trade.data.status === 'LIVE') { if (liveCount === 0) liveTradesContainer.innerHTML = ''; liveTradesContainer.appendChild(card); liveCount++; }
        });
    }

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    // Apenas adicionamos os ouvintes de eventos que sabemos que existem
    if (lightbox.closeBtn) {
        lightbox.closeBtn.addEventListener('click', closeLightbox);
    }
    if (lightbox.container) {
        lightbox.container.addEventListener('click', (e) => { 
            if (e.target.id === 'image-lightbox') closeLightbox(); 
        });
    }

    // A escuta da coleção `trades` para iniciar a aplicação
    listenToTrades(displayTrades);
});
