import parse from "arg";
import { authorized } from "../utils";
import { GarminDomain, encodeToken } from "../utils";

const args = parse({
  "--username": String,
  "--password": String,
  "--domain": String,
});

(async function () {
  const token = await authorized(
    args["--username"]!,
    args["--password"]!,
    args["--domain"]! as GarminDomain
  );
  console.log(encodeToken(token));
})();
