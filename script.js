document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.querySelector("#chat-input");
    const sendButton = document.querySelector("#send-btn");
    const chatContainer = document.querySelector(".chat-container");
    const themeButton = document.querySelector("#theme-btn");
    const deleteButton = document.querySelector("#delete-btn");

    let userText = "";
    const API_KEY = "AIzaSyCcrhToCU-rhbppWsW6yLiyxBNdW2p5d34";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // Load chat history & theme from local storage
    const loadDataFromLocalStorage = () => {
        const themeColor = localStorage.getItem("themeColor");
        document.body.classList.toggle("light-mode", themeColor === "light_mode");
        themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

        chatContainer.innerHTML = localStorage.getItem("all-chats") || `
            <div class="default-text">
                <h1>Welcome! How Can I Assist You Today?</h1>
                <p>Start a conversation and explore the power of Nova AI Created By Usman Munir.<br> Your chat history will be displayed here.</p>
            </div>`;
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    };

    // Function to create a chat message element
    const createChatElement = (content, className) => {
        const chatDiv = document.createElement("div");
        chatDiv.classList.add("chat", className);
        chatDiv.innerHTML = content;
        return chatDiv;
    };

    // Fetch response from Gemini API
    const getChatResponse = async (incomingChatDiv) => {
        const textElement = document.createElement("p");

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userText }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 10000 }
            })
        };

        try {
            const response = await fetch(API_URL, requestOptions);
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);

            const data = await response.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                textElement.textContent = data.candidates[0].content.parts[0].text.trim();
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("API Error:", error);
            textElement.classList.add("error");
            textElement.textContent = "Oops! Something went wrong. Please try again.";
        }

        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").appendChild(textElement);
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    };

    // Copy response to clipboard
    const copyResponse = (copyBtn) => {
        const responseTextElement = copyBtn.parentElement.querySelector("p");
        navigator.clipboard.writeText(responseTextElement.textContent);
        copyBtn.textContent = "done";
        setTimeout(() => copyBtn.textContent = "content_copy", 1000);
    };

    // Show typing animation before bot response
    const showTypingAnimation = () => {
        const typingHTML = `
            <div class="chat-content">
                <div class="chat-details">
                    <img src="https://blog.ulawpractice.com/content/images/2023/09/chatgpt-logo-png-1-1.png" alt="chatbot-img">
                    <div class="typing-animation">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
            </div>`;

        const incomingChatDiv = createChatElement(typingHTML, "incoming");
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    };

    // Handle user message submission
    const handleOutgoingChat = () => {
        userText = chatInput.value.trim();
        if (!userText) return;

        chatInput.value = "";
        chatInput.style.height = "auto";

        const outgoingHTML = `
            <div class="chat-content">
                <div class="chat-details">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpbjKZv1uOSkqL-3YJoLBj1scgdvVYi9UG3A&s" alt="user-img">
                    <p>${userText}</p>
                </div>
            </div>`;

        const outgoingChatDiv = createChatElement(outgoingHTML, "outgoing");
        chatContainer.querySelector(".default-text")?.remove();
        chatContainer.appendChild(outgoingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

        setTimeout(showTypingAnimation, 500);
    };
// Event listeners
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all chats?")) {
        localStorage.clear();
        chatContainer.innerHTML = "";
        loadDataFromLocalStorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const themeMode = document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode";
    localStorage.setItem("themeColor", themeMode);
    themeButton.innerText = themeMode;
});

// Prevent textarea from expanding
chatInput.style.overflow = "hidden";  // Prevent scrolling expansion
chatInput.style.height = "55px";      // Set a fixed height

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
        
        // Reset textarea height after sending message
        chatInput.style.height = "55px"; 
    }
});

sendButton.addEventListener("click", () => {
    handleOutgoingChat();
    
    // Reset textarea height after sending message
    chatInput.style.height = "55px"; 
});

    // Initialize chat history and theme
    loadDataFromLocalStorage();
});
