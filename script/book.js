const axios = require("axios");

module.exports.config = {
  name: "book",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Search for books by title and get their links and ratings.",
  usage: "book <title>",
  credits: "Ry",
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(" ").trim();
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!query) {
    return api.sendMessage(
      "❌ Please enter a book title or keyword.\n\nExample: book love",
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://mademoiselle-rrest-apis-rr28.onrender.com/api/books?search=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.data || data.data.length === 0) {
      return api.sendMessage("❌ No books found for your query.", threadID, messageID);
    }

    let message = `📚 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝗿: "${query}"\n━━━━━━━━━━━━━━━━━━\n`;

    data.data.forEach((book, index) => {
      message += `#${index + 1}\n📖 Title: ${book.title}\n⭐ Rating: ${book.rating}\n🔗 Link: ${book.link}\n\n`;
    });

    return api.sendMessage(message.trim(), threadID, messageID);

  } catch (error) {
    console.error("Error fetching books:", error.message);
    return api.sendMessage(
      "❌ An error occurred while fetching book data. Please try again later.",
      threadID,
      messageID
    );
  }
};