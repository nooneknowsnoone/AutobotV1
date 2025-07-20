const axios = require("axios");

// Store user's current quiz
const quizCache = new Map();

module.exports.config = {
  name: "trivia",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  description: "Trivia quiz game using actual answer text",
  commandCategory: "Games",
  usages: "[answer] or just 'trivia' to get question",
  cooldowns: 3,
  hasPrefix: true
};

module.exports.run = async function ({ api, event, args }) {
  const userId = event.senderID;
  const userAnswer = args.join(" ").trim();

  // If user is submitting an answer
  if (userAnswer.length > 0) {
    const current = quizCache.get(userId);

    if (!current) {
      return api.sendMessage("❌ You haven't received a trivia question yet. Type `trivia` to get one.", event.threadID);
    }

    const isCorrect = userAnswer.toLowerCase() === current.correct.toLowerCase();
    quizCache.delete(userId);

    return api.sendMessage(
      isCorrect
        ? "✅ Correct!, well done 🎉"
        : `❌ Incorrect. The correct answer was: ${current.correct} 🫵😹`,
      event.threadID
    );
  }

  // Otherwise, fetch new trivia question
  try {
    const res = await axios.get("https://wildan-suldyir-apis.vercel.app/api/trivia?limit=1");
    const trivia = res.data.trivia[0];

    const message = `🧠 𝗧𝗿𝗶𝘃𝗶𝗮 𝗧𝗶𝗺𝗲!
━━━━━━━━━━━━━━
📌 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${trivia.question}
🎯 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${trivia.category}
📈 𝗗𝗶𝗳𝗳𝗶𝗰𝘂𝗹𝘁𝘆: ${trivia.difficulty}
━━━━━━━━━━━━━━
${trivia.options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}
━━━━━━━━━━━━━━
✅ Answer by typing: trivia [your answer text]
Example: trivia Red Crow`;

    quizCache.set(userId, {
      correct: trivia.answer
    });

    return api.sendMessage(message, event.threadID);
  } catch (err) {
    console.error("Trivia error:", err);
    return api.sendMessage("❌ Failed to load trivia question. Please try again later.", event.threadID);
  }
};