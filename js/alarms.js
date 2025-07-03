// js/alarms.js (VERSÃO DE SUPER-DIAGNÓSTICO)

console.log("1. Ficheiro alarms.js foi carregado.");

import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';

function initializeAndRun() {
    console.log("3. A função initializeAndRun() foi chamada (após o DOM estar pronto).");

    // --- Inicialização dos Serviços ---
    let supabase;
    try {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log("4. Cliente Supabase (alarms.js) inicializado.");
    } catch (e) {
        console.error("Falha ao inicializar Supabase em alarms.js", e);
    }

    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
        OneSignal.init({
            appId: oneSignalAppId,
        });
    });
    console.log("5. OneSignal (alarms.js) inicializado.");


    // --- Lógica do Formulário de Alarmes ---
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');
    console.log("6. A procurar formulário #alarm-form:", alarmForm);

    function createAlarm() {
        console.log("8. Função createAlarm() foi chamada.");
        window.OneSignal.push(async function() {
            console.log("9. O código dentro de OneSignal.push() está a ser executado!");

            const submitButton = alarmForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            feedbackDiv.textContent = 'A processar...';
            feedbackDiv.style.color = '#6c757d';

            const assetName = document.getElementById('alarm-asset').value;
            const condition = document.getElementById('alarm-condition-standalone').value;
            const targetPrice = parseFloat(document.getElementById('alarm-price-standalone').value);

            if (!assetName || isNaN(targetPrice) || targetPrice <= 0) {
                feedbackDiv.textContent = 'Erro: Por favor, preencha todos os campos com valores válidos.';
                feedbackDiv.style.color = '#dc3545';
                submitButton.disabled = false;
                return;
            }
            
            const playerId = await window.OneSignal.getUserId();
            console.log("10. Player ID recebido:", playerId);

            if (!playerId) {
                feedbackDiv.textContent = 'Erro: Não foi possível obter a sua subscrição de notificações. Por favor, recarregue a página e aceite as notificações.';
                feedbackDiv.style.color = '#dc3545';
                submitButton.disabled = false;
                return;
            }

            const alarmData = {
                asset_id: assetName.split('/')[0].toLowerCase().trim(),
                asset_symbol: assetName.split('/')[0].toUpperCase().trim(),
                condition: condition,
                target_price: targetPrice,
                onesignal_player_id: playerId,
                status: 'active'
            };
            
            console.log("11. A tentar inserir na Supabase:", alarmData);
            try {
                const { error } = await supabase.from('alarms').insert([alarmData]);
                if (error) throw error;
                
                feedbackDiv.textContent = `Alarme para ${assetName} criado com sucesso!`;
                feedbackDiv.style.color = '#28a745';
                alarmForm.reset();
            } catch (error) {
                feedbackDiv.textContent = 'Erro ao guardar o alarme na base de dados.';
                feedbackDiv.style.color = '#dc3545';
                console.error('Erro detalhado da Supabase:', error);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    if (alarmForm && supabase) {
        console.log("7. Formulário e Supabase OK. A adicionar o listener de 'submit'.");
        alarmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createAlarm();
        });
    } else {
        console.error("ERRO GRAVE: Não foi possível encontrar #alarm-form ou a Supabase não foi inicializada.");
    }
}

// A MUDANÇA PRINCIPAL ESTÁ AQUI:
// Esperamos que o HTML esteja completamente carregado antes de executar qualquer código.
document.addEventListener('DOMContentLoaded', () => {
    console.log("2. Evento DOMContentLoaded disparado. O HTML está pronto.");
    initializeAndRun();
});
