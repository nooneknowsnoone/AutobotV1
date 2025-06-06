module.exports.config = {
    name: "autopost",
    version: "1.0.0",
};

let isPosting = false;

module.exports.handleEvent = async function ({ api }) {
    const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    const downloadImage = async (url) => {
        const axios = require('axios');
        const fs = require("fs");
        const path = require("path");
        const imagePath = path.join(__dirname, 'dog.jpg');

        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream'
        });

        return new Promise((resolve, reject) => {
            const stream = response.data.pipe(fs.createWriteStream(imagePath));
            stream.on('finish', () => resolve(imagePath));
            stream.on('error', (err) => reject(err));
        });
    };

    const postImage = async () => {
        if (isPosting) return;
        isPosting = true;

        try {
            const axios = require('axios');
            const fs = require("fs");

            let imageUrl;
            let attempts = 0;

            do {
                const response = await axios.get("https://rapido.zetsu.xyz/api/dog");
                imageUrl = response.data.image;
                attempts++;
            } while (!validImageExtensions.some(ext => imageUrl.endsWith(ext)) && attempts < 5);

            if (!validImageExtensions.some(ext => imageUrl.endsWith(ext))) {
                throw new Error('No valid image found after several attempts.');
            }

            const imagePath = await downloadImage(imageUrl);

            await api.createPost({
                attachment: fs.createReadStream(imagePath),
                visibility: "Everyone"
            });

            fs.unlinkSync(imagePath);
        } catch (error) {
            console.error('Error posting image:', error);
        } finally {
            isPosting = false;
        }
    };

    // Schedule every 5 hours
    setInterval(() => {
        postImage();
    }, 5 * 60 * 60 * 1000); // 5 hours
};