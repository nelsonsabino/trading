// Versão 6.0
import { db } from './teste-firebase.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

console.log(`A iniciar teste v6.0`);

// 1. A estrutura principal é agora a função runApp()
function runApp() {

    // 2. Variáveis declaradas, mas não preenchidas, tal como no seu app.js
    let containerDinamico, closeBtn, lightboxContainer, lightboxImage;

    // 5. As funções que manipulam o DOM
    function abrirLightboxDeTeste(imageUrl) {
        if (lightboxContainer && lightboxImage) {
            lightboxImage.src = imageUrl;
            lightboxContainer.style.display = 'flex';
        }
    }

    function fecharLightboxDeTeste() {
        if (lightboxContainer) {
            lightboxContainer.style.display = 'none';
        }
    }

    // 4. A função que cria o card, muito parecida com a sua createTradeCard
    function criarCardDeTeste(doc) {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `<h3>Card do Doc: ${doc.id}</h3>`;

        const imageUrl = 'https://i.imgur.com/exemplo1.png'; // URL de teste fixo

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Clique em mim';

        // O event listener é adicionado diretamente à imagem que acabámos de criar
        img.addEventListener('click', () => {
            console.log("Imagem do card dinâmico clicada!");
            abrirLightboxDeTeste(imageUrl);
        });

        card.appendChild(img);
        return card;
    }


    // 3. O DOMContentLoaded preenche as variáveis e anexa os listeners
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded executado. A preencher variáveis e a escutar o Firebase.");
        
        containerDinamico = document.getElementById('container-dinamico');
        closeBtn = document.getElementById('close-lightbox-test-btn');
        lightboxContainer = document.getElementById('image-lightbox');
        lightboxImage = document.getElementById('lightbox-image');

        closeBtn.addEventListener('click', fecharLightboxDeTeste);

        // A escuta do Firebase começa aqui
        const q = collection(db, "testes");
        onSnapshot(q, (snapshot) => {
            console.log("onSnapshot respondeu!");
            containerDinamico.innerHTML = '';
            snapshot.forEach(doc => {
                const novoCard = criarCardDeTeste(doc);
                containerDinamico.appendChild(novoCard);
            });
        });
    });
}

// 6. A aplicação é iniciada
runApp();
