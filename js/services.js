// js/services.js - Ponto central para inicializar serviços externos

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Exportamos a instância do cliente Supabase para ser usada por toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para escutar os alarmes em tempo real
export function listenToAlarms(callback) {
    // 1. Busca inicial dos alarmes
    supabase.from('alarms').select('*').order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error) {
                console.error("Erro ao buscar alarmes Supabase (inicial):", error);
                callback([], error);
            } else {
                callback(data);
            }
        });

    // 2. Subscrição em tempo real para mudanças na tabela 'alarms'
    const alarmsChannel = supabase.channel('public:alarms'); // Nome do canal deve ser único e descritivo

    alarmsChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alarms' }, payload => {
            console.log('Mudança em tempo real de alarme detetada!', payload);
            // Quando uma mudança ocorre, re-fetch todos os alarmes para obter o estado atualizado
            supabase.from('alarms').select('*').order('created_at', { ascending: false })
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Erro ao escutar alarmes Supabase (realtime callback):", error);
                        // Aqui pode decidir como lidar com o erro no realtime; talvez não chame o callback com erro
                    } else {
                        callback(data); // Chama o callback com os novos dados
                    }
                });
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscrito ao canal de alarmes em tempo real.');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('Erro no canal de subscrição de alarmes.');
            }
        });

    // Retorna o objeto do canal caso seja necessário cancelar a subscrição externamente
    return alarmsChannel;
}
