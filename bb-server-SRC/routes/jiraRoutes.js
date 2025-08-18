// routes/jiraRoutes.js
import express from 'express';
import { getIssueStatusAtDate } from '../services/jiraService.js'; // Import the service function
import jiraConfig from '../config/jira.js'; // Import Jira configuration

// console.log(jiraConfig,'jiraConfig ====>')
const router = express.Router(); // Create an Express Router instance

// Define the POST API endpoint for getting Jira statuses at a date
router.post('/jira-status', async (req, res, next) => {
    const { jqlQuery, targetDate, startDate } = req.body;

    // Basic request body validation
    if (!jqlQuery || !targetDate) {
        return res.status(400).json({ error: 'Missing jqlQuery or targetDate in request body.' });
    }

    // Check if Jira config is available (should be set via environment variables)
    if (!jiraConfig.JIRA_URL || !jiraConfig.JIRA_PERSONAL_ACCESS_TOKEN) {
        return res.status(500).json({ error: 'Jira URL or Personal Access Token not configured in environment variables.' });
    }

    try {
        console.log(`Received request: JQL=${jqlQuery}, StartDate = ${startDate}, Target Date=${targetDate} `);
        const statuses = await getIssueStatusAtDate(
            jiraConfig.JIRA_URL,
            jiraConfig.JIRA_PERSONAL_ACCESS_TOKEN,
            jqlQuery,
            targetDate, 
			startDate
        );
        res.json(statuses); // Send the results back as JSON
    } catch (error) {
        // Pass the error to the next middleware (global error handler in server.js)
        next(error);
    }
});

export default router; // Export the router