// ===== VALIDATION =====
function validatePageInput() {
    let pages = document.getElementById("pages").value.trim();
    let frames = +document.getElementById("frames").value;
    let algo = document.getElementById("pageAlgo").value;

    if (!pages) return showError("Enter reference string");
    if (!frames || frames <= 0) return showError("Enter valid frames");
    if (!algo) return showError("Select algorithm");

    let arr = pages.split(" ").map(Number);
    if (arr.some(isNaN)) return showError("Invalid input");

    clearError();
    return { arr, frames, algo };
}

// ===== MAIN =====
function runPage() {
    let data = validatePageInput();
    if (!data) return;

    let { arr, frames, algo } = data;

    if (algo === "FIFO") FIFO(arr, frames);
    else if (algo === "LRU") LRU(arr, frames);
    else Optimal(arr, frames);
}

// ===== FIFO =====
function FIFO(pages, f) {
    let frames = Array(f).fill(null);
    let ptr = 0, faults = 0;
    let history = [];

    pages.forEach(p => {
        let hit = frames.includes(p);

        if (!hit) {
            frames[ptr] = p;
            ptr = (ptr + 1) % f;
            faults++;
        }

        history.push({ page: p, frames: [...frames], fault: !hit });
    });

    render(history, faults);
}

// ===== LRU =====
function LRU(pages, f) {
    let frames = [];
    let last = {};
    let faults = 0;
    let history = [];

    pages.forEach((p, i) => {
        let hit = frames.includes(p);

        if (!hit) {
            if (frames.length < f) frames.push(p);
            else {
                let lru = frames.reduce((a, b) =>
                    last[a] < last[b] ? a : b
                );
                frames[frames.indexOf(lru)] = p;
            }
            faults++;
        }

        last[p] = i;
        history.push({ page: p, frames: [...frames], fault: !hit });
    });

    render(history, faults);
}

// ===== OPTIMAL =====
function Optimal(pages, f) {
    let frames = [];
    let faults = 0;
    let history = [];

    pages.forEach((p, i) => {
        let hit = frames.includes(p);

        if (!hit) {
            if (frames.length < f) frames.push(p);
            else {
                let idx = -1, far = -1;

                frames.forEach((x, j) => {
                    let next = pages.slice(i + 1).indexOf(x);
                    if (next === -1) idx = j;
                    else if (next > far) {
                        far = next;
                        idx = j;
                    }
                });

                frames[idx] = p;
            }
            faults++;
        }

        history.push({ page: p, frames: [...frames], fault: !hit });
    });

    render(history, faults);
}

// ===== OUTPUT =====
function render(history, faults) {
    let html = "<h3>Result</h3><table>";

    html += "<tr><th>Page</th>";
    for (let i = 0; i < history[0].frames.length; i++) {
        html += `<th>F${i+1}</th>`;
    }
    html += "<th>Status</th></tr>";

    history.forEach(step => {
        html += `<tr>
            <td>${step.page}</td>`;

        step.frames.forEach(f => {
            html += `<td>${f ?? "-"}</td>`;
        });

        html += `<td>${step.fault ? "Fault" : "Hit"}</td></tr>`;
    });

    html += "</table>";
    html += `<p>Total Page Faults: ${faults}</p>`;

    document.getElementById("pageOutput").innerHTML = html;
}

// ===== ERROR =====
function showError(msg) {
    document.getElementById("pageError").innerText = msg;
}
function clearError() {
    document.getElementById("pageError").innerText = "";
}