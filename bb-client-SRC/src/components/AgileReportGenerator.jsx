import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Remarkable } from 'remarkable';
import { setAiReportData } from "../redux/aiReportSlice";
import './Styles/markdown.css'

export const TextAreaPreview = ({ promptVal ,sendFlag}) => {
    const md = new Remarkable();
    const renderedHTML = md.render(promptVal);
    return <>
        <hr />

	<h4 style={{color:'#0073e6'}}>
            {`Key Highlights -  ${sendFlag}`}
        </h4>
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: renderedHTML }} />;
    </>

}

const AISummaryGenerator = ({loader, sheetNameFlag}) => {
	console.log(sheetNameFlag, "===== sheetNameFlag===");
    const excelData = useSelector((state) => state.excel?.data) || [];
    const aiReportData = useSelector((state) => state.aiReport?.data)
    // console.log(aiReportData, 'aiReportData')
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    // const [userPrompt, setUserPrompt] = useState('Summarise only tickets details in respective categories in below 3 lines without ticket number and priority');
//Generate highlevel Agile summary of the key highlights. Consolidate the updates based on status group from the above Kanban report as a title of Key highlights. All the status of the content in each group should be in bullet points
    


//	const [userPrompt, setUserPrompt] = useState('Consolidated crisp summary of the key highlights. Consolidate the updates based on status group from the above Kanban report as a title of Key highlights. All the status of the content in each group should be in bullet points ');

//const [userPrompt, setUserPrompt] = useState('Generate highlevel Agile summary of the key highlights. Consolidate the updates based on status group with precious information from the above Kanban report as a title of Key highlights. All the status of the content in each group as follows. In Progress:\n\t* Main Focus: Payment UI enhancements.\n\t* Specific Enhancement: Adding e2e visual comparison tests.\n\t\t	•	Payment UI enhancements.\n\t\t	•	E2E visual comparison tests.\n\t* Next Action Plan\nDeployment:\n\t* Main Focus: Involves displaying vouchers on the Gift Cards and Codes page.\nDone:\n\t* Main Focus: Includes a wide range of closed tasks, encompassing UI automation, API improvements, database updates, and credential updates related to various payment processors (PayPal, Mastercard Click to Pay, TalonOne) and loyalty programs\n\t\t');

const [userPrompt, setUserPrompt] = useState(`Consolidated and Summarise tickets summary in respective groups in less than 3 points in each group 
    and ignore the group if it does not contain data. instead of In Progress (GroupID 3) just  In Progress. likewise for all group. example template
    without story points, assignee and ticket number 
    <group name>: MainFocus : <<content>>, KeyFocus : <<content>>
    and return data in markdown text where as MainFocus & KeyFocus text should be in points and group name in bold
`);

  const [result, setResult] = useState(null)
    const handleSend = async () => {
        setLoading(true)
        try {
            const res = await fetch("https://bb-kanban-board.onrender.com/api/ai-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: excelData, prompt: userPrompt }),
            });
            const data = await res.json();
            setResult(data.reply)
            dispatch(setAiReportData(data.reply));
            console.log("Backend response:", data.reply);
        }
        catch (error) {
            console.error("Error sending to backend:", err);
            alert("There was an error sending the message.");
        }
        finally {
            setLoading(false)
        }
    }
    if (excelData.length === 0) {
        return <h3>Please upload a file</h3>;
    }
    return (
         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
             {loader && <p>{"Loading..."}</p>  } 
            {aiReportData && <TextAreaPreview promptVal={aiReportData} sendFlag={sheetNameFlag} />}
            {/* <TextAreaPreview promptVal={result} /> */}
        </div>
    );
}

export default AISummaryGenerator