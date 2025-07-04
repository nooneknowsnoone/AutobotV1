const axios = require("axios");
const fs = require("fs");

const conversationFile = "convo.json";
const apiUrl = "https://www.pinoygpt.com/api/chat_response.php";

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

if (!fs.existsSync(conversationFile)) {
  fs.writeFileSync(conversationFile, JSON.stringify({}), "utf-8");
}

function loadConversation(uid) {
  const data = JSON.parse(fs.readFileSync(conversationFile, "utf-8"));
  return data[uid] || [];
}

function saveConversation(uid, messages) {
  const data = JSON.parse(fs.readFileSync(conversationFile, "utf-8"));
  data[uid] = messages;
  fs.writeFileSync(conversationFile, JSON.stringify(data, null, 2), "utf-8");
}

function clearConversation(uid) {
  const data = JSON.parse(fs.readFileSync(conversationFile, "utf-8"));
  delete data[uid];
  fs.writeFileSync(conversationFile, JSON.stringify(data, null, 2), "utf-8");
}

module.exports.config = {
  name: "ai3",
  version: "1.1.0",
  role: 0,
  hasPrefix: false,
  aliases: ["pinoyai", "pgpt"],
  description: "Conversational AI",
  usage: "ai3 [prompt] | ai3 clear",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;
  const prompt = args.join(" ").trim();

  if (!prompt) {
    return api.sendMessage(formatFont("❌ Please provide a prompt. Example: ai3 hi"), threadID, messageID);
  }

  if (prompt.toLowerCase() === "clear") {
    clearConversation(senderID);
    return api.sendMessage(formatFont("🧹 Conversation history cleared."), threadID, messageID);
  }

  const typingMessage = await api.sendMessage(formatFont("🤖 Processing your request..."), threadID);

  try {
    let conversation = loadConversation(senderID);
    conversation.push({ role: "user", content: prompt });

    const rawPrompt = conversation.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    const res = await axios.post(
      apiUrl,
      new URLSearchParams({ message: rawPrompt }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (res.status === 200 && res.data?.response) {
      const botReply = res.data.response;
      conversation.push({ role: "-", content: botReply });
      saveConversation(senderID, conversation);

      const timePH = new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleString('en-US', { hour12: false });
      const userInfo = await api.getUserInfo(senderID);
      const userName = userInfo?.[senderID]?.name || "Unknown User";

      const finalMessage = `
🤖 𝗔𝗜 𝟯 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘
━━━━━━━━━━━━━━━━━━
${botReply}
━━━━━━━━━━━━━━━━━━
🗣 𝗔𝘀𝗸𝗲𝗱 𝗕𝘆: ${userName}
⏰ 𝗧𝗶𝗺𝗲: ${timePH}`.trim();

      api.editMessage(formatFont(finalMessage), typingMessage.messageID);
    } else {
      throw new Error(res.data || "No response from server.");
    }
  } catch (error) {
    console.error("AI3 Error:", error);
    const errText = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown");
    api.editMessage(formatFont(errText), typingMessage.messageID);
  }
};