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
  name: "animalfact",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["xfact"],
  description: "Fetch a random animal fact!",
  usage: "animalfact",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  try {
    // Optional loading message
    await api.sendMessage(formatFont("🦴 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗮𝗻 𝗮𝗻𝗶𝗺𝗮𝗹 𝗳𝗮𝗰𝘁..."), threadID, messageID);

    const res = await axios.get("https://api.zetsu.xyz/random/animal_fact", {
      headers: {
        Accept: "application/json",
        "x-api-key": "6fbd0a144a296d257b30a752d4a178a5"
      }
    });

    const fact = res.data?.result?.fact;
    if (!fact) throw new Error("No fact found.");

    return api.sendMessage(
      formatFont(`📚 𝗔𝗻𝗶𝗺𝗮𝗹 𝗙𝗮𝗰𝘁\n━━━━━━━━━━━━━━\n${fact}\n━━━━━━━━━━━━━━`),
      threadID,
      messageID
    );
  } catch (err) {
    console.error("AnimalFact error:", err.message);
    return api.sendMessage(
      formatFont(`❌ 𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝗴𝗲𝘁 𝗮 𝗳𝗮𝗰𝘁.\n${err.message}`),
      threadID,
      messageID
    );
  }
};