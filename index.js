const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// তোমার data বসাও
const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAANizvxgfaYBRGl2FbZBD9pjtNg6WCACrmCyPhGPh2WMegqRIT91qcrUzWQvmjncUkdnxbRicyzqBZCzsyIKZBcnRqJSYgrh9JbcNri1ZAyLwd9bCexfbFsgQB21mLQubp0RRPeIRWHNYIfZCSVfUO1E5gZBsQ2A9nBUmDbZBmigbSS9cIZAHVQ424P298NOQa6BYfeP5ftde42dedOM7LOtOWWylDWtlIzfZADR6KhU4zDZCZCfg1IVALHJAZAVPlMu6ytn1N2EdS3jWP8i9lcGn3IV";
const PHONE_NUMBER_ID = "1073349015858656";
const GEMINI_API_KEY = "AIzaSyAvFGOynJTrPsC5VLkDhCWQUuPXOP3x5cw";

// Home
app.get("/", (req, res) => {
  res.send("AI WhatsApp Bot Running 🤖");
});

// Webhook verify
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// AI function
async function getAIResponse(userText) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userText }]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (err) {
    return "দুঃখিত, এখন উত্তর দিতে সমস্যা হচ্ছে।";
  }
}

// Receive message
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("User:", text);

    let reply = "";

    // Custom rules (priority)
    if (text.toLowerCase().includes("delivery")) {
      reply = "ঢাকা সিটির ভিতরে ডেলিভারি চার্জ ৬০ টাকা, বাইরে ১২০ টাকা।";
    } else if (text.toLowerCase().includes("price")) {
      reply = "দাম জানতে ভিজিট করুন: https://juyelshop.com/";
    } else {
      // AI reply
      reply = await getAIResponse(text);
    }

    // Send reply
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  }

  res.sendStatus(200);
});

// Server start
app.listen(3000, () => {
  console.log("Server running with AI...");
});
