console.log("JS file loaded"); // Confirm JS is loaded

// Run when "Run Config" button is clicked
function runConfig() {
    const statusDiv = document.getElementById("status");
    if (!statusDiv) return;

    // Clear previous messages
    statusDiv.innerHTML = "";

    // Step 1: Starting
    addStatus("Starting UFiber configuration...");

    // Step 2: Load JSON config
    fetch("config/example.json")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load config");
            return response.json();
        })
        .then(config => {
            addStatus("Configuration loaded successfully!");
            console.log("Loaded config:", config);

            // Step 3: Apply config (display settings for demo)
            addStatus("Applying configuration...");
            for (const [key, value] of Object.entries(config)) {
                addStatus(`${key}: ${Array.isArray(value) ? value.join(", ") : value}`);
            }

            // Step 4: Finished
            addStatus("Configuration applied successfully!");
        })
        .catch(err => {
            addStatus("Error loading configuration: " + err.message);
            console.error(err);
        });
}

// Helper function to append messages to the page
function addStatus(message) {
    const statusDiv = document.getElementById("status");
    if (!statusDiv) return;

    const p = document.createElement("p");
    p.innerText = message;
    statusDiv.appendChild(p);
    console.log(message);
}
