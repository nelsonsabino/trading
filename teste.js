// Versão 4.0
import { dummyVariable } from './teste-config.js';
console.log(`Módulo importado: ${dummyVariable} (v4.0)`);

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos que já existem no HTML
    const containerDinamico = document.getElementById('container-dinamico');
    const closeBtn = document.getElementById('close-lightbox-test-btn');
    const lightboxContainer = document.getElementById('image-lightbox');

    // --- LÓGICA DE CRIAÇÃO DINÂMICA (agora dentro de um setTimeout) ---
    
    console.log("A agendar a criação do botão dinâmico para daqui a 500ms...");

    setTimeout(() => {
        console.log("setTimeout executado! A criar o botão agora.");

        // 1. Criar um novo botão do zero
        const botaoDinamico = document.createElement('button');
        botaoDinamico.textContent = 'Abrir Lightbox (Botão Assíncrono)';
        
        // 2. Adicionar o ouvinte de clique
        botaoDinamico.addEventListener('click', abrirLightboxDeTeste);
        
        // 3. Adicionar o novo botão à página
        containerDinamico.appendChild(botaoDinamico);

    }, 500); // 500ms = meio segundo de atraso para simular a resposta da rede

    
    // --- FUNÇÕES ---

    function abrirLightboxDeTeste() {
        console.log("Botão ASSÍNCRONO clicado!");
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
