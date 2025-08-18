// TicketStatusTable.jsx 8.0


// import TicketStatusPieChart from "./TicketStatusPieChart";
//import story_icon from '../storyIcon.png';

import React, { useRef } from "react";
import { useSelector } from "react-redux";
import html2canvas from 'html2canvas';
const BarChart = () => {
    const fileData = useSelector((state) => state.file?.data) || [];

    const dodData = useSelector((state) => state.dod?.data) || [];
    const ticketData = useSelector((state) => state.ticket?.data) || [];
    console.log(ticketData, 'ticketData')
    const grouped = ticketData.reduce((acc, ticket) => {
        const status = ticket["Group"]?.trim() || "Unknown";
        if (!acc[status]) acc[status] = [];    //need to make global state
        acc[status].push(ticket);
        return acc;
    }, {});



    const statuses = Object.keys(grouped);
    const totalCount = statuses.reduce((sum, status) => sum + (grouped[status]?.length || 0), 0);
    const totalStoryPoints = ticketData.map((info) => info).map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0)


    const extractedDodArray = Object.entries(dodData).map(([index, val]) => index)
    const mapDodStoryPoints = ticketData.filter((val, idx) => extractedDodArray.includes(val.Status))
    const totalDodStoryPoints = mapDodStoryPoints.map(info => info["Story Points"]).reduce((sum, point) => sum + point, 0)



    console.log(totalStoryPoints, 'totalStoryPointstotalStoryPointstotalStoryPoints')

    const barChartRef = useRef();
    const handleScreenshot = async () => {
        const element = barChartRef.current;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');

        // Create a download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileData}_Ticket_Bar_chart.png`.replace(".xlsx", '');
        link.click();
    };

    console.log(`${Math.round((totalDodStoryPoints / totalStoryPoints) * 100)}%`, "======>>>>>");
    if (ticketData.length === 0) {
        return <h3>Please upload a file</h3>;
    }
    return (
        <>
            <button style={{ color: "red" }} onClick={handleScreenshot}>Download</button>
            <div ref={barChartRef}>
                <table
                    //margin-left= auto
                    //margin-right= auto

                    align="center"

                    style={{

                        marginLeft: "0px auto",
                        marginTop: "10px",
                        border: ".5px solid black",
                        width: "65%",
                        position: "relative",
                        textAlign: "center",
                        borderCollapse: "collapse",
                        color: "Black",
                        fontSize: "14px",

                    }}
                >
                    <thead>
                        <tr style={{ height: "40px", background: "black", color: "white" }}>
                            <th style={{ textAlign: "center", padding: "8px 0" }}>Status</th>
                            <th style={{ textAlign: "center", padding: "8px 0" }}>Stories</th>
                            <th style={{ textAlign: "center", padding: "8px 0" }}>Story Points</th>
                            <th style={{ textAlign: "center", padding: "8px 0" }}>Progress Bar <br /> (based on Story Points)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statuses.map((status, i) => {
                            const count = grouped[status]?.length || 0;
                            // const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;

                            const totalStoryPointsByGroup = grouped[status].map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0)
                            //const totalStoryPointsByDoD = Blocked + Review + Completed + Deployment


                            const pct = totalStoryPoints ? Math.round((totalStoryPointsByGroup / totalStoryPoints) * 100) : 0;

                            return (
                                <tr key={i} style={{ height: "25px", color: "red" }}>
                                    <td style={{ textAlign: "left", padding: "6px 10px", width: "auto", border: ".25px solid gray" }}>{status}</td>
                                    <td style={{ textAlign: "center", padding: "6px 0", width: "10%", border: ".25px solid gray" }}>{count}</td>
                                    <td style={{ textAlign: "center", padding: "6px 0", width: "10%", border: ".25px solid gray" }}>{totalStoryPointsByGroup}</td>

                                    <td style={{ border: ".25px solid gray"}}>
                                        <div
                                            style={{
                                                display: "flex",
                                                margin:"2px"
                                            }}
                                        >
                                            {/* <div style={{padding: "0 0 0 30px"}}> */}
                                            <div>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                            </div>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    background: "#eee",
                                                    height: "20px",
                                                    // position: "relative",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${pct}%`,
                                                        //background: "#4285F4",
                                                        //background: "#4285F4",
							background: "blue",
                                                        height: "100%",
                                                        textAlign: "right",
                                                        padding: "0 1px 0",
                                                        color: "white",
                                                        // marginLeft: "31px"
                                                    }}
                                                > {totalStoryPointsByGroup} </div>

                                            </div>
                                            <span style={{ width: "12%", color: "black", textalign: "right", fontsize: "10", fontWeight: "normal", marginLeft: "10px" }}>{pct}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        <tr style={{ height: "25px", color: "black", border: ".25px solid gray" }}>
                            
                           <td style={{ textAlign: "left", padding: "6px 10px", width: "auto", border: ".25px solid gray" }}>{'Total'}</td>
                                    <td style={{ textAlign: "center", padding: "6px 0", width: "10%", border: ".25px solid gray" }}>{totalCount}</td>
                                    <td style={{ textAlign: "center", padding: "6px 0", width: "10%", border: ".25px solid gray" }}>{totalStoryPoints}</td>

                                    <td >
                                        <div
                                            style={{
                                                display: "flex",
                                                margin:"2px"
                                            }}
                                        >
                                            {/* <div style={{padding: "0 0 0 30px"}}> */}
                                            <div>
                                               DoD&nbsp;
                                            </div>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    background: "#eee",
                                                    height: "20px"
                                                    // height: "20px",
                                                    // position: "relative",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${totalDodStoryPoints}`  > 0 ?`${Math.round((totalDodStoryPoints / totalStoryPoints) * 100)}%` : 0,
                                                        //background: "#3CB371",
                                                        //background: "#4285F4",
							background: "lightGreen",
                                                        height: "100%",
                                                        textAlign: "right",
                                                         padding: "0 1px 0",
                                                        color: "black",
                                                        // marginLeft: "31px"
                                                    }}
                                                > {totalDodStoryPoints > 0 ? `${totalDodStoryPoints} / ${totalStoryPoints}` :  0} </div>

                                            </div>
                                            <span style={{ width: "12%", color: "black", textalign: "right", fontsize: "10", fontWeight: "normal", marginLeft: "10px" }}>{Math.round((totalDodStoryPoints / totalStoryPoints) * 100)}%</span>
                                        </div>
                                    </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default BarChart

