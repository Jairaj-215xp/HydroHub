const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/main-v2.js', 'utf8');

// Add chatbotSave to DOM selections
if (!code.includes("document.getElementById('chatbot-save')")) {
    code = code.replace(
        "const chatbotClose = document.getElementById('chatbot-close');",
        "const chatbotClose = document.getElementById('chatbot-close');\n    const chatbotSave = document.getElementById('chatbot-save');"
    );
}

// Add event listener for save
if (!code.includes("chatbotSave.addEventListener")) {
    const saveLogic = `
    if (chatbotSave) {
        chatbotSave.addEventListener('click', async () => {
            if (!auth || !auth.currentUser) {
                showToast("Please log in to save conversations.", "error");
                return;
            }
            if (chatHistory.length === 0) {
                showToast("No conversation to save.", "error");
                return;
            }
            
            try {
                const token = await auth.currentUser.getIdToken();
                const url = \`https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/\${auth.currentUser.uid}/bot_conversations\`;
                
                // Get the first user prompt as title, max 50 chars
                let title = "New Conversation";
                for (let msg of chatHistory) {
                    if (msg.role === 'user' && msg.parts && msg.parts.length > 0) {
                        title = msg.parts[0].text.substring(0, 50);
                        if (msg.parts[0].text.length > 50) title += '...';
                        break;
                    }
                }
                
                const payload = {
                    fields: {
                        timestamp: { stringValue: new Date().toISOString() },
                        title: { stringValue: title },
                        history: { stringValue: JSON.stringify(chatHistory) }
                    }
                };
                
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${token}\`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    showToast("Conversation saved successfully!", "success");
                } else {
                    throw new Error("Failed to save");
                }
            } catch(e) {
                console.error("Error saving conversation", e);
                showToast("Error saving conversation.", "error");
            }
        });
    }
`;
    
    code = code.replace(
        "chatbotClose.addEventListener('click', () => {",
        saveLogic + "\n    chatbotClose.addEventListener('click', () => {"
    );
}

fs.writeFileSync('d:/Hydrogen Proj/main-v2.js', code, 'utf8');
console.log('main-v2.js updated');
