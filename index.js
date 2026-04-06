const express = require("express");
const app = express();

const VERIFY_TOKEN = "juyel123"; // তুমি যেকোনো নাম দিতে পারো

app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running ✅");
});

// Webhook verification
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

app.listen(3000, () => {
  console.log("Server running...");
});
