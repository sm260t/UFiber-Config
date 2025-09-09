console.log("JS file loaded");

let originalJSONText = "";
let currentConfig = [];

const fieldMap = {
    "ONU_Name": ["name"],
    "ONU_Serial": ["serial"],
    "PPPoE_Username": ["routerMode", "pppoeUser"],
    "PPPoE_Password": ["routerMode", "pppoePassword"],
    "WiFi_2.4_SSID": ["wifi", "networks", 0, "ssid"],
    "WiFi_2.4_Password": ["wifi", "networks", 0, "key"],
    "WiFi_5_SSID": ["wifi5g", "networks", 0, "ssid"],
    "WiFi_5_Password": ["wifi5g", "networks", 0, "key"]
};

const fieldGroups = {
    "ONU Info": ["ONU_Name", "ONU_Serial"],
    "PPPoE Credentials": ["PPPoE_Username", "PPPoE_Password"],
    "Wi-Fi Settings": ["WiFi_2.4_SSID", "WiFi_2.4_Password", "WiFi_5_SSID", "WiFi_5_Password"]
};

const fieldsToPrompt = Object.values(fieldGroups).flat();

// Helpers
function getNestedValue(obj, path) {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj);
}

function setNestedValue(obj, path, value) {
    let target = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (!(path[i] in target)) target[path[i]] = {};
        target = target[path[i]];
    }
    target[path[path.length - 1]] = value;
}

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

            if (!Array.isArray(currentConfig) || !currentConfig[0]) {
                throw new Error("Config must be an array with one object");
            }

            statusDiv.innerText = "Config loaded successfully!";
            generateForm(currentConfig[0]);
            document.getElementById("downloadBtn").style.display = "inline-block";
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

// Generate grouped collapsible form
function generateForm(configObj) {
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
            input.value = getNestedValue(configObj, fieldMap[key]);
            input.id = "input_" + key;

            const validationMsg = document.createElement("span");
            validationMsg.id = "error_" + key;
            validationMsg.style.color = "red";
            validationMsg.style.fontSize = "0.9em";
            validationMsg.style.display = "block";
            validationMsg.style.marginBottom = "5px";

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

// Validate entire form
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

// Update preview card grouped by sections
function updatePreviewCard() {
    const previewDiv = document.getElementById("previewCard");
    previewDiv.innerHTML = "<h3>Preview Summary</h3>";

    for (const [groupName, keys] of Object.entries(fieldGroups)) {
        const groupHeader = document.createElement("h4");
        groupHeader.innerText = groupName;
        previewDiv.appendChild(groupHeader);

        const table = document.createElement("table");

        keys.forEach(key => {
            const input = document.getElementById("input_" + key);
            const row = document.createElement("tr");

            const cellKey = document.createElement("td");
            cellKey.innerText = key.replace(/_/g, " ");

            const cellValue = document.createElement("td");
            cellValue.innerText = input ? input.value : "";

            row.appendChild(cellKey);
            row.appendChild(cellValue);
            table.appendChild(row);
        });

        previewDiv.appendChild(table);
    }
}

// Download updated JSON
function downloadUpdatedConfig() {
    validateForm();
    if (document.getElementById("downloadBtn").disabled) {
        alert("Please fix errors before downloading.");
        return;
    }

    let configObj = currentConfig[0];

    // Write values back into nested object
    fieldsToPrompt.forEach(key => {
        const input = document.getElementById("input_" + key);
        if (input) {
            setNestedValue(configObj, fieldMap[key], input.value);
        }
    });

    // Export array with object inside
    const updatedJSONText = JSON.stringify([configObj], null, 4);

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(updatedJSONText);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "updated_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
