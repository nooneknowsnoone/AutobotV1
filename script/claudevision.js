const axios = require('axios');

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    formattedText += fontEnabled && fontMapping[char] ? fontMapping[char] : char;
  }
  return formattedText;
}

module.exports.config = {
  name: 'claudevision',
  version: '1.0.3',
  role: 0,
  hasPrefix: false,
  aliases: ['cv', 'claude'],
  description: "Analyze prompt (optionally with image) using Claude 4 Pro Vision",
  usage: "claudevision [prompt] or reply to an image",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const promptText = args.join(" ").trim();
  const replyText = event.messageReply?.body || '';
  const finalPrompt = `${replyText} ${promptText}`.trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!finalPrompt) {
    return api.sendMessage(formatFont("❌ Please provide a prompt or reply to an image with caption."), threadID, messageID);
  }

  api.sendMessage(formatFont('📸 𝗖𝗹𝗮𝘂𝗱𝗲 𝗩𝗶𝘀𝗶𝗼𝗻 𝗶𝘀 𝗮𝗻𝗮𝗹𝘆𝘇𝗶𝗻𝗴...'), threadID, async (err, info) => {
    if (err) return;

    try {
      let imageUrl = "";
      if (event.messageReply?.attachments?.[0]?.type === 'photo') {
        imageUrl = event.messageReply.attachments[0].url;
      }

      const { data } = await axios.get("https://renzweb.onrender.com/api/claude-4-pro", {
        params: {
          prompt: finalPrompt,
          uid: senderID,
          ...(imageUrl && { imgs: imageUrl })
        },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0'
        }
      });

      const responseText = data.response?.trim() || "❌ No response received from Claude.";
      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

      const replyMessage = `
🤖 𝗖𝗟𝗔𝗨𝗗𝗘 𝗩𝗜𝗦𝗜𝗢𝗡
━━━━━━━━━━━━━━━━━━
${responseText}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${senderID}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

      api.editMessage(formatFont(replyMessage), info.messageID);
    } catch (error) {
      console.error("ClaudeVision Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};