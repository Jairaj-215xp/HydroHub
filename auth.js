import { auth, db } from './firebase-config.js';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// --- INJECT AUTH MODAL INTO DOM ---
const modalHTML = `
<div id="auth-modal" class="modal-overlay" style="display: none;">
  <div class="modal-content glass-card">
    <button class="modal-close" id="btn-close-modal">&times;</button>
    <div class="modal-header">
      <h2 id="auth-title">Welcome Back</h2>
      <p id="auth-subtitle">Log in to upload and manage your research.</p>
    </div>
    
    <div class="auth-form-group">
      <label>Email</label>
      <input type="email" id="auth-email" placeholder="you@example.com" class="glass-input">
    </div>
    
    <div class="auth-form-group">
      <label>Password</label>
      <input type="password" id="auth-password" placeholder="••••••••" class="glass-input">
    </div>

    <p id="auth-error" class="error-text" style="color: #ff6666; font-size: 0.9rem; display: none;"></p>
    <p id="auth-success" class="success-text" style="color: var(--accent-cyan); font-size: 0.9rem; display: none;"></p>

    <button id="btn-submit-auth" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Log In</button>
    
    <div style="text-align: center; margin: 1rem 0; color: var(--text-secondary); font-size: 0.9rem;">OR</div>
    <button id="btn-google-auth" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;">
      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Continue with Google
    </button>
    
    <p class="auth-switch-text">
      <span id="auth-switch-prompt">Don't have an account?</span> 
      <a href="#" id="auth-switch-btn" style="color: var(--accent-cyan);">Sign Up</a>
    </p>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

// --- MODAL LOGIC ---
const authModal = document.getElementById('auth-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const btnSubmitAuth = document.getElementById('btn-submit-auth');
const btnGoogleAuth = document.getElementById('btn-google-auth');
const authSwitchBtn = document.getElementById('auth-switch-btn');
const authSwitchPrompt = document.getElementById('auth-switch-prompt');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');

const googleProvider = new GoogleAuthProvider();

let isLoginMode = true;

export function openAuthModal() {
  authError.style.display = 'none';
  authSuccess.style.display = 'none';
  authModal.style.display = 'flex';
}

function closeAuthModal() {
  authModal.style.display = 'none';
  emailInput.value = '';
  passwordInput.value = '';
}

btnCloseModal.addEventListener('click', closeAuthModal);

// Close if clicked outside
window.addEventListener('click', (e) => {
  if (e.target === authModal) {
    closeAuthModal();
  }
});

authSwitchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  authError.style.display = 'none';
  authSuccess.style.display = 'none';
  
  if (isLoginMode) {
    authTitle.innerText = 'Welcome Back';
    authSubtitle.innerText = 'Log in to upload and manage your research.';
    btnSubmitAuth.innerText = 'Log In';
    authSwitchPrompt.innerText = "Don't have an account?";
    authSwitchBtn.innerText = 'Sign Up';
  } else {
    authTitle.innerText = 'Create Account';
    authSubtitle.innerText = 'Join the HydrogenHub research community.';
    btnSubmitAuth.innerText = 'Sign Up';
    authSwitchPrompt.innerText = "Already have an account?";
    authSwitchBtn.innerText = 'Log In';
  }
});

// --- FIREBASE AUTH LOGIC ---

async function checkProfileAndRedirect(user) {
  // Enforce Email Verification
  if (!user.emailVerified) {
    authError.innerText = "Please verify your email before continuing. Check your inbox for the link.";
    authError.style.display = 'block';
    await signOut(auth); // Log them out to prevent bypass
    return;
  }

  // Check if user has completed profile setup using REST API
  try {
      const token = await user.getIdToken();
      const url = `https://firestore.googleapis.com/v1/projects/hydrohub-215/databases/(default)/documents/users/${user.uid}`;
      const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        // 404 means the document doesn't exist
        if (!window.location.pathname.includes('profile-setup.html')) {
            window.location.href = 'profile-setup.html';
        }
      } else {
          closeAuthModal();
      }
  } catch (error) {
      console.error("Error checking profile:", error);
      // Fallback
      closeAuthModal();
  }
}

[emailInput, passwordInput].forEach(input => {
  if (input) {
      input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              if (btnSubmitAuth) btnSubmitAuth.click();
          }
      });
  }
});

btnSubmitAuth.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    authError.innerText = "Please enter both email and password.";
    authError.style.display = 'block';
    return;
  }
  
  try {
    btnSubmitAuth.disabled = true;
    authError.style.display = 'none';
    authSuccess.style.display = 'none';

    if (isLoginMode) {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await checkProfileAndRedirect(userCred.user);
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCred.user);
      authSuccess.innerText = "Verification email sent! Please check your inbox.";
      authSuccess.style.display = 'block';
      await checkProfileAndRedirect(userCred.user);
    }
  } catch (error) {
    console.error("Auth Error:", error);
    authError.innerText = error.message.replace('Firebase: ', '');
    authError.style.display = 'block';
  } finally {
    btnSubmitAuth.disabled = false;
  }
});

btnGoogleAuth.addEventListener('click', async () => {
  try {
    btnGoogleAuth.disabled = true;
    authError.style.display = 'none';
    const userCred = await signInWithPopup(auth, googleProvider);
    await checkProfileAndRedirect(userCred.user);
  } catch (error) {
    console.error("Google Auth Error:", error);
    authError.innerText = error.message.replace('Firebase: ', '');
    authError.style.display = 'block';
  } finally {
    btnGoogleAuth.disabled = false;
  }
});

// --- NAVBAR UPDATE LOGIC ---
onAuthStateChanged(auth, (user) => {
  const navContainer = document.querySelector('.nav-links');
  if (!navContainer) return;

  // Remove existing auth buttons if any
  const existingAuthItem = document.getElementById('nav-auth-item');
  if (existingAuthItem) existingAuthItem.remove();

  const authLi = document.createElement('li');
  authLi.id = 'nav-auth-item';

  if (user) {
    // Generate a Random Hue based on user UID
    const charCode = user.uid ? (user.uid.charCodeAt(0) + user.uid.charCodeAt(user.uid.length - 1)) : Math.floor(Math.random() * 360);
    const hueDeg = (charCode * 45) % 360; // Multiply to spread out the color spectrum
    
    let avatarUrl = 'Default%20logo.png';
    let filterStyle = `filter: hue-rotate(${hueDeg}deg) saturate(1.5);`;
    
    if (user.photoURL && user.photoURL.includes('cloudinary.com')) {
        avatarUrl = user.photoURL;
        filterStyle = ''; // Don't apply filters to custom uploaded pictures
    }

    authLi.innerHTML = `
        <div class="nav-auth-container">
            <img src="${avatarUrl}" alt="Profile" class="nav-avatar" style="${filterStyle}" referrerpolicy="no-referrer">
            <div class="nav-dropdown">
                <a href="account.html?v=3">My Account</a>
                <a href="#" id="nav-switch-btn">Switch Account</a>
                <div class="dropdown-divider"></div>
                <a href="#" id="nav-logout-btn" style="color: #ff6666;">Log Out</a>
            </div>
        </div>
    `;
    navContainer.appendChild(authLi);
    
    // Switch Account Logic
    document.getElementById('nav-switch-btn').addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            if (window.location.pathname.includes('account.html') || window.location.pathname.includes('upload.html')) {
                window.location.href = 'index.html';
            } else {
                openAuthModal();
            }
        });
    });

    // Logout Logic
    document.getElementById('nav-logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      signOut(auth).then(() => {
          if (window.location.pathname.includes('account.html') || window.location.pathname.includes('upload.html')) {
              window.location.href = 'index.html';
          }
      });
    });
  } else {
    // Remove logout button if it exists
    const existingLogoutItem = document.getElementById('nav-logout-item');
    if (existingLogoutItem) existingLogoutItem.remove();

    authLi.innerHTML = `<a href="#" id="nav-login-btn" style="color: var(--accent-cyan); font-weight: bold; border: 1px solid var(--accent-cyan); padding: 0.4rem 1rem; border-radius: 20px;">Login / Sign Up</a>`;
    navContainer.appendChild(authLi);
    
    document.getElementById('nav-login-btn').addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
  }
});


