const axios = require("axios");

module.exports.config = {
  name: "pp",
  version: "1.0.0",
  role: 2,
  hasPrefix: true,
  aliases: ["guard"],
  description: "Enable or disable Facebook profile guard",
  usage: "profileguard [on/off]",
  credits: "@NethWs3Dev converted by ChatGPT",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const uid = api.getCurrentUserID();

  const input = args[0]?.toLowerCase();
  const guard = input === "on" ? true : input === "off" ? false : null;

  if (guard === null) {
    return api.sendMessage(
      "❌ Please specify either `on` or `off`.\n\nUsage: profileguard on/off",
      threadID,
      messageID
    );
  }

  await api.sendMessage(
    `🔐 Turning profile guard ${guard ? "ON" : "OFF"}...`,
    threadID,
    messageID
  );

  const form = {
    av: uid,
    variables: JSON.stringify({
      input: {
        is_shielded: guard,
        actor_id: uid,
        client_mutation_id: "1"
      },
      scale: 1
    }),
    doc_id: "1477043292367183",
    fb_api_req_friendly_name: "IsShieldedSetMutation",
    fb_api_caller_class: "IsShieldedSetMutation"
  };

  try {
    const res = await axios.post("https://www.facebook.com/api/graphql", new URLSearchParams(form), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      withCredentials: true
    });

    const json = res.data;

    if (json.errors) {
      throw new Error(json.errors[0]?.message || "Unknown error occurred.");
    }

    return api.sendMessage(
      `✅ Profile guard has been turned ${guard ? "ON" : "OFF"} successfully.`,
      threadID,
      messageID
    );
  } catch (error) {
    console.error("Profile Guard Error:", error.message);
    return api.sendMessage(
      `❌ Failed to update profile guard.\nError: ${error.message}`,
      threadID,
      messageID
    );
  }
};