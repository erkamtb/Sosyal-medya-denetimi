document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle_button");
    let isAIEnabled = true;

    toggleButton.addEventListener("click", () => {
        isAIEnabled = !isAIEnabled;
        toggleButton.textContent = isAIEnabled ? "Turn Off AI" : "Turn On AI";

        chrome.runtime.sendMessage(
            { action: "toggleAI", enabled: isAIEnabled },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Mesaj gönderilemedi:", chrome.runtime.lastError.message);
                } else {
                    console.log("AI durumu güncellendi:", response);
                }
            }
        );
    });

    // İlk yükleme sırasında durumu kontrol et ve düğme metnini ayarla
    chrome.runtime.sendMessage({ action: "getAIStatus" }, (response) => {
        if (response && response.status !== undefined) {
            isAIEnabled = response.status;
            toggleButton.textContent = isAIEnabled ? "Turn Off AI" : "Turn On AI";
        } else {
            console.error("Durum alınamadı!");
        }
    });
});
