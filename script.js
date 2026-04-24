// --- 1. CONFIGURATION ---
const cityData = {
    "Tirupati": [{ name: "Ruia Psychiatry Block", phone: "08772286666" }],
    "Guntur": [{ name: "Sanjeevini Hospital", phone: "08499911117" }],
    "Vijayawada": [{ name: "Indlas Hospitals", phone: "08662432040" }],
    "Other": [{ name: "NIMHANS", phone: "08026995000" }]
};

const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const storyArea = document.getElementById('userStory');
const langSelect = document.getElementById('langSelect');

// --- 2. SPEECH RECOGNITION SETUP ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

// --- 3. DUAL-MODE RECORDING (Audio + Text) ---
let mediaRecorder, audioChunks = [];
let isRecording = false;

voiceBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            // Start Audio Record
            mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
            mediaRecorder.onstop = handleAudioStop;
            mediaRecorder.start();

            // Start Speech to Text
            if (recognition) {
                recognition.lang = langSelect.value;
                recognition.start();
            }

            isRecording = true;
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = "🛑 Stop & Process";
            voiceStatus.innerText = "I am listening... Speak clearly in your chosen language.";
        } catch (err) {
            alert("Please allow microphone access to use this feature.");
        }
    } else {
        mediaRecorder.stop();
        if (recognition) recognition.stop();
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = "🎤 Speak Your Heart";
    }
});

function handleAudioStop() {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    voiceStatus.innerText = "Voice processed and translated. Review your story below.";
}

// --- 4. TRANSLATION EXECUTION ---
if (recognition) {
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        const sourceLang = langSelect.value.split('-')[0];
        
        voiceStatus.innerText = "Translating heart to English...";
        
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript)}&langpair=${sourceLang}|en`);
            const data = await res.json();
            const translatedText = data.responseData.translatedText;
            storyArea.value += translatedText + ". ";
        } catch (e) {
            storyArea.value += `[Transcript]: ${transcript}. `;
        }
    };
}

// --- 5. CITY & DISPATCH LOGIC ---
document.getElementById('userCitySelect').addEventListener('change', function() {
    const city = this.value;
    const list = document.getElementById('hospital-list');
    const hospitals = cityData[city] || cityData["Other"];
    
    list.innerHTML = hospitals.map(h => `
        <div class="hospital-item" style="padding:15px; border-bottom:1px solid #1a1a1a;">
            <strong>${h.name}</strong><br>
            <a href="tel:${h.phone}" style="color:var(--accent)">Call: ${h.phone}</a>
        </div>
    `).join('');
});

document.getElementById('dispatchForm').onsubmit = function(e) {
    e.preventDefault();
    if(!storyArea.value.trim()) return alert("Please share your story.");
    
    document.getElementById('voiceModal').classList.remove('hidden');
};

document.getElementById('closeModal').onclick = () => {
    document.getElementById('voiceModal').classList.add('hidden');
    window.location.reload(); // Refresh for security/privacy
};
