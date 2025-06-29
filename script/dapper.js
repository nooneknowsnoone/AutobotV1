const axios = require('axios');

module.exports.config = {
  name: 'deepseek',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['dseek', 'seekai'],
  description: 'Ask DeepSeek V3 anything',
  usage: 'deepseek <your question>',
  credits: 'Ry',
  cooldown: 3,
  category: 'ai'
};

module.exports.run = async function({ api, event, args }) {
  const query = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage(
      '❌ 𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: deepseek what is quantum physics?',
      threadID,
      messageID
    );
  }

  api.sendMessage("🤖 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸 𝗩𝟯 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴...", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://haji-mix-api.gleeze.com/api/deepseekv3?ask=${encodeURIComponent(query)}&api_key=4c756515a406d4ffafae6d6b06dcaeb8017b3634df0c07661a508b5b6a585df4`;
      const { data } = await axios.get(url);

      if (!data || !data.answer) {
        return api.editMessage('⚠️ 𝗘𝗿𝗿𝗼𝗿: 𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗳𝗿𝗼𝗺 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸 𝗔𝗜.', info.messageID);
      }

      const cleanedResponse = data.answer.replace(/\s+/g, ' ').trim();
      const timePH = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });

      api.getUserInfo(senderID, (err, userInfo) => {
        const userName = userInfo?.[senderID]?.name || "Unknown";
        const reply = `🤖 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸 𝗩𝟯\n━━━━━━━━━━━━━━━━━━\n${cleanedResponse}\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;
        api.editMessage(reply, info.messageID);
      });

    } catch (error) {
      console.error('DeepSeek API error:', error.message);
      api.editMessage('❌ 𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗿𝗲𝗮𝗰𝗵 𝗗𝗲𝗲𝗽𝗦𝗲𝗲𝗸 𝗔𝗣𝗜.', info.messageID);
    }
  });
};