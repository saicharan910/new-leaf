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

// 1. Voice Recognition Logic with Manual Stop Toggle
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keeps listening even if user pauses
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    let isRecording = false;

    voiceBtn.addEventListener('click', () => {
        if (!isRecording) {
            // START STATE
            try {
                recognition.start();
                isRecording = true;
                voiceBtn.classList.add('recording');
                // Using HTML entity for the square symbol
                voiceBtn.innerHTML = "<span>■</span> Stop Speaking";
                document.getElementById('voiceStatus').innerText = "Listening to you... Tap the square when you are finished.";
            } catch (err) {
                console.error("Recognition already started or blocked", err);
            }
        } else {
            // STOP STATE (Manual Stop)
            recognition.stop();
            resetVoiceBtn();
        }
    });

    recognition.onresult = (event) => {
        // Get the latest transcript piece
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;

        // Append it to your story area with a space
        storyArea.value += transcript + " ";
    };

    recognition.onend = () => {
        // Safety reset if the browser cuts the mic naturally
        resetVoiceBtn();
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error: ", event.error);
        resetVoiceBtn();
    };

    
    // ... inside your SpeechRecognition logic ...

    function resetVoiceBtn() {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = "🎤 Speak Your Heart";
        document.getElementById('voiceStatus').innerText = "Tap to record again.  if you have more to say.";

        // TRIGGER THE HOPE POPUP
        showHopePopup();
    }

    function showHopePopup() {
        const modal = document.getElementById('voiceModal');
        modal.classList.remove('hidden');

        // Provide a small delay so they can read the hope message
        document.getElementById('closeModal').onclick = function () {
            modal.classList.add('hidden');
            // Scroll them down to the form so they can hit "Send"
            document.getElementById('dispatchForm').scrollIntoView({ behavior: 'smooth' });
        };
    }
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

const toggleSwitch = document.querySelector('#checkbox');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);

// Check for saved user preference on load
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}
