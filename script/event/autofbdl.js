module.exports.config = {
  name: "autofbdl",
  eventType: ["message"],
  version: "1.0.0",
  credits: "libyzxy0",
  description: "Automatically downloads Facebook videos from messages.",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {

  const fs = require('fs');
  const axios = require('axios');
  const path = require('path');

  const regEx_facebook = /https:\/\/www\.facebook\.com\/\S+/;
  const link = event.body;

  if (regEx_facebook.test(link)) {

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    api.sendTypingIndicator(event.threadID, true);

    const url = `https://betadash-api-swordslush-production.up.railway.app/fbdl?url=${encodeURIComponent(link)}`;

    axios.head(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
      }
    }).then(headRes => {
      const fileSize = parseInt(headRes.headers['content-length'], 10);

      if (fileSize > 25 * 1024 * 1024) {
        return api.sendMessage({
          body: "⚠️ The video is larger than 25MB and cannot be sent directly.\n\nClick the button below to watch it.",
          attachment: null,
          buttons: [
            {
              type: "web_url",
              url: url,
              title: "Watch Video"
            }
          ]
        }, event.threadID, event.messageID);
      }

      api.sendMessage("Downloading Facebook video...", event.threadID, (err, info) =>

        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 10000), event.messageID
      );

      axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      }).then(async streamRes => {

        const fileName = `${Date.now()}.mp4`;
        const filePath = path.join(__dirname, fileName);
        const videoFile = fs.createWriteStream(filePath);

        streamRes.data.pipe(videoFile);

        videoFile.on('finish', () => {
          videoFile.close(() => {

            setTimeout(() => {
              api.setMessageReaction("✅", event.messageID, () => {}, true);
              api.sendMessage({
                body: `✅ Successfully downloaded Facebook video!`,
                attachment: fs.createReadStream(filePath)
              }, event.threadID, () => {
                fs.unlinkSync(filePath); // delete video after sending
              });
            }, 5000);

          });
        });

        videoFile.on('error', () => {
          api.sendMessage("❌ Error while saving the video. Please try again later.", event.threadID, event.messageID);
        });

      }).catch(err => {
        api.sendMessage(`❌ Error while fetching video stream.\n${err.message}`, event.threadID, event.messageID);
      });

    }).catch(err => {
      api.sendMessage(`❌ Failed to fetch video info.\n${err.message}`, event.threadID, event.messageID);
    });

  }
};