const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAAZBDZCswgNHMBRATpFbSXo5UGHIY2gOJDoiZBtMuCOvRKI3NZAZB8Cdip092NbCfpKmImLZAq934YEWPycFsOTIaUDhowJ0ayz1TDaLKbXpbmCzhgqmBmFhjiRYw1XhT9kIDwvOnstlyOcP7drdEGp8Y341ZB4V8JN0Vf0UBNVZBFuWsw2FRGtKgDirIrm5gH4XkqmjFwgUdmPk65MSdSfFdWwh0aBRnbkTJ3Fs0EQCh9h1U8dgrHiGv9E7AtV4PRKJ9H5kud5dYsrv8jgyx1Yx";
const PHONE_NUMBER_ID = "1073349015858656";

// Home
app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running ✅");
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

// Webhook receive
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message?.text?.body?.toLowerCase().trim();

  if (!text) return res.sendStatus(200);

  console.log("Received:", text);

  try {
    if (/bag/i.test(text)) {
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "image",
          image: {
            link: "https://via.placeholder.com/300",
            caption: "📦 Premium Travel Bag\n💰 Price: 990 TK\n📝 High quality stylish bag"
          }
        },
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" } }
      );
    } else if (/watch/i.test(text)) {
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "image",
          image: {
            link: "https://via.placeholder.com/300",
            caption: "⌚ Luxury Watch\n💰 Price: 650 TK\n📝 Stylish watch for men"
          }
        },
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" } }
      );
    } else {
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "দয়া করে bag / watch লিখুন" }
        },
        { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Error sending message:", err.response?.data || err.message);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server running on port 3000..."));
