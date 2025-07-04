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
  name: "agify",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Predict age based on name using Agify API",
  usage: "agify [name]",
  credits: "Jayy"
};

module.exports.run = async function({ api, event, args }) {
  const name = args[0];
  if (!name) {
    return api.sendMessage(formatFont("❌ Please provide a name.\n\n📌 Usage: agify [name]"), event.threadID, event.messageID);
  }

  try {
    const response = await axios.get(`https://api.agify.io/?name=${encodeURIComponent(name)}`);
    const { age, count } = response.data;

    if (age === null) {
      return api.sendMessage(formatFont(`⚠️ Couldn't predict the age for "${name}". Try another name.`), event.threadID, event.messageID);
    }

    const message = formatFont(`👤 Name: ${name}\n📊 Estimated Age: ${age}\n📈 Based on: ${count.toLocaleString()} samples`);
    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error("Agify Error:", error.message);
    api.sendMessage(formatFont("🚫 Failed to fetch data. Please try again later."), event.threadID, event.messageID);
  }
};