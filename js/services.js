// js/services.js - Ponto central para inicializar serviços externos

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Exportamos a instância do cliente Supabase para ser usada por toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para escutar os alarmes em tempo real
export function listenToAlarms(callback) {
    // Supondo que você queira todos os alarmes, ordenados pelo mais recente
    const subscription = supabase
        .from('alarms')
        .select('*')
        .order('created_at', { ascending: false })
        .on('*', payload => { // Escuta qualquer mudança na tabela 'alarms'
            // Quando há uma mudança, re-fetch todos os alarmes para garantir consistência
            supabase.from('alarms').select('*').order('created_at', { ascending: false })
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Erro ao escutar alarmes Supabase (callback):", error);
                        callback([], error);
                    } else {
                        callback(data);
                    }
                });
        })
        .subscribe();
    
    // Para a carga inicial
    supabase.from('alarms').select('*').order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error) {
                console.error("Erro ao buscar alarmes Supabase (inicial):", error);
                callback([], error);
            } else {
                callback(data);
            }
        });
    
    // Retorna a subscrição caso precise de ser cancelada
    return subscription;
}