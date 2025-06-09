const axios = require('axios');

const quizStore = new Map(); // Store quiz per thread

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  credits: "Tian",
  description: "Send a random quiz and let the user answer with A, B, C, or D.",
  usage: "quiz",
  cooldown: 3,
  role: 0,
  hasPrefix: false,
  aliases: [],
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;

  try {
    const res = await axios.get('https://kaiz-apis.gleeze.com/api/quiz?limit=1&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633');
    const data = res.data.questions[0];

    const questionText =
      `📚 Quiz Time!\n\n` +
      `❓ Question: ${data.question}\n` +
      `📂 Category: ${data.category}\n` +
      `🎯 Difficulty: ${data.difficulty}\n\n` +
      `A. ${data.choices.A}\n` +
      `B. ${data.choices.B}\n` +
      `C. ${data.choices.C}\n` +
      `D. ${data.choices.D}\n\n` +
      `👉 Reply with A, B, C, or D`;

    quizStore.set(threadID, {
      correct: data.correct_answer,
      question: data.question,
      author: data.author,
    });

    return api.sendMessage(questionText, threadID);
  } catch (err) {
    console.error("Quiz fetch error:", err.message);
    return api.sendMessage("❌ Failed to fetch quiz. Try again later.", threadID);
  }
};

module.exports.handleReply = async function ({ api, event }) {
  const threadID = event.threadID;
  const userAnswer = event.body.trim().toUpperCase();

  if (!["A", "B", "C", "D"].includes(userAnswer)) return;

  const quizData = quizStore.get(threadID);
  if (!quizData) return;

  if (userAnswer === quizData.correct) {
    api.sendMessage(`✅ Correct! 🎉 The answer is ${userAnswer}.`, threadID);
  } else {
    api.sendMessage(`❌ Incorrect. The correct answer was ${quizData.correct}.`, threadID);
  }

  quizStore.delete(threadID); // Clear after answered
};