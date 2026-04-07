const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "juyel123";

const ACCESS_TOKEN = "EAAZBDZCswgNHMBRCRQTLZBur4TUIKlH3bXkjOeMbl2JCcu8Jd6G6ufkbBGRGutCNCqifyCMMZBo6nhRiFVURLhnGOW8CQRxyGyWios0BZB7XbVD9Xtx2Rx5bDu1INId2iekrSrG9OwVp69a8D6ZBVhZAeuBqzqQ48VyHMuAp1SEZAH0lRD9OoCGPu1ZArszoCCZAlZAuyor9ysDAZBN1K8IqWxZAOCIw0KFFnSmKU7cmgT9D1XvNxdU5yO8QEpcVeZBibKAazhV9CxZATvJu39eNe8e1ZCfAPQZDZD";

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

// Message receive + smart reply
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body?.toLowerCase().trim();

    console.log("Message:", text);

    // Bag
    if (text && text.includes("bag")) {
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
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Watch
    else if (text && text.includes("watch")) {
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
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Default reply
    else {
      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "দয়া করে bag / watch লিখুন" }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server running...");
});
