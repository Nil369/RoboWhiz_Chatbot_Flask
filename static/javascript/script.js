const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");


let userMessage = null; // Variable to store user's message
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

const fetchIntents = (promptGiven) => {
    // Check if there are intents in the database
    if (promptGiven) {
        fetch(`/get_intents?prompt_given=${promptGiven}`)
            .then(response => response.json())
            .then(intents => {
                // Display fetched intents in the chatbox
                intents.forEach(intent => {
                    const incomingChatLi = createChatLi(intent.desc, "incoming");
                    chatbox.appendChild(incomingChatLi);
                });
                chatbox.scrollTo(0, chatbox.scrollHeight);
            })
            .catch(error => console.error('Error fetching intents:', error));
    }
}

// Call the function with prompt_given status when the page loads
window.addEventListener('load', () => fetchIntents(false));


const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    const intentsExist = document.querySelector(".chatbox .incoming");
    if (!intentsExist) {
        // If there are no intents, proceed with the API call
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

        }
   

   
    const isUserMessageInDatabase = checkUserMessageInDatabase(userMessage);
    if (isUserMessageInDatabase) {
        
        fetchIntents(true);
        
   
    }else{
        fetchIntents(false);
    } 
    
    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        messageElement.textContent = data.choices[0].message.content.trim();

    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    

}

// const checkUserMessageInDatabase = async (userMessage) => {
//     try {
//         const response = await fetch('/get_intents');
//         const intents = await response.json();

//         // Check if the userMessage exists in the database
//         const isUserMessageInDatabase = intents.some(intent => intent.desc.toLowerCase() === userMessage.toLowerCase());

//         return isUserMessageInDatabase;
//     } catch (error) {
//         console.error('Error checking user message in database:', error);
//         return false; // Assume not in the database in case of an error
//     }
// }

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Analysing...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
        fetchIntents(true);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));





// const apiKey = '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';
        
