import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { openDocumentViewer, showAlert } from './ui-utils.js';

const bookmarksContainer = document.getElementById('bookmarks-gallery-container');

async function fetchBookmarks(user) {
    if (!bookmarksContainer) return;
    bookmarksContainer.innerHTML = '<div class="spinner" style="margin:2rem auto; border-left-color: var(--accent-cyan);"></div>';

    const projectId = "hydrohub-215";
    const token = await user.getIdToken();
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.uid}/bookmarks`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch bookmarks');
        
        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            bookmarksContainer.innerHTML = '';
            
            // Sort by savedAt descending (newest first)
            const sortedDocs = data.documents.sort((a, b) => {
                const timeA = new Date(a.fields.savedAt?.timestampValue || 0).getTime();
                const timeB = new Date(b.fields.savedAt?.timestampValue || 0).getTime();
                return timeB - timeA;
            });

            sortedDocs.forEach((doc, index) => {
                const delayClass = `delay-${(index % 3) + 1}`; 
                const fields = doc.fields;
                const docId = doc.name.split('/').pop();
                
                const title = fields.title?.stringValue || 'Unknown Paper';
                const fileUrl = fields.fileUrl?.stringValue || '#';
                const authors = fields.authors?.stringValue || 'Unknown Author';
                const desc = fields.description?.stringValue || 'No description provided.';
                const date = fields.date?.stringValue || '';
                const source = fields.source?.stringValue || 'Saved';
                const savedDate = fields.savedAt?.timestampValue ? new Date(fields.savedAt.timestampValue).toLocaleDateString() : 'Recently';
                
                let displayDesc = desc;
                if (desc.length > 150) {
                    const truncated = desc.substring(0, 150) + '...';
                    displayDesc = `
                        <span class="desc-truncated">${truncated} <a href="#" class="read-more-link" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.9em; font-weight: bold;">Read More</a></span>
                        <span class="desc-full" style="display: none; white-space: pre-wrap;">${desc} <br><a href="#" class="show-less-link" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.9em; font-weight: bold; margin-top: 5px; display: inline-block;">Show Less</a></span>
                    `;
                }

                // Try to infer resourceType if available in the bookmark, else guess from fileUrl extension
                let resourceType = fields.resourceType?.stringValue || 'document';
                if (!fields.resourceType) {
                    const urlLower = fileUrl.toLowerCase();
                    if (urlLower.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/)) {
                        resourceType = 'image';
                    } else if (urlLower.match(/\.(mp4|webm|ogg)($|\?)/)) {
                        resourceType = 'video';
                    }
                }
                
                let mediaPreview = '';
                if (resourceType === 'image' && fileUrl !== '#') {
                    mediaPreview = `<div style="margin-bottom: 1rem;"><img src="${fileUrl}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"></div>`;
                }

                const card = document.createElement('div');
                card.className = `research-card glass-card ${delayClass}`;
                
                card.innerHTML = `
                    <div style="flex-grow: 1;">
                        ${mediaPreview}
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <h3>${title}</h3>
                            <button class="btn-remove-bookmark" data-id="${docId}" style="background: none; border: none; cursor: pointer; color: var(--accent-cyan); transition: color 0.2s;" title="Remove Bookmark">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-cyan)" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            </button>
                        </div>
                        <div class="research-authors" style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">By: ${authors}</div>
                        <p class="research-abstract" style="margin-top: 1rem;">${displayDesc}</p>
                    </div>
                    <div class="research-footer" style="flex-direction: column; align-items: flex-start; gap: 0.5rem; margin-top: auto;">
                        <button class="btn btn-outline btn-view-report" data-url="${fileUrl}" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-color: var(--accent-cyan); color: var(--accent-cyan); text-decoration: none; cursor: pointer; background: transparent;">View Report</button>
                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-top: 0.5rem;">
                            <span class="research-date">Saved: ${savedDate}</span>
                            <span class="badge" style="background: var(--accent-cyan); color: #000; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">${source}</span>
                        </div>
                    </div>
                `;
                
                bookmarksContainer.appendChild(card);
            });
            
            // Attach view report listeners
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
                        container.querySelector('.desc-full').style.display = 'none';
                        container.querySelector('.desc-truncated').style.display = 'inline';
                    }
                });
            });

            // Attach remove listeners
            document.querySelectorAll('.btn-remove-bookmark').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const btnEl = e.currentTarget;
                    const paperId = btnEl.getAttribute('data-id');
                    
                    try {
                        const token = await auth.currentUser.getIdToken();
                        const deleteUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${auth.currentUser.uid}/bookmarks/${paperId}`;
                        
                        await fetch(deleteUrl, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        // Remove card from UI
                        btnEl.closest('.research-card').remove();
                        
                        // If empty, show message
                        if (bookmarksContainer.children.length === 0) {
                            bookmarksContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">You have no bookmarked papers.</p>';
                        }
                    } catch (err) {
                        console.error("Failed to remove bookmark", err);
                    }
                });
            });

        } else {
            bookmarksContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">You have no bookmarked papers.</p>';
        }
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        bookmarksContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Failed to load bookmarks. Please try again later.</p>';
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchBookmarks(user);
    } else {
        if (bookmarksContainer) {
            bookmarksContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Please log in to view your bookmarks.</p>';
        }
    }
});
