function runConfig() {
    showStatus("Starting UFiber configuration...");
    console.log("Config started...");

    // Example steps
    loadConfig();
    applyConfig();
}

function loadConfig() {
    console.log("Loading configuration...");
    showStatus("Loading configuration...");
    // Here you could fetch a JSON config file if needed
}

function applyConfig() {
    console.log("Applying configuration...");
    showStatus("Configuration applied successfully!");
}

function showStatus(message) {
    let statusDiv = document.getElementById("status");
    statusDiv.innerText = message;
}
