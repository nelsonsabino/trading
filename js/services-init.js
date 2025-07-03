// js/services-init.js
import { supabaseUrl, supabaseAnonKey, oneSignalAppId } from './config.js';

// --- INICIALIZAÇÃO DA SUPABASE ---
const { createClient } = window.supabase;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Cliente Supabase inicializado.");



export function initializeServices() {
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
        OneSignal.init({
            appId: oneSignalAppId,
        });

        // Este evento é disparado quando o utilizador aceita as notificações
        OneSignal.on('subscriptionChange', function(isSubscribed) {
            if (isSubscribed) {
                OneSignal.getUserId().then(function(userId) {
                    console.log("OneSignal Player ID:", userId);
                    oneSignalPlayerId = userId;
                });
            }
        });
    });
    console.log("Serviços OneSignal e Supabase prontos para serem iniciados.");
}


