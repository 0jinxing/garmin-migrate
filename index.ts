import "dotenv/config";
import { GarminConnect } from "garmin-connect";
import { unzipSync } from "fflate";

async function main() {
  const {
    GARMIN_CN_CONNECT_USERNAME,
    GARMIN_CN_CONNECT_PASSWORD,
    GARMIN_CONNECT_USERNAME,
    GARMIN_CONNECT_PASSWORD,
  } = process.env;

  if (
    !GARMIN_CN_CONNECT_USERNAME ||
    !GARMIN_CN_CONNECT_PASSWORD ||
    !GARMIN_CONNECT_USERNAME ||
    !GARMIN_CONNECT_PASSWORD
  ) {
    throw new Error("Missing environment variables");
  }

  const cn = new GarminConnect(
    {
      username: GARMIN_CN_CONNECT_USERNAME!,
      password: GARMIN_CN_CONNECT_PASSWORD!,
    },
    "garmin.cn"
  );
  const global = new GarminConnect(
    { username: GARMIN_CONNECT_USERNAME!, password: GARMIN_CONNECT_PASSWORD! },
    "garmin.com"
  );

  await Promise.all([cn.login(), global.login()]);

  const cnActs = await cn.getActivities(0, 200);
  const globalActs = await global.getActivities(0, 1);
  let cur = cnActs.shift();

  let count = 0;

  try {
    while (
      cur &&
      (!globalActs.length || cur.beginTimestamp > globalActs[0].beginTimestamp)
    ) {
      console.log(`${cur.activityId}:${cur.activityName} start sync...`);

      const downloadUrl = cn.client.url.DOWNLOAD_ZIP + cur.activityId;
      const unzipped = unzipSync(
        await cn.client.get<Buffer>(downloadUrl, {
          responseType: "arraybuffer",
        })
      );

      const fit = unzipped[Object.keys(unzipped)[0]] as Uint8Array;

      const form = new FormData();
      form.append("file", new Blob([fit.buffer]));

      await global.client.post(global.client.url.UPLOAD + ".fit", form);
      console.log(`${cur.activityId}:${cur?.activityName} sync done!`);
      count++;

      cur = cnActs.shift();
    }
  } finally {
    console.log(`Sync ${count} activities`);
  }
}

main();
