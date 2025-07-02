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
  name: "ai2",
  version: "1.0.0",
  credits: "Ry",
  description: "Ask anything to Gemini AI (alt)",
  usage: "ai2 <question>",
  cooldown: 3,
  role: 0,
  hasPrefix: false,
  aliases: [],
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const threadID = event.threadID;
  const senderID = event.senderID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage(formatFont("❗ Please provide a question."), threadID, messageID);
  }

  api.sendMessage(formatFont("🤖 𝗔𝗜𝟮 𝗜𝗦 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚..."), threadID, async (err, info) => {
    if (err) return;

    try {
      let imageUrl = "";
      if (event.messageReply?.attachments?.[0]?.type === "photo") {
        imageUrl = event.messageReply.attachments[0].url;
      }

      const { data } = await axios.get("https://apis-rho-nine.vercel.app/gemini", {
        params: {
          ask: prompt,
          imagurl: imageUrl
        }
      });

      const reply = data.description?.trim() || "❌ No response received from Gemini.";

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString("en-US", { hour12: false });

        const finalReply = `
🤖 𝗔𝗜 𝟮 — 𝗚𝗘𝗠𝗜𝗡𝗜
━━━━━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(finalReply), info.messageID);
      });

    } catch (err) {
      console.error("AI2 Error:", err);
      const errMsg = "❌ Error: " + (err.response?.data?.message || err.message || "Something went wrong.");
      api.editMessage(formatFont(errMsg), info.messageID);
    }
  });
};