require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const { startServiceJob } = require("./jobs/startService.job");

async function connectAndStart() {
  const mongoUrls = process.env.MONGODB_URLS;
  const uriList = mongoUrls.split(",");
  for (let i = 0; i < uriList.length; i++) {
    const uri = uriList[i].trim();
    await mongoose.connect(uri);
    await startServiceJob();
    await mongoose.disconnect();
  }
}

(async () => {
  await connectAndStart();
})();

cron.schedule(
  "*/20 * * * *", // ⏱ mỗi 2 phút
  async () => {
    try {
      await connectAndStart();
    } catch (error) {
      console.error("❌ Connect and start job error (cron):", error);
    }
  },
  {
    timezone: process.env.TIMEZONE || "Asia/Ho_Chi_Minh",
  }
);
