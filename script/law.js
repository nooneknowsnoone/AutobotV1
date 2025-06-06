const axios = require('axios');

module.exports.run = async function ({ api, event, args }) {
  const number = parseInt(args[0]);

  if (!number || isNaN(number) || number < 1 || number > 48) {
    return api.sendMessage(
      '⚠️ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗉𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝗏𝖺𝗅𝗂𝖽 𝗅𝖺𝗐 𝗇𝗎𝗆𝖻𝖾𝗋 𝖻𝖾𝗍𝗐𝖾𝖾𝗇 1 𝖺𝗇𝖽 48.\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝗹𝗮𝘄 1',
      event.threadID,
      event.messageID
    );
  }

  const apiUrl = `https://haji-mix.up.railway.app/api/law?number=${number}&apikey=aafe0d9d17114eb257c6b98a02a6047cf0f7e4f5cd956515f2d3f295e8fb8b56`;

  try {
    const response = await axios.get(apiUrl);
    const { code, title, law } = response.data;

    if (!title || !law) {
      return api.sendMessage(
        '⚠️ 𝖤𝗋𝗋𝗈𝗋: 𝖭𝗈 𝗅𝖺𝗐 𝖿𝗈𝗎𝗇𝖽 𝗈𝗋 𝗂𝗇𝗏𝖺𝗅𝗂𝖽 𝖠𝖯𝖨 𝗋𝖾𝗌𝗉𝗈𝗇𝗌𝖾.',
        event.threadID,
        event.messageID
      );
    }

    const message = `📜 𝗟𝗮𝘄 #${code}: ${title}\n\n🖋️ “${law}”`;
    return api.sendMessage(message, event.threadID, event.messageID);

  } catch (error) {
    console.error('law command error:', error.message);
    return api.sendMessage(
      '⚠️ 𝖤𝗋𝗋𝗈𝗋: 𝖥𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗋𝖾𝗍𝗋𝗂𝖾𝗏𝖾 𝗅𝖺𝗐 𝖿𝗋𝗈𝗆 𝖠𝖯𝖨.',
      event.threadID,
      event.messageID
    );
  }
};

module.exports.config = {
  name: 'law',
  version: '1.0.0',
  hasPermission: 0,
  credits: 'converted by ChatGPT',
  description: 'Get a law from the 48 Laws of Power.',
  usage: 'law [1-48]',
  cooldown: 3
};