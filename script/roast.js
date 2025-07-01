const axios = require("axios");

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
  name: "roast",
  version: "1.0.1",
  role: 0,
  hasPrefix: false,
  aliases: ["araykooo", "burn"],
  description: "Get roasted by an AI.",
  usage: "roast <your text>",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const prompt = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!prompt) {
    return api.sendMessage(
      formatFont("⚡ Please provide a prompt to roast.\n\nExample: roast I'm ugly"),
      threadID,
      null,
      messageID
    );
  }

  try {
    api.sendMessage(formatFont("🔥 Cooking up your roast..."), threadID, async (err, info) => {
      if (err) return;

      const encodedPrompt = encodeURIComponent(prompt);
      const { data } = await axios.get(`https://jonell01-ccprojectsapihshs.hf.space/api/roasted-ai?prompt=${encodedPrompt}`);
      const roasted = data;

      if (!roasted) {
        return api.editMessage(formatFont("⚠️ Failed to get roast. Try again later."), info.messageID);
      }

      api.getUserInfo(senderID, (err, infoUser) => {
        const userName = infoUser?.[senderID]?.name || "Unknown User";
        const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', {
          hour12: false,
        });

        const responseMessage = `
🔥 𝗬𝗢𝗨𝗥 𝗥𝗢𝗔𝗦𝗧
━━━━━━━━━━━━━━━━━━
${roasted}
━━━━━━━━━━━━━━━━━━
🗣 𝗥𝗲𝗾𝘂𝗲𝘀𝘁𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

        api.editMessage(formatFont(responseMessage), info.messageID);
      });
    });
  } catch (error) {
    console.error("Roast command error:", error);
    api.sendMessage(formatFont("⚠️ Error: Can't connect to the roast API."), threadID);
  }
};