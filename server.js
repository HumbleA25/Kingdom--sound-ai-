require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.send("Welcome to Kingdom Sounds AI!");
});

app.get("/api/health", (req, res) => {
    res.json({
        project: "Kingdom Sounds AI",
        status: "Running",
        apiKeyConfigured: Boolean(
            process.env.ELEVENLABS_API_KEY
        )
    });
});

// AI MUSIC GENERATOR
app.post("/api/generate", async (req, res) => {
    try {
        const { prompt, durationSeconds = 30 } = req.body;

        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                error: "Please provide a music prompt."
            });
        }

        if (
            !Number.isInteger(durationSeconds) ||
            durationSeconds < 3 ||
            durationSeconds > 600
        ) {
            return res.status(400).json({
                error: "Duration must be between 3 and 600 seconds."
            });
        }

        const response = await fetch(
            "https://api.elevenlabs.io/v1/music",
            {
                method: "POST",
                headers: {
                    "xi-api-key": process.env.ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt,
                    music_length_ms: durationSeconds * 1000,
                    model_id: "music_v2_5"
                })
            }
        );

        if (!response.ok) {
            console.error(
                "ElevenLabs error:",
                await response.text()
            );

            return res.status(response.status).json({
                error: "Music generation failed. Check your API access and credits."
            });
        }

        const audio = Buffer.from(
            await response.arrayBuffer()
        );

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="kingdom-song.mp3"'
        );

        res.send(audio);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong."
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `Kingdom Sounds AI running on port ${PORT}`
    );
});
