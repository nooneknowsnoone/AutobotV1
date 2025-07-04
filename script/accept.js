const moment = require("moment-timezone");

module.exports.config = {
  name: "accept",
  version: "1.0.1",
  role: 2,
  hasPrefix: true,
  credits: "Developer",
  description: "Accept friend requests on bot.",
  usages: "accept list | accept approve <UID>",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  const sendUsage = () => {
    return api.sendMessage(
      "🔹 Usage:\n" +
        "- accept list ➜ Show pending friend requests\n" +
        "- accept approve <UID> ➜ Accept a friend request by UID",
      threadID,
      messageID
    );
  };

  const handleApprove = async (targetUID) => {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
      doc_id: "3147613905362928",
      variables: JSON.stringify({
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          friend_requester_id: targetUID,
          client_mutation_id: Math.round(Math.random() * 19).toString(),
        },
        scale: 3,
        refresh_num: 0,
      }),
    };

    const success = [];
    const failed = [];

    try {
      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      if (JSON.parse(res).errors) failed.push(targetUID);
      else success.push(targetUID);
    } catch (e) {
      failed.push(targetUID);
    }

    return { success, failed };
  };

  if (args.length === 0) return sendUsage();

  const subcommand = args[0]?.toLowerCase();

  if (subcommand === "approve") {
    const uid = args[1];
    if (!uid || isNaN(uid)) {
      return api.sendMessage("❌ Invalid syntax. Use: accept approve <UID>", threadID, messageID);
    }

    const { success, failed } = await handleApprove(uid);

    if (success.length > 0) {
      api.sendMessage(`✅ Approved friend request for UID: ${success.join(", ")}`, threadID, messageID);
    }
    if (failed.length > 0) {
      api.sendMessage(`❌ Failed to approve UID: ${failed.join(", ")}`, threadID, messageID);
    }

    return;
  }

  if (subcommand === "list") {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } }),
    };

    try {
      const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;

      if (listRequest.length === 0) {
        return api.sendMessage("📭 No pending friend requests found.", threadID, messageID);
      }

      let msg = "📋 Pending Friend Requests:\n";
      listRequest.forEach((user, index) => {
        msg += `\n${index + 1}. Name: ${user.node.name}` +
               `\nID: ${user.node.id}` +
               `\nUrl: ${user.node.url.replace("www.facebook", "fb")}` +
               `\nTime: ${moment(user.time * 1000).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`;
      });

      msg += `\nTo approve, type:\naccept approve <UID>`;
      api.sendMessage(msg, threadID, messageID);
    } catch (error) {
      api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }

    return;
  }

  return sendUsage();
};