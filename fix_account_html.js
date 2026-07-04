const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.html', 'utf8');

// 1. Add Notifications tab button
if (!code.includes('tab-notifications')) {
    code = code.replace(
        '<button class="sidebar-btn active" data-tab="tab-overview">Overview</button>',
        '<button class="sidebar-btn" data-tab="tab-notifications">Notifications <span id="notif-badge" style="background: var(--accent-purple); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px; display: none;">0</span></button>\n              <button class="sidebar-btn active" data-tab="tab-overview">Overview</button>'
    );
}

// 2. Add Notifications Tab content
if (!code.includes('id="tab-notifications"')) {
    const notifHtml = `
              <!-- NOTIFICATIONS TAB -->
              <div id="tab-notifications" class="tab-content">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                      <h2 style="color: var(--accent-cyan);">Notifications</h2>
                      <button id="btn-mark-read" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Mark All as Read</button>
                  </div>
                  <div id="notifications-container" style="display: flex; flex-direction: column; gap: 1rem;">
                      <p style="color: var(--text-secondary);">Loading notifications...</p>
                  </div>
              </div>
`;
    code = code.replace(
        '<!-- OVERVIEW TAB -->',
        notifHtml + '\n              <!-- OVERVIEW TAB -->'
    );
}

// 3. Add Followers, Following, Handle to Overview Tab
if (!code.includes('profile-followers-count')) {
    const networkHtml = `
                  <div class="profile-field" style="display: flex; gap: 2rem; border-bottom: none; margin-bottom: 0;">
                      <div style="flex: 1; text-align: center; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 10px;">
                          <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Followers</h4>
                          <div id="profile-followers-count" style="font-size: 1.5rem; color: var(--accent-cyan); font-weight: bold;">0</div>
                      </div>
                      <div style="flex: 1; text-align: center; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 10px;">
                          <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Following</h4>
                          <div id="profile-following-count" style="font-size: 1.5rem; color: var(--accent-cyan); font-weight: bold;">0</div>
                      </div>
                  </div>
                  <div class="profile-field">
                      <label>Public Profile Handle</label>
                      <div class="val" id="profile-handle" style="font-family: monospace; color: var(--accent-cyan);">Not Set</div>
                      <div style="display: flex; gap: 1rem; align-items: center; width: 100%;">
                          <input type="text" id="edit-profile-handle" class="glass-input" style="display: none; flex: 1;" placeholder="e.g. jairaj21">
                      </div>
                  </div>
`;
    code = code.replace(
        '<div class="profile-field">\r\n                    <label>Email Address</label>',
        networkHtml + '\n                  <div class="profile-field">\n                    <label>Email Address</label>'
    );
}

// 4. Update Saved Content tab to be clickable + Add Bot Conversations
if (!code.includes('bot-transcript-modal')) {
    // Replace Drafts and Bookmarks with clickable versions
    const savedHtml = `
              <!-- SAVED CONTENT TAB -->
              <div id="tab-saved" class="tab-content">
                  <h2 style="margin-bottom: 2rem; color: var(--accent-cyan);">Saved Content</h2>
                  
                  <!-- DRAFTS -->
                  <a href="drafts.html" style="text-decoration: none; display: block; width: 100%; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <div class="saved-category" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                      <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                          <div style="display: flex; align-items: center; gap: 0.5rem;">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              Drafts
                          </div>
                          <span style="color: var(--accent-cyan); font-weight: bold;">↗</span>
                      </h3>
                      <div id="saved-drafts-container">
                          <p style="color: var(--text-secondary); font-size: 0.9rem;">You have no unpublished drafts.</p>
                      </div>
                  </div>
                  </a>

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

                  <!-- BOOKMARKS -->
                  <a href="bookmarks.html" style="text-decoration: none; display: block; width: 100%; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                  <div class="saved-category" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                      <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                          <div style="display: flex; align-items: center; gap: 0.5rem;">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                              Bookmarks
                          </div>
                          <span style="color: var(--accent-cyan); font-weight: bold;">↗</span>
                      </h3>
                      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0;">View all your saved academic and community research papers.</p>
                  </div>
                  </a>
              </div>
`;
    // Replace the old tab-saved completely
    code = code.replace(
        /<div id="tab-saved" class="tab-content">[\s\S]*?<!-- SETTINGS TAB -->/,
        savedHtml + '\n\n              <!-- SETTINGS TAB -->'
    );
    
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
    code = code.replace('</body>', modalHtml + '\n</body>');
}

// 5. Add Export Data to Settings Tab
if (!code.includes('btn-export-data')) {
    const exportHtml = `
                  <div style="margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                      <h3 style="margin-bottom: 0.5rem;">Account Data Export</h3>
                      <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">Download a copy of your uploaded papers, bookmarks, and account metadata in a structured ZIP file.</p>
                      <button id="btn-export-data" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: var(--accent-purple);">Download My Data</button>
                      <p id="export-msg" style="margin-top: 0.5rem; font-size: 0.9rem;"></p>
                  </div>
`;
    code = code.replace(
        '<h2 style="margin-bottom: 2rem; color: var(--accent-cyan);">Security & Settings</h2>',
        '<h2 style="margin-bottom: 2rem; color: var(--accent-cyan);">Security & Settings</h2>\n' + exportHtml
    );
}

fs.writeFileSync('d:/Hydrogen Proj/account.html', code, 'utf8');
console.log('Restored all UI elements in account.html');
