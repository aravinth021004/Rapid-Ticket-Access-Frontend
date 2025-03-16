conductor_script.js
// QR Code Generation
function generateQR() {
    let from = document.getElementById("from").value;
    let to = document.getElementById("to").value;

    if (!from || !to) {
        alert("Please fill all fields!");
        return;
    }

    let qrData = `From: ${from}, To: ${to}`;
    new QRious({
        element: document.getElementById("qr-code"),
        value: qrData,
        size: 200
    });

    document.getElementById("qr-container").style.display = "block";
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
    const journeyButton = document.querySelector(".str");

    journeyButton.addEventListener("click", function () {
        if (journeyButton.innerText === "Start Journey") {
            journeyButton.innerText = "Stop Journey";
            journeyButton.style.backgroundColor = "#dc3545"; // Change to red
        } else {
            journeyButton.innerText = "Start Journey";
            journeyButton.style.backgroundColor = "#28a745"; // Change back to green
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    fetchStops();
});

async function fetchStops() {
    try {
        const response = await fetch("http://your-backend-url/api/stops"); // Replace with your actual backend API URL
        if (!response.ok) {
            throw new Error("Failed to fetch stops");
        }
        const stops = await response.json();
        updateStopsList(stops);
    } catch (error) {
        console.error("Error fetching stops:", error);
    }
}

function updateStopsList(stops) {
    const stopsList = document.getElementById("stops-list");
    stopsList.innerHTML = ""; // Clear existing stops before updating

    if (stops.length === 0) {
        stopsList.innerHTML = "<li>No stops available</li>";
        return;
    }

    stops.forEach(stop => {
        const li = document.createElement("li");
        li.textContent = stop.name; // Assuming backend returns { name: "Stop 1" }
        stopsList.appendChild(li);
    });
}
// Function to add a new journey dynamically
function addJourney() {
    let newJourneyInput = document.getElementById("new-journey");
    let newJourney = newJourneyInput.value.trim();

    if (newJourney === "") {
        alert("Please enter a valid journey.");
        return;
    }

    let journeyDropdown = document.getElementById("journey-route");

    // Check if the journey already exists
    let exists = Array.from(journeyDropdown.options).some(option => option.value === newJourney);
    if (exists) {
        alert("Journey already exists!");
        return;
    }

    // Create new option and add to dropdown
    let newOption = document.createElement("option");
    newOption.value = newJourney;
    newOption.textContent = newJourney;
    journeyDropdown.appendChild(newOption);

    // Clear input field
    newJourneyInput.value = "";
}




// Call initMap() when the page loads
window.onload = initMap;
