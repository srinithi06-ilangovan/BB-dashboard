// services/jiraService.js
import axios from 'axios';

/**
 * Fetches the status of Jira issues on a specific target date and returns
 * an array of issue objects with detailed properties, including custom grouping.
 * Dates (Created, Updated) will be in ISO 8601 string format as provided by Jira API.
 *
 * @param {string} jiraUrl - The base URL of the Jira instance.
 * @param {string} personalAccessToken - The Jira Personal Access Token.
 * @param {string} jqlQuery - The JQL query to find issues.
 * @param {string} targetDateStr - The target date in 'YYYY-MM-DD' format.
 * @returns {Promise<Array<Object>>} An array of issue objects, each containing detailed issue information.
 * @throws {Error} If there's an error interacting with the Jira API.
 */
async function getIssueStatusAtDate(jiraUrl, personalAccessToken, jqlQuery, targetDateStr, startDateStr) {
	const formatter = new Intl.DateTimeFormat('en-GB', {
	    // timeStyle: "medium",
	    dateStyle: "short",
	});
	
	function formatDateWithHyphen(date) {
		console.error(`formatDateWithHyphen input: ${date}`);
		
	    const dateArray = date.split('/');
	    const month = dateArray[0];
	    const day = dateArray[1];
	    const year = dateArray[2];
		
		console.error(`formatDateWithHyphen output: ${year}-${month}-${day}`);
	    return (`${year}-${month}-${day}`)
		
		
	}
	
	
	const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${personalAccessToken}`
    };

    const targetDateTimeUtc = new Date(`${targetDateStr}T23:59:59.999Z`);
    if (isNaN(targetDateTimeUtc.getTime())) {
        console.error(`Invalid date format: ${targetDateStr}. Use 'YYYY-MM-DD'.`);
        throw new Error(`Invalid date format: ${targetDateStr}. Use 'YYYY-MM-DD'.`);
    }

    const searchUrl = `${jiraUrl}/rest/api/2/search`;
    const searchPayload = {
        jql: jqlQuery,
        fields: [
            "summary", "status", "issuetype", "assignee", "updated", "created",
            "resolution", "priority", // Often Epic Link
            "customfield_10003", // Common Story Points field. VERIFY THIS ID FOR YOUR JIRA.
            "epic", // Jira's Epic field (for Next-gen projects usually, contains name)
            "labels" // Include labels if CarryFwd/AdHoc are determined by labels
            // Add other custom fields if needed, e.g., "customfield_XXXXX", "customfield_YYYYY"
        ],
        expand: ["changelog"]
    };

    try {
        const response = await axios.post(searchUrl, searchPayload, { headers });
        const issues = response.data.issues || [];
        console.log(`Found ${issues.length} issues.`);

        const resultIssuesArray = [];

        // Define the status mapping based on the provided table
        const statusMapping = {
            "Backlog": { statusId: 1.1, groupId: 1, group: "Backlog", dodFlag: 0 },
            "Ready to Plan": { statusId: 1.2, groupId: 1, group: "Backlog", dodFlag: 0 },
            "Ready to Groom": { statusId: 1.3, groupId: 1, group: "Backlog", dodFlag: 0 },
            "Ready for Grooming": { statusId: 1.4, groupId: 1, group: "Backlog", dodFlag: 0 },
            "Dev To Do": { statusId: 2.1, groupId: 2, group: "Open", dodFlag: 0 },
            "Open": { statusId: 2.2, groupId: 2, group: "Open", dodFlag: 0 },
            "Todo": { statusId: 2.3, groupId: 2, group: "Open", dodFlag: 0 },
            "Ready to Do": { statusId: 2.4, groupId: 2, group: "Open", dodFlag: 0 },
            "Ready for Analysis": { statusId: 2.5, groupId: 2, group: "Open", dodFlag: 0 },
            "Design In Progress": { statusId: 3.1, groupId: 3, group: "In Progress", dodFlag: 0 },
            "In Development": { statusId: 3.2, groupId: 3, group: "In Progress", dodFlag: 0 },
            "Dev In Progress": { statusId: 3.3, groupId: 3, group: "In Progress", dodFlag: 0 },
            "In Progress": { statusId: 3.4, groupId: 3, group: "In Progress", dodFlag: 0 },
            "In Integration": { statusId: 3.5, groupId: 3, group: "In Progress", dodFlag: 0 },
            "In Dev": { statusId: 3.6, groupId: 3, group: "In Progress", dodFlag: 0 },
            "Blocked": { statusId: 4.1, groupId: 4, group: "Blocked", dodFlag: 1 },
            "In Review": { statusId: 5.1, groupId: 5, group: "Review", dodFlag: 0 },
            "Internal Review": { statusId: 5.2, groupId: 5, group: "Review", dodFlag: 0 },
            "Code Review": { statusId: 5.3, groupId: 5, group: "Review", dodFlag: 1 },
            "External Review": { statusId: 5.4, groupId: 5, group: "Review", dodFlag: 1 },
            "Ready for QA": { statusId: 6.1, groupId: 6, group: "QA", dodFlag: 0 },
            "READY FOR VERIFICATION": { statusId: 6.2, groupId: 6, group: "QA", dodFlag: 0 },
            "In QA": { statusId: 6.3, groupId: 6, group: "QA", dodFlag: 0 },
            "QA Ready": { statusId: 6.4, groupId: 6, group: "QA", dodFlag: 0 },
            "QA Sign Off": { statusId: 6.5, groupId: 6, group: "QA", dodFlag: 1 },
            "Ready for Signoff": { statusId: 6.6, groupId: 6, group: "QA", dodFlag: 1 },
            "Verified": { statusId: 7.1, groupId: 7, group: "Deployment", dodFlag: 1 },
            "Ready For Production": { statusId: 7.2, groupId: 7, group: "Deployment", dodFlag: 1 },
            "Production Ready": { statusId: 7.3, groupId: 7, group: "Deployment", dodFlag: 1 },
            "Prod Ready": { statusId: 7.4, groupId: 7, group: "Deployment", dodFlag: 1 },
            "Ready for Deployment": { statusId: 7.5, groupId: 7, group: "Deployment", dodFlag: 1 },
            "Closed": { statusId: 8.1, groupId: 8, group: "Done", dodFlag: 1 },
            "Completed": { statusId: 8.2, groupId: 8, group: "Done", dodFlag: 1 },
            "Deployed": { statusId: 8.3, groupId: 8, group: "Done", dodFlag: 1 },
            "Resolved": { statusId: 8.4, groupId: 8, group: "Done", dodFlag: 1 },
            "Done": { statusId: 8.5, groupId: 8, group: "Done", dodFlag: 1 },
            "Released": { statusId: 8.6, groupId: 8, group: "Done", dodFlag: 1 }
        };

        for (const issue of issues) {
            const issueKey = issue.key;
            const changelog = issue.changelog?.histories || [];
            const statusChanges = [];

            for (const history of changelog) {
                const changeDate = new Date(history.created);
                for (const item of history.items) {
                    if (item.field === 'status') {
                        statusChanges.push({
                            date: changeDate,
                            from: item.fromString,
                            to: item.toString
                        });
                    }
                }
            }

            statusChanges.sort((a, b) => a.date - b.date);

            let statusAtTargetDate = null;
            for (const change of statusChanges) {
                if (change.date <= targetDateTimeUtc) {
                    statusAtTargetDate = change.to;
                } else {
                    break;
                }
            }

            if (!statusAtTargetDate) {
                statusAtTargetDate = statusChanges[0]?.from || issue.fields.status.name;
                if (statusAtTargetDate) {
                    console.log(`  ${issueKey}: No status changes found before or on ${targetDateStr}. Using initial or current status: "${statusAtTargetDate}".`);
                } else {
                    console.log(`  ${issueKey}: No status or status changes found. Using current status: "${issue.fields.status.name}".`);
                    statusAtTargetDate = issue.fields.status.name;
                }
            }

            // --- Apply the status mapping ---
            const mappedStatus = statusMapping[statusAtTargetDate] || {
                statusId: null,
                groupId: null,
                group: "Unknown",
                dodFlag: 0
            };
            if (!statusMapping[statusAtTargetDate]) {
                console.warn(`Issue ${issueKey}: Status "${statusAtTargetDate}" not found in mapping table.`);
            }

            // --- Handle Epic Link ---
            let epicLink = 'N/A';
            if (issue.fields.epic?.name) {
                epicLink = issue.fields.epic.name;
            } else if (issue.fields.epic?.key) {
                 epicLink = issue.fields.epic.key;
            }
            else if (issue.fields.customfield_10003) {
                if (typeof issue.fields.customfield_10003 === 'string') {
                    epicLink = issue.fields.customfield_10003;
                } else if (issue.fields.customfield_10003.key) {
                    epicLink = issue.fields.customfield_10003.key;
                } else if (issue.fields.customfield_10003.name) {
                    epicLink = issue.fields.customfield_10003.name;
                }
            }

            // --- Handle Story Points ---
            // Assuming customfield_10003 is Story Points. VERIFY THIS ID FOR YOUR JIRA.
            const storyPoints = issue.fields.customfield_10003 || 0;
            const spFormatted = storyPoints ? `${storyPoints}` : '#0';

			const createdDate = issue.fields.created;
			const updatedDate = issue.fields.updated;

			
			const labels = issue.fields.labels || [];
			const carryFwdValue = labels.includes('CarryFwd') ? issueKey : 'No'; // Output issueKey if label exists, else 'No'
	

			  // Helper to convert DD/MM/YYYY to Date object
			const parseDate = (dateStr) => {
			    const [day, month, year] = dateStr.split("/");
			    return new Date(`${year}-${month}-${day}`);
			};

			const startDate = parseDate(startDateStr);
			const endDate = parseDate(targetDateStr);
			const currentDate = new Date(createdDate);

			const adHocValue = (currentDate >= startDate && currentDate <= endDate)? "AdHoc" : "No";

			
            // Construct the desired object for this issue with all mapped fields
            const formattedIssue = {
                "Key": issueKey,
                "Issue Type": issue.fields.issuetype?.name || 'N/A',
                "Priority": issue.fields.priority?.name || 'None',
                "Summary": issue.fields.summary,
                "Status": statusAtTargetDate,
				"Created": formatter.format(new Date(createdDate)),
				"Updated": formatter.format(new Date(updatedDate)),
                "Assignee": issue.fields.assignee?.displayName || 'Unassigned',
                "Story Points": storyPoints,
                "Epic Link": epicLink,
                "SP": spFormatted,
                "StatusID": mappedStatus.statusId,
                "GroupID": mappedStatus.groupId,
                "Group": mappedStatus.group,
                "CarryFwd": carryFwdValue,
                "AdHoc": adHocValue,
                "DoD": mappedStatus.dodFlag
            };

            resultIssuesArray.push(formattedIssue);
        }

        return resultIssuesArray;

    } catch (error) {
        if (error.response) {
            console.error(`Jira API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            if ([401, 403].includes(error.response.status)) {
                console.error("Check your Personal Access Token and permissions.");
            }
        } else {
            console.error(`Request error: ${error.message}`);
        }
        throw error;
    }
}

export { getIssueStatusAtDate };