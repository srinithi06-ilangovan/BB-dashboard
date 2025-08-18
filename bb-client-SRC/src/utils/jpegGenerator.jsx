//A1
// jpegGenerator.jsx
import html2canvas from "html2canvas";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
// Register Chart.js plugins
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);
// Helper to download canvas as JPEG
const downloadCanvasAsJPEG = (canvas, filename) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg', 1.0);
    link.download = filename;
    link.click();
};
// Helper to create delay before next task
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const generateJPEG = async (excelData, ticketData) => {
    if (!excelData.length || !ticketData.length) {
        alert("No data available to generate images!");
        return;
    }
    // ===== Step 1: Generate Summary Data Report JPEG =====
    // (unchanged from previous, using dynamic counts)
    const summaryContainer = document.createElement("div");
    summaryContainer.style.position = "fixed";
    summaryContainer.style.top = "-10000px";
    summaryContainer.style.left = "-10000px";
    summaryContainer.style.background = "#fff";
    summaryContainer.style.padding = "20px";
    summaryContainer.style.width = "600px";
    summaryContainer.style.boxSizing = "border-box";
    const summaryTitle = document.createElement("h3");
    summaryTitle.innerText = "Summary Data";
    summaryContainer.appendChild(summaryTitle);
    const counts = {};
    let totalStories = 0;
    excelData.forEach(row => {
        const status = (row["Status"] || "Unknown").trim();
        if (!counts[status]) counts[status] = 0;
        counts[status]++;
        totalStories++;
    });
    const summaryTable = document.createElement("table");
    summaryTable.style.width = "100%";
    summaryTable.style.borderCollapse = "collapse";
    summaryTable.style.fontSize = "14px";
    summaryTable.style.color = "black";
    summaryTable.border = "1";
    summaryTable.innerHTML = `
<thead>
<tr>
<th style="padding:8px; text-align:center;">Status</th>
<th style="padding:8px; text-align:center;">Stories</th>
</tr>
</thead>
`;
    const summaryBody = document.createElement("tbody");
    Object.entries(counts).forEach(([status, count]) => {
        const tr = document.createElement("tr");
        tr.style.height = "40px";
        tr.innerHTML = `
<td style="padding:6px; text-align:center;">${status}</td>
<td style="padding:6px; text-align:center;">${count}</td>
`;
        summaryBody.appendChild(tr);
    });
    const totalTr = document.createElement("tr");
    totalTr.style.height = "42px";
    totalTr.innerHTML = `
<td style="padding:6px; text-align:center; font-weight:bold;">Total</td>
<td style="padding:6px; text-align:center; font-weight:bold;">${totalStories}</td>
`;
    summaryBody.appendChild(totalTr);
    summaryTable.appendChild(summaryBody);
    summaryContainer.appendChild(summaryTable);
    document.body.appendChild(summaryContainer);
    const summaryCanvas = await html2canvas(summaryContainer, { scale: 2 });
    downloadCanvasAsJPEG(summaryCanvas, 'Summary_Data_Report.jpg');
    document.body.removeChild(summaryContainer);
    await delay(500);
    // ===== Step 2: Generate Ticket Status Report JPEG =====
    const statusContainer = document.createElement("div");
    statusContainer.style.position = "fixed";
    statusContainer.style.top = "-10000px";
    statusContainer.style.left = "-10000px";
    statusContainer.style.background = "#fff";
    statusContainer.style.padding = "20px";
    statusContainer.style.width = "1200px";
    statusContainer.style.boxSizing = "border-box";
    const statusTitle = document.createElement("h3");
    statusTitle.innerText = "Ticket Status";
    statusContainer.appendChild(statusTitle);
    const flexDiv = document.createElement("div");
    flexDiv.style.display = "flex";
    flexDiv.style.alignItems = "flex-start";
    flexDiv.style.gap = "20px";
    statusContainer.appendChild(flexDiv);
    // ----- LEFT SIDE: dynamically generated from TicketStatusTable.jsx -----
    const grouped = ticketData.reduce((acc, ticket) => {
        const status = ticket["Status"]?.trim() || "Unknown";
        if (!acc[status]) acc[status] = [];
        acc[status].push(ticket);
        return acc;
    }, {});
    const leftDiv = document.createElement("div");
    leftDiv.style.width = "60%";
    Object.entries(grouped).forEach(([status, tickets]) => {
        const section = document.createElement("div");
        section.style.marginBottom = "24px";
        // Status heading
        const heading = document.createElement("div");
        Object.assign(heading.style, {
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "11px",
            color: "#171fb0",
            backgroundColor: "#bdcaf2",
            textAlign: "left",
            marginBottom: "4px",
            width: "fit-content",
            paddingLeft: "3px",
            paddingRight: "3px",
        });
        heading.innerText = status;
        section.appendChild(heading);
        // Divider
        const hr1 = document.createElement("hr");
        hr1.style.border = "none";
        hr1.style.borderTop = "1px solid #ccc";
        section.appendChild(hr1);
        // Ticket rows
        tickets.forEach(ticket => {
            const rowWrapper = document.createElement("div");
            Object.assign(rowWrapper.style, {
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "8px 0",
            });
            // Icon
            const iconWrapper = document.createElement("div");
            Object.assign(iconWrapper.style, {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "12px",
                height: "12px",
                flexShrink: 0,
            });
            const issueType = ticket["Issue Type"]?.trim();
            const colorMap = { Story: "green", Epic: "blue", Test: "orange" };
            const color = colorMap[issueType] || "gray";
            const icon = document.createElement("span");
            icon.innerHTML = `
<svg width="12" height="16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<polygon points="0,0 100,0 100,100 50,85 0,100" fill="${color}" />
</svg>
`;
            iconWrapper.appendChild(icon);
            rowWrapper.appendChild(iconWrapper);
            // Key
            const keyDiv = document.createElement("div");
            Object.assign(keyDiv.style, {
                minWidth: "100px",
                textAlign: "left",
                fontSize: "12px",
                color: "blue",
                fontWeight: 600,
            });
            keyDiv.innerText = ticket["Key"] || "N/A";
            rowWrapper.appendChild(keyDiv);
            // Summary
            const summaryDiv = document.createElement("div");
            Object.assign(summaryDiv.style, {
                flex: 1,
                textAlign: "left",
                fontSize: "13px",
                color: "blue",
            });
            summaryDiv.innerText = ticket["Summary"] || "N/A";
            rowWrapper.appendChild(summaryDiv);
            section.appendChild(rowWrapper);
            // Divider
            const hr2 = document.createElement("hr");
            hr2.style.border = "none";
            hr2.style.borderTop = "1px solid #eee";
            section.appendChild(hr2);
        });
        leftDiv.appendChild(section);
    });
    flexDiv.appendChild(leftDiv);
    //A2
    // --- Right: Pie Chart + Table ---

    const rightDiv = document.createElement("div");

    rightDiv.style.width = "40%";

    flexDiv.appendChild(rightDiv);

    const chartCanvas = document.createElement("canvas");

    chartCanvas.width = 340;

    chartCanvas.height = 330;

    chartCanvas.style.display = "block"; // center align

    chartCanvas.style.margin = "0 auto";

    rightDiv.appendChild(chartCanvas);

    const ctx = chartCanvas.getContext("2d");

    // ===== DYNAMIC STATUS LOGIC START =====

    const statuses = Object.keys(grouped);

    const counts2 = statuses.reduce((acc, s) => {

        acc[s] = grouped[s]?.length || 0;

        return acc;

    }, {});

    const total2 = statuses.reduce((sum, s) => sum + counts2[s], 0);

    new Chart(ctx, {

        type: 'pie',

        data: {

            labels: statuses,

            datasets: [{

                data: statuses.map(s => counts2[s]),

                backgroundColor: ['#4dc9f6', '#f67019', '#f53794', '#cb4b4b', '#9966ff', '#ff9f40'] // you can expand as needed

            }]

        },

        options: {

            responsive: false,

            animation: { duration: 0 },

            plugins: {

                legend: { display: false },

                datalabels: {

                    color: '#000',

                    formatter: (value, ctx) => {

                        const lbl = ctx.chart.data.labels[ctx.dataIndex];

                        return `${lbl}\n = ${value}`;

                    },

                    anchor: 'end', align: 'end', offset: 10

                }

            },

            layout: { padding: 10 },

            radius: '55%',

        },

        plugins: [ChartDataLabels]

    });

    //create percentage table

    const percTable = document.createElement("table");

    percTable.style.marginTop = "20px";

    percTable.style.width = "100%";

    percTable.style.borderCollapse = "collapse";

    percTable.style.fontSize = "14px";

    percTable.style.color = "black";

    percTable.border = "1";

    percTable.innerHTML = `
<thead>
<tr>
<th style="padding:8px;">Status</th>
<th style="padding:8px;">Count</th>
<th style="padding:8px;">Percentage</th>
</tr>
</thead>

`;

    const percBody = document.createElement("tbody");

    statuses.forEach(s => {

        const tr = document.createElement("tr");

        tr.style.height = "42px";

        const pct = total2 > 0 ? Math.round((counts2[s] / total2) * 100) : 0;

        tr.innerHTML = `
<td style="padding:6px;text-align:center;">${s}</td>
<td style="padding:6px;text-align:center;">${counts2[s]}</td>
<td style="padding:6px;text-align:center;">
<div style="display:flex;justify-content:center;align-items:center;gap:8px;">
<div style="width:100px;background:#eee;height:10px;position:relative;">
<div style="width:${pct}%;background:#4285F4;height:100%;"></div>
</div>
<span>${pct}%</span>
</div>
</td>

    `;

        percBody.appendChild(tr);

    });

    // Total row

    const totalTr2 = document.createElement("tr");

    totalTr2.style.height = "42px";

    totalTr2.innerHTML = `
<td style="font-weight:bold;padding:6px;text-align:center;">Total</td>
<td style="font-weight:bold;padding:6px;text-align:center;">${total2}</td>
<td></td>

`;

    percBody.appendChild(totalTr2);

    percTable.appendChild(percBody);

    rightDiv.appendChild(percTable);

    // ===== DYNAMIC STATUS LOGIC END =====

    document.body.appendChild(statusContainer);

    //screenshot and download

    const statusCanvas = await html2canvas(statusContainer, { scale: 2 });

    downloadCanvasAsJPEG(statusCanvas, 'Ticket_Status_Report.jpg');

    document.body.removeChild(statusContainer);

};
