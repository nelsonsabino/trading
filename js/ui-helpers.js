// js/ui-helpers.js

export function createChecklistItem(check, data) {
    const isRequired = check.required === false ? '' : 'required';
    const labelText = check.required === false ? check.label : `${check.label} <span class="required-asterisk">*</span>`;
    const isChecked = data && data[check.id] ? 'checked' : '';
    const item = document.createElement('div');
    item.className = 'checklist-item';
    item.innerHTML = `<input type="checkbox" id="${check.id}" ${isChecked} ${isRequired}><label for="${check.id}">${labelText}</label>`;
    return item;
}

export function createInputItem(input, data) {
    const item = document.createElement('div');
    item.className = 'input-item';
    const isRequired = input.required === false ? '' : 'required';
    const labelText = input.required === false ? input.label : `${input.label} <span class="required-asterisk">*</span>`;
    let inputHtml = `<label for="${input.id}">${labelText}</label>`;
    const value = data && data[input.id] ? data[input.id] : '';
    if (input.type === 'select') {
        const optionsHtml = input.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('');
        inputHtml += `<select id="${input.id}" ${isRequired}><option value="">-- Selecione --</option>${optionsHtml}</select>`;
    } else {
        inputHtml += `<input type="${input.type}" id="${input.id}" value="${value}" step="any" ${isRequired}>`;
    }
    item.innerHTML = inputHtml;
    return item;
}

export function createRadioGroup(radioInfo, data) {
    const group = document.createElement('div');
    group.className = 'radio-group';
    group.innerHTML = `<label><strong>${radioInfo.label}</strong></label>`;
    const checkedValue = data && data[radioInfo.name];
    radioInfo.options.forEach(opt => {
        const isChecked = checkedValue === opt.id ? 'checked' : '';
        const item = document.createElement('div');
        item.className = 'checklist-item';
        item.innerHTML = `<input type="radio" id="${opt.id}" name="${radioInfo.name}" value="${opt.id}" ${isChecked} required><label for="${opt.id}">${opt.label}</label>`;
        group.appendChild(item);
    });
    return group;
}
