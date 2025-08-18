import React, { useState, useEffect } from "react";
import SummaryTable from "./SummaryTable";
import TicketStatusTable from "./TicketStatusTable";
import TicketStatusPieChart from "./TicketStatusPieChart";
import BarChart from "./BarChart";
import StatusOverview from "./StatusOverview";

 
const TabbedComponent = ({ fileSelected }) => {

    const [activeTab, setActiveTab] = useState("statusOverview");
    const [loading, setLoading] = useState(false);
 
    useEffect(() => {
        if (fileSelected) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [fileSelected]);
 
    return (
        <div className="tabbed-container">
            {/* Tab Navigation */}
            <div className="tab-nav">
                <div
                    onClick={() => setActiveTab("statusOverview") }
                    className={activeTab === "statusOverview" ? "tab active" : "tab"}> Status Overview 
                </div>
                <div
                    onClick={() => setActiveTab("summary") }
                    className={activeTab === "summary" ? "tab active" : "tab"}> Tickets Overview 
                </div>

                <div
                    onClick={() => setActiveTab("ticketStatus")}
                    className={activeTab === "ticketStatus" ? "tab active" : "tab"}> Ticket Status Summary
                </div>
                <div
                    onClick={() => setActiveTab("PieChart")}
                    className={activeTab === "PieChart" ? "tab active" : "tab"}> Pie Chart
                </div>
                <div
                    onClick={() => setActiveTab("Percentage")}
                    className={activeTab === "Percentage" ? "tab active" : "tab"}> Progress Chart
                </div>
            </div>
 
            {/* Tab Content */}
            <div className="tab-content">
                {!fileSelected ? (
                    <div className="warning">Please upload a file</div>
                ) : (
                   <>
                        {loading ? (
                            <div className="spinner"></div> // Spinner inside the tab
                        ) : activeTab === "statusOverview"
                        ? <StatusOverview />
                        : 
                        activeTab === "summary" ? (
                            <SummaryTable />
                        ) : activeTab === "ticketStatus" ? (
                            <TicketStatusTable />)
                        : activeTab === "PieChart" ? (
                             <TicketStatusPieChart />)
                            : <BarChart />
                        }
                    </>
                )}
            </div>
        </div>
    );
};
 
export default TabbedComponent;
 