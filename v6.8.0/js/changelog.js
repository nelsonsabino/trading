// js/changelog.js

// Importamos a estrutura completa
import { changelogData } from './version.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('changelog-container');
    if (!container) return;

    let html = '';

    // 1. Gera a secção para a versão ATUAL
    html += `
        <div class="stat-card" style="text-align: left; margin-bottom: 2rem; border-left: 5px solid #28a745;">
            <h3>Versão ${changelogData.current.number} (Atual)</h3>
            <ul style="padding-left: 20px; margin-top: 1rem;">
    `;
    changelogData.current.changes.forEach(change => {
        html += `<li>${change}</li>`;
    });
    html += `</ul></div>`;

    // 2. Adiciona um separador
    html += `<hr class="section-divider"><h2>Versões Anteriores</h2>`;

    // 3. Itera sobre as versões antigas e gera uma secção para cada uma
    changelogData.releases.forEach(release => {
        html += `
            <div class="stat-card" style="text-align: left; margin-bottom: 1.5rem; background-color: #f8f9fa;">
                <h4>Versão ${release.number}</h4>
                <ul style="padding-left: 20px; font-size: 0.95em; margin-top: 0.5rem;">
        `;
        release.changes.forEach(change => {
            html += `<li>${change}</li>`;
        });
        html += `</ul></div>`;
    });


    container.innerHTML = html;
});
