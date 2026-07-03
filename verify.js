import { auth } from './firebase-config.js';
import { applyActionCode } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', async () => {
    const loadingDiv = document.getElementById('verify-loading');
    const successDiv = document.getElementById('verify-success');
    const errorDiv = document.getElementById('verify-error');
    const errorMsg = document.getElementById('verify-error-msg');

    // Get the action code from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const actionCode = urlParams.get('oobCode');

    if (mode === 'verifyEmail' && actionCode) {
        try {
            // Verify the email natively
            await applyActionCode(auth, actionCode);
            
            loadingDiv.style.display = 'none';
            successDiv.style.display = 'block';
        } catch (error) {
            console.error("Verification error:", error);
            loadingDiv.style.display = 'none';
            errorMsg.innerText = error.message;
            errorDiv.style.display = 'block';
        }
    } else {
        // Invalid URL
        loadingDiv.style.display = 'none';
        errorMsg.innerText = "Invalid verification link. Please check your email and try again.";
        errorDiv.style.display = 'block';
    }
});
