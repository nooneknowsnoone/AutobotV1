const axios = require('axios');

module.exports.config = {
  name: 'cohere',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['coh'],
  description: "Ask anything using Cohere AI.",
  usage: "cohere <question>",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage("❌ Please provide a query.\n📌 Example: `cohere covid 19`", threadID, messageID);
  }

  api.sendMessage('🧠 𝗖𝗼𝗵𝗲𝗿𝗲 𝗔𝗜 𝗶𝘀 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗿𝗲𝗾𝘂𝗲𝘀𝘁...', threadID, async (err, info) => {
    if (err) return;

    try {
      const apiUrl = `https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      const responseText = data.response || "❌ No response received from Cohere API.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false }); // GMT+8
        const replyMessage = `🧠 𝗖𝗢𝗛𝗘𝗥𝗘 𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n${responseText}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;

        api.editMessage(replyMessage, info.messageID);
      });

    } catch (error) {
      console.error('Cohere command error:', error.message);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Cannot connect to Cohere API.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};