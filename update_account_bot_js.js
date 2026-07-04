const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.js', 'utf8');

const loadConversationsLogic = `
// ==========================================
// BOT CONVERSATIONS LOGIC
// ==========================================
async function loadBotConversations(user) {
    const container = document.getElementById('saved-conversations-container');
    if (!container) return;
    
    try {
        const token = await user.getIdToken();
        const url = \`https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/\${user.uid}/bot_conversations\`;
        
        const res = await fetch(url, { headers: { 'Authorization': \`Bearer \${token}\` } });
        
        if (res.ok) {
            const data = await res.json();
            const docs = data.documents || [];
            
            if (docs.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">You have no saved conversations.</p>';
                return;
            }
            
            container.innerHTML = '';
            docs.forEach(doc => {
                const fields = doc.fields;
                const title = fields.title?.stringValue || 'Conversation';
                let timestamp = fields.timestamp?.stringValue || '';
                if (timestamp) timestamp = new Date(timestamp).toLocaleString();
                const historyStr = fields.history?.stringValue || '[]';
                
                const card = document.createElement('div');
                card.style.background = 'rgba(255,255,255,0.02)';
                card.style.border = '1px solid rgba(255,255,255,0.05)';
                card.style.borderRadius = '8px';
                card.style.padding = '1rem';
                card.style.display = 'flex';
                card.style.justifyContent = 'space-between';
                card.style.alignItems = 'center';
                
                card.innerHTML = \`
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; color: white;">\${title}</h4>
                        <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">\${timestamp}</p>
                    </div>
                    <button class="btn btn-outline btn-view-chat" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">View</button>
                \`;
                
                const btnView = card.querySelector('.btn-view-chat');
                btnView.addEventListener('click', () => {
                    openTranscriptModal(title, historyStr);
                });
                
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p style="color: #ff6666; font-size: 0.9rem;">Failed to load conversations.</p>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p style="color: #ff6666; font-size: 0.9rem;">Error loading conversations.</p>';
    }
}

function openTranscriptModal(title, historyStr) {
    const modal = document.getElementById('bot-transcript-modal');
    const titleEl = document.getElementById('bot-transcript-title');
    const contentEl = document.getElementById('bot-transcript-content');
    
    titleEl.innerText = title;
    contentEl.innerHTML = '';
    
    let history = [];
    try {
        history = JSON.parse(historyStr);
    } catch(e) {}
    
    history.forEach(msg => {
        const div = document.createElement('div');
        const isUser = msg.role === 'user';
        
        div.style.background = isUser ? 'rgba(255,255,255,0.05)' : 'rgba(108, 92, 231, 0.1)';
        div.style.border = isUser ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--accent-purple)';
        div.style.padding = '1rem';
        div.style.borderRadius = '8px';
        div.style.color = 'var(--text-primary)';
        div.style.fontSize = '0.9rem';
        div.style.lineHeight = '1.5';
        
        const label = document.createElement('div');
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '0.5rem';
        label.style.color = isUser ? 'white' : 'var(--accent-cyan)';
        label.innerText = isUser ? 'You' : 'Hydrobot';
        
        const text = document.createElement('div');
        text.innerText = msg.parts?.[0]?.text || '';
        
        div.appendChild(label);
        div.appendChild(text);
        contentEl.appendChild(div);
    });
    
    modal.style.display = 'flex';
}

const closeTranscriptModal = document.getElementById('close-transcript-modal');
if (closeTranscriptModal) {
    closeTranscriptModal.addEventListener('click', () => {
        document.getElementById('bot-transcript-modal').style.display = 'none';
    });
}
`;

if (!code.includes('loadBotConversations')) {
    code += '\n' + loadConversationsLogic;
    
    // add call to loadBotConversations inside onAuthStateChanged
    code = code.replace(
        /if \(user\) {\s*loadNotifications\(user\);/,
        "if (user) {\n        loadNotifications(user);\n        loadBotConversations(user);"
    );
}

fs.writeFileSync('d:/Hydrogen Proj/account.js', code, 'utf8');
console.log('account.js updated');
