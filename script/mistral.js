const axios = require('axios');

module.exports.config = {
  name: 'mistral',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['mstrl'],
  description: "Ask Mistral AI anything",
  usage: "mistral [your question]",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage("❌ Please enter a question or prompt.", threadID, messageID);
  }

  api.sendMessage("🤖 𝗠𝗜𝗦𝗧𝗥𝗔𝗟 𝗔𝗜 𝗜𝗦 𝗧𝗛𝗜𝗡𝗞𝗜𝗡𝗚...", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://x-free-apis-4-all.onrender.com/api/mistral?prompt=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(url);

      const responseText = data.response || "⚠️ No response from Mistral AI.";
      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US');

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply = `🤖 𝗠𝗜𝗦𝗧𝗥𝗔𝗟 𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n${responseText}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("Mistral AI Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};