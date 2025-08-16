// js/services.js - Ponto central para inicializar serviços externos

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
// --- INÍCIO DA ALTERAÇÃO ---
import { getCurrentUserToken } from './firebase-service.js';
// --- FIM DA ALTERAÇÃO ---

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
    const alarmsChannel = supabase.channel('public:alarms');

    alarmsChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alarms' }, payload => {
            console.log('Mudança em tempo real de alarme detetada!', payload);
            // Quando uma mudança ocorre, re-fetch todos os alarmes para obter o estado atualizado
            supabase.from('alarms').select('*').order('created_at', { ascending: false })
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Erro ao escutar alarmes Supabase (realtime callback):", error);
                    } else {
                        callback(data);
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

    return alarmsChannel;
}

// --- INÍCIO DA ALTERAÇÃO: Lógica de autenticação híbrida ---
/**
 * Faz o upload de um ficheiro de imagem para o Supabase Storage.
 * @param {File} file - O ficheiro de imagem a ser enviado.
 * @param {string} assetName - O nome do ativo (ex: 'BTCUSDC') para organizar o ficheiro.
 * @returns {Promise<string>} O URL público da imagem enviada.
 */
export async function uploadTradeImage(file, assetName) {
    if (!file || !assetName) {
        throw new Error("Ficheiro e nome do ativo são obrigatórios para o upload.");
    }

    // 1. Obter o token de sessão do Firebase para autenticar no Supabase
    const token = await getCurrentUserToken();
    if (!token) {
        throw new Error("Utilizador não autenticado. Não é possível fazer o upload.");
    }
    
    // 2. Definir a sessão no Supabase usando o token do Firebase
    const { error: authError } = await supabase.auth.setSession({ access_token: token, refresh_token: '' });
    if (authError) {
        console.error("Erro ao definir a sessão no Supabase:", authError);
        throw new Error("Falha na autenticação com o serviço de armazenamento.");
    }
    
    // Obter o ID do utilizador da sessão que acabámos de definir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Sessão do utilizador inválida no Supabase após definir o token.");
    }

    const fileExtension = file.name.split('.').pop() || 'png';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${assetName}_${timestamp}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    console.log(`A enviar imagem para: ${filePath}`);

    const { data, error } = await supabase
        .storage
        .from('trade_images')
        .upload(filePath, file);

    if (error) {
        console.error("Erro no upload para o Supabase Storage:", error);
        throw error;
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('trade_images')
        .getPublicUrl(data.path);

    console.log("Upload bem-sucedido. URL público:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
}
// --- FIM DA ALTERAÇÃO ---
