document.getElementById('setScope').addEventListener('click', function() {
  const scopeTLD = document.getElementById('scopeTLD').value.trim();
  if (scopeTLD) {
    chrome.runtime.sendMessage({action: "setScope", scopeTLD: scopeTLD}, function(response) {
      alert('Scope set to: ' + scopeTLD); // Provide feedback to the user
      // Save the scopeTLD in chrome.storage for persistence
      chrome.storage.local.set({scopeTLD: scopeTLD}, function() {
        console.log('Scope TLD saved:', scopeTLD);
      });
      document.getElementById('displayScope').textContent = 'Scope set to: ' + scopeTLD;
      fetchData(scopeTLD); // Pass the scopeTLD to fetchData function
    });
  } else {
    alert('Please enter a valid TLD.');
  }
});

// Function to fetch and display data, now doesn't need scopeTLD as a parameter
function fetchData() {
  // Retrieve the saved scopeTLD from chrome.storage
  chrome.storage.local.get('scopeTLD', function(data) {
    const scopeTLD = data.scopeTLD;
    if (scopeTLD) {
      chrome.runtime.sendMessage({action: "getRequests"}, function(response) {
        const output = document.getElementById('output');
        output.innerHTML = ''; // Clear previous output
        if (response) {
          Object.keys(response).forEach(url => {
            // Check if the URL contains the scopeTLD before adding it to the output
            if (url.includes(scopeTLD)) {
              const methods = response[url];
              const methodsString = Object.keys(methods).map(method => `${method}: ${methods[method]}`).join(', ');
              output.innerHTML += `<p><b>${url}</b>: ${methodsString}</p>`;
            }
          });
        } else {
          output.innerHTML = '<p>No data captured for the set scope.</p>';
        }
      });
    }
  });
}





document.getElementById('startRecording').addEventListener('click', function() {
  const scopeTLD = document.getElementById('scopeTLD').value.trim();
  if (scopeTLD) {
    chrome.runtime.sendMessage({command: "startRecording", scope: scopeTLD}, function(response) {
      alert(response.status); // Notify the user that recording has started
      document.getElementById('startRecording').disabled = true; // Disable the start button
      document.getElementById('stopRecording').disabled = false; // Enable the stop button
    });
  } else {
    alert('Please enter a valid TLD to start recording.');
  }
});

document.getElementById('stopRecording').addEventListener('click', function() {
  chrome.runtime.sendMessage({command: "stopRecording"}, function(response) {
    alert(response.status); // Notify the user that recording has stopped
    document.getElementById('startRecording').disabled = false; // Enable the start button
    document.getElementById('stopRecording').disabled = true; // Disable the stop button
    fetchData(); // Refresh the data display to include the recorded requests
  });
});




chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "updateData") {
        // Handle the data, e.g., by updating the DOM
        const output = document.getElementById('output');
        output.innerHTML = ''; // Clear previous output
        Object.keys(message.data).forEach(url => {
            const methods = message.data[url];
            const methodsString = Object.keys(methods).map(method => `${method}: ${methods[method]}`).join(', ');
            output.innerHTML += `<p><b>${url}</b>: ${methodsString}</p>`;
        });
    }
});






// Automatically fetch and display data on popup load
document.addEventListener('DOMContentLoaded', function() {
  fetchData(); // Directly call fetchData without needing to pass scopeTLD
});







// Add click event listeners for export buttons
document.getElementById('exportCsv').addEventListener('click', function() {
    exportData('csv');
});

document.getElementById('exportJson').addEventListener('click', function() {
    exportData('json');
});

// Function to handle data export
function exportData(format) {
    chrome.storage.local.get('scopeTLD', function(data) {
        const scopeTLD = data.scopeTLD;
        if (!scopeTLD) {
            alert('No scope TLD set.');
            return;
        }
        chrome.runtime.sendMessage({action: "getRequests"}, function(response) {
            if (!response) {
                alert('No data to export.');
                return;
            }
            let dataStr = '';
            if (format === 'json') {
                dataStr = JSON.stringify(response, null, 4);
                downloadData(dataStr, 'application/json', 'data.json');
            } else if (format === 'csv') {
                dataStr = 'URL,Method,Count\n';
                Object.keys(response).forEach(url => {
                    const methods = response[url];
                    Object.keys(methods).forEach(method => {
                        dataStr += `${url},${method},${methods[method]}\n`;
                    });
                });
                downloadData(dataStr, 'text/csv', 'data.csv');
            }
        });
    });
}

// Function to trigger the download of the data
function downloadData(data, type, filename) {
    const blob = new Blob([data], {type: type});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}



