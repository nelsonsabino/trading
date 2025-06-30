// Versão 9.0
import { db } from './teste-firebase.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

console.log(`A iniciar teste v9.0`);

function runApp() {
    let containerDinamico, lightbox;

    function openLightbox(imageUrl) {
        if (lightbox.container && lightbox.image) {
            lightbox.image.src = imageUrl;
            lightbox.container.style.display = 'flex';
        }
    }

    function closeLightbox() {
        if (lightbox.container) {
            lightbox.container.style.display = 'none';
        }
    }

    // Função de criação de card adaptada para usar as classes CSS reais
    function criarCardDeTeste(doc) {
        const card = document.createElement('div');
        card.className = 'trade-card'; // Classe real
        card.innerHTML = `<h3>Card de Teste: ${doc.id}</h3>`;

        const imageUrl = 'https://i.imgur.com/exemplo1.png';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'card-screenshot'; // Classe real
        img.alt = 'Clique em mim';
        
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Boa prática, como no seu código original
            console.log("Imagem do card real clicada!");
            openLightbox(imageUrl);
        });

        card.appendChild(img);
        return card;
    }

    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded executado.");
        
        containerDinamico = document.getElementById('container-dinamico');
        lightbox = { 
            container: document.getElementById('image-lightbox'), 
            image: document.getElementById('lightbox-image'), 
            closeBtn: document.getElementById('close-lightbox-btn') // ID real
        };
        console.log("Objeto lightbox preenchido:", lightbox);

        lightbox.closeBtn.addEventListener('click', closeLightbox);

        const q = collection(db, "testes");
        onSnapshot(q, (snapshot) => {
            containerDinamico.innerHTML = '';
            snapshot.forEach(doc => {
                const novoCard = criarCardDeTeste(doc);
                containerDinamico.appendChild(novoCard);
            });
        });
    });
}

runApp();
