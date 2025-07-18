const axios = require('axios');

module.exports.config = {
  name: 'githubrepo',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['ghrepo', 'gitrepo'],
  description: 'Search GitHub repositories by keyword or username',
  usage: 'githubrepo <query>',
  credits: 'developer',
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(" ").trim();

  if (!query) {
    return api.sendMessage(
      '❌ Missing query.\n\n✅ Usage: githubrepo <query>\nExample: githubrepo Autobot181818',
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://rapido.zetsu.xyz/api/github/repo?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.results || data.results.length === 0) {
      return api.sendMessage(`❌ No GitHub repositories found for "${query}".`, threadID, messageID);
    }

    const repos = data.results
      .map((repo, i) => {
        return `🔹 ${i + 1}. ${repo.name}\n📦 URL: ${repo.url}\n⭐ Stars: ${repo.stars} | 🍴 Forks: ${repo.forks}\n📝 ${repo.description || "No description"}\n`;
      })
      .join('\n');

    const resultMessage = `🔍 GitHub Repository Search\n\n🔎 Query: ${query}\n\n${repos}`;

    return api.sendMessage(resultMessage, threadID, messageID);
  } catch (error) {
    console.error('GitHubRepo Error:', error.message);
    return api.sendMessage(
      '❌ Error: Failed to fetch data from GitHub API.',
      threadID,
      messageID
    );
  }
};