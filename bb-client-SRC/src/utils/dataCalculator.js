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
    console.log(diffDays,'diffDays')

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

    return { sprintStart, sprintEnd };
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