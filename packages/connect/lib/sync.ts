import parse from "arg";
import { unzipSync } from "fflate";
import { connect, decodeToken } from "../utils";
import { Activity } from "@gc/types";

const args = parse({ "--secret": String, "--cn-secret": String });

async function getActivities(
  client: Awaited<ReturnType<typeof connect>>,
  start: number
) {
  return await client
    .get<Array<Activity>>(client.uri.gc_activities, {
      params: { start, limit: 200 },
    })
    .then(({ data }) => data);
}

async function main() {
  const [cn, global] = await Promise.all([
    connect("garmin.cn", decodeToken(args["--cn-secret"]!)),
    connect("garmin.com", decodeToken(args["--secret"]!)),
  ]);
  let count = 0;

  const gActs = await getActivities(global, 0);

  let start = 0;
  let cActs = await getActivities(cn, start);

  while (
    cActs.length &&
    (cActs[0].beginTimestamp > gActs[0].beginTimestamp || gActs.length === 0)
  ) {
    const cur = cActs.shift()!;

    console.log(`${cur.activityId}:${cur.activityName} start sync...`);

    const download = cn.uri.gc_download_activity + "/" + cur.activityId;

    const unzipped = unzipSync(
      await cn
        .get<Buffer>(download, { responseType: "arraybuffer" })
        .then((r) => r.data)
    );

    const buf = Object.values(unzipped)[0] as Uint8Array;

    const form = new FormData();
    form.append("userfile", new Blob([buf]));

    await global.post(global.uri.gc_upload_activity + "/.fit", form);

    console.log(`${cur.activityId}:${cur?.activityName} sync done!`);

    cActs =
      cActs.length === 0 ? await getActivities(cn, (start += 200)) : cActs;
    count++;
  }

  console.log(`sync ${count} activities`);
}

main();
