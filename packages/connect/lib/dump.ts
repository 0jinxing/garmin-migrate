import parse from "arg";
import fs from "fs";
import path from "path";
import { unzipSync } from "fflate";
import { Decoder, Stream } from "@garmin/fitsdk";
import { Activity, Mesg } from "@gc/types";
import { connect, decodeToken } from "../utils";

const args = parse({ "--cn-secret": String, "--dir": String });
const secret = args["--cn-secret"]!;

const exportFile = path.resolve(
  process.cwd(),
  args["--dir"]!,
  "activities.json"
);

function ensureDir(dir: string) {
  fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.dirname(exportFile));

async function readFitMesgs(
  client: Awaited<ReturnType<typeof connect>>,
  activity: Pick<Activity, "activityId">
) {
  const url = client.uri.gc_download_activity + "/" + activity.activityId;

  const unzipped = unzipSync(
    await client
      .get<Buffer>(url, { responseType: "arraybuffer" })
      .then((r) => r.data)
  );

  const bytes = Object.values(unzipped)[0] as Uint8Array;

  const decode = new Decoder(Stream.fromByteArray(bytes)).read();
  return decode.messages.recordMesgs as Mesg[];
}

async function main() {
  const client = await connect("garmin.cn", decodeToken(secret));

  const data: Array<Activity & { mesgs?: Mesg[] }> = [];

  try {
    data.push(...JSON.parse(fs.readFileSync(exportFile, "utf-8")));
  } catch {
    // ignore
  }
  let start = 0;

  while (true) {
    const params = { start, limit: 200, activityType: "running" };

    const list = await client
      .get<Array<Activity>>(client.uri.gc_activities, { params })
      .then((res) => res.data)
      .then((l) =>
        l.filter((i) => !data.find((a) => a.activityId === i.activityId))
      );

    if (list.length === 0) {
      break;
    }
    data.push(...list);
    start += 200;
  }

  await Promise.all(
    data.map(async (item) => {
      item.mesgs = await readFitMesgs(client, item);
    })
  );

  fs.writeFileSync(exportFile, JSON.stringify(data));
}

main();
