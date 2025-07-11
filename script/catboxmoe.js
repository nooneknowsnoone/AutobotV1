const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: 'catboxmoe',
  version: '1.0.0',
  role: 0,
  aliases: ['catbox', 'moehost'],
  description: 'Upload an image to Catbox.moe with expiration.',
  usage: '<reply to an image> [expiration: 1h|12h|24h|72h]',
  hasPrefix: true,
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const imageUrl = messageReply?.attachments?.[0]?.url;

  if (!imageUrl) {
    return api.sendMessage(
      '❌ Please reply to an image to upload it to Catbox.moe!',
      threadID,
      messageID
    );
  }

  let expiration = '72h'; // default
  if (args[0] && ['1h', '12h', '24h', '72h'].includes(args[0])) {
    expiration = args[0];
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/catboxmoe?imageurl=${encodeURIComponent(imageUrl)}&expiration=${expiration}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  api.sendMessage(
    `📤 Uploading image to Catbox.moe (expires in ${expiration})...`,
    threadID,
    async (err, info) => {
      if (err) return;

      try {
        const res = await axios.get(apiUrl);
        const { url, expiration } = res.data;

        if (url) {
          api.sendMessage(
            `✅ Image uploaded successfully!\n\n🌐 URL: ${url}\n🕒 Expiration: ${expiration}`,
            threadID,
            messageID
          );
        } else {
          api.editMessage(
            '❌ Upload failed. No URL returned.',
            info.messageID
          );
        }
      } catch (err) {
        console.error('CatboxMoe API Error:', err.message);
        api.editMessage(
          '❌ An error occurred during upload. Try again later.',
          info.messageID
        );
      }
    }
  );
};