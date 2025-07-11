const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "pinayflix",
  version: "1.1.0",
  role: 2,
  description: "Search and download PinayFlix videos by query.",
  hasPrefix: true,
  credits: "Ry",
  cooldowns: 10,
  category: "media",
  usage: "pinayflix <search> | <page>"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args.length) {
    return api.sendMessage("❌ Usage: pinayflix <search query> | <page number>", threadID, messageID);
  }

  const [query, page = 1] = args.join(" ").split("|").map(x => x.trim());
  if (!query) return api.sendMessage("❌ Please enter a search keyword.", threadID, messageID);

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const apiUrl = `http://sgp1.hmvhostings.com:25743/pinay?search=${encodeURIComponent(query)}&page=${page}`;
    const { data } = await axios.get(apiUrl);

    if (!data || data.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ No results for "${query}" on page ${page}`, threadID, messageID);
    }

    const tempDir = path.join(__dirname, "..", "temp", "pinayflix");
    await fs.ensureDir(tempDir);

    const videos = data.slice(0, 3); // limit to 3 videos
    for (const [index, video] of videos.entries()) {
      const videoPath = path.join(tempDir, `video_${index}_${Date.now()}.mp4`);

      try {
        const response = await axios.get(video.video, { responseType: "stream" });
        const writer = fs.createWriteStream(videoPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        await api.sendMessage(
          `🎞️ Result ${index + 1} (Page ${page})\n📌 Title: ${video.title}\n🔗 Link: ${video.link}\n🖼 Preview: ${video.img}`,
          threadID
        );

        await api.sendMessage({
          body: `📹 Video ${index + 1} of ${videos.length}`,
          attachment: fs.createReadStream(videoPath),
        }, threadID);

      } catch (error) {
        console.error(`⚠️ Video ${index} error:`, error);
        await api.sendMessage(`⚠️ Failed to send video ${index + 1}`, threadID);
      } finally {
        if (await fs.pathExists(videoPath)) {
          await fs.unlink(videoPath);
        }
      }
    }

    api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage(
      `✅ Found ${data.length} results for "${query}"\n📄 Page: ${page}\n💡 Tip: Use "pinayflix ${query} | ${+page + 1}" to go to next page.`,
      threadID
    );

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    console.error("❌ PinayFlix Error:", err);
    return api.sendMessage("❌ Failed to process your request.", threadID, messageID);
  }
};