const axios = require("axios");

// Dito mo ito ilalagay
const quizCache = new Map(); // Stores ongoing quiz per user

module.exports.config = {
  name: "quiz",
  version: "1.0.1",
  role: 0,
  credits: "Kaizenji x Jayy",
  description: "Answer a quiz directly with quiz A/B/C/D",
  commandCategory: "Games",
  usages: "[A/B/C/D] or no args to get question",
  cooldowns: 3,
  hasPrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const userId = event.senderID;
  const answer = args[0]?.toUpperCase();

  if (["A", "B", "C", "D"].includes(answer)) {
    const lastQuiz = quizCache.get(userId);

    if (!lastQuiz) {
      return api.sendMessage("❌ You haven't received a quiz yet. Type `quiz` to get a question.", event.threadID);
    }

    const isCorrect = answer === lastQuiz.correct;
    quizCache.delete(userId);

    return api.sendMessage(
      isCorrect
        ? `✅ Correct! Well done.`
        : `❌ Incorrect. The correct answer was: ${lastQuiz.correct}`,
      event.threadID
    );
  }

  // Fetch quiz
  try {
    const res = await axios.get("https://kaiz-apis.gleeze.com/api/quiz?limit=1&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5");
    const q = res.data.questions[0];

    const message = `🧠 𝗤𝘂𝗶𝘇 𝗧𝗶𝗺𝗲!
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
✅ Answer by typing: quiz A / quiz B / quiz C / quiz D`;

    quizCache.set(userId, { correct: q.correct_answer.toUpperCase() });

    return api.sendMessage(message, event.threadID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to fetch quiz. Try again later.", event.threadID);
  }
};