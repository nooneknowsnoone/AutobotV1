const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jimp = require("jimp");
const { createCanvas, loadImage, registerFont } = require('canvas');
const fse = require('fs-extra');

module.exports.config = {
  name: "leave",
  version: "1.0.0",
  eventType: ["log:unsubscribe"],
  credits: "Mirai Team & Mod by Yan Maglinte",
  description: "Sends a leave notification with image"
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  if (event.logMessageType !== "log:unsubscribe") return;

  const leftId = event.logMessageData.leftParticipantFbId;
  const authorId = event.author;

  let name = global.data.userName.get(leftId) || await Users.getNameUser(leftId);
  const type = (authorId === leftId) ? "left by itself" : "was kicked by admin";

  // Fonts and backgrounds
  const fontUrl = 'https://drive.google.com/u/0/uc?id=1ZwFqYB-x6S9MjPfYm3t3SP1joohGl4iw&export=download';
  const backgrounds = [
    "https://i.imgur.com/MnAwD8U.jpg",
    "https://i.imgur.com/tSkuyIu.jpg"
  ];
  const avatarUrl = `https://graph.facebook.com/${leftId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  // Create cache folder if not exists
  const cacheDir = path.join(__dirname, 'cache/leave');
  fse.ensureDirSync(cacheDir);

  try {
    // Download and register font
    const fontData = (await axios.get(fontUrl, { responseType: 'arraybuffer' })).data;
    const fontPath = path.join(cacheDir, 'font.ttf');
    fs.writeFileSync(fontPath, fontData);
    registerFont(fontPath, { family: 'CustomFont' });

    // Load background and avatar
    const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const background = await loadImage(bgUrl);

    const avatarImg = (await axios.get(avatarUrl, { responseType: 'arraybuffer' })).data;
    const avatarPath = path.join(cacheDir, 'avatar.png');
    fs.writeFileSync(avatarPath, avatarImg);

    const avatar = await jimp.read(avatarPath);
    avatar.circle();
    const roundedAvatarBuffer = await avatar.getBufferAsync('image/png');
    const roundAvatar = await loadImage(roundedAvatarBuffer);

    // Create canvas
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    const shortName = name.length > 10 ? name.slice(0, 10) + "..." : name;

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(roundAvatar, canvas.width / 2 - 500, canvas.height / 2 - 200, 420, 420);
    ctx.font = '100px CustomFont';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(shortName, canvas.width / 2 - 60, canvas.height / 2 + 90);
    ctx.font = '40px CustomFont';
    ctx.fillText(type, canvas.width / 2 - 50, canvas.height / 2 + 140);

    const outputPath = path.join(cacheDir, 'leave_output.png');
    fs.writeFileSync(outputPath, canvas.toBuffer());

    api.sendMessage({
      body: `💥 ${name} ${type} from the group.`,
      attachment: fs.createReadStream(outputPath)
    }, event.threadID, () => {
      fs.unlinkSync(outputPath);
      fs.unlinkSync(avatarPath);
    });

  } catch (err) {
    console.error("Leave event error:", err);
    api.sendMessage(`❌ Error generating leave image for ${name}`, event.threadID);
  }
};