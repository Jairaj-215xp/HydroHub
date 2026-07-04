const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.js', 'utf8');

// regex to remove loadBotConversations block
const regexLoadBot = /\/\/ ==========================================\s*\/\/ BOT CONVERSATIONS LOGIC\s*\/\/ ==========================================\s*async function loadBotConversations[\s\S]*?modal\.style\.display = 'flex';\s*}/;
code = code.replace(regexLoadBot, '');

// regex to remove the modal listener
const regexListener = /const closeTranscriptModal = document\.getElementById\('close-transcript-modal'\);[\s\S]*?\}\s*\}/;
code = code.replace(regexListener, '');

// remove the call to loadBotConversations inside onAuthStateChanged
code = code.replace(
    "loadNotifications(user);\n        loadBotConversations(user);",
    "loadNotifications(user);"
);

fs.writeFileSync('d:/Hydrogen Proj/account.js', code, 'utf8');
console.log('account.js stripped of bot logic');
