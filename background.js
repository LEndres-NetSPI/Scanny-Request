let isRecording = false;
let recordingScope = '';
let requestCounts = {}; // Stores counts by endpoint and method

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "startRecording") {
        isRecording = true;
        recordingScope = request.scope; //new URL(request.scope); // Simplify to origin for matching scope
        console.log('addListener, scope set to:')
        console.log(recordingScope);
        requestCounts = {}; // Reset for a new recording session
        sendResponse({status: "Recording started", scope: request.scope});
    } else if (request.command === "stopRecording") {
        isRecording = false;
        sendResponse({status: "Recording stopped"});
    }
    else if (request.command === "clearScope"){
        // set local storage? or do that on front-end
    
    }else if (request.command === "setScope"){
        // set local storage? or do that on front-end
    
    } else if (request.command === "clearData") {
        clearData();
        // no need to send a response?
        sendResponse({status: "Recording stopped"});

    } else if (request.command === "getData") {
        sendResponse(requestCounts);
    }
});



function clearData() {
    // Clear the data
    let requestCounts = {};
    // Update the DOM just in-case the user click stopped recording
}




chrome.webRequest.onBeforeRequest.addListener(function(details) {
        console.log('reqes');
        if (!isRecording) return; // Skip if not recording

        let url = new URL(details.url);
        //console.log(url.origin);
        console.log('scope = ');



        chrome.storage.local.get('scopeTLD', function(data) {
            //console.log(data);
            var scope = data.scopeTLD;
            //alert(scope);
          });

        console.log(recordingScope);




        // this logic is not really correct and needs to be updated,
        // but this will suffice for right now
        let href = url.href

        //console.log('\n\nurl.href and recordingScope')
        //console.log(url.href);
        //console.log(recordingScope);

        if (href.includes(recordingScope)){

        }
        else {
            return false;
        }




        //if (url.origin !== recordingScope) return; // Skip if not within the scope

        // href = whole url + request params
        let endpoint = url.href;
        let method = details.method;

        // Initialize or increment count
        if (!requestCounts[endpoint]) {
            requestCounts[endpoint] = {};
        }
        if (!requestCounts[endpoint][method]) {
            requestCounts[endpoint][method] = 1;
        } else {
            requestCounts[endpoint][method]++;
        }

        console.log(requestCounts);

    },
    {urls: ["<all_urls>"]},
    ["requestBody"]
);




// Example: Function to send data to popup.js, assuming the popup is open
function updatePopup() {
    // Check if the popup is open by querying the views
    let views = chrome.extension.getViews({type: "popup"});
    if (views.length > 0) {
        // If the popup is open, send data to it
        chrome.runtime.sendMessage({action: "updateData", data: requestCounts});
    }
}





// Listen for a message from the popup to send back the captured request data
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getRequests") {
        console.log(requestCounts);
        sendResponse(requestCounts);
    }
});
