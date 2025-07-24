// js/manage.js

import { listenToTrades, deleteTrade as deleteTradeService, listenToTransactions, deleteTransaction as deleteTransactionService } from './firebase-service.js';

// Adiciona um listener para garantir que o DOM está carregado antes de executar o código
document.addEventListener('DOMContentLoaded', () => {

    const tableBody = document.getElementById('trades-table-body');
    const transactionsTableBody = document.getElementById('transactions-table-body');

    // --- LÓGICA PARA A TABELA DE TRADES ---

    async function deleteTrade(tradeId) {
        if (!confirm("Tem a certeza que quer apagar este trade? Esta ação é irreversível.")) {
            return;
        }
        try {
            await deleteTradeService(tradeId);
            console.log("Pedido de apagar enviado para o serviço.");
        } catch (error) {
            alert("Ocorreu um erro ao apagar o trade.");
        }
    }

    function editTrade(tradeId) {
        localStorage.setItem('tradeToEdit', tradeId);
        window.location.href = 'dashboard.html'; // CORRIGIDO AQUI
    }

    function fetchAndDisplayAllTrades() {
        listenToTrades((trades, error) => {
            if (error) {
                tableBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Erro ao carregar os dados.</td></tr>`;
                return;
            }
            
            tableBody.innerHTML = '';
            if (trades.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Nenhum trade encontrado.</td></tr>';
                return;
            }

            trades.forEach(trade => {
                const tr = document.createElement('tr');
                const pnl = trade.data.status === 'CLOSED' ? (trade.data.closeDetails?.pnl || '0.00') : '-';
                const pnlClass = parseFloat(pnl) > 0 ? 'positive-pnl' : (parseFloat(pnl) < 0 ? 'negative-pnl' : '');
                const dateStr = trade.data.dateAdded?.toDate().toLocaleString('pt-PT') || 'N/A';

                tr.innerHTML = `
                    <td><strong>${trade.data.asset || 'N/A'}</strong></td>
                    <td>${trade.data.strategyName || 'N/A'}</td>
                    <td><span class="status-badge status-${(trade.data.status || 'unknown').toLowerCase()}">${trade.data.status || 'UNKNOWN'}</span></td>
                    <td>${dateStr}</td>
                    <td class="${pnlClass}">${pnl}</td>
                    <td><div class="action-buttons"><button class="btn edit-btn">Editar</button><button class="btn delete-btn">Apagar</button></div></td>`;

                tr.querySelector('.edit-btn').addEventListener('click', () => editTrade(trade.id));
                tr.querySelector('.delete-btn').addEventListener('click', () => deleteTrade(trade.id));
                
                tableBody.appendChild(tr);
            });
        });
    }

    // --- LÓGICA PARA A TABELA DE TRANSAÇÕES DO PORTFÓLIO ---

    async function deleteTransaction(transactionId, amount, type) {
        if (!confirm("Tem a certeza que quer apagar esta transação? O seu saldo será ajustado.")) {
            return;
        }
        try {
            await deleteTransactionService(transactionId, amount, type);
            console.log("Pedido para apagar transação enviado.");
        } catch (error) {
            console.error("Erro ao apagar transação:", error);
            alert("Ocorreu um erro ao apagar a transação.");
        }
    }

    function fetchAndDisplayTransactions() {
        listenToTransactions((transactions, error) => {
            if (error) {
                transactionsTableBody.innerHTML = `<tr><td colspan="5" style="color: red;">Erro ao carregar.</td></tr>`;
                return;
            }

            transactionsTableBody.innerHTML = '';
            if (transactions.length === 0) {
                transactionsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum registo de depósito ou levantamento.</td></tr>';
                return;
            }

            transactions.forEach(transaction => {
                const tr = document.createElement('tr');
                const date = transaction.data.date?.toDate().toLocaleString('pt-PT') || 'N/A';
                const type = transaction.data.type === 'deposit' ? 'Depósito' : 'Levantamento';
                const amount = transaction.data.amount || 0;
                const notes = transaction.data.notes || '-';
                const amountClass = transaction.data.type === 'deposit' ? 'positive-pnl' : 'negative-pnl';

                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${type}</td>
                    <td class="${amountClass}">$${amount.toFixed(2)}</td>
                    <td>${notes}</td>
                    <td><div class="action-buttons"><button class="btn delete-btn">Apagar</button></div></td>`;
                
                tr.querySelector('.delete-btn').addEventListener('click', () => deleteTransaction(transaction.id, amount, transaction.data.type));
                
                transactionsTableBody.appendChild(tr);
            });
        });
    }

    // --- INICIAR A PÁGINA ---
    if (tableBody) {
        fetchAndDisplayAllTrades();
    }
    if (transactionsTableBody) {
        fetchAndDisplayTransactions();
    }
});
