import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { showAlert } from './ui-utils.js';

const projectId = "hydrohub-215";
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        document.getElementById('login-prompt').style.display = 'none';
        document.getElementById('ask-doubt-box').style.display = 'block';
    } else {
        document.getElementById('login-prompt').style.display = 'block';
        document.getElementById('ask-doubt-box').style.display = 'none';
    }
});

document.getElementById('btn-post-doubt').addEventListener('click', async () => {
    if (!currentUser) return;
    const msgInput = document.getElementById('new-doubt-message');
    const msg = msgInput.value.trim();
    if (!msg) return;

    const btn = document.getElementById('btn-post-doubt');
    btn.disabled = true;
    btn.innerText = 'Posting...';

    try {
        const token = await currentUser.getIdToken();
        const payload = {
            fields: {
                message: { stringValue: msg },
                authorId: { stringValue: currentUser.uid },
                authorName: { stringValue: currentUser.displayName || 'Anonymous' },
                createdAt: { timestampValue: new Date().toISOString() }
            }
        };

        const res = await fetch(`${firestoreBase}/doubts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to post doubt");

        msgInput.value = '';
        showAlert("Your question has been posted!");
        loadDoubts();
    } catch (err) {
        console.error(err);
        showAlert("Error posting your question. Please try again.");
    } finally {
        btn.disabled = false;
        btn.innerText = 'Post Question';
    }
});

async function loadDoubts() {
    const feed = document.getElementById('forum-feed');
    try {
        const res = await fetch(`${firestoreBase}/doubts`);
        if (!res.ok) throw new Error("Failed to fetch doubts");
        const data = await res.json();
        
        feed.innerHTML = '';
        
        if (!data.documents || data.documents.length === 0) {
            feed.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">No questions yet. Be the first to ask!</p>';
            return;
        }

        const doubts = data.documents.sort((a, b) => {
            const dateA = new Date(a.fields.createdAt?.timestampValue || 0);
            const dateB = new Date(b.fields.createdAt?.timestampValue || 0);
            return dateB - dateA;
        });

        for (const doc of doubts) {
            const id = doc.name.split('/').pop();
            const author = doc.fields.authorName?.stringValue || 'Anonymous';
            const message = doc.fields.message?.stringValue || '';
            const createdAt = new Date(doc.fields.createdAt?.timestampValue || Date.now()).toLocaleString();
            
            const card = document.createElement('div');
            card.className = 'doubt-card glass-card';
            
            card.innerHTML = `
                <div class="doubt-header">
                    <span class="doubt-author">${author}</span>
                    <span class="doubt-date">${createdAt}</span>
                </div>
                <div class="doubt-message">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                
                <div class="replies-section" id="replies-${id}" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div id="replies-list-${id}" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 1rem;"></div>
                    <div class="reply-form" style="display: flex; align-items: center; background: rgba(255,255,255,0.05); border-radius: 20px; padding: 0.3rem 0.5rem; border: 1px solid rgba(255,255,255,0.1);">
                        <input type="text" class="reply-input" id="reply-input-${id}" placeholder="Type an answer..." style="flex: 1; border: none; background: transparent; color: var(--text-primary); outline: none; padding: 0.5rem; font-size: 0.95rem;">
                        <button class="btn-submit-reply" data-id="${id}" style="background: var(--accent-cyan); border: none; border-radius: 50%; cursor: pointer; color: #0a0a0a; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; margin-left: 0.5rem; transition: transform 0.2s ease;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:-2px">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            feed.appendChild(card);
            
            loadReplies(id);
        }

        // Add enter key support to input fields
        document.querySelectorAll('.reply-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const id = e.currentTarget.id.replace('reply-input-', '');
                    document.querySelector(`.btn-submit-reply[data-id="${id}"]`).click();
                }
            });
        });

        document.querySelectorAll('.btn-submit-reply').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!currentUser) {
                    showAlert("You must be logged in to reply.");
                    return;
                }
                const id = e.currentTarget.getAttribute('data-id');
                const input = document.getElementById(`reply-input-${id}`);
                const replyMsg = input.value.trim();
                if (!replyMsg) return;
                
                const postBtn = e.currentTarget;
                postBtn.disabled = true;
                postBtn.style.opacity = '0.5';

                try {
                    const token = await currentUser.getIdToken();
                    const payload = {
                        fields: {
                            message: { stringValue: replyMsg },
                            authorId: { stringValue: currentUser.uid },
                            authorName: { stringValue: currentUser.displayName || 'Anonymous' },
                            createdAt: { timestampValue: new Date().toISOString() }
                        }
                    };

                    const res = await fetch(`${firestoreBase}/doubts/${id}/replies`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!res.ok) throw new Error("Failed to post reply");

                    input.value = '';
                    showAlert("Reply posted!");
                    loadReplies(id);
                } catch (err) {
                    console.error(err);
                    showAlert("Error posting reply.");
                } finally {
                    postBtn.disabled = false;
                    postBtn.style.opacity = '1';
                }
            });
        });

    } catch (err) {
        console.error(err);
        feed.innerHTML = '<p style="text-align:center; color:#ff6666;">Error loading forum.</p>';
    }
}

async function loadReplies(doubtId) {
    const list = document.getElementById(`replies-list-${doubtId}`);
    if (!list) return;

    try {
        const res = await fetch(`${firestoreBase}/doubts/${doubtId}/replies`);
        if (!res.ok) {
            if (res.status === 404) {
                list.innerHTML = ''; 
                return;
            }
            throw new Error("Failed to fetch replies");
        }
        const data = await res.json();
        
        list.innerHTML = '';
        if (!data.documents) return;

        const replies = data.documents.sort((a, b) => {
            const dateA = new Date(a.fields.createdAt?.timestampValue || 0);
            const dateB = new Date(b.fields.createdAt?.timestampValue || 0);
            return dateA - dateB; // ascending
        });

        for (const doc of replies) {
            const author = doc.fields.authorName?.stringValue || 'Anonymous';
            const message = doc.fields.message?.stringValue || '';
            const createdAt = new Date(doc.fields.createdAt?.timestampValue || Date.now()).toLocaleString();
            
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.75rem; border-left: 3px solid var(--accent-cyan);';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                    <span style="color: var(--accent-cyan); font-size: 0.85rem; font-weight: bold;">${author}</span>
                    <span style="color: var(--text-secondary); font-size: 0.75rem;">${createdAt}</span>
                </div>
                <div style="font-size: 0.95rem; line-height: 1.4; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            `;
            list.appendChild(card);
        }
    } catch (err) {
        console.error(err);
    }
}

loadDoubts();
