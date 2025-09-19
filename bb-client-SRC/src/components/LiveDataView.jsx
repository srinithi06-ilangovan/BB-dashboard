
import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { pod as podResource } from '../utils/jqlHelper';
import './Styles/livedataview.css'

import { calculateSprintDates, calculateSprintEndDate, calculateStartDateFor14DayPeriod } from '../utils/dataCalculator';

export const exportToExcel = (jsonData, startDate, targetDate, fileName , weekPeriod, targetYear) => {
    if (!jsonData || jsonData.length === 0) {
        console.warn("No data provided for Excel export.");
        return;
    }

    // 1. Create a worksheet from JSON data
    // json_to_sheet automatically extracts headers from the keys of the first object
    const ws = XLSX.utils.json_to_sheet(jsonData);

    // 2. Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${targetYear}-${fileName}-${weekPeriod}`);

    // 3. Write the workbook to a buffer
    // { bookType: 'xlsx' } specifies the Excel format
    // { type: 'array' } tells it to output as a byte array
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // 4. Create a Blob from the buffer and save it
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${fileName}-${weekPeriod}_${startDate} to ${targetDate}.xlsx`);
};




function getQuarter(inputDate) {
    const date = new Date(inputDate); // ensures it's a Date object
    if (isNaN(date)) {
        throw new Error("Invalid date");
    }
    const month = date.getMonth(); // 0-based: Jan = 0, Dec = 11
    return `Q${Math.floor(month / 3) + 1}`;
}




const LiveDataView = () => {

    const [targetDate, setTargetDate] = useState('2024-12-31');
    const [jqlQuery, setJqlQuery] = useState('');
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [podName, setPodName] = useState(null);

    const startDate = calculateStartDateFor14DayPeriod(targetDate);
    const sprintPeriod = calculateSprintDates(targetDate)
    const sprStartDate = sprintPeriod.sprintStart;
    const sprEndDate = sprintPeriod.sprintEnd;

    const dynamicDateJql = `AND ( ((updatedDate >=${sprintPeriod.sprintStart}) AND updatedDate <=${sprintPeriod.sprintEnd}) OR (issueFunction in commented ( "after ${sprintPeriod.sprintStart} before ${sprintPeriod.sprintEnd}")) ) ORDER BY status ASC`


    const generateJQL = (podKey) => {
        const getQuarterInfo = getQuarter(targetDate)
        const getTargetYear = new Date(targetDate).getFullYear()

        const userList = podResource[podKey][`${getQuarterInfo}_${getTargetYear}`];
        if (userList) {
            const userListSplit = userList.split(',').map(name => name.trim());
            let baseJQL = `Project in (SCPA, PAYSYS, TMSPON) AND Type NOT in ("EPIC")\nAND ((assignee in (${userListSplit.join(', ')}))`;
            userListSplit.forEach(name => {
                baseJQL += `\nOR (issueFunction in commented("by ${name}") OR issuekey in updatedBy(${name}))`;
            });
            baseJQL += `\n)`;

            // setJQL(baseJQL+);
            setJqlQuery(baseJQL + dynamicDateJql)
            setPodName(podKey)
            setError('')
        }
        else {
            setJqlQuery('')
            setPodName(podKey)
            setError(`No resources list found for ${podKey} in ${getQuarterInfo} ${getTargetYear}`);
        }

    };

    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setTargetDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    useEffect(() => {
        generateJQL(podName || 'MoneyMatrix')

    }, [targetDate]);
    
    const handleSubmit = async (e) => {
        const getTargetYear = new Date(targetDate).getFullYear()
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatuses({});

        try {
            const response = await axios.post('https://agile-kanban-dashboard.onrender.com/api/jira-status', {
                jqlQuery,
                //`${sprintPeriod.sprintEnd}`
                targetDate: sprEndDate,
                startDate: sprStartDate
            });

            setStatuses(response.data);
            // console.log(response.data)

            exportToExcel(response.data, sprStartDate, sprEndDate, podName, sprintPeriod.getWeekPeriod,getTargetYear)
        } catch (err) {
            console.error('Error fetching Jira statuses:', err);
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <h2 style={{ color: 'green',margin:0 }}>{podName}</h2>
            <div className={"info-container"}>
                <div>
                    <textarea
                        id="jqlQuery"
                        rows="15"
                        cols="120"
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

                        <button onClick={handleSubmit} disabled={!targetDate || !jqlQuery || loading} style={{ backgroundColor: `${jqlQuery ? '#3498db' : '#e0e0e0'}` }}>
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
                    <button className='btn' onClick={() => { generateJQL('Payments') }}>Payments</button>
                    <button className='btn' onClick={() => { generateJQL('Orion') }}>Orion</button>
                    <button className='btn' onClick={() => generateJQL('MoneyMatrix')}>Money Matrix</button>
                    <button className='btn' onClick={() => { generateJQL('DigitalPenny') }}>Digital Penny</button>
                    <button className='btn' onClick={() => { generateJQL('PowerPlay') }}>Power Play</button>
                </div>
            </div>


        </>
    );
}

export default LiveDataView;