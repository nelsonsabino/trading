// js/changelog.js

import { versionInfo } from './version.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('changelog-container');
    if (!container) return;

    // A partir de agora, podemos adicionar mais versões ao versionInfo
    // e o código vai gerar secções para cada uma.
    // Por enquanto, só temos uma.
    
    let html = `
        <div class="stat-card" style="text-align: left; margin-bottom: 2rem;">
            <h3>Versão ${versionInfo.number} (Atual)</h3>
            <ul style="padding-left: 20px;">
    `;

    versionInfo.changes.forEach(change => {
        html += `<li>${change}</li>`;
    });

    html += `
            </ul>
        </div>
    `;

    container.innerHTML = html;
});
