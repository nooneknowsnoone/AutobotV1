const axios = require('axios');

module.exports.config = {
  name: 'githubuser',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['ghuser', 'gituser'],
  description: 'Search for a GitHub user profile',
  usage: 'githubuser <username>',
  credits: 'developer',
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(" ").trim();

  if (!query) {
    return api.sendMessage(
      '❌ Missing username.\n\n✅ Usage: githubuser <username>\nExample: githubuser aizintel',
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://rapido.zetsu.xyz/api/github/user?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.results || data.results.length === 0) {
      return api.sendMessage(`❌ No GitHub user found for "${query}".`, threadID, messageID);
    }

    const user = data.results[0];

    const message = `👤 GitHub User Profile

🔹 Username: ${user.username}
🧩 Type: ${user.type}
🔗 Profile: ${user.profile}`;

    const imageStream = (await axios.get(user.avatar, { responseType: 'stream' })).data;

    return api.sendMessage({
      body: message,
      attachment: imageStream
    }, threadID, messageID);
    
  } catch (error) {
    console.error('GitHubUser Error:', error.message);
    return api.sendMessage(
      '❌ Error: Failed to fetch GitHub user info.',
      threadID,
      messageID
    );
  }
};