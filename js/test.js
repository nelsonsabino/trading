// Este é o ficheiro js/test.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Olá do test.js! O DOM carregou.");

    const lightboxContainer = document.getElementById('image-lightbox');
    const addButton = document.getElementById('add-opportunity-btn');

    console.log("A tentar encontrar o elemento #image-lightbox...");
    console.log("Elemento lightbox encontrado:", lightboxContainer);

    console.log("A tentar encontrar o elemento #add-opportunity-btn...");
    console.log("Elemento botão de adicionar encontrado:", addButton);
});
