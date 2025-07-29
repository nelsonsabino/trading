// js/dark-mode.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const rootElement = document.documentElement;
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;

    // DEBUG: Confirma se o script carregou e encontrou o botão
    console.log("Dark Mode Script Loaded. Theme Toggle Button Found:", !!themeToggleButton); 

    // Função para atualizar o ícone com base no tema atual
    const updateIcon = () => {
        if (!themeIcon) return;
        if (rootElement.classList.contains('dark-mode')) {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    };
    
    // Função para alternar o tema
    const toggleTheme = () => {
        // DEBUG: Confirma se a função é chamada ao clicar
        console.log("Theme toggle button clicked!"); 
        rootElement.classList.toggle('dark-mode');
        
        // Guarda a nova preferência
        const newTheme = rootElement.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        
        updateIcon(); // Atualiza o ícone
        
        // NOVO: Dispara um evento personalizado para notificar outros scripts
        const event = new CustomEvent('themeChange', { detail: { theme: newTheme } });
        document.dispatchEvent(event);
    };

    // Adiciona o evento de clique ao botão
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    // Lógica de inicialização: garante que o ícone está correto quando a página carrega.
    updateIcon();
});
