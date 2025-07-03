// alarms.js (versão com polling para playerId)

console.log("1. Ficheiro alarms.js foi carregado.");

import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Inicializar Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("2. Cliente Supabase inicializado.");

// Inicializar OneSignal
window.OneSignal = window.OneSignal || [];
OneSignal.push(() => {
  OneSignal.init({ appId: oneSignalAppId });
  console.log("3. OneSignal inicializado.");
});

// Função para esperar pelo playerId com timeout
function waitForPlayerId(timeout = 30000) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const id = await OneSignal.getUserId();
      if (id) {
        clearInterval(interval);
        resolve(id);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Timeout a aguardar playerId'));
    }, timeout);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("4. Evento DOMContentLoaded disparado.");

  const alarmForm = document.getElementById('alarm-form');
  const feedbackDiv = document.getElementById('alarm-feedback');

  if (!alarmForm) {
    console.error("ERRO: Formulário de alarme não encontrado no DOM.");
    return;
  }

  async function createAlarm() {
    console.log("5. Botão 'Definir Alarme' clicado.");

    const submitButton = alarmForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    feedbackDiv.textContent = 'A processar...';
    feedbackDiv.style.color = '#000';

    try {
      // Esperar até obter o playerId
      const playerId = await waitForPlayerId();
      console.log("playerId obtido:", playerId);

      const assetName = document.getElementById('alarm-asset').value.trim();
      const condition = document.getElementById('alarm-condition-standalone').value;
      const targetPrice = parseFloat(document.getElementById('alarm-price-standalone').value);

      if (!assetName || isNaN(targetPrice) || targetPrice <= 0) {
        throw new Error("Por favor, preencha todos os campos com valores válidos.");
      }

      const alarmData = {
        asset_id: assetName.split('/')[0].toLowerCase(),
        asset_symbol: assetName.split('/')[0].toUpperCase(),
        condition: condition,
        target_price: targetPrice,
        onesignal_player_id: playerId,
        status: 'active'
      };

      const { error } = await supabase.from('alarms').insert([alarmData]);
      if (error) throw error;

      feedbackDiv.textContent = `✅ Alarme para ${assetName} criado com sucesso!`;
      feedbackDiv.style.color = '#28a745';
      alarmForm.reset();

    } catch (error) {
      console.error("Erro ao criar alarme:", error);
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
