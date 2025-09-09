console.log("JS file loaded"); // test that it runs

function runConfig() {
    const statusDiv = document.getElementById("status") || (() => {
        let div = document.createElement("div");
        div.id = "status";
        document.body.appendChild(div);
        return div;
    })();

    statusDiv.innerHTML = ""; // clear previous status

    let steps = [
        "Starting UFiber configuration...",
        "Loading configuration...",
        "Applying configuration...",
        "Configuration applied successfully!"
    ];

    steps.forEach(step => {
        let p = document.createElement("p");
        p.innerText = step;
        statusDiv.appendChild(p);
        console.log(step);
    });
}
