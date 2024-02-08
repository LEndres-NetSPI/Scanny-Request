function firstTimeFunction() {
  // Your code that should only run once
  console.log("This runs only once on the extension's first run.");
  updateRecordingBoolLocalStorage(false);

  chrome.storage.local.set({scopeTLD: ""}, function() {
    // update the DOM
    document.getElementById('displayScope').innerHTML = "none";
  });

}

// Check if it's the first run
chrome.storage.local.get(['firstRunCompleted'], function(result) {
  if (!result.firstRunCompleted) {
      // If it's the first run, execute your function
      firstTimeFunction();

      // Then, set the flag to indicate the first run has been completed
      chrome.storage.local.set({firstRunCompleted: true}, function() {
          console.log("First run flag set.");
      });
  }
});








document.getElementById('setScope').addEventListener('click', function() {

var scope = document.getElementById('scopeTLD').value;
if (scope) {


  chrome.storage.local.set({scopeTLD: scope}, function() {
    console.log('Scope TLD saved:', scope);
  });

  /*

  // this code doesn't run because there's no response?
  chrome.runtime.sendMessage({action: "setScope", scopeTLD: scope}, function(response) {
    alert('Scope set to: ' + scope); // Provide feedback to the user
    // Save the scopeTLD in chrome.storage for persistence
    chrome.storage.local.set({scopeTLD: scope}, function() {
      console.log('Scope TLD saved:', scope);
    });
  */

    document.getElementById('displayScope').textContent = scope;
    fetchData(scope); // Pass the scopeTLD to fetchData function

      document.getElementById('startRecording').disabled = false;


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










/*
  Start recording
*/

document.getElementById('startRecording').addEventListener('click', function() {
  // this line broke the whole thing
  // dom not being updated correctly?
  // var vs const?
  //var scopeTLD = document.getElementById('scopeTLD').value.trim();

  // get scope from storage
  chrome.storage.local.get('scopeTLD', function(data) {
    //console.log(data);
    var scope = data.scopeTLD;
    alert(scope);
    //console.log(scopeTLD);
    // update the DOM
    var scopeSpan = document.getElementById('displayScope');
    scopeSpan.innerHTML = scope;


    if (scope) {
      chrome.runtime.sendMessage({command: "startRecording", scope: scopeTLD}, function(response) {
        //alert(response.status); // Notify the user that recording has started
        //alert(scopeTLD);
        document.getElementById('startRecording').disabled = true; // Disable the start button
        document.getElementById('stopRecording').disabled = false; // Enable the stop button
        updateRecordingBoolLocalStorage(true);
      });
    } else {
      alert('Please enter a valid TLD to start recording.');
    }




  });

  // screw it, idk why this isn't working. Keeping this bad code
  const scopeTLD = document.getElementById('scopeTLD').value.trim();





});




/*
  Stop recording
*/

document.getElementById('stopRecording').addEventListener('click', function() {
  chrome.runtime.sendMessage({command: "stopRecording"}, function(response) {
    //alert(response.status); // Notify the user that recording has stopped
    document.getElementById('startRecording').disabled = false; // Enable the start button
    document.getElementById('stopRecording').disabled = true; // Disable the stop button
    updateRecordingBoolLocalStorage(false);
    fetchData(); // Refresh the data display to include the recorded requests
  });
  });
  








/*
  Update recordingBool local storage object
*/

function updateRecordingBoolLocalStorage(trueOrFalse){
  if (typeof trueOrFalse !== 'boolean') {
      console.log('The provided value is not a boolean.');
      return;
  }

  // set the value of recordingBool in local storage
  chrome.storage.local.set({ recordingBool: trueOrFalse }, function() {
      console.log(`The value of recordingBool is saved to local storage. Value: ${trueOrFalse}`);
  });
}








document.getElementById('clearData').addEventListener('click', function() {
  // send a message to background.js to clear the requestCounts var
  chrome.runtime.sendMessage({command: "clearData"}, function(response) {

      const output = document.getElementById('output');
      output.innerHTML = ''; // Clear previous output


});
});





document.getElementById('clearScope').addEventListener('click', function() {
  // send a message to background.js to clear the requestCounts var
  chrome.runtime.sendMessage({command: "clearScope"}, function(response) {

      const scope = document.getElementById('displayScope');
      output.innerHTML = 'none'; // Clear previous output

      // disable recording
      


});

chrome.storage.local.set({scopeTLD: ""}, function() {
  // update the DOM
  document.getElementById('displayScope').innerHTML = "none";
});

/*
chrome.runtime.sendMessage({command: "stopRecording"}, function(response) {
  alert(response.status); // Notify the user that recording has stopped
  document.getElementById('startRecording').disabled = false; // Enable the start button
  document.getElementById('stopRecording').disabled = true; // Disable the stop button
  updateRecordingBoolLocalStorage(false);
  fetchData(); // Refresh the data display to include the recorded requests
});
*/

});






/*
  Listener function
*/


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

  // clear data
  if (message.action === "clearData") {
      const output = document.getElementById('output');
      output.innerHTML = ''; // Clear previous output
  }

});


/*
  Every time the extension is click
*/

// Automatically fetch and display data on popup load
document.addEventListener('DOMContentLoaded', function() {

  // get the scope if it's already set
  chrome.storage.local.get('scopeTLD', function(data) {
    console.log('scopeTLD = '+ data.scopeTLD);
    const scopeTLD = data.scopeTLD;

    // update the DOM
    if (scopeTLD == '') {
      document.getElementById('displayScope').innerHTML = 'none';
    }
    else {
      document.getElementById('displayScope').innerHTML = scopeTLD;
    }
  });



  // update the start/stop buttons if the extension has been re-opened
  chrome.storage.local.get(['recordingBool'], function(result) {
      //
      if (result.recordingBool == true) {
          document.getElementById('startRecording').disabled = true; // Disable the start button
          document.getElementById('stopRecording').disabled = false; // Enable the stop button
      }
      else if (result.recordingBool == false) {
          document.getElementById('startRecording').disabled = false; // Disable the start button
          document.getElementById('stopRecording').disabled = true; // Enable the stop button
      }



  fetchData(); // Directly call fetchData without needing to pass scopeTLD
  });
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



