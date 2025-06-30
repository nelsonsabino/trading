// Versão 7.0
import { db } from './teste-firebase.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

console.log(`A iniciar teste v7.0`);

function runApp() {
    let containerDinamico, closeBtn, lightboxContainer, lightboxImage;

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

    function criarCardDeTeste(doc) {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `<h3>Card do Doc: ${doc.id}</h3>`;
        const imageUrl = 'https://i.imgur.com/exemplo1.png';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Clique em mim';
        img.addEventListener('click', () => {
            console.log("Imagem do card dinâmico clicada!");
            abrirLightboxDeTeste(imageUrl);
        });
        card.appendChild(img);
        return card;
    }

    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded executado.");
        containerDinamico = document.getElementById('container-dinamico');
        closeBtn = document.getElementById('close-lightbox-test-btn');
        lightboxContainer = document.getElementById('image-lightbox');
        lightboxImage = document.getElementById('lightbox-image');

        closeBtn.addEventListener('click', fecharLightboxDeTeste);

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

runApp();
