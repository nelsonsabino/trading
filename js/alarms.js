// js/alarms.js (VERSÃO FINAL COM TODAS AS CORREÇÕES)

// CORREÇÃO: Importamos as chaves e o createClient diretamente.
import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- Inicialização dos Serviços ---
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Cliente Supabase (alarms.js) inicializado corretamente.");

let oneSignalReadyResolve;
const oneSignalReadyPromise = new Promise(resolve => {
    oneSignalReadyResolve = resolve;
});

window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
    OneSignal.on('sdkRegistered', function() {
        oneSignalReadyResolve(true);
    });
    
    OneSignal.init({
        appId: oneSignalAppId,
    });
});
console.log("OneSignal (alarms.js) inicializado.");


// --- Lógica do Formulário de Alarmes ---
document.addEventListener('DOMContentLoaded', () => {
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');

    async function createAlarm() {
        await oneSignalReadyPromise;

        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
            const playerId = await window.OneSignal.getUserId();

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
        alarmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createAlarm();
        });
    }
});
