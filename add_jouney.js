document.addEventListener("DOMContentLoaded", function () {
    const journeyList = document.getElementById("journey-list"); // Ensure this exists
    const addJourneyBtn = document.getElementById("add-journey-btn");
    const journeyInput = document.getElementById("new-journey");

    if (!journeyList) {
        console.error("Element with ID 'journey-list' not found.");
        return;
    }

    addJourneyBtn.addEventListener("click", function () {
        const journey = journeyInput.value.trim();

        if (journey === "") {
            alert("Please enter a valid journey.");
            return;
        }

        // Create a new journey list item
        const journeyItem = document.createElement("li");
        journeyItem.innerHTML = `<strong>${journey}</strong> `;

        // Create "Add Stop" button
        const addStopBtn = document.createElement("button");
        addStopBtn.textContent = "Add Stop";
        addStopBtn.classList.add("add-stop-btn");
        addStopBtn.onclick = function () {
            addStop(journeyItem);
        };

        // Stops Container (ul inside each journey item)
        const stopsList = document.createElement("ul");
        stopsList.classList.add("stops-list");

        // Append elements to journey item
        journeyItem.appendChild(addStopBtn);
        journeyItem.appendChild(stopsList);

        // Append journey item to journey list
        journeyList.appendChild(journeyItem);

        // Clear input field after adding
        journeyInput.value = "";
    });

    function addStop(journeyItem) {
        const stopName = prompt("Enter stop name:");
        const distance = prompt("Enter distance from previous stop (km):");
        //ashwin
        if (!stopName || isNaN(distance) || distance <= 0) {
            alert("Invalid stop details.");
            return;
        }

        // Add stop to the journey
        const stopItem = document.createElement("li");
        stopItem.textContent = `${stopName} - ${distance} km`;

        journeyItem.querySelector(".stops-list").appendChild(stopItem);
    }
});