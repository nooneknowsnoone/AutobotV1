const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "instastalk",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Fetch Instagram profile info using username",
    hasPrefix: false,
    aliases: ["igstalk", "iginfo"],
    usage: "[instastalk <username>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const username = args[0];
    if (!username) {
        return api.sendMessage("Usage: instastalk <username>\nExample: instastalk layy", threadID, messageID);
    }

    try {
        api.sendMessage("Fetching Instagram profile info, please wait...", threadID);

        const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/insta/stalk?ig=${username}`;
        const { data } = await axios.get(apiUrl);
        const profile = data[0];

        const profileText = 
            `Instagram Profile:\n\n` +
            `• Name: ${profile.full_name}\n` +
            `• Username: @${profile.username}\n` +
            `• Verified: ${profile.is_verified ? "Yes" : "No"}\n` +
            `• Private: ${profile.is_private ? "Yes" : "No"}\n` +
            `• Bio: ${profile.biography || "N/A"}\n` +
            `• Followers: ${profile.follower_count.toLocaleString()}\n` +
            `• Following: ${profile.following_count.toLocaleString()}\n` +
            `• Posts: ${profile.media_count.toLocaleString()}`;

        await api.sendMessage(profileText, threadID);

        const avatarUrl = profile.profile_pic_url_hd || profile.profile_pic_url;
        const imagePath = path.join(__dirname, `insta_${Date.now()}.jpg`);

        const imageResponse = await axios({
            url: avatarUrl,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(imagePath);
        imageResponse.data.pipe(writer);

        writer.on("finish", async () => {
            await api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, threadID);
            fs.unlinkSync(imagePath);
        });

        writer.on("error", err => {
            console.error("Write stream error:", err);
            api.sendMessage("Error saving Instagram avatar image.", threadID);
        });

    } catch (error) {
        console.error("InstaStalk Command Error:", error.message);
        api.sendMessage("Failed to fetch Instagram profile info.", threadID);
    }
};