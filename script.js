// CHANGE THIS to your deployed Cloudflare Worker URL
const WORKER_URL = "gemini-rapidapi-proxy.ziadforgemini.workers.dev";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const endBtn = document.getElementById("end-chat-btn");

let history = []; // keeps track of full conversation

function appendMessage(text, cls) {
  const div = document.createElement("div");
  div.className = `chat-message ${cls}`;
  const p = document.createElement("p");
  p.innerText = text;
  div.appendChild(p);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

function setTypingIndicator() {
  const el = appendMessage("...", "bot-message typing-indicator");
  return el;
}

async function sendMessageToWorker(messageText) {
  // show user message
  appendMessage(messageText, "user-message");
  history.push({ role: "user", parts: [{ text: messageText }] });

  // show typing indicator
  const typingEl = setTypingIndicator();

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    });

    const json = await res.json();
    typingEl.remove();

    if (!res.ok) {
      throw new Error(json?.error || `Status ${res.status}`);
    }

    const botText = json.response || "No response received.";
    appendMessage(botText, "bot-message");

    // store assistant reply in history
    history.push({ role: "model", parts: [{ text: botText }] });
  } catch (err) {
    typingEl.remove();
    appendMessage("Error: " + String(err.message || err), "bot-message");
    console.error("Chat error:", err);
  }
}

// event listeners
sendBtn.addEventListener("click", () => {
  const txt = userInput.value.trim();
  if (!txt) return;
  userInput.value = "";
  sendMessageToWorker(txt);
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

endBtn.addEventListener("click", () => {
  // clear chat UI and history
  chatBox.innerHTML = "";
  appendMessage(
    "Hello! I am an AI assistant powered by DeepSeek. I can answer questions about administration, project management, and finance. How can I help you today?",
    "bot-message"
  );
  history = [];
});
