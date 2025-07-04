const axios = require("axios");

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };
  return [...text].map(char => fontEnabled && fontMapping[char] ? fontMapping[char] : char).join("");
}

module.exports.config = {
  name: "mistral",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: ["mistralai", "mistralchat"],
  description: "Chat with Mistral AI model",
  usage: "mistral [your question]",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(formatFont("❌ Please provide a question. Example: mistral What is AI?"), threadID, messageID);
  }

  const processingMsg = await api.sendMessage(formatFont("🤖 Asking Mistral AI..."), threadID);

  try {
    const API_KEY = "ICcGaAdXRx6d5EM66pohAxUPN3eTIxTa"; // Replace if using your own

    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "User-Agent": "MessengerBot/1.0 (+https://facebook.com)" // 🧠 Custom user agent added here
        },
      }
    );

    const aiReply = response.data.choices?.[0]?.message?.content || "❌ No response from Mistral AI.";

    const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString("en-US", { hour12: false });
    const userInfo = await api.getUserInfo(senderID);
    const userName = userInfo?.[senderID]?.name || "User";

    const finalMsg = `
🤖 𝗠𝗜𝗦𝗧𝗥𝗔𝗟 𝗥𝗘𝗦𝗣𝗢𝗡𝗗𝗘𝗗
━━━━━━━━━━━━━━━━━━
${aiReply}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

    api.editMessage(formatFont(finalMsg), processingMsg.messageID);

  } catch (error) {
    console.error("Mistral Error:", error.message);
    const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown");
    api.editMessage(formatFont(errMsg), processingMsg.messageID);
  }
};