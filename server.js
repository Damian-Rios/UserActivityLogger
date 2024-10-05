const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const LOG_FILE_PATH = path.join(__dirname, 'logs.json');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Initialize the log file if it doesn't exist
if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([])); // Start with an empty array
}

// Function to read and parse logs from the file
function readLogs() {
    try {
        const data = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error reading logs:', err);
        return [];
    }
}

// Function to write logs to the file
function writeLogs(logs) {
    try {
        fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2));
    } catch (err) {
        console.error('Error writing logs:', err);
    }
}

// Endpoint to handle log requests
app.post('/log', (req, res) => {
    const { action, timestamp } = req.body;

    // Validate request data
    if (!action || !timestamp) {
        return res.status(400).send('Invalid event data. Action and timestamp are required.');
    }

    // Read current logs
    const logs = readLogs();

    // Add the new log entry
    logs.push({ action, timestamp });

    // Write the updated logs back to the file
    writeLogs(logs);

    res.status(200).send('Event logged successfully');
});

// Endpoint to retrieve logs
app.get('/logs', (req, res) => {
    const logs = readLogs();
    res.json(logs);
});

// Send batch summary of logs every minute
setInterval(() => {
    // Read the logs from the file
    const logs = readLogs();
    console.log('Interval triggered: Checking logs...');

    if (logs.length > 0) {
        const summary = generateSummary(logs);
        console.log('Event summary for the last minute:', summary);

        // Clear the logs after processing
        writeLogs([]);
        console.log('Logs cleared after processing.');
    } else {
        console.log('No logs to clear.');
    }
}, 60000);

// Helper function to generate a summary of the logs
function generateSummary(logs) {
    const summary = {};
    logs.forEach((log) => {
        if (summary[log.action]) {
            summary[log.action] += 1;
        } else {
            summary[log.action] = 1;
        }
    });
    return summary;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server error');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
