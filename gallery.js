// gallery.js
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
                
                const title = fields.title?.stringValue || 'Untitled';
                const authors = fields.authors?.stringValue || 'Unknown Author';
                const desc = fields.description?.stringValue || 'No description provided.';
                const fileName = fields.fileName?.stringValue || 'Attached File';
                const fileUrl = fields.fileUrl?.stringValue || '#';
                const uploadDate = fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue).toLocaleDateString() : 'Recently';
                
                // Fetch user display name? For now we just show authors, but we could add an uploader tag
                
                const card = document.createElement('div');
                card.className = `research-card glass-card ${delayClass}`;
                
                card.innerHTML = `
                    <div>
                        <h3>${title}</h3>
                        <div class="research-authors">By: ${authors}</div>
                        <p class="research-abstract">${desc.length > 150 ? desc.substring(0, 150) + '...' : desc}</p>
                    </div>
                    <div class="research-footer" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                        <a href="${fileUrl}" target="_blank" class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-color: var(--accent-cyan); color: var(--accent-cyan); text-decoration: none;">📄 View Report</a>
                        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-top: 0.5rem;">
                            <span class="research-date">Uploaded: ${uploadDate}</span>
                            <span class="badge" style="background: var(--accent-cyan); color: #000; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">Community</span>
                        </div>
                    </div>
                `;
                
                galleryContainer.appendChild(card);
            });
        } else {
            galleryContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">No community research papers have been uploaded yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('Error fetching community research:', error);
        galleryContainer.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Failed to load community research. Please try again later.</p>';
    }
}

// Fetch on load
document.addEventListener('DOMContentLoaded', fetchCommunityResearch);
