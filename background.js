chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isAIEnabled: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mesaj alındı:", message);
    if (message.action === "getAIStatus") {
        chrome.storage.local.get("isAIEnabled", (data) => {
            console.log("Durum döndürülüyor:", data.isAIEnabled);
            sendResponse({ status: data.isAIEnabled });
        });
        return true; // Asenkron işlem için true gerekli
    }

    if (message.action === "toggleAI") {
        console.log("Durum güncelleniyor:", message.enabled);
        chrome.storage.local.set({ isAIEnabled: message.enabled }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});
