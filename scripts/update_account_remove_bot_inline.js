const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.html', 'utf8');

// Replace the bot conversations div in the Saved Content tab with an anchor link
const botLinkHtml = `
                  <!-- BOT CONVERSATIONS -->
                  <a href="bot-conversations.html" style="text-decoration: none; display: block; width: 100%; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <div class="saved-category" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                      <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                          <div style="display: flex; align-items: center; gap: 0.5rem;">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10-1.72 0-3.34-.437-4.757-1.202L2 22l1.246-5.127A9.957 9.957 0 0 1 2 12C2 6.477 6.477 2 12 2z"></path></svg>
                              Bot Conversations
                          </div>
                          <span style="color: var(--accent-cyan); font-weight: bold;">↗</span>
                      </h3>
                      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0;">Review your saved technical discussions with Hydrobot.</p>
                  </div>
                  </a>
`;

// regex to match the old div block
const regexBotDiv = /<!-- BOT CONVERSATIONS -->[\s\S]*?<div id="saved-conversations-container"[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(regexBotDiv, botLinkHtml);

// Remove the bot transcript modal
const regexModal = /<!-- BOT TRANSCRIPT MODAL -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
code = code.replace(regexModal, '');

fs.writeFileSync('d:/Hydrogen Proj/account.html', code, 'utf8');
console.log('account.html updated to remove inline bot stuff');
