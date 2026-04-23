const cityData = {
    "Tirupati": [{ name: "Ruia Psychiatry Block", phone: "08772286666" }],
    "Guntur": [{ name: "Sanjeevini Hospital", phone: "08499911117" }],
    "Vijayawada": [{ name: "Indlas Hospitals", phone: "08662432040" }]
};

const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const storyArea = document.getElementById('userStory');

// Injected UI for Audio Preview
const audioContainer = document.createElement('div');
audioContainer.className = 'hidden mt-4';
audioContainer.innerHTML = `
    <audio id="audioPlayback" controls style="width:100%; margin: 15px 0;"></audio>
    <div style="display:flex; gap:10px; justify-content:center;">
        <button id="cancelRecord" style="background:#64748b; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer;">✖ Cancel</button>
        <button id="confirmSend" style="background:#7d9d85; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer;">📧 Attach</button>
    </div>
`;
document.querySelector('.voice-box').appendChild(audioContainer);

let mediaRecorder, audioChunks = [];

voiceBtn.addEventListener('click', async () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/wav' });
            document.getElementById('audioPlayback').src = URL.createObjectURL(blob);
            audioContainer.classList.remove('hidden');
            voiceBtn.innerHTML = "🎤 Speak Your Heart";
        };
        mediaRecorder.start();
        voiceBtn.innerHTML = "■ Stop Recording";
        voiceStatus.innerText = "Recording...";
    } else {
        mediaRecorder.stop();
        voiceStatus.innerText = "Done. Listen below.";
    }
});

document.getElementById('confirmSend').onclick = () => {
    storyArea.value += "\n[Audio Attached]";
    audioContainer.classList.add('hidden');
    document.getElementById('voiceModal').classList.remove('hidden');
};

document.getElementById('closeModal').onclick = () => document.getElementById('voiceModal').classList.add('hidden');

// Theme Switcher
const toggle = document.querySelector('#checkbox');
toggle.addEventListener('change', e => {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// Load saved theme
const saved = localStorage.getItem('theme');
if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    toggle.checked = (saved === 'dark');
}
