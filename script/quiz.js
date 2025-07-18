const axios = require("axios");

const quizCache = new Map();

module.exports.config = {
  name: "quiz",
  version: "1.0.2",
  role: 0,
  credits: "Ry",
  description: "Send a quiz and answer by replying with A/B/C/D",
  commandCategory: "Games",
  usages: "quiz",
  cooldowns: 3,
  hasPrefix: true
};

module.exports.run = async function ({ api, event }) {
  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/quiz?limit=1&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5");
    const q = res.data.questions[0];

    const quizMessage = `🧠 𝗤𝘂𝗶𝘇 𝗧𝗶𝗺𝗲!
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
✅ Reply with A, B, C, or D to answer.`;

    const sent = await api.sendMessage(quizMessage, event.threadID, event.messageID);

    quizCache.set(sent.messageID, {
      correct: q.correct_answer.toUpperCase(),
      user: event.senderID
    });
  } catch (err) {
    console.error("Quiz error:", err);
    return api.sendMessage("❌ Failed to fetch quiz. Please try again later.", event.threadID);
  }
};

module.exports.handleReply = async function ({ api, event }) {
  const reply = event.body.trim().toUpperCase();
  const validChoices = ["A", "B", "C", "D"];

  if (!validChoices.includes(reply)) return;

  // Search cache for active quiz for this thread
  for (const [msgID, data] of quizCache.entries()) {
    if (event.messageReply?.messageID === msgID && event.senderID === data.user) {
      const isCorrect = reply === data.correct;
      quizCache.delete(msgID);

      return api.sendMessage(
        isCorrect
          ? "✅ Correct! Well done 👏."
          : `❌ Incorrect. The correct answer was: ${data.correct} 😝`,
        event.threadID,
        event.messageID
      );
    }
  }
};