// js/alarms.js - Módulo Independente para Gestão de Alarmes (VERSÃO CORRIGIDA)

import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';

// --- Inicialização dos Serviços ---
let supabase;
try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log("Cliente Supabase (alarms.js) inicializado.");
} catch (e) {
    console.error("Falha ao inicializar Supabase em alarms.js", e);
}

// Inicializa a OneSignal mas espera pelo evento 'onSdkRegistered'
window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
    OneSignal.init({
        appId: oneSignalAppId,
    });
});
console.log("OneSignal (alarms.js) inicializado.");


// --- Lógica do Formulário de Alarmes ---
const alarmForm = document.getElementById('alarm-form');
const feedbackDiv = document.getElementById('alarm-feedback');

// A MUDANÇA ESTÁ AQUI: Usamos o método 'push' para garantir que o SDK está pronto
function createAlarm() {
    window.OneSignal.push(async function() {
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
        
        // Agora, dentro deste bloco, temos a garantia que getUserId existe.
        const playerId = await window.OneSignal.getUserId();

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
    alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Chamamos a nossa nova função que garante a inicialização
        createAlarm();
    });
}
