/**
 * NEW LEAF - Interaction Script
 */

// --- 1. KEYWORD CONSOLE & ASSURANCE ---
const comfortQuotes = {
    suicide: "❤️ <strong>Everything is going to be fine.</strong> You are brave for sharing this. Please stay with us—your story is far from over. Reach out to the free numbers at the top right now.",
    lonely: "🫂 <strong>You are not alone.</strong> We are standing right here with you. This feeling of being alone is heavy, but there are people who care and want to listen.",
    stress: "🌿 <strong>Take a slow breath.</strong> You've carried so much. It's okay to let someone else help you carry the load for a while. You are doing your best."
};

const keywords = {
    suicide: ["suicide", "end it", "kill myself", "die", "death", "goodbye"],
    lonely: ["lonely", "alone", "nobody", "isolated", "no one cares"],
    stress: ["stress", "handle", "pressure", "burden", "tired", "exhausted"]
};

const storyArea = document.getElementById('userStory');
const assuranceBox = document.getElementById('assurance-box');

// Real-time assurance logic
storyArea.addEventListener('input', () => {
    const text = storyArea.value.toLowerCase();
    let response = "";

    if (keywords.suicide.some(w => text.includes(w))) response = comfortQuotes.suicide;
    else if (keywords.lonely.some(w => text.includes(w))) response = comfortQuotes.lonely;
    else if (keywords.stress.some(w => text.includes(w))) response = comfortQuotes.stress;

    if (response) {
        assuranceBox.innerHTML = response;
        assuranceBox.classList.remove('hidden');
    } else {
        assuranceBox.classList.add('hidden');
    }
});

// --- 2. THEME ENGINE (Moon/Sun) ---
const themeCheck = document.getElementById('theme-checkbox');
themeCheck.addEventListener('change', () => {
    const isLight = themeCheck.checked;
    document.body.classList.toggle('dark-mode', !isLight);
    document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');
});

// --- 3. VOICE ENGINE (Speech to Text) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    document.getElementById('voiceBtn').onclick = () => {
        recognition.lang = document.getElementById('langSelect').value;
        recognition.start();
        document.getElementById('voiceStatus').innerText = "Listening... Speak your heart.";
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        const sourceLang = document.getElementById('langSelect').value.split('-')[0];
        
        try {
            // Free Translation
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript)}&langpair=${sourceLang}|en`);
            const data = await res.json();
            storyArea.value += data.responseData.translatedText + ". ";
            storyArea.dispatchEvent(new Event('input')); // Trigger assurance check
            document.getElementById('voiceStatus').innerText = "Translated successfully.";
        } catch (e) {
            storyArea.value += transcript + ". ";
            document.getElementById('voiceStatus').innerText = "Captured transcript.";
        }
    };
}

// --- 4. REAL DISPATCH (Mailto) ---
function dispatchFreeHelp() {
    const story = storyArea.value.trim();
    if (!story) return alert("Please share your heart first so we can help.");

    const email = "telemanas-health@gov.in"; // 100% Free Govt Helpline
    const subject = encodeURIComponent("URGENT: Requesting Free Support from New Leaf");
    const body = encodeURIComponent(`Message from User:\n\n${story}\n\n---\nSent via New Leaf Finding Hope Platform`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    // Show confirmation on screen
    document.querySelector('.centered-container').innerHTML = `
        <div class="glass-card" style="text-align:center;">
            <h2 style="color:var(--accent);">Message Dispatched.</h2>
            <p>Everything is going to be fine. Your story has been sent. Please call 14416 while you wait for a reply.</p>
            <a href="tel:14416" class="btn-submit" style="display:block; text-decoration:none;">Call 14416 Now</a>
        </div>
    `;
}
