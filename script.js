// --- 1. DATA CONFIGURATION ---
const cityData = {
    "Tirupati": [{ name: "Ruia Psychiatry Block", phone: "08772286666" }],
    "Guntur": [{ name: "Sanjeevini Hospital", phone: "08499911117" }],
    "Vijayawada": [{ name: "Indlas Hospitals", phone: "08662432040" }],
    "Other": [{ name: "National Institute (NIMHANS)", phone: "08026995000" }]
};

const citySelect = document.getElementById('userCitySelect');
const otherCityInput = document.getElementById('otherCityInput');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const storyArea = document.getElementById('userStory');

// --- 2. DYNAMIC VOICE UI INJECTION ---
const audioContainer = document.createElement('div');
audioContainer.id = 'audioPreview';
audioContainer.className = 'hidden mt-4 text-center';
audioContainer.innerHTML = `
    <div class="audio-player-wrapper">
        <p class="preview-label">PREVIEW YOUR MESSAGE</p>
        <audio id="audioPlayback" class="hidden"></audio>
        
        <div class="playback-controls">
            <button id="p-play" class="p-ctrl">▶ Play</button>
            <button id="p-pause" class="p-ctrl">⏸ Pause</button>
            <button id="p-stop" class="p-ctrl">⏹ Stop</button>
        </div>

        <div class="action-stack">
            <button id="reRecord" class="btn-rerecord">↺ Re-record (Start Over)</button>
            <button id="confirmSend" class="btn-confirm">📧 Confirm & Attach</button>
        </div>
    </div>
`;
document.querySelector('.voice-box').appendChild(audioContainer);

// --- 3. VOICE RECORDING SYSTEM (MediaRecorder) ---
let mediaRecorder, audioChunks = [];
const player = document.getElementById('audioPlayback');

voiceBtn.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/wav' });
                player.src = URL.createObjectURL(blob);
                audioContainer.classList.remove('hidden');
                voiceBtn.classList.add('hidden'); 
            };

            mediaRecorder.start();
            voiceBtn.innerHTML = "<span>■</span> Stop Recording";
            voiceBtn.classList.add('recording');
            voiceStatus.innerText = "Listening... Tap the square when you are finished.";
        } catch (err) {
            alert("Microphone access is required to record your message.");
        }
    } else {
        mediaRecorder.stop();
        voiceStatus.innerText = "Recording saved. Review it below.";
    }
});

// --- 4. PLAYBACK & RE-RECORD LOGIC ---
document.getElementById('p-play').onclick = () => player.play();
document.getElementById('p-pause').onclick = () => player.pause();
document.getElementById('p-stop').onclick = () => { player.pause(); player.currentTime = 0; };

document.getElementById('reRecord').onclick = () => {
    audioContainer.classList.add('hidden');
    voiceBtn.classList.remove('hidden');
    voiceBtn.innerHTML = "🎤 Speak Your Heart";
    voiceBtn.classList.remove('recording');
    voiceStatus.innerText = "Previous recording cleared. Tap to start again.";
    audioChunks = [];
};

document.getElementById('confirmSend').onclick = () => {
    storyArea.value += "\n[Verified Voice Message Attached]";
    audioContainer.classList.add('hidden');
    voiceBtn.classList.remove('hidden');
    voiceStatus.innerText = "Voice message attached. Submit the form to dispatch.";
    showHopePopup();
};

function showHopePopup() {
    const modal = document.getElementById('voiceModal');
    modal.classList.remove('hidden');
    document.getElementById('closeModal').onclick = () => {
        modal.classList.add('hidden');
        document.getElementById('dispatchForm').scrollIntoView({ behavior: 'smooth' });
    };
}

// --- 5. THEME SWITCHER ---
const themeToggle = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark' && themeToggle) themeToggle.checked = true;
}

if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

// --- 6. CITY LOGIC & DISPATCH ---
citySelect.addEventListener('change', function () {
    if (this.value === "Other") {
        otherCityInput.classList.remove('hidden');
        renderHospitals(cityData["Other"]);
    } else {
        otherCityInput.classList.add('hidden');
        if (cityData[this.value]) renderHospitals(cityData[this.value]);
    }
});

function renderHospitals(hubs) {
    document.getElementById('hospital-list').innerHTML = hubs.map(h => `
        <div class="hospital-item"><strong>${h.name}</strong><br><a href="tel:${h.phone}">Call: ${h.phone}</a></div>
    `).join('');
}

document.getElementById('dispatchForm').onsubmit = function (e) {
    e.preventDefault();
    const story = storyArea.value.toLowerCase();
    const urgentKeywords = ["now", "die", "kill", "end", "today", "help"];
    const priority = urgentKeywords.some(word => story.includes(word)) ? "🚨 CRITICAL" : "Standard";

    const body = encodeURIComponent(`PRIORITY: ${priority}\nMessage: ${storyArea.value}`);
    window.location.href = `mailto:help@vandrevalafoundation.com?subject=New Leaf Dispatch&body=${body}`;
    document.querySelector('.form-card').innerHTML = `<h2>Voice Heard.</h2><p>Stay on this page or call 14416.</p>`;
};
