const axios = require("axios");

module.exports.config = {
  name: "confucius",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Ask Confucius for wisdom",
  hasPrefix: false,
  aliases: ["kongzi", "confu"],
  usage: "confucius [your question]",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const question = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!question) {
    return api.sendMessage("❌ Please enter a question for Confucius.", threadID, messageID);
  }

  api.sendMessage("📜 𝗖𝗼𝗻𝗳𝘂𝗰𝗶𝘂𝘀 𝗶𝘀 𝗿𝗲𝗳𝗹𝗲𝗰𝘁𝗶𝗻𝗴...", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://markdevs-last-api-p2y6.onrender.com/genuines-ai?name=Confucius&question=${encodeURIComponent(question)}`;
      const { data } = await axios.get(url);

      const wisdom = data.result || "⚠️ No wisdom was returned.";
      const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply =
          `📜 𝗔𝘀𝗸𝗶𝗻𝗴 𝗖𝗼𝗻𝗳𝘂𝗰𝗶𝘂𝘀\n━━━━━━━━━━━━━━━━━━\n${wisdom}\n━━━━━━━━━━━━━━━━━━\n👤 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n🕒 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("Confucius API Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};