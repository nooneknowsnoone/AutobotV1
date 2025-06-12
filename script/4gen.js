const axios = require("axios");

module.exports.config = {
  name: "4gen",
  version: "1.0.0",
  credits: "developer",
  description: "Generates an AI image using the 4gen model from a given prompt and ratio.",
  hasPrefix: true,
  cooldown: 5,
  aliases: [],
  usage: "4gen <prompt> - <ratio>\nAvailable Ratios: 1:1, 3:4, 4:3, 9:16, 16:9",
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage(
      "✦ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲 𝘁𝗵𝗲 𝗳𝗼𝗿𝗺𝗮𝘁:\n4gen <prompt> - <ratio>\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 4gen cat riding a bike - 3:4",
      threadID,
      messageID
    );
  }

  const input = args.join(" ").split(" - ");
  const prompt = input[0]?.trim();
  const ratio = input[1]?.trim() || "1:1";

  const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  if (!prompt) {
    return api.sendMessage("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗽𝗿𝗼𝗺𝗽𝘁.", threadID, messageID);
  }

  if (!validRatios.includes(ratio)) {
    return api.sendMessage(
      `❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗿𝗮𝘁𝗶𝗼.\n𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲: ${validRatios.join(", ")}`,
      threadID,
      messageID
    );
  }

  const imageUrl = `https://kaiz-apis.gleeze.com/api/4gen?prompt=${encodeURIComponent(
    prompt
  )}&ratio=${encodeURIComponent(ratio)}&stream=true&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    return api.sendMessage(
      {
        body: "🖼️ 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗶𝗺𝗮𝗴𝗲:",
        attachment: await axios.get(imageUrl, { responseType: "stream" }).then(res => res.data),
      },
      threadID,
      messageID
    );
  } catch (error) {
    console.error("4gen error:", error.message);
    return api.sendMessage("❌ 𝗘𝗿𝗿𝗼𝗿 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗶𝗺𝗮𝗴𝗲. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.", threadID, messageID);
  }
};