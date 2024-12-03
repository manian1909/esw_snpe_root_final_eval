// First Channel for Graphs
const channelIdGraphs = '2773129'; // First channel ID
const apiKeyGraphs = 'NH23DIKH28U802YH'; // First channel Read API Key

// Second Channel for Sending Angle
const channelIdWrite = '2773133'; // Replace with your second channel ID
const writeApiKey = 'AEXTVMG4TAW2778K'; // Replace with your second channel Write API Key

const apiUrlGraphs = `https://api.thingspeak.com/channels/${channelIdGraphs}/feeds.json?api_key=${apiKeyGraphs}&results=10`;

// Field Numbers
const angleField = 1; // Field for Angle in the first channel
const targetPositionField = 2; // Field for Target Position in the first channel
const currentPositionField = 3; // Field for Current Position in the first channel

// Fetch ThingSpeak Data for Graphs
async function fetchThingSpeakData() {
    try {
        const response = await fetch(apiUrlGraphs);
        const data = await response.json();
        const feeds = data.feeds;

        // Get the latest feed
        const latestFeed = feeds[feeds.length - 1];

        // Update latest values
        document.getElementById('speedValue').innerText = `Latest: ${latestFeed[`field${angleField}`] || 'No Data'}°`;
        document.getElementById('voltageValue').innerText = `Latest: ${latestFeed[`field${targetPositionField}`] || 'No Data'}`;
        document.getElementById('angleValue').innerText = `Latest: ${latestFeed[`field${currentPositionField}`] || 'No Data'}`;

        // Prepare data for charts
        const timestamps = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
        const angleData = feeds.map(feed => parseFloat(feed[`field${angleField}`]) || 0);
        const targetPositionData = feeds.map(feed => parseFloat(feed[`field${targetPositionField}`]) || 0);
        const currentPositionData = feeds.map(feed => parseFloat(feed[`field${currentPositionField}`]) || 0);

        // Update the charts with new data
        updateChart(angleChart, timestamps, angleData, 'Angle (°)');
        updateChart(targetPositionChart, timestamps, targetPositionData, 'Target Position');
        updateChart(currentPositionChart, timestamps, currentPositionData, 'Current Position');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Send Angle to the Second ThingSpeak Channel
async function sendAngle() {
    const angleInput = document.getElementById('angleInput').value;

    if (!angleInput || isNaN(angleInput)) {
        alert('Please enter a valid angle.');
        return;
    }

    try {
        const response = await fetch(`https://api.thingspeak.com/update?api_key=${writeApiKey}&field1=${angleInput}`, {
            method: 'GET'
        });

        if (response.ok) {
            alert('Angle sent successfully!');
            document.getElementById('angleInput').value = ''; // Clear input
        } else {
            alert('Failed to send angle. Please try again.');
        }
    } catch (error) {
        console.error('Error sending angle:', error);
        alert('An error occurred. Please try again.');
    }
}

// Update a Chart.js chart
function updateChart(chart, labels, data, label) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].label = label;
    chart.update();
}

// Create Chart.js charts
function createChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: label,
                    borderColor: color,
                    fill: false,
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: label
                    }
                }
            }
        }
    });
}

// Initialize the charts
const angleChart = createChart('speedChart', 'Angle (°)', 'rgb(255, 99, 132)');
const targetPositionChart = createChart('voltageChart', 'Target Position', 'rgb(54, 162, 235)');
const currentPositionChart = createChart('angleChart', 'Current Position', 'rgb(75, 192, 192)');

// Fetch data for graphs every few seconds
setInterval(() => {
    fetchThingSpeakData();
}, 5000);

// Initial fetch
fetchThingSpeakData();
