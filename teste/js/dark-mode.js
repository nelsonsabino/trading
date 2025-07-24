// js/dark-mode.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const rootElement = document.documentElement; // Agora usamos o <html>
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;

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
