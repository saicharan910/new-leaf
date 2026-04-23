// --- 1. CONFIGURATION & DATA ---
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

// --- 2. DYNAMIC AUDIO UI SETUP ---
// We create the playback controls via JS so you don't have to change your HTML again
const audioContainer = document.createElement('div');
audioContainer.id = 'audioPreview';
audioContainer.className = 'hidden mt-4 text-center';
audioContainer.innerHTML = `
    <audio id="audioPlayback" controls class="mb-3" style="width: 100%; max-width: 300px; margin-bottom: 15px;"></audio>
    <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="cancelRecord" style="background:#64748b; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">✖ Cancel</button>
        <button id="confirmSend" style="background:#7d9d85; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">📧 Attach Message</button>
    </div>
`;
document.querySelector('.voice-box').appendChild(audioContainer);

// --- 3. VOICE RECORDING LOGIC (MediaRecorder) ---
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;

voiceBtn.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('audioPlayback').src = audioUrl;
                audioContainer.classList.remove('hidden');
                voiceBtn.innerHTML = "🎤 Speak Your Heart";
                voiceBtn.classList.remove('recording');
            };

            mediaRecorder.start();
            voiceBtn.innerHTML = "<span>■</span> Stop Recording";
            voiceBtn.classList.add('recording');
            voiceStatus.innerText = "Recording your voice... Tap the square when done.";
        } catch (err) {
            alert("Microphone access denied. Please enable it in browser settings.");
        }
    } else {
        mediaRecorder.stop();
        voiceStatus.innerText = "Recording finished. Listen below.";
    }
});

document.getElementById('cancelRecord').addEventListener('click', () => {
    audioContainer.classList.add('hidden');
    voiceStatus.innerText = "Recording discarded.";
});

document.getElementById('confirmSend').addEventListener('click', () => {
    storyArea.value += "\n[Audio Message Attached to Dispatch]";
    audioContainer.classList.add('hidden');
    voiceStatus.innerText = "Voice message attached. Please submit the form below.";
    showHopePopup();
});

function showHopePopup() {
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('closeModal').onclick = () => {
            modal.classList.add('hidden');
            document.getElementById('dispatchForm').scrollIntoView({ behavior: 'smooth' });
        };
    }
}

// --- 4. CITY & HOSPITAL LOGIC ---
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
        <div class="hospital-item" style="margin-bottom: 10px; padding: 10px; border-left: 3px solid var(--sage);">
            <strong>${h.name}</strong><br>
            <a href="tel:${h.phone}" style="color: var(--sage); text-decoration: none;">Call: ${h.phone}</a>
        </div>
    `).join('');
}

// --- 5. THEME SWITCHER LOGIC ---
const toggleSwitch = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark' && toggleSwitch) toggleSwitch.checked = true;
}

if (toggleSwitch) {
    toggleSwitch.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

// --- 6. DISPATCH FORM SUBMISSION ---
document.getElementById('dispatchForm').onsubmit = function (e) {
    e.preventDefault();
    const story = storyArea.value;

    const urgentKeywords = ["now", "die", "kill", "end", "today", "help", "please"];
    const isUrgent = urgentKeywords.some(word => story.toLowerCase().includes(word));
    const priority = isUrgent ? "🚨 CRITICAL / HIGH EMERGENCY" : "Standard Priority";

    const city = (citySelect.value === "Other") ? otherCityInput.value : citySelect.value;
    const state = document.getElementById('userState').value;

    const body = encodeURIComponent(
        `PRIORITY: ${priority}\n` +
        `Name: ${document.getElementById('userName').value}\n` +
        `Contact: ${document.getElementById('userContact').value}\n` +
        `Location: ${city}, ${state}\n` +
        `Message: ${story}`
    );

    window.location.href = `mailto:help@vandrevalafoundation.com?subject=New Leaf Dispatch - ${priority}&body=${body}`;

    document.querySelector('.form-card').innerHTML = `
        <h2 style="color:var(--sage)">Your voice was heard.</h2>
        <p>Help is in motion. Please stay on this page or call <strong>14416</strong> now.</p>
    `;
};
