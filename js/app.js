console.log("JS file loaded"); // Confirm JS is loaded

function runConfig() {
    const statusDiv = document.getElementById("status");
    if (!statusDiv) return;

    // Clear previous messages
    statusDiv.innerHTML = "";

    // Steps of UFiber config (placeholder logic)
    const steps = [
        "Starting UFiber configuration...",
        "Loading configuration...",
        "Applying configuration...",
        "Configuration applied successfully!"
    ];

    steps.forEach(step => {
        const p = document.createElement("p");
        p.innerText = step;
        statusDiv.appendChild(p);
        console.log(step);
    });
}
