// QR Code Generation
function generateQR() {
    let source = document.getElementById("from").value;
    let destination = document.getElementById("to").value;
    let numberOfPassengers = document.getElementById("numberOfPassengers").value;
    let journeyDropdown = document.getElementById("journey-route");
    let selectedJourneyId = journeyDropdown.value;

    if (!source || !destination || !numberOfPassengers) {
        alert("Please fill all fields!");
        return;
    }


    // Generate ticket for the passenger

    fetch("http://localhost:8080/api/tickets/generate/TestMode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            journeyId : selectedJourneyId,
            source: source,
            destination: destination,
            numberOfPassengers: parseInt(numberOfPassengers) || 1
        })
    })
    .then(response => response.text()) // Expect plain text response (URL)
    .then(paymentUrl => {
        console.log("Payment URL:", paymentUrl);

        // Clear previous QR code
        document.getElementById("qr-code").innerHTML = "";

        // Generate the QR code with the payment URL
        let qr = new QRious({
            element: document.getElementById("qr-code"),
            value: paymentUrl,
            size: 200
        });

        // Make QR Code section visible
        document.getElementById("qr-container").style.display = "block";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred: " + error.message);
    });


    updatePassengerCount(destination, numberOfPassengers);


}


// Set the passenger count section with the stops
function setPassengerCount(formattedStops) {
    const passengerList = document.getElementById("passenger-list");
    const totalCounter = document.getElementById("total-passengers");

    formattedStops.forEach((stop, index) => {
        let stopElement = passengerList.querySelector(`#stop-${stop.name}`);
        if (!stopElement) {
            stopElement = document.createElement("div");
            stopElement.classList.add("stop-count");
            stopElement.innerHTML = `<span>${stop.name} </span> <span id="stop-${stop.name}">0</span>`;
            passengerList.appendChild(stopElement);

        }
    });



}

// Update the passenger count section dynamically
function updatePassengerCount(destination, count) {
    const passengerList = document.getElementById("passenger-list");
    const currentCounter = document.getElementById("current-passengers");
    const totalCounter = document.getElementById("total-passengers");
    let totalPassengers = parseInt(totalCounter.textContent) || 0;
    let currentPassengers = parseInt(currentCounter.textContent) || 0;

    fetch(`http://localhost:8080/api/currentJourney/updatePassengerCount`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            destination: destination,
            numberOfPassengers: count
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to update passenger count");
        }
        return response.json();
    })
    .then(data => {
        const { newCount, currentStopCount, totalCount } = data;
    
        const countSpan = document.querySelector(`#stop-${destination}`);
        if (countSpan) {
            countSpan.textContent = newCount;
        }
    
        totalCounter.textContent = totalCount;
        currentCounter.textContent = currentStopCount;
    
        console.log(`Updated ${destination}: ${newCount}, Current: ${currentStopCount}, Total: ${totalCount}`);
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred: " + error.message);
    });
    
    
}


// Google Maps Integration
let map;
let marker;

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    let userLocation = { lat, lng };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: userLocation
    });

    marker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "You are here"
    });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const journeyDropdown = document.getElementById("journey-route");
    const fromDropdown = document.getElementById("from");
    const toDropdown = document.getElementById("to");
    const stopsList = document.getElementById("stops-list");
    const startJourneyBtn = document.getElementById("start-journey-btn");
    const currentStopBtn = document.getElementById("current-stop-btn");

    let selectedStop = null; // Track the currently selected stop

    let journeys = []; // Store journeys globally

    // Fetch journeys from the backend and populate the dropdown
    function loadJourneys() {
        fetch("http://localhost:8080/api/journey/all")
            .then(response => response.json())
            .then(data => {
                journeys = data; // Store journeys globally
                
                journeyDropdown.innerHTML = `<option value="">Select Journey</option>`; // Reset dropdown
                
                data.forEach(journey => {
                    const option = document.createElement("option");
                    option.value = journey.id; // Store journey ID as value
                    option.textContent = `${journey.startPlace} → ${journey.endPlace}`;
                    journeyDropdown.appendChild(option);
                });
            })
            .catch(error => console.error("Error fetching journeys:", error));
    }

    startJourneyBtn.addEventListener("click", function () {
        console.log("Start Journey button clicked");
        const selectedJourneyId = journeyDropdown.value;
          
        if (!selectedJourneyId) {
            alert("Please select a valid journey.");
            return;
        }

        if (startJourneyBtn.textContent === "Start Journey") {
            startJourney(selectedJourneyId);
            fetchStops(selectedJourneyId);
        } else {
            // Stop Journey logic
            stopJourney();
            updateStopsList([]);
            updateFromToDropdowns([]);
            journeyDropdown.value = "";
            startJourneyBtn.textContent = "Start Journey";

            // Reset the "Current Stop" button and selected stop
            currentStopBtn.disabled = true;
            selectedStop = null;

        }
    });

    function startJourney(journeyId) {
        
        fetch('http://localhost:8080/api/currentJourney/startJourney', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                journeyId
            ) 
          })
          .then(response => response.text())
          .then(data => {
            console.log("Response from backend:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });
          
    }

    function stopJourney() {
        fetch('http://localhost:8080/api/currentJourney/stopJourney', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify("Journey stopped successfully") 
          })
          .then(response => response.text())
          .then(data => {
            console.log("Response from backend:", data);
          })
          .catch(error => {
            console.error("Error:", error);
          });
          
    }

    // Function to fetch stops from backend
    async function fetchStops(journeyId) {
        try {
            const response = await fetch(`http://localhost:8080/api/stops/getStops/${journeyId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const stops = await response.json();
            
            // Transform the response into the format needed for dropdowns
            const formattedStops = stops.map(stop => ({
                name: stop.currentStop,  // Using currentStop as name
                distance: stop.distanceFromStart
            }));
    
            console.log("Fetched stops:", formattedStops); // Debugging log
    
            updateStopsList(formattedStops);
            updateFromToDropdowns(formattedStops);
            setPassengerCount(formattedStops);
            startJourneyBtn.textContent = "Stop Journey";
        } catch (error) {
            console.error("Error fetching stops:", error);
            alert("Failed to load stops. Please try again.");
        }
    }
        

    // Function to update the stops list in the UI
    function updateStopsList(stops) {
        stopsList.innerHTML = ""; // Clear previous stops

        if (!stops || stops.length === 0) {
            stopsList.innerHTML = "<li>No stops available</li>";
            return;
        }

        stops.forEach(stop => {
            const li = document.createElement("li");
            li.textContent = `${stop.name}`;

            // Add a click event listener to select the stop
            li.addEventListener("click", () => {
                // Deselect all stops
                const allStops = stopsList.querySelectorAll("li");
                allStops.forEach(stopLi => stopLi.classList.remove("selected"));

                // Select the clicked stop
                li.classList.add("selected");
                selectedStop = stop.name;

                // Enable the "Current Stop" button
                currentStopBtn.disabled = false;
            });

            // Append the list item to the stops list
            stopsList.appendChild(li);
        });
    }

    // Function to update "From" and "To" dropdowns
    function updateFromToDropdowns(stops) {
        fromDropdown.innerHTML = '<option value="">From</option>';
        toDropdown.innerHTML = '<option value="">To</option>';

        stops.forEach(stop => {
            const fromOption = document.createElement("option");
            fromOption.value = stop.name;
            fromOption.textContent = stop.name;
            fromDropdown.appendChild(fromOption);

            const toOption = document.createElement("option");
            toOption.value = stop.name;
            toOption.textContent = stop.name;
            toDropdown.appendChild(toOption);
        });
    }

    // Event listener for the "Current Stop" button
    currentStopBtn.addEventListener("click", () => {
        if (selectedStop) {
            // console.log(selectedStop);
            
            // Update the current stop count after reaching the stop
            updateCurrentStopCount(selectedStop);


            // Mark the selected stop as completed
            const selectedLi = stopsList.querySelector(".selected");
            if (selectedLi) {
                selectedLi.classList.add("completed");
                selectedLi.classList.remove("selected");
                selectedLi.style.textDecoration = "line-through"; // Optional: Add a visual indicator
                selectedLi.style.color = "gray"; // Optional: Change the color
                alert(`Stop "${selectedStop}" has been marked as completed.`);
            }

            // Reset the selected stop and disable the button
            selectedStop = null;
            currentStopBtn.disabled = true;
        }
    });

    // Update the current stop count

    function updateCurrentStopCount(stopName) {
        const currentCounter = document.getElementById("current-passengers");
        fetch(`http://localhost:8080/api/currentJourney/stop/${stopName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            const currentStopCount = data;
            currentCounter.textContent = currentStopCount;
        })
        .catch(error => console.error("Error updating current stop count: " + error));
        
    }

    document.getElementById('payment-mode-btn').addEventListener('click', function() {
        generateQRCode('payment');
    });
    
    document.getElementById('test-mode-btn').addEventListener('click', function() {
        generateQRCode('test');
    });

    // Load journeys on page load
    loadJourneys();
});


function openModeSelection() {
    document.getElementById('mode-selection-modal').style.display = 'flex';
}

function closeModeSelection() {
    document.getElementById('mode-selection-modal').style.display = 'none';
}

function generateQRCode(mode) {
    closeModeSelection();
    
    let source = document.getElementById("from").value;
    let destination = document.getElementById("to").value;
    let numberOfPassengers = document.getElementById("numberOfPassengers").value;
    let journeyDropdown = document.getElementById("journey-route");
    let selectedJourneyId = journeyDropdown.value;

    if (!source || !destination || !numberOfPassengers) {
        alert("Please fill all fields!");
        return;
    }


    // Generate ticket for the passenger

    fetch("http://localhost:8080/api/tickets/generate/TestMode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            journeyId : selectedJourneyId,
            source: source,
            destination: destination,
            numberOfPassengers: parseInt(numberOfPassengers) || 1
        })
    })
    .then(response => response.text()) // Expect plain text response (URL)
    .then(paymentUrl => {
        console.log("Payment URL:", paymentUrl);

        // Generate QR code
    try {
        // Clear previous QR code if any
        const canvas = document.getElementById('modal-qr-code');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Generate new QR code
        let qr = new QRious({
            element: document.getElementById("qr-code"),
            value: paymentUrl,
            size: 200
        });
        
        // Show the QR modal
        document.getElementById('qr-modal').style.display = 'flex';
    } catch (error) {
        console.error("Error generating QR code:", error);
        alert("Failed to generate QR code. Please try again.");
    }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred: " + error.message);
    });


    updatePassengerCount(destination, numberOfPassengers);

    
}

function closeQRModal() {
    document.getElementById('qr-modal').style.display = 'none';
}