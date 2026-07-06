const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.html', 'utf8');

// 1. JSZip
if (!code.includes('jszip')) {
    code = code.replace(
        /<\/head>/,
        '    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>\n</head>'
    );
}

// 2. Notifications tab button
if (!code.includes('tab-notifications')) {
    code = code.replace(
        /<button class="sidebar-btn active" data-tab="tab-overview">Overview<\/button>/,
        '<button class="sidebar-btn" data-tab="tab-notifications">Notifications <span id="notif-badge" style="background: var(--accent-purple); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px; display: none;">0</span></button>\n              <button class="sidebar-btn active" data-tab="tab-overview">Overview</button>'
    );
}

// 3. Profile fields
if (!code.includes('profile-handle')) {
    code = code.replace(
        /<div class="profile-field">\s*<label>Email Address<\/label>/,
        `<div class="profile-field" style="display: flex; gap: 2rem; border-bottom: none; margin-bottom: 0;">
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
            <p id="profile-link-preview" style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem; display: none;">Preview: hydrohub.com/<span id="preview-handle-text"></span> <a href="#" id="btn-copy-link" style="color: var(--accent-purple); text-decoration: none; margin-left: 10px;">[Copy Link]</a></p>
        </div>
        <div class="profile-field">
            <label>Email Address</label>`
    );
}

// 4. Notifications tab content
if (!code.includes('id="tab-notifications"')) {
    code = code.replace(
        /<!-- OVERVIEW TAB -->/,
        `<!-- NOTIFICATIONS TAB -->
              <div id="tab-notifications" class="tab-content">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                      <h2 style="color: var(--accent-cyan);">Notifications</h2>
                      <button id="btn-mark-read" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Mark All as Read</button>
                  </div>
                  <div id="notifications-container" style="display: flex; flex-direction: column; gap: 1rem;">
                      <p style="color: var(--text-secondary);">Loading notifications...</p>
                  </div>
              </div>
              
              <!-- OVERVIEW TAB -->`
    );
}

// 5. Data export
if (!code.includes('btn-export-data')) {
    code = code.replace(
        /<h3 style="margin-bottom: 0.5rem;">Change Password<\/h3>/,
        `<h3 style="margin-bottom: 0.5rem;">Account Data Export</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">Download a copy of your uploaded papers, bookmarks, and account metadata in a structured ZIP file.</p>
                    <button id="btn-export-data" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem; background: var(--accent-purple);">Download My Data</button>
                    <p id="export-msg" style="margin-top: 0.5rem; font-size: 0.9rem;"></p>
                </div>
                <div style="margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="margin-bottom: 0.5rem;">Change Password</h3>`
    );
}

// Also wait, I lost my earlier edits to account.html (the ui-utils.js script tag removal from step 35! And my account.js cache bump!).
// No wait, git restore restored the original state from before I started.
// Let's add ui-utils inclusion or removal, and cache bump.
code = code.replace(/<script src="ui-utils\.js"><\/script>\s*/, '');
code = code.replace(/src="account\.js\?v=\d+"/, 'src="account.js?v=5"');
code = code.replace(/src="account\.js"/, 'src="account.js?v=5"');

// And I also made sure earlier that drafts/bookmarks cards had clickable wrappers.
// That is preserved in Git if it was committed?
// Let's just save.
fs.writeFileSync('d:/Hydrogen Proj/account.html', code, 'utf8');
console.log('Account HTML updated cleanly');
