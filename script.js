// --- 1. COMFORT & ASSURANCE LOGIC ---
const comfortMessages = {
    suicide: "❤️ <strong>Everything is going to be fine.</strong> You are incredibly brave for sharing this. Please stay with us—this pain is temporary, but you are irreplaceable. Reach out to the toll-free numbers below right now.",
    lonely: "🫂 <strong>You are not alone.</strong> We are standing right here with you. This feeling of isolation is a heavy cloud, but the sun is still behind it. Better days are ahead.",
    stress: "🌿 <strong>Take a slow breath.</strong> You've carried so much for so long. It is okay to be tired. Let us help you find a path to peace, one small step at a time."
};

const keywords = {
    suicide: ["suicide", "end it", "kill myself", "die", "death", "goodbye", "hurt"],
    lonely: ["lonely", "alone", "nobody", "isolated", "empty", "no one cares"],
    stress: ["stress", "handle", "pressure", "burden", "tired", "exhausted", "give up"]
};

const storyArea = document.getElementById('userStory');
const assuranceBox = document.getElementById('assurance-box');

storyArea.addEventListener('input', () => {
    const text = storyArea.value.toLowerCase();
    let response = "";
    
    if (keywords.suicide.some(w => text.includes(w))) response = comfortMessages.suicide;
    else if (keywords.lonely.some(w => text.includes(w))) response = comfortMessages.lonely;
    else if (keywords.stress.some(w => text.includes(w))) response = comfortMessages.stress;

    if (response) {
        assuranceBox.innerHTML = response;
        assuranceBox.classList.remove('hidden');
    } else {
        assuranceBox.classList.add('hidden');
    }
});

// --- 2. THEME ENGINE ---
const themeCheck = document.getElementById('theme-checkbox');
themeCheck.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', !themeCheck.checked);
    document.body.setAttribute('data-theme', themeCheck.checked ? 'light' : 'dark');
});

// --- 3. VOICE ENGINE ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    document.getElementById('voiceBtn').onclick = () => {
        recognition.lang = document.getElementById('langSelect').value;
        recognition.start();
    };
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        const sourceLang = document.getElementById('langSelect').value.split('-')[0];
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript)}&langpair=${sourceLang}|en`);
            const data = await res.json();
            storyArea.value += data.responseData.translatedText + ". ";
            storyArea.dispatchEvent(new Event('input'));
        } catch (e) {
            storyArea.value += transcript + ". ";
        }
    };
}

// --- 4. FREE DISPATCH ---
function dispatchFreeHelp() {
    const story = storyArea.value.trim();
    if (!story) return alert("Please share your heart first so we can help.");

    const email = "telemanas-health@gov.in"; // Govt of India Free Helpline
    const subject = encodeURIComponent("URGENT: Requesting Free Mental Health Support");
    const body = encodeURIComponent(`Message from New Leaf User:\n\n${story}\n\n---\nSource: New Leaf Finding Hope Platform`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    // Update UI to Reassure
    document.querySelector('.centered-container').innerHTML = `
        <div class="glass-card" style="text-align:center;">
            <h2 style="color:var(--accent);">Message Dispatched.</h2>
            <p>Everything is going to be fine. A request has been sent for free support. Please stay on the line with the toll-free numbers below.</p>
            <a href="tel:14416" class="btn-submit" style="display:block; text-decoration:none;">Call 14416 (Tele-MANAS)</a>
            <button onclick="location.reload()" style="background:none; border:none; color:var(--dim); margin-top:20px; cursor:pointer;">Back to Start</button>
        </div>
    `;
}
