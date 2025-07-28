// js/navigation.js

import { openAddModal } from './modals.js';

document.addEventListener('DOMContentLoaded', () => {
    const managementToggle = document.getElementById('management-toggle');
    const navDropdown = managementToggle ? managementToggle.closest('.nav-dropdown') : null;

    if (managementToggle && navDropdown) {
        // Alterna a visibilidade do dropdown ao clicar no botão
        managementToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede o clique de propagar para o document
            navDropdown.classList.toggle('show');
        });

        // Fecha o dropdown se o utilizador clicar em qualquer outro lugar fora dele
        document.addEventListener('click', (event) => {
            if (navDropdown.classList.contains('show') && !navDropdown.contains(event.target)) {
                navDropdown.classList.remove('show');
            }
        });

        // Fechar o dropdown se uma opção dentro dele for clicada (para navegação)
        const dropdownLinks = navDropdown.querySelectorAll('.nav-dropdown-content a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                navDropdown.classList.remove('show');
            });
        });
    }

    // Adiciona listener para o botão "Adicionar à Watchlist"
    const addToWatchlistBtn = document.querySelector('.nav-icon-link.action-add-watchlist');
    if (addToWatchlistBtn) {
        addToWatchlistBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que o link navegue para '#'.
            openAddModal(); // Abre o modal para adicionar oportunidade
        });
    }

    // NOVO: Lógica para destacar o botão da página ativa
    const currentPath = window.location.pathname;
    // Normaliza o path para comparar apenas o nome do ficheiro (ex: "/dashboard.html")
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    // Seleciona todos os links da navegação principal
    const navLinks = document.querySelectorAll('.main-nav .nav-icon-link');

    navLinks.forEach(link => {
        // Ignora o botão de tema e a secção do utilizador, que não são links de página
        // O botão de tema está agora fora do header, mas mantemos a verificação para robustez
        if (link.id === 'theme-toggle-btn' || link.closest('#user-session')) {
            return;
        }

        const linkHref = link.getAttribute('href');
        if (linkHref) {
            const linkPage = linkHref.substring(linkHref.lastIndexOf('/') + 1);
            // Compara a página do link com a página atual. A raiz (/) corresponde a index.html (agora dashboard.html via redirect)
            if (linkPage === currentPage || (linkPage === 'dashboard.html' && (currentPage === '' || currentPage === 'index.html'))) {
                link.classList.add('nav-active');
            }
        }
    });
});
