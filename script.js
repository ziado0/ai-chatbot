document.addEventListener('DOMContentLoaded', () => {
    // Double-check that this is your correct worker URL
    const WORKER_URL = 'https://gemini-rapidapi-proxy.ziadforgemini.workers.dev';

    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const endChatBtn = document.getElementById('end-chat-btn');

    let conversationHistory = [];

    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        const p = document.createElement('p');
        p.textContent = text;
        messageElement.appendChild(p);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    };

    const handleSendMessage = async () => {
        // --- THIS IS THE TEST LINE ---
        console.log("Send button was clicked or Enter was pressed.");

        const userText = userInput.value.trim();
        if (userText === "") return;

        addMessage(userText, 'user');
        userInput.value = '';
        sendBtn.disabled = true;

        conversationHistory.push({ role: 'user', parts: [{ text: userText }] });

        const typingIndicator = addMessage('Bot is typing...', 'bot typing-indicator');

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ history: conversationHistory }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error}`);
            }

            const data = await response.json();
            const botResponse = data.response;
            
            chatBox.removeChild(typingIndicator);
            addMessage(botResponse, 'bot');
            conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });

        } catch (error) {
            chatBox.removeChild(typingIndicator);
            addMessage(`Sorry, something went wrong: ${error.message}`, 'bot');
            console.error('Error:', error);
        } finally {
            sendBtn.disabled = false;
            userInput.focus();
        }
    };

    const clearChat = () => {
        chatBox.innerHTML = '';
        conversationHistory = [];
        addMessage("Chat history cleared. How can I help you?", 'bot');
    };

    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });
    endChatBtn.addEventListener('click', clearChat);
});
