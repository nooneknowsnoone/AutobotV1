const axios = require("axios");

module.exports.config = {
  name: "fbstalk",
  version: "1.0.0",
  role: 0,
  credits: "Rized",
  description: "Stalk Facebook user information via ID and name",
  hasPrefix: true,
  aliases: ["stalk"],
  usage: "[fbstalk <id> | <name>]",
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    const input = args.join(" ").split("|");
    const id = input[0]?.trim();
    const name = input[1]?.trim();

    if (!id || !name) {
      return api.sendMessage(
        "❌ Usage: stalkfb <id> | <name>\nExample: stalkfb 10001234567890 | Juan Dela Cruz",
        event.threadID,
        event.messageID
      );
    }

    const url = `https://jonell01-ccprojectsapihshs.hf.space/api/stalkfb?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;

    api.sendMessage("🔍 Fetching Facebook info, please wait...", event.threadID, async (err, info) => {
      try {
        const res = await axios.get(url);
        const data = res.data;

        if (!data || !data.status || data.status.toLowerCase() !== "success") {
          return api.editMessage("❌ Unable to fetch data. Please check the ID and name.", info.messageID);
        }

        const result = data.result;
        const reply = `👤 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗦𝘁𝗮𝗹𝗸 𝗥𝗲𝘀𝘂𝗹𝘁\n━━━━━━━━━━━━━━━━━━\n` +
          `🆔 𝗜𝗗: ${id}\n` +
          `📛 𝗡𝗮𝗺𝗲: ${name}\n\n` +
          `📅 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: ${result.birthday || "Not available"}\n` +
          `❤️ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻𝘀𝗵𝗶𝗽: ${result.relationship || "Not available"}\n` +
          `🌍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${result.location || "Not available"}\n` +
          `🎓 𝗘𝗱𝘂𝗰𝗮𝘁𝗶𝗼𝗻: ${result.education || "Not available"}\n` +
          `🕵️ 𝗔𝗯𝗼𝘂𝘁: ${result.about || "No bio available"}\n━━━━━━━━━━━━━━━━━━\n` +
          `🔗 𝗟𝗶𝗻𝗸: https://facebook.com/${id}`;

        api.editMessage(reply, info.messageID);
      } catch (err) {
        console.error("Fetch Error:", err);
        api.editMessage("❌ Failed to fetch info. Try again later.", info.messageID);
      }
    });
  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("❌ An unexpected error occurred.", event.threadID);
  }
};