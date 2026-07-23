export function initAIAssistant() {
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiChat = document.getElementById('aiAssistantChat');
    const aiVoiceBtn = document.getElementById('aiVoiceBtn');
    
    if (!aiInput || !aiSendBtn || !aiChat) return;

    aiSendBtn.addEventListener('click', () => sendPrompt());
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendPrompt();
    });

    async function sendPrompt() {
        const text = aiInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        aiInput.value = '';

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify({ message: text })
            });

            if (!res.ok) throw new Error('AI request failed');
            const data = await res.json();
            
            appendMessage('bot', data.response);

            if (data.action) {
                if (data.action.type === 'navigate') {
                    window.location.hash = data.action.target;
                }
            }
        } catch (err) {
            console.error(err);
            appendMessage('bot', 'Sorry, I failed to process that command. Make sure you are signed in.');
        }
    }

    function appendMessage(sender, text) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        bubble.textContent = text;
        aiChat.appendChild(bubble);
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        aiVoiceBtn.addEventListener('click', () => {
            if (aiVoiceBtn.classList.contains('recording')) {
                recognition.stop();
            } else {
                aiVoiceBtn.classList.add('recording');
                recognition.start();
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            aiInput.value = transcript;
            sendPrompt();
        };

        recognition.onend = () => {
            aiVoiceBtn.classList.remove('recording');
        };

        recognition.onerror = (err) => {
            console.error(err);
            aiVoiceBtn.classList.remove('recording');
        };
    } else {
        aiVoiceBtn.style.display = 'none';
    }
}
