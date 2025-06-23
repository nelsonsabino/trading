// --- INICIALIZAÇÃO DO FIREBASE (coloque aqui a sua configuração) ---
// const firebaseConfig = { ... };
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// --- LÓGICA DO CHECKLIST ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Selecionar os elementos do DOM
    const tradeTypeRadios = document.querySelectorAll('input[name="trade_type"]');
    const typeAChecksDiv = document.getElementById('typeA-checks');
    const typeBChecksDiv = document.getElementById('typeB-checks');
    const authButton = document.getElementById('auth-button');
    const form = document.getElementById('checklist-form');

    // Função para mostrar/esconder sub-checks do Tipo A ou B
    tradeTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'A' && radio.checked) {
                typeAChecksDiv.classList.remove('hidden');
                typeBChecksDiv.classList.add('hidden');
            } else if (radio.value === 'B' && radio.checked) {
                typeBChecksDiv.classList.remove('hidden');
                typeAChecksDiv.classList.add('hidden');
            }
            validateForm(); // Revalida o formulário sempre que o tipo de trade muda
        });
    });

    // Função para verificar se o formulário está todo preenchido
    function validateForm() {
        let isValid = true;

        // Verifica checks da Fase 0 (NOVO)
        if (!document.getElementById('check-btc').checked || !document.getElementById('check-vol').checked || !document.getElementById('check-narrative').checked) {
            isValid = false;
        }

        // Verifica checks da Fase 1
        if (!document.getElementById('check1').checked || !document.getElementById('check2').checked) {
            isValid = false;
        }

        // Verifica qual tipo de trade foi selecionado
        const selectedType = document.querySelector('input[name="trade_type"]:checked');
        if (!selectedType) {
            isValid = false;
        } else {
            if (selectedType.value === 'A') {
                if (!document.getElementById('checkA1').checked || !document.getElementById('checkA2').checked) {
                    isValid = false;
                }
            } else if (selectedType.value === 'B') {
                if (!document.getElementById('checkB1').checked || !document.getElementById('checkB2').checked || !document.getElementById('checkB3').checked) {
                    isValid = false;
                }
            }
        }

        // Verifica check da Fase 3
        if (!document.getElementById('check-trigger').checked) {
            isValid = false;
        }
        
        // Ativa ou desativa o botão
        authButton.disabled = !isValid;
    }

    // Adiciona um listener a todo o formulário para revalidar a cada mudança
    form.addEventListener('change', validateForm);

    // --- LÓGICA DO FIREBASE (quando o botão for clicado) ---
    authButton.addEventListener('click', (event) => { // Adicionado 'event'
        // Prevenir o envio padrão do formulário
        event.preventDefault();

        // 1. Desativar o botão para prevenir cliques duplos
        authButton.textContent = 'A GUARDAR...';
        authButton.disabled = true;

        // 2. Coletar todos os dados do formulário
        const tradeData = {
            asset: document.getElementById('asset').value,
            strategy: "Impulso Pós-Reset (Cripto)",
            timestamp: new Date(),
            fase0_context: { // NOVO
                btc_check: document.getElementById('check-btc').checked,
                vol_check: document.getElementById('check-vol').checked,
                narrative_check: document.getElementById('check-narrative').checked,
            },
            fase1_macro: {
                check1: document.getElementById('check1').checked,
                check2: document.getElementById('check2').checked,
            },
            fase2_type: document.querySelector('input[name="trade_type"]:checked').value,
            fase2_A_setup: {
                checkA1: document.getElementById('checkA1').checked,
                checkA2: document.getElementById('checkA2').checked,
            },
            fase2_B_setup: {
                checkB1: document.getElementById('checkB1').checked,
                checkB2: document.getElementById('checkB2').checked,
                checkB3: document.getElementById('checkB3').checked,
            },
            fase3_trigger: document.getElementById('check-trigger').checked,
            management: {
                entry: document.getElementById('entry-price').value,
                sl: document.getElementById('sl-price').value,
                tp: document.getElementById('tp-price').value,
                risk: document.getElementById('risk-value').value,
            },
            status: 'PLANNED' // Estado inicial do trade
        };

        // 3. Enviar para o Firebase
        /*
        db.collection("planned_trades").add(tradeData)
            .then((docRef) => {
                console.log("Plano de trade guardado com ID: ", docRef.id);
                authButton.textContent = 'PLANO GUARDADO COM SUCESSO!';
                authButton.style.backgroundColor = '#0056b3';
            })
            .catch((error) => {
                console.error("Erro ao guardar o plano: ", error);
                authButton.textContent = 'ERRO! TENTE NOVAMENTE';
                authButton.style.backgroundColor = '#dc3545';
                authButton.disabled = false;
            });
        */
       
       // Por agora, sem Firebase, vamos apenas simular
       console.log("Dados do Plano de Trade:", tradeData);
       alert("AUTORIZAÇÃO CONCEDIDA! Plano de trade registado na consola.");
       authButton.textContent = 'EXECUTAR TRADE AGORA!';

    });

    // Chamar a validação uma vez no início para definir o estado inicial do botão
    validateForm();
});
