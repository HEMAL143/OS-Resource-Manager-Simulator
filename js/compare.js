// ===== GENERATE INPUT =====
function generateCompareInputs() {
    let n = +document.getElementById("cmpN").value;
    let container = document.getElementById("compareInputs");

    if (!n || n < 1 || n > 20) {
        return showCmpError("Enter valid number (1-20)");
    }

    clearCmpError();

    let html = "<table><tr><th>PID</th><th>AT</th><th>BT</th><th>Priority</th></tr>";

    for (let i = 0; i < n; i++) {
        html += `<tr>
            <td>P${i+1}</td>
            <td><input type="number" id="cat${i}"></td>
            <td><input type="number" id="cbt${i}"></td>
            <td><input type="number" id="cpr${i}"></td>
        </tr>`;
    }

    html += "</table>";
    container.innerHTML = html;
}

// ===== VALIDATION =====
function validateCmp(n) {
    for (let i = 0; i < n; i++) {
        let at = document.getElementById(`cat${i}`).value;
        let bt = document.getElementById(`cbt${i}`).value;

        if (at === "" || bt === "") return showCmpError("Fill all fields");
        if (bt <= 0) return showCmpError("Burst must be > 0");
    }

    let q = document.getElementById("cmpQ").value;
    if (!q || q <= 0) return showCmpError("Enter valid quantum");

    clearCmpError();
    return true;
}

// ===== GET DATA =====
function getCmpProcesses(n) {
    let p = [];

    for (let i = 0; i < n; i++) {
        p.push({
            pid: i + 1,
            arrival: +document.getElementById(`cat${i}`).value,
            burst: +document.getElementById(`cbt${i}`).value,
            priority: +document.getElementById(`cpr${i}`).value || 0,
            remaining: 0,
            completion: 0,
            waiting: 0,
            turnaround: 0
        });
    }

    return p;
}

// ===== CLONE =====
function clone(p) {
    return JSON.parse(JSON.stringify(p));
}

// ===== AVERAGE =====
function getAvg(p) {
    let wt = 0, tat = 0;

    p.forEach(x => {
        wt += x.waiting;
        tat += x.turnaround;
    });

    return {
        wt: (wt / p.length).toFixed(2),
        tat: (tat / p.length).toFixed(2)
    };
}

// ===== RUN =====
function runComparison() {
    let n = +document.getElementById("cmpN").value;
    if (!validateCmp(n)) return;

    let base = getCmpProcesses(n);
    let q = +document.getElementById("cmpQ").value;

    let results = [
        ["FCFS", getAvg(FCFS_cmp(clone(base)))],
        ["SJF", getAvg(SJF_cmp(clone(base)))],
        ["SRTF", getAvg(SRTF_cmp(clone(base)))],
        ["Priority NP", getAvg(PriorityNP_cmp(clone(base)))],
        ["Priority P", getAvg(PriorityP_cmp(clone(base)))],
        ["Round Robin", getAvg(RR_cmp(clone(base), q))]
    ];

    display(results);
}

// ===== DISPLAY =====
function display(results) {
    let best = results.reduce((a, b) =>
        parseFloat(a[1].wt) < parseFloat(b[1].wt) ? a : b
    );

    let html = "<h3>Result</h3><table>";
    html += "<tr><th>Algorithm</th><th>WT</th><th>TAT</th></tr>";

    results.forEach(r => {
        let highlight = r[0] === best[0] ? "style='background:#d4edda'" : "";

        html += `<tr ${highlight}>
            <td>${r[0]}</td>
            <td>${r[1].wt}</td>
            <td>${r[1].tat}</td>
        </tr>`;
    });

    html += "</table>";
    html += `<p>Best Algorithm: ${best[0]}</p>`;

    document.getElementById("cmpOutput").innerHTML = html;
}

// ===== ERROR =====
function showCmpError(msg) {
    document.getElementById("cmpError").innerText = msg;
}
function clearCmpError() {
    document.getElementById("cmpError").innerText = "";
}
// ===== FCFS =====
function FCFS_cmp(p) {
    p.sort((a,b)=>a.arrival-b.arrival);
    let t=0;

    p.forEach(x=>{
        if(t<x.arrival) t=x.arrival;
        t+=x.burst;
        x.completion=t;
        x.turnaround=t-x.arrival;
        x.waiting=x.turnaround-x.burst;
    });

    return p;
}

// ===== SJF =====
function SJF_cmp(p) {
    let t=0,c=0;

    while(c<p.length){
        let ready=p.filter(x=>x.arrival<=t && x.remaining===0);

        if(ready.length===0){t++;continue;}

        let x=ready.reduce((a,b)=>a.burst<b.burst?a:b);

        t+=x.burst;
        x.remaining=1;
        x.completion=t;
        x.turnaround=t-x.arrival;
        x.waiting=x.turnaround-x.burst;

        c++;
    }

    return p;
}

// ===== SRTF =====
function SRTF_cmp(p){
    p.forEach(x=>x.remaining=x.burst);
    let t=0,c=0;

    while(c<p.length){
        let ready=p.filter(x=>x.arrival<=t && x.remaining>0);

        if(ready.length===0){t++;continue;}

        let x=ready.reduce((a,b)=>a.remaining<b.remaining?a:b);

        x.remaining--;
        t++;

        if(x.remaining===0){
            x.completion=t;
            x.turnaround=t-x.arrival;
            x.waiting=x.turnaround-x.burst;
            c++;
        }
    }

    return p;
}

// ===== PRIORITY NP =====
function PriorityNP_cmp(p){
    let t=0,c=0;

    while(c<p.length){
        let ready=p.filter(x=>x.arrival<=t && x.remaining===0);

        if(ready.length===0){t++;continue;}

        let x=ready.reduce((a,b)=>a.priority<b.priority?a:b);

        t+=x.burst;
        x.remaining=1;
        x.completion=t;
        x.turnaround=t-x.arrival;
        x.waiting=x.turnaround-x.burst;

        c++;
    }

    return p;
}

// ===== PRIORITY P =====
function PriorityP_cmp(p){
    p.forEach(x=>x.remaining=x.burst);
    let t=0,c=0;

    while(c<p.length){
        let ready=p.filter(x=>x.arrival<=t && x.remaining>0);

        if(ready.length===0){t++;continue;}

        let x=ready.reduce((a,b)=>a.priority<b.priority?a:b);

        x.remaining--;
        t++;

        if(x.remaining===0){
            x.completion=t;
            x.turnaround=t-x.arrival;
            x.waiting=x.turnaround-x.burst;
            c++;
        }
    }

    return p;
}

// ===== ROUND ROBIN =====
function RR_cmp(p,q){
    p.forEach(x=>x.remaining=x.burst);

    let t=0,queue=[],i=0,c=0;
    p.sort((a,b)=>a.arrival-b.arrival);

    while(c<p.length){
        while(i<p.length && p[i].arrival<=t){
            queue.push(p[i++]);
        }

        if(queue.length===0){t++;continue;}

        let x=queue.shift();
        let exec=Math.min(q,x.remaining);

        t+=exec;
        x.remaining-=exec;

        while(i<p.length && p[i].arrival<=t){
            queue.push(p[i++]);
        }

        if(x.remaining>0) queue.push(x);
        else{
            x.completion=t;
            x.turnaround=t-x.arrival;
            x.waiting=x.turnaround-x.burst;
            c++;
        }
    }

    return p;
}