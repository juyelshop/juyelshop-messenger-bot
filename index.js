const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAAZBDZCswgNHMBRDAqqWS2ZCkCjiXpc553peZAngIehK5V7och9PECYB4ECC4LjZCxR1EofYKJcI58ybtPcdZBHZByVZCKTR25nMtqGqGqtI28td2lektYkhRb46IZBHUPvbShgJvAWP7udUPeug6nCiviZCS223zBMnMdcV7fgcfSgkPVgZCbbMbro4c63GpNIulKdBkvJTm5hkDScye9iP1dHkLrYxoZBne1NNaq9ycgfxl7ZAhR5ocnRCraN0W7QcDrHZAq0Xyt51HamI1DUHyYDpZCuSgZDZD";
const PHONE_NUMBER_ID = "1073349015858656";

// 🔹 Manual category mapping
const categories = [
  { keywords: ["t-shirt","tee"], link: "https://juyelshop.com/category/t-shirts" },
  { keywords: ["bag"], link: "https://juyelshop.com/category/bags" },
  { keywords: ["watch"], link: "https://juyelshop.com/category/watches" }
];

// Home
app.get("/", (req, res) => res.send("Bot Running ✅"));

// Webhook verify
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  return res.sendStatus(403);
});

// Find category by user input
function findCategory(text) {
  return categories.find(cat =>
    cat.keywords.some(k => text.toLowerCase().includes(k))
  );
}

// Webhook receive
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
        data: { body: "👋 স্বাগতম! আপনি কোন প্রোডাক্ট বা ক্যাটাগরি খুঁজছেন?" }
      };
    } 
    // Check category
    else {
      const category = findCategory(text);
      if (category) {
        payload = {
          type: "text",
          data: { body: `🔗 এখানে আপনার প্রোডাক্ট ক্যাটাগরি: ${category.link}` }
        };
      } else {
        payload = {
          type: "text",
          data: { body: "❌ প্রোডাক্ট বা ক্যাটাগরি পাওয়া যায়নি। দয়া করে অন্য keyword লিখুন।" }
        };
      }
    }

    // Send message
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
