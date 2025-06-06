const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'profile',
  description: 'Fetch a themed Facebook profile using UID.',
  author: 'developer',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      return sendMessage(
        senderId,
        {
          text: '𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗨𝗜𝗗 𝘁𝗼 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝘁𝗵𝗲𝗺𝗲𝗱 𝗽𝗿𝗼𝗳𝗶𝗹𝗲.',
        },
        pageAccessToken
      );
    }

    const uid = args[0];

    await sendMessage(
      senderId,
      { text: '⏳ 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗶𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...' },
      pageAccessToken
    );

    try {
      const imageUrl = `https://betadash-api-swordslush-production.up.railway.app/profile?uid=${encodeURIComponent(uid)}`;

      await sendMessage(
        senderId,
        {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
            },
          },
        },
        pageAccessToken
      );
    } catch (error) {
      console.error('Profile command error:', error);
      await sendMessage(
        senderId,
        {
          text: '❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗶𝗺𝗮𝗴𝗲. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.',
        },
        pageAccessToken
      );
    }
  },
};