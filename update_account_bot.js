const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.html', 'utf8');

const botContainerHtml = `
                  <!-- BOT CONVERSATIONS -->
                  <div class="saved-category" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                      <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10-1.72 0-3.34-.437-4.757-1.202L2 22l1.246-5.127A9.957 9.957 0 0 1 2 12C2 6.477 6.477 2 12 2z"></path></svg>
                          Bot Conversations
                      </h3>
                      <div id="saved-conversations-container" style="display: flex; flex-direction: column; gap: 1rem;">
                          <p style="color: var(--text-secondary); font-size: 0.9rem;">Loading saved conversations...</p>
                      </div>
                  </div>
`;

if (!code.includes('saved-conversations-container')) {
    code = code.replace(
        '<!-- BOOKMARKS -->',
        botContainerHtml + '\n                  <!-- BOOKMARKS -->'
    );
}

const modalHtml = `
  <!-- BOT TRANSCRIPT MODAL -->
  <div id="bot-transcript-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
          <div style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
              <h3 id="bot-transcript-title" style="margin: 0; color: var(--accent-cyan);">Conversation</h3>
              <button id="close-transcript-modal" style="background: none; border: none; color: white; cursor: pointer; padding: 0.2rem;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <div id="bot-transcript-content" style="padding: 1rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem;">
              <!-- Transcript populated by JS -->
          </div>
      </div>
  </div>
`;

if (!code.includes('bot-transcript-modal')) {
    code = code.replace(
        '</body>',
        modalHtml + '\n</body>'
    );
}

fs.writeFileSync('d:/Hydrogen Proj/account.html', code, 'utf8');
console.log('account.html updated');
