// Versão 8.0
import { db } from './teste-firebase.js';
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

console.log(`A iniciar teste v8.0`);

function runApp() {
    // VARIÁVEIS DE ESTADO E SELETORES (Exatamente como no seu app.js)
    let containerDinamico;
    let addModal, armModal, execModal, closeModalObj, lightbox; // Mudei para "lightbox" em vez de "lightboxContainer/Image"

    // FUNÇÕES DE CONTROLO DOS MODAIS REAIS (copiadas do seu app.js)
    function openAddModal() { if(addModal.container) addModal.container.style.display = 'flex'; }
    function openArmModal() { if(armModal.container) armModal.container.style.display = 'flex'; }
    // ... (não precisamos de todas, estas servem para o teste)

    // FUNÇÃO openLightbox MODIFICADA PARA USAR O OBJETO "lightbox"
    function openLightbox(imageUrl) {
        console.log("A tentar abrir o lightbox...");
        // Usa a variável 'lightbox' que é preenchida no DOMContentLoaded, tal como na sua app principal
        if (lightbox.container && lightbox.image) {
            lightbox.image.src = imageUrl;
            lightbox.container.style.display = 'flex';
        } else {
            console.error("Objeto lightbox não foi preenchido corretamente!");
        }
    }

    function closeLightbox() {
        if (lightbox.container) {
            lightbox.container.style.display = 'none';
        }
    }

    // A nossa função de criação de card, agora chama "openLightbox"
    function criarCardDeTeste(doc) {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.innerHTML = `<h3>Card do Doc: ${doc.id}</h3>`;
        const imageUrl = 'https://i.imgur.com/exemplo1.png';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Clique em mim';
        // O event listener agora chama a função real
        img.addEventListener('click', () => {
            openLightbox(imageUrl);
        });
        card.appendChild(img);
        return card;
    }

    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded executado.");
        
        // PREENCHIMENTO DAS VARIÁVEIS (Exatamente como no seu app.js)
        containerDinamico = document.getElementById('container-dinamico');
        
        addModal = { container: document.getElementById('add-opportunity-modal') };
        armModal = { container: document.getElementById('arm-trade-modal') };
        execModal = { container: document.getElementById('execution-modal') };
        closeModalObj = { container: document.getElementById('close-trade-modal') };
        lightbox = { 
            container: document.getElementById('image-lightbox'), 
            image: document.getElementById('lightbox-image'), 
            closeBtn: document.getElementById('close-lightbox-test-btn') 
        };
        console.log("Objeto lightbox preenchido:", lightbox);

        lightbox.closeBtn.addEventListener('click', closeLightbox);

        // A escuta do Firebase começa aqui
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
