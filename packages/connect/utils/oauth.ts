// source: https://github.com/Pythe1337N/garmin-connect/blob/dbbb35ad0907e9e23219bc27af735299eef1da02/src/common/HttpClient.ts
import "dotenv/config";
import axios from "axios";
import crypto from "crypto";
import OAuth from "oauth-1.0a";
import qs, { ParsedUrlQueryInput } from "querystring";
import { GarminDomain, GarminURI, getURI } from "./uri";

const OAUTH_CONSUMER_URL =
  "https://thegarth.s3.amazonaws.com/oauth_consumer.json";

let consumer: OAuth.Consumer | null = null;

async function consumer$$() {
  if (consumer) return consumer;

  const { data } = await axios.get<{
    consumer_key: string;
    consumer_secret: string;
  }>(OAUTH_CONSUMER_URL);

  consumer = { key: data.consumer_key, secret: data.consumer_secret };

  return consumer;
}

async function oauth$$() {
  const oauth = new OAuth({
    consumer: await consumer$$(),
    signature_method: "HMAC-SHA1",
    hash_function: (base_string: string, key: string) =>
      crypto.createHmac("sha1", key).update(base_string).digest("base64"),
  });

  return oauth;
}

async function cookie$$(uri: GarminURI) {
  await axios.get(uri.sso_embed, {
    params: {
      clientId: "GarminConnect",
      locale: "en",
      service: uri.gc_modern,
    },
    headers: { "User-Agent": USER_AGENT_CONNECTMOBILE },
  });
}

async function csrf$$(uri: GarminURI) {
  const csrf = await axios
    .get(uri.sso_signin, {
      params: {
        id: "gauth-widget",
        locale: "en",
        embedWidget: "true",
        gauthHost: uri.sso_embed,
      },
      headers: { "User-Agent": USER_AGENT_CONNECTMOBILE },
    })
    .then((r) => r.data)
    .then((t) => CSRF_RE.exec(t)?.[1]);

  if (!csrf) {
    throw new Error("Failed to fetch CSRF token");
  }

  return csrf;
}

async function ticket$$(
  uri: GarminURI,
  csrf: string,
  username: string,
  password: string
) {
  const form = new FormData();
  form.append("_csrf", csrf);
  form.append("username", username);
  form.append("password", password);
  form.append("embed", "true");

  const html = await axios
    .post(uri.sso_signin, form, {
      params: {
        id: "gauth-widget",
        locale: "en",
        embedWidget: "true",
        gauthHost: uri.sso_embed,
        clientId: "GarminConnect",
        service: uri.sso_embed,
        source: uri.sso_embed,
        redirectAfterAccountLoginUrl: uri.sso_embed,
        redirectAfterAccountCreationUrl: uri.sso_embed,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Dnt: "1",
        Origin: `https://sso.${uri.domain}`,
        Referer: uri.sso_signin,
        "User-Agent": USER_AGENT_CONNECTMOBILE,
      },
    })
    .then((r) => r.data);

  if (Boolean(ACCOUNT_LOCKED_RE.exec(html))) {
    throw new Error(
      "Login failed (AccountLocked), please open connect web page to unlock your account"
    );
  }

  const ticket = TICKET_RE.exec(html)?.[1];
  if (!ticket) {
    throw new Error(
      "Login failed (Ticket not found or MFA), please check username and password"
    );
  }

  return ticket;
}

const CSRF_RE = new RegExp('name="_csrf"\\s+value="(.+?)"');
const TICKET_RE = new RegExp('ticket=([^"]+)"');
const ACCOUNT_LOCKED_RE = new RegExp('var statuss*=s*"([^"]*)"');
export const USER_AGENT_CONNECTMOBILE = "com.garmin.android.apps.connectmobile";

export async function authorized(
  username: string,
  password: string,
  domain: GarminDomain = "garmin.com"
) {
  const uri = getURI(domain);

  cookie$$(uri);
  const ticket = await ticket$$(uri, await csrf$$(uri), username, password);
  const url = `${uri.gc_oauth_url}/preauthorized?${qs.stringify({
    ticket,
    "login-url": uri.sso_embed,
    "accepts-mfa-tokens": true,
  })}`;

  const oauth = await oauth$$();

  const { data } = await axios.get<string>(url, {
    headers: {
      ...oauth.toHeader(oauth.authorize({ url, method: "GET" })),
      "User-Agent": USER_AGENT_CONNECTMOBILE,
    },
  });

  const { oauth_token, oauth_token_secret } = qs.parse(data) as {
    oauth_token: string;
    oauth_token_secret: string;
  };

  return { key: oauth_token, secret: oauth_token_secret };
}

export async function exchange(uri: GarminURI, token: OAuth.Consumer) {
  const request = {
    url: `${uri.gc_oauth_url}/exchange/user/2.0`,
    method: "POST",
    data: null,
  };
  const oauth = await oauth$$();

  const { data } = await axios.post<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in: number;
  }>(request.url, null, {
    params: oauth.authorize(request, token),
    headers: {
      "User-Agent": USER_AGENT_CONNECTMOBILE,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return data;
}
