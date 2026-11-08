const approval = require("../../includes/approval");

module.exports.config = {
  name: "pending",
  version: "1.3.0",
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
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
┃ Total: %1 group(s)
┣━━━━━━━━━━━━━━━┫
%2
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

// ===================================================
// ✅ অনুমোদনের পর: নোটিশ ১ + বটের নিকনেম (config.json এর BOTNAME) + নোটিশ ২
// ===================================================
async function welcomeGroup(api, groupID) {
  const prefix = global.config.PREFIX || "/";

  // config.json এর ADMINBOT এর ১ নাম্বার UID থেকে ফেসবুক লিংক
  const ownerUID = String((global.config.ADMINBOT || [])[0] || "");
  const fbLink = ownerUID ? `https://www.facebook.com/${ownerUID}` : "N/A";

  // 🔥 NOTI BOX 1
  await api.sendMessage(
    `চ্ঁলে্ঁ এ্ঁসে্ঁছি্ঁ ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘⃞𝐀⃞༢࿐ এঁখঁনঁ তোঁমাঁদেঁরঁ সাঁথেঁ আঁড্ডাঁ দিঁবঁ..!😘`,
    groupID
  );

  // 🔥 বটের নিকনেম সেট (config.json এর BOTNAME)
  try {
    const botName = global.config.BOTNAME;
    if (botName) {
      await api.changeNickname(botName, groupID, api.getCurrentUserID());
    }
  } catch (e) {}

  await new Promise(r => setTimeout(r, 800));

  // 🔥 NOTI BOX 2
  await api.sendMessage(
`┏━━━━━━━━━━━━━━━━━┓
┃  🤖 𝐁𝐎𝐓 𝐀𝐂𝐓𝐈𝐕𝐄 ✅
┣━━━━━━━━━━━━━━━━━┫
┃ 🌸 আসসালামু আলাইকুম
┃ ধন্যবাদ আমাকে অ্যাড করার জন্য!
┣━━━━━━━━━━━━━━━━━┫
┃ 📜 ${prefix}help  ➜ কমান্ড লিস্ট
┃ ℹ️ ${prefix}info  ➜ বটের তথ্য
┃ 👑 ${prefix}admin ➜ অ্যাডমিন
┣━━━━━━━━━━━━━━━━━┫
┃ 💬 ${fbLink}
┃ 📱 +8801943488192
┣━━━━━━━━━━━━━━━━━┫
┃ 👑 乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐
┗━━━━━━━━━━━━━━━━━┛`,
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

        // অনুমোদন তালিকায় যোগ (এখন থেকে বট এই গ্রুপে সক্রিয়)
        approval.approve(groupID, event.senderID);

        // নোটিশ + নিকনেম
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
    const [spam, pending] = await Promise.all([
      api.getThreadList(100, null, ["OTHER"]),
      api.getThreadList(100, null, ["PENDING"])
    ]);

    const list = [...(spam || []), ...(pending || [])]
      .filter(group => group.isSubscribed && group.isGroup);

    if (list.length === 0) {
      return api.sendMessage(getText("returnListClean"), threadID, messageID);
    }

    // 🔥 GROUP INFO + PROFILE LINK FIX
    const msgArr = await Promise.all(list.map(async (group, index) => {
      const members = group.participantIDs?.length || 0;

      let addedByName = "Unknown";
      let addedByID = null;

      try {
        const threadInfo = await api.getThreadInfo(group.threadID);

        if (threadInfo.adminIDs && threadInfo.adminIDs.length > 0) {
          addedByID = threadInfo.adminIDs[0].id;

          const userInfo = await api.getUserInfo(addedByID);
          addedByName = userInfo[addedByID]?.name || "Unknown";
        }
      } catch (e) {}

      const profileLink = addedByID
        ? `https://www.facebook.com/${addedByID}`
        : "Not Available";

      return `┃ ${index + 1}. ${group.name || 'Unnamed'}
┃ 🆔 ${group.threadID}
┃ 👥 ${members} members
┃ 👤 ${addedByName}
┃ 🔗 ${profileLink}`;
    }));

    const msg = msgArr.join("\n┣━━━━━━━━━━━━━━━┫\n");

    return api.sendMessage(
      getText("returnListPending", list.length, msg),
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
