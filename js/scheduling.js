// ===== HANDLE ALGO CHANGE =====
function handleAlgoChange() {
    let algo = document.getElementById("algo").value;

    document.getElementById("quantumDiv").style.display =
        (algo === "RR") ? "block" : "none";

    document.getElementById("processInputs").innerHTML = "";
    document.getElementById("output").innerHTML = "";
}

// ===== GENERATE INPUT TABLE =====
function generateInputs() {
    const n = parseInt(document.getElementById("numProcesses").value);
    const algo = document.getElementById("algo").value;

    if (!algo) return showError("Select algorithm first");
    if (!n || n < 1 || n > 20) return showError("Enter valid number (1-20)");

    clearError();

    let showPriority = (algo === "PriorityNP" || algo === "PriorityP");

    let html = `<table>
        <tr>
            <th>PID</th>
            <th>Arrival</th>
            <th>Burst</th>
            ${showPriority ? "<th>Priority</th>" : ""}
        </tr>`;

    for (let i = 0; i < n; i++) {
        html += `<tr>
            <td>P${i+1}</td>
            <td><input type="number" id="at${i}" min="0"></td>
            <td><input type="number" id="bt${i}" min="1"></td>
            ${showPriority ? `<td><input type="number" id="pr${i}" min="0"></td>` : ""}
        </tr>`;
    }

    html += "</table>";
    document.getElementById("processInputs").innerHTML = html;
}

// ===== VALIDATION =====
function validateInputs(n, algo) {
    for (let i = 0; i < n; i++) {
        let at = document.getElementById(`at${i}`).value;
        let bt = document.getElementById(`bt${i}`).value;

        if (at === "" || bt === "") return showError("Fill all fields");
        if (bt <= 0) return showError("Burst must be > 0");
    }

    if (algo === "RR") {
        let q = document.getElementById("quantum").value;
        if (!q || q <= 0) return showError("Invalid quantum");
    }

    clearError();
    return true;
}

// ===== GET DATA =====
function getProcesses(n) {
    let p = [];

    for (let i = 0; i < n; i++) {
        let prInput = document.getElementById(`pr${i}`);

        p.push({
            pid: i + 1,
            arrival: +document.getElementById(`at${i}`).value,
            burst: +document.getElementById(`bt${i}`).value,
            priority: prInput ? +prInput.value || 0 : 0,
            remaining: +document.getElementById(`bt${i}`).value,
            completion: 0,
            waiting: 0,
            turnaround: 0
        });
    }

    return p;
}

// ===== RUN =====
function runScheduling() {
    let n = +document.getElementById("numProcesses").value;
    let algo = document.getElementById("algo").value;

    if (!validateInputs(n, algo)) return;

    let p = getProcesses(n);

    if (algo === "FCFS") FCFS(p);
    else if (algo === "SJF") SJF(p);
    else if (algo === "SRTF") SRTF(p);
    else if (algo === "PriorityNP") PriorityNP(p);
    else if (algo === "PriorityP") PriorityP(p);
    else if (algo === "RR") {
        let q = +document.getElementById("quantum").value;
        RoundRobin(p, q);
    }
}

// ===== ALGORITHMS (UNCHANGED LOGIC) =====
// keep your existing FCFS, SJF, SRTF, Priority, RR functions SAME

// ===== OUTPUT =====
function displayOutput(p, gantt) {
    let html = "<h3>Result</h3><table>";
    html += "<tr><th>PID</th><th>AT</th><th>BT</th><th>CT</th><th>WT</th><th>TAT</th></tr>";

    let wt = 0, tat = 0;

    p.forEach(x => {
        html += `<tr>
            <td>P${x.pid}</td>
            <td>${x.arrival}</td>
            <td>${x.burst}</td>
            <td>${x.completion}</td>
            <td>${x.waiting}</td>
            <td>${x.turnaround}</td>
        </tr>`;

        wt += x.waiting;
        tat += x.turnaround;
    });

    html += "</table>";

    html += `<p>Avg WT: ${(wt/p.length).toFixed(2)}</p>`;
    html += `<p>Avg TAT: ${(tat/p.length).toFixed(2)}</p>`;

    html += "<h3>Gantt</h3><div class='gantt'>";
    gantt.forEach(pid => html += `<div class='block'>P${pid}</div>`);
    html += "</div>";

    document.getElementById("output").innerHTML = html;
}

// ===== ERROR =====
function showError(msg) {
    document.getElementById("error").innerText = msg;
}
function clearError() {
    document.getElementById("error").innerText = "";
}

// ===== FCFS =====
function FCFS(p) {
    p.sort((a, b) => a.arrival - b.arrival);
    let time = 0, gantt = [];

    p.forEach(proc => {
        if (time < proc.arrival) time = proc.arrival;

        gantt.push(proc.pid);
        time += proc.burst;

        proc.completion = time;
        proc.turnaround = time - proc.arrival;
        proc.waiting = proc.turnaround - proc.burst;
    });

    displayOutput(p, gantt);
}

// ===== SJF =====
function SJF(p) {
    let time = 0, done = 0, gantt = [];

    while (done < p.length) {
        let ready = p.filter(x => x.arrival <= time && x.remaining > 0);

        if (ready.length === 0) {
            time++;
            continue;
        }

        let proc = ready.reduce((a, b) => a.burst < b.burst ? a : b);

        gantt.push(proc.pid);
        time += proc.burst;

        proc.remaining = 0;
        proc.completion = time;
        proc.turnaround = time - proc.arrival;
        proc.waiting = proc.turnaround - proc.burst;

        done++;
    }

    displayOutput(p, gantt);
}

// ===== SRTF =====
function SRTF(p) {
    let time = 0, done = 0, gantt = [];

    while (done < p.length) {
        let ready = p.filter(x => x.arrival <= time && x.remaining > 0);

        if (ready.length === 0) {
            time++;
            continue;
        }

        let proc = ready.reduce((a, b) => a.remaining < b.remaining ? a : b);

        gantt.push(proc.pid);
        proc.remaining--;
        time++;

        if (proc.remaining === 0) {
            proc.completion = time;
            proc.turnaround = time - proc.arrival;
            proc.waiting = proc.turnaround - proc.burst;
            done++;
        }
    }

    displayOutput(p, gantt);
}

// ===== PRIORITY NP =====
function PriorityNP(p) {
    let time = 0, done = 0, gantt = [];

    while (done < p.length) {
        let ready = p.filter(x => x.arrival <= time && x.remaining > 0);

        if (ready.length === 0) {
            time++;
            continue;
        }

        let proc = ready.reduce((a, b) => a.priority < b.priority ? a : b);

        gantt.push(proc.pid);
        time += proc.burst;

        proc.remaining = 0;
        proc.completion = time;
        proc.turnaround = time - proc.arrival;
        proc.waiting = proc.turnaround - proc.burst;

        done++;
    }

    displayOutput(p, gantt);
}

// ===== PRIORITY P =====
function PriorityP(p) {
    let time = 0, done = 0, gantt = [];

    while (done < p.length) {
        let ready = p.filter(x => x.arrival <= time && x.remaining > 0);

        if (ready.length === 0) {
            time++;
            continue;
        }

        let proc = ready.reduce((a, b) => a.priority < b.priority ? a : b);

        gantt.push(proc.pid);
        proc.remaining--;
        time++;

        if (proc.remaining === 0) {
            proc.completion = time;
            proc.turnaround = time - proc.arrival;
            proc.waiting = proc.turnaround - proc.burst;
            done++;
        }
    }

    displayOutput(p, gantt);
}

// ===== ROUND ROBIN =====
function RoundRobin(p, q) {
    let time = 0, queue = [], gantt = [];
    p.sort((a, b) => a.arrival - b.arrival);

    let i = 0, done = 0;

    while (done < p.length) {
        while (i < p.length && p[i].arrival <= time) {
            queue.push(p[i]);
            i++;
        }

        if (queue.length === 0) {
            time++;
            continue;
        }

        let proc = queue.shift();
        let exec = Math.min(q, proc.remaining);

        gantt.push(proc.pid);

        time += exec;
        proc.remaining -= exec;

        while (i < p.length && p[i].arrival <= time) {
            queue.push(p[i]);
            i++;
        }

        if (proc.remaining > 0) {
            queue.push(proc);
        } else {
            proc.completion = time;
            proc.turnaround = time - proc.arrival;
            proc.waiting = proc.turnaround - proc.burst;
            done++;
        }
    }

    displayOutput(p, gantt);
}