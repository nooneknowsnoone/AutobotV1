const axios = require("axios");

module.exports.config = {
  name: "binary",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Encodes or decodes binary text.",
  usage: "binary encode <text> | binary decode <binary>",
  credits: "developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (args.length < 2) {
    return api.sendMessage(
      "📦 Usage:\n• binary encode <text>\n• binary decode <binary>",
      threadID,
      messageID
    );
  }

  const subcommand = args[0].toLowerCase();
  const input = args.slice(1).join(" ");

  try {
    if (subcommand === "encode") {
      const res = await axios.get(`https://api.popcat.xyz/v2/encode?text=${encodeURIComponent(input)}`);
      const binary = res.data?.message?.text || "❌ Error: No result returned.";

      return api.sendMessage(
        `🔐 Encoded Binary:\n─────────────\n${binary}\n─────────────`,
        threadID,
        messageID
      );
    }

    if (subcommand === "decode") {
      const res = await axios.get(`https://api.popcat.xyz/v2/decode?binary=${encodeURIComponent(input)}`);
      const decoded = res.data?.message?.text || "❌ Error: No result returned.";

      return api.sendMessage(
        `🔓 Decoded Text:\n─────────────\n${decoded}\n─────────────`,
        threadID,
        messageID
      );
    }

    return api.sendMessage(
      "❌ Invalid subcommand. Use `encode` or `decode`.",
      threadID,
      messageID
    );
  } catch (error) {
    console.error("Binary command error:", error);
    return api.sendMessage(
      "❌ Error: Failed to process request.",
      threadID,
      messageID
    );
  }
};