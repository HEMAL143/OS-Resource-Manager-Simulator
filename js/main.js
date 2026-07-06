// ===== LOAD PAGE =====
function loadPage(page) {
    let content = document.getElementById("content");

    fetch(`components/${page}.html`)
        .then(res => res.text())
        .then(data => {
            content.innerHTML = data;
            loadScript(page);
        })
        .catch(() => {
            content.innerHTML = "<h2>Error loading page</h2>";
        });
}

// ===== LOAD SCRIPT =====
function loadScript(page) {
    let old = document.getElementById("dynamic-script");
    if (old) old.remove();

    let script = document.createElement("script");
    script.id = "dynamic-script";

    if (page === "scheduling") script.src = "js/scheduling.js";
    else if (page === "page") script.src = "js/page.js";
    else if (page === "compare") script.src = "js/compare.js";

    document.body.appendChild(script);
}