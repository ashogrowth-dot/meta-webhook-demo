const express = require("express");
const app = express();

app.use(express.json());

// Root test
app.get("/", (req, res) => {
  res.send("🚀 Hello from Render Webhook App!");
});

// Meta webhook verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "my_secret_token"; // you can change this
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Meta webhook event listener
app.post("/webhook", (req, res) => {
  console.log("Incoming lead event:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
