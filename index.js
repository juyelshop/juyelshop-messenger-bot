const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔹 CONFIG
const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAAZBDZCswgNHMBRPZAPMWKKFEZAd50zZCLgDHMhyne6cnvrlco7vYxobVtXZA7xeje2cbFqYXybF01RoJIEHsZBmFiXX2m2GOujZAPGmAN8zZBtByZBbY2dxv8zJay19sYf2YW0fLI6zbNU5r2OxvI3F1B6yciNDMxwXImb4O3zTrwt77Gb8nTJv0PnVKPGkc8fZB0igL8C9OYuJdiJtOH0H7kxZAJvTwyp9PcI8";
const PHONE_NUMBER_ID = "1073349015858656";

// 🔹 CATEGORY LINK (তুমি চাইলে বাড়াতে পারো)
const categories = [
  { keywords: ["t-shirt","shirt"], link: "https://juyelshop.com/category/t-shirts" },
  { keywords: ["bag"], link: "https://juyelshop.com/category/bags" },
  { keywords: ["watch"], link: "https://juyelshop.com/category/watches" }
];

// 🔹 AUTO REPLY FUNCTION
function autoReply(text) {
  text = text.toLowerCase();

  // Price
  if (
    text.includes("price") ||
    text.includes("দাম") ||
    text.includes("কত টাকা") ||
    text.includes("কত দাম")
  ) {
    return "💰 প্রোডাক্টের দাম ও বিস্তারিত জানতে আমাদের ওয়েবসাইট ভিজিট করুন:\nhttps://juyelshop.com/";
  }

  // Delivery
  if (text.includes("delivery") || text.includes("ডেলিভারি")) {
    return "🚚 ডেলিভারি চার্জ:\nঢাকা সিটির ভিতরে: ৬০ টাকা\nঢাকার বাইরে: ১২০ টাকা\n\nআমরা সারা বাংলাদেশে হোম ডেলিভারি দিয়ে থাকি।";
  }

  // Order
  if (
    text.includes("order") ||
    text.includes("অর্ডার") ||
    text.includes("buy") ||
    text.includes("কিনতে চাই")
  ) {
    return "🛒 অর্ডার করতে আমাদের ওয়েবসাইটে যান:\nhttps://juyelshop.com/";
  }

  // Location
  if (
    text.includes("location") ||
    text.includes("ঠিকানা") ||
    text.includes("কোথায়")
  ) {
    return "📍 আমরা একটি অনলাইন ভিত্তিক শপ।\nবিস্তারিত জানতে ভিজিট করুন:\nhttps://juyelshop.com/";
  }

  // Contact
  if (
    text.includes("contact") ||
    text.includes("নাম্বার") ||
    text.includes("phone")
  ) {
    return "📞 যোগাযোগের জন্য আমাদের ওয়েবসাইট ভিজিট করুন:\nhttps://juyelshop.com/";
  }

  // Greeting
  if (/^(hi|hello|হাই|হ্যালো)$/.test(text)) {
    return "👋 স্বাগতম! আপনি কোন প্রোডাক্ট খুঁজছেন?";
  }

  // Default
  return "🙏 ধন্যবাদ স্যার,\nকিছুক্ষণ অপেক্ষা করুন, আমাদের একজন প্রতিনিধি আপনার সাথে দ্রুত যোগাযোগ করবে।";
}

// 🔹 FIND CATEGORY
function findCategory(text) {
  return categories.find(cat =>
    cat.keywords.some(k => text.toLowerCase().includes(k))
  );
}

// 🔹 HOME
app.get("/", (req, res) => {
  res.send("Bot Running ✅");
});

// 🔹 VERIFY WEBHOOK
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

// 🔹 MAIN BOT
app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message.text?.body?.trim();

  if (!text) return res.sendStatus(200);

  console.log("User:", text);

  let reply = "";

  const category = findCategory(text);

  if (category) {
    reply = `🔗 এই ক্যাটাগরি দেখুন:\n${category.link}`;
  } else {
    reply = autoReply(text);
  }

  // 🔹 SEND MESSAGE
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
  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }

  res.sendStatus(200);
});

// 🔹 START SERVER
app.listen(3000, () => {
  console.log("Server running 🚀");
});
