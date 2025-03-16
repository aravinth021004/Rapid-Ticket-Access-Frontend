document.addEventListener("DOMContentLoaded", function () {
    const journeyList = document.getElementById("journey-list");
    const addJourneyBtn = document.getElementById("add-journey-btn");
    const journeyInput = document.getElementById("new-journey");

    if (!journeyList) {
        console.error("Element with ID 'journey-list' not found.");
        return;
    }

    // Fetch journeys from backend
    fetchJourneys();

    addJourneyBtn.addEventListener("click", async function () {
        const journeyText = journeyInput.value.trim();

        if (journeyText === "") {
            alert("Please enter a valid journey.");
            return;
        }

        const parts = journeyText.split("-");
        if (parts.length !== 2) {
            alert("Invalid format. Use 'From-To' format.");
            return;
        }

        const from = parts[0].trim();
        const to = parts[1].trim();

        if (!from || !to) {
            alert("Both 'From' and 'To' fields must be filled.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/journeys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ from, to })
            });

            if (!response.ok) {
                throw new Error("Failed to add journey.");
            }

            // Add the new journey to UI
            const journey = await response.json();
            addJourneyToUI(journey);
            journeyInput.value = "";

        } catch (error) {
            console.error("Error adding journey:", error);
        }
    });

    async function fetchJourneys() {
        try {
            const response = await fetch("http://localhost:8080/api/journeys");
            if (!response.ok) {
                throw new Error("Failed to fetch journeys.");
            }

            const journeys = await response.json();
            journeys.forEach(addJourneyToUI);
        } catch (error) {
            console.error("Error fetching journeys:", error);
        }
    }

    function addJourneyToUI(journey) {
        const journeyItem = document.createElement("li");
        journeyItem.innerHTML = `<strong>${journey.from} to ${journey.to}</strong> `;

        const addStopBtn = document.createElement("button");
        addStopBtn.textContent = "Add Stop";
        addStopBtn.classList.add("add-stop-btn");

        const stopsList = document.createElement("ul");
        stopsList.classList.add("stops-list");

        journeyItem.appendChild(addStopBtn);
        journeyItem.appendChild(stopsList);
        journeyList.appendChild(journeyItem);

        addStopBtn.addEventListener("click", function () {
            addStop(journey.id, stopsList);
        });

        fetchStops(journey.id, stopsList);
    }

    async function addStop(journeyId, stopsList) {
        const stopName = prompt("Enter stop name:");
        const distance = prompt("Enter distance from previous stop (km):");

        if (!stopName || isNaN(distance) || distance <= 0) {
            alert("Invalid stop details.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/journeys/${journeyId}/stops`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: stopName, distance: parseFloat(distance) })
            });

            if (!response.ok) {
                throw new Error("Failed to add stop.");
            }

            const stop = await response.json();
            const stopItem = document.createElement("li");
            stopItem.textContent = `${stop.name} - ${stop.distance} km`;
            stopsList.appendChild(stopItem);

        } catch (error) {
            console.error("Error adding stop:", error);
        }
    }

    async function fetchStops(journeyId, stopsList) {
        try {
            const response = await fetch(`http://localhost:8080/api/journeys/${journeyId}/stops`);
            if (!response.ok) {
                throw new Error("Failed to fetch stops.");
            }

            const stops = await response.json();
            stops.forEach(stop => {
                const stopItem = document.createElement("li");
                stopItem.textContent = `${stop.name} - ${stop.distance} km`;
                stopsList.appendChild(stopItem);
            });

        } catch (error) {
            console.error("Error fetching stops:", error);
        }
    }
});
