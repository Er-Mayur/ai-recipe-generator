const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/generateRecipe", async (req, res) => {
  const { ingeredients, mealType, cuisine, cookingTime, complexity } = req.query;

  if (!ingeredients || !mealType || !cuisine || !cookingTime || !complexity) {
    return res.status(400).json({ error: "Missing query parameters." });
  }

  const prompt = [];
  prompt.push("Generate a complete and creative recipe based on the following details:");
  prompt.push(`[Ingredients: ${ingeredients}]`);
  prompt.push(`[Meal Type: ${mealType}]`);
  prompt.push(`[Cuisine Preference: ${cuisine}]`);
  prompt.push(`[Cooking Time: ${cookingTime}]`);
  prompt.push(`[Complexity: ${complexity}]`);
  prompt.push("");
  prompt.push("Include the following sections in your answer:");
  prompt.push("1. 🍽️ Recipe Name (in the local language of the cuisine)");
  prompt.push("2. 📝 Ingredients List");
  prompt.push("3. 🔪 Preparation Steps");
  prompt.push("4. 🔥 Cooking Instructions");
  prompt.push("5. 🧠 Cooking Tips & Tricks");
  prompt.push("6. 🍴 How to Serve (presentation, accompaniments, etc.)");
  prompt.push("7. ❤️ Health Benefits or Nutrition Tips based on ingredients");
  prompt.push("");
  prompt.push("Ensure the instructions are clear, friendly, and useful for home cooks.");

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192", // You can change to "mistral-7b-8k" for faster replies
        messages: [
          {
            role: "system",
            content: "You are a master chef assistant who writes professional-quality, healthy recipes.",
          },
          {
            role: "user",
            content: prompt.join(" "),
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const recipe = response.data.choices[0].message.content;
    res.json({ recipe });
  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate recipe." });
  }
});
