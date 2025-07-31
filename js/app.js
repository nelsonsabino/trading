// js/app.js

// ... (imports) ...

document.addEventListener('DOMContentLoaded', () => {
    
    // ... (código do Service Worker e outros listeners) ...

    if (addModal.container) {
        addModal.closeBtn.addEventListener('click', closeAddModal);
        addModal.container.addEventListener('click', e => { if (e.target.id === 'add-opportunity-modal') closeAddModal(); });
        addModal.form.addEventListener('submit', handleAddSubmit);
        addModal.strategySelect.addEventListener('change', () => {
            const strategies = getStrategies(); 
            const selectedStrategyId = addModal.strategySelect.value;
            const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);
            
+           addModal.checklistContainer.innerHTML = ''; // Limpa sempre o container primeiro

            if (selectedStrategy && selectedStrategy.data.phases && selectedStrategy.data.phases.length > 0) {
                const potentialPhase = selectedStrategy.data.phases[0];
                if (potentialPhase) {
                    
+                   // Procura por um item do tipo 'image' na fase
+                   const imageItem = potentialPhase.items.find(item => item.type === 'image');
+                   if (imageItem && imageItem.url) {
+                       const imgElement = document.createElement('img');
+                       imgElement.src = imageItem.url;
+                       imgElement.style.maxWidth = '100%';
+                       imgElement.style.borderRadius = '8px';
+                       imgElement.style.marginBottom = '1.5rem';
+                       addModal.checklistContainer.appendChild(imgElement);
+                   }

                    generateDynamicChecklist(addModal.checklistContainer, [potentialPhase]);
-               } else {
-                   addModal.checklistContainer.innerHTML = '';
                }
-           } else {
-               addModal.checklistContainer.innerHTML = ''; 
            }
        });
    }

    // ... (resto do ficheiro) ...
});
