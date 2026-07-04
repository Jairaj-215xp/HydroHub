export function showConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        
        const modal = document.createElement('div');
        modal.className = 'modal-content glass-card';
        modal.style.maxWidth = '400px';
        modal.style.textAlign = 'center';
        modal.style.padding = '2rem';
        
        const text = document.createElement('p');
        text.innerText = message;
        text.style.color = 'var(--text-primary)';
        text.style.fontSize = '1.1rem';
        text.style.marginBottom = '2rem';
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '1rem';
        btnContainer.style.width = '100%';
        
        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn-outline';
        btnCancel.innerText = 'Cancel';
        btnCancel.style.flex = '1';
        btnCancel.style.padding = '0.75rem';
        btnCancel.style.cursor = 'pointer';
        
        const btnConfirm = document.createElement('button');
        btnConfirm.className = 'btn-primary';
        btnConfirm.innerText = 'OK';
        btnConfirm.style.flex = '1';
        btnConfirm.style.padding = '0.75rem';
        btnConfirm.style.cursor = 'pointer';
        btnConfirm.style.background = 'var(--accent-cyan)';
        btnConfirm.style.color = '#000';
        btnConfirm.style.border = 'none';
        btnConfirm.style.borderRadius = '25px';
        
        btnCancel.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        
        btnConfirm.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        
        btnContainer.appendChild(btnCancel);
        btnContainer.appendChild(btnConfirm);
        
        modal.appendChild(text);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        
        document.body.appendChild(overlay);
    });
}

export function showAlert(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        
        const modal = document.createElement('div');
        modal.className = 'modal-content glass-card';
        modal.style.maxWidth = '400px';
        modal.style.textAlign = 'center';
        modal.style.padding = '2rem';
        
        const text = document.createElement('p');
        text.innerText = message;
        text.style.color = 'var(--text-primary)';
        text.style.fontSize = '1.1rem';
        text.style.marginBottom = '2rem';
        
        const btnConfirm = document.createElement('button');
        btnConfirm.className = 'btn-primary';
        btnConfirm.innerText = 'OK';
        btnConfirm.style.width = '100%';
        btnConfirm.style.padding = '0.75rem';
        btnConfirm.style.cursor = 'pointer';
        btnConfirm.style.background = 'var(--accent-cyan)';
        btnConfirm.style.color = '#000';
        btnConfirm.style.border = 'none';
        btnConfirm.style.borderRadius = '25px';
        
        btnConfirm.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        
        modal.appendChild(text);
        modal.appendChild(btnConfirm);
        overlay.appendChild(modal);
        
        document.body.appendChild(overlay);
    });
}
export function openDocumentViewer(url) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.padding = '2rem';
    overlay.style.backgroundColor = 'rgba(10, 10, 15, 0.95)';
    overlay.style.backdropFilter = 'blur(10px)';
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'flex-end';
    header.style.width = '100%';
    header.style.marginBottom = '1rem';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.innerText = 'Close Viewer';
    closeBtn.style.padding = '0.5rem 1rem';
    closeBtn.style.backgroundColor = 'var(--accent-purple)';
    closeBtn.style.color = '#fff';
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    header.appendChild(closeBtn);
    
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'glass-card';
    iframeContainer.style.width = '100%';
    iframeContainer.style.height = '100%';
    iframeContainer.style.overflow = 'hidden';
    iframeContainer.style.padding = '0';
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    
    iframeContainer.appendChild(iframe);
    
    overlay.appendChild(header);
    overlay.appendChild(iframeContainer);
    
    document.body.appendChild(overlay);
}
export function showTextModal(title, text) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    
    const modal = document.createElement('div');
    modal.className = 'modal-content glass-card';
    modal.style.maxWidth = '600px';
    modal.style.width = '90%';
    modal.style.maxHeight = '80vh';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.textAlign = 'left';
    modal.style.padding = '2rem';
    
    const titleEl = document.createElement('h3');
    titleEl.innerText = title;
    titleEl.style.color = 'var(--accent-cyan)';
    titleEl.style.marginBottom = '1rem';
    
    const contentBox = document.createElement('div');
    contentBox.style.overflowY = 'auto';
    contentBox.style.flex = '1';
    contentBox.style.marginBottom = '1.5rem';
    contentBox.style.paddingRight = '0.5rem';
    
    const textEl = document.createElement('p');
    textEl.innerText = text;
    textEl.style.color = 'var(--text-primary)';
    textEl.style.fontSize = '1rem';
    textEl.style.lineHeight = '1.6';
    textEl.style.whiteSpace = 'pre-wrap';
    
    contentBox.appendChild(textEl);
    
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'flex-end';
    
    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'btn-primary';
    btnConfirm.innerText = 'Close';
    btnConfirm.style.padding = '0.75rem 2rem';
    btnConfirm.style.cursor = 'pointer';
    
    btnConfirm.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    btnContainer.appendChild(btnConfirm);
    
    modal.appendChild(titleEl);
    modal.appendChild(contentBox);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}
