// js/dark-mode.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const body = document.body;
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;

    // Função para aplicar o tema e guardar a preferência
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (themeIcon) themeIcon.className = 'fas fa-sun'; // Mostra o sol
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            if (themeIcon) themeIcon.className = 'fas fa-moon'; // Mostra a lua
            localStorage.setItem('theme', 'light');
        }
    };

    // Função para alternar o tema
    const toggleTheme = () => {
        if (body.classList.contains('dark-mode')) {
            applyTheme('light');
        } else {
            applyTheme('dark');
        }
    };

    // Adiciona o evento de clique ao botão, se ele existir na página
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    // --- LÓGICA DE INICIALIZAÇÃO ---
    // Verifica a preferência guardada no localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Se houver uma preferência guardada, aplica-a
        applyTheme(savedTheme);
    } else {
        // Se não, verifica a preferência do sistema operativo
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            applyTheme('dark');
        } else {
            applyTheme('light'); // Padrão
        }
    }
});
