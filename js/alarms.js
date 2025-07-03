// js/alarms.js (VERSÃO FINAL E ROBUSTA)

console.log("1. Ficheiro alarms.js foi carregado.");

import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';

// --- PASSO CHAVE 1: Criamos a "promessa" de que a OneSignal ficará pronta ---
let oneSignalReadyResolve;
const oneSignalReadyPromise = new Promise(resolve => {
    oneSignalReadyResolve = resolve;
});


document.addEventListener('DOMContentLoaded', () => {
    console.log("2. Evento DOMContentLoaded disparado.");

    // --- Inicialização dos Serviços ---
    let supabase;
    try {
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log("3. Cliente Supabase inicializado.");
    } catch (e) {
        console.error("Falha ao inicializar Supabase.", e);
    }

    // --- PASSO CHAVE 2: Dizemos à OneSignal para cumprir a promessa quando estiver pronta ---
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
        // Adicionamos um listener para o evento 'sdkRegistered'
        OneSignal.on('sdkRegistered', function() {
            console.log("4. EVENTO RECEBIDO: OneSignal SDK está 100% registado e pronto.");
            oneSignalReadyResolve(true); // A promessa foi cumprida!
        });
        
        OneSignal.init({
            appId: oneSignalAppId,
        });
    });

    // --- Lógica do Formulário ---
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');

    async function createAlarm() {
        console.log("6. Botão 'Definir Alarme' clicado. Função createAlarm() iniciada.");
        
        // --- PASSO CHAVE 3: Esperamos pela promessa antes de continuar ---
        console.log("7. A aguardar pela confirmação de que a OneSignal está pronta...");
        await oneSignalReadyPromise;
        console.log("8. Confirmação recebida! A OneSignal está pronta. A obter playerId...");

        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
            const playerId = await window.OneSignal.getUserId();
            console.log("9. Player ID recebido:", playerId);

            if (!playerId) {
                throw new Error("O seu ID de subscrição não foi encontrado. Por favor, recarregue a página.");
            }
            
            const assetName = document.getElementById('alarm-asset').value;
            const condition = document.getElementById('alarm-condition-standalone').value;
            const targetPrice = parseFloat(document.getElementById('alarm-price-standalone').value);

            if (!assetName || isNaN(targetPrice) || targetPrice <= 0) {
                throw new Error("Por favor, preencha todos os campos com valores válidos.");
            }

            const alarmData = {
                asset_id: assetName.split('/')[0].toLowerCase().trim(),
                asset_symbol: assetName.split('/')[0].toUpperCase().trim(),
                condition: condition,
                target_price: targetPrice,
                onesignal_player_id: playerId,
                status: 'active'
            };

            console.log("10. A tentar inserir na Supabase:", alarmData);
            const { error: dbError } = await supabase.from('alarms').insert([alarmData]);
            if (dbError) throw dbError;

            feedbackDiv.textContent = `Alarme para ${assetName} criado com sucesso!`;
            feedbackDiv.style.color = '#28a745';
            alarmForm.reset();

        } catch (error) {
            feedbackDiv.textContent = `Erro: ${error.message}`;
            feedbackDiv.style.color = '#dc3545';
            console.error('ERRO DETALHADO NO PROCESSO DE CRIAÇÃO DO ALARME:', error);
        } finally {
            submitButton.disabled = false;
        }
    }

    if (alarmForm && supabase) {
        console.log("5. Formulário e Supabase OK. A adicionar o listener de 'submit'.");
        alarmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createAlarm();
        });
    } else {
        console.error("ERRO GRAVE: Não foi possível encontrar #alarm-form ou a Supabase.");
    }
});
