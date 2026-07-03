import { auth, db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { openAuthModal } from './auth.js';

const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const fileNameDisplay = document.getElementById('file-name');
const btnSubmit = document.getElementById('btn-submit-upload');
const uploadError = document.getElementById('upload-error');
const uploadSuccess = document.getElementById('upload-success');

let selectedFile = null;

// Drag and drop UI logic
uploadZone.addEventListener('click', () => {
    fileInput.click();
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    selectedFile = file;
    fileNameDisplay.innerText = `Selected File: ${file.name}`;
    fileNameDisplay.style.display = 'block';
    uploadError.style.display = 'none';
}

// Submission logic
btnSubmit.addEventListener('click', async () => {
    // 1. Enforce Authentication
    const user = auth.currentUser;
    if (!user) {
        openAuthModal();
        return;
    }

    const title = document.getElementById('upload-title').value.trim();
    const authors = document.getElementById('upload-authors').value.trim();
    const desc = document.getElementById('upload-desc').value.trim();

    // 2. Validate input
    if (!title || !authors || !desc || !selectedFile) {
        uploadError.innerText = "Please fill out all fields and select a file.";
        uploadError.style.display = 'block';
        uploadSuccess.style.display = 'none';
        return;
    }

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Uploading...";
        uploadError.style.display = 'none';

        // 3. Upload File to Cloudinary
        console.log("Uploading to Cloudinary...");
        const cloudName = "doakkvedg";
        const uploadPreset = "ml_default";
        
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", uploadPreset);

        // Using /auto/upload to handle both images and raw files like PDFs
        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: formData
        });

        if (!cloudinaryResponse.ok) {
            const errBody = await cloudinaryResponse.text();
            throw new Error(`Cloudinary Error: ${errBody}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const downloadURL = cloudinaryData.secure_url;
        
        console.log("File uploaded successfully to Cloudinary. Saving metadata to Firestore...");
        
        // 4. Save Metadata to Firestore using REST API (Foolproof method)
        // This completely bypasses the SDK's websocket/polling mechanism which is hanging
        const token = await user.getIdToken();
        const projectId = "hydrohub-215";
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/researchPapers`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fields: {
                    title: { stringValue: title },
                    authors: { stringValue: authors },
                    description: { stringValue: desc },
                    fileName: { stringValue: selectedFile.name },
                    fileUrl: { stringValue: downloadURL },
                    uploadedBy: { stringValue: user.uid },
                    uploaderEmail: { stringValue: user.email },
                    createdAt: { timestampValue: new Date().toISOString() }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error (${response.status}): ${errorText}`);
        }

        console.log("Successfully saved to Firestore!");

        // 5. Success State
        uploadSuccess.innerText = "Research paper uploaded successfully!";
        uploadSuccess.style.display = 'block';
        
        // Reset Form
        document.getElementById('upload-title').value = '';
        document.getElementById('upload-authors').value = '';
        document.getElementById('upload-desc').value = '';
        selectedFile = null;
        fileNameDisplay.style.display = 'none';
        
    } catch (error) {
        console.error("Upload Error:", error);
        uploadError.innerText = error.message;
        uploadError.style.display = 'block';
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Submit Research";
    }
});
