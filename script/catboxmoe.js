const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: 'catboxmoe',
  version: '1.0.0',
  role: 0,
  aliases: ['catbox', 'moehost'],
  description: 'Upload an image to Catbox.moe using Rapido API.',
  usage: '<reply to an image>',
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

  const apiUrl = `https://rapido.zetsu.xyz/api/catbox?file_link=${encodeURIComponent(imageUrl)}`;

  api.sendMessage(
    '📤 Uploading image to Catbox.moe via Rapido API...',
    threadID,
    async (err, info) => {
      if (err) return;

      try {
        const res = await axios.get(apiUrl);
        const { url } = res.data;

        if (url) {
          api.sendMessage(
            `✅ Image uploaded successfully!\n\n🌐 URL: ${url}`,
            threadID,
            messageID
          );
        } else {
          api.editMessage(
            '❌ Upload failed. No URL received.',
            info.messageID
          );
        }
      } catch (err) {
        console.error('CatboxMoe Upload Error:', err.message);
        api.editMessage(
          '❌ An error occurred while uploading the image.',
          info.messageID
        );
      }
    }
  );
};