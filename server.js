const express = require("express");

// FIX fetch untuk semua Node version
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;

// Health check
app.get("/", (req, res) => {
  res.send("Slang API is running.");
});

// Translate endpoint
app.get("/translate", async (req, res) => {
  try {
    const text = req.query.text;

    if (!text) {
      return res.status(400).send("error: no text provided");
    }

    if (!API_KEY) {
      return res.status(500).send("error: missing api key");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 1.3,
          top_p: 0.95,
          presence_penalty: 0.8,
          frequency_penalty: 0.7,
          max_tokens: 60,
          messages: [
            {
              role: "system",
              content: `
YOU ARE AN EXTREME STREET SLANG TRANSLATOR.

RULES (STRICT):
- Indonesian → EXTREME aggressive English street slang
- MUST sound loud, chaotic, gangster, overaction street talk
- NEVER use formal English
- MAX 1 SHORT sentence only
- NO explanation
- NO polite tone
- NO textbook grammar

STYLE:
- emotional
- exaggerated slang
- street energy

EXAMPLES:

"lu ngapain disini"
→ "yo what the hell you doin creepin round here"

"gua mau pergi"
→ "nah I’m out this place right now fr"

"jangan ganggu aku"
→ "yo don’t you fckin mess with me"

"kalian pergi saja"
→ "y’all better bounce the hell outta here"

NOW TRANSLATE:
`
            },
            {
              role: "user",
              content: text
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output = data?.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return res.status(500).send("error: empty response");
    }

    res.send(output);
  } catch (err) {
    console.error(err);
    res.status(500).send("error: api failed");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
