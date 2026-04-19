// index.js
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// ============================
// Credentials (place your secrets here)
// ============================
const VERIFY_TOKEN = "juyel123";
const ACCESS_TOKEN = "EAANizvxgfaYBREFlK6GZCgSn0OTlffGujpqNYZBlYWKQrHwg1Xdb7ZCAdD9u2f0vLfrPvgcDW9DZArx4ekyhI5bl5sToAd34SIK74drRqNvZBTDLpTPQZBqJq6IQ8reBoOpKpwHKKZCY8tc8KBDPJuaGFxiggUP1ZB4mpMA2mXGxEToHr7UDRHkuolyrWLcgn3vG1sfDtMtsB5bbEUytjGaZBEcrSxZBmygyQqJze4szzLzXpe6BBxMicHXaiajwtA078ODlnNs8liP9g6BPv0KxZBx";
const PHONE_NUMBER_ID = "1073349015858656";

// // 🔹 CATEGORY LINK (তুমি চাইলে বাড়াতে পারো)
const categories = [
  { keywords: ["t-shirt","shirt"], link: "https://juyelshop.com/category/t-shirts" },
  { keywords: ["bag"], link: "https://juyelshop.com/category/bags" },
  { keywords: ["watch"], link: "https://juyelshop.com/category/watches" }
];

// 🔹 AUTO REPLY FUNCTION
function autoReply(text) {
  text = text.toLowerCase();

  // Greeting
  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("হাই") ||
    text.includes("হ্যালো")
  ) {
    return "হ্যালো 👋 JUYEL SHOP-এ আপনাকে স্বাগতম।\nআপনি কোন প্রোডাক্ট খুঁজছেন জানালে আমি আপনাকে দেখাতে পারি 😊";
  }

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
    return "🚚 ডেলিভারি চার্জ:\nঢাকা সিটির ভিতরে: ৬০ টাকা\nঢাকার শহরতলি/সাবার্ব এলাকায় চার্জ: ১০০ টাকা\nঢাকার বাইরে: ১২০ টাকা\n\n 🚚 ডেলিভারি সময়:\nঢাকা সিটির ভিতরে: ১-২ দিন\nঢাকার বাইরে: ২-৪ দিন\n\nআমরা সারা বাংলাদেশে হোম ডেলিভারি দিয়ে থাকি,🏘️+🚴+🚚";
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

  // Contact
  if (
  text.includes("contact") ||
  text.includes("কল করব") ||
  text.includes("কন্ট্রাক্ট") ||  
  text.includes("নাম্বার") ||
  text.includes("ফোন নাম্বার") ||
  text.includes("নাম্বার") ||
  text.includes("number")
) {
  return "আপনার সুবিধার জন্য আমাদের কাস্টমার সাপোর্ট নাম্বার নিচে দেওয়া হলো 👇\n\n📞 01999713777\n☎️ 09649100004\n📲 WhatsApp / Call Available\n\nধন্যবাদ JUYEL SHOP-এর সাথে থাকার জন্য 😊";
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
