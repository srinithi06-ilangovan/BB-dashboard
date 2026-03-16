export function calculateStartDateFor14DayPeriod(endDateString) {
    const endDate = new Date(endDateString);
    const startDate = new Date(endDate);

    startDate.setDate(endDate.getDate() - 13);

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function calculateSprintEndDate(endDateString, prevOrNext) {
    const endDate = new Date(endDateString);
    const startDate = new Date(endDate);
    const endDateCal = prevOrNext === 'next' ? endDate.getDate() + 14 : endDate.getDate() - 14
    startDate.setDate(endDateCal);

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// dataCalculator.js

export const calculateSprintDates = (date, sprintPeriodDays = 14) => {
    // 1. Normalize Dates: Set both dates to the start of their day (midnight UTC)
    // to ensure consistent calculations regardless of time component.
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0); // Use UTC to avoid timezone issues

    const referenceDate = new Date('2024-12-31T00:00:00.000Z');
    referenceDate.setUTCHours(0, 0, 0, 0); // Use UTC to avoid timezone issues

    // 2. Calculate Days Difference:
    // Get the difference in milliseconds and convert to days.
    // Ensure the difference is always based on UTC for consistency.
    const diffTime = selectedDate.getTime() - referenceDate.getTime();
    console.log(selectedDate.getTime(),'selectedDate.getTime()',referenceDate.getTime(),'referenceDate.getTime()')
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    console.log( diffDays,'diffDays')
   
// const getWeekPeriod = `W${Math.floor(diffDays/7)+1}-${Math.ceil(diffDays/7)+1}`
    // 3. Determine Sprint Index:
    // How many full sprint periods have passed since the reference date.
    const sprintIndex = Math.floor(diffDays / sprintPeriodDays);
    console.log(sprintIndex,'sprintIndex')

    // 4. Calculate Sprint Start Date:
    // Start from the reference date and add the calculated number of days.
    const sprintStartDate = new Date(referenceDate);
    sprintStartDate.setUTCDate(referenceDate.getUTCDate() + (sprintIndex * sprintPeriodDays));

    // 5. Calculate Sprint End Date:
    // Start from the calculated sprintStartDate and add the sprint duration minus one day (inclusive).
    const sprintEndDate = new Date(sprintStartDate);


    sprintEndDate.setUTCDate(sprintEndDate.getUTCDate() + sprintPeriodDays - 1);

    	const sprintStart = sprintStartDate.toISOString().split('T')[0];
	const sprintEnd = sprintEndDate.toISOString().split('T')[0];

     const sprintStartDiffDays = sprintIndex * sprintPeriodDays;

    const startWeek = Math.floor(sprintStartDiffDays / 7) + 1;
    const endWeek = startWeek + 1;
    const getWeekPeriod = `W${startWeek}-${endWeek}`;
    console.log(getWeekPeriod,'getWeekPeriod')
    return { sprintStart, sprintEnd, getWeekPeriod };
};


// Calculate monthly dates - first and last day of the month
export const calculateMonthlyDates = (date) => {
    // Parse the date string to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);

    // First day of the month
    const monthStart = new Date(year, month - 1, 1);

    // Last day of the month (0th day of next month)
    const monthEnd = new Date(year, month, 0);

    // Format dates manually to avoid timezone conversion
    const monthStartFormatted = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEndFormatted = `${year}-${String(month).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];
    const periodLabel = `${monthName} ${year}`;

    return {
        periodStart: monthStartFormatted,
        periodEnd: monthEndFormatted,
        periodLabel
    };
};

// Calculate quarterly dates - first and last day of the quarter
export const calculateQuarterlyDates = (date) => {
    // Parse the date string to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);

    // Determine which quarter (1-4) based on month (1-12)
    const quarter = Math.floor((month - 1) / 3) + 1;

    // Calculate start month of quarter (1, 4, 7, or 10)
    const startMonth = (quarter - 1) * 3 + 1;

    // Calculate end month of quarter (3, 6, 9, or 12)
    const endMonth = quarter * 3;

    // Last day of the end month
    const lastDayOfEndMonth = new Date(year, endMonth, 0).getDate();

    // Format dates manually
    const quarterStartFormatted = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    const quarterEndFormatted = `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDayOfEndMonth).padStart(2, '0')}`;

    const periodLabel = `Q${quarter} ${year}`;

    return {
        periodStart: quarterStartFormatted,
        periodEnd: quarterEndFormatted,
        periodLabel
    };
};

// Calculate yearly dates - first and last day of the year
export const calculateYearlyDates = (date) => {
    // Parse the date string to avoid timezone issues
    const [year] = date.split('-').map(Number);

    // Format dates manually
    const yearStartFormatted = `${year}-01-01`;
    const yearEndFormatted = `${year}-12-31`;

    const periodLabel = `FY ${year}`;

    return {
        periodStart: yearStartFormatted,
        periodEnd: yearEndFormatted,
        periodLabel
    };
};

// export const getInitialSprintDates = (refStartDate, sprintPeriodDays) => {
//     const today = new Date();
//     today.setUTCHours(0, 0, 0, 0); // Normalize today's date to midnight UTC

//     const { sprintStartDate, sprintEndDate } = calculateSprintDates(today, sprintPeriodDays);

//     return {
//         selectedDate: today,
//         sprintStartDate: sprintStartDate,
//         sprintEndDate: sprintEndDate
//     };
// };