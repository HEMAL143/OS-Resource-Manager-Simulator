// ===== CREATE PROCESS =====
function createProcess(pid, arrival, burst, priority = 0) {
    return {
        pid,
        arrival,
        burst,
        priority,
        remaining: burst,
        completion: 0,
        waiting: 0,
        turnaround: 0
    };
}

// ===== CALCULATE AVERAGES =====
function calculateAverages(p) {
    let wt = 0, tat = 0;

    p.forEach(x => {
        wt += x.waiting;
        tat += x.turnaround;
    });

    return {
        avgWT: (wt / p.length).toFixed(2),
        avgTAT: (tat / p.length).toFixed(2)
    };
}

// ===== CLEAR OUTPUT =====
function clearOutput(id) {
    document.getElementById(id).innerHTML = "";
}