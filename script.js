// --- 1. ENCOURAGEMENT ENGINE ---
const phrases = {
    suicide: "❤️ <strong>Everything is going to be fine.</strong> You are incredibly strong for being here. This moment is painful, but it is just a moment. Please reach out to the toll-free responders below—they are waiting to help you for free.",
    lonely: "🫂 <strong>We are right here with you.</strong> You are not alone in this fight. This weight is heavy, but there are people ready to help you carry it. Better days are truly ahead.",
    stress: "🌿 <strong>Take a breath.</strong> You have done so much today. It’s okay to pause and let someone else support you. You are enough, just as you are."
};

const keywords = {
    suicide: ["suicide", "end it", "kill myself", "die", "death", "goodbye", "hurt"],
    lonely: ["lonely", "alone", "nobody", "isolated", "empty"],
    stress: ["stress", "pressure", "burden", "tired", "exhausted", "cant handle"]
};

const storyArea = document.getElementById('userStory');
const assuranceBox = document.getElementById('assurance-box');

storyArea.addEventListener('input', () => {
    const text = storyArea.value.toLowerCase();
    let response = "";
    if (keywords.suicide.some(w => text.includes(w))) response = phrases.suicide;
    else if (keywords.lonely.some(w => text.includes(w))) response = phrases.lonely;
    else if (keywords.stress.some(w => text.includes(w))) response = phrases.stress;

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

// --- 4. FREE DISPATCH LOGIC ---
function dispatchFreeHelp() {
    const story = storyArea.value.trim();
    if (!story) return alert("Please share your heart first.");

    // Primary Free Contact: Tele-MANAS (Govt of India)
    const email = "telemanas-health@gov.in"; 
    const subject = encodeURIComponent("URGENT: Requesting Free Mental Health Support");
    const body = encodeURIComponent(`Message from New Leaf User:\n\n${story}\n\n---\nPlease provide free guidance as per government norms.`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    // Confirm UI
    document.querySelector('.centered-container').innerHTML = `
        <div class="glass-card" style="text-align:center;">
            <h2 style="color:var(--accent);">Message Sent.</h2>
            <p>Everything is going to be fine. A request has been sent for free support. For immediate help, call the toll-free numbers below.</p>
            <a href="tel:14416" class="btn-submit" style="display:block; text-decoration:none;">Call 14416 (Tele-MANAS)</a>
            <a href="tel:18005990019" class="btn-voice" style="display:block; text-decoration:none; margin-top:10px;">Call 1800-599-0019 (KIRAN)</a>
        </div>
    `;
}
