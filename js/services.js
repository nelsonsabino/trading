// js/services.js - Ponto central para inicializar serviços externos

import { supabaseUrl, supabaseAnonKey } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { getCurrentUserToken } from './firebase-service.js';

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


// --- INÍCIO DA ALTERAÇÃO FINAL ---
/**
 * Faz o upload de um ficheiro de imagem para o Supabase Storage, autenticando com o token do Firebase.
 * @param {File} file - O ficheiro de imagem a ser enviado.
 * @param {string} assetName - O nome do ativo (ex: 'BTCUSDC') para organizar o ficheiro.
 * @returns {Promise<string>} O URL público da imagem enviada.
 */
export async function uploadTradeImage(file, assetName) {
    if (!file || !assetName) {
        throw new Error("Ficheiro e nome do ativo são obrigatórios para o upload.");
    }

    // 1. Obter o token de sessão do Firebase
    const token = await getCurrentUserToken();
    if (!token) {
        throw new Error("Utilizador não autenticado no Firebase. Não é possível fazer o upload.");
    }

    // 2. Autenticar no Supabase usando o token do Firebase
    const { data: { user }, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'firebase',
        token: token,
    });

    if (signInError) {
        console.error("Erro ao autenticar no Supabase com o token do Firebase:", signInError);
        throw new Error("Falha na autenticação com o serviço de armazenamento.");
    }

    if (!user) {
        throw new Error("Autenticação com Supabase não retornou um utilizador.");
    }

    // 3. Preparar o caminho e o nome do ficheiro
    const fileExtension = file.name.split('.').pop() || 'png';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${assetName}_${timestamp}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    console.log(`Utilizador autenticado no Supabase (ID: ${user.id}). A enviar imagem para: ${filePath}`);

    // 4. Fazer o upload para o Supabase Storage
    const { data, error: uploadError } = await supabase
        .storage
        .from('trade_images')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Erro no upload para o Supabase Storage:", uploadError);
        throw uploadError;
    }

    // 5. Obter o URL público para guardar no Firestore
    const { data: publicUrlData } = supabase
        .storage
        .from('trade_images')
        .getPublicUrl(data.path);

    console.log("Upload bem-sucedido. URL público:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
}
// --- FIM DA ALTERAÇÃO FINAL ---
