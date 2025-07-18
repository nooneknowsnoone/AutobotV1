const axios = require("axios");

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Get a random quiz question",
  commandCategory: "Games",
  usages: "",
  cooldowns: 3,
  hasPrefix: true
};

module.exports.run = async function({ api, event }) {
  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/quiz?limit=1&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5");
    const q = res.data.questions[0];

    const questionText = `🧠 𝗤𝘂𝗶𝘇 𝗧𝗶𝗺𝗲!
━━━━━━━━━━━━━━
📌 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${q.question}
🎯 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${q.category}
📈 𝗗𝗶𝗳𝗳𝗶𝗰𝘂𝗹𝘁𝘆: ${q.difficulty}
━━━━━━━━━━━━━━
A. ${q.choices.A}
B. ${q.choices.B}
C. ${q.choices.C}
D. ${q.choices.D}
━━━━━━━━━━━━━━
🔁 Reply with A, B, C, or D to answer.`;

    const sent = await api.sendMessage(questionText, event.threadID, event.messageID);

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "quiz",
      author: event.senderID,
      correct: q.correct_answer.toUpperCase()
    });
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch quiz question. Try again later.", event.threadID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const userAnswer = event.body.trim().toUpperCase();
  const validChoices = ["A", "B", "C", "D"];

  if (!validChoices.includes(userAnswer)) return;

  if (event.senderID !== handleReply.author) return;

  const isCorrect = userAnswer === handleReply.correct;
  const response = isCorrect
    ? `✅ Correct! Well done.`
    : `❌ Incorrect. The correct answer was: ${handleReply.correct}`;

  return api.sendMessage(response, event.threadID, event.messageID);
};