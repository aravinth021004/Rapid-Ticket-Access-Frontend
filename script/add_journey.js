document.addEventListener("DOMContentLoaded", function () {
    const journeyList = document.getElementById("journey-list");
    const addJourneyBtn = document.getElementById("add-journey-btn");
    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");
    const selectedJourneyStops = document.getElementById("selected-journey-stops");
    const addStopBtn = document.getElementById("add-stop-btn");
    const addStopPopup = document.getElementById("add-stop-popup");
    const saveStopBtn = document.getElementById("save-stop-btn");
    const cancelStopBtn = document.getElementById("cancel-stop-btn");
    const stopNameInput = document.getElementById("stop-name");
    const stopDistanceInput = document.getElementById("stop-distance");

    let currentJourney = null; // Store the currently selected journey

    // Fetch all journeys
    function fetchJourneys() {
        fetch("http://localhost:8080/api/journey/all")
            .then(response => response.json())
            .then(data => {
                journeyList.innerHTML = ""; // Clear list
                data.forEach(journey => {
                    const journeyItem = document.createElement("li");
                    journeyItem.innerHTML = `<strong>From:</strong> ${journey.startPlace} <strong>To:</strong> ${journey.endPlace}`;

                    const deleteJourneyBtn = document.createElement("button");
                    deleteJourneyBtn.textContent = "Delete";
                    deleteJourneyBtn.classList.add("delete-journey-btn");

                    deleteJourneyBtn.addEventListener("click", function () {
                        deleteJourney(journey.id);
                    });

                    journeyItem.appendChild(deleteJourneyBtn);
                    journeyList.appendChild(journeyItem);

                    journeyItem.addEventListener("click", function () {
                        fetchStopsForJourney(journey.id);
                        addStopBtn.style.display = "block"; // Show "Add Stop" button
                        currentJourney = journey; // Set the current journey
                    });
                });
            })
            .catch(error => console.error("Error fetching journeys:", error));
    }

    // Fetch stops for a journey
    async function fetchStopsForJourney(journeyId) {
        try {
            const response = await fetch(`http://localhost:8080/api/stops/getStops/${journeyId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const stops = await response.json();
            
            // Transform the response into the format needed for dropdowns
            const formattedStops = stops.map(stop => ({
                id: stop.id,
                name: stop.currentStop,  // Using currentStop as name
                distance: stop.distanceFromStart
            }));
        
            console.log("Fetched stops:", formattedStops);

            selectedJourneyStops.innerHTML = ""; // Clear existing stops

            formattedStops.forEach(stop => {
                const stopItem = document.createElement("li");
                stopItem.innerHTML = `${stop.name}`;

                // Modify button
                const modifyButton = document.createElement("button");
                modifyButton.textContent = "Modify";
                modifyButton.addEventListener("click", function () {
                    modifyStop(stop.id);
                });

                // Delete button
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", function () {
                    deleteStop(stop.id);
                });

                stopItem.appendChild(modifyButton);
                stopItem.appendChild(deleteButton);
                selectedJourneyStops.appendChild(stopItem);
            });

        } catch (error) {
            console.error("Error fetching stops:", error);
            alert("Failed to load stops. Please try again.");
        }
        
    }

    // Add Stop to the journey
    addStopBtn.addEventListener("click", function () {
        addStopPopup.style.display = "block"; // Show the popup
    });

    saveStopBtn.addEventListener("click", function () {
        const stopName = stopNameInput.value.trim();
        const stopDistance = stopDistanceInput.value.trim();

        if (!stopName || !stopDistance) {
            alert("Please enter valid stop name and distance.");
            return;
        }

        const newStop = {
            currentStop: stopName,
            distanceFromStart: parseFloat(stopDistance),
        };

        fetch(`http://localhost:8080/api/stops/addStop/${currentJourney.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStop),
        })
            .then(response => response.json())
            .then(() => {
                stopNameInput.value = "";
                stopDistanceInput.value = "";
                addStopPopup.style.display = "none"; // Hide the popup
                fetchStopsForJourney(currentJourney.id); // Refresh stops
            })
            .catch(error => console.error("Error adding stop:", error));
    });

    cancelStopBtn.addEventListener("click", function () {
        addStopPopup.style.display = "none"; // Hide the popup
    });

    // Modify Stop
    function modifyStop(stopId) {
        const newStopName = prompt("Enter new stop name:");
        const newStopDistance = prompt("Enter new stop distance (in km):");

        if (!newStopName || !newStopDistance) {
            alert("Invalid input. Please enter valid details.");
            return;
        }

        const updatedStop = {
            currentStop: newStopName,
            distanceFromStart: parseInt(newStopDistance),
        };

        fetch(`http://localhost:8080/api/stops/modifyStop/${stopId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedStop),
        })
            .then(response => response.text())
            .then(() => {
                fetchStopsForJourney(currentJourney.id); // Refresh stops
            })
            .catch(error => console.error("Error modifying stop:", error));
    }

    // Delete Stop
    function deleteStop(stopId) {
        if (!confirm("Are you sure you want to delete this stop?")) return;

        fetch(`http://localhost:8080/api/stops/deleteStop/${stopId}`, { method: "DELETE" })
            .then(() => fetchStopsForJourney(currentJourney.id)) // Refresh stops
            .catch(error => console.error("Error deleting stop:", error));
    }


    // Modify Journey
    function modifyJourney(journeyId, updatedJourneyData) {
        fetch(`http://localhost:8080/api/journey/modify/${journeyId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedJourneyData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to modify journey");
            }
            return response.text(); // Because your API returns a simple text response
        })
        .then(data => {
            console.log("Success:", data);
            alert("Journey modified successfully!");
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to modify journey.");
        });
    }
    

    // Delete Journey
    function deleteJourney(journeyId) {
        fetch(`http://localhost:8080/api/journey/delete/${journeyId}`, { method: "DELETE" })
            .then(() => fetchJourneys()) // Refresh journey list
            .catch(error => console.error("Error deleting journey:", error));
    }

    // Fetch all journeys on page load
    fetchJourneys();
});
