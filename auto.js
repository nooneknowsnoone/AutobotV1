
const fs = require('fs');    
const path = require('path');    
const login = require('ws3-fca');    
const express = require('express');    
const port = process.env.PORT || 3000;    
const app = express();    
const chalk = require('chalk');    
const bodyParser = require('body-parser');    
const script = path.join(__dirname, 'script');    
const cron = require('node-cron');    
const config = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();    
const Utils = new Object({    
  commands: new Map(),    
  handleEvent: new Map(),    
  account: new Map(),    
  cooldowns: new Map(),    
});    
fs.readdirSync(script).forEach((file) => {    
  const scripts = path.join(script, file);    
  const stats = fs.statSync(scripts);    
  if (stats.isDirectory()) {    
    fs.readdirSync(scripts).forEach((file) => {    
      try {    
        const {    
          config,    
          run,    
          handleEvent    
        } = require(path.join(scripts, file));    
        if (config) {    
          const {    
            name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'    
          } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));    
          aliases.push(name);    
          if (run) {    
            Utils.commands.set(aliases, {    
              name,    
              role,    
              run,    
              aliases,    
              description,    
              usage,    
              version,    
              hasPrefix: config.hasPrefix,    
              credits,    
              cooldown    
            });    
          }    
          if (handleEvent) {    
            Utils.handleEvent.set(aliases, {    
              name,    
              handleEvent,    
              role,    
              description,    
              usage,    
              version,    
              hasPrefix: config.hasPrefix,    
              credits,    
              cooldown    
            });    
          }    
        }    
      } catch (error) {    
        console.error(chalk.red(`Error installing command from file ${file}: ${error.message}`));    
      }    
    });    
  } else {    
    try {    
      const {    
        config,    
        run,    
        handleEvent    
      } = require(scripts);    
      if (config) {    
        const {    
          name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'    
        } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));    
        aliases.push(name);    
        if (run) {    
          Utils.commands.set(aliases, {    
            name,    
            role,    
            run,    
            aliases,    
            description,    
            usage,    
            version,    
            hasPrefix: config.hasPrefix,    
            credits,    
            cooldown    
          });    
        }    
        if (handleEvent) {    
          Utils.handleEvent.set(aliases, {    
            name,    
            handleEvent,    
            role,    
            description,    
            usage,    
            version,    
            hasPrefix: config.hasPrefix,    
            credits,    
            cooldown    
          });    
        }    
      }    
    } catch (error) {    
      console.error(chalk.red(`Error installing command from file ${file}: ${error.message}`));    
    }    
  }    
});    
app.use(express.static(path.join(__dirname, 'public')));    
app.use(bodyParser.json());    
app.use(express.json());    
const routes = [{    
  path: '/',    
  file: 'index.html'    
}, {    
  path: '/step_by_step_guide',    
  file: 'guide.html'    
}, {    
  path: '/online_user',    
  file: 'online.html'    
}, {    
  path: '/automated_fba',    
  file: 'autobot.html'    
}, ];    
routes.forEach(route => {    
  app.get(route.path, (req, res) => {    
    res.sendFile(path.join(__dirname, 'public', route.file));    
  });    
});    
app.get('/info', (req, res) => {    
  const data = Array.from(Utils.account.values()).map(account => ({    
    name: account.name,    
    profileUrl: account.profileUrl,    
    thumbSrc: account.thumbSrc,    
    time: account.time    
  }));    
  res.json(JSON.parse(JSON.stringify(data, null, 2)));    
});    
app.get('/commands', (req, res) => {    
  const command = new Set();    
  const commands = [...Utils.commands.values()].map(({    
    name    
  }) => (command.add(name), name));    
  const handleEvent = [...Utils.handleEvent.values()].map(({    
    name    
  }) => command.has(name) ? null : (command.add(name), name)).filter(Boolean);    
  const role = [...Utils.commands.values()].map(({    
    role    
  }) => (command.add(role), role));    
  const aliases = [...Utils.commands.values()].map(({    
    aliases    
  }) => (command.add(aliases), aliases));    
  res.json(JSON.parse(JSON.stringify({    
    commands,    
    handleEvent,    
    role,    
    aliases    
  }, null, 2)));    
});    
app.post('/login', async (req, res) => {    
  const {    
    state,    
    commands,    
    prefix,    
    admin    
  } = req.body;    
  try {    
    if (!state) {    
      throw new Error('Missing app state data');    
    }    
    const cUser = state.find(item => item.key === 'c_user');    
    if (cUser) {    
      const existingUser = Utils.account.get(cUser.value);    
      if (existingUser) {    
        console.log(`User ${cUser.value} is already logged in`);    
        return res.status(400).json({    
          error: false,    
          message: "Active user session detected; already logged in",    
          user: existingUser    
        });    
      } else {    
        try {    
          await accountLogin(state, commands, prefix, [admin]);    
          res.status(200).json({    
            success: true,    
            message: 'Authentication process completed successfully; login achieved.'    
          });    
        } catch (error) {    
          console.error(error);    
          res.status(400).json({    
            error: true,    
            message: error.message    
          });    
        }    
      }    
    } else {    
      return res.status(400).json({    
        error: true,    
        message: "There's an issue with the appstate data; it's invalid."    
      });    
    }    
  } catch (error) {    
    return res.status(400).json({    
      error: true,    
      message: "There's an issue with the appstate data; it's invalid."    
    });    
  }    
});    
  app.listen(port, () => {    
        console.log(`    
▄▀█ █░█ ▀█▀ █▀█ █▄▄ █▀█ ▀█▀    
█▀█ █▄█ ░█░ █▄█ █▄█ █▄█ ░█░    
is running on port ${port}`);    
});    
process.on('unhandledRejection', (reason) => {    
  console.error('Unhandled Promise Rejection:', reason);    
});    
async function accountLogin(state, enableCommands = [], prefix, admin = []) {    
  return new Promise((resolve, reject) => {    
    login({    
      appState: state    
    }, async (error, api) => {    
      if (error) {    
        reject(error);    
        return;    
      }    
      const userid = await api.getCurrentUserID();    
      addThisUser(userid, enableCommands, state, prefix, admin);    
      try {    
        const userInfo = await api.getUserInfo(userid);    
        if (!userInfo || !userInfo[userid]?.name || !userInfo[userid]?.profileUrl || !userInfo[userid]?.thumbSrc) throw new Error('Unable to locate the account; it appears to be in a suspended or locked state.');    
        const {    
          name,    
          profileUrl,    
          thumbSrc    
        } = userInfo[userid];    
        let time = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(user => user.userid === userid) || {}).time || 0;    
        Utils.account.set(userid, {    
          name,    
          profileUrl,    
          thumbSrc,    
          time: time    
        });    
        const intervalId = setInterval(() => {    
          try {    
            const account = Utils.account.get(userid);    
            if (!account) throw new Error('Account not found');    
            Utils.account.set(userid, {    
              ...account,    
              time: account.time + 1    
            });    
          } catch (error) {    
            clearInterval(intervalId);    
            return;    
          }    
        }, 1000);    
      } catch (error) {    
        reject(error);    
        return;    
      }    
      api.setOptions({    
        listenEvents: config[0].fcaOption.listenEvents,    
        logLevel: config[0].fcaOption.logLevel,    
        updatePresence: config[0].fcaOption.updatePresence,    
        selfListen: config[0].fcaOption.selfListen,    
        forceLogin: config[0].fcaOption.forceLogin,    
        online: config[0].fcaOption.online,    
        autoMarkDelivery: config[0].fcaOption.autoMarkDelivery,    
        autoMarkRead: config[0].fcaOption.autoMarkRead,    
      });    
      try {    
        var listenEmitter = api.listenMqtt(async (error, event) => {    
          if (error) {    
            if (error === 'Connection closed.') {    
              console.error(`Error during API listen: ${error}`, userid);    
            }    
            console.log(error)    
          }    
          let database = fs.existsSync('./data/database.json') ? JSON.parse(fs.readFileSync('./data/database.json', 'utf8')) : createDatabase();    
          let data = Array.isArray(database) ? database.find(item => Object.keys(item)[0] === event?.threadID) : {};    
          let adminIDS = data ? database : createThread(event.threadID, api);    
          let blacklist = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(blacklist => blacklist.userid === userid) || {}).blacklist || [];    
          let hasPrefix = (event.body && aliases((event.body || '')?.trim().toLowerCase().split(/ +/).shift())?.hasPrefix == false) ? '' : prefix;    
          let [command, ...args] = ((event.body || '').trim().toLowerCase().startsWith(hasPrefix?.toLowerCase()) ? (event.body || '').trim().substring(hasPrefix?.length).trim().split(/\s+/).map(arg => arg.trim()) : []);    
          const matchedCommand = aliases(command);

// Prevent spam if command is valid and doesn't need prefix
if (
  matchedCommand &&
  matchedCommand.hasPrefix === false &&
  event.body?.toLowerCase().startsWith(prefix.toLowerCase())
) {
  api.sendMessage(
    `𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝗎𝗌𝖺𝗀𝖾: 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝖽𝗈𝖾𝗌𝗇'𝗍 𝗇𝖾𝖾𝖽 𝖺 𝗉𝗋𝖾𝖿𝗂𝗑. 𝖳𝗋𝗒 𝗎𝗌𝗂𝗇𝗀 𝗂𝗍 𝗐𝗂𝗍𝗁𝗈𝗎𝗍 𝗍𝗁𝖾 "${prefix}" 𝗉𝗋𝖾𝖿𝗂𝗑.`,
    event.threadID,
    event.messageID
  );
  return;
} 
          if (event.body && aliases(command)?.name) {    
            const role = aliases(command)?.role ?? 0;    
            const isAdmin = config?.[0]?.masterKey?.admin?.includes(event.senderID) || admin.includes(event.senderID);    
            const isThreadAdmin = isAdmin || ((Array.isArray(adminIDS) ? adminIDS.find(admin => Object.keys(admin)[0] === event.threadID) : {})?.[event.threadID] || []).some(admin => admin.id === event.senderID);    
            if ((role == 1 && !isAdmin) || (role == 2 && !isThreadAdmin) || (role == 3 && !config?.[0]?.masterKey?.admin?.includes(event.senderID))) {    
              api.sendMessage(`𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽.`, event.threadID, event.messageID);    
              return;    
            }    
          }    
          if (event.body && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && aliases(command)?.name) {    
            if (blacklist.includes(event.senderID)) {    
              api.sendMessage("𝖶𝖾'𝗋𝖾 𝗌𝗈𝗋𝗋𝗒, 𝖻𝗎𝗍 𝗒𝗈𝗎'𝗏𝖾 𝖻𝖾𝖾𝗇 𝖻𝖺𝗇𝗇𝖾𝖽 𝖿𝗋𝗈𝗆 𝗎𝗌𝗂𝗇𝗀 𝖻𝗈𝗍. 𝖨𝖿 𝗒𝗈𝗎 𝖻𝖾𝗅𝗂𝖾𝗏𝖾 𝗍𝗁𝗂𝗌 𝗂𝗌 𝖺 𝗆𝗂𝗌𝗍𝖺𝗄𝖾 𝗈𝗋 𝗐𝗈𝗎𝗅𝖽 𝗅𝗂𝗄𝖾 𝗍𝗈 𝖺𝗉𝗉𝖾𝖺𝗅, 𝗉𝗅𝖾𝖺𝗌𝖾 𝖼𝗈𝗇𝗍𝖺𝖼𝗍 𝗈𝗇𝖾 𝗈𝖿 𝗍𝗁𝖾 𝖻𝗈𝗍 𝖺𝖽𝗆𝗂𝗇𝗌 𝖿𝗈𝗋 𝖿𝗎𝗋𝗍𝗁𝖾𝗋 𝖺𝗌𝗌𝗂𝗌𝗍𝖺𝗇𝖼𝖾.", event.threadID, event.messageID);    
              return;    
            }    
          }    
          if (event.body && aliases(command)?.name) {    
            const now = Date.now();    
            const name = aliases(command)?.name;    
            const sender = Utils.cooldowns.get(`${event.senderID}_${name}_${userid}`);    
            const delay = aliases(command)?.cooldown ?? 0;    
            if (!sender || (now - sender.timestamp) >= delay * 1000) {    
              Utils.cooldowns.set(`${event.senderID}_${name}_${userid}`, {    
                timestamp: now,    
                command: name    
              });    
            } else {    
              const active = Math.ceil((sender.timestamp + delay * 1000 - now) / 1000);    
              api.sendMessage(`𝖯𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍 ${active} 𝗌𝖾𝖼𝗈𝗇𝖽𝗌 𝖻𝖾𝖿𝗈𝗋𝖾 𝗎𝗌𝗂𝗇𝗀 𝗍𝗁𝖾 "${name}" 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝖺𝗀𝖺𝗂𝗇.`, event.threadID, event.messageID);    
              return;    
            }    
          }    
          if (event.body && !command && event.body?.toLowerCase().startsWith(prefix.toLowerCase())) {    
            api.sendMessage(`𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝗉𝗅𝖾𝖺𝗌𝖾 𝗎𝗌𝖾 ${prefix}𝗁𝖾𝗅𝗉 𝗍𝗈 𝗌𝖾𝖾 𝗍𝗁𝖾 𝗅𝗂𝗌𝗍 𝗈𝖿 𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌.`, event.threadID, event.messageID);    
            return;    
          }    
          if (event.body && command && prefix && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && !aliases(command)?.name) {    
            api.sendMessage(`𝖨𝗇𝗏𝖺𝗅𝗂𝖽 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 '${command}' 𝗉𝗅𝖾𝖺𝗌𝖾 𝗎𝗌𝖾 ${prefix}𝗁𝖾𝗅𝗉 𝗍𝗈 𝗌𝖾𝖾 𝗍𝗁𝖾 𝗅𝗂𝗌𝗍 𝗈𝖿 𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌.`, event.threadID, event.messageID);    
            return;    
          }    
          for (const {    
              handleEvent,    
              name    
            }    
            of Utils.handleEvent.values()) {    
            if (handleEvent && name && (    
                (enableCommands[1].handleEvent || []).includes(name) || (enableCommands[0].commands || []).includes(name))) {    
              handleEvent({    
                api,    
                event,    
                enableCommands,    
                admin,    
                prefix,    
                blacklist    
              });    
            }    
          }    
          switch (event.type) {    
            case 'message':    
            case 'message_reply':    
            case 'message_unsend':    
            case 'message_reaction':    
              if (enableCommands[0].commands.includes(aliases(command?.toLowerCase())?.name)) {    
                await ((aliases(command?.toLowerCase())?.run || (() => {}))({    
                  api,    
                  event,    
                  args,    
                  enableCommands,    
                  admin,    
                  prefix,    
                  blacklist,    
                  Utils,    
                }));    
              }    
              break;    
          }    
        });    
      } catch (error) {    
        console.error('Error during API listen, outside of listen', userid);    
        Utils.account.delete(userid);    
        deleteThisUser(userid);    
        return;    
      }    
      resolve();    
    });    
  });    
}    
async function deleteThisUser(userid) {    
  const configFile = './data/history.json';    
  let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));    
  const sessionFile = path.join('./data/session', `${userid}.json`);    
  const index = config.findIndex(item => item.userid === userid);    
  if (index !== -1) config.splice(index, 1);    
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));    
  try {    
    fs.unlinkSync(sessionFile);    
  } catch (error) {    
    console.log(error);    
  }    
}    
async function addThisUser(userid, enableCommands, state, prefix, admin, blacklist) {    
  const configFile = './data/history.json';    
  const sessionFolder = './data/session';    
  const sessionFile = path.join(sessionFolder, `${userid}.json`);    
  if (fs.existsSync(sessionFile)) return;    
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));    
  config.push({    
    userid,    
    prefix: prefix || "",    
    admin: admin || [],    
    blacklist: blacklist || [],    
    enableCommands,    
    time: 0,    
  });    
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));    
  fs.writeFileSync(sessionFile, JSON.stringify(state));    
}    
    
function aliases(command) {    
  const aliases = Array.from(Utils.commands.entries()).find(([commands]) => commands.includes(command?.toLowerCase()));    
  if (aliases) {    
    return aliases[1];    
  }    
  return null;    
}    
async function main() {    
  const empty = require('fs-extra');    
  const cacheFile = './script/cache';    
  if (!fs.existsSync(cacheFile)) fs.mkdirSync(cacheFile);    
  const configFile = './data/history.json';    
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '[]', 'utf-8');    
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));    
  const sessionFolder = path.join('./data/session');    
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);    
  const adminOfConfig = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();    
  cron.schedule(`*/${adminOfConfig[0].masterKey.restartTime} * * * *`, async () => {    
    const history = JSON.parse(fs.readFileSync('./data/history.json', 'utf-8'));    
    history.forEach(user => {    
      (!user || typeof user !== 'object') ? process.exit(1): null;    
      (user.time === undefined || user.time === null || isNaN(user.time)) ? process.exit(1): null;    
      const update = Utils.account.get(user.userid);    
      update ? user.time = update.time : null;    
    });    
    await empty.emptyDir(cacheFile);    
    await fs.writeFileSync('./data/history.json', JSON.stringify(history, null, 2));    
    process.exit(1);    
  });    
  try {    
    for (const file of fs.readdirSync(sessionFolder)) {    
      const filePath = path.join(sessionFolder, file);    
      try {    
        const {    
          enableCommands,    
          prefix,    
          admin,    
          blacklist    
        } = config.find(item => item.userid === path.parse(file).name) || {};    
        const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));    
        if (enableCommands) await accountLogin(state, enableCommands, prefix, admin, blacklist);    
      } catch (error) {    
        deleteThisUser(path.parse(file).name);    
      }    
    }    
  } catch (error) {}    
}    
    
function createConfig() {    
  const config = [{    
    masterKey: {    
      admin: ["100095290150085"],    
      devMode: false,    
      database: false,    
      restartTime: 480,    
    },    
    fcaOption: {    
      forceLogin: true,    
      listenEvents: true,    
      logLevel: "silent",    
      updatePresence: true,    
      selfListen: true,    
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64",    
      online: true,    
      autoMarkDelivery: false,    
      autoMarkRead: false    
    }    
  }];    
  const dataFolder = './data';    
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);    
  fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));    
  return config;    
}    
async function createThread(threadID, api) {    
  try {    
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));    
    let threadInfo = await api.getThreadInfo(threadID);    
    let adminIDs = threadInfo ? threadInfo.adminIDs : [];    
    const data = {};    
    data[threadID] = adminIDs    
    database.push(data);    
    await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');    
    return database;    
  } catch (error) {    
    console.log(error);    
  }    
}    
async function createDatabase() {    
  const data = './data';    
  const database = './data/database.json';    
  if (!fs.existsSync(data)) {    
    fs.mkdirSync(data, {    
      recursive: true    
    });    
  }    
  if (!fs.existsSync(database)) {    
    fs.writeFileSync(database, JSON.stringify([]));    
  }    
  return database;    
}    
main()