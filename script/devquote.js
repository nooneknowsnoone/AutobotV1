const axios = require("axios");

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
  name: "devquote",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get a random developer quote",
  usage: "devquote",
  credits: "Ry",
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  await api.sendMessage(formatFont("⌛ Fetching a dev quote..."), threadID, messageID);

  try {
    const response = await axios.get("https://xvi-rest-api.vercel.app/api/devquote");
    const quote = response.data?.quote;

    if (!quote) {
      return api.sendMessage(
        formatFont("😔 Couldn't fetch a developer quote."),
        threadID,
        messageID
      );
    }

    return api.sendMessage(
      formatFont(`💻 Dev Quote\n\n"${quote}"`),
      threadID,
      messageID
    );
  } catch (error) {
    console.error("devquote command error:", error.message);
    return api.sendMessage(
      formatFont(`❌ Error: ${error.message}`),
      threadID,
      messageID
    );
  }
};