// 1. DATA CONFIGURATION
const cityData = {
    "Tirupati": [{ name: "Ruia Psychiatry Block", phone: "08772286666" }],
    "Guntur": [{ name: "Sanjeevini Hospital", phone: "08499911117" }],
    "Vijayawada": [{ name: "Indlas Hospitals", phone: "08662432040" }],
    "Other": [{ name: "National Institute (NIMHANS)", phone: "08026995000" }]
};

// 2. DOM ELEMENTS
const citySelect = document.getElementById('userCitySelect');
const otherCityInput = document.getElementById('otherCityInput');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const storyArea = document.getElementById('userStory');
const themeToggle = document.querySelector('#checkbox');

// 3. DYNAMIC AUDIO UI INJECTION
const audioContainer = document.createElement('div');
audioContainer.id = 'audioPreview';
audioContainer.className = 'hidden mt-4 text-center';
audioContainer.innerHTML = `
    <audio id="audioPlayback" controls style="width: 100%; max-width: 300px; margin-bottom: 15px;"></audio>
    <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="cancelRecord" style="background:#64748b; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">✖ Cancel</button>
        <button id="confirmSend" style="background:#7d9d85; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">📧 Attach Message</button>
    </div>
`;
document.querySelector('.voice-box').appendChild(audioContainer);

// 4. VOICE RECORDING (MediaRecorder API)
let mediaRecorder, audioChunks = [];

voiceBtn.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/wav' });
                document.getElementById('audioPlayback').src = URL.createObjectURL(blob);
                audioContainer.classList.remove('hidden');
                voiceBtn.innerHTML = "🎤 Speak Your Heart";
                voiceBtn.classList.remove('recording');
            };

            mediaRecorder.start();
            voiceBtn.innerHTML = "<span>■</span> Stop Recording";
            voiceBtn.classList.add('recording');
            voiceStatus.innerText = "Recording... Tap the square to stop.";
        } catch (err) {
            alert("Please allow microphone access in your browser settings to record.");
        }
    } else {
        mediaRecorder.stop();
        voiceStatus.innerText = "Recording finished. You can play it back below.";
    }
});

document.getElementById('cancelRecord').onclick = () => {
    audioContainer.classList.add('hidden');
    voiceStatus.innerText = "Recording discarded.";
};

document.getElementById('confirmSend').onclick = () => {
    storyArea.value += "\n[Voice Message Attached to Dispatch]";
    audioContainer.classList.add('hidden');
    document.getElementById('voiceModal').classList.remove('hidden');
};

document.getElementById('closeModal').onclick = () => {
    document.getElementById('voiceModal').classList.add('hidden');
    document.getElementById('dispatchForm').scrollIntoView({ behavior: 'smooth' });
};

// 5. THEME TOGGLE LOGIC
if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

// Load Preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) themeToggle.checked = (savedTheme === 'dark');
}

// 6. CITY & HOSPITAL LOGIC
citySelect.addEventListener('change', function() {
    const list = document.getElementById('hospital-list');
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
        <div class="hospital-item" style="margin-bottom:15px; border-left:3px solid var(--sage); padding-left:10px;">
            <strong>${h.name}</strong><br>
            <a href="tel:${h.phone}" style="color:var(--sage);">Call: ${h.phone}</a>
        </div>
    `).join('');
}

// 7. FINAL DISPATCH
document.getElementById('dispatchForm').onsubmit = (e) => {
    e.preventDefault();
    const story = storyArea.value.toLowerCase();
    const urgentWords = ["now", "die", "kill", "end", "today", "help"];
    const priority = urgentWords.some(w => story.includes(w)) ? "🚨 CRITICAL" : "Standard Priority";

    const body = encodeURIComponent(
        `PRIORITY: ${priority}\n` +
        `Location: ${citySelect.value}\n` +
        `Message: ${storyArea.value}`
    );

    window.location.href = `mailto:help@vandrevalafoundation.com?subject=New Leaf - ${priority}&body=${body}`;
    document.querySelector('.form-card').innerHTML = `<h2>Help is in motion.</h2><p>Please stay on this page or call 14416.</p>`;
};
