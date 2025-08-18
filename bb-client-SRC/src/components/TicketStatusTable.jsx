// TicketStatusTable.jsx 8.0
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import TicketStatusPieChart from "./TicketStatusPieChart";
import ScreenshotComponent from "./ScreenshotComponent";
//import story_icon from '../storyIcon.png';
import html2canvas from 'html2canvas';

//--


const TicketStatusTable = () => {
    const ticketData = useSelector((state) => state.ticket?.data) || [];
    const fileData = useSelector((state) => state.file?.data) || [];
// console.log(fileData,'fileDatafileDatafileData')
    if (ticketData.length === 0) {
        return <h3 style={{ color: "black" }}>Please upload a file</h3>;
    }

    const grouped = ticketData.reduce((acc, ticket) => {
        const status = ticket["Group"]?.trim() || "Unknown";
        if (!acc[status]) acc[status] = [];    //need to make global state
        acc[status].push(ticket);
        return acc;
    }, {});



    const statuses = Object.keys(grouped);
    const totalCount = statuses.reduce((sum, status) => sum + (grouped[status]?.length || 0), 0);
    // const statuses = Object.keys(grouped);
    // const totalCount = statuses.reduce((sum, status) => sum + (grouped[status]?.length || 0), 0);
    const totalStoryPoints = ticketData.map((info) => info).map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0)


//--



    //     const totalStoryPoints = Object.entries(grouped).map(([status, tickets])=>
    //    tickets.map((info)=>info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0)

    //     )
    //  console.log(ticketData,'ticketData',totalStoryPoints,'totalStoryPoints')

    // tickets.map(info => {
    //     const totalPoints =info?.[points].reduce((sum, point) => sum + point, 0);
    //     return totalPoints;
    //   });
    const getIcon = (issueType) => {
        const colorMap = {
            Story: <img height="15" width="15"  src={"/public/Icons/storyIcon.png"} />,
            // Epic: "blue",
            Test: <img height="15" width="15"  src={"/public/Icons/testIcon.png"} />,
            Bug: <img height="15" width="15"  src={"/public/Icons/bugIcon.png"} />,
            Task: <img height="15" width="15"  src={"/public/Icons/taskIcon.png"} />,
        };
        const color = colorMap[issueType] || "gray";
        return (
            // <span
            //     style={{
            //         width: "12px",
            //         height: "16px",
            //         backgroundColor: color,
            //         position: "relative",
            //         clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
            //         borderRadius: "2px",
            //         flexShrink: 0,
            //     }}
            // />
            <>
                <span> {color}</span>
            </>
        );
    };
    const tableStatusRef = useRef();
    const handleScreenshot = async () => {
        const element = tableStatusRef.current;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');

        // Create a download link
        const link = document.createElement('a');
        link.href = dataURL;
	//console.log("File -------> ", ${fileData});

        link.download = `${fileData}_Ticket_Summary.png`.replace(".xlsx", '');


        link.click();
    };
    const statusColor = {

        "Open": "#5C4033",
        "Backlog": "brown",
        "In Progress": "#4dc9f6",
        "Blocked": "red",
        "Review": "darkblue",
        "QA": "#FFBB28",
        "Deployment": "lightgreen",
        "Done": "green",
    }

    return (
        <>
            <button style={{ color: "red" }} onClick={handleScreenshot}>Download</button>
            <div ref={tableStatusRef}>

                {/* <div style={{display:"flex", alignItems:"center",justifyContent:"flex-end"}}> */}
                {/* <table
                    style={{
                        marginTop: "20px",
                        width: "100%",
                        borderCollapse: "collapse",
                        color: "black",
                        fontSize: "15px",
                    }}
                >
                    <thead>
                        <tr style={{ height: "40px" }}>
                            <th style={{ textAlign: "center", padding: "8px 0" }}>Ticket Status Summary</th>
                            <th style={{ textAlign: "center", padding: "8px 0" }}>

                                <div style={{
                                    fontWeight: "bold",
                                    border: `1px solid black`,
                                    // textTransform: "uppercase",
                                    fontSize: "11px",
                                    color: "white",
                                    backgroundColor: "black",
                                    textAlign: "right",
                                    width: "84%",
                                    textAlign: "center",
                                    fontWeight: "900",
                                    marginLeft: "3px"
                                }}> {`${totalStoryPoints} SPs / ${totalCount} Stories`}
                                </div>

                            </th>

                        </tr>
                    </thead>
                </table> */}
                
                
                {/* </div>   */}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", justifyContent: "center" }}>
                    {/* LEFT */}
                    <div >
                        <h3 style={{ color: "black" }}>Ticket Status Summary</h3>
                        <p style={{ color: "black",display: "flex", justifyContent: "flex-end" }}><div style={{
                                    fontWeight: "bold",
                                    border: `1px solid black`,
                                    // textTransform: "uppercase",
                                    fontSize: "13px",
                                    color: "white",
                                    backgroundColor: "black",
                                    // textAlign: "right",
                                    width: "20%",
                                    textAlign: "center",
                                    fontWeight: "900",
                                    marginLeft: "3px"
                                }}> {`${totalStoryPoints} SPs / ${totalCount} Stories`}
                                </div></p>
                        {Object.entries(grouped).map(([status, tickets]) => (


                            <div key={status} style={{ marginBottom: "12px" }}>
                                {/* Status heading: smaller font, dark blue */}
                                <div style={{ position: "relative", display:"flex" }}>


				 <div style={{
                                        border: `1px solid ${statusColor[status]}`,
                                        backgroundColor: `${statusColor[status]}`,
                                        width: "5px",
                                        height: "12px",
                                        paddingLeft: "3px",
                                        paddingRight: "3px",
                                         
                                    }}/>

				

                                    <div
                                        style={{
                                            fontWeight: "700",
                                            textTransform: "uppercase",
                                            fontSize: "12px",
                                            color: "#000000",
                                            // backgroundColor: "#bdcaf2",
                                            textAlign: "left",
                                            marginBottom: "-1px",
    					    
                                            // float:"left",
                                            width: "fit-content",
                                            paddingLeft: "3px",
                                            paddingRight: "3px",
                                        }}
                                    >
                                        {status.toUpperCase()}
  				

                                    </div>

                                    <div style={{
                                        //fontWeight: "bold",
                                        border: `1px solid ${statusColor[status]}`,
                                        // textTransform: "uppercase",
                                        fontSize: "11px",
                                        color: "white",
                                        backgroundColor: `${statusColor[status]}`,
                                        textAlign: "right",
                                        marginBottom: "3px",
                                        position: "absolute",
                                        right: 0,
                                        top: "-3px",
                                        width: "18%",
                                        height: "15px",
                                        paddingLeft: "3px",
                                        paddingRight: "3px",
                                        textAlign: "center",
                                        fontWeight: "900"
                                    }}>
   					
					{`${tickets.map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0) === 0 ? ""
                                            : ` ${tickets.map((info) => info?.["Story Points"]).filter(Boolean).reduce((sum, point) => sum + point, 0)} SPs`}`}
                                        {` / ${tickets.length} ${tickets.length > 1 ? "Stories" : "Story"} `}
 

                                    </div>
                                </div>

                                <hr style={{ border: "none", margin:0, borderTop: "1px solid #ccc" }} />

                                {tickets.map((ticket, idx) => {
                                    const issueType = ticket["Issue Type"]?.trim() || "";
                                    return (
                                        <React.Fragment key={idx}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "16px",
                                                    marginLeft: "25px"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "12px",
                                                        height: "12px",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {getIcon(issueType)}
                                                </div>
                                                <div
                                                    style={{
                                                        minWidth: "100px",
                                                        textAlign: "left",
                                                        fontSize: "12px",
                                                        color: "blue",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {ticket["Key"] || "N/A"}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        textAlign: "left",
                                                        fontSize: "13px",
                                                        color: "blue",
                                                    }}
                                                >
                                                    {ticket["Summary"] || "N/A"}
                                                </div>
                                                <div
                                                    style={{
                                                        Width: "3%",
                                                        textAlign: "right",
                                                        fontSize: "12px",
                                                        color: "blue",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {ticket["SP"] || "0"}
                                                </div>
                                                <div style={{ width: "15%" }}>
                                                    <div
                                                        style={{
                                                            fontWeight: "bold",
                                                            textTransform: "uppercase",
                                                            fontSize: "11px",
                                                            color: "#171fb0",
                                                            // backgroundColor: "#bdcaf2",
                                                            // textAlign: "left",
                                                            float: "right",
                                                            marginBottom: "4px",
                                                            //width: "fit-content",
                                                            paddingLeft: "3px",
                                                            paddingRight: "3px",
                                                        }}
                                                    >
                                                        {ticket["Status"].toUpperCase()}
                                                    </div>
                                                </div>

                                            </div>
                                            <hr style={{ border: "none", margin:0 , borderTop: "1px solid #eee" }} />
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: pie chart + summary table */}
                    {/* <div style={{ width: "40%" }}> */}
                    {/* <TicketStatusPieChart /> */}

                    {/* <table
                        border="1"
                        style={{
                            marginTop: "20px",
                            width: "100%",
                            borderCollapse: "collapse",
                            color: "black",
                            fontSize: "14px",
                        }}
                    >
                        <thead>
                            <tr style={{ height: "40px" }}>
                                <th style={{ textAlign: "center", padding: "8px 0" }}>Status</th>
                                <th style={{ textAlign: "center", padding: "8px 0" }}>Count</th>
                                <th style={{ textAlign: "center", padding: "8px 0" }}>Story Points</th>
                                <th style={{ textAlign: "center", padding: "8px 0" }}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statuses.map((status, i) => {
                                const count = grouped[status]?.length || 0;
                                const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
                                return (
                                    <tr key={i} style={{ height: "42px", color: "black" }}>
                                        <td style={{ textAlign: "center", padding: "6px 0" }}>{status}</td>
                                        <td style={{ textAlign: "center", padding: "6px 0" }}>{count}</td>
                                        <td style={{ textAlign: "center", padding: "6px 0" }}>{count}</td>
 
                                        <td style={{ textAlign: "center", padding: "6px 0" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "100px",
                                                        background: "#eee",
                                                        height: "10px",
                                                        position: "relative",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: "#4285F4",
                                                            height: "100%",
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ color: "black" }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
 
                            <tr style={{ height: "42px", color: "black" }}>
                                <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0" }}>
                                    Total
                                </td>
                                <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0" }}>
                                    {totalCount}
                                </td>
                                <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0" }}>
                                    {totalCount}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table> */}
                    {/* </div> */}
                </div>
            </div>
            {/* <ScreenshotComponent /> */}

        </>
    );
};

export default TicketStatusTable;