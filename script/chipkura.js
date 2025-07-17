const axios = require('axios');

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return [...text].map(char => fontEnabled && fontMapping[char] ? fontMapping[char] : char).join('');
}

module.exports.config = {
  name: 'chipkura',
  version: '2.1.0',
  role: 0,
  hasPrefix: true,
  aliases: ['ckura', 'chip'],
  description: "Analyze prompt or image using Chipkura API",
  usage: "chipkura [text] or reply to an image",
  credits: 'Ry',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const promptText = args.join(" ").trim();
  const userReply = event.messageReply?.body || '';
  const finalPrompt = `${userReply} ${promptText}`.trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  // Optional image URL
  const imageUrl = event.messageReply?.attachments?.[0]?.type === 'photo'
    ? event.messageReply.attachments[0].url
    : "";

  if (!finalPrompt) {
    return api.sendMessage(formatFont("❌ Please enter a prompt or reply to an image."), threadID, messageID);
  }

  api.sendMessage(formatFont('📸 𝗖𝗛𝗜𝗣𝗞𝗨𝗥𝗔 𝗜𝗦 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚...'), threadID, async (err, info) => {
    if (err) return;

    try {
      const { data } = await axios.get("https://jerome-web.gleeze.com/service/api/chipkura", {
        params: {
          message: finalPrompt,
          userid: senderID,
          imageurl: imageUrl
        }
      });

      const responseText = data?.message?.trim() || "❌ No response from Chipkura.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

        const reply = `
📸 𝗖𝗛𝗜𝗣𝗞𝗨𝗥𝗔 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦
━━━━━━━━━━━━━━━━━━
${responseText}
━━━━━━━━━━━━━━━━━━
🗣 𝗙𝗿𝗼𝗺: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(reply), info.messageID);
      });

    } catch (error) {
      console.error("Chipkura API Error:", error.message);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};