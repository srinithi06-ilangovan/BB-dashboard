
import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jql } from '../utils/jqlHelper';
import './Styles/livedataview.css'

import { calculateSprintDates, calculateSprintEndDate, calculateStartDateFor14DayPeriod } from '../utils/dataCalculator';

export const exportToExcel = (jsonData, startDate, targetDate, fileName = 'data', sheetName = 'sheet1') => {
    if (!jsonData || jsonData.length === 0) {
        console.warn("No data provided for Excel export.");
        return;
    }

    // 1. Create a worksheet from JSON data
    // json_to_sheet automatically extracts headers from the keys of the first object
    const ws = XLSX.utils.json_to_sheet(jsonData);

    // 2. Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${fileName}_${targetDate}_sheet`);

    // 3. Write the workbook to a buffer
    // { bookType: 'xlsx' } specifies the Excel format
    // { type: 'array' } tells it to output as a byte array
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // 4. Create a Blob from the buffer and save it
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${fileName}_${startDate} to ${targetDate}.xlsx`);
};





const LiveDataView = () => {

    const initialjql = `
Project in (SCPA, PAYSYS, TMSPON) AND Type NOT in ("EPIC")
AND ((assignee in (saurabh.patil, sravanthi.vettigunta, ayush.arikar, g.chinniraviteja)) 
OR ( (issueFunction in commented("by saurabh.patil") OR issuekey in updatedBy(saurabh.patil) )
OR ( issueFunction in commented("by sravanthi.vettigunta") OR issuekey in updatedBy( sravanthi.vettigunta) )
OR ( issueFunction in commented("by ayush.arikar") OR issuekey in updatedBy(ayush.arikar) )
OR ( issueFunction in commented("by g.chinniraviteja") OR issuekey in updatedBy(g.chinniraviteja) ) )) 
`

    const [targetDate, setTargetDate] = useState('2024-12-31');
		  useEffect(() => {
		    const today = new Date();
		    const yyyy = today.getFullYear();
		    const mm = String(today.getMonth() + 1).padStart(2, "0");
		    const dd = String(today.getDate()).padStart(2, "0");
		    setTargetDate(`${yyyy}-${mm}-${dd}`);
		  }, []);

	
	
    const [query, setQuery] = useState(initialjql);
    const [jqlQuery, setJqlQuery] = useState('');
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [podName, setPodName] = useState('Money Matrix');
    
	const startDate = calculateStartDateFor14DayPeriod(targetDate);
	const sprintPeriod = calculateSprintDates(targetDate)
	const sprStartDate = sprintPeriod.sprintStart;
	const sprEndDate = sprintPeriod.sprintEnd;

	console.log("-------->>>>>>> ", sprEndDate);
	

    useEffect(() => {
        console.log("-----------Srinithi ----- " + JSON.stringify(calculateSprintDates(targetDate)))
        const dynamicDateJql = `AND ( ((updatedDate >=${sprintPeriod.sprintStart}) AND updatedDate <=${sprintPeriod.sprintEnd}) OR (issueFunction in commented ( "after ${sprintPeriod.sprintStart} before ${sprintPeriod.sprintEnd}")) ) ORDER BY status ASC`
        const constructedJql = `${query} ${dynamicDateJql}`;

        if (!targetDate) {
            setJqlQuery(initialjql);
            return;
        }

        setJqlQuery(constructedJql);

    }, [targetDate, query]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatuses({});

        try {
            const response = await axios.post('https://bb-kanban-board.onrender.com/api/jira-status', {
                jqlQuery,
                //`${sprintPeriod.sprintEnd}`
		targetDate:sprEndDate, 
		startDate:sprStartDate
            });
            
            setStatuses(response.data);
            // console.log(response.data)
		
            exportToExcel(response.data, sprStartDate , sprEndDate,podName) 
        } catch (err) {
            console.error('Error fetching Jira statuses:', err);
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className={"info-container"}>
                <div>
                    <textarea
                        id="jqlQuery"
                        rows="5"
                        cols="70"
                        value={jqlQuery}
                        onChange={(e) => setJqlQuery(e.target.value)}
                        style={{ padding: '8px', boxSizing: 'border-box', marginBottom: '15px' }}
                    />
                    <div className={"date-container"}>
                        <button onClick={() => {
                            setTargetDate(calculateSprintEndDate(sprintPeriod.sprintEnd, "prev"))
                        }}> {'<< Prev Sprint End'}</button>
                        <input
                            type="date"
                            id="targetDate"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            style={{ padding: '8px', boxSizing: 'border-box' }}
                        />
                        <button onClick={() => {
                            setTargetDate(calculateSprintEndDate(sprintPeriod.sprintEnd, "next"))
                        }}>{'Next Sprint End >>'}</button>

                        <button onClick={handleSubmit} disabled={!targetDate || loading} style={{ backgroundColor: `${targetDate ? '#3498db' : '#e0e0e0'}` }}>
                            {loading ? 'Fetching...' : 'Submit'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ color: 'red', marginTop: '20px' }}>
                            <p>Error: {error}</p>
                        </div>
                    )}
                </div>
                <div className='pod-container'>
                    <button className='btn' onClick={() => { setQuery(jql['payments']);setPodName('Payments') }}>Payments</button>
                    <button className='btn' onClick={() => { setQuery(jql['orion']);setPodName('Orion') }}>Orion</button>
          	    <button className='btn' onClick={() => { setQuery(jql['moneymatrix']);setPodName('Money_Matrix') }}>Money Matrix</button>
                    <button className='btn' onClick={() => { setQuery(jql['digitalpenny']);setPodName('Digital_Penny') }}>Digital Penny</button>
           	    <button className='btn' onClick={() => { setQuery(jql['powerplay']);setPodName('Power_Play') }}>Power Play</button>
                </div>
            </div>
       

        </>
    );
}

export default LiveDataView;