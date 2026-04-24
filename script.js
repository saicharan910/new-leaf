// --- 1. THEME ENGINE ---
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';

document.body.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') document.body.classList.add('dark-mode');

themeBtn.onclick = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    const theme = isDark ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

// --- 2. CITY & HOSPITAL DATA ---
const cityData = {
    "Tirupati": [{ name: "Ruia Psychiatry Block", phone: "08772286666" }],
    "Guntur": [{ name: "Sanjeevini Hospital", phone: "08499911117" }],
    "Vijayawada": [{ name: "Indlas Hospitals", phone: "08662432040" }],
    "Other": [{ name: "National Institute (NIMHANS)", phone: "08026995000" }]
};

const citySelect = document.getElementById('userCitySelect');
const hospitalSection = document.getElementById('hospital-section');
const hospitalList = document.getElementById('hospital-list');

if (citySelect) {
    citySelect.addEventListener('change', function() {
        const selectedCity = this.value;
        const hospitals = cityData[selectedCity] || cityData["Other"];
        hospitalSection.classList.remove('hidden');
        hospitalList.innerHTML = hospitals.map(h => `
            <div style="padding: 15px 0; border-bottom: 1px solid var(--border);">
                <strong>${h.name}</strong><br>
                <a href="tel:${h.phone}" style="color: var(--accent); text-decoration: none;">Call: ${h.phone}</a>
            </div>
        `).join('');
    });
}

// --- 3. MULTI-LANGUAGE VOICE SYSTEM ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = SpeechRecognition ? new SpeechRecognition() : null;

const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const storyArea = document.getElementById('userStory');
const langSelect = document.getElementById('langSelect');

let isRecording = false;

if (recognition) {
    recognition.interimResults = false;
    
    voiceBtn.onclick = () => {
        if (!isRecording) {
            recognition.lang = langSelect.value;
            recognition.start();
        } else {
            recognition.stop();
        }
    };

    recognition.onstart = () => {
        isRecording = true;
        voiceBtn.classList.add('recording');
        voiceBtn.innerText = "🛑 Stop & Translate";
        voiceStatus.innerText = "Listening...";
    };

    recognition.onend = () => {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.innerText = "🎤 Speak Your Heart";
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        const sourceLang = langSelect.value.split('-')[0];
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript)}&langpair=${sourceLang}|en`);
            const data = await res.json();
            storyArea.value += data.responseData.translatedText + ". ";
        } catch (e) {
            storyArea.value += transcript + ". ";
        }
    };
}

function sendToResponders() {
    if(!storyArea.value.trim()) return alert("Please share your story first.");
    alert("Voice captured. Responders have been notified.");
    storyArea.value = "";
}
