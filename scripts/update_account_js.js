const fs = require('fs');
let code = fs.readFileSync('d:/Hydrogen Proj/account.js', 'utf8');

// 1. Update profileFields array
if (!code.includes("'handle'")) {
    code = code.replace(
        "const profileFields = ['name', 'bio', 'university', 'field-study', 'github', 'linkedin', 'orcid', 'location', \n'website', 'dob', 'gender', 'language', 'timezone'];",
        "const profileFields = ['name', 'handle', 'bio', 'university', 'field-study', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];"
    );
    code = code.replace(
        "const profileFields = ['name', 'bio', 'university', 'field-study', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];",
        "const profileFields = ['name', 'handle', 'bio', 'university', 'field-study', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];"
    );
}

// 2. Add handle/followers logic to loadProfile
if (!code.includes("document.getElementById('profile-handle').innerText")) {
    code = code.replace(
        "document.getElementById('profile-name').innerText = name;",
        `document.getElementById('profile-name').innerText = name;
            
            const handle = fields.handle?.stringValue || '';
            document.getElementById('profile-handle').innerText = handle ? '@' + handle : 'Not Set';
            document.getElementById('edit-profile-handle').value = handle;
            
            if (handle) {
                document.getElementById('profile-link-preview').style.display = 'block';
                document.getElementById('preview-handle-text').innerText = handle;
            } else {
                document.getElementById('profile-link-preview').style.display = 'none';
            }

            const followersArr = fields.followers?.arrayValue?.values || [];
            const followingArr = fields.following?.arrayValue?.values || [];
            document.getElementById('profile-followers-count').innerText = followersArr.length;
            document.getElementById('profile-following-count').innerText = followingArr.length;
            `
    );
}

// 3. Update Save Payload
if (!code.includes("handle: { stringValue:")) {
    code = code.replace(
        "const updateFields = ['name', 'bio', 'university', 'fieldStudy', 'github', 'linkedin', 'orcid', 'location', \n'website', 'dob', 'gender', 'language', 'timezone'];",
        "const updateFields = ['name', 'handle', 'bio', 'university', 'fieldStudy', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];"
    );
    code = code.replace(
        "const updateFields = ['name', 'bio', 'university', 'fieldStudy', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];",
        "const updateFields = ['name', 'handle', 'bio', 'university', 'fieldStudy', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];"
    );
    
    code = code.replace(
        "name: { stringValue: document.getElementById('edit-profile-name').value.trim() },",
        `name: { stringValue: document.getElementById('edit-profile-name').value.trim() },
                handle: { stringValue: document.getElementById('edit-profile-handle').value.trim().replace(/[^a-zA-Z0-9_]/g, '') },`
    );
}

// 4. Add Handle Duplication Check before saving
if (!code.includes("isHandleTaken")) {
    code = code.replace(
        "btnSaveEdit.addEventListener('click', async () => {\n    try {\n        btnSaveEdit.disabled = true;",
        `async function isHandleTaken(handle, currentUid) {
    if (!handle) return false;
    const url = \`https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents:runQuery\`;
    const payload = {
        structuredQuery: {
            from: [{ collectionId: 'users' }],
            where: {
                compositeFilter: {
                    op: 'AND',
                    filters: [
                        { fieldFilter: { field: { fieldPath: 'handle' }, op: 'EQUAL', value: { stringValue: handle } } }
                    ]
                }
            }
        }
    };
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(url, { method: 'POST', headers: { 'Authorization': \`Bearer \${token}\` }, body: JSON.stringify(payload) });
        if (!res.ok) return false;
        const data = await res.json();
        // data[0].document exists if found. Check if the found doc matches the current user.
        if (data && data.length > 0 && data[0].document) {
            const foundName = data[0].document.name;
            if (!foundName.endsWith(\`/\${currentUid}\`)) return true; // Someone else has it
        }
        return false;
    } catch(e) { return false; }
}

btnSaveEdit.addEventListener('click', async () => {
    try {
        btnSaveEdit.disabled = true;
        const handleVal = document.getElementById('edit-profile-handle').value.trim().replace(/[^a-zA-Z0-9_]/g, '');
        if (handleVal) {
            const taken = await isHandleTaken(handleVal, auth.currentUser.uid);
            if (taken) {
                showToast("This handle is already taken.", "error");
                btnSaveEdit.disabled = false;
                return;
            }
        }
`
    );
}

// 5. Append Export Data and Notifications Logic at EOF
if (!code.includes("btn-export-data")) {
    code += `

// ==========================================
// MOCK LINK COPY LOGIC
// ==========================================
const btnCopyLink = document.getElementById('btn-copy-link');
if (btnCopyLink) {
    btnCopyLink.addEventListener('click', (e) => {
        e.preventDefault();
        const handle = document.getElementById('preview-handle-text').innerText;
        const url = \`\${window.location.origin}/@\${handle}\`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = btnCopyLink.innerText;
            btnCopyLink.innerText = '[Copied!]';
            setTimeout(() => { btnCopyLink.innerText = originalText; }, 2000);
        });
    });
}

// ==========================================
// NOTIFICATIONS LOGIC
// ==========================================
async function loadNotifications(user) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    try {
        const token = await user.getIdToken();
        const url = \`https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/\${user.uid}/notifications\`;
        
        const res = await fetch(url, {
            headers: { 'Authorization': \`Bearer \${token}\` }
        });
        
        if (res.ok) {
            const data = await res.json();
            const docs = data.documents || [];
            
            if (docs.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary);">No new notifications.</p>';
                return;
            }
            
            container.innerHTML = '';
            let unreadCount = 0;
            
            docs.forEach(doc => {
                const id = doc.name.split('/').pop();
                const fields = doc.fields;
                const message = fields.message?.stringValue || 'You have a new notification';
                const read = fields.read?.booleanValue || false;
                const link = fields.link?.stringValue || '#';
                
                if (!read) unreadCount++;
                
                const notifEl = document.createElement('div');
                notifEl.style.padding = '1rem';
                notifEl.style.background = read ? 'rgba(255,255,255,0.02)' : 'rgba(108, 92, 231, 0.1)';
                notifEl.style.border = read ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--accent-purple)';
                notifEl.style.borderRadius = '8px';
                notifEl.style.cursor = 'pointer';
                notifEl.style.transition = 'all 0.2s';
                
                notifEl.innerHTML = \`<p style="margin:0; \${read ? 'color: var(--text-secondary);' : 'color: white;'}">\${message}</p>\`;
                notifEl.onclick = () => { window.location.href = link; };
                
                container.appendChild(notifEl);
            });
            
            const badge = document.getElementById('notif-badge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.style.display = 'inline-block';
                    badge.innerText = unreadCount;
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch(e) {
        console.error("Error loading notifications:", e);
    }
}

const btnMarkRead = document.getElementById('btn-mark-read');
if (btnMarkRead) {
    btnMarkRead.addEventListener('click', () => {
        showToast("All notifications marked as read.", "info");
        const badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
        
        const container = document.getElementById('notifications-container');
        Array.from(container.children).forEach(child => {
            child.style.background = 'rgba(255,255,255,0.02)';
            child.style.border = '1px solid rgba(255,255,255,0.05)';
            child.querySelector('p').style.color = 'var(--text-secondary)';
        });
    });
}

// Ensure loadNotifications is called
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadNotifications(user);
    }
});

// ==========================================
// DATA EXPORT LOGIC
// ==========================================
const btnExportData = document.getElementById('btn-export-data');
if (btnExportData) {
    btnExportData.addEventListener('click', async () => {
        if (!currentUser) return;
        
        btnExportData.disabled = true;
        btnExportData.innerText = 'Compiling Data...';
        const msg = document.getElementById('export-msg');
        msg.innerText = '';
        
        try {
            const token = await currentUser.getIdToken();
            const zip = new JSZip();
            
            // 1. Fetch Profile Data
            const profileRes = await fetch(\`https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/\${currentUser.uid}\`, {
                headers: { 'Authorization': \`Bearer \${token}\` }
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                zip.file("profile.json", JSON.stringify(profileData, null, 2));
            }
            
            // 2. Fetch Uploaded Papers
            const papersUrl = \`https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents:runQuery\`;
            const papersPayload = {
                structuredQuery: {
                    from: [{ collectionId: 'community_research' }],
                    where: {
                        compositeFilter: {
                            op: 'AND',
                            filters: [
                                { fieldFilter: { field: { fieldPath: 'uploaderId' }, op: 'EQUAL', value: { stringValue: currentUser.uid } } }
                            ]
                        }
                    }
                }
            };
            const papersRes = await fetch(papersUrl, { method: 'POST', headers: { 'Authorization': \`Bearer \${token}\` }, body: JSON.stringify(papersPayload) });
            if (papersRes.ok) {
                const papersData = await papersRes.json();
                zip.file("uploaded_papers.json", JSON.stringify(papersData, null, 2));
            }
            
            // Generate ZIP
            const blob = await zip.generateAsync({ type: "blob" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = downloadUrl;
            a.download = \`HydroHub_Data_\${currentUser.uid}.zip\`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            
            msg.style.color = 'var(--accent-cyan)';
            msg.innerText = 'Data successfully exported!';
        } catch(e) {
            console.error(e);
            msg.style.color = '#ff6666';
            msg.innerText = 'Failed to export data.';
        } finally {
            btnExportData.disabled = false;
            btnExportData.innerText = 'Download My Data';
        }
    });
}
`;
}

fs.writeFileSync('d:/Hydrogen Proj/account.js', code, 'utf8');
console.log('Account JS updated');
