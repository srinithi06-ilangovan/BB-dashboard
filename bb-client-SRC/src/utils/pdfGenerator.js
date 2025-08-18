// pdfGenerator.js with pieChart updated R1

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart, ArcElement, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// ─── ConnectorLinesPlugin ─────────────────────────────────────────
const ConnectorLinesPlugin = {
    id: "connectorLines",
    afterDatasetDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const dlOpts = chart.options.plugins.datalabels || {};
        const labelOffset = dlOpts.offset || 0;
        const arrowSize = 5;

        meta.data.forEach((arc) => {
            const { x, y, outerRadius, startAngle, endAngle } = arc;
            const midAngle = (startAngle + endAngle) / 2;
            const startRadius = outerRadius - 5;
            const endRadius = outerRadius + labelOffset - arrowSize;

            const lineStart = {
                x: x + startRadius * Math.cos(midAngle),
                y: y + startRadius * Math.sin(midAngle),
            };
            const lineEnd = {
                x: x + endRadius * Math.cos(midAngle),
                y: y + endRadius * Math.sin(midAngle),
            };

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(lineStart.x, lineStart.y);
            ctx.lineTo(lineEnd.x, lineEnd.y);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(lineEnd.x, lineEnd.y);
            ctx.lineTo(
                lineEnd.x - arrowSize * Math.cos(midAngle - Math.PI / 6),
                lineEnd.y - arrowSize * Math.sin(midAngle - Math.PI / 6)
            );
            ctx.lineTo(
                lineEnd.x - arrowSize * Math.cos(midAngle + Math.PI / 6),
                lineEnd.y - arrowSize * Math.sin(midAngle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = "#000";
            ctx.fill();
            ctx.restore();
        });
    },
};
Chart.register(ArcElement, Tooltip, ChartDataLabels, ConnectorLinesPlugin);
// ────────────────────────────────────────────────────────────────────

export const generatePDF = (excelData, ticketData) => {
    if (!excelData.length || !ticketData.length) {
        alert("No data available to generate PDF!");
        return;
    }

    const doc = new jsPDF();

    // ─── Page 1: Summary Data ─────────────────────────────────────────
    doc.text("Summary Data", 14, 10);
    autoTable(doc, {
        startY: 15,
        head: [["Status", "Stories"]],
        body: [
            ["Code Review", excelData.filter(i => i.Status?.trim() === "Code Review").length],
            ["In Progress", excelData.filter(i => i.Status?.trim() === "In Progress").length],
            ["To Do", excelData.filter(i => i.Status?.trim() === "To Do").length],
            ["Total", excelData.length],
        ],
        styles: { fontSize: 12, cellPadding: 5 },
    });

    // ─── Page 2: Ticket Status Table + Pie Chart ────────────────────
    doc.addPage();
    doc.text("Ticket Status", 7, 10);   // set to 7
    const pageWidth = doc.internal.pageSize.getWidth();

    const tableBody = ticketData.map(t => {
        const type = t["Issue Type"]?.trim();
        const color = type === "Story" ? "green" : type === "Epic" ? "blue" : null;
        return [color, t["Key"] || "N/A", t["Status"] || "N/A", t["Summary"] || "N/A"];
    });

    autoTable(doc, {
        startY: 15,
        margin: { left: 7 },             // set to 7
        tableWidth: pageWidth * 0.52,
        head: [["Icon", "Ticket No.", "Status", "Ticket Title"]],
        body: tableBody.map(r => ["", r[1], r[2], r[3]]),
        styles: { fontSize: 9, cellPadding: 2 },
        didDrawCell: data => {
            if (data.section === "head") return;
            if (data.column.index === 0) {
                const iconColor = tableBody[data.row.index][0];
                if (iconColor) {
                    const x = data.cell.x + 2;
                    const y = data.cell.y + 2;
                    doc.setFillColor(iconColor);
                    doc.rect(x, y, 4, 4, "F");
                }
            }
        },
    });

    // ─── Pie Chart ────────────────────────────────────────────────────
    const canvasSize = 250;
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");

    const counts = {};
    ticketData.forEach(t => {
        const s = t.Status?.trim();
        if (s) counts[s] = (counts[s] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const backgroundColors = [
        "#4dc9f6", "#f67019", "#f53794", "#537bc4",
        "#acc236", "#166a8f", "#00a950", "#58595b", "#8549ba"
    ];

    const chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: "#fff",
                borderWidth: 2,
            }],
        },
        options: {
            animation: { duration: 0 },
            responsive: false,
            layout: { padding: 0 },
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: "#000",
                    formatter: (val, ctx) => {
                        // <<< CHANGED: split label into two lines
                        const lab = ctx.chart.data.labels[ctx.dataIndex];
                        return `${lab}\n= ${val}`;
                    },
                    font: { size: 8, weight: "bold" },
                    anchor: "end",
                    align: "end",
                    offset: 14,
                    clip: false,
                },
            },
            radius: "48%",
        },
    });
    chart.update();

    const imgData = canvas.toDataURL("image/png");
    const chartWidth = pageWidth * 0.38;
    const chartHeight = chartWidth;
    const chartX = pageWidth - chartWidth - 10;
    const chartY = 15;
    doc.addImage(imgData, "PNG", chartX, chartY, chartWidth, chartHeight);

    doc.save("Ticket_Report.pdf");
};