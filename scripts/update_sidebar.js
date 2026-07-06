const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.html', 'utf8');

const targetStr = `<button class="sidebar-btn" data-tab="tab-notifications">Notifications <span id="notif-badge" style="background: var(--accent-purple); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px; display: none;">0</span></button>
              <button class="sidebar-btn active" data-tab="tab-overview">Overview</button>`;

const replaceStr = `<button class="sidebar-btn active" data-tab="tab-overview">Your Profile</button>
              <button class="sidebar-btn" data-tab="tab-notifications">Notifications <span id="notif-badge" style="background: var(--accent-purple); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px; display: none;">0</span></button>`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('d:/Hydrogen Proj/account.html', code, 'utf8');
console.log('Done');
