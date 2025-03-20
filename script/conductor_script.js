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
}


// Passenger Count Update
function updatePassengerCount(stop, count) {
    document.getElementById(stop).innerText = count;
    let total = parseInt(document.getElementById("stop1").innerText) +
                parseInt(document.getElementById("stop2").innerText) +
                parseInt(document.getElementById("stop3").innerText);
    document.getElementById("total-passengers").innerText = total;
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

    let journeys = []; // Store journeys globally

    // Fetch journeys from the backend and populate the dropdown
    function loadJourneys() {
        fetch("http://localhost:8080/api/journey/all") // Adjust URL to match backend API
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
        const selectedJourneyId = journeyDropdown.value;

        if (!selectedJourneyId) {
            alert("Please select a valid journey.");
            return;
        }

        if (startJourneyBtn.textContent === "Start Journey") {
            fetchStops(selectedJourneyId);
        } else {
            // Stop Journey logic
            updateStopsList([]);
            updateFromToDropdowns([]);
            journeyDropdown.value = "";
            startJourneyBtn.textContent = "Start Journey";
        }
    });

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

    // Load journeys on page load
    loadJourneys();
});
