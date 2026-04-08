// index.js
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// ============================
// Credentials (place your secrets here)
// ============================
const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAANizvxgfaYBRP3EbYisIKmTuC3A2ijQghiUoh23lxw2kndWDZBr66lgNY4tpCj5P2xo4mLhrRqu87MZCQk3F97HMnao2Ij8Qen9XgF9p07sRNMwUfGBWGlR9eL81HCS4vArbMKweGuGdVQMrOkHjd1K1E5gNCSDZCJ1U6ZBozyJvv2QHDMGRjP5zIRyhmwGxOmrSXXongVbZAyZB7irsPXtGlAQJC7OcNZC8oIZCqgGMkMTK1WQhrMrmrD8SiPfaANhTtGXCgMs5wcUcD0XMaMc";
const PHONE_NUMBER_ID = "1073349015858656";
const GEMINI_API_KEY = "AIzaSyCQGQooNNnYfO-gR5ni9MNh2eome7u49M4";
const PORT = 3000;

// ============================
// Home route
// ============================
app.get("/", (req, res) => {
  res.send("AI WhatsApp Bot Running 🤖");
});

// ============================
// Webhook verification
// ============================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verified ✅");
    res.status(200).send(challenge);
  } else {
    console.log("Webhook verification failed ❌");
    res.sendStatus(403);
  }
});

// ============================
// AI Response function
// ============================
async function getAIResponse(userText) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${GEMINI_API_KEY}`,
      {
        prompt: [{ text: userText }],
        temperature: 0.7,
        candidate_count: 1
      }
    );
    return response.data.candidates[0].content[0].text;
  } catch (err) {
    console.log("AI API Error:", err.response?.data || err.message);
    return "দুঃখিত, এখন উত্তর দিতে সমস্যা হচ্ছে।";
  }
}

// ============================
// Receive WhatsApp messages
// ============================
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message?.text?.body || "";
    console.log("User:", text);

    let reply = "";

    // Custom fixed replies (priority)
    if (text.toLowerCase().includes("delivery")) {
      reply = "ঢাকা সিটির ভিতরে ডেলিভারি চার্জ ৬০ টাকা, বাইরে ১২০ টাকা।";
    } else if (text.toLowerCase().includes("price")) {
      reply = "দাম জানতে ভিজিট করুন: https://juyelshop.com/";
    } else {
      // AI generates response
      reply = await getAIResponse(text);
    }

    // Send reply via WhatsApp API
    try {
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
      console.log("Reply sent ✅");
    } catch (err) {
      console.log("WhatsApp send error:", err.response?.data || err.message);
    }

  } catch (err) {
    console.log("Webhook processing error:", err.message);
  }

  res.sendStatus(200);
});

// ============================
// Start server
// ============================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
