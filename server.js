const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// CORS (VERY IMPORTANT)
app.use(cors({
  origin: "*"
}));

app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    // 400: Missing name
    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name query parameter is required"
      });
    }

    // 422: Not a string
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    // Call Genderize API
    const response = await axios.get(`https://api.genderize.io`, {
      params: { name }
    });

    const { gender, probability, count } = response.data;

    // Edge case
    if (!gender || count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    // Confidence logic
    const is_confident = probability >= 0.7 && count >= 100;

    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size: count,
        is_confident,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(error.message);

    return res.status(502).json({
      status: "error",
      message: "Failed to fetch data from external API"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});