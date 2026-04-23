const cityData = {
    "Tirupati": [{ name: "Ruia Psychiatry Block", phone: "08772286666" }],
    "Guntur": [{ name: "Sanjeevini Hospital", phone: "08499911117" }],
    "Vijayawada": [{ name: "Indlas Hospitals", phone: "08662432040" }],
    "Other": [{ name: "National Institute (NIMHANS)", phone: "08026995000" }]
};

const citySelect = document.getElementById('userCitySelect');
const otherCityInput = document.getElementById('otherCityInput');
const voiceBtn = document.getElementById('voiceBtn');
const storyArea = document.getElementById('userStory');

// 1. Voice Recognition Logic
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.classList.add('recording');
        voiceBtn.innerText = "🛑 Listening...";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        storyArea.value += transcript;
        voiceBtn.classList.remove('recording');
        voiceBtn.innerText = "🎤 Speak Your Heart";
    };
}

// 2. City Logic
citySelect.addEventListener('change', function () {
    const list = document.getElementById('hospital-list');
    const status = document.getElementById('city-status');
    if (this.value === "Other") {
        otherCityInput.classList.remove('hidden');
        renderHospitals(cityData["Other"]);
    } else {
        otherCityInput.classList.add('hidden');
        if (cityData[this.value]) renderHospitals(cityData[this.value]);
    }
});

function renderHospitals(hubs) {
    document.getElementById('hospital-list').innerHTML = hubs.map(h => `<div class="hospital-item"><strong>${h.name}</strong><br><a href="tel:${h.phone}">Call: ${h.phone}</a></div>`).join('');
}

// 3. Dispatch & Seriousness Analysis
document.getElementById('dispatchForm').onsubmit = function (e) {
    e.preventDefault();
    const story = storyArea.value.toLowerCase();

    // Simple Urgency Analysis
    const urgentKeywords = ["now", "die", "kill", "end", "today", "help", "please"];
    const isUrgent = urgentKeywords.some(word => story.includes(word));
    const priority = isUrgent ? "🚨 CRITICAL / HIGH EMERGENCY" : "Standard Priority";

    const city = (citySelect.value === "Other") ? otherCityInput.value : citySelect.value;
    const state = document.getElementById('userState').value;

    const body = encodeURIComponent(
        `PRIORITY: ${priority}\n` +
        `Name: ${document.getElementById('userName').value}\n` +
        `Contact: ${document.getElementById('userContact').value}\n` +
        `Location: ${city}, ${state}\n` +
        `Message: ${storyArea.value}`
    );

    window.location.href = `mailto:help@vandrevalafoundation.com?subject=New Leaf Dispatch - ${priority}&body=${body}`;

    document.querySelector('.form-card').innerHTML = `
        <h2 style="color:var(--sage)">Your voice was heard.</h2>
        <p>Help is in motion. Please stay on this page or call <strong>14416</strong> now.</p>
    `;
};