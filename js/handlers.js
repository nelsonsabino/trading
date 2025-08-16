// js/handlers.js

import { addModal, armModal, execModal } from './dom-elements.js';
import { GESTAO_PADRAO } from './config.js';
// --- INÍCIO DA ALTERAÇÃO ---
import { getTrade, addTrade, updateTrade, closeTradeAndUpdateBalance, deleteTrade } from './firebase-service.js';
import { uploadTradeImage } from './services.js'; // Importar o novo serviço de upload
// --- FIM DA ALTERAÇÃO ---
import { getCurrentTrade, setCurrentTrade, getStrategies, setLastCreatedTradeId } from './state.js';
import { closeAddModal, closeArmModal, closeExecModal, closeCloseTradeModal, openAddModal, openArmModal, openExecModal } from './modals.js';
import { generateDynamicChecklist } from './ui.js';
import { supabase } from './services.js';

// --- INÍCIO DA ALTERAÇÃO: Variável de estado para a imagem colada ---
let pastedImageFile = null;
// --- FIM DA ALTERAÇÃO ---

// --- INÍCIO DA ALTERAÇÃO: Lógica para capturar e pré-visualizar a imagem colada ---
/**
 * Lida com o evento de colar imagem.
 * @param {ClipboardEvent} e - O evento de paste.
 * @param {HTMLElement} previewContainer - O contentor da pré-visualização.
 * @param {HTMLElement} pasteArea - A área onde se cola a imagem.
 */
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

/**
 * Configura os event listeners para colar e remover a imagem num modal específico.
 * @param {string} containerId - O ID do contentor principal do input da imagem.
 */
function setupImagePaste(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const pasteArea = container.querySelector('.paste-area');
    const previewContainer = container.querySelector('.preview-container');
    const removeBtn = container.querySelector('.remove-image-btn');

    const pasteHandler = (e) => handlePaste(e, previewContainer, pasteArea);
    
    pasteArea.addEventListener('paste', pasteHandler);
    // Adicionar listener ao documento para capturar o paste quando o modal está aberto
    document.addEventListener('paste', (e) => {
        if (container.closest('.modal-overlay').style.display === 'flex') {
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
// --- FIM DA ALTERAÇÃO ---

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

    // --- INÍCIO DA ALTERAÇÃO: Lógica de upload de imagem ---
    let imageUrl = getCurrentTrade()?.data?.imageUrl || ''; // Manter a imagem existente por defeito
    if (pastedImageFile) {
        try {
            imageUrl = await uploadTradeImage(pastedImageFile, assetName);
        } catch (error) {
            alert("Erro ao fazer o upload da imagem. O trade não foi guardado.");
            return;
        }
    }
    // --- FIM DA ALTERAÇÃO ---

    const tradeData = {
        asset: assetName,
        imageUrl: imageUrl, // Usar o novo ou o URL existente
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
    
    // --- INÍCIO DA ALTERAÇÃO: Lógica de upload de imagem ---
    let imageUrl = currentTrade.data.imageUrl || '';
    if (pastedImageFile) {
        try {
            imageUrl = await uploadTradeImage(pastedImageFile, currentTrade.data.asset);
        } catch (error) {
            alert("Erro ao fazer o upload da imagem. As alterações não foram guardadas.");
            return;
        }
    }
    // --- FIM DA ALTERAÇÃO ---

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

    // --- INÍCIO DA ALTERAÇÃO: Lógica de upload de imagem ---
    let imageUrl = currentTrade.data.imageUrl || '';
    if (pastedImageFile) {
        try {
            imageUrl = await uploadTradeImage(pastedImageFile, currentTrade.data.asset);
        } catch (error) {
            alert("Erro ao fazer o upload da imagem. As alterações não foram guardadas.");
            return;
        }
    }
    // --- FIM DA ALTERAÇÃO ---
    
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
    // ... (sem alterações nesta função)
}

export async function loadAndOpenForEditing(tradeId) {
    const strategies = getStrategies();
    const trade = await getTrade(tradeId);
    
    const deleteBtn = document.getElementById('delete-opportunity-btn');

    if (trade) {
        setCurrentTrade(trade);
        const selectedStrategy = strategies.find(s => s.id === trade.data.strategyId);
        if (!selectedStrategy) return;

        // --- INÍCIO DA ALTERAÇÃO: Lógica para mostrar imagem existente nos modais de edição ---
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
        // --- FIM DA ALTERAÇÃO ---

        if (trade.data.status === 'POTENTIAL') {
            openAddModal();
            addModal.strategySelect.value = trade.data.strategyId;
            const potentialPhase = (selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) ? selectedStrategy.data.phases[0] : null;
            generateDynamicChecklist(addModal.checklistContainer, [potentialPhase], trade.data.potentialSetup);
            
            const modalAssetInput = document.getElementById('asset');
            modalAssetInput.value = trade.data.asset;
            setupModalImage('paste-image-container-add', trade.data.imageUrl); // Mostrar imagem existente
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
            setupModalImage('paste-image-container-arm', trade.data.imageUrl); // Mostrar imagem existente
            if (deleteBtn) deleteBtn.style.display = 'none';
        } else if (trade.data.status === 'LIVE') {
            openExecModal(trade);
            setupModalImage('paste-image-container-exec', trade.data.imageUrl); // Mostrar imagem existente
            if (deleteBtn) deleteBtn.style.display = 'none';
        } else if (trade.data.status === 'CLOSED') {
            alert("Este trade já está fechado e não pode ser editado através deste modal.");
            closeAddModal();
        }
    }
}

// ... (Resto do ficheiro sem alterações) ...
export async function handleRevertStatus(trade, action) { /* ... */ }
export async function handleRevertToWatchlist(trade) { /* ... */ }
export async function handleDeleteAlarm(alarmId) { /* ... */ }

// --- INÍCIO DA ALTERAÇÃO: Inicializar a funcionalidade de paste nos modais ---
document.addEventListener('DOMContentLoaded', () => {
    setupImagePaste('paste-image-container-add');
    setupImagePaste('paste-image-container-arm');
    setupImagePaste('paste-image-container-exec');
});
// --- FIM DA ALTERAÇÃO ---
