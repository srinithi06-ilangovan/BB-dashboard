export const calculateStatusDurationsAtDate = (issue) => {
    const createdDate = new Date(issue.fields.created);
    const histories = issue.changelog?.histories || [];

    // Use current date and time instead of targetDate parameter
    const currentDateTime = new Date();

    // 1. Identify all status changes
    let statusChanges = [];
    histories.forEach(history => {
        const statusItem = history.items.find(item => item.field === "status");
        if (statusItem) {
            statusChanges.push({
                date: new Date(history.created),
                fromStatus: statusItem.fromString,
                toStatus: statusItem.toString
            });
        }
    });

    // 2. Sort Oldest to Newest
    statusChanges.sort((a, b) => a.date - b.date);

    const durations = {};
    let lastTimestamp = createdDate;

    // Start with the initial status (the one it was created in)
    let currentStatus = statusChanges.length > 0 ? statusChanges[0].fromStatus : issue.fields.status.name;

    // 3. The Accumulator Loop
    for (const change of statusChanges) {
        // Stop if the change happened after current date/time
        if (change.date > currentDateTime) break;

        const durationMs = change.date - lastTimestamp;

        // Sum the duration for this specific visit to the status
        durations[currentStatus] = (durations[currentStatus] || 0) + durationMs;

        // Update pointers for the next segment
        lastTimestamp = change.date;
        currentStatus = change.toStatus;
    }

    // 4. The Final "Active" Segment
    // Add the time from the last transition until current date/time,
    // regardless of status type (including "Closed", "Done", etc.)
    const finalSegmentMs = currentDateTime - lastTimestamp;
    if (finalSegmentMs > 0) {
        durations[currentStatus] = (durations[currentStatus] || 0) + finalSegmentMs;
    }

    console.log(finalSegmentMs, 'finalSegmentMs', 'currentDateTime:', currentDateTime.toISOString());
    return durations;
};
export const formatDuration = (ms) => {
    if (!ms || ms < 0) return "0d 0h 0m";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const d = Math.floor(totalSeconds / 86400);
    return `${d}d ${h}h ${m}m`;
};