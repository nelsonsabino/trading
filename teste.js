// Espera que o HTML esteja pronto
document.addEventListener('DOMContentLoaded', () => {

    // Encontra o botão de teste
    const botaoTeste = document.getElementById('botao-teste');

    // A função que tenta abrir o lightbox
    function abrirLightboxDeTeste() {
        console.log("Botão clicado. A tentar abrir o lightbox...");
        
        const lightboxContainer = document.getElementById('image-lightbox');

        if (lightboxContainer) {
            console.log("Elemento do lightbox encontrado. A aplicar 'display: flex'.");
            lightboxContainer.style.display = 'flex';
        } else {
            console.log("ERRO: Não encontrei o elemento #image-lightbox.");
        }
    }

    // Adiciona o ouvinte de clique ao botão
    botaoTeste.addEventListener('click', abrirLightboxDeTeste);

});
