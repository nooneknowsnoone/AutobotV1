const axios = require("axios");
const cron = require("node-cron");

let isPosting = false;

module.exports.config = {
  name: "autopost",
  version: "1.0.0",
  credits: "Ryy",
};

module.exports.handleEvent = function () {
  // Prevents double-scheduling
};

// Auto-post every hour
cron.schedule("0 * * * *", async () => {
  if (isPosting) return;
  isPosting = true;

  try {
    const { data } = await axios.get("https://api.popcat.xyz/v2/fact");
    const randomFact = data?.message?.fact;

    if (!randomFact) throw new Error("No fact found in response.");

    const message = `🔔 | Random Fact: ${randomFact}`;

    const api = global.api || require("somewhere").api; // Inject or adjust as needed

    await api.createPost({ body: message }).then((url) => {
      console.log(`✅ Auto-post successful!\n🔗 ${url || "No URL returned."}`);
    }).catch((error) => {
      const fallbackUrl = error?.data?.story_create?.story?.url;
      if (fallbackUrl) {
        console.log(`✅ Auto-post succeeded with warning:\n🔗 ${fallbackUrl}`);
      } else {
        let errorMsg = "❌ Unknown error occurred during autopost.";
        if (error?.errors?.length) errorMsg = error.errors.map(e => e.message).join("\n");
        else if (error.message) errorMsg = error.message;
        console.error(errorMsg);
      }
    });

  } catch (err) {
    console.error("❌ Failed to auto-post:", err.message || err);
  } finally {
    isPosting = false;
  }
});