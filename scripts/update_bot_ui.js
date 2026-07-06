const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/index.html', 'utf8');

// 1. Fix chatbot-close
code = code.replace(
    /<button id="chatbot-close" class="chatbot-close">.*?<\/button>/,
    '<button id="chatbot-close" class="chatbot-close" style="background: none; border: none; color: white; cursor: pointer; padding: 0.2rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>'
);

// 2. Add Save button
if (!code.includes('chatbot-save')) {
    code = code.replace(
        '<button id="chatbot-close"',
        '<button id="chatbot-save" class="chatbot-save" style="background: none; border: none; color: var(--accent-cyan); cursor: pointer; margin-right: 10px; padding: 0.2rem;" title="Save Conversation"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></button>\n                      <button id="chatbot-close"'
    );
}

fs.writeFileSync('d:/Hydrogen Proj/index.html', code, 'utf8');
console.log('index.html updated');
