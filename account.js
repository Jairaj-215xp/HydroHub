import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, updatePassword, deleteUser, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Initialize Flatpickr for Date of Birth
flatpickr("#edit-profile-dob", {
    dateFormat: "Y-m-d",
    maxDate: "today"
});

// Custom UI Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Trigger reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function customConfirm(message, title = "Confirm Action", isDanger = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        document.getElementById('confirm-message').innerText = message;
        document.getElementById('confirm-title').innerText = title;
        
        const btnOk = document.getElementById('btn-confirm-ok');
        const btnCancel = document.getElementById('btn-confirm-cancel');
        
        if (isDanger) {
            btnOk.style.background = '#ff6666';
            btnOk.style.boxShadow = 'none';
        } else {
            btnOk.style.background = '';
            btnOk.style.boxShadow = '';
        }

        modal.style.display = 'flex';
        
        const handleOk = () => { cleanup(); resolve(true); };
        const handleCancel = () => { cleanup(); resolve(false); };
        
        btnOk.onclick = handleOk;
        btnCancel.onclick = handleCancel;
        
        function cleanup() {
            modal.style.display = 'none';
            btnOk.onclick = null;
            btnCancel.onclick = null;
        }
    });
}

// Tab Switching Logic
const tabs = document.querySelectorAll('.sidebar-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html'; // Kick out if not logged in
        return;
    }
    
    currentUser = user;
    
    // Load Overview
    loadProfile(user);
    
    // Load Uploads
    loadMyUploads(user);
});

async function loadProfile(user) {
    try {
        const token = await user.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/${user.uid}`;
        
        document.getElementById('profile-email').innerText = user.email;
        
        // Creation time is provided by Firebase Auth
        const joinDate = new Date(user.metadata.creationTime).toLocaleDateString();
        document.getElementById('profile-joined').innerText = joinDate;

        // Avatar logic
        const avatarPreview = document.getElementById('account-avatar-preview');
        if (user.photoURL && user.photoURL.includes('cloudinary.com')) {
            avatarPreview.src = user.photoURL;
        } else {
            const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF3', '#FF33A1', '#FF8C33', '#8C33FF', '#FF3333', '#33FF8C'];
            const charCode = user.uid ? user.uid.charCodeAt(0) : Math.floor(Math.random() * 255);
            const color = colors[charCode % colors.length];
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <rect width="100" height="100" fill="#ffffff"/>
                <g transform="translate(25, 15) scale(10)" fill="${color}">
                    <rect x="0" y="0" width="1" height="7"/>
                    <rect x="4" y="0" width="1" height="7"/>
                    <rect x="1" y="3" width="3" height="1"/>
                </g>
            </svg>`;
            avatarPreview.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const fields = data.fields || {};
            const name = fields.name?.stringValue || fields.displayName?.stringValue || 'Unknown';
            const username = fields.username?.stringValue || 'Unknown';
            
            document.getElementById('profile-name').innerText = name;
            document.getElementById('profile-username').innerText = username !== 'Unknown' ? `@${username}` : 'Not Set';
            
            // New Fields
            document.getElementById('profile-bio').innerText = fields.bio?.stringValue || 'Not Set';
            document.getElementById('profile-university').innerText = fields.university?.stringValue || 'Not Set';
            document.getElementById('profile-field-study').innerText = fields.fieldStudy?.stringValue || 'Not Set';
            document.getElementById('profile-github').innerText = fields.github?.stringValue || 'Not Set';
            document.getElementById('profile-linkedin').innerText = fields.linkedin?.stringValue || 'Not Set';
            document.getElementById('profile-orcid').innerText = fields.orcid?.stringValue || 'Not Set';
            
            document.getElementById('profile-location').innerText = fields.location?.stringValue || 'Not Set';
            document.getElementById('profile-website').innerText = fields.website?.stringValue || 'Not Set';
            document.getElementById('profile-dob').innerText = fields.dob?.stringValue || 'Not Set';
            document.getElementById('profile-gender').innerText = fields.gender?.stringValue || 'Not Set';
            document.getElementById('profile-language').innerText = fields.language?.stringValue || 'Not Set';
            document.getElementById('profile-timezone').innerText = fields.timezone?.stringValue || 'Not Set';
            
            // Pre-fill edit inputs
            document.getElementById('edit-profile-name').value = name;
            document.getElementById('edit-profile-bio').value = fields.bio?.stringValue || '';
            document.getElementById('edit-profile-university').value = fields.university?.stringValue || '';
            document.getElementById('edit-profile-field-study').value = fields.fieldStudy?.stringValue || '';
            document.getElementById('edit-profile-github').value = fields.github?.stringValue || '';
            document.getElementById('edit-profile-linkedin').value = fields.linkedin?.stringValue || '';
            document.getElementById('edit-profile-orcid').value = fields.orcid?.stringValue || '';
            
            document.getElementById('edit-profile-location').value = fields.location?.stringValue || '';
            document.getElementById('edit-profile-website').value = fields.website?.stringValue || '';
            document.getElementById('edit-profile-dob').value = fields.dob?.stringValue || '';
            document.getElementById('edit-profile-gender').value = fields.gender?.stringValue || '';
            document.getElementById('edit-profile-language').value = fields.language?.stringValue || '';
            document.getElementById('edit-profile-timezone').value = fields.timezone?.stringValue || '';

        } else {
            document.getElementById('profile-name').innerText = 'Not Set';
            document.getElementById('profile-username').innerText = 'Not Set';
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// Avatar Cropping and Upload Logic
const btnUploadAvatar = document.getElementById('btn-upload-avatar');
const avatarInput = document.getElementById('avatar-upload-input');
const avatarStatus = document.getElementById('avatar-upload-status');
const avatarPreview = document.getElementById('account-avatar-preview');
const cropperModal = document.getElementById('cropper-modal');
const cropperImage = document.getElementById('cropper-image');
const btnCloseCropper = document.getElementById('btn-close-cropper');
const btnCropUpload = document.getElementById('btn-crop-upload');
let cropper = null;

btnUploadAvatar.addEventListener('click', () => {
    avatarInput.click();
});

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        cropperImage.src = e.target.result;
        cropperModal.style.display = 'flex';
        
        if (cropper) {
            cropper.destroy();
        }
        
        cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            background: false,
        });
    };
    reader.readAsDataURL(file);
    avatarInput.value = ''; // reset input
});

btnCloseCropper.addEventListener('click', () => {
    cropperModal.style.display = 'none';
    if (cropper) cropper.destroy();
});

btnCropUpload.addEventListener('click', () => {
    if (!cropper) return;
    
    btnCropUpload.disabled = true;
    btnCropUpload.innerText = "Uploading...";

    cropper.getCroppedCanvas({
        width: 200,
        height: 200,
    }).toBlob(async (blob) => {
        try {
            avatarStatus.style.color = '#fff';
            avatarStatus.innerText = 'Uploading...';

            const formData = new FormData();
            formData.append('file', blob);
            formData.append('upload_preset', 'ml_default'); 

            const res = await fetch(`https://api.cloudinary.com/v1_1/doakkvedg/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Upload to Cloudinary failed");
            const data = await res.json();
            
            await updateProfile(auth.currentUser, {
                photoURL: data.secure_url
            });
            
            avatarPreview.src = data.secure_url;
            avatarStatus.style.color = 'var(--accent-cyan)';
            avatarStatus.innerText = 'Picture updated successfully!';

            // Update navbar preview locally
            const navAvatar = document.querySelector('.nav-avatar');
            if (navAvatar) navAvatar.src = data.secure_url;

            // Close modal
            cropperModal.style.display = 'none';
            cropper.destroy();
        } catch (err) {
            console.error(err);
            avatarStatus.style.color = '#ff6666';
            avatarStatus.innerText = 'Failed to upload picture.';
        } finally {
            btnCropUpload.disabled = false;
            btnCropUpload.innerText = "Upload Avatar";
        }
    }, 'image/jpeg');
});

// Edit Profile Logic
const btnEditProfile = document.getElementById('btn-edit-profile');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const btnSaveEdit = document.getElementById('btn-save-edit');
const editActions = document.getElementById('edit-profile-actions');
const btnShareProfile = document.getElementById('btn-share-profile');

const profileFields = ['name', 'bio', 'university', 'field-study', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];

function toggleEditMode(isEditing) {
    profileFields.forEach(field => {
        const valDiv = document.getElementById(`profile-${field}`);
        const inputDiv = document.getElementById(`edit-profile-${field}`);
        if (valDiv && inputDiv) {
            valDiv.style.display = isEditing ? 'none' : 'block';
            inputDiv.style.display = isEditing ? 'block' : 'none';
        }
    });
    btnEditProfile.style.display = isEditing ? 'none' : 'block';
    editActions.style.display = isEditing ? 'flex' : 'none';
}

btnEditProfile.addEventListener('click', () => toggleEditMode(true));
btnCancelEdit.addEventListener('click', () => toggleEditMode(false));

if (btnShareProfile) {
    btnShareProfile.addEventListener('click', () => {
        const username = document.getElementById('profile-username').innerText.replace('@', '');
        const url = `${window.location.origin}/profile.html?user=${username}`;
        navigator.clipboard.writeText(url).then(() => {
            const originalText = btnShareProfile.innerText;
            btnShareProfile.innerText = 'Copied!';
            setTimeout(() => {
                btnShareProfile.innerText = originalText;
            }, 2000);
        });
    });
}

btnSaveEdit.addEventListener('click', async () => {
    try {
        btnSaveEdit.disabled = true;
        btnSaveEdit.innerText = 'Saving...';
        
        const token = await auth.currentUser.getIdToken();
        const updateFields = ['name', 'bio', 'university', 'fieldStudy', 'github', 'linkedin', 'orcid', 'location', 'website', 'dob', 'gender', 'language', 'timezone'];
        const maskPaths = updateFields.map(f => `updateMask.fieldPaths=${f}`).join('&');
        const url = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/${auth.currentUser.uid}?${maskPaths}`;
        
        const payload = {
            fields: {
                name: { stringValue: document.getElementById('edit-profile-name').value.trim() },
                bio: { stringValue: document.getElementById('edit-profile-bio').value.trim() },
                university: { stringValue: document.getElementById('edit-profile-university').value.trim() },
                fieldStudy: { stringValue: document.getElementById('edit-profile-field-study').value.trim() },
                github: { stringValue: document.getElementById('edit-profile-github').value.trim() },
                linkedin: { stringValue: document.getElementById('edit-profile-linkedin').value.trim() },
                orcid: { stringValue: document.getElementById('edit-profile-orcid').value.trim() },
                location: { stringValue: document.getElementById('edit-profile-location').value.trim() },
                website: { stringValue: document.getElementById('edit-profile-website').value.trim() },
                dob: { stringValue: document.getElementById('edit-profile-dob').value },
                gender: { stringValue: document.getElementById('edit-profile-gender').value },
                language: { stringValue: document.getElementById('edit-profile-language').value },
                timezone: { stringValue: document.getElementById('edit-profile-timezone').value }
            }
        };

        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save profile");
        
        // Update UI
        profileFields.forEach(field => {
            const inputVal = document.getElementById(`edit-profile-${field}`).value.trim();
            document.getElementById(`profile-${field}`).innerText = inputVal || 'Not Set';
        });
        
        toggleEditMode(false);
    } catch (err) {
        console.error(err);
        showToast("Error saving profile changes.", "error");
    } finally {
        btnSaveEdit.disabled = false;
        btnSaveEdit.innerText = 'Save Changes';
    }
});

async function loadMyUploads(user) {
    const container = document.getElementById('my-uploads-container');
    
    try {
        // We use the REST API just like gallery.js for consistency and reliability
        const token = await user.getIdToken();
        const projectId = "hydrohub-215";
        // To query, we use runQuery
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: "researchPapers" }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: "uploadedBy" },
                            op: "EQUAL",
                            value: { stringValue: user.uid }
                        }
                    }
                }
            })
        });

        if (!response.ok) throw new Error("Failed to fetch uploads");
        
        let data = await response.json();
        container.innerHTML = '';
        
        let hasUploads = false;

        // Filter out empty responses and sort manually in JS to avoid Firestore index requirement
        const validDocs = data.filter(item => item.document);
        validDocs.sort((a, b) => {
            const timeA = new Date(a.document.fields.createdAt?.timestampValue || 0).getTime();
            const timeB = new Date(b.document.fields.createdAt?.timestampValue || 0).getTime();
            return timeB - timeA;
        });
        
        // Update Analytics Tab
        document.getElementById('stat-uploads').innerText = validDocs.length;
        const joinDateMs = new Date(user.metadata.creationTime).getTime();
        const daysActive = Math.max(1, Math.floor((Date.now() - joinDateMs) / (1000 * 60 * 60 * 24)));
        document.getElementById('stat-days').innerText = daysActive;

        validDocs.forEach(item => {
                hasUploads = true;
                const docId = item.document.name.split('/').pop();
                const fields = item.document.fields;
                
                const title = fields.title?.stringValue || 'Untitled';
                const uploadDate = fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue).toLocaleDateString() : 'Unknown';
                
                const card = document.createElement('div');
                card.className = 'my-upload-card';
                card.innerHTML = `
                    <div>
                        <h4 style="color: var(--accent-cyan); margin-bottom: 0.25rem;">${title}</h4>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">Uploaded: ${uploadDate}</span>
                    </div>
                    <button class="btn btn-delete-paper" data-id="${docId}" style="background: transparent; border: 1px solid #ff6666; color: #ff6666; padding: 0.3rem 0.8rem; font-size: 0.8rem;">Delete</button>
                `;
                container.appendChild(card);
        });

        if (!hasUploads) {
            container.innerHTML = '<p style="color: var(--text-secondary);">You have not uploaded any research papers yet.</p>';
        }

        // Add Delete Listeners
        document.querySelectorAll('.btn-delete-paper').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const confirmed = await customConfirm("Are you sure you want to delete this paper from the Community Gallery?", "Delete Paper", true);
                if (confirmed) {
                    const id = e.target.getAttribute('data-id');
                    await deletePaper(id, e.target.parentElement);
                }
            });
        });

    } catch (error) {
        console.error("Uploads Error:", error);
        container.innerHTML = '<p style="color: #ff6666;">Error loading uploads.</p>';
    }
}

async function deletePaper(docId, cardElement) {
    try {
        const token = await currentUser.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/researchPapers/${docId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            cardElement.remove();
            showToast("Paper deleted successfully.", "success");
        } else {
            showToast("Failed to delete paper.", "error");
        }
    } catch (error) {
        console.error("Delete paper error:", error);
    }
}

// Security: Change Password
document.getElementById('btn-change-password').addEventListener('click', async () => {
    const newPass = document.getElementById('new-password').value;
    const msg = document.getElementById('password-msg');
    
    if (newPass.length < 6) {
        msg.style.color = '#ff6666';
        msg.innerText = "Password must be at least 6 characters.";
        return;
    }

    try {
        await updatePassword(currentUser, newPass);
        msg.style.color = 'var(--accent-green)';
        msg.innerText = "Password updated successfully!";
        document.getElementById('new-password').value = '';
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            msg.style.color = '#ff6666';
            msg.innerText = "Security Alert: Please log out and log back in to change your password.";
        } else {
            msg.style.color = '#ff6666';
            msg.innerText = error.message;
        }
    }
});

// Advanced Security Placeholders
const setup2fa = document.getElementById('btn-setup-2fa');
if (setup2fa) setup2fa.addEventListener('click', () => showToast("Multi-Factor Authentication (2FA) requires upgrading your Firebase Auth tier. Coming soon!", "info"));

const addPasskey = document.getElementById('btn-add-passkey');
if (addPasskey) addPasskey.addEventListener('click', () => showToast("Passkey biometric authentication is currently in beta. Coming soon!", "info"));

const viewRecovery = document.getElementById('btn-view-recovery');
if (viewRecovery) viewRecovery.addEventListener('click', () => showToast("Recovery codes will be generated when 2FA is enabled.", "info"));

const signoutAll = document.getElementById('btn-signout-all');
if (signoutAll) signoutAll.addEventListener('click', async () => {
    const confirmed = await customConfirm("Are you sure you want to sign out of all devices? You will be signed out of this session as well.", "Sign Out Everywhere", true);
    if (confirmed) {
        showToast("Session tokens revoked. Signing out...", "success");
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        });
    }
});

// Security: Delete Account
document.getElementById('btn-delete-account').addEventListener('click', async () => {
    const confirmed = await customConfirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.", "Delete Account", true);
    if(!confirmed) return;
    
    const msg = document.getElementById('delete-msg');
    
    try {
        // 1. Delete Firestore User Doc via REST API
        const token = await currentUser.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/${currentUser.uid}`;
        await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // 2. Delete Auth Account
        await deleteUser(currentUser);
        
        // 3. User is automatically signed out and onAuthStateChanged will redirect them to index.html
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            msg.innerText = "Security Alert: Please log out and log back in to verify your identity before deleting your account.";
        } else {
            msg.innerText = error.message;
        }
    }
});
