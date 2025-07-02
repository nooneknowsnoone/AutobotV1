const axios = require("axios");

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return [...text].map(c => (fontEnabled && fontMapping[c] ? fontMapping[c] : c)).join('');
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports.config = {
  name: "bossing",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Interact with Bossing AI for text-based responses",
  usage: "bossing <ask>",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(formatFont("𝗨𝘆 𝘀𝗶 𝗸𝘂𝗽𝗮𝗹 𝗽𝗮𝗹𝗮 𝘁𝗼 𝗲𝗵 🤣"), threadID, messageID);
  }

  const waitMsg = await api.sendMessage(formatFont("🤖 𝗕𝗼𝘀𝘀𝗶𝗻𝗴 𝗔𝗜 𝗶𝘀 𝘁𝗵𝗶𝗻𝗸𝗶𝗻𝗴..."), threadID);

  try {
    const { data } = await axios.get("https://markdevs-last-api-p2y6.onrender.com/bossing", {
      params: {
        prompt,
        uid: "1"
      }
    });

    const reply = data?.response || "❌ No response from Bossing AI.";
    const chunks = splitMessageIntoChunks(reply, 2000);

    api.getUserInfo(senderID, async (err, infoUser) => {
      const userName = infoUser?.[senderID]?.name || "Unknown User";
      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

      chunks[0] = `
🤖 𝗕𝗼𝘀𝘀𝗶𝗻𝗴 𝗔𝗜
━━━━━━━━━━━━━━━━━━
${chunks[0]}`.trim();

      chunks[chunks.length - 1] += `\n━━━━━━━━━━━━━━━━━━\n🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}\n⏰ 𝗧𝗶𝗺𝗲: ${timePH}`;

      await api.editMessage(formatFont(chunks[0]), waitMsg.messageID);
      for (let i = 1; i < chunks.length; i++) {
        await api.sendMessage(formatFont(chunks[i]), threadID);
      }
    });

  } catch (error) {
    console.error("Bossing AI Error:", error);
    api.editMessage(formatFont("❌ Failed to fetch Bossing AI response."), waitMsg.messageID);
  }
};