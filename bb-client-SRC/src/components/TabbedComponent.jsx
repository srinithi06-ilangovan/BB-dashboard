import React, { useState, useEffect } from "react";
import SummaryTable from "./SummaryTable";
import TicketStatusTable from "./TicketStatusTable";
import TicketStatusPieChart from "./TicketStatusPieChart";
import BarChart from "./BarChart";
import StatusOverview from "./StatusOverview";
import AISummaryGenerator from "./AgileReportGenerator";

import { setAiReportData } from "../redux/aiReportSlice";
import { useSelector, useDispatch } from "react-redux";
import LiveDataView from "./LiveDataView";


const TabbedComponent = ({ fileSelected }) => {



    const [activeTab, setActiveTab] = useState("jiraData");
    const excelData = useSelector((state) => state.excel?.data) || [];
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [sheetNameFlag, setSheetNameFlag] = useState('');
    const sheetName = useSelector((state) => state.sheetName?.data);
    const dispatch = useDispatch();
	

    // useEffect(() => {
    //     if (fileSelected) {
    //         setLoading(true);
    //         const timer = setTimeout(() => {
    //             setLoading(false);
    //         }, 2000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [fileSelected]);



const userPrompt = `Consolidated and Summarise tickets summary in respective groups in less than 3 points in each group and ignore the group if it does not contain data. instead of In Progress (GroupID 3) just  In Progress. likewise for all group. Use following template: Overall Summary : <<content with bullet points>>,  Risk : <<content with bullet points>>,  Mitigation: <<content with bullet points>>, For each group without story points, without mentioning Assignee and without ticket number  <group name>: __MainFocus : <<content>>, __KeyFocus:  <<List content in disc style>> .  And return data in markdown text where as MainFocus & KeyFocus text should be in points and group name, Overall Summary, Risk, Mitigation in bold.`
 
    const handleSend = async () => {
        setLoader(true)
        try {
            const res = await fetch("https://bb-kanban-board.onrender.com/api/ai-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: excelData, prompt: userPrompt }),
            });
            const data = await res.json();
            // setResult(data.reply)
            dispatch(setAiReportData(data.reply));
            setSheetNameFlag(sheetName);
            // console.log("Backend response:", data.reply);
        }
        catch (error) {
            console.error("Error sending to backend:", error);
            alert("There was an error sending the message.");
        }
        finally {
            setLoader(false)
        }
    }

    return (
        <div className="tabbed-container">
            {/* Tab Navigation */}
            <div className="tab-nav">
                <div
                    onClick={() => setActiveTab("jiraData")}
                    className={activeTab === "jiraData" ? "tab active" : "tab"}> Live Jira Data
                </div>
                <div
                    onClick={() => setActiveTab("statusOverview")}
                    className={activeTab === "statusOverview" ? "tab active" : "tab"}> Status Overview
                </div>
                <div
                    onClick={() => setActiveTab("summary")}
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
               <div

                    className={activeTab === "AIReport" ? "tab active" : "tab"}>
                    <span onClick={() => setActiveTab("AIReport")}>AI Summary</span>
                    <span onClick={() => handleSend()} style={{ marginLeft: "10px",   verticalAlign: "sub" }}>
                        <img height="20" width="20" src={"/public/Icons/reload.png"} />
                    </span>
                </div>
                
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                { 
                    <>
                        {loading ? (
                            <div className="spinner"></div> // Spinner inside the tab
                        ) : activeTab === "statusOverview"
                            ? <StatusOverview />
                            : activeTab === "summary" ? (
                                <SummaryTable />
                            ) : activeTab === "ticketStatus" ? (
                                <TicketStatusTable />)
                                : activeTab === "PieChart" ? (
                                    <TicketStatusPieChart />)
                                    : activeTab === "Percentage" ? (
                                        <BarChart />)
                                        : activeTab === "AIReport" ? (
                                       <AISummaryGenerator loader={loader} sheetNameFlag={sheetNameFlag}/>)
                                        : <LiveDataView />
                        }
                    </>
                }
            </div>
        </div>
    );
};

export default TabbedComponent;
