// js/alarms.js
import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const alarmForm = document.getElementById('alarm-form');
    const feedbackDiv = document.getElementById('alarm-feedback');

    if (!alarmForm || !supabase) {
        console.error("ERRO: Formulário de alarme ou cliente Supabase não encontrado.");
        return;
    }

    async function createAlarm() {
        const submitButton = alarmForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        feedbackDiv.textContent = 'A processar...';
        
        try {
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
