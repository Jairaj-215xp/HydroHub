import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const btnSaveProfile = document.getElementById('btn-save-profile');
const profileError = document.getElementById('profile-error');
const profileSuccess = document.getElementById('profile-success');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        // Not logged in? Go home.
        window.location.href = 'index.html';
    }
});

btnSaveProfile.addEventListener('click', async () => {
    const name = document.getElementById('profile-name').value.trim();
    const username = document.getElementById('profile-username').value.trim();
    const displayName = document.getElementById('profile-display').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const university = document.getElementById('profile-university').value.trim();
    const fieldStudy = document.getElementById('profile-field-study').value.trim();

    if (!name || !username || !displayName) {
        profileError.innerText = "Please fill out all required fields.";
        profileError.style.display = 'block';
        return;
    }

    try {
        btnSaveProfile.disabled = true;
        profileError.style.display = 'none';
        btnSaveProfile.innerText = "Saving Profile...";

        // Save to Firestore using REST API to prevent websocket hangs
        const token = await currentUser.getIdToken();
        const docUrl = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/${currentUser.uid}`;
        
        // Check if doc exists
        const checkRes = await fetch(docUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        
        let url = docUrl;
        let method = 'PATCH';
        if (!checkRes.ok) {
            // Document does not exist, use POST
            url = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users?documentId=${currentUser.uid}`;
            method = 'POST';
        }

        const saveRes = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fields: {
                    name: { stringValue: name },
                    username: { stringValue: username },
                    displayName: { stringValue: displayName },
                    bio: { stringValue: bio },
                    university: { stringValue: university },
                    fieldStudy: { stringValue: fieldStudy },
                    displayName: { stringValue: displayName },
                    email: { stringValue: currentUser.email },
                    createdAt: { timestampValue: new Date().toISOString() }
                }
            })
        });

        if (!saveRes.ok) {
            throw new Error("Failed to save profile data.");
        }

        // Send EmailJS Welcome Email
        try {
            await emailjs.send("service_v451am9", "template_2tqkyjz", {
                to_email: currentUser.email,
                to_name: name,
                display_name: displayName,
                username: username
            });
            console.log("Welcome email sent via EmailJS");
        } catch (emailErr) {
            console.error("Failed to send welcome email:", emailErr);
            // We don't want to block the user if the email fails, just log it.
        }

        profileSuccess.innerText = "Profile saved! Redirecting...";
        profileSuccess.style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error("Profile Setup Error:", error);
        profileError.innerText = error.message;
        profileError.style.display = 'block';
        btnSaveProfile.disabled = false;
        btnSaveProfile.innerText = "Complete Setup";
    }
});
