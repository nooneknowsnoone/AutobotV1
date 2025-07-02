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

module.exports.config = {
  name: "bard",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Get a response from Bard AI.",
  usage: "bard <question>",
  credits: "Converted by You",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage(
      formatFont("❌ Please provide a prompt.\n💡 Example: bard What is the capital of France?"),
      threadID,
      messageID
    );
  }

  const processing = await api.sendMessage(formatFont("🤖 Bard AI is processing your request..."), threadID);

  try {
    const { data } = await axios.get(`https://ccprojectsapis.zetsu.xyz/api/bard?ask=${encodeURIComponent(query)}`);
    const reply = data?.data || "❌ No response from Bard API.";

    api.getUserInfo(senderID, async (err, infoUser) => {
      const userName = infoUser?.[senderID]?.name || "Unknown User";
      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });

      const fullMessage = `
🤖 𝗕𝗮𝗿𝗱 𝗔𝗜 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲
━━━━━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

      api.editMessage(formatFont(fullMessage), processing.messageID);
    });

  } catch (error) {
    console.error("Bard error:", error.message);
    api.editMessage(formatFont("❌ Failed to fetch from Bard API."), processing.messageID);
  }
};