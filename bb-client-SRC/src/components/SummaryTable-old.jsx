//updated SummaryTable.jsx
// SummaryTable.jsx

import React, { useRef } from "react";
import { useSelector } from "react-redux";
import html2canvas from 'html2canvas';
 
const SummaryTable = () => {
    const excelData = useSelector((state) => state.excel.data) || [];
    const fileData = useSelector((state) => state.file?.data) || [];
    if (excelData.length === 0) {
        return <h3>Please upload a file</h3>;
    }
    // Defined grouped statuses
    const groupedStatuses = {
        "Open": ["Open"],
        "Backlog": ["Backlog"],
        "In Progress": ["Design", "Ready for Analysis", "In Dev", "In Progress"],
        "Blocked": ["Blocked"],
        "Review": ["Ready for Review", "Internal Review", "In Review"],
        "QA": ["Ready for QA", "In QA", "QA Sign-off", "Ready for Signoff"],
        "Deployment": ["Deployment", "Ready for deployment"],
        "Done": ["Completed", "Closed", "Done", "Deployment completed"]
    };
    // Count individual status occurrences
    const statusCounts = {};
    let total = 0;
 
    excelData.forEach((item) => {
        const status = item.Status?.trim() || "Unknown";
 
        if (!statusCounts[status]) {
            statusCounts[status] = 0;
        }
        statusCounts[status] += 1;
        total += 1;
    });
    const summaryRef = useRef();
    const handleScreenshot = async () => {
        const element = summaryRef.current;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');
 
        // Create a download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileData}_Ticket_Overview.png`;
        link.click();
    };
 
    const tableStyle = {
        width: "50%",
        textAlign: "center",
        borderCollapse: "collapse",
        border: "1px solid #ccc"
    };
    const cellStyle = {
        border: "1px solid #ccc",
        padding: "4px"
    };
    return (
        <div>
            <button style={{ color: "red" }} onClick={handleScreenshot}>Download</button>
            <div ref={summaryRef}>
                <h3>Ticket Summary Data</h3>
                <table className="ticket-table" style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={cellStyle, { backgroundColor: "lightgrey"}}>Status</th>
                            <th style={cellStyle, { backgroundColor: "lightgrey"}}>Stories</th>

                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedStatuses).map(([groupName, statuses]) => {
                            const groupTotal = statuses.reduce((sum, status) => {
                                return sum + (statusCounts[status] || 0);

                            }, 0);
                            if (groupTotal === 0) return null;
                            return (
                                <React.Fragment key={groupName}>
                                    <tr>
                                        <td
                                            style={{
                                                ...cellStyle,
                                                fontWeight: "bold",
                                                backgroundColor: "white",
                                                textAlign: "left",
                                                paddingLeft: "8px",
                                            }}
                                        >
                                            {groupName}
                                        </td>
                                        <td style={{ ...cellStyle, fontWeight: "bold" }}>{groupTotal}</td>
                                    </tr>
                                    {statuses.map((status) => {
                                        if (!statusCounts[status]) return null;
                                        return (
                                            <tr key={status}>
                                                <td
                                                    style={{
                                                        ...cellStyle,
                                                        paddingLeft: "24px",
                                                        backgroundColor: "#f9f9f9",
                                                        textAlign: "right"
                                                    }}
                                                >
                                                    {status}
                                                </td>
                                                <td style={{ ...cellStyle, backgroundColor: "#f9f9f9" }}>{statusCounts[status]}</td>
  						


                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                        <tr>
                            <td style={cellStyle}><strong>Total</strong></td>
                            <td style={cellStyle}><strong>{total}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SummaryTable;