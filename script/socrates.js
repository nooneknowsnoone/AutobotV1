const axios = require("axios");

module.exports.config = {
  name: "socrates",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Ask Socrates a philosophical question",
  hasPrefix: false,
  aliases: ["socrate"],
  usage: "socrates [your question]",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const question = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!question) {
    return api.sendMessage("❌ Please enter a question to ask Socrates.", threadID, messageID);
  }

  api.sendMessage("🤔 𝗦𝗼𝗰𝗿𝗮𝘁𝗲𝘀 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴...", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://markdevs-last-api-p2y6.onrender.com/genuines-ai?name=Socrates&question=${encodeURIComponent(question)}`;
      const { data } = await axios.get(url);

      const answer = data.result || "⚠️ No response from Socrates.";
      const timePH = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply =
          `🧠 𝗔𝘀𝗸𝗶𝗻𝗴 𝗦𝗼𝗰𝗿𝗮𝘁𝗲𝘀...\n━━━━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗯𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("Socrates API Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};