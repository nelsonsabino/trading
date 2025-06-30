// app.js - Versão Mínima para Testar o Lightbox

document.addEventListener('DOMContentLoaded', () => {
    console.log("app.js MÍNIMO carregado. A testar apenas o lightbox.");

    // 1. Encontrar os elementos do lightbox no HTML
    const lightbox = {
        container: document.getElementById('image-lightbox'),
        image: document.getElementById('lightbox-image'),
        closeBtn: document.getElementById('close-lightbox-btn')
    };
    console.log("Procura pelo container do lightbox:", lightbox.container);

    // 2. Criar as funções para abrir e fechar
    function openLightbox(imageUrl) {
        if (lightbox.container && lightbox.image) {
            console.log("A ABRIR o lightbox com a URL:", imageUrl);
            lightbox.image.src = imageUrl;
            lightbox.container.style.display = 'flex';
        } else {
            console.error("ERRO: Não encontrei os elementos para abrir o lightbox.");
        }
    }

    function closeLightbox() {
        if (lightbox.container) {
            console.log("A FECHAR o lightbox.");
            lightbox.container.style.display = 'none';
        }
    }
    
    // 3. Adicionar os 'listeners' para fechar o lightbox
    if (lightbox.closeBtn) {
        lightbox.closeBtn.addEventListener('click', closeLightbox);
    }
    if (lightbox.container) {
        lightbox.container.addEventListener('click', (e) => {
            // Fecha se clicar fora da imagem, no fundo escuro
            if (e.target.id === 'image-lightbox') {
                closeLightbox();
            }
        });
    }

    // 4. Teste: Adicionar um listener de clique a TODAS as imagens com a classe 'card-screenshot'
    // NOTA: Isto vai funcionar mesmo para imagens que são adicionadas mais tarde,
    // mas por agora, vamos simplificar. Vamos assumir que já existem.
    // A melhor forma seria usar "event delegation", que faremos a seguir.
    
    // Vamos testar de uma forma diferente: vamos adicionar um card FALSO à página
    // para garantir que o nosso código funciona de forma isolada.
    const potentialTradesContainer = document.getElementById('potential-trades-container');
    if (potentialTradesContainer) {
        console.log("Container de trades encontrado. A criar um card falso para teste.");
        potentialTradesContainer.innerHTML = ''; // Limpa a mensagem "A carregar..."

        const fakeCard = document.createElement('div');
        fakeCard.className = 'trade-card';
        fakeCard.innerHTML = `<h3>Trade Falso</h3><p>Clique na imagem abaixo para testar.</p>`;

        const fakeImage = document.createElement('img');
        fakeImage.src = 'pic/stoch4.png';
        fakeImage.className = 'card-screenshot';
        fakeImage.alt = 'Imagem de teste';

        // A parte mais importante: adicionar o listener de clique
        fakeImage.addEventListener('click', (e) => {
            console.log("Imagem FALSA clicada!");
            e.stopPropagation();
            openLightbox(fakeImage.src);
        });

        fakeCard.appendChild(fakeImage);
        potentialTradesContainer.appendChild(fakeCard);
        console.log("Card falso com imagem clicável foi adicionado à página.");

    } else {
        console.error("Não foi possível encontrar o #potential-trades-container");
    }
});
