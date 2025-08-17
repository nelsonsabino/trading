// js/handlers.js

import { addModal, armModal, execModal } from './dom-elements.js';
import { GESTAO_PADRAO } from './config.js';
import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance, deleteTrade, getCurrentUserToken } from './firebase-service.js';
import { getCurrentTrade, setCurrentTrade, getStrategies, setLastCreatedTradeId } from './state.js';
import { closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, openAddModal, openArmModal, openExecModal } from './modals.js';
import { generateDynamicChecklist } from './ui.js';
import { supabase } from './services.js';

let pastedImageFile = null;

function handlePaste(e, previewContainer, pasteArea) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            if (blob) {
                pastedImageFile = new File([blob], "pasted_image.png", { type: "image/png" });
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const previewImg = previewContainer.querySelector('.image-preview');
                    previewImg.src = event.target.result;
                    pasteArea.style.display = 'none';
                    previewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(blob);
            }
            break; 
        }
    }
}

function setupImagePaste(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const pasteArea = container.querySelector('.paste-area');
    const previewContainer = container.querySelector('.preview-container');
    const removeBtn = container.querySelector('.remove-image-btn');

    const pasteHandler = (e) => handlePaste(e, previewContainer, pasteArea);
    
    pasteArea.addEventListener('paste', pasteHandler);
    document.addEventListener('paste', (e) => {
        if (container.closest('.modal-overlay')?.style.display === 'flex') {
            handlePaste(e, previewContainer, pasteArea);
        }
    });

    removeBtn.addEventListener('click', () => {
        pastedImageFile = null;
        const previewImg = previewContainer.querySelector('.image-preview');
        previewImg.src = '';
        previewContainer.style.display = 'none';
        pasteArea.style.display = 'flex';
    });
}

// --- INÍCIO DA ALTERAÇÃO FINAL ---
async function uploadPastedImage(imageFile, assetName) {
    try {
        const token = await getCurrentUserToken();
        if (!token) throw new Error("Utilizador não autenticado.");

        // Definir o token de autenticação no cliente Supabase ANTES de chamar a função
        supabase.auth.setAuth(token);

        // Chamar a Edge Function (agora autenticada) para obter o Signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabase.functions.invoke('create-signed-upload-url', {
            body: { assetName: assetName }
        });

        if (signedUrlError) throw signedUrlError;

        // Fazer o upload do ficheiro para o Signed URL com o método PUT
        const uploadResponse = await fetch(signedUrlData.uploadUrl, {
            method: 'PUT',
            body: imageFile,
            headers: { 'Content-Type': imageFile.type }
        });
        
        if (!uploadResponse.ok) {
            const errorBody = await uploadResponse.text();
            throw new Error(`Falha no upload para o Storage: ${uploadResponse.statusText} - ${errorBody}`);
        }
        
        console.log("Upload bem-sucedido. URL público:", signedUrlData.publicUrl);
        return signedUrlData.publicUrl;

    } catch (error) {
        console.error("Falha no processo de upload da imagem:", error);
        return null;
    }
}
// --- FIM DA ALTERAÇÃO FINAL ---

export async function handleAddSubmit(e) {
    e.preventDefault();
    
    const redirectToAlarmCheckbox = document.getElementById('redirect-to-alarm-checkbox');
    const shouldRedirect = redirectToAlarmCheckbox.checked;
    const assetInput = document.getElementById('asset');
    const assetName = assetInput.value.trim().toUpperCase();

    const strategies = getStrategies();
    const strategyId = addModal.strategySelect.value;
    const selectedStrategy = strategies.find(s => s.id === strategyId);
    if (!selectedStrategy) {
        alert("Por favor, selecione uma estratégia válida.");
        return;
    }
    
    const checklistData = {};
    const potentialPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) ? selectedStrategy.data.phases[0] : null;
    if (potentialPhase && potentialPhase.items) {
        potentialPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                checklistData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }

    let imageUrl = getCurrentTrade()?.data?.imageUrl || '';
    if (pastedImageFile) {
        const newUrl = await uploadPastedImage(pastedImageFile, assetName);
        if (newUrl) {
            imageUrl = newUrl;
        } else {
            alert("Erro ao fazer o upload da imagem. O trade não foi guardado.");
            return;
        }
    }

    const tradeData = {
        asset: assetName,
        imageUrl: imageUrl,
        notes: document.getElementById('notes').value,
        strategyId: strategyId,
        strategyName: selectedStrategy.data.name || 'N/A',
        status: "POTENTIAL",
        potentialSetup: checklistData
    };

    try {
        const currentTrade = getCurrentTrade();
        if (currentTrade.id) {
            tradeData.dateAdded = currentTrade.data.dateAdded;
            await updateTrade(currentTrade.id, tradeData);
            setLastCreatedTradeId(null);
        } else {
            tradeData.dateAdded = new Date();
            const newTradeId = await addTrade(tradeData);
            setLastCreatedTradeId(newTradeId);
        }
    } catch (error) {
        alert("Ocorreu um erro ao guardar o trade. Verifique a consola.");
        return;
    }
    
    closeAddModal();

    if (shouldRedirect) {
        if (assetName) {
            window.location.href = `alarms-create.html?assetPair=${assetName}`;
        } else {
            window.location.href = 'alarms-create.html';
        }
    }
}

export async function handleArmSubmit(e) {
    e.preventDefault();
    const strategies = getStrategies();
    const currentTrade = getCurrentTrade();
    
    const selectedStrategy = strategies.find(s => s.id === currentTrade.data.strategyId);
    if (!selectedStrategy) return;

    const checklistData = {};
    const armedPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 1) ? selectedStrategy.data.phases[1] : null;

    if (armedPhase && armedPhase.items) {
        armedPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                checklistData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }
    
    let imageUrl = currentTrade.data.imageUrl || '';
    if (pastedImageFile) {
        const newUrl = await uploadPastedImage(pastedImageFile, currentTrade.data.asset);
        if (newUrl) {
            imageUrl = newUrl;
        } else {
            alert("Erro ao fazer o upload da imagem. As alterações não foram guardadas.");
            return;
        }
    }

    const updateData = {
        status: "ARMED",
        armedSetup: checklistData,
        dateArmed: new Date(),
        imageUrl: imageUrl
    };
    await updateTrade(currentTrade.id, updateData);

    closeArmModal();
}

export async function handleExecSubmit(e) {
    e.preventDefault();
    const strategies = getStrategies();
    const currentTrade = getCurrentTrade();
    const executionData = {};

    for (const input of GESTAO_PADRAO.inputs) {
        const element = document.getElementById(input.id);
        if (element) {
            const value = parseFloat(element.value);
            if (input.required && (isNaN(value) || value <= 0)) {
                alert(`Por favor, insira um valor válido e positivo para "${input.label}".`);
                return;
            }
            executionData[input.id] = element.value;
        }
    }

    const selectedStrategy = strategies.find(s => s.id === currentTrade.data.strategyId);
    if (!selectedStrategy) return;
    
    const executionPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 2) ? selectedStrategy.data.phases[2] : null;
    
    if (executionPhase && executionPhase.items) {
        executionPhase.items.forEach(item => {
            const element = document.getElementById(item.id);
            if(element) {
                executionData[item.id] = item.type === 'checkbox' ? element.checked : element.value;
            }
        });
    }

    let imageUrl = currentTrade.data.imageUrl || '';
    if (pastedImageFile) {
        const newUrl = await uploadPastedImage(pastedImageFile, currentTrade.data.asset);
        if (newUrl) {
            imageUrl = newUrl;
        } else {
            alert("Erro ao fazer o upload da imagem. As alterações não foram guardadas.");
            return;
        }
    }
    
    const updateData = {
        status: "LIVE",
        executionDetails: executionData,
        dateExecuted: new Date(),
        imageUrl: imageUrl
    };
    await updateTrade(currentTrade.id, updateData);

    closeExecModal();
}

export async function handleCloseSubmit(e) {
    e.preventDefault();
    
    const exitPriceValue = parseFloat(document.getElementById('exit-price').value);
    const pnlValue = parseFloat(document.getElementById('final-pnl').value);

    if (isNaN(exitPriceValue) || exitPriceValue <= 0) {
        alert("Por favor, insira um Preço de Saída válido e positivo.");
        return;
    }
    if (isNaN(pnlValue)) {
        alert("Por favor, insira um valor de P&L válido (pode ser negativo).");
        return;
    }

    const currentTrade = getCurrentTrade();
    const closeDetails = {
        exitPrice: exitPriceValue,
        pnl: pnlValue,
        closeReason: document.getElementById('close-reason').value,
        finalNotes: document.getElementById('final-notes').value,
        exitScreenshotUrl: document.getElementById('exit-screenshot-url').value
    };
    try {
        await closeTradeAndUpdateBalance(currentTrade.id, closeDetails);
        closeCloseTradeModal();
    } catch (error) {
        console.error("Erro ao fechar trade (UI):", error);
        alert("Ocorreu um erro ao fechar o trade. Verifique a consola para mais detalhes.");
    }
}

export async function loadAndOpenForEditing(tradeId) {
    const strategies = getStrategies();
    const trade = await getTrade(tradeId);
    
    const deleteBtn = document.getElementById('delete-opportunity-btn');

    if (trade) {
        setCurrentTrade(trade);
        const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
        if (!selectedStrategy) return;

        const setupModalImage = (containerId, imageUrl) => {
            const container = document.getElementById(containerId);
            if (!container || !imageUrl) return;

            const pasteArea = container.querySelector('.paste-area');
            const previewContainer = container.querySelector('.preview-container');
            const previewImg = previewContainer.querySelector('.image-preview');
            
            previewImg.src = imageUrl;
            pasteArea.style.display = 'none';
            previewContainer.style.display = 'flex';
        };

        if (trade.data.status === 'POTENTIAL') {
            openAddModal();
            addModal.strategySelect.value = trade.data.strategyId;
            const potentialPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) ? selectedStrategy.data.phases[0] : null;
            generateDynamicChecklist(addModal.checklistContainer, [potentialPhase], trade.data.potentialSetup);
            
            const modalAssetInput = document.getElementById('asset');
            modalAssetInput.value = trade.data.asset;
            setupModalImage('paste-image-container-add', trade.data.imageUrl);
            document.getElementById('notes').value = trade.data.notes;

            if (deleteBtn) {
                deleteBtn.style.display = 'inline-block';
                deleteBtn.onclick = async () => {
                    if (confirm("Tem certeza que quer apagar este trade? Esta ação é irreversível.")) {
                        try {
                            await deleteTrade(trade.id);
                            alert("Trade apagado com sucesso!");
                            closeAddModal();
                        } catch (error) {
                            console.error("Erro ao apagar trade:", error);
                            alert("Ocorreu um erro ao apagar o trade.");
                        }
                    }
                };
            }

        } else if (trade.data.status === 'ARMED') {
            openArmModal(trade);
            setupModalImage('paste-image-container-arm', trade.data.imageUrl);
            if (deleteBtn) deleteBtn.style.display = 'none';
        } else if (trade.data.status === 'LIVE') {
            openExecModal(trade);
            setupModalImage('paste-image-container-exec', trade.data.imageUrl);
            if (deleteBtn) deleteBtn.style.display = 'none';
        } else if (trade.data.status === 'CLOSED') {
            alert("Este trade já está fechado e não pode ser editado através deste modal.");
            closeAddModal();
        }
    }
}

export async function handleRevertStatus(trade, action) {
    const newStatus = action === 'revert-to-potential' ? 'POTENTIAL' : 'ARMED';
    const confirmationMessage = `Tem a certeza que quer reverter o status deste trade para "${newStatus}"?`;

    if (confirm(confirmationMessage)) {
        try {
            await updateTrade(trade.id, { status: newStatus });
        } catch (error) {
            console.error("Erro ao reverter o status do trade:", error);
            alert("Ocorreu um erro ao reverter o status do trade.");
        }
    }
}

export async function handleRevertToWatchlist(trade) {
    const confirmationMessage = `Tem a certeza que quer remover este trade da coluna "Potencial"?\n\nO ativo continuará a ser monitorizado na Watchlist de Alarmes.`;
    if (confirm(confirmationMessage)) {
        try {
            const { data: existingAlarms, error: fetchError } = await supabase
                .from('alarms')
                .select('id')
                .eq('asset_pair', trade.data.asset)
                .eq('status', 'active');

            if (fetchError) throw fetchError;

            if (existingAlarms.length === 0) {
                console.log(`Nenhum alarme ativo para ${trade.data.asset}. A criar alarme padrão.`);
                const alarmData = {
                    asset_pair: trade.data.asset,
                    alarm_type: 'stochastic_crossover',
                    condition: 'above',
                    indicator_timeframe: '15m',
                    indicator_period: 14,
                    combo_period: 3,
                    status: 'active'
                };
                const { error: insertError } = await supabase.from('alarms').insert([alarmData]);
                if (insertError) throw insertError;
            }

            await deleteTrade(trade.id);
        } catch (error) {
            console.error("Erro ao reverter para a watchlist:", error);
            alert("Ocorreu um erro ao reverter o trade para a watchlist.");
        }
    }
}

export async function handleDeleteAlarm(alarmId) {
    if (!alarmId) return;

    const confirmation = confirm("Tem a certeza que quer apagar este alarme permanentemente?");
    if (confirmation) {
        try {
            const { error } = await supabase
                .from('alarms')
                .delete()
                .eq('id', alarmId);

            if (error) {
                throw new Error(`Erro no Supabase ao apagar o alarme: ${error.message}`);
            }
            location.reload(); 
        } catch (error) {
            console.error("Erro ao apagar alarme:", error);
            alert("Não foi possível apagar o alarme. Verifique a consola para mais detalhes.");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupImagePaste('paste-image-container-add');
    setupImagePaste('paste-image-container-arm');
    setupImagePaste('paste-image-container-exec');
});
