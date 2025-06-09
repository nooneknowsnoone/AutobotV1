const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'quiz',
  version: '2.1',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Play a quiz game using Kaizenji API',
  usage: 'quiz | quiz top',
  credits: 'Kaizenji + Kshitiz',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args, usersData }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  if (args.length === 1 && args[0] === 'top') {
    const topUsers = await getTopUsers(usersData, api);
    if (topUsers.length === 0)
      return api.sendMessage('No users found.', threadID, messageID);

    const leaderboard = topUsers.map((u, i) => `${i + 1}. ${u.username}: ${u.money} coins`).join('\n');
    return api.sendMessage(`🏆 Top 5 players:\n${leaderboard}`, threadID, messageID);
  }

  try {
    const res = await axios.get('https://kaiz-apis.gleeze.com/api/quiz?limit=1&apikey=0c1e7e33-d809-48a6-9e92-d6691a722633');
    const quiz = res.data.questions[0];

    const options = Object.entries(quiz.choices)
      .map(([key, val]) => `${key}. ${val}`).join('\n');

    const questionText =
      `📚 Question: ${quiz.question}\n` +
      `📂 Category: ${quiz.category}\n` +
      `🎯 Difficulty: ${quiz.difficulty}\n\n` +
      `${options}\n\n` +
      `👉 Reply with A, B, C, or D`;

    return api.sendMessage(questionText, threadID, async (err, info) => {
      if (err) return;

      global.GoatBot.onReply.set(info.messageID, {
        commandName: module.exports.config.name,
        messageID: info.messageID,
        correctAnswerLetter: quiz.correct_answer,
        senderID
      });

      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 20000);
    }, messageID);
  } catch (err) {
    console.error("❌ Quiz API error:", err);
    return api.sendMessage('❌ Failed to fetch quiz. Try again later.', threadID, messageID);
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const senderID = event.senderID;

  const userAnswer = event.body.trim().toUpperCase();
  const correct = Reply.correctAnswerLetter.toUpperCase();

  if (!["A", "B", "C", "D"].includes(userAnswer)) return;

  if (senderID !== Reply.senderID) return;

  if (userAnswer === correct) {
    await api.sendMessage("🎉 Correct! Great job!", threadID, messageID);
  } else {
    await api.sendMessage(`❌ Incorrect. The correct answer was ${correct}.`, threadID, messageID);
  }

  try {
    await api.unsendMessage(messageID);
    await api.unsendMessage(Reply.messageID);
  } catch (e) {
    console.error("❌ Error unsending message:", e);
  }
};

// Still includes leaderboard logic in case it's used later
async function getTopUsers(usersData, api) {
  const allUserData = await getAllUserData(usersData);
  const userIDs = Object.keys(allUserData);
  const topUsers = [];

  for (const userID of userIDs) {
    try {
      const userInfo = await new Promise(resolve =>
        api.getUserInfo(userID, (err, info) => resolve(info))
      );
      const name = userInfo?.[userID]?.name || "Unknown";
      topUsers.push({ username: name, money: allUserData[userID].money });
    } catch (e) {
      console.error("❌ Error retrieving user info:", e);
    }
  }

  return topUsers.sort((a, b) => b.money - a.money).slice(0, 5);
}

async function getAllUserData(usersData) {
  try {
    const data = {};
    const all = await usersData.all();
    all.forEach(user => {
      data[user.userID] = user.value;
    });
    return data;
  } catch (e) {
    console.error("❌ Error loading all users:", e);
    return {};
  }
}