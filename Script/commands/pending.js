const approval = require("../../includes/approval");

module.exports.config = {
  name: "pending",
  version: "1.4.0",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  hasPermssion: 2,
  description: "Manage bot's pending group requests",
  commandCategory: "system",
  cooldowns: 5
};

module.exports.languages = {
  "en": {
    "invaildNumber": "❌ %1 is not a valid number",

    "noPermission": `┏━━━━━━━━━━━━━━━┓
┃ ❌ ONLY ADMIN   ┃
┗━━━━━━━━━━━━━━━┛`,

    "cancelSuccess": `┏━━━━━━━━━━━━━━━┓
┃ ❌ REJECT DONE  ┃
┣━━━━━━━━━━━━━━━┫
┃ %1 group rejected
┗━━━━━━━━━━━━━━━┛`,

    "approveSuccess": `┏━━━━━━━━━━━━━━━┓
┃ ✅ APPROVED     ┃
┣━━━━━━━━━━━━━━━┫
┃ %1 group approved
┗━━━━━━━━━━━━━━━┛`,

    "cantGetPendingList": "❌ Failed to retrieve pending list!",

    "returnListClean": `┏━━━━━━━━━━━━━━━┓
┃ ✅ NO PENDING   ┃
┗━━━━━━━━━━━━━━━┛`,

    "returnListPending": `┏━━━━━━━━━━━━━━━┓
┃ 📜 PENDING LIST
┣━━━━━━━━━━━━━━━┫
┃ ⏳ Pending: %1 group(s)
┃ 🤖 Bot is in: %2 group(s)
┣━━━━━━━━━━━━━━━┫
%3
┣━━━━━━━━━━━━━━━┫
┃ ✔ 1 2 3 = approve
┃ ❌ c1 c2 = reject
┗━━━━━━━━━━━━━━━┛`
  }
};

// 🔒 ADMIN CHECK
function isAdmin(senderID) {
  return global.config.ADMINBOT.includes(senderID);
}

// 🔎 গ্রুপ থেকে "কে অ্যাড করেছে" বের করা (নাম + প্রোফাইল লিংক)
async function getAdder(api, groupID) {
  let id = null;
  let name = "Unknown";
  try {
    const threadInfo = await api.getThreadInfo(groupID);
    if (threadInfo.adminIDs && threadInfo.adminIDs.length > 0) {
      id = threadInfo.adminIDs[0].id;
      const userInfo = await api.getUserInfo(id);
      name = userInfo[id]?.name || "Unknown";
    }
    return {
      id,
      name,
      link: id ? `https://www.facebook.com/${id}` : "Not Available",
      groupName: threadInfo.threadName || "Unnamed",
      members: (threadInfo.participantIDs || []).length
    };
  } catch (e) {
    return { id, name, link: "Not Available", groupName: "Unnamed", members: 0 };
  }
}

// 🔢 বট বর্তমানে কয়টা গ্রুপে আছে
async function countBotGroups(api) {
  try {
    const inbox = await api.getThreadList(100, null, ["INBOX"]);
    return (inbox || []).filter(t => t.isGroup && t.isSubscribed).length;
  } catch (e) {
    return "N/A";
  }
}

// ===================================================
// ✅ অনুমোদনের পর: নিকনেম (config.json এর BOTNAME) + জয়েন ক্যাপশন
// ===================================================
async function welcomeGroup(api, groupID) {
  const prefix = global.config.PREFIX || "/";
  const botName = global.config.BOTNAME || "BOT";

  const ownerUID = String((global.config.ADMINBOT || [])[0] || "");
  const fbLink = ownerUID ? `https://www.facebook.com/${ownerUID}` : "N/A";

  // 🔥 বটের নিকনেম সেট (config.json এর BOTNAME)
  try {
    if (global.config.BOTNAME) {
      await api.changeNickname(global.config.BOTNAME, groupID, api.getCurrentUserID());
    }
  } catch (e) {}

  // গ্রুপের তথ্য: নাম, মেম্বার, কে অ্যাড করেছে, মোট গ্রুপ
  const adder = await getAdder(api, groupID);
  const totalGroups = await countBotGroups(api);

  await new Promise(r => setTimeout(r, 800));

  // 🔥 JOIN CAPTION
  await api.sendMessage(
`╔═══════════════════════╗
║  🤖  𝐁𝐎𝐓  𝐉𝐎𝐈𝐍𝐄𝐃  𝐓𝐇𝐈𝐒  𝐆𝐑𝐎𝐔𝐏  ✅
╚═══════════════════════╝

✨ আসসালামু আলাইকুম ✨
আমি একটি 𝐁𝐎𝐓 🤖 — এই গ্রুপে সফলভাবে
জয়েন করেছি! ধন্যবাদ আমাকে অ্যাড করার জন্য 💖

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 🏷️ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞 : ${botName}
┃ 👥 𝐆𝐫𝐨𝐮𝐩 : ${adder.groupName}
┃ 🧑‍🤝‍🧑 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${adder.members} জন
┃ 🌍 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬 : ${totalGroups} টি গ্রুপে আছি
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐀𝐝𝐝𝐞𝐝 𝐁𝐲 : ${adder.name}
┃ 🔗 ${adder.link}
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 📜 ${prefix}help  ➜ কমান্ড লিস্ট
┃ ℹ️ ${prefix}info  ➜ বটের তথ্য
┃ 👑 ${prefix}admin ➜ অ্যাডমিন
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 💬 ${fbLink}
┃ 📱 +8801943488192
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👑 乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐
┗━━━━━━━━━━━━━━━━━━━━━┛

😘 এখন তোমাদের সাথে আড্ডা দিব!`,
    groupID
  );
}

module.exports.handleReply = async function({ api, event, handleReply, getText }) {
  if (String(event.senderID) !== String(handleReply.author)) return;

  if (!isAdmin(event.senderID)) {
    return api.sendMessage(getText("noPermission"), event.threadID, event.messageID);
  }

  const { body, threadID, messageID } = event;
  let count = 0;

  // ❌ REJECT
  if ((isNaN(body) && body.toLowerCase().startsWith("c")) || body.toLowerCase().startsWith("cancel")) {
    const indexes = body.match(/\d+/g) || [];

    for (const num of indexes) {
      const index = parseInt(num);
      if (isNaN(index) || index <= 0 || index > handleReply.pending.length) {
        return api.sendMessage(getText("invaildNumber", num), threadID, messageID);
      }

      try {
        approval.remove(handleReply.pending[index - 1].threadID);
        await api.removeUserFromGroup(api.getCurrentUserID(), handleReply.pending[index - 1].threadID);
        count++;
      } catch (e) {}
    }

    return api.sendMessage(getText("cancelSuccess", count), threadID, messageID);
  }

  // ✅ APPROVE
  else {
    const indexes = body.match(/\d+/g) || [];

    for (const num of indexes) {
      const index = parseInt(num);
      if (isNaN(index) || index <= 0 || index > handleReply.pending.length) {
        return api.sendMessage(getText("invaildNumber", num), threadID, messageID);
      }

      try {
        const groupID = handleReply.pending[index - 1].threadID;

        approval.approve(groupID, event.senderID);
        await welcomeGroup(api, groupID);

        count++;
      } catch (e) {}
    }

    return api.sendMessage(getText("approveSuccess", count), threadID, messageID);
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const { threadID, messageID, senderID } = event;

  if (!isAdmin(senderID)) {
    return api.sendMessage(getText("noPermission"), threadID, messageID);
  }

  // /pending <গ্রুপ আইডি> দিলে সরাসরি অনুমোদন
  if (args && /^\d{8,}$/.test(args[0] || "")) {
    try {
      approval.approve(args[0], senderID);
      await welcomeGroup(api, args[0]);
      return api.sendMessage(`✅ ${args[0]} গ্রুপ অনুমোদিত হয়েছে।`, threadID, messageID);
    } catch (e) {
      return api.sendMessage(`⚠️ ${args[0]} অনুমোদিত হয়েছে, কিন্তু গ্রুপে মেসেজ পাঠানো যায়নি।`, threadID, messageID);
    }
  }

  try {
    const [spam, pending, botGroups] = await Promise.all([
      api.getThreadList(100, null, ["OTHER"]),
      api.getThreadList(100, null, ["PENDING"]),
      countBotGroups(api)
    ]);

    const list = [...(spam || []), ...(pending || [])]
      .filter(group => group.isSubscribed && group.isGroup);

    if (list.length === 0) {
      return api.sendMessage(getText("returnListClean"), threadID, messageID);
    }

    const msgArr = await Promise.all(list.map(async (group, index) => {
      const members = group.participantIDs?.length || 0;
      const adder = await getAdder(api, group.threadID);

      return `┃ ${index + 1}. ${group.name || 'Unnamed'}
┃ 🆔 ${group.threadID}
┃ 👥 ${members} members
┃ 👤 Added by: ${adder.name}
┃ 🔗 ${adder.link}`;
    }));

    const msg = msgArr.join("\n┣━━━━━━━━━━━━━━━┫\n");

    return api.sendMessage(
      getText("returnListPending", list.length, botGroups, msg),
      threadID,
      (error, info) => {
        if (!error) {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            pending: list
          });
        }
      },
      messageID
    );

  } catch (e) {
    return api.sendMessage(getText("cantGetPendingList"), threadID, messageID);
  }
};
