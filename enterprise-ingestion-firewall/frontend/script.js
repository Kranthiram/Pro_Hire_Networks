const API_URL = "http://127.0.0.1:8000";

let sessionId = null;

const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");

const chatArea = document.getElementById("chatArea");
const emptyState = document.getElementById("emptyState");

const chatTitle = document.getElementById("chatTitle");
const newChatButton = document.getElementById("newChat");

const suggestionButtons = document.querySelectorAll(".suggestion");


/*SUGGESTED PROMPTS*/
suggestionButtons.forEach((button) => {

  button.addEventListener("click", () => {

    messageInput.value = button.dataset.message;

    autoResize();

    messageInput.focus();

  });

});


/*NEW CHAT */
newChatButton.addEventListener("click", () => {

  chatArea.innerHTML = "";

  chatArea.appendChild(emptyState);

  emptyState.style.display = "flex";

  chatTitle.textContent = "New Chat";

  messageInput.value = "";

  sessionId = null;

  autoResize();

  messageInput.focus();

});


/* TEXTAREA AUTO RESIZE */
messageInput.addEventListener("input", autoResize);

function autoResize() {

  messageInput.style.height = "auto";

  messageInput.style.height =
    Math.min(messageInput.scrollHeight, 130) + "px";

}


/*ENTER TO SEND*/
messageInput.addEventListener("keydown", (event) => {

  if (event.key === "Enter" && !event.shiftKey) {

    event.preventDefault();

    sendMessage();

  }

});


/*SEND BUTTON*/
sendButton.addEventListener("click", sendMessage);


/*SEND MESSAGE*/
async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) {

    messageInput.focus();

    return;

  }

  /* Remove welcome screen */
  if (emptyState.parentElement === chatArea) {

    emptyState.remove();

  }

  /* Update chat title */
  chatTitle.textContent = message.length > 40
    ? message.substring(0, 40) + "..."
    : message;

  /* Show user message */
  addUserMessage(message);

  /* Clear input */
  messageInput.value = "";

  autoResize();


  /* Disable send button */
  sendButton.disabled = true;
  sendButton.textContent = "...";


  /* Show loading */
  const loadingMessage = addLoadingMessage();

  try {

    const response = await fetch(`${API_URL}/api/analyze`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message,
        session_id: sessionId
      })

    });


    const data = await response.json();


    /* Remove loading */
    loadingMessage.remove();


    if (!response.ok) {

      const errorMessage =
        typeof data.detail === "string"
          ? data.detail
          : "The request could not be completed.";

      addErrorMessage(errorMessage);

      return;

    }


    /* Store session ID returned by backend */
    if (data.session_id) {

      sessionId = data.session_id;

    }


    /* Render AI response */
    addAssistantMessage(data);


  } catch (error) {

    loadingMessage.remove();

    addErrorMessage(
      "Could not connect to the backend. Please make sure the FastAPI server is running."
    );

  } finally {

    sendButton.disabled = false;

    sendButton.textContent = "Send";

    messageInput.focus();

  }

}


/* USER MESSAGE*/

function addUserMessage(message) {

  const wrapper = document.createElement("div");

  wrapper.className = "user-message";
  const bubble = document.createElement("div");
  bubble.className = "user-bubble";
  bubble.textContent = message;

  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);
  scrollToBottom();

}


/*LOADING MESSAGE*/
function addLoadingMessage() {
  const wrapper = document.createElement("div");
  wrapper.className = "assistant-message";
  wrapper.innerHTML = `
    <div class="assistant-label">
      AI Assistant
    </div>

    <div class="markdown">
      Thinking...
    </div>
  `;

  chatArea.appendChild(wrapper);
  scrollToBottom();
  return wrapper;

}


/* ASSISTANT RESPONSE*/
function addAssistantMessage(data) {
  const wrapper = document.createElement("div");
  wrapper.className = "assistant-message";


  /* Assistant label */
  const label = document.createElement("div");
  label.className = "assistant-label";
  label.textContent = "AI Assistant";


  /* Markdown response */
  const response = document.createElement("div");
  response.className = "markdown";


  const markdownText =
   data.response_markdown || "No response was generated.";

  wrapper.appendChild(label);
  wrapper.appendChild(response);
  chatArea.appendChild(wrapper);



  typeMarkdown(response, markdownText);

}


/*MARKDOWN TYPE EFFECT*/
function typeMarkdown(element, markdownText) {
  let index = 0;
  const charactersPerStep = 2;
  const speed = 10;


  function typeNext() {
    if (index < markdownText.length) {
      index += charactersPerStep;
      const visibleText =
        markdownText.substring(0, index);
      element.innerHTML =
        marked.parse(visibleText);

      scrollToBottom();
      setTimeout(typeNext, speed);
    } else {

      /* Final clean render */
      element.innerHTML =
        marked.parse(markdownText);
      scrollToBottom();
    }

  }
  typeNext();

}


/* ERROR MESSAGE*/
function addErrorMessage(message) {

  const wrapper = document.createElement("div");
  wrapper.className = "assistant-message";
  const label = document.createElement("div");
  label.className = "assistant-label";
  label.textContent = "AI Assistant";


  const error = document.createElement("div");
  error.className = "markdown";
  error.textContent = message;

  wrapper.appendChild(label);
  wrapper.appendChild(error);
  chatArea.appendChild(wrapper);
  scrollToBottom();

}


/* SCROLL CHAT */
function scrollToBottom() {

  chatArea.scrollTo({
    top: chatArea.scrollHeight,
    behavior: "smooth"
  });

}