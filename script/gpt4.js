const axios = require('axios');

module.exports.config = {
  name: 'gpt4',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['chatgpt4', 'askgpt'],
  description: "Ask GPT-4 powered AI anything",
  usage: "gpt4 [your question]",
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

  api.sendMessage("🤖 𝗚𝗣𝗧𝟰 𝗔𝗜 𝗜𝗦 𝗧𝗛𝗜𝗡𝗞𝗜𝗡𝗚...", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://xvi-rest-api.vercel.app/api/chatgpt4?prompt=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(url);

      const responseText = data.response || "⚠️ No response from GPT-4 AI.";
      const timePH = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply = `🤖 𝗚𝗣𝗧𝟰 𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n${responseText}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error("GPT-4 API Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};