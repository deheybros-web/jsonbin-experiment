

const form = document.getElementById("messageForm");
const statusText = document.getElementById("status");
const submitButton = document.getElementById("submitButton");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
        .getElementById("username")
        .value.trim();

    const message = document
        .getElementById("message")
        .value.trim();

    if (!username || !message) {
        statusText.textContent = "Please fill in all fields.";
        return;
    }

    const userData = {
        username,
        message
    };

    try {
        submitButton.disabled = true;
        statusText.textContent = "Sending message...";

        const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Submission failed.");
        }

        statusText.textContent = "Message successfully submitted!";

        form.reset();

    } catch (error) {
        console.error("Submission error:", error);

        statusText.textContent = error.message;

    } finally {
        submitButton.disabled = false;
    }
});
