const axios = require('axios');

module.exports.config = {
  name: 'chipp',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Ask a question to Chipp AI.',
  usage: 'chipp <question>',
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
      '❌ 𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: chipp who is Jose Rizal',
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://kaiz-apis.gleeze.com/api/chipp-ai?ask=${encodeURIComponent(query)}&uid=${senderID}&imageUrl=&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.response) {
      return api.sendMessage('⚠️ 𝗘𝗿𝗿𝗼𝗿: 𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗳𝗿𝗼𝗺 𝗖𝗵𝗶𝗽𝗽 𝗔𝗜.', threadID, messageID);
    }

    const response = `🤖 𝗖𝗵𝗶𝗽𝗽 𝗔𝗜:\n─────────────\n${data.response}\n─────────────`;
    const maxLength = 2000;

    if (response.length > maxLength) {
      const chunks = splitMessageIntoChunks(response, maxLength);
      for (const chunk of chunks) {
        await api.sendMessage(chunk, threadID);
      }
    } else {
      await api.sendMessage(response, threadID);
    }

  } catch (error) {
    console.error('Chipp command error:', error.message);
    await api.sendMessage('❌ 𝗘𝗿𝗿𝗼𝗿: 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗿𝗲𝗮𝗰𝗵 𝗖𝗵𝗶𝗽𝗽 𝗔𝗜 𝗔𝗣𝗜.', threadID);
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
