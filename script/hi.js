const axios = require("axios");

module.exports.config = {
  name: "hi",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["hello", "yo", "yow", "bot", "hey"],
  description: "greetings.",
  usage: "hi",
  credits: "Chatbot system",
  cooldown: 2,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  return api.sendMessage(
    "𝖧𝖾𝗅𝗅𝗈 😊 𝖧𝗈𝗐 𝖼𝖺𝗇 𝗂 𝖺𝗌𝗌𝗂𝗌𝗍 𝗒𝗈𝗎 𝗍𝗈𝖽𝖺𝗒?\n\n𝖪𝗂𝗇𝖽𝗅𝗒 𝗌𝗂𝗆𝗉𝗅𝗂𝖿𝗒 𝗍𝗒𝗉𝖾 “𝗁𝖾𝗅𝗉” 𝗍𝗈 𝗌𝖾𝖾 𝗆𝗒 𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌.\n\n𝖨𝖿 𝗒𝗈𝗎 𝗇𝖾𝖾𝖽 24/7 𝗌𝖾𝗋𝗏𝗂𝖼𝖾𝗌 𝖿𝗈𝗅𝗅𝗈𝗐 𝗈𝗎𝗋 𝗆𝖺𝗂𝗇 𝗉𝖺𝗀𝖾𝖻𝗈𝗍:, follow our main pagebot:\n\n🔗: fb.com/hersheyassistant",
    threadID,
    messageID
  );
};