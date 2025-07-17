const axios = require("axios");

module.exports.config = {
  name: "catgpt",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Talk with your genius cat assistant",
  hasPrefix: false,
  aliases: ["meowgpt", "catbot"],
  usage: "catgpt [your question]",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage("❌ Please enter something to ask CatGPT.", threadID, messageID);
  }

  api.sendMessage("🐾 𝗖𝗮𝘁𝗚𝗣𝗧 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴...", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://markdevs-last-api-p2y6.onrender.com/catgpt?query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(url);

      const replyText = data.respond || "😿 No response from CatGPT.";
      const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply =
          `🐱 𝗖𝗮𝘁𝗚𝗣𝗧 𝗦𝗮𝘆𝘀\n━━━━━━━━━━━━━━━━━━\n${replyText}\n━━━━━━━━━━━━━━━━━━\n👤 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n🕒 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("CatGPT API Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};