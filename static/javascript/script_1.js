const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = ''; // Variable to store user's message
const API_KEY = "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"; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const fetchIntents = (userMessage) => {
    fetch(`/get_intents?user_message=${userMessage}`)
        .then(response => response.json())
        .then(intents => {
            if (intents.length > 0) {
                // Display fetched intents in the chatbox
                intents.forEach(intent => {
                    const incomingChatLi = createChatLi(intent.desc, "incoming");
                    chatbox.appendChild(incomingChatLi);
                });
                chatbox.scrollTo(0, chatbox.scrollHeight);
            } else {
                // If no match, proceed with OpenAI API call
                generateResponse();
            }
        })
        .catch(error => console.error('Error fetching intents:', error));
};

// Rest of your JavaScript code...

window.addEventListener('load', () => {
    const lastIncomingMessageElement = chatbox.querySelector('.chat.incoming:last-of-type p');
    const userMessage = lastIncomingMessageElement ? lastIncomingMessageElement.textContent.trim().toLowerCase() : '';
    fetchIntents(userMessage);
});

const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    const keywords = ['keyword1', 'keyword2', 'keyword3']; // Add your keywords here

    // Check if the user's message contains any of the keywords
    const matchFound = keywords.some(keyword => userMessage.toLowerCase().includes(keyword.toLowerCase()));

    if (matchFound) {
        // If a match is found, fetch and display intents from the database
        fetchIntents(keywords.join(',')); // Pass the keywords as a comma-separated string
    } else {
        // If no match is found, proceed with the API call
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            })
        }

        fetch(API_URL, requestOptions)
            .then(res => res.json())
            .then(data => {
                messageElement.textContent = data.choices[0].message.content.trim();
            })
            .catch(() => {
                messageElement.classList.add("error");
                messageElement.textContent = "Oops! Something went wrong. Please try again.";
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Analysing...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 100);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
