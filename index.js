const handleInstagramSubmit = async () => {
  if (userInstagram.trim() !== "" && tempScore) {
    const newScore = { ...tempScore, name: userInstagram };

    const device = isPhone ? "phone" : "computer";
    const currentScores = isPhone ? highScoresPhone : highScoresComputer;

    // Add the new score to the leaderboard and sort
    const updatedScores = [...currentScores, newScore]
      .sort((a, b) => a.time - b.time)
      .slice(0, 3); // Keep only top 3

    // Update the leaderboard state locally first
    if (isPhone) {
      setHighScoresPhone(updatedScores);
    } else {
      setHighScoresComputer(updatedScores);
    }

    // Close the modal before sending the request to avoid issues
    setTempScore(null);
    setIsModalOpen(false);

    // Show "Submitting..." message
    setSubmitting(true);

    try {
      // Send score to the backend
      const response = await fetch(
        "https://a-to-z-server-oa7r.onrender.com/api/scores", // Single endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userInstagram,
            time: tempScore.time,
            device, // Add device here (phone or computer)
          }),
        }
      );

      if (response.ok) {
        // Fetch the updated leaderboard from the server
        const updatedScoresFromServer = await response.json();

        // Separate the scores by device type
        const phoneScores = updatedScoresFromServer.phone; // From response
        const computerScores = updatedScoresFromServer.computer; // From response

        // Update the states
        if (isPhone) {
          setHighScoresPhone(phoneScores);
        } else {
          setHighScoresComputer(computerScores);
        }
      } else {
        console.error("Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      // Hide "Submitting..." message
      setSubmitting(false);
    }
  }
};
