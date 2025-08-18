// SummaryTable.jsx
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import html2canvas from 'html2canvas';
import { groupedStatuses } from '../utils/groupAndStatusList';
const SummaryTable = () => {
    const excelData = useSelector((state) => state.excel.data) || [];
    const fileData = useSelector((state) => state.file?.data) || [];

    if (excelData.length === 0) {
        return <h3>Please upload a file</h3>;
    }

    const statusCounts = {};
    const storyPointsByStatus = {};
    let total = 0;
    let totalStoryPoints = 0;

    excelData.forEach((item) => {
        const status = item.Status?.trim() || "Unknown";
        const storyPoints = parseFloat(item["Story Points"]) || 0;

        if (!statusCounts[status]) {
            statusCounts[status] = 0;
            storyPointsByStatus[status] = 0;
        }
        statusCounts[status] += 1;
        storyPointsByStatus[status] += storyPoints;

        total += 1;
        totalStoryPoints += storyPoints;
    });

    const summaryRef = useRef();

    const handleScreenshot = async () => {
        const element = summaryRef.current;
        const canvas = await html2canvas(element);
        const dataURL = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileData}_Ticket_Overview.png`;
        link.click();
    };

    const tableStyle = {
        width: "50%", // widened to accommodate new column
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
                            <th width= "50%" style={{ ...cellStyle, backgroundColor: "lightgrey" }}>Status</th>
                            <th width= "25%" style={{ ...cellStyle, backgroundColor: "lightgrey" }}>Stories</th>
                            <th width= "25%" style={{ ...cellStyle, backgroundColor: "lightgrey" }}>Story Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedStatuses).map(([groupName, statuses]) => {
                            const groupStoryCount = statuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
                            const groupStoryPoints = statuses.reduce((sum, status) => sum + (storyPointsByStatus[status] || 0), 0);

                            if (groupStoryCount === 0) return null;

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
                                        <td style={{ ...cellStyle, fontWeight: "bold" }}>{groupStoryCount}</td>
                                        <td style={{ ...cellStyle, fontWeight: "bold" }}>{groupStoryPoints}</td>
                                    </tr>
                                    {statuses.map((status) => {
                                        if (!statusCounts[status]) return null;
                                        return (
                                            <tr key={status} style={{fontSize:"14px"}}>
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
                                                <td style={{ ...cellStyle, backgroundColor: "#f9f9f9" }}>{storyPointsByStatus[status]}</td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                        <tr>
                            <td style={cellStyle}><strong>Total</strong></td>
                            <td style={cellStyle}><strong>{total}</strong></td>
                            <td style={cellStyle}><strong>{totalStoryPoints}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SummaryTable;