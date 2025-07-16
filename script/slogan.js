const axios = require("axios");

module.exports.config = {
  name: "slogan",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["tagline", "makeslogan"],
  description: "Generate a catchy slogan using PinoyGPT",
  usage: "slogan [product or brand name]",
  credits: "Ru",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const input = args.join(" ").trim();

  if (!input) {
    return api.sendMessage("❌ Please provide a product or brand name.\nExample: slogan ChatGPT", threadID, messageID);
  }

  const processing = await api.sendMessage("🧠 Generating slogan...", threadID);

  try {
    const response = await axios.post(
      "https://www.pinoygpt.com/api/generate_slogan.php",
      new URLSearchParams({ prompt: input }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // Attempt to parse response dynamically
    const result = response?.data;
    let slogan;

    if (typeof result === "string") {
      slogan = result;
    } else if (typeof result === "object" && result?.slogan) {
      slogan = result.slogan;
    } else {
      slogan = JSON.stringify(result, null, 2); // fallback
    }

    const message = `✨ 𝗦𝗟𝗢𝗚𝗔𝗡 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n${slogan}\n━━━━━━━━━━━━━━━━━━\n📝 Prompt: ${input}`;
    return api.editMessage(message, processing.messageID);
  } catch (err) {
    console.error("Slogan Error:", err);
    const errorMessage = `❌ Failed to generate slogan.\nError: ${err.response?.data?.message || err.message}`;
    return api.editMessage(errorMessage, processing.messageID);
  }
};