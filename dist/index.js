"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const garmin_connect_1 = require("garmin-connect");
const fflate_1 = require("fflate");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { GARMIN_CN_CONNECT_USERNAME, GARMIN_CN_CONNECT_PASSWORD, GARMIN_CONNECT_USERNAME, GARMIN_CONNECT_PASSWORD, } = process.env;
        const cn = new garmin_connect_1.GarminConnect({
            username: GARMIN_CN_CONNECT_USERNAME,
            password: GARMIN_CN_CONNECT_PASSWORD,
        }, "garmin.cn");
        const global = new garmin_connect_1.GarminConnect({ username: GARMIN_CONNECT_USERNAME, password: GARMIN_CONNECT_PASSWORD }, "garmin.com");
        yield Promise.all([cn.login(), global.login()]);
        const cnActs = yield cn.getActivities(0, 200);
        const globalActs = yield global.getActivities(0, 1);
        let cur = cnActs.shift();
        let count = 0;
        try {
            while (cur &&
                (!globalActs.length || cur.beginTimestamp > globalActs[0].beginTimestamp)) {
                console.log(`${cur.activityId}:${cur.activityName} start sync...`);
                const downloadUrl = cn.client.url.DOWNLOAD_ZIP + cur.activityId;
                const unzipped = (0, fflate_1.unzipSync)(yield cn.client.get(downloadUrl, {
                    responseType: "arraybuffer",
                }));
                const fit = unzipped[Object.keys(unzipped)[0]];
                const form = new FormData();
                form.append("file", new Blob([fit.buffer]));
                yield global.client.post(global.client.url.UPLOAD + ".fit", form);
                console.log(`${cur.activityId}:${cur === null || cur === void 0 ? void 0 : cur.activityName} sync done!`);
                count++;
                cur = cnActs.shift();
            }
        }
        finally {
            console.log(`Sync ${count} activities`);
        }
    });
}
main();
