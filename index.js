const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const ACCESS_TOKEN = "EAAZBDZCswgNHMBRHslekXl8XePHQ9MoayFz5JLR7ZCNSBhSZCDzTCMzwIBqmKg7kagAZCgJZBgZCrHO9F5dREIgzDGBIxuhQXY0Gu79ZAlCygMA531Dr3M7S3ffsZBadbAEo8ZA9KvYvzVxZCJBBViJ4c9JwlPXvgi3Kw3ZCOhPIBQzLHtQpBclZA36ZBKNHquoay5s1OhTCIHZBvNYXf6OCVENvKanJgwzAJX7uvZBZAGCP2N6JzIZBoyEPREqRH6fGCWZC0rRbBh3ZCr4EhSM8ViJKBnTp0ZAvm";

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

// Message receive
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body?.toLowerCase();

    console.log("Message:", text);

    // Product list
    const products = {
      "bag": {
        name: "Premium Travel Bag",
        price: "990 TK",
        image: "https://via.placeholder.com/300",
        description: "High quality stylish bag"
      },
      "watch": {
        name: "Luxury Watch",
        price: "650 TK",
        image: "https://via.placeholder.com/300",
        description: "Stylish watch for men"
      }
    };

    if (products[text]) {
      const product = products[text];

      await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "image",
          image: {
            link: product.image,
            caption: `📦 ${product.name}\n💰 Price: ${product.price}\n📝 ${product.description}`
          }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    } else {
      await sendMessage(from, "দয়া করে bag / watch লিখুন");
    }
  }

  res.sendStatus(200);
});
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("Message:", text);

    // Reply
    await sendMessage(from, `আপনি লিখেছেন: ${text}`);
  }

  res.sendStatus(200);
});

// Send message
async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

app.listen(3000, () => {
  console.log("Server running...");
});
