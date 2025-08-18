import React, { useRef } from "react";
import html2canvas from 'html2canvas';
// import { Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    ArcElement,

} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register core components + datalabels
// ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

// ─── UPDATED PLUGIN ───────────────────────────────────────────────────────────────
// Custom plugin to draw connector lines + arrowheads, with new start/end radii
// const ConnectorLinesPlugin = {
//     id: 'connectorLines',
//     afterDatasetDraw(chart) {
//         const { ctx } = chart;
//         const meta = chart.getDatasetMeta(0);

//         // UPDATED: read your datalabel offset so we end lines just before text
//         const dlOpts = chart.options.plugins.datalabels || {};
//         const labelOffset = dlOpts.offset || 0;      // distance  labels are from the pie
//         const arrowSize = 5;                       // arrowhead length

//         meta.data.forEach(arc => {
//             const { x, y, outerRadius, startAngle, endAngle } = arc;
//             const midAngle = (startAngle + endAngle) / 2;

//             // UPDATED: line now starts just inside the slice
//             const startRadius = outerRadius - 5;

//             // UPDATED: line now ends just before label (no overlap)
//             const endRadius = outerRadius + labelOffset - arrowSize;

//             const lineStart = {
//                 x: x + startRadius * Math.cos(midAngle),
//                 y: y + startRadius * Math.sin(midAngle),
//             };
//             const lineEnd = {
//                 x: x + endRadius * Math.cos(midAngle),
//                 y: y + endRadius * Math.sin(midAngle),
//             };

//             ctx.save();
//             // draw the connector
//             ctx.beginPath();
//             ctx.moveTo(lineStart.x, lineStart.y);
//             ctx.lineTo(lineEnd.x, lineEnd.y);
//             ctx.strokeStyle = '#000';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             // draw arrowhead at lineEnd
//             ctx.beginPath();
//             ctx.moveTo(lineEnd.x, lineEnd.y);
//             ctx.lineTo(
//                 lineEnd.x - arrowSize * Math.cos(midAngle - Math.PI / 6),
//                 lineEnd.y - arrowSize * Math.sin(midAngle - Math.PI / 6)
//             );
//             ctx.lineTo(
//                 lineEnd.x - arrowSize * Math.cos(midAngle + Math.PI / 6),
//                 lineEnd.y - arrowSize * Math.sin(midAngle + Math.PI / 6)
//             );
//             ctx.closePath();
//             ctx.fillStyle = '#000';
//             ctx.fill();
//             ctx.restore();
//         });
//     }
// };
// // register it after datalabels
// ChartJS.register(ConnectorLinesPlugin);
// ────────────────────────────────────────────────────────────────────────────────

// const TicketStatusPieChart = () => {
//     const ticketData = useSelector(state => state.ticket.data || []);

//     // count statuses
//     const counts = {};
//     ticketData.forEach(t => {
//         const status = t.Status?.trim();
//         if (status) counts[status] = (counts[status] || 0) + 1;
//     });

//     const labels = Object.keys(counts);
//     const values = Object.values(counts);

//     const backgroundColors = [
//         '#4dc9f6', '#f67019', '#f53794', '#537bc4',
//         '#acc236', '#166a8f', '#00a950', '#58595b',
//         '#8549ba'
//     ];

//     const data = {
//         labels,
//         datasets: [{
//             data: values,
//             backgroundColor: backgroundColors.slice(0, labels.length),
//             borderColor: '#ffffff',
//             borderWidth: 2,
//         }]
//     };

//     const options = {
//         responsive: true,
//         layout: { padding: 10 },
//         plugins: {
//             legend: { display: false },
//             datalabels: {
//                 color: '#000',
//                 formatter: (value, context) => {
//                     const label = context.chart.data.labels[context.dataIndex];
//                     return `${label} = ${value}`;
//                 },
//                 font: { weight: 'bold' },
//                 anchor: 'end',
//                 align: 'end',
//                 offset: 10,
//                 clip: false
//             },
//         },
//         radius: '48%',
//     };
// const pieChartRef = useRef();
//     const handleScreenshot = async () => {
//     const element = pieChartRef.current;
//     const canvas = await html2canvas(element);
//     const dataURL = canvas.toDataURL('image/png',2);

//     // Create a download link
//     const link = document.createElement('a');
//     link.href = dataURL;
//     link.download = 'screenshot.png';

//.replace(".xlsx", '')



//     link.click();
//   };
//     if (!ticketData.length) {
//         return <p style={{ color: 'black' }}>Please upload a file to see the chart.</p>;
//     }

//     return (
//         <>
//         <button style={{color:"red"}}onClick={handleScreenshot}>Download</button>
//         <div ref={pieChartRef} style={{ width: 400, marginLeft: 20 }}>
//             <h4 style={{ color: 'black', textAlign: 'center' }}>Ticket Status Report</h4>
//             <Pie data={data} options={options} plugins={[ChartDataLabels]} />
//         </div>
//         </>
//     );
// };
// import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Grosdsdup A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Grousdsdp C', value: 300 },
    { name: 'Group D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const TicketStatusPieChart = () => {
    const fileData = useSelector((state) => state.file?.data) || [];
    const ticketData = useSelector(state => state.ticket.data || []);
    const grouped = ticketData.reduce((acc, ticket) => {
        const status = ticket["Group"]?.trim() || "Unknown";
        if (!acc[status]) acc[status] = [];    //need to make global state
        acc[status].push(ticket);
        return acc;
    }, {});
    const pieChartRef = useRef();

    const handleScreenshot = async () => {
        const element = pieChartRef.current;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');

        // Create a download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileData}_Ticket_Status_Pie_chart.png`.replace(".xlsx", '');
        link.click();
    };


    const statuses = Object.keys(grouped)
    const totalCount = statuses.reduce((sum, status) => sum + (grouped[status]?.length || 0), 0);
    const groupbycount = statuses.map((status, i) => {
        const count = grouped[status]?.length || 0
        return count
    }
    )


    console.log(grouped, 'grouped', groupbycount, 'groupbycount')

    const pieData = Object.entries(grouped).map(([index, info]) => {
        // console.log(grouped,'grouped',info,'info',index,'index')
        return { "name": index, "value": info.length }
    })
    // const abc = statuses.map((info)=>{
    //   return { "name" : info}
    // })
    // const abcd = groupbycount.map((info)=>{
    //   return { "value" : info}
    // })
    console.log(pieData, 'abc')
    if (ticketData.length === 0) {
        return <h3>Please upload a file</h3>;
    }
    return (

        <>

            <button style={{ color: "red" }} onClick={handleScreenshot}>Download</button>

            <div ref={pieChartRef}>

                <PieChart width={1000} height={400}>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        // color="black"
                        // textDecoration={"black"}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>

        </>
    )


}



// export default CustomPieChart;

export default TicketStatusPieChart;