const axios = require('axios');

module.exports.config = {
  name: 'tempmail',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Generate a temporary email and check inbox.',
  usage: 'tempmail gen | tempmail inbox <email>',
  credits: 'Ry',
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const input = args.join(" ").trim().split("|").map(s => s.trim());
  const subcommand = input[0]?.toLowerCase();

  if (!subcommand || (subcommand !== "gen" && subcommand !== "inbox")) {
    return api.sendMessage(
      `❌ Invalid subcommand.\n\n📌 Usage:\n• tempmail gen\n• tempmail inbox <email>`,
      event.threadID,
      event.messageID
    );
  }

  if (subcommand === "gen") {
    api.sendMessage("🔄 Generating tempmail address...", event.threadID, async (err, info) => {
      try {
        const res = await axios.get('https://xvi-rest-api.vercel.app/api/tempmail-create');
        const data = res.data;

        if (!data.success) {
          return api.editMessage("❌ Failed to generate tempmail.", info.messageID);
        }

        return api.editMessage(
          `✅ Email Generated:\n📧 ${data.email}\n\n📨 Check inbox tempmail inbox ${data.email} `,
          info.messageID
        );
      } catch (error) {
        console.error("tempmail gen error:", error.message);
        return api.editMessage("❌ Error: Couldn't generate tempmail.", info.messageID);
      }
    });
  }

  if (subcommand === "inbox") {
    const email = input[1];

    if (!email) {
      return api.sendMessage("❌ Please provide an email.\nUsage: tempmail inbox <email>", event.threadID, event.messageID);
    }

    api.sendMessage("🔍 Fetching inbox messages...", event.threadID, async (err, info) => {
      try {
        const encodedEmail = encodeURIComponent(email);
        const res = await axios.get(`https://xvi-rest-api.vercel.app/api/tempmail-inbox?email=${encodedEmail}`);
        const data = res.data;

        if (!data.from || !data.subject || !data.chunks) {
          return api.editMessage("📭 No new emails found or invalid response.", info.messageID);
        }

        return api.editMessage(
          `📬 New Email Found:\n\n🔹 From: ${data.from}\n🔹 Subject: ${data.subject}\n🔹 Date: ${data.date}`,
          info.messageID
        );
      } catch (error) {
        console.error("tempmail inbox error:", error.message);
        return api.editMessage("❌ Error: Failed to fetch inbox messages.", info.messageID);
      }
    });
  }
};