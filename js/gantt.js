// ===== GANTT CHART =====
function renderGantt(gantt) {
    let html = "<div class='gantt'>";

    gantt.forEach(pid => {
        html += `<div class="block">P${pid}</div>`;
    });

    html += "</div>";

    return html;
}