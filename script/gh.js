const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "githubinfo",
    version: "1.0.0",
    role: 0,
    credits: "developer",
    description: "Fetch GitHub profile info using username",
    hasPrefix: true,
    aliases: ["gh", "gitinfo"],
    usage: "[githubinfo <username>]",
    cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    const username = args[0];
    if (!username) {
        return api.sendMessage("Usage: githubinfo <username>\nExample: githubinfo torvalds", threadID, messageID);
    }

    try {
        api.sendMessage("Fetching GitHub profile info, please wait...", threadID);

        const response = await axios.get(`https://api.popcat.xyz/v2/github/${username}`);
        const data = response.data;

        if (data.error || !data.message) {
            throw new Error('GitHub profile not found');
        }

        const info = data.message;

        const profileText =
            `GitHub Profile: ${info.name || username}\n\n` +
            `• Username: ${username}\n` +
            `• Type: ${info.account_type}\n` +
            `• Bio: ${info.bio || "N/A"}\n` +
            `• Followers: ${info.followers}\n` +
            `• Following: ${info.following}\n` +
            `• Public Repos: ${info.public_repos}\n` +
            `• Public Gists: ${info.public_gists}\n` +
            `• Location: ${info.location || "N/A"}\n` +
            `• Twitter: ${info.twitter || "N/A"}\n` +
            `• Created At: ${info.created_at}\n` +
            `• Updated At: ${info.updated_at}\n\n` +
            `Profile URL: ${info.url}`;

        await api.sendMessage(profileText, threadID);

        const avatarUrl = info.avatar;
        const imagePath = path.join(__dirname, `github_${Date.now()}.jpg`);

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
            api.sendMessage("Error saving GitHub avatar image.", threadID);
        });

    } catch (error) {
        console.error("GitHubInfo Command Error:", error.message);
        api.sendMessage("Failed to fetch GitHub profile info.", threadID);
    }
};