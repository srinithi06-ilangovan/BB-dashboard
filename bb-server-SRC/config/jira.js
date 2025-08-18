// config/jira.js
// No need for dotenv.config() here, it's done once in server.js
import dotenv from 'dotenv';
dotenv.config();
const JIRA_URL = process.env.JIRA_BASE_URL;
const JIRA_PERSONAL_ACCESS_TOKEN = process.env.JIRA_PAT;

// Export an object containing the Jira configuration
export default {
    JIRA_URL,
    JIRA_PERSONAL_ACCESS_TOKEN
};