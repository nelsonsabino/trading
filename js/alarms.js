// alarms.js (corrigido)

console.log("1. Ficheiro alarms.js foi carregado.");

// --- IMPORTAR SUPABASE v2 CORRETAMENTE ---
import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- INICIALIZAR SUPABASE ---
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("2. Cliente Supabase inicializado.");

// --- PREPARAR PROMESSA PARA ONESIGNAL ---
let oneSignalReadyResolve;
const oneSignalReadyPromise = new Promise(resolve => {
    oneSignalReadyResolve = resolve;
});

// --- DOM CARREGADO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("3. Evento DOMContentLoaded disparado.");

    // --- INICIAR ONESIGNAL ---
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function () {
        OneSignal.on('sdkRegistered', function () {
            console.log("4. OneSignal registado com sucesso.");
            oneSignalReadyResolve(true);
            OneSignal.push(function () {
    console.log("TESTE: OneSignal push() executado.");

        });

        OneSignal.init({
            appId: oneSignalAppId,
        });
    });

    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');

    if (!alarmForm) {
        console.error("ERRO: Formulário de alarme não encontrado no DOM.");
        return;
    }

    // --- FUNÇÃO DE CRIAÇÃO DO ALARME ---
    async function createAlarm() {
        console.log("5. Botão 'Definir Alarme' clicado. A iniciar criação...");

        // Esperar que o OneSignal esteja pronto
        console.log("6. A aguardar OneSignal...");
        await oneSignalReadyPromise;
        console.log("7. OneSignal está pronto.");

        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        feedbackDiv.style.color = '#000';

        try {
            const playerId = await OneSignal.getUserId();
            console.log("8. Player ID:", playerId);

            if (!playerId) {
                throw new Error("OneSignal ainda não atribuiu um ID de utilizador. Aceitaste notificações?");
            }

            const assetInput = document.getElementById('alarm-asset');
            const conditionInput = document.getElementById('alarm-condition-standalone');
            const priceInput = document.getElementById('alarm-price-standalone');

            const assetName = assetInput.value.trim();
            const condition = conditionInput.value;
            const targetPrice = parseFloat(priceInput.value);

            if (!assetName || isNaN(targetPrice) || targetPrice <= 0) {
                throw new Error("Preenche todos os campos com valores válidos.");
            }

            const alarmData = {
                asset_id: assetName.split('/')[0].toLowerCase(),
                asset_symbol: assetName.split('/')[0].toUpperCase(),
                condition: condition,
                target_price: targetPrice,
                onesignal_player_id: playerId,
                status: 'active'
            };

            console.log("9. Dados a inserir na Supabase:", alarmData);

            const { error } = await supabase.from('alarms').insert([alarmData]);
            if (error) throw error;

            feedbackDiv.textContent = `✅ Alarme para ${assetName} criado com sucesso!`;
            feedbackDiv.style.color = '#28a745';
            alarmForm.reset();

        } catch (error) {
            console.error("❌ ERRO ao criar alarme:", error);
            feedbackDiv.textContent = `Erro: ${error.message}`;
            feedbackDiv.style.color = '#dc3545';
        } finally {
            submitButton.disabled = false;
        }
    }

    alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createAlarm();
    });
});
