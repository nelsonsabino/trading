import { dummyVariable } from './teste-config.js';
console.log('Módulo importado:', dummyVariable);

document.addEventListener('DOMContentLoaded', () => {
    const botaoTeste = document.getElementById('botao-teste');
    const closeBtn = document.getElementById('close-lightbox-test-btn'); // NOVO
    const lightboxContainer = document.getElementById('image-lightbox'); // NOVO

    function abrirLightboxDeTeste() {
        if (lightboxContainer) {
            lightboxContainer.style.display = 'flex';
        }
    }

    // NOVA FUNÇÃO PARA FECHAR
    function fecharLightboxDeTeste() {
        if (lightboxContainer) {
            lightboxContainer.style.display = 'none';
        }
    }

    botaoTeste.addEventListener('click', abrirLightboxDeTeste);
    closeBtn.addEventListener('click', fecharLightboxDeTeste); // NOVO
});
