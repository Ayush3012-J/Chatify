const chatBody = document.querySelector('.chat-body');
const chatForm = document.querySelector('.chat-form');
const messageInput = document.querySelector('.message-input');
const sendButton = document.querySelector('#send-message');

document.addEventListener('DOMContentLoaded', () => {
  const savedChat = JSON.parse(localStorage.getItem('chatHistory')) || [];
  savedChat.forEach(message => appendMessage(message.text, message.sender, message.isThinking));
});

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = messageInput.value.trim();

  if (userMessage) {
    appendMessage(userMessage, 'user');
    messageInput.value = '';

    appendMessage('...', 'bot', true);

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      removeThinkingIndicator();
      appendMessage(data.reply, 'bot');
      saveChatHistory(userMessage, 'user');
      saveChatHistory(data.reply, 'bot');
    } catch (err) {
      removeThinkingIndicator();
      appendMessage('Error contacting AI server.', 'bot');
    }
  }
});

function appendMessage(text, sender, isThinking = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${sender}-message`);

  if (isThinking) {
    const thinkingIndicator = document.createElement('div');
    thinkingIndicator.classList.add('thinking-indicator');
    thinkingIndicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    messageElement.appendChild(thinkingIndicator);
  } else {
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = text;
    messageElement.appendChild(messageText);
  }

  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeThinkingIndicator() {
  const thinking = document.querySelector('.thinking-indicator');
  if (thinking) thinking.parentElement.remove();
}

function saveChatHistory(text, sender, isThinking = false) {
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  history.push({ text, sender, isThinking });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

sendButton.addEventListener('click', () => {
  chatForm.dispatchEvent(new Event('submit'));
});

function clearChatHistory() {
  // Clear saved chat from localStorage
  localStorage.removeItem('chatHistory');

  // Clear chat messages in the UI
  const chatBody = document.getElementById('chat-body');
  chatBody.innerHTML = `
    <div class="message bot-message">
      <div class="message-text">Hi! I'm Chatify. How can I assist you today?</div>
    </div>
  `;
}
