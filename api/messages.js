

export default async function handler(req, res) {

    // 1. Check request method
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // 2. JSONBin configuration
        const BIN_ID = "6aeeb80eac6210605a7472b3";
        const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

        if (!MASTER_KEY) {
            throw new Error("Missing JSONBin API Key");
        }

        const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

        // 3. Receive user input
        const body = typeof req.body === "string"
            ? JSON.parse(req.body)
            : req.body || {};

        const { username, message } = body;

        // 4. Validate input
        if (
            typeof username !== "string" ||
            typeof message !== "string" ||
            !username.trim() ||
            !message.trim() ||
            username.length > 50 ||
            message.length > 1000
        ) {
            return res.status(400).json({
                error: "Invalid username or message"
            });
        }

        // 5. GET existing data from JSONBin
        const getResponse = await fetch(`${BIN_URL}/latest`, {
            method: "GET",
            headers: {
                "X-Master-Key": MASTER_KEY
            }
        });

        if (!getResponse.ok) {
            throw new Error("Failed to retrieve JSONBin data");
        }

        const binData = await getResponse.json();

        // 6. Read existing messages
        const messages = binData.record.messages;

        if (!Array.isArray(messages)) {
            throw new Error("Invalid JSONBin messages structure");
        }

        // 7. Add new message
        const newMessage = {
            id: crypto.randomUUID(),
            username: username.trim(),
            message: message.trim(),
            createdAt: new Date().toISOString()
        };

        messages.push(newMessage);

        // 8. PUT updated data to JSONBin
        const updateResponse = await fetch(BIN_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": MASTER_KEY
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Failed to update JSONBin");
        }

        // 9. Return success response
        return res.status(200).json({
            success: true,
            message: "Message saved successfully",
            data: newMessage
        });

    } catch (error) {

        console.error("Backend error:", error);

        return res.status(500).json({
            error: "Something went wrong while saving the message"
        });
    }
}
