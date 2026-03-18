
import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { pod as podResource } from '../utils/jqlHelper';
import './Styles/livedataview.css'

import { calculateSprintDates, calculateSprintEndDate, calculateStartDateFor14DayPeriod, calculateMonthlyDates, calculateQuarterlyDates, calculateYearlyDates } from '../utils/dataCalculator';

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
    
    saveAs(data, `Consolidated_2025_to_2926.xlsx`);
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

    // Helper function to generate date-based JQL
    const generateDateJql = (startDate, endDate) => {
        return `AND ( ((updatedDate >=${startDate}) AND updatedDate <=${endDate}) OR (issueFunction in commented ( "after ${startDate} before ${endDate}")) ) ORDER BY status ASC`;
    };

    const dynamicDateJql = generateDateJql(sprintPeriod.sprintStart, sprintPeriod.sprintEnd);

    const generateJQL = (podKey, customStartDate = null, customEndDate = null) => {
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

            // Use custom dates if provided, otherwise use sprint dates
            const dateJql = (customStartDate && customEndDate)
                ? generateDateJql(customStartDate, customEndDate)
                : dynamicDateJql;

            setJqlQuery(baseJQL + dateJql)
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
    
    const handleSubmit = async (e, periodType = 'sprint') => {
        const getTargetYear = new Date(targetDate).getFullYear()
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatuses({});

        // Calculate dates based on period type
        let periodStart, periodEnd, periodLabel;

        switch(periodType) {
            case 'monthly':
                const monthlyDates = calculateMonthlyDates(targetDate);
                periodStart = monthlyDates.periodStart;
                periodEnd = monthlyDates.periodEnd;
                periodLabel = monthlyDates.periodLabel;
                break;

            case 'quarterly':
                const quarterlyDates = calculateQuarterlyDates(targetDate);
                periodStart = quarterlyDates.periodStart;
                periodEnd = quarterlyDates.periodEnd;
                periodLabel = quarterlyDates.periodLabel;
                break;

            case 'yearly':
                const yearlyDates = calculateYearlyDates(targetDate);
                periodStart = yearlyDates.periodStart;
                periodEnd = yearlyDates.periodEnd;
                periodLabel = yearlyDates.periodLabel;
                break;

            case 'consolidated':
                // From Jan 1, 2025 to current date
                periodStart = '2025-01-01';
                const today = new Date();
                periodEnd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                periodLabel = '2025-2026-Consolidated';
                break;

            case 'sprint':
            default:
                periodStart = sprStartDate;
                periodEnd = sprEndDate;
                periodLabel = sprintPeriod.getWeekPeriod;
                break;
        }

        // Regenerate JQL with period-specific dates
        const getQuarterInfo = getQuarter(targetDate);

        // For yearly reports, consolidate users from all quarters of the year
        // For consolidated reports, consolidate users from all quarters of 2025 and 2026
        let userList;
        if (periodType === 'yearly') {
            const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            const allUsers = new Set();

            allQuarters.forEach(quarter => {
                const quarterKey = `${quarter}_${getTargetYear}`;
                if (podResource[podName][quarterKey]) {
                    const quarterUsers = podResource[podName][quarterKey].split(',').map(name => name.trim());
                    quarterUsers.forEach(user => allUsers.add(user));
                }
            });

            userList = Array.from(allUsers).join(', ');
        } else if (periodType === 'consolidated') {
            const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            const allYears = [2025, 2026];
            const allUsers = new Set();

            allYears.forEach(year => {
                allQuarters.forEach(quarter => {
                    const quarterKey = `${quarter}_${year}`;
                    if (podResource[podName] && podResource[podName][quarterKey]) {
                        const quarterUsers = podResource[podName][quarterKey].split(',').map(name => name.trim());
                        quarterUsers.forEach(user => allUsers.add(user));
                    }
                });
            });

            userList = Array.from(allUsers).join(', ');
        } else {
            userList = podResource[podName][`${getQuarterInfo}_${getTargetYear}`];
        }

        let updatedJqlQuery = jqlQuery;
        if (userList) {
            const userListSplit = userList.split(',').map(name => name.trim());
            let baseJQL = `Project in (SCPA, PAYSYS, TMSPON) AND Type NOT in ("EPIC")\nAND ((assignee in (${userListSplit.join(', ')}))`;
            userListSplit.forEach(name => {
                baseJQL += `\nOR (issueFunction in commented("by ${name}") OR issuekey in updatedBy(${name}))`;
            });
            baseJQL += `\n)`;

            // Generate date JQL with period-specific dates
            const dateJql = generateDateJql(periodStart, periodEnd);
            updatedJqlQuery = baseJQL + dateJql;
        }

        try {
            const response = await axios.post('https://agile-kanban-dashboard.onrender.com/api/jira-status', {
                jqlQuery: updatedJqlQuery,
                targetDate: periodEnd,
                startDate: periodStart
            });

            setStatuses(response.data);

            exportToExcel(response.data, periodStart, periodEnd, podName, periodLabel, getTargetYear)
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
                        }}> {'Prev Sprint End'}</button>
                        <input
                            type="date"
                            id="targetDate"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            style={{ padding: '8px', boxSizing: 'border-box' }}
                        />
                        <button onClick={() => {
                            setTargetDate(calculateSprintEndDate(sprintPeriod.sprintEnd, "next"))
                        }}>{'Next Sprint End'}</button>

                        <button onClick={(e) => handleSubmit(e, 'sprint')} disabled={!targetDate || !jqlQuery || loading} style={{ backgroundColor: `${jqlQuery ? '#3498db' : '#e0e0e0'}` }}>
                            {loading ? 'Fetching...' : 'Sprint Submit'}
                        </button>

                         <button onClick={(e) => handleSubmit(e, 'monthly')} disabled={!targetDate || !jqlQuery || loading} style={{ backgroundColor: `${jqlQuery ? '#27ae60' : '#e0e0e0'}` }}>
                            {loading ? 'Fetching...' : 'Monthly Submit'}
                        </button>

                         <button onClick={(e) => handleSubmit(e, 'quarterly')} disabled={!targetDate || !jqlQuery || loading} style={{ backgroundColor: `${jqlQuery ? '#e67e22' : '#e0e0e0'}` }}>
                            {loading ? 'Fetching...' : 'Quarterly Submit'}
                        </button>

                         <button onClick={(e) => handleSubmit(e, 'yearly')} disabled={!targetDate || !jqlQuery || loading} style={{ backgroundColor: `${jqlQuery ? '#9b59b6' : '#e0e0e0'}` }}>
                            {loading ? 'Fetching...' : 'Yearly Submit'}
                        </button>

                         <button onClick={(e) => handleSubmit(e, 'consolidated')} disabled={!targetDate || !jqlQuery || loading} style={{ backgroundColor: `${jqlQuery ? '#c0392b' : '#e0e0e0'}` }}>
                            {loading ? 'Fetching...' : 'Consolidated 2025-2026'}
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