const express = require("express");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

// --- Google Sheets setup (service account) ---
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json", // this is the Secret File name on Render
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || "Sheet1";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_secret_token";

// Root test
app.get("/", (req, res) => res.send("✅ Render app running"));

// Webhook verification (Meta calls this once)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Webhook receiver (we'll wire Meta fetch in Phase B)
app.post("/webhook", async (req, res) => {
  // Always ACK immediately
  res.sendStatus(200);

  try {
    // For now, write a dummy test row so you can confirm Sheets works
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["(test) Name", "(test) Email", "(test) Phone", "", "", "", new Date().toISOString()]],
      },
    });
    console.log("✅ Wrote a test row to Google Sheet");
  } catch (e) {
    console.error("❌ Error appending to Google Sheet:", e?.response?.data || e.message);
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port", process.env.PORT || 3000)
);
