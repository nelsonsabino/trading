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


// --- INÍCIO DA ALTERAÇÃO: Função de teste para upload de imagem ---
export async function uploadTestImageSupabase() {
    console.log("Iniciando teste de upload para o Supabase Storage...");

    // 1. Verificar se o utilizador está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("Erro: Utilizador não autenticado. Por favor, faça login primeiro.");
        alert("Erro: Utilizador não autenticado. Por favor, faça login primeiro.");
        return;
    }
    console.log(`Utilizador autenticado: ${user.email} (ID: ${user.id})`);

    // 2. Criar uma imagem de teste em canvas
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Fundo azul
    ctx.fillStyle = '#007bff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto "TEST" a branco
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEST', canvas.width / 2, canvas.height / 2);

    // 3. Converter o canvas para um ficheiro (Blob)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
    console.log("Imagem de teste criada com sucesso.");

    // 4. Definir o caminho do ficheiro no Storage
    // O caminho usa o UID do utilizador para cumprir as regras de segurança
    const filePath = `${user.id}/test-image-${Date.now()}.png`;
    console.log(`A tentar fazer upload para o bucket 'trade_images' no caminho: ${filePath}`);

    // 5. Fazer o upload para o Supabase Storage
    try {
        const { data, error } = await supabase
            .storage
            .from('trade_images')
            .upload(filePath, testFile);

        if (error) {
            throw error;
        }

        console.log("Upload bem-sucedido!", data);

        // 6. Obter o URL público da imagem
        const { data: publicUrlData } = supabase
            .storage
            .from('trade_images')
            .getPublicUrl(data.path);

        console.log("URL Público da imagem:", publicUrlData.publicUrl);
        alert(`Upload concluído com sucesso! Verifique a consola (F12) para ver o URL público da imagem.`);

    } catch (error) {
        console.error("Ocorreu um erro durante o upload:", error);
        alert(`Ocorreu um erro durante o upload. Verifique a consola (F12) para mais detalhes.`);
    }
}
// --- FIM DA ALTERAÇÃO ---
