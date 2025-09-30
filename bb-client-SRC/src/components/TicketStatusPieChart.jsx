import React, { useRef } from "react";
import html2canvas from 'html2canvas';
// import { Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    ArcElement,

} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884d8', '#A2D9CE', '#C39BD3', '#FADBD8',
    '#5DADE2', '#52BE80', '#F5B041', '#EB984E',
    '#AF7AC5', '#CD6155', '#58D68D', '#F4D03F'];

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

    if (ticketData.length === 0) {
        return <h3>Please upload a file</h3>;
    }
    return (

        <>

            <button style={{ color: "red" }} onClick={handleScreenshot}>Download</button>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // This property centers the items (h3 and PieChart) horizontally.
                width: '100%',
                padding: '10px 0'
            }} ref={pieChartRef}>
                <h3 style={{ margin: 0 }}>Pie Chart</h3>
                <PieChart width={1000} height={400} >
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
                        {pieData.map((entry, index) => (
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