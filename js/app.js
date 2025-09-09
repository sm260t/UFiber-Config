console.log("JS file loaded");

let originalJSONText = ""; // original uploaded JSON as string
let currentConfig = {}; // editable object

// Fields grouped by section
const fieldGroups = {
    "ONU Info": ["ONU_Name", "ONU_Serial"],
    "PPPoE Credentials": ["PPPoE_Username", "PPPoE_Password"],
    "Wi-Fi Settings": ["WiFi_2.4_SSID", "WiFi_2.4_Password", "WiFi_5_SSID", "WiFi_5_Password"]
};

// Flatten keys
const fieldsToPrompt = Object.values(fieldGroups).flat();

// Load uploaded JSON
function loadUploadedConfig() {
    const fileInput = document.getElementById("jsonUpload");
    const statusDiv = document.getElementById("status");
    const formDiv = document.getElementById("configForm");
    formDiv.innerHTML = "";
    statusDiv.innerHTML = "";

    if (!fileInput.files.length) {
        statusDiv.innerText = "Please select a JSON file.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            originalJSONText = e.target.result; // keep original formatting
            currentConfig = JSON.parse(originalJSONText);

            // Ensure all fields exist
            fieldsToPrompt.forEach(key => {
                if (!(key in currentConfig)) currentConfig[key] = "";
            });

            statusDiv.innerText = "Config loaded successfully!";
            generateForm(currentConfig);
            document.getElementById("downloadBtn").style.display = "inline-block";
        } catch (err) {
            statusDiv.innerText = "Error parsing JSON: " + err.message;
            console.error(err);
        }
    };

    reader.readAsText(file);
}

// Generate grouped collapsible form
function generateForm(config) {
    const formDiv = document.getElementById("configForm");
    formDiv.innerHTML = "";

    for (const [groupName, keys] of Object.entries(fieldGroups)) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "field-group";

        const title = document.createElement("h3");
        title.innerText = groupName;
        title.title = "Click to collapse/expand this section";
        groupDiv.appendChild(title);

        // Collapse toggle
        title.addEventListener("click", () => {
            groupDiv.classList.toggle("collapsed");
        });

        keys.forEach(key => {
            const label = document.createElement("label");
            label.innerText = key.replace(/_/g, " ") + ":";

            const input = document.createElement("input");
            input.type = "text";
            input.value = config[key];
            input.id = "input_" + key;

            groupDiv.appendChild(label);
            groupDiv.appendChild(input);
        });

        formDiv.appendChild(groupDiv);
    }
}

// Download updated JSON while preserving original formatting
function downloadUpdatedConfig() {
    let updatedJSONText = originalJSONText;

    fieldsToPrompt.forEach(key => {
        const input = document.getElementById("input_" + key);
        if (!input) return;

        // Escape quotes for regex repla
