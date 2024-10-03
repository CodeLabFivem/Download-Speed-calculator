const historyData = JSON.parse(localStorage.getItem('downloadHistory')) || [];
        const ctx = document.getElementById('myChart').getContext('2d');
        let myChart; // Declare the chart variable
    
        function updateChart() {
            const labels = historyData.map((item, index) => `Calc ${index + 1}`);
            const data = historyData.map(item => item.downloadTimeInUnit); // Use the saved time in respective unit for the chart
    
            // Destroy the previous chart if it exists
            if (myChart) {
                myChart.destroy();
            }
    
            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Download Time History',
                        data: data,
                        backgroundColor: 'rgba(56, 178, 172, 0.6)',
                        borderColor: 'rgba(56, 178, 172, 1)',
                        borderWidth: 1,
                    }],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Time (s, min, h)',
                            },
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    const index = tooltipItem.dataIndex;
                                    const timeEntry = historyData[index].downloadTime; // Retrieve the stored formatted time
                                    return timeEntry; // Return the formatted time for the tooltip
                                }
                            }
                        }
                    }
                },
            });
        }
    
        document.getElementById('speedForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const speed = parseFloat(document.getElementById('speed').value);
            const size = parseFloat(document.getElementById('size').value);
            const speedUnit = document.getElementById('speedUnit').value;
            const sizeUnit = document.getElementById('sizeUnit').value;
    
            // Input Validation
            if (isNaN(speed) || isNaN(size) || speed <= 0 || size <= 0) {
                alert('Please enter valid numbers for speed and file size.');
                return;
            }
    
            // Show loading
            document.getElementById('loading').style.display = 'block';
    
            // Convert speed to Mbps
            let speedMbps = speedUnit === 'Kbps' ? speed / 1000 : speedUnit === 'Gbps' ? speed * 1000 : speed;
    
            // Convert file size to MB
            let fileSizeMB = sizeUnit === 'KB' ? size / 1024 : sizeUnit === 'GB' ? size * 1024 : size;
    
            // Convert speed from Mbps to MBps (1 Mbps = 0.125 MBps)
            const speedMBps = speedMbps * 0.125;
    
            // Calculate download time in seconds
            const downloadTimeInSeconds = fileSizeMB / speedMBps;
    
            // Determine the appropriate unit and format the result
            let formattedResult = '';
            let downloadTimeInUnit = downloadTimeInSeconds; // Default to seconds
            if (downloadTimeInSeconds >= 3600) { // 1 hour or more
                const hours = Math.floor(downloadTimeInSeconds / 3600);
                downloadTimeInUnit = hours; // Save in hours
                formattedResult = `${hours} h`; // Formatting for hours
            } else if (downloadTimeInSeconds >= 60) { // 1 minute or more
                const minutes = Math.floor(downloadTimeInSeconds / 60);
                downloadTimeInUnit = minutes; // Save in minutes
                formattedResult = `${minutes} min`; // Formatting for minutes
            } else {
                downloadTimeInUnit = downloadTimeInSeconds; // Save in seconds
                formattedResult = `${downloadTimeInSeconds} sec`; // Formatting for seconds
            }
    
            // Display the result
            document.getElementById('result').innerText = `Estimated download time: ${formattedResult}`;
            document.getElementById('copyButton').style.display = 'block'; // Show copy button
            document.getElementById('loading').style.display = 'none'; // Hide loading
    
            // Save to history with formatted and raw time in respective units
            historyData.push({ 
                downloadTime: formattedResult, 
                downloadTimeInUnit: downloadTimeInUnit // Save in the appropriate unit
            });
            localStorage.setItem('downloadHistory', JSON.stringify(historyData));
            updateChart(); // Update the chart
        });
    
        document.getElementById('copyButton').addEventListener('click', function() {
            const resultText = document.getElementById('result').innerText;
            navigator.clipboard.writeText(resultText).then(() => {
                alert('Result copied to clipboard!');
            }).catch(err => {
                console.error('Error copying text: ', err);
            });
        });
    
        document.getElementById('clearButton').addEventListener('click', function() {
            localStorage.removeItem('downloadHistory');
            historyData.length = 0; // Clear the history array
            updateChart(); // Update the chart
            document.getElementById('result').innerText = '';
            document.getElementById('copyButton').style.display = 'none';
        });
    
        // Initialize chart on page load
        updateChart();
