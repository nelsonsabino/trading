// --- INICIALIZAÇÃO DO FIREBASE (Sintaxe v9 Modular) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// A sua configuração da web app do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAoKtcIsVOcvI5O6gH_14AXL3bF2I6X8Qc",
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.firebasestorage.app",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);






function runStatsPage() {
    // Função principal que corre quando a página carrega
    function calculateAndDisplayStats() {
        const q = query(collection(db, 'trades'), where('status', '==', 'CLOSED'));

        onSnapshot(q, (snapshot) => {
            let totalTrades = 0;
            let totalPnl = 0;
            let winCount = 0;
            let lossCount = 0;
            let totalWinAmount = 0;
            let totalLossAmount = 0;
            const statsByStrategy = {};
            const statsByReason = {};

            snapshot.forEach(doc => {
                const trade = doc.data();
                if (!trade.closeDetails || isNaN(parseFloat(trade.closeDetails.pnl))) {
                    return; // Ignora trades fechados sem P&L válido
                }

                totalTrades++;
                const pnl = parseFloat(trade.closeDetails.pnl);
                totalPnl += pnl;

                // Contagem de Ganhos/Perdas
                if (pnl > 0) {
                    winCount++;
                    totalWinAmount += pnl;
                } else {
                    lossCount++;
                    totalLossAmount += pnl; // Mantém o valor negativo
                }

                // Estatísticas por Estratégia
                const strategy = trade.strategyName || 'Sem Estratégia';
                if (!statsByStrategy[strategy]) {
                    statsByStrategy[strategy] = { count: 0, pnl: 0 };
                }
                statsByStrategy[strategy].count++;
                statsByStrategy[strategy].pnl += pnl;

                // Estatísticas por Motivo de Fecho
                const reason = trade.closeDetails.closeReason || 'Não especificado';
                if (!statsByReason[reason]) {
                    statsByReason[reason] = { count: 0, pnl: 0 };
                }
                statsByReason[reason].count++;
                statsByReason[reason].pnl += pnl;
            });

            // Cálculos Finais
            const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
            const avgWin = winCount > 0 ? totalWinAmount / winCount : 0;
            const avgLoss = lossCount > 0 ? totalLossAmount / lossCount : 0;
            const rrRatio = (avgLoss !== 0) ? Math.abs(avgWin / avgLoss) : 0;

            // Atualizar o DOM com os valores
            updateElementText('total-trades', totalTrades);
            updateElementText('total-pnl', `€${totalPnl.toFixed(2)}`, true);
            updateElementText('win-rate', `${winRate.toFixed(1)}%`);
            updateElementText('win-count', winCount);
            updateElementText('loss-count', lossCount);
            updateElementText('avg-win', `€${avgWin.toFixed(2)}`, true);
            updateElementText('avg-loss', `€${avgLoss.toFixed(2)}`, true);
            updateElementText('rr-ratio', rrRatio.toFixed(2));
            
            // Gerar tabelas de detalhes
            generateDetailTable('strategy-stats', 'Estratégia', statsByStrategy);
            generateDetailTable('reason-stats', 'Motivo', statsByReason);
        });
    }

    // Função auxiliar para atualizar o texto e a cor dos elementos
    function updateElementText(id, text, isPnl = false) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
            if (isPnl) {
                element.classList.remove('positive-pnl', 'negative-pnl');
                if (parseFloat(text.replace('€', '')) > 0) {
                    element.classList.add('positive-pnl');
                } else if (parseFloat(text.replace('€', '')) < 0) {
                    element.classList.add('negative-pnl');
                }
            }
        }
    }

    // Função para gerar as tabelas de detalhes
    function generateDetailTable(containerId, header, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>${header}</th>
                        <th>Nº Trades</th>
                        <th>P&L Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        for (const key in data) {
            const item = data[key];
            const pnlClass = item.pnl > 0 ? 'positive-pnl' : (item.pnl < 0 ? 'negative-pnl' : '');
            tableHtml += `
                <tr>
                    <td>${key}</td>
                    <td>${item.count}</td>
                    <td class="${pnlClass}">€${item.pnl.toFixed(2)}</td>
                </tr>
            `;
        }
        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }

    // Iniciar
    calculateAndDisplayStats();
}

runStatsPage();
