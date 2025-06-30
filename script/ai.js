const axios = require('axios');

module.exports.config = {
  name: 'ai',
  version: '1.1.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt', 'gimage'],
  description: "Analyze text or recognize image content using GPT-4.1",
  usage: "ai [question] or reply to an image",
  credits: 'Updated by you | Original by Ryy',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const promptText = args.join(" ").trim();
  const userReply = event.messageReply?.body || '';
  const finalPrompt = `${userReply} ${promptText}`.trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!finalPrompt && !event.messageReply?.attachments?.[0]?.url) {
    return api.sendMessage("❌ Please provide a prompt or reply to an image.", threadID, messageID);
  }

  api.sendMessage('🤖 𝗔𝗜 𝗜𝗦 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚 𝗬𝗢𝗨𝗥 𝗥𝗘𝗤𝗨𝗘𝗦𝗧...', threadID, async (err, info) => {
    if (err) return;

    try {
      let imageUrl = "";
      if (event.messageReply?.attachments?.[0]?.type === 'photo') {
        imageUrl = event.messageReply.attachments[0].url;
      }

      const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/gpt-4.1", {
        params: {
          ask: finalPrompt,
          uid: senderID,
          imageUrl,
          apikey: "8062a9eb-2a2e-458b-a1f0-4cd25de8b000"
        }
      });

      const responseText = data.response || "❌ No response received from AI.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false }); // GMT+8
        const replyMessage = `🤖 𝗔𝗜 𝗔𝗦𝗦𝗜𝗦𝗧𝗔𝗡𝗧\n━━━━━━━━━━━━━━━━━━\n${responseText}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;

        api.editMessage(replyMessage, info.messageID);
      });

    } catch (error) {
      console.error("AI Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};