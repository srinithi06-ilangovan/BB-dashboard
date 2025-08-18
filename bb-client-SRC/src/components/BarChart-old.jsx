// TicketStatusTable.jsx 8.0
 
 
// import TicketStatusPieChart from "./TicketStatusPieChart";
//import story_icon from '../storyIcon.png';

import React ,{ useRef }from "react";
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

    
    const extractedDodArray = Object.entries(dodData).map(([index,val])=> index)
    const mapDodStoryPoints = ticketData.filter((val, idx)=>extractedDodArray.includes(val.Status))
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

console.log( `${Math.round((totalDodStoryPoints / totalStoryPoints) * 100)}%`, "======>>>>>");
    return (
        <>
        <button style={{color:"red"}}onClick={handleScreenshot}>Download</button>
        <div ref={barChartRef}>
            <table 
 		//margin-left= auto
  		//margin-right= auto
                
		align="center"

                style={{
	             
		    marginLeft: "0px auto",
                    marginTop: "10px",
		    border: ".5px solid black",
                    width: "60%",
	            position: "relative",
		    textAlign: "center",
                    borderCollapse: "collapse",
                    color: "Black",
                    fontSize: "14px",
		    
                }}
            >
                <thead>
                    <tr  style={{ height: "40px", background: "black", color:"white" }}>
                        <th style={{ textAlign: "center", padding: "8px 0" }}>Status</th>
                        <th style={{ textAlign: "center", padding: "8px 0" }}>Stories</th>
                        <th style={{ textAlign: "center", padding: "8px 0" }}>Story Points</th>
                        <th style={{ textAlign: "center", padding: "8px 0" }}>Progress Bar <br/> (based on Story Points)</th>
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
                                <td style={{ textAlign: "left", padding: "6px 10px", width: "auto", border: ".25px solid gray"  }}>{status}</td>
                                <td style={{ textAlign: "center", padding: "6px 0", width: "10%" , border: ".25px solid gray"  }}>{count}</td>
                                <td style={{ textAlign: "center", padding: "6px 0", width: "10%" , border: ".25px solid gray"  }}>{totalStoryPointsByGroup}</td>

                                <td style={{ textAlign: "center", padding: "6px 0" , width: "60%", border: ".25px solid gray"  }}> 
                                    <div
                                        style={{
                                            display: "flex",
					    padding: "0 0 0 5px",
                                            alignItems: "left",
                                            justifyContent: "left",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "76%",
                                                //background: "#eee",
                                                height: "22px",
                                                position: "relative",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${pct}%`,
					            background: "blue",
                                                    //background: "#4285F4",
                                                    height: "100%",
						    textAlign: "right",
						    padding: "0 3px 0",
						    color: "white",
						    marginLeft: "31px"
                                                }}
                                            > {totalStoryPointsByGroup} </div>< td></td> < td></td>
						
                                        </div>
                                        <span style={{  width: "12%", color: "black", textalign: "right", fontsize: "10", fontWeight: "normal", marginLeft: "10px"}}>{pct}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    <tr style={{ height: "25px", color: "black" , border: ".25px solid gray"  }}>
                        <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0" , border: ".25px solid gray"  }}>
                            Total
                        </td>
                        <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0" , border: ".25px solid gray"  }}>
                            {totalCount}
                        </td>
                        <td style={{ fontWeight: "bold", textAlign: "center", padding: "6px 0" , border: ".25px solid gray"  }}>
                            {totalStoryPoints}
                        </td>


                         <td style={{ textAlign: "center", padding: "6px 0", width: "60%", border: ".25px solid gray" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        padding: "0 0 0 3px",
                                        alignItems: "left",
                                        justifyContent: "left",
                                    }}
                                > 	DoD 
                                    <div
                                        style={{
                                            width: "100%",
                                            //background: "#eee",
                                            height: "20px",
					     padding: "0 10px 0 5px",	
                                            position: "relative",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${Math.round((totalDodStoryPoints / totalStoryPoints) * 100)}%`,
                                               // background: "#4285F4",
 						//background: "#428500",
						background: "lightGreen",
						color: "black",
                                                height: "100%",
						textAlign: "right",
						padding: "0 0 0 0",
						marginLeft: "0px"
                                            }}
                                        >  {totalDodStoryPoints}  </div> 
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

