const axios = require("axios");

module.exports.config = {
  name: "slogan",
  version: "1.0.0",
  role: 0,
  credits: "Jayy Cierco",
  description: "Generate a marketing slogan using PinoyGPT API",
  usage: "slogan [keyword]",
  hasPrefix: false,
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const keyword = args.join(" ").trim();
  const { threadID, messageID, senderID } = event;

  if (!keyword) {
    return api.sendMessage("❌ Please provide a keyword or brand name.\n\nExample:\nslogan coffee", threadID, messageID);
  }

  const loadingMsg = await api.sendMessage("🔄 Generating slogan...", threadID);

  try {
    const response = await axios.post(
      "https://www.pinoygpt.com/api/generate_slogan.php",
      new URLSearchParams({ keyword }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const data = response.data;

    if (data.success && data.message) {
      const slogan = data.message;
      const timePH = new Date(Date.now() + 8 * 3600 * 1000).toLocaleString("en-US", { hour12: false });
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo?.[senderID]?.name || "Unknown";

      return api.editMessage(
        `🎯 𝗦𝗟𝗢𝗚𝗔𝗡 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗\n━━━━━━━━━━━━━━\n${slogan}\n━━━━━━━━━━━━━━\n📌 𝗞𝗲𝘆𝘄𝗼𝗿𝗱: ${keyword}\n👤 𝗕𝘆: ${name}\n🕰 𝗧𝗶𝗺𝗲: ${timePH}`,
        loadingMsg.messageID
      );
    } else {
      throw new Error(data.message || "Failed to generate slogan.");
    }
  } catch (err) {
    console.error("Slogan error:", err);
    return api.editMessage("❌ Error: " + (err.message || "Unknown"), loadingMsg.messageID);
  }
};