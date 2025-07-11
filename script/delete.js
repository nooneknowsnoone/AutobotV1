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
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

module.exports.config = {
  name: "delete",
  version: "1.0.0",
  role: 2,
  credits: "developer",
  description: "delete file",
  aliases: ["del"],
  usages: "{p}delete {filename}",
  hasPrefix: true,
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const admin = '61556437971771';
  if (!admin.includes(event.senderID))
    return api.sendMessage(formatFont("This Command is only for AUTOBOT owner."), event.threadID, event.messageID);

  const fs = require('fs');
  const path = require('path');
  const fileName = args[0];

  if (!fileName) {
    api.sendMessage(formatFont("Please provide a file name to delete."), event.threadID);
    return;
  }

  const filePath = path.join(__dirname, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      api.sendMessage(formatFont(`❎ | Failed to delete ${fileName}.`), event.threadID);
      return;
    }
    api.sendMessage(formatFont(`✅ ( ${fileName} ) Deleted successfully!`), event.threadID);
  });
};