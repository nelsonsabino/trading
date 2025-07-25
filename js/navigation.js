// js/navigation.js

import { openAddModal } from './modals.js'; // Importa a função para abrir o modal

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
});
