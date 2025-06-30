// A MUDANÇA ESTÁ AQUI: import
import { dummyVariable } from './teste-config.js';

console.log('Módulo importado:', dummyVariable); // Para confirmar que funciona

document.addEventListener('DOMContentLoaded', () => {
    const botaoTeste = document.getElementById('botao-teste');
    function abrirLightboxDeTeste() {
        console.log("Botão clicado.");
        const lightboxContainer = document.getElementById('image-lightbox');
        if (lightboxContainer) {
            console.log("Elemento encontrado. A aplicar 'display: flex'.");
            lightboxContainer.style.display = 'flex';
        } else {
            console.log("ERRO: #image-lightbox não encontrado.");
        }
    }
    botaoTeste.addEventListener('click', abrirLightboxDeTeste);
});
