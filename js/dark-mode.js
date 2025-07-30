// js/dark-mode.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const rootElement = document.documentElement; // Agora usamos o <html>
    const themeIconContainer = themeToggleButton ? themeToggleButton : null; // O botão é o container

    // Função para atualizar o ícone com base no tema atual
    const updateIcon = () => {
        if (!themeIconContainer) return;
        if (rootElement.classList.contains('dark-mode')) {
            themeIconContainer.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
        } else {
            themeIconContainer.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
        }
    };
    
    // Função para alternar o tema
    const toggleTheme = () => {
        rootElement.classList.toggle('dark-mode');
        
        // Guarda a nova preferência
        const newTheme = rootElement.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        
        updateIcon(); // Atualiza o ícone
        
        // Dispara um evento personalizado para notificar outros scripts
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
