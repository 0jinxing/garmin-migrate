import axios, { AxiosInstance } from "axios";
import { USER_AGENT_CONNECTMOBILE, exchange } from "./oauth";
import { GarminDomain, GarminURI, getURI } from "./uri";

export async function connect(domain: GarminDomain, token: OAuth.Consumer) {
  const uri = getURI(domain);
  const { access_token } = await exchange(uri, token);

  const instance = axios.create({
    headers: {
      'User-Agent': USER_AGENT_CONNECTMOBILE, Authorization: `Bearer ${access_token}`
    }
  });


  return Object.assign(instance, { uri }) as AxiosInstance & { uri: GarminURI };
}