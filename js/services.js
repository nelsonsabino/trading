// js/services.js - Ponto central para inicializar serviços externos

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Exportamos a instância do cliente Supabase para ser usada por toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// START OF MODIFICATION: Refactored function to be more robust and avoid race conditions
export function listenToAlarms(callback) {
    const alarmsChannel = supabase.channel('public:alarms');

    // Helper function to fetch all alarms and send them to the app
    const fetchAllAlarms = () => {
        supabase.from('alarms').select('*').order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    console.error("Erro ao buscar alarmes Supabase:", error);
                    callback([], error); // Inform the app about the error
                } else {
                    callback(data); // Send the fresh data to the app
                }
            });
    };

    alarmsChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alarms' }, payload => {
            console.log('Mudança em tempo real de alarme detetada!', payload);
            // Whenever a change happens (INSERT, UPDATE, DELETE), re-fetch the entire list
            // to ensure the UI is perfectly in sync with the database.
            fetchAllAlarms();
        })
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('Subscrito ao canal de alarmes em tempo real. A buscar dados iniciais...');
                // IMPORTANT: Perform the very first fetch ONLY after we get confirmation
                // that the real-time subscription is active. This closes the race condition window.
                fetchAllAlarms();
            } else if (status === 'CHANNEL_ERROR') {
                console.error('Erro no canal de subscrição de alarmes.', err);
                callback([], new Error('Falha na subscrição em tempo real.'));
            } else if (status === 'TIMED_OUT') {
                 console.error('Subscrição de alarmes expirou (timeout).');
                 callback([], new Error('Timeout na subscrição em tempo real.'));
            }
        });

    // Return the channel object in case the app needs to unsubscribe later
    return alarmsChannel;
}
// END OF MODIFICATION
