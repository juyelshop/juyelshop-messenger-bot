const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "juyel123";

const ACCESS_TOKEN = "EAAZBDZCswgNHMBRDAqqWS2ZCkCjiXpc553peZAngIehK5V7och9PECYB4ECC4LjZCxR1EofYKJcI58ybtPcdZBHZByVZCKTR25nMtqGqGqtI28td2lektYkhRb46IZBHUPvbShgJvAWP7udUPeug6nCiviZCS223zBMnMdcV7fgcfSgkPVgZCbbMbro4c63GpNIulKdBkvJTm5hkDScye9iP1dHkLrYxoZBne1NNaq9ycgfxl7ZAhR5ocnRCraN0W7QcDrHZAq0Xyt51HamI1DUHyYDpZCuSgZDZD";

const PHONE_NUMBER_ID = "1073349015858656";

// Home
app.get("/", (req, res) => {
  res.send("Bot Running ✅");
});

// Webhook verify
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  return res.sendStatus(403);
});

// 🔍 Scraper Function (Improved)
async function getProduct(keyword) {
  try {
    const { data } = await axios.get("https://juyelshop.com/");
    const $ = cheerio.load(data);

    let result = null;

    $("img").each((i, el) => {
      const parentText = $(el).parent().text().toLowerCase();

      if (parentText.includes(keyword.toLowerCase())) {
        const name = $(el).attr("alt") || "Product";

        const priceMatch = parentText.match(/\d+\s?tk/);
        const price = priceMatch ? priceMatch[0].toUpperCase() : "Price not found";

        let image = $(el).attr("src");

        if (image && !image.startsWith("http")) {
          image = "https://juyelshop.com" + image;
        }

        result = {
          name: name,
          price: price,
          image: image || "https://via.placeholder.com/300"
        };

        return false;
      }
    });

    return result;

  } catch (err) {
    console.log("Scraper error:", err.message);
    return null;
  }
}

// 📩 Receive message
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message?.text?.body?.toLowerCase().trim();

  if (!text) return res.sendStatus(200);

  console.log("User:", text);

  try {
    let payload;

    // 👋 Greeting
    if (/^(hi|hello|হাই|হ্যালো)$/i.test(text)) {
      payload = {
        type: "text",
        data: {
          body: "👋 স্বাগতম!\nআপনি কোন প্রোডাক্ট খুঁজছেন?\n👉 bag / watch লিখুন"
        }
      };
    }

    // 🔍 Product search
    else {
      const product = await getProduct(text);

      if (product) {
        payload = {
          type: "image",
          data: {
            link: product.image,
            caption: `📦 ${product.name}\n💰 ${product.price}`
          }
        };
      } else {
        payload = {
          type: "text",
          data: {
            body: "❌ প্রোডাক্ট পাওয়া যায়নি। অন্য কিছু লিখুন।"
          }
        };
      }
    }

    // 📤 Send to WhatsApp
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        [payload.type]: payload.data
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
