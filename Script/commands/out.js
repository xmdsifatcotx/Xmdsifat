// ══════════════════════════════════════════════
// Credit : 乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐
// ══════════════════════════════════════════════
const approval = require("../../includes/approval");

module.exports.config = {
  name: "out",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "বটকে গ্রুপ থেকে বের করা: out | out <গ্রুপ আইডি>",
  commandCategory: "Admin",
  usages: "out | out <গ্রুপ আইডি>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const botID = api.getCurrentUserID();
  const target = args[0];

  // /out <গ্রুপ আইডি>  → ওই গ্রুপ থেকে বের হবে
  if (target) {
    if (!/^\d{8,}$/.test(target)) {
      return api.sendMessage("❌ সঠিক গ্রুপ আইডি দিন।\nউদাহরণ: /out 1234567890123456", threadID, messageID);
    }
    try {
      approval.remove(target);
      await api.removeUserFromGroup(botID, target);
      return api.sendMessage(`✅ ${target} গ্রুপ থেকে বের হয়েছি।`, threadID, messageID);
    } catch (e) {
      return api.sendMessage(`⚠️ ${target} গ্রুপ থেকে বের হতে পারিনি।`, threadID, messageID);
    }
  }

  // /out  → এই গ্রুপ থেকেই বের হবে
  try {
    approval.remove(threadID);
    await api.sendMessage("👋 আল্লাহ হাফেজ! আমি গ্রুপ থেকে বের হচ্ছি।", threadID);
    await api.removeUserFromGroup(botID, threadID);
  } catch (e) {
    return api.sendMessage("⚠️ গ্রুপ থেকে বের হতে পারিনি।", threadID, messageID);
  }
};
