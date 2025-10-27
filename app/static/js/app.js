// This file contains the JavaScript code for the frontend functionality.

document.addEventListener("DOMContentLoaded", function() {
    const eventSearchInput = document.getElementById("event-search");
    const filterTypeSelect = document.getElementById("filter-type");
    const eventsList = document.getElementById("events-list");
    const addEventButton = document.getElementById("add-event");
    const eventDialog = document.getElementById("event-dialog");
    const eventForm = document.getElementById("event-form");

    // Fetch events from the API
    async function fetchEvents() {
        const response = await fetch("/api/events");
        const events = await response.json();
        renderEvents(events);
    }

    // Render events in the list
    function renderEvents(events) {
        eventsList.innerHTML = "";
        events.forEach(event => {
            const li = document.createElement("li");
            li.textContent = `${event.title} - ${event.date} [${event.tag}]`;
            eventsList.appendChild(li);
        });
    }

    // Filter events based on search input and selected type
    function filterEvents() {
        const searchTerm = eventSearchInput.value.toLowerCase();
        const selectedType = filterTypeSelect.value;

        const filteredEvents = events_db.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm);
            const matchesType = selectedType === "all" || event.tag === selectedType;
            return matchesSearch && matchesType;
        });

        renderEvents(filteredEvents);
    }

    // Open the dialog to add a new event
    addEventButton.addEventListener("click", () => {
        eventDialog.showModal();
    });

    // Handle form submission to add a new event
    eventForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(eventForm);
        const newEvent = {
            title: formData.get("title"),
            date: formData.get("date"),
            tag: formData.get("tag"),
            desc: formData.get("desc"),
        };

        const response = await fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newEvent),
        });

        if (response.ok) {
            eventDialog.close();
            fetchEvents();
        }
    });

    // Event listeners for search and filter
    eventSearchInput.addEventListener("input", filterEvents);
    filterTypeSelect.addEventListener("change", filterEvents);

    // Initial fetch of events
    fetchEvents();
});