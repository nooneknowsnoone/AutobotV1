const axios = require("axios");

module.exports.config = {
  name: "tempmail",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Generate or check temporary emails using XVI TempMail API.",
  usage: "tempmail gen or tempmail inbox <email>",
  credits: "Ry",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const subcommand = args[0];

  if (!subcommand || (subcommand !== "gen" && subcommand !== "inbox")) {
    return api.sendMessage(
      "❗ Usage:\n• tempmail gen — Generate a temporary email\n• tempmail inbox <email> — Check inbox for given email",
      threadID,
      messageID
    );
  }

  if (subcommand === "gen") {
    try {
      const { data } = await axios.get("https://xvi-rest-api.vercel.app/api/tempmail-create");

      if (!data || !data.email) {
        return api.sendMessage(
          "❌ Failed to generate temporary email.",
          threadID,
          messageID
        );
      }

      return api.sendMessage(
        `✅ TempMail Generated:\n📧 Email: ${data.email}\n\n📥 Check Inbox:\ntempmail inbox ${data.email}`,
        threadID,
        messageID
      );
    } catch (err) {
      console.error("tempmail gen error:", err.message);
      return api.sendMessage(
        "❌ Could not connect to the TempMail API.",
        threadID,
        messageID
      );
    }
  }

  if (subcommand === "inbox") {
    const email = args[1];

    if (!email) {
      return api.sendMessage(
        "❗ Please provide the email address.\nExample: tempmail inbox your@email.com",
        threadID,
        messageID
      );
    }

    try {
      const encodedEmail = encodeURIComponent(email);
      const { data } = await axios.get(`https://xvi-rest-api.vercel.app/api/tempmail-inbox?email=${encodedEmail}`);

      if (!data || !data.from || !data.subject || !data.chunks || !Array.isArray(data.chunks)) {
        return api.sendMessage(
          `📭 Inbox for ${email} is empty or invalid.`,
          threadID,
          messageID
        );
      }

      const fullContent = data.chunks.join("\n");

      return api.sendMessage(
        `📨 Message for ${email}:\n\n🔹 From: ${data.from}\n🔹 Subject: ${data.subject}\n🔹 Date: ${data.date}\n\n📝 Content:\n${fullContent}`,
        threadID,
        messageID
      );
    } catch (err) {
      console.error("tempmail inbox error:", err.message);
      return api.sendMessage(
        "❌ Failed to retrieve inbox content.",
        threadID,
        messageID
      );
    }
  }
};