document.addEventListener("DOMContentLoaded", function () {
    const journeyList = document.getElementById("journey-list");
    const addJourneyBtn = document.getElementById("add-journey-btn");
    const journeyInput = document.getElementById("new-journey");

    if (!journeyList) {
        console.error("Element with ID 'journey-list' not found.");
        return;
    }

    // Fetch journeys from the backend
    function fetchJourneys() {
        fetch("http://localhost:8080/api/journey/all") // API url for getting all the journeys
            .then(response => response.json())
            .then(data => {
                journeyList.innerHTML = ""; // Clear previous list items
                
                data.forEach(journey => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `<strong>From:</strong> ${journey.startPlace} <strong>To:</strong> ${journey.endPlace}`;

                    // Create Delete Button
                    const deleteJourneyBtn = document.createElement("button");
                    deleteJourneyBtn.textContent = "Delete";
                    deleteJourneyBtn.classList.add("delete-journey-btn");
                    
                    // Attach event listener for deleting a journey
                    deleteJourneyBtn.addEventListener("click", function () {
                        deleteJourney(journey.id);
                    });

                    listItem.appendChild(deleteJourneyBtn);
                    journeyList.appendChild(listItem);
                });
            })
            .catch(error => console.error("Error fetching journeys:", error));
    }

    // Function to Add a New Journey
    addJourneyBtn.addEventListener("click", function () {
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

        // Send journey to backend
        const newJourney = { startPlace: from, endPlace: to };

        fetch("http://localhost:8080/api/journey/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newJourney),
        })
        .then(response => response.json())
        .then(() => {
            journeyInput.value = ""; // Clear input
            fetchJourneys(); // Refresh journey list
        })
        .catch(error => console.error("Error adding journey:", error));
    });

    // Function to Delete a Journey
    function deleteJourney(journeyId) {
        fetch(`http://localhost:8080/api/journey/delete/${journeyId}`, { method: "DELETE" })
            .then(() => fetchJourneys()) // Refresh journey list
            .catch(error => console.error("Error deleting journey:", error));
    }

    // Initial fetch of journeys
    fetchJourneys();
});
