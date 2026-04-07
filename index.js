const express = require("express");
const axios = require("axios");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAAZBDZCswgNHMBRDAqqWS2ZCkCjiXpc553peZAngIehK5V7och9PECYB4ECC4LjZCxR1EofYKJcI58ybtPcdZBHZByVZCKTR25nMtqGqGqtI28td2lektYkhRb46IZBHUPvbShgJvAWP7udUPeug6nCiviZCS223zBMnMdcV7fgcfSgkPVgZCbbMbro4c63GpNIulKdBkvJTm5hkDScye9iP1dHkLrYxoZBne1NNaq9ycgfxl7ZAhR5ocnRCraN0W7QcDrHZAq0Xyt51HamI1DUHyYDpZCuSgZDZD";
const PHONE_NUMBER_ID = "1073349015858656";
const WEBSITE_URL = "https://juyelshop.com/";

// Home
app.get("/", (req, res) => res.send("Bot Running ✅"));

// Webhook verify
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  return res.sendStatus(403);
});

// Puppeteer Scraper
async function scrapeProduct(keyword) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(WEBSITE_URL, { waitUntil: "networkidle2" });

    // Adjust selectors based on your website structure
    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("div.product-item").forEach(prod => {
        const name = prod.querySelector("h2, h3")?.innerText || "";
        const price = prod.querySelector(".price")?.innerText || "";
        const image = prod.querySelector("img")?.src || "";
        items.push({ name, price, image });
      });
      return items;
    });

    await browser.close();

    // Match keyword
    const matched = products.find(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    return matched || null;

  } catch (err) {
    console.log("Scrape error:", err.message);
    return null;
  }
}

// WhatsApp Message Handler
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message?.text?.body?.trim();
  if (!text) return res.sendStatus(200);

  console.log("User:", text);

  try {
    let payload;

    // Greeting
    if (/^(hi|hello|হাই|হ্যালো)$/i.test(text)) {
      payload = {
        type: "text",
        data: { body: "👋 স্বাগতম!\nআপনি কোন প্রোডাক্ট খুঁজছেন?" }
      };
    } else {
      const product = await scrapeProduct(text);
      if (product) {
        payload = {
          type: "image",
          data: {
            link: product.image,
            caption: `📦 ${product.name}\n💰 ${product.price}`
          }
        };
      } else {
        payload = { type: "text", data: { body: "❌ প্রোডাক্ট পাওয়া যায়নি।" } };
      }
    }

    // Send to WhatsApp
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to: from, [payload.type]: payload.data },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.log("Send error:", err.response?.data || err.message);
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server running 🚀"));
