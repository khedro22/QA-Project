let selectedType = "article";
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let audioUrl = null;
let isRecording = false;


function selectType(type) {
    selectedType = type;
    document.getElementById("articleFields").classList.add("hidden");
    document.getElementById("videoFields").classList.add("hidden");
    document.getElementById("voiceFields").classList.add("hidden");

    document.getElementById("articleBtn").classList.remove("btn-primary");
    document.getElementById("videoBtn").classList.remove("btn-primary");
    document.getElementById("voiceBtn").classList.remove("btn-primary");
    document.getElementById("errorMsg").classList.remove("show");

    if (type === "article") {
        document.getElementById("articleFields").classList.remove("hidden");
        document.getElementById("articleBtn").classList.add("btn-primary");
    }
    else if (type === "video") {
        document.getElementById("videoFields").classList.remove("hidden");
        document.getElementById("videoBtn").classList.add("btn-primary");
    }
    else if (type === "voice") {
        document.getElementById("voiceFields").classList.remove("hidden");
        document.getElementById("voiceBtn").classList.add("btn-primary");
    }
}

function publishContent() {
    const title = document.getElementById("title").value.trim();
    let valid = true;

    if (!title) valid = false;

    if (selectedType === "article") {
        const content = document.getElementById("content").value.trim();
        if (!content) valid = false;
    }

    if (selectedType === "video") {
        const videoUrl = document.getElementById("videoUrl").value.trim();
        if (!videoUrl) valid = false;
    }
    if (selectedType === "voice") {
        if (!audioBlob) valid = false;
    }

    if (!valid && selectedType === "article") {
        document.getElementById("errorMsg").textContent = "Title and Content Required";
        document.getElementById("errorMsg").classList.add("show");
        return;
    } else if (!valid && selectedType === "video") {
        document.getElementById("errorMsg").textContent = "Title and Video URL Required";
        document.getElementById("errorMsg").classList.add("show");
        return;
    } else if (!valid && selectedType === "voice") {
        document.getElementById("errorMsg").textContent = "Title and Audio Recording Required";
        document.getElementById("errorMsg").classList.add("show");
        return;
    }

    document.getElementById("errorMsg").classList.remove("show");
    document.getElementById("loadingModal").classList.add("open");

    setTimeout(() => {
        document.getElementById("loadingModal").classList.remove("open");
        document.getElementById("successText").innerText =
            `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Published Successfully`;
        document.getElementById("successModal").classList.add("open");
    }, 2000);
}

function closeSuccess() {
    document.getElementById("successModal").classList.remove("open");
    window.location.href = "home.html";
}


async function toggleRecording() {
    if (!isRecording) {
        await recordVoice();
    } else {
        stopRecording();
    }
}

async function recordVoice() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.start();
        isRecording = true;

        document.getElementById("recordBtn").innerText = "Recording...";
        document.getElementById("recordBtn").disabled = true;
        document.getElementById("stopBtn").classList.remove("hidden");

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            audioUrl = URL.createObjectURL(audioBlob);

            const audioPreview = document.getElementById("audioPreview");
            audioPreview.src = audioUrl;
            audioPreview.classList.remove("hidden");

            document.getElementById("recordStatus").innerText = "Recording completed!";
            document.getElementById("recordBtn").innerText = "Start Recording";
            document.getElementById("recordBtn").disabled = false;
            document.getElementById("stopBtn").classList.add("hidden");

            isRecording = false;
        };
    } catch (error) {
        alert("Microphone access denied or unavailable.");
        console.error(error);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
    }
}