const axios = require("axios");
const he = require("he");
const crypto = require("crypto");

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃",
    k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍",
    u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩",
    K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳",
    U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  return [...text].map(c => fontEnabled && fontMapping[c] ? fontMapping[c] : c).join('');
}

// Cache to hold quiz data for validation
const quizCache = new Map();

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["trivia"],
  description: "Ask a random trivia question.",
  usage: "quiz",
  credits: "Converted by AjiroDesu",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  try {
    const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const questionData = res.data.results[0];

    const question = he.decode(questionData.question);
    const correctAnswer = he.decode(questionData.correct_answer);
    const incorrectAnswers = questionData.incorrect_answers.map(he.decode);

    const allAnswers = shuffle([...incorrectAnswers, correctAnswer]);
    const correctIndex = allAnswers.indexOf(correctAnswer);
    const quizId = crypto.randomBytes(4).toString('hex');

    quizCache.set(`${threadID}:${senderID}`, {
      quizId,
      correctIndex,
      answers: allAnswers,
    });

    const formattedQuestion = formatFont(`🧠 Trivia Time!\n\n${question}\n\n${allAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n📩 Reply with the number of your answer.`);

    return api.sendMessage(formattedQuestion, threadID, (_, info) => {
      quizCache.get(`${threadID}:${senderID}`).messageID = info.messageID;
    });

  } catch (err) {
    console.error("Quiz error:", err);
    return api.sendMessage(formatFont("❌ Failed to fetch a quiz question."), threadID, messageID);
  }
};

// Listen for replies
module.exports.handleReply = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  const key = `${threadID}:${senderID}`;
  const data = quizCache.get(key);

  if (!data) return;

  const choice = parseInt(body.trim());
  if (isNaN(choice) || choice < 1 || choice > data.answers.length) {
    return api.sendMessage(formatFont("⚠️ Invalid answer. Reply with the number of your answer."), threadID, messageID);
  }

  const isCorrect = (choice - 1) === data.correctIndex;
  const responseText = isCorrect
    ? formatFont("✅ Correct! Well done!")
    : formatFont(`❌ Wrong! The correct answer was: ${data.answers[data.correctIndex]}`);

  await api.sendMessage(responseText, threadID);
  quizCache.delete(key);
};

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}