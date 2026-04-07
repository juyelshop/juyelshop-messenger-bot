const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "YOUR_ACCESS_TOKEN= "EAAZBDZCswgNHMBRLNHwI5zW7FwalF9qcb5UgDs5wgoTPbg5zBSHOFaiyGNsDQ2mE22xUJZCFiAT29dp36eOBPbm5HQg67gMq6wkTYYXtR7wGNptytjD2GUbgOEa820ZBNUXEcYO4q4TNLycZClN6lCrFg7FOZB9T1PziZB0aRWdCjLWZASqCbZAwxvKFpqZABBjmZCoPOBk8b1Y5acWbCTLljZCY3SopFfKU8ZAzMKBYEAkl515ISl7vXAZBrrZCj9H7ZCTXZBVrs686Ys1LzBx8eyEpvwZAQg";
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

// 🔍 WEBSITE SCRAPER FUNCTION
async function getProductFromWebsite(keyword) {
  try {
    const url = "https://juyelshop.com/";
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    let foundProduct = null;

    $(".product, .product-item, .card").each((i, el) => {
      const name = $(el).find("h2, h3, .title").text().trim();
      const price = $(el).find(".price").text().trim();
      const image = $(el).find("img").attr("src");

      if (name.toLowerCase().includes(keyword.toLowerCase())) {
        foundProduct = {
          name,
          price,
          image: image?.startsWith("http")
            ? image
            : "https://juyelshop.com" + image
        };
        return false;
      }
    });

    return foundProduct;

  } catch (err) {
    console.log("Scraping error:", err.message);
    return null;
  }
}

// Webhook receive
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message?.text?.body?.toLowerCase().trim();

  if (!text) return res.sendStatus(200);

  console.log("Message:", text);

  try {
    let responseData;

    // 👋 Greeting
    if (/^(hi|hello|হাই|হ্যালো)$/i.test(text)) {
      responseData = {
        type: "text",
        data: { body: "👋 স্বাগতম!\nআপনি কোন প্রোডাক্ট খুঁজছেন? লিখুন (bag, watch...)" }
      };
    }

    // 🔍 Product Search
    else {
      const product = await getProductFromWebsite(text);

      if (product) {
        responseData = {
          type: "image",
          data: {
            link: product.image,
            caption: `📦 ${product.name}\n💰 ${product.price}`
          }
        };
      } else {
        responseData = {
          type: "text",
          data: { body: "❌ প্রোডাক্ট পাওয়া যায়নি। অন্য কিছু লিখুন।" }
        };
      }
    }

    // 📤 Send to WhatsApp
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        [responseData.type]: responseData.data
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    console.log("Send error:", err.response?.data || err.message);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server running 🚀"));
