import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { showConfirm, showAlert, openDocumentViewer, showTextModal } from './ui-utils.js';

window.userBookmarks = new Set();
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const token = await user.getIdToken();
            const projectId = "hydrohub-215";
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.uid}/bookmarks`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                if (data.documents) {
                    data.documents.forEach(doc => {
                        const docId = doc.name.split('/').pop();
                        window.userBookmarks.add(docId);
                    });
                }
                document.querySelectorAll('.btn-bookmark').forEach(btn => {
                    if (window.userBookmarks.has(btn.getAttribute('data-id'))) {
                        btn.style.color = 'var(--accent-cyan)';
                        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
                        btn.setAttribute('data-bookmarked', 'true');
                    }
                });
                document.querySelectorAll('.btn-upvote').forEach(btn => {
                    try {
                        const upvoters = JSON.parse(btn.getAttribute('data-upvoters') || '[]');
                        if (upvoters.includes(user.uid)) {
                            btn.setAttribute('data-upvoted', 'true');
                            btn.style.color = 'var(--accent-cyan)';
                        }
                    } catch (err) {}
                });
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        window.userBookmarks = new Set();
        document.querySelectorAll('.btn-bookmark').forEach(btn => {
            btn.style.color = 'var(--text-secondary)';
            btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
            btn.removeAttribute('data-bookmarked');
        });
    }
});

const galleryContainer = document.getElementById('community-gallery-container');

async function fetchCommunityResearch() {
    if (!galleryContainer) return;

    // Use REST API to bypass SDK websocket issues and ensure perfect reliability
    const projectId = "hydrohub-215";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/researchPapers`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch from Firestore REST API');
        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            galleryContainer.innerHTML = '';
            
            // Sort by createdAt descending (newest first)
            const sortedDocs = data.documents.sort((a, b) => {
                const timeA = new Date(a.fields.createdAt?.timestampValue || 0).getTime();
                const timeB = new Date(b.fields.createdAt?.timestampValue || 0).getTime();
                return timeB - timeA;
            });

            sortedDocs.forEach((doc, index) => {
                const delayClass = `delay-${(index % 3) + 1}`; 
                const fields = doc.fields;
                const docId = doc.name.split('/').pop();
                
                const title = fields.title?.stringValue || 'Untitled';
                const authors = fields.authors?.stringValue || 'Unknown Author';
                const desc = fields.description?.stringValue || 'No description provided.';
                const fileUrl = fields.fileUrl?.stringValue || '#';
                const resourceType = fields.resourceType?.stringValue || 'raw';
                const upvotesCount = fields.upvotesCount?.integerValue || 0;
                const upvotedByArray = fields.upvotedBy?.arrayValue?.values?.map(v => v.stringValue) || [];
                const uploadDate = fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue).toLocaleDateString() : 'Recently';
                
                const user = auth.currentUser;
                const isBookmarked = window.userBookmarks && window.userBookmarks.has(docId);
                const bookmarkColor = isBookmarked ? 'var(--accent-cyan)' : 'var(--text-secondary)';
                const bookmarkFill = isBookmarked ? 'var(--accent-cyan)' : 'none';
                const bookmarkStroke = isBookmarked ? 'var(--accent-cyan)' : 'currentColor';
                const bookmarkedAttr = isBookmarked ? 'data-bookmarked="true"' : '';
                
                const upvotersStr = JSON.stringify(upvotedByArray).replace(/"/g, '&quot;');
                let hasUpvoted = false;
                let upvoteColor = 'var(--text-secondary)';
                if (auth.currentUser && upvotedByArray.includes(auth.currentUser.uid)) {
                    hasUpvoted = true;
                    upvoteColor = 'var(--accent-cyan)';
                }
                
                let displayDesc = desc;
                if (desc.length > 150) {
                    const truncated = desc.substring(0, 150) + '...';
                    displayDesc = `
                        <span class="desc-truncated">${truncated} <a href="#" class="read-more-link" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.9em; font-weight: bold;">Read More</a></span>
                        <span class="desc-full" style="display: none; white-space: pre-wrap;">${desc} <br><a href="#" class="show-less-link" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.9em; font-weight: bold; margin-top: 5px; display: inline-block;">Show Less</a></span>
                    `;
                }
                
                const card = document.createElement('div');
                card.className = `research-card glass-card ${delayClass}`;
                
                let mediaPreview = '';
                if (resourceType === 'image') {
                    mediaPreview = `<div style="margin-bottom: 1rem;"><img src="${fileUrl}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"></div>`;
                }
                
                card.innerHTML = `
                    <div>
                        ${mediaPreview}
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <h3 style="flex: 1; margin-right: 1rem;">${title}</h3>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <button class="btn-upvote" data-id="${docId}" data-upvoters="${upvotersStr}" data-upvoted="${hasUpvoted}" data-count="${upvotesCount}" style="background: none; border: none; cursor: pointer; color: ${upvoteColor}; display: flex; align-items: center; gap: 0.2rem; transition: color 0.2s;" title="Upvote">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M 4 10 A 8 8 0 0 1 20 10 H 15 A 3 3 0 0 0 9 10 Z" />
                                      <rect x="10" y="11" width="4" height="11" rx="2" />
                                    </svg>
                                    <span class="upvote-count" style="font-weight: bold; font-size: 0.9rem;">${upvotesCount}</span>
                                </button>
                                <button class="btn-bookmark" ${bookmarkedAttr} data-id="${docId}" data-title="${title.replace(/"/g, '&quot;')}" data-url="${fileUrl}" data-authors="${authors.replace(/"/g, '&quot;')}" data-desc="${desc.replace(/"/g, '&quot;')}" data-date="${uploadDate}" data-source="Community" style="background: none; border: none; cursor: pointer; color: ${bookmarkColor}; transition: color 0.2s;" title="Bookmark this paper">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="${bookmarkFill}" stroke="${bookmarkStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div class="research-authors">By: ${authors}</div>
                        <p class="research-abstract">
                            ${displayDesc}
                        </p>
                    </div>
                    <div class="research-footer" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                        <button class="btn btn-outline btn-view-report" data-url="${fileUrl}" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-color: var(--accent-cyan); color: var(--accent-cyan); text-decoration: none; cursor: pointer; background: transparent;">View Report</button>
                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-top: 0.5rem;">
                            <span class="research-date">Uploaded: ${uploadDate}</span>
                            <span class="badge" style="background: var(--accent-cyan); color: #000; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">Community</span>
                        </div>
                    </div>
                `;
                
                galleryContainer.appendChild(card);
            });
            
            // Attach bookmark listeners
            document.querySelectorAll('.btn-bookmark').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const btnEl = e.currentTarget;
                    const paperId = btnEl.getAttribute('data-id');
                    const title = btnEl.getAttribute('data-title') || 'Unknown Paper';
                    const fileUrl = btnEl.getAttribute('data-url') || '#';
                    const authors = btnEl.getAttribute('data-authors') || 'Unknown Author';
                    const desc = btnEl.getAttribute('data-desc') || 'No description provided.';
                    const date = btnEl.getAttribute('data-date') || '';
                    const source = btnEl.getAttribute('data-source') || 'Community';
                    
                    if (!auth.currentUser) {
                        await showAlert("Please log in to bookmark papers.");
                        return;
                    }
                    
                    try {
                        const projectId = "hydrohub-215";
                        const token = await auth.currentUser.getIdToken();
                        
                        if (btnEl.getAttribute('data-bookmarked') === 'true') {
                            const confirmRemove = await showConfirm("Are you sure you want to unbookmark this paper?");
                            if (!confirmRemove) return;
                            
                            const deleteUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${auth.currentUser.uid}/bookmarks/${paperId}`;
                            const response = await fetch(deleteUrl, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            
                            if (!response.ok) throw new Error("Failed to unbookmark");
                            
                            btnEl.style.color = 'var(--text-secondary)';
                            btnEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
                            btnEl.removeAttribute('data-bookmarked');
                            if (window.userBookmarks) window.userBookmarks.delete(paperId);
                            return;
                        }
                        
                        // Bookmarking
                        btnEl.style.color = 'var(--accent-cyan)';
                        btnEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
                        
                        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${auth.currentUser.uid}/bookmarks/${paperId}?updateMask.fieldPaths=paperId&updateMask.fieldPaths=title&updateMask.fieldPaths=fileUrl&updateMask.fieldPaths=authors&updateMask.fieldPaths=description&updateMask.fieldPaths=date&updateMask.fieldPaths=source&updateMask.fieldPaths=savedAt`;
                        
                        const response = await fetch(url, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                fields: {
                                    paperId: { stringValue: paperId },
                                    title: { stringValue: title },
                                    fileUrl: { stringValue: fileUrl },
                                    authors: { stringValue: authors },
                                    description: { stringValue: desc },
                                    date: { stringValue: date },
                                    source: { stringValue: source },
                                    savedAt: { timestampValue: new Date().toISOString() }
                                }
                            })
                        });
                        
                        if (!response.ok) {
                            const errTxt = await response.text();
                            throw new Error(errTxt);
                        }
                        btnEl.setAttribute('data-bookmarked', 'true');
                        if (window.userBookmarks) window.userBookmarks.add(paperId);
                    } catch (err) {
                        console.error("Failed to process bookmark", err);
                    }
                });
            });

            // Attach upvote listeners
            document.querySelectorAll('.btn-upvote').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const user = auth.currentUser;
                    if (!user) {
                        showAlert('Please login to upvote research.');
                        return;
                    }
                    
                    const btnEl = e.currentTarget;
                    const docId = btnEl.getAttribute('data-id');
                    const isUpvoted = btnEl.getAttribute('data-upvoted') === 'true';
                    let count = parseInt(btnEl.getAttribute('data-count') || '0', 10);
                    
                    // Optimistic UI update
                    const newUpvoted = !isUpvoted;
                    const newCount = isUpvoted ? count - 1 : count + 1;
                    btnEl.setAttribute('data-upvoted', newUpvoted);
                    btnEl.setAttribute('data-count', newCount);
                    btnEl.style.color = newUpvoted ? 'var(--accent-cyan)' : 'var(--text-secondary)';
                    btnEl.querySelector('.upvote-count').innerText = newCount;
                    
                    try {
                        let upvotersList = JSON.parse(btnEl.getAttribute('data-upvoters') || '[]');
                        if (newUpvoted) {
                            if (!upvotersList.includes(user.uid)) upvotersList.push(user.uid);
                        } else {
                            upvotersList = upvotersList.filter(id => id !== user.uid);
                        }
                        btnEl.setAttribute('data-upvoters', JSON.stringify(upvotersList));

                        const token = await user.getIdToken();
                        const projectId = "hydrohub-215";
                        
                        const transformType = newUpvoted ? 'appendMissingElements' : 'removeAllFromArray';
                        const countTransform = newUpvoted ? 1 : -1;
                        
                        const transformPayload = {
                            writes: [
                                {
                                    transform: {
                                        document: `projects/${projectId}/databases/(default)/documents/researchPapers/${docId}`,
                                        fieldTransforms: [
                                            {
                                                fieldPath: "upvotedBy",
                                                [transformType]: {
                                                    values: [{ stringValue: user.uid }]
                                                }
                                            },
                                            {
                                                fieldPath: "upvotesCount",
                                                increment: { integerValue: countTransform }
                                            }
                                        ]
                                    }
                                }
                            ]
                        };

                        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(transformPayload)
                        });

                        if (!response.ok) {
                            throw new Error('Failed to update upvote');
                        }
                    } catch (error) {
                        console.error('Error updating upvote:', error);
                        // Revert optimistic UI
                        btnEl.setAttribute('data-upvoted', isUpvoted);
                        btnEl.setAttribute('data-count', count);
                        btnEl.style.color = isUpvoted ? 'var(--accent-cyan)' : 'var(--text-secondary)';
                        btnEl.querySelector('.upvote-count').innerText = count;
                        showAlert('An error occurred. Please try again.');
                    }
                });
            });

            // Attach viewer listeners
            document.querySelectorAll('.btn-view-report').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const url = e.currentTarget.getAttribute('data-url');
                    if (url && url !== '#') {
                        openDocumentViewer(url);
                    } else {
                        showAlert('No document available for this report.');
                    }
                });
            });

            // Attach Read More listeners
            document.querySelectorAll('.read-more-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const container = e.currentTarget.closest('.research-abstract');
                    if(container) {
                        container.querySelector('.desc-truncated').style.display = 'none';
                        container.querySelector('.desc-full').style.display = 'inline';
                    }
                });
            });

            // Attach Show Less listeners
            document.querySelectorAll('.show-less-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const container = e.currentTarget.closest('.research-abstract');
                    if(container) {
                        container.querySelector('.desc-truncated').style.display = 'inline';
                        container.querySelector('.desc-full').style.display = 'none';
                    }
                });
            });

        } else {
            galleryContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">No community research available yet.</p>';
        }
    } catch (error) {
        console.error('Error fetching community research:', error);
        galleryContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Failed to load community research. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', fetchCommunityResearch);
