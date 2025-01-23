const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: `*` }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Score Schema & Model
const scoreSchema = new mongoose.Schema({
  name: String,
  time: Number,
});

const Score = mongoose.model("scores", scoreSchema);

// Endpoint to get leaderboard scores
app.get("/api/scores", async (req, res) => {
  try {
    const scores = await Score.find().sort({ time: 1 }); // Sort by time (ascending)
    res.json(scores); // Return all scores in a single leaderboard
  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Route to submit a new score
app.post("/api/scores", async (req, res) => {
  const { name, time } = req.body;

  if (!name || !time) {
    return res.status(400).json({ message: "Name and time are required." });
  }

  try {
    const newScore = new Score({ name, time });
    await newScore.save();

    // Get all scores, sorted by time
    const scores = await Score.find().sort({ time: 1 }).limit(3); // Limit to top 3 scores

    res.status(201).json(scores); // Return the top 3 scores
  } catch (err) {
    res.status(500).json({ message: "Error saving score" });
  }
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
