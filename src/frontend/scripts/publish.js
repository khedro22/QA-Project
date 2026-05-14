

// ========== STATE ==========
let currentType = 'article';
let mediaRecorder = null;
let audioChunks = [];
let recordedBlob = null;
let recordTimer = null;
let recordSeconds = 0;
let categoryId = null;
const API_URL = localStorage.getItem('BaseUrl');

// ========== GET CATEGORY FROM URL ==========
async function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    categoryId = params.get('category');
    const catRes = await fetch(`${API_URL}/categories`);
    const categories = await catRes.json();
    const category = categories.find(cat => cat._id === categoryId);

    document.getElementById('categoryDisplay').textContent = category.categoryName;
}

// ========== TYPE SWITCHING ==========
function switchType(type) {
    currentType = type;

    // Update tabs
    document.querySelectorAll('.publish-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });

    // Show/hide fields
    document.querySelectorAll('.article-field').forEach(el => {
        el.classList.toggle('hidden', type !== 'article');
    });
    document.querySelectorAll('.video-field').forEach(el => {
        el.classList.toggle('hidden', type !== 'video');
    });
    document.querySelectorAll('.voice-field').forEach(el => {
        el.classList.toggle('hidden', type !== 'voice');
    });

    // Update success message text
    const typeNames = {
        'article': 'Article',
        'video': 'Video',
        'voice': 'Voice Note'
    };
    document.getElementById('successText').textContent = `${typeNames[type]} Published Successfully`;

    // Clear errors
    clearErrors();
}

// ========== VOICE RECORDING ==========
async function toggleRecording() {
    const btn = document.getElementById('recordBtn');
    const icon = document.getElementById('recordIcon');
    const text = document.getElementById('recordText');
    const timer = document.getElementById('recordTimer');
    const preview = document.getElementById('recordPreview');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop recording
        mediaRecorder.stop();
        clearInterval(recordTimer);
        btn.classList.remove('recording');
        icon.textContent = '🎙';
        text.textContent = 'Start Recording';
        return;
    }

    // Start recording
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordedBlob = null;

        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(recordedBlob);
            preview.src = audioUrl;
            preview.classList.remove('hidden');
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        btn.classList.add('recording');
        icon.textContent = '⏹';
        text.textContent = 'Stop Recording';

        // Start timer
        recordSeconds = 0;
        timer.classList.remove('hidden');
        updateTimer();
        recordTimer = setInterval(updateTimer, 1000);

    } catch (err) {
        alert('Microphone access denied or not available');
    }
}

function updateTimer() {
    recordSeconds++;
    const mins = Math.floor(recordSeconds / 60).toString().padStart(2, '0');
    const secs = (recordSeconds % 60).toString().padStart(2, '0');
    document.getElementById('recordTimer').textContent = `${mins}:${secs}`;
}

// ========== VALIDATION ==========
function validate() {
    clearErrors();
    let hasError = false;

    const title = document.getElementById('title').value.trim();

    if (!title) {
        showError('title', 'titleError', 'Title is required');
        hasError = true;
    } else if (title.length < 3) {
        showError('title', 'titleError', 'Title must be at least 3 characters');
        hasError = true;
    } else if (title.length > 20) {
        showError('title', 'titleError', 'Title must be at most 20 characters');
        hasError = true;
    }

    if (currentType === 'article') {
        const content = document.getElementById('articleContent').value.trim();
        if (!content) {
            showError('articleContent', 'contentError', 'Content is required');
            hasError = true;
        } else if (content.length < 3) {
            showError('articleContent', 'contentError', 'Content must be at least 3 characters');
            hasError = true;
        } else if (content.length > 600) {
            showError('articleContent', 'contentError', 'Content must be at most 600 characters');
            hasError = true;
        }
    } else if (currentType === 'video') {
        const url = document.getElementById('videoUrl').value.trim();
        if (!url) {
            showError('videoUrl', 'urlError', 'Video URL is required');
            hasError = true;
        }
    } else if (currentType === 'voice') {
        if (!recordedBlob && !document.getElementById('recordPreview').src) {
            document.getElementById('voiceError').classList.add('show');
            hasError = true;
        }
    }

    return !hasError;
}

function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add('error');
    const errorEl = document.getElementById(errorId);
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

function clearErrors() {
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
    document.getElementById('publishError').classList.remove('show');
}

// ========== PUBLISH ==========
document.getElementById('publishForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validate()) {
        document.getElementById('publishError').classList.add('show');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.remove('hidden');
    try {
        if (currentType === 'article' || currentType === 'video') {
            const contentName = document.getElementById('title').value.trim();
            const content = document.getElementById('articleContent').value.trim();
            const url = document.getElementById('videoUrl').value.trim();

            const body = JSON.stringify({
                "contentName": contentName,
                "type": currentType,
                "description": content,
                "categoryId": categoryId,
                "url": url
            });
            const res = await fetch(`${API_URL}/content`, {
                method: 'POST',
                headers: ApiHelper.getAuthHeaders(),
                body: body
            });
        } else {
            const formData = new FormData();
            formData.append('contentName', document.getElementById('title').value.trim());
            formData.append('type', currentType);
            formData.append('categoryId', categoryId);
            formData.append('voiceFile', recordedBlob, 'voice.webm');

            const response = await fetch(`${API_URL}/content`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${ApiHelper.getToken()}` },
                body: formData
            });

        }
    } catch (err) {
        document.getElementById('loadingOverlay').classList.add('hidden');
        document.getElementById('publishError').textContent = 'Failed to publish. Please try again.';
        document.getElementById('publishError').classList.add('show');
        return;
    }


    // Hide loading, show success
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('successOverlay').classList.remove('hidden');

    // Redirect after 2 seconds
    setTimeout(() => {
        window.location.replace('home.html');
    }, 2000);
});

// ========== REAL-TIME CLEAR ==========
document.getElementById('title').addEventListener('input', () => {
    document.getElementById('title').classList.remove('error');
    document.getElementById('titleError').classList.remove('show');
    document.getElementById('publishError').classList.remove('show');
});

document.getElementById('articleContent').addEventListener('input', () => {
    document.getElementById('articleContent').classList.remove('error');
    document.getElementById('contentError').classList.remove('show');
    document.getElementById('publishError').classList.remove('show');
});

document.getElementById('videoUrl').addEventListener('input', () => {
    document.getElementById('videoUrl').classList.remove('error');
    document.getElementById('urlError').classList.remove('show');
    document.getElementById('publishError').classList.remove('show');
});

// ========== INIT ==========
async function init() {
    if (!localStorage.getItem('currentUser')) {
        location.replace('../index.html');
    }
    await getCategoryFromUrl();
}

init();
document.addEventListener("DOMContentLoaded", () => {
    window.NotificationsHelper.start();
});