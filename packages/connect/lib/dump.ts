import parse from "arg";
import { connect, decodeToken } from "../utils";
import { Activity } from "../types";
import fs from "fs";
import path from "path";

const args = parse({ "--cn-secret": String, "--dir": String });

const secret = args["--cn-secret"]!;
const dir = path.resolve(process.cwd(), args["--dir"]!);

const listFile = path.resolve(`${dir}/list.json`);
const fitDir = path.resolve(`${dir}/fit`);

console.log(dir, listFile, fitDir);

function ensureDir(dir: string) {
  fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
}

ensureDir(dir);
ensureDir(fitDir);

function exportFit(client: ReturnType<typeof connect>, activity: Activity) {
  
}

async function main() {
  const client = await connect("garmin.cn", decodeToken(secret));
  let start = 0;

  const list = [];
  let append = [];

  do {
    append = await client
      .get<Array<Activity>>(client.uri.gc_activities, {
        params: { start, limit: 200, activityType: "running" },
      })
      .then((res) => res.data);

    list.push(...append);
    start += 200;
  } while (append.length);

  const text = JSON.stringify(list);
  fs.writeFileSync(listFile, text, "utf-8");
}

main();
