const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: 'imghost',
  version: '1.0.0',
  role: 0,
  aliases: ['imgfree'],
  description: 'Upload an image using freeimagehost API and get the hosted link',
  usage: '<reply to an image>',
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const imageUrl = messageReply?.attachments?.[0]?.url;

  if (!imageUrl) {
    return api.sendMessage(
      '❌ Please reply to an image to upload it using FreeImageHost!',
      threadID,
      messageID
    );
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/freeimagehost?imageUrl=${encodeURIComponent(imageUrl)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  api.sendMessage(
    '📤 Uploading the image, please wait...',
    threadID,
    async (err, info) => {
      if (err) return;

      try {
        const res = await axios.get(apiUrl);
        const { url, size, width, height } = res.data;

        if (url) {
          api.sendMessage(
            `✅ Image uploaded successfully!\n\n🌐 URL: ${url}\n📐 Dimensions: ${width}x${height}\n📦 Size: ${size}`,
            threadID,
            messageID
          );
        } else {
          api.editMessage(
            '❌ Upload failed. Please try again later.',
            info.messageID
          );
        }
      } catch (err) {
        console.error('Image upload error:', err);
        api.editMessage(
          '❌ An error occurred while uploading the image.',
          info.messageID
        );
      }
    }
  );
};