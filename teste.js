// Versão 5.0
import { db } from './teste-firebase.js'; // Importa a BD real
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

console.log(`Firebase importado. A escutar a coleção 'testes'... (v5.0)`);

document.addEventListener('DOMContentLoaded', () => {
    const containerDinamico = document.getElementById('container-dinamico');
    const closeBtn = document.getElementById('close-lightbox-test-btn');
    const lightboxContainer = document.getElementById('image-lightbox');

    // --- LÓGICA DE CRIAÇÃO DINÂMICA (agora com onSnapshot) ---
    
    const q = collection(db, "testes"); // Aponte para a sua coleção de teste
    onSnapshot(q, (snapshot) => {
        console.log("onSnapshot respondeu! A criar o botão.");
        
        // Limpa o container para não criar botões duplicados se houver mais updates
        containerDinamico.innerHTML = ''; 

        snapshot.forEach(doc => {
            // Criar um botão para cada documento na coleção de teste
            const botaoDinamico = document.createElement('button');
            botaoDinamico.textContent = `Abrir Lightbox (Firebase, Doc ID: ${doc.id})`;
            
            botaoDinamico.addEventListener('click', abrirLightboxDeTeste);
            
            containerDinamico.appendChild(botaoDinamico);
        });
    });

    // --- FUNÇÕES ---
    function abrirLightboxDeTeste() {
        console.log("Botão FIREBASE clicado!");
        if (lightboxContainer) {
            lightboxContainer.style.display = 'flex';
        }
    }

    function fecharLightboxDeTeste() {
        if (lightboxContainer) {
            lightboxContainer.style.display = 'none';
        }
    }

    closeBtn.addEventListener('click', fecharLightboxDeTeste);
});
