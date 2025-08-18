
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import html2canvas from 'html2canvas';
const StatusOverview = () => {
    const fileData = useSelector((state) => state.file?.data) || [];
    const ticketData = useSelector((state) => state.ticket?.data) || [];
    const excelData = useSelector((state) => state.excel?.data) || [];
    
    const dodData = useSelector((state) => state.dod?.data) || [];
    const grouped = ticketData.reduce((acc, ticket) => {
        const status = ticket["Group"]?.trim() || "Unknown";
        if (!acc[status]) acc[status] = [];    //need to make global state
        acc[status].push(ticket);
        return acc;
    }, {});

    const cellStyle = {
        border: "1px solid #ccc",
        padding: "4px"
    };

    const statuses = Object.keys(grouped);
    const totalCount = statuses.reduce((sum, status) => sum + (grouped[status]?.length || 0), 0);
    const totalStoryPoints = ticketData.map((info) => info).map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0)

    const extractedDodArray = Object.entries(dodData).map(([index, val]) => index)
    const mapDodStoryPoints = ticketData.filter((val, idx) => extractedDodArray.includes(val.Status))
    const totalDodStoryPoints = mapDodStoryPoints.map(info => info["Story Points"]).reduce((sum, point) => sum + point, 0)
    const totalDodStoriesCount = mapDodStoryPoints.map(info => info["Story Points"]).length

    const actualCompletedStoryCount = statuses.map((status, i) =>  status === "Done" ?   grouped["Done"]?.length || 0 : null ).filter(Boolean)[0]
    const actualCompletedStoryPoints = statuses.map((status, i) => status === "Done" ? grouped[status].map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0): null).filter(Boolean)[0]
    

    const carryFwdStoryPoints = excelData
        .filter(item => item.CarryFwd?.trim() !== "No")
        .reduce(
            (sum, item) => sum + (parseFloat(item["Story Points"]) || 0),
            0
        );

    const carryFwdCount = excelData
        .filter(item => item.CarryFwd?.trim() !== "No")
        .length;

    const adhocStoryPoints = excelData
        .filter(item => item.AdHoc?.trim() === "AdHoc")
        .reduce(
            (sum, item) => sum + (parseFloat(item["Story Points"]) || 0),
            0
        );

    const adhocCount = excelData
        .filter(item => item.AdHoc?.trim() === "AdHoc")
        .length;

    const availableStoryCount = totalCount - (carryFwdCount + adhocCount)
    const availableStoryPoints = totalStoryPoints - (carryFwdStoryPoints + adhocStoryPoints)

    const notCompletedStoryCount = totalCount - totalDodStoriesCount
    const notCompletedStoryPoints = totalStoryPoints - totalDodStoryPoints

    const statusOverviewRef = useRef();
    const handleScreenshot = async () => {
        const element = statusOverviewRef.current;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');


        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileData}_Status_Overview.png`.replace(".xlsx", '');
        link.click();
    };
    if (excelData.length === 0) {
        return <h3>Please upload a file</h3>;
    }
    return (
        <>
            <button style={{ color: "red" }} onClick={handleScreenshot}>Download</button>

		
            <div ref={statusOverviewRef} style={{margin:"10px"}}>
			<h3>Kanban Report Summary</h3>
                <table
                    align="center"
                    style={{
                        marginLeft: "0px auto",
                        marginTop: "10px",
                        border: ".5px solid black",
                        width: "85%",
                        position: "relative",
                        textAlign: "center",
                        borderCollapse: "collapse",
                        color: "Black",
                        fontSize: "14px",
                    }}
                >
                    <thead>
                        <tr style={{ height: "40px", background: "lightgrey", color: "black" }}>
                            <th style={{ width: "20%", textAlign: "center", padding: "8px 0", border: ".25px solid black" }}>Status</th>
                            <th style={{ width: "11%", textAlign: "center", padding: "8px 0", border: ".25px solid black" }}>Stories</th>
                            <th style={{ width: "11%", textAlign: "center", padding: "8px 0", border: ".25px solid black" }}>Story Points</th>
   			    <th
                               
                                style={{ ...cellStyle, backgroundColor: "lightgrey", border: ".25px solid black" }}
                            >
                                Comments / Observation
                            </th>
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
                                <tr key={i} style={{ height: "25px", color: "black", border: ".25px solid black" }}>
                                    <td style={{ textAlign: "left", padding: "6px 10px", border: ".25px solid black", fontWeight: "bold" }}>{status}</td>
                                    <td style={{ textAlign: "center", padding: "6px 0", border: ".25px solid black" }}>{count}</td>
                                    <td style={{ textAlign: "center", padding: "6px 0", border: ".25px solid black" }}>{totalStoryPointsByGroup}</td>
                                </tr>
                            );
                        })}

                        <tr style={{ height: "25px", color: "black", border: ".25px solid black", background: "lightgrey" }}>
                            <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0", border: ".25px solid black" }}>
                                Total
                            </td>
                            <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0", border: ".25px solid black" }}>
                                {totalCount}
                            </td>
                            <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0", border: ".25px solid black" }}>
                                {totalStoryPoints}
                            </td>


                        </tr>
                    </tbody>
                </table>

                {/* bottom table */}

                <table
                    className="sprint-details-table"
                    align="center"
                    style={{
                        marginTop: "20px",
                        border: "1px solid #ccc",
                        width: "85%",
                        textAlign: "center",
                        borderCollapse: "collapse",
                        color: "Black",
                        fontSize: "14px",
                    }}
                >
                    <thead>
                        {/* Row 1: top‐level headers */}
                        <tr>
                            <th
                                rowSpan={2}
                                style={{ ...cellStyle,  width: "20%", backgroundColor: "lightgrey", border: ".25px solid black" }}
                            >
                                Kanban Report
                            </th>
                            <th
                                colSpan={4}
                                style={{ ...cellStyle,  width: "45%", backgroundColor: "lightgrey", border: ".25px solid black" }}
                            >
                                Kanban Story & Story Points Details
                            </th>
                            <th
                                rowSpan={2}
                                style={{ ...cellStyle,  width: "12%", backgroundColor: "lightgrey", color: "blue", border: ".25px solid black" }}
                            >
                                Actual Completed
                            </th>
                            <th
                                rowSpan={2}
                                style={{ ...cellStyle,  width: "12%", backgroundColor: "lightgrey", color: "green", border: ".25px solid black" }}
                            >
                                DOD Completed
                            </th>
                            <th
                                rowSpan={2}
                                style={{ ...cellStyle,  width: "12%", backgroundColor: "lightgrey", border: ".25px solid black" }}
                            >
                                Pending to Complete
                            </th>
                         
                        </tr>
                        {/* Row 2: sub‐headers under “Sprint Details” */}
                        <tr>
                            <th style={{ ...cellStyle,  width: "11%", backgroundColor: "lightgrey", border: ".25px solid black" }}>Total</th>
                            <th style={{ ...cellStyle, width: "11%", backgroundColor: "lightgrey", border: ".25px solid black" }}>Carry Fwd</th>
                            <th style={{ ...cellStyle, width: "11%", backgroundColor: "lightgrey", border: ".25px solid black" }}>AdHoc</th>
                            <th style={{ ...cellStyle, width: "11%", backgroundColor: "lightgrey", border: ".25px solid black" }}>Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Row 3: Stories */}
                        <tr>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>Stories</td>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}> {totalCount}</td>
                            <td style={cellStyle}>{carryFwdCount}</td>
                            <td style={cellStyle}>{adhocCount}</td>
                            <td style={cellStyle}>{availableStoryCount}</td>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>{actualCompletedStoryCount}</td>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>{totalDodStoriesCount}</td>
                            <td style={cellStyle}>{notCompletedStoryCount}</td>
                            
                        </tr>
                        {/* Row 4: Story Points */}
                        <tr>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>Story Points</td>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>{totalStoryPoints}</td>
                            <td style={cellStyle}>{carryFwdStoryPoints}</td>
                            <td style={cellStyle}>{adhocStoryPoints}</td>
                            <td style={cellStyle}>{availableStoryPoints}</td>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>{actualCompletedStoryPoints}</td>
                            <td style={{cellStyle, fontWeight:"bold", border: ".25px solid grey"}}>{totalDodStoryPoints}</td>
                            <td style={cellStyle}>{notCompletedStoryPoints}</td>
                           
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default StatusOverview

