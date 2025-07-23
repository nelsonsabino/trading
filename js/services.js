// js/services.js - Ponto central para inicializar serviços externos

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Exportamos a instância do cliente Supabase para ser usada por toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para obter um alarme específico por ID
export async function getAlarm(alarmId) {
    try {
        const { data, error } = await supabase.from('alarms').select('*').eq('id', alarmId).single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Erro ao buscar alarme:", error.message);
        return null;
    }
}
