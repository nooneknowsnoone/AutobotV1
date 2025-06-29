const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: 'catboxmoe',
  version: '1.0.0',
  role: 0,
  aliases: ['moehost', 'catmoeuploader'],
  description: 'Upload an image to Catbox via CatMoe API and get the hosted link.',
  usage: '<reply to an image>',
  credits: 'Converted by you | API by Jonell01',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const imageUrl = messageReply?.attachments?.[0]?.url;

  if (!imageUrl) {
    return api.sendMessage(
      '❌ Please reply to an image to upload it to Catbox via CatMoe!',
      threadID,
      messageID
    );
  }

  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/catmoe?url=${encodeURIComponent(imageUrl)}`;

  api.sendMessage(
    '📤 Uploading the image to Catbox.moe, please wait...',
    threadID,
    async (err, info) => {
      if (err) return;

      try {
        const res = await axios.get(apiUrl);
        const { fileUrl } = res.data;

        if (fileUrl) {
          api.sendMessage(
            `✅ Image uploaded successfully!\n\n🌐 URL: ${fileUrl}`,
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
        console.error('CatboxMoe Upload Error:', err.message);
        api.editMessage(
          '❌ An error occurred while uploading the image.',
          info.messageID
        );
      }
    }
  );
};