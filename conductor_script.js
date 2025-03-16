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

// Google Maps Integration
let map, marker;

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

// Start/Stop Journey Button
document.addEventListener("DOMContentLoaded", function () {
    const journeyButton = document.querySelector(".str");

    journeyButton.addEventListener("click", function () {
        if (journeyButton.innerText === "Start Journey") {
            journeyButton.innerText = "Stop Journey";
            journeyButton.style.backgroundColor = "#dc3545";
        } else {
            journeyButton.innerText = "Start Journey";
            journeyButton.style.backgroundColor = "#28a745";
        }
    });
});

// Fetch stops dynamically
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:8080/api/stops");
        if (!response.ok) {
            throw new Error("Failed to fetch stops.");
        }

        const stops = await response.json();
        updateStopsList(stops);
    } catch (error) {
        console.error("Error fetching stops:", error);
    }
});

function updateStopsList(stops) {
    const stopsList = document.getElementById("stops-list");
    stopsList.innerHTML = "";

    if (stops.length === 0) {
        stopsList.innerHTML = "<li>No stops available</li>";
        return;
    }

    stops.forEach(stop => {
        const li = document.createElement("li");
        li.textContent = stop.name;
        stopsList.appendChild(li);
    });
}
