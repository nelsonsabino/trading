// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoKtcIsVOcvI5O6gH_14AXL3bF2I6X8Qc",
  authDomain: "trading-89c13.firebaseapp.com",
  projectId: "trading-89c13",
  storageBucket: "trading-89c13.firebasestorage.app",
  messagingSenderId: "782074719077",
  appId: "1:782074719077:web:05c07a2b81b0047ef5cf8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores do DOM ---
    const addOpportunityBtn = document.getElementById('add-opportunity-btn');
    const modalContainer = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addOpportunityForm = document.getElementById('add-opportunity-form');
    const watchlistContainer = document.getElementById('watchlist-container');

    // --- Lógica do Modal ---
    addOpportunityBtn.addEventListener('click', () => {
        modalContainer.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
    });

    // --- Submeter o formulário de nova oportunidade ---
    addOpportunityForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newOpportunity = {
            asset: document.getElementById('asset').value,
            notes: document.getElementById('notes').value,
            status: "WATCHING", // Status inicial
            dateAdded: new Date(),
            macroSetup: { // Guardamos o estado do checklist macro
                btcFavorable: document.getElementById('check-btc').checked,
                volumeOk: document.getElementById('check-vol').checked,
                stochReset: document.getElementById('check-macro-stoch').checked,
                structureOk: document.getElementById('check-macro-structure').checked
            }
        };

        // Simulação do Firebase:
        console.log("A guardar nova oportunidade:", newOpportunity);
        alert("Oportunidade guardada na watchlist!");
        
        /* CÓDIGO REAL DO FIREBASE
        db.collection('trades').add(newOpportunity)
            .then(() => {
                console.log("Oportunidade guardada com sucesso!");
                addOpportunityForm.reset();
                modalContainer.classList.add('hidden');
            })
            .catch(err => console.error("Erro:", err));
        */

       addOpportunityForm.reset();
       modalContainer.classList.add('hidden');
       // Idealmente, a lista atualiza-se automaticamente com o listener do Firebase
    });

    // --- Carregar e mostrar as oportunidades do Firebase ---
    function fetchAndDisplayTrades() {
        watchlistContainer.innerHTML = ''; // Limpa a lista atual

        // Simulação de dados do Firebase
        const mockData = [
            { id: "1", data: () => ({ asset: 'SOL/USDT', status: 'WATCHING', notes: 'A formar fundo no diário.'}) },
            { id: "2", data: () => ({ asset: 'ADA/USDT', status: 'WATCHING', notes: 'Testando EMA 200 como suporte.'}) }
        ];

        mockData.forEach(doc => {
            const trade = doc.data();
            const card = createTradeCard(trade, doc.id);
            watchlistContainer.appendChild(card);
        });

        /* CÓDIGO REAL DO FIREBASE com listener em tempo real
        db.collection('trades').where('status', '==', 'WATCHING').onSnapshot(snapshot => {
            watchlistContainer.innerHTML = ''; // Limpa sempre antes de redesenhar
            if (snapshot.empty) {
                watchlistContainer.innerHTML = '<p>Nenhuma oportunidade a ser monitorizada. Adicione uma!</p>';
                return;
            }
            snapshot.forEach(doc => {
                const trade = doc.data();
                const card = createTradeCard(trade, doc.id);
                watchlistContainer.appendChild(card);
            });
        });
        */
    }

    // --- Função para criar um "Card" de trade ---
    function createTradeCard(trade, id) {
        const card = document.createElement('div');
        card.className = 'trade-card';
        card.setAttribute('data-id', id);

        card.innerHTML = `
            <h3>${trade.asset}</h3>
            <p><strong>Status:</strong> ${trade.status}</p>
            <p><strong>Notas:</strong> ${trade.notes}</p>
            <button class="trigger-btn">Procurar Gatilho de Entrada</button>
        `;

        // Lógica do botão de gatilho (para o próximo passo)
        card.querySelector('.trigger-btn').addEventListener('click', () => {
            alert(`A abrir checklist de execução para ${trade.asset} (ID: ${id}). Esta será a próxima funcionalidade a implementar!`);
            // Aqui, no futuro, você abriria o checklist de execução (Fase 2 e 3)
            // passando o ID do documento para saber qual trade atualizar.
            // Ex: window.location.href = `execution.html?id=${id}`;
        });

        return card;
    }

    // Iniciar a aplicação
    fetchAndDisplayTrades();
});
