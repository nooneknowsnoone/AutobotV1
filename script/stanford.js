const axios = require("axios");

module.exports.config = {
  name: "stanford",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["philosophy", "sep"],
  description: "Search Stanford Encyclopedia of Philosophy by keyword",
  usage: "stanford [keyword]",
  credits: "JohnDev19 & Ry",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const keyword = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!keyword) {
    return api.sendMessage(
      "❌ Please enter a philosophical keyword to search.\n\nExample:\n`stanford holistic thinking`",
      threadID,
      messageID
    );
  }

  const thinking = "📘 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗦𝘁𝗮𝗻𝗳𝗼𝗿𝗱 𝗘𝗻𝗰𝘆𝗰𝗹𝗼𝗽𝗲𝗱𝗶𝗮...";
  api.sendMessage(thinking, threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://hershey-api.onrender.com/api/stanford?keyword=${encodeURIComponent(keyword)}`;
      const { data } = await axios.get(url);

      const title = data.title || "Untitled";
      const articleUrl = data.url || "No link available.";
      const excerpt = data.mainContent?.substring(0, 1500) + "..." || "No content available.";

      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString("en-US");

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";

        const response = `🧠 𝗦𝗧𝗔𝗡𝗙𝗢𝗥𝗗 𝗘𝗡𝗖𝗬𝗖𝗟𝗢𝗣𝗘𝗗𝗜𝗔\n━━━━━━━━━━━━━━━━━━\n🔎 𝗞𝗲𝘆𝘄𝗼𝗿𝗱: ${keyword}\n📖 𝗧𝗶𝘁𝗹𝗲: ${title}\n🔗 𝗟𝗶𝗻𝗸: ${articleUrl}\n\n📚 𝗘𝘅𝗰𝗲𝗿𝗽𝘁:\n${excerpt}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;

        api.editMessage(response, info.messageID);
      });
    } catch (err) {
      console.error("Stanford Command Error:", err);
      const errorMsg = "❌ Error: " + (err.response?.data?.message || err.message || "Something went wrong.");
      api.editMessage(errorMsg, info.messageID);
    }
  });
};