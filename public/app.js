// Add event listeners for buttons and form submission
document.getElementById('clickButton').addEventListener('click', () => logEvent('Button clicked'));

document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value || 'Anonymous';
    logEvent(`Form submitted by ${name}`);
});

// Event listeners for dropdown options
document.getElementById('viewLogs').addEventListener('click', () => {
    // Logging the action
    logEvent('View Logs clicked');
    fetch('/logs') // Fetch logs from the server
        .then(response => response.json())
        .then(logs => {
            if (logs.length > 0) {
                const logMessages = logs.map(log => `Action: "${log.action}" at ${log.timestamp}`).join('<br>');
                M.toast({html: 'Logs retrieved successfully!', classes: 'green darken-1'});
                document.getElementById('logSummary').innerHTML = logMessages; // Display logs
            } else {
                M.toast({html: 'No logs available.', classes: 'orange darken-1'});
            }
        })
        .catch(err => {
            console.error('Error fetching logs:', err);
            M.toast({html: 'Error fetching logs.', classes: 'red darken-2'});
        });
});

// Event listener for hiding logs
document.getElementById('hideButton').addEventListener('click', () => {
    // logging this action
    logEvent('Hide Logs clicked');
    document.getElementById('logSummary').innerHTML = ''; // Clear the log display
    M.toast({html: 'Logs hidden.', classes: 'green darken-1'});
});

// Event listener for the help button
document.getElementById('help').addEventListener('click', () => {
    logEvent('Help accessed'); // Logging the help action
    alert('Help Information:\n1. Click "Log Click Event" to log a button click.\n2. Fill your name and click "Submit" to log a form submission.\n3. Use "More Actions" to show and hide log summary.');
});

// Function to log events and update the front end
function logEvent(action) {
    const timestamp = new Date().toLocaleString();

    fetch('/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, timestamp }),
    })
    .then(response => {
        if (response.ok) {
            updateUI(action, timestamp);
        } else {
            M.toast({html: 'Failed to log event', classes: 'red darken-2'});
        }
    })
    .catch(err => {
        console.error('Error logging event:', err);
        M.toast({html: 'Error logging event', classes: 'red darken-2'});
    });
}

// Function to update the UI with the last action and feedback
function updateUI(action, timestamp) {
    const lastActionElement = document.getElementById('lastAction');
    lastActionElement.textContent = `"${action}" at ${timestamp}`;

    M.toast({html: `Event "${action}" logged successfully!`, classes: 'green darken-1'});
}
