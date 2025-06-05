module.exports.config = {
  name: "changebio",
  version: "1.7",
  author: "Arn",
  countDown: 5,
  role: 2,
  shortDescription: {
    vi: "",
    en: "Change bot bio",
  },
  longDescription: {
    vi: "",
    en: "Change the bot's bio text",
  },
  category: "owner",
  guide: {
    en: "{pn} <new bio text>",
  },
};

module.exports.run = async ({ args, message, api }) => {
  const newBio = args.join(" ").trim();

  if (!newBio) {
    return message.reply("⚠️ Please provide a new bio text.\nExample: changebio Hello, I'm your bot.");
  }

  try {
    await api.changeBio(newBio); // Await the changeBio call if it supports Promise
    message.reply(`✅ Bot bio successfully changed to:\n"${newBio}"`);
  } catch (error) {
    console.error("Failed to change bot bio:", error);
    message.reply("❌ Failed to change bot bio. Please check the logs for details.");
  }
};