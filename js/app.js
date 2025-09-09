console.log("JS file loaded");

let currentConfig = {}; // Store uploaded JSON

// Fields we want to prompt the user for
const fieldsToPrompt = [
    "ONU_Name",
    "ONU_Serial",
    "PPPoE_Username",
    "PPPoE_Password",
    "WiFi_2.4_SSID",
    "WiFi_2.4_Password",
    "WiFi_5_SSID",
    "WiFi_5_Password"
];

// Load uploaded JSON file
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
            currentConfig = JSON.parse(e.target.result);
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

// Generate input form only for specified fields
function generateForm(config) {
    const formDiv = document.getElementById("configForm");
    formDiv.innerHTML = "";

    fieldsToPrompt.forEach(key => {
        // If the key doesn't exist in JSON, create it as empty string
        if (!(key in config)) config[key] = "";

        const label = document.createElement("label");
        label.innerText = key.replace(/_/g, " ") + ": ";
        label.style.display = "block";

        const input = document.createElement("input");
        input.type = "text";
        input.value = config[key];
        input.id = "input_" + key;
        input.style.width = "300px";

        formDiv.appendChild(label);
        formDiv.appendChild(input);
    });
}

// Download updated JSON
function downloadUpdatedConfig() {
    const updatedConfig = { ...currentConfig }; // copy original JSON

    fieldsToPrompt.forEach(key => {
        const input = document.getElementById("input_" + key);
        if (!input) return;
        updatedConfig[key] = input.value;
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(updatedConfig, null, 4));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "updated_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
