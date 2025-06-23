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
  
// Substitua o código de submissão do formulário por este:
addOpportunityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitButton = addOpportunityForm.querySelector('button[type="submit"]');
    submitButton.textContent = "A Guardar...";
    submitButton.disabled = true;

    const newOpportunity = {
        asset: document.getElementById('asset').value,
        notes: document.getElementById('notes').value,
        status: "WATCHING",
        dateAdded: new Date(),
        macroSetup: {
            btcFavorable: document.getElementById('check-btc').checked,
            volumeOk: document.getElementById('check-vol').checked,
            stochReset: document.getElementById('check-macro-stoch').checked,
            structureOk: document.getElementById('check-macro-structure').checked
        }
    };
    
    // CÓDIGO REAL DO FIREBASE para ADICIONAR um documento
    db.collection('trades').add(newOpportunity)
        .then((docRef) => {
            console.log("Oportunidade guardada com sucesso! ID:", docRef.id);
            addOpportunityForm.reset();
            modalContainer.classList.add('hidden');
        })
        .catch(err => {
            console.error("Erro ao guardar:", err);
            alert("Ocorreu um erro ao guardar. Verifique a consola.");
        })
        .finally(() => {
            submitButton.textContent = "Guardar na Watchlist";
            submitButton.disabled = false;
        });
});

       addOpportunityForm.reset();
       modalContainer.classList.add('hidden');
       // Idealmente, a lista atualiza-se automaticamente com o listener do Firebase
    });

// Substitua a função de carregamento de trades por esta:
function fetchAndDisplayTrades() {
    // Usamos .onSnapshot() para ouvir alterações em tempo real!
    // A sua lista irá atualizar-se automaticamente quando adicionar ou alterar um trade.
    db.collection('trades').where('status', '==', 'WATCHING').orderBy('dateAdded', 'desc').onSnapshot(snapshot => {
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
    }, error => {
        console.error("Erro ao buscar trades:", error);
        watchlistContainer.innerHTML = '<p style="color: red;">Erro ao carregar os dados. Verifique a consola.</p>';
    });
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
