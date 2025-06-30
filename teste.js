import { dummyVariable } from './teste-config.js';
console.log('Módulo importado:', dummyVariable);

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos que já existem no HTML
    const containerDinamico = document.getElementById('container-dinamico');
    const closeBtn = document.getElementById('close-lightbox-test-btn');
    const lightboxContainer = document.getElementById('image-lightbox');

    // --- LÓGICA DE CRIAÇÃO DINÂMICA ---
    
    // 1. Criar um novo botão do zero
    const botaoDinamico = document.createElement('button');
    botaoDinamico.textContent = 'Abrir Lightbox (Botão Dinâmico)';
    
    // 2. Adicionar o ouvinte de clique a ESTE botão que acabámos de criar
    botaoDinamico.addEventListener('click', abrirLightboxDeTeste);
    
    // 3. Adicionar o novo botão à página
    containerDinamico.appendChild(botaoDinamico);
    

    // --- FUNÇÕES ---

    function abrirLightboxDeTeste() {
        console.log("Botão DINÂMICO clicado!");
        if (lightboxContainer) {
            lightboxContainer.style.display = 'flex';
        }
    }

    function fecharLightboxDeTeste() {
        if (lightboxContainer) {
            lightboxContainer.style.display = 'none';
        }
    }

    // Adiciona o listener para o botão de fecho
    closeBtn.addEventListener('click', fecharLightboxDeTeste);
});
