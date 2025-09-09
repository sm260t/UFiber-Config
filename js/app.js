console.log("JS file loaded");

let originalJSONText = "";
let currentConfig = {};

const fieldGroups = {
    "ONU Info": ["ONU_Name", "ONU_Serial"],
    "PPPoE Credentials": ["PPPoE_Username", "PPPoE_Password"],
    "Wi-Fi Settings": ["WiFi_2.4_SSID", "WiFi_2.4_Password", "WiFi_5_SSID", "WiFi_5_Password"]
};

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
            originalJSONText = e.target.result;
            currentConfig = JSON.parse(originalJSONText);

            fieldsToPrompt.forEach(key => {
                if (!(key in currentConfig)) currentConfig[key] = "";
            });

            statusDiv.innerText = "Config loaded successfully!";
            generateForm(currentConfig);
            document.getElementById("downloadBtn").style.display = "inline-block";

            // Show preview card
            document.getElementById("previewCard").style.display = "block";
            updatePreviewCard();

            validateForm();
        } catch (err) {
            statusDiv.innerText = "Error parsing JSON: " + err.message;
            console.error(err);
        }
    };

    reader.readAsText(file);
}

// Generate grouped collapsible form with validation messages
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

            // Validation message span
            const validationMsg = document.createElement("span");
            validationMsg.id = "error_" + key;
            validationMsg.style.color = "red";
            validationMsg.style.fontSize = "0.9em";
            validationMsg.style.display = "block";
            validationMsg.style.marginBottom = "5px";

            // Validate and update preview on input
            input.addEventListener("input", () => {
                validateField(key);
                updatePreviewCard();
            });

            groupDiv.appendChild(label);
            groupDiv.appendChild(input);
            groupDiv.appendChild(validationMsg);
        });

        formDiv.appendChild(groupDiv);
    }
}

// Validate a single field
function validateField(key) {
    const input = document.getElementById("input_" + key);
    const errorMsg = document.getElementById("error_" + key);

    let isValid = true;

    if (!input.value.trim()) {
        errorMsg.innerText = "This field cannot be empty.";
        isValid = false;
    } else if (key.includes("SSID") && input.value.length > 32) {
        errorMsg.innerText = "SSID cannot exceed 32 characters.";
        isValid = false;
    } else {
        errorMsg.innerText = "";
    }

    if (!isValid) {
        input.classList.add("invalid");
    } else {
        input.classList.remove("invalid");
    }

    validateForm();
}

// Validate entire form and enable/disable download
function validateForm() {
    let allValid = true;
    fieldsToPrompt.forEach(key => {
        const input = document.getElementById("input_" + key);
        const errorMsg = document.getElementById("error_" + key);
        if ((errorMsg && errorMsg.innerText) || input.classList.contains("invalid")) {
            allValid = false;
        }
    });

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.disabled = !allValid;
}

// Update preview card with current values
function updatePreviewCard() {
    const previewDiv = document.getElementById("previewCard");
    previewDiv.innerHTML = "<h3>Preview Summary</h3>";

    const table = document.createElement("table");

    fieldsToPrompt.forEach(key => {
        const input = document.getElementById("input_" + key);
        const row = document.createElement("tr");

        const cellKey = document.createElement("td");
        cellKey.innerText = key.replace(/_/g, " ");
        const cellValue = document.createElement("td");
        cellValue.innerText = input.value;

        row.appendChild(cellKey);
        row.appendChild(cellValue);
        table.appendChild(row);
    });

    previewDiv.appendChild(table);
}

// Download updated JSON while preserving formatting
function downloadUpdatedConfig() {
    validateForm();
    if (document.getElementById("downloadBtn").disabled) {
        alert("Please fix errors before downloading.");
        return;
    }

    let updatedJSONText = originalJSONText;

    fieldsToPrompt.forEach(key => {
        const input = document.getElementById("input_" + key);
        if (!input) return;

        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedValue = input.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

        const regex = new RegExp(`("${escapedKey}"\\s*:\\s*)"[^"]*"`, "g");
        updatedJSONText = updatedJSONText.replace(regex, `$1"${escapedValue}"`);
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(updatedJSONText);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "updated_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
