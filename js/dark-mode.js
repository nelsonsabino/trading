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
    };

    // Adiciona o evento de clique ao botão
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    // --- LÓGICA DE INICIALIZAÇÃO SIMPLIFICADA ---
    // Apenas precisamos de garantir que o ícone está correto quando a página carrega.
    // O tema já foi aplicado pelo script "anti-flash" no <head>.
    updateIcon();
});
