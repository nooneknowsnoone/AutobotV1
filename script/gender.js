const axios = require('axios');

module.exports.run = async function ({ api, event, args }) {
  const name = args.join(' ').trim();

  if (!name) {
    return api.sendMessage(
      '⚠️ 𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗻𝗮𝗺𝗲 𝘁𝗼 𝗽𝗿𝗲𝗱𝗶𝗰𝘁 𝗴𝗲𝗻𝗱𝗲𝗿.\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝗴𝗲𝗻𝗱𝗲𝗿𝗶𝘇𝗲 𝗝𝗮𝗻𝗻𝗮𝗵',
      event.threadID,
      event.messageID
    );
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/genderize?name=${encodeURIComponent(name)}&apikey=8062a9eb-2a2e-458b-a1f0-4cd25de8b000`;

  try {
    const response = await axios.get(apiUrl);
    const { gender, probability } = response.data;

    if (!gender) {
      return api.sendMessage(
        '⚠️ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗽𝗿𝗲𝗱𝗶𝗰𝘁 𝗴𝗲𝗻𝗱𝗲𝗿. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.',
        event.threadID,
        event.messageID
      );
    }

    const genderEmoji = gender === 'male' ? '👨' : '👩';
    const probabilityMessage = `─────────────\nThe name "${name}" is predicted to be ${genderEmoji} ${gender} with a probability of ${Math.round(probability * 100)}%\n─────────────`;

    return api.sendMessage(probabilityMessage, event.threadID, event.messageID);

  } catch (error) {
    console.error('Error predicting gender:', error.message);
    return api.sendMessage(
      '⚠️ 𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗽𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗻𝗴 𝗴𝗲𝗻𝗱𝗲𝗿.',
      event.threadID,
      event.messageID
    );
  }
};

module.exports.config = {
  name: 'genderize',
  version: '1.0.0',
  hasPermission: 0,
  credits: 'dev',
  description: 'Predict gender based on name using AI.',
  usage: 'genderize [name]',
  cooldown: 3
};