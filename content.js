let lastMessageText = "";
let isAIEnabled = true;
let messageCheckerInterval = null;

function updateAIStatus() {
    chrome.runtime.sendMessage({ action: "getAIStatus" }, (response) => {
        if (response && response.status !== undefined) {
            const previousState = isAIEnabled;
            isAIEnabled = response.status;
            console.log("AI durumu alındı:", isAIEnabled ? "Açık" : "Kapalı");

            if (previousState !== isAIEnabled) {
                manageMessageChecker();
            }
        } else {
            console.error("AI durumu alınamadı!");
        }
    });
}

function FindLastMessage() {
    if (!isAIEnabled){
        console.log("ai kapalı")
        return;
    } 

    const AllMessages = document.querySelectorAll('.message-in .copyable-text');
    if (AllMessages.length > 0) {
        const LastMessage = AllMessages[AllMessages.length - 1];
        const messageText = LastMessage.innerText;

        if (messageText !== lastMessageText) {
            console.log("New Message: ", messageText);
            lastMessageText = messageText;
            SendMessageToLLM(messageText);
            return messageText;
        }
    }
}

function SendMessageToLLM(MessageToPrompt) {
    let PromptText = `**Görev:** Aşağıda verilen mesajın içeriğini analiz et ve belirlenen kriterlere göre değerlendir. 
    Mesajda aşağıdaki türden içerikler olup olmadığını kontrol et: 1. **Küfür veya Argo İfadeler:** 
    Toplumda genel olarak kaba veya rahatsız edici olarak kabul edilen kelimeler ve ifadeler. 2. **Hakaret veya Kötüleme:** 
    Kişileri veya grupları hedef alarak aşağılayan, küçümseyen veya onur kırıcı ifadeler. 3. **Kötü Anlam Taşıyan Kısaltmalar:** 
    Kötü veya uygunsuz ifadeleri gizlemek amacıyla kullanılan kısaltmalar (örneğin: "salak" yerine "slk"). 4. **Kötü Kelimeleri Gizleme:** 
    Kötü veya uygunsuz kelimeleri farklı yazım şekilleriyle gizleme girişimleri (örneğin: "k4lem", "k*lem", "kalem." gibi). 
    Mesajda yukarıdaki içeriklerden herhangi biri bulunuyorsa **"YES"**, hiçbir kötü içerik bulunmuyorsa **"NO"** yaz. 
    YES yada NO haricinde hiç bir şey yazma. **Mesaj:** ` + MessageToPrompt;

    const requestData = {
        model: "meta-llama/Llama-3-70b-chat-hf",
        messages: [
            { role: "user", content: PromptText }
        ]
    };

    console.log("Prompt: " + PromptText);

    fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer <api key>",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Response:", data);
            let answer = data.choices[0].message.content;
            console.log("Response: ", answer);
            IsMessageReallyBad(answer);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function IsMessageReallyBad(SusMessage) {
    if (SusMessage.includes("NO")) {
        console.log("Afferin oluşuma kötü söz söylemek yok tamam mı :)");
    } else if (SusMessage.includes("YES")) {
        console.log("Kötü mesajlar atmayınız :<");
    } else {
        console.log("Ne yazdıysan artık else'e girdi");
    }
}

function manageMessageChecker() {
    if (isAIEnabled && !messageCheckerInterval) {
        console.log("Mesaj kontrolü başlatılıyor...");
        messageCheckerInterval = setInterval(FindLastMessage, 100);
    } else if (!isAIEnabled && messageCheckerInterval) {
        console.log("Mesaj kontrolü durduruluyor...");
        clearInterval(messageCheckerInterval);
        messageCheckerInterval = null;
    }
}

setInterval(updateAIStatus, 1000);

updateAIStatus();
