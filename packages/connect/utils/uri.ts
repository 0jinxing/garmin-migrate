export type GarminDomain = "garmin.com" | "garmin.cn";

export function getURI(domain: GarminDomain) {
  const sso = `https://sso.${domain}/sso`;
  const sso_embed = `${sso}/embed`;
  const sso_signin = `${sso}/signin`;

  const gc_modern = `https://connect.${domain}/modern`;
  const gc_api = `https://connectapi.${domain}`;
  const gc_oauth_url = `${gc_api}/oauth-service/oauth`;


  return {
    domain,
    sso,
    sso_embed,
    sso_signin,
    gc_modern,
    gc_api,
    gc_oauth_url,

    gc_download_activity: `${gc_api}/download-service/files/activity`,
    gc_upload_activity: `${gc_api}/upload-service/upload`,
    gc_activities: `${gc_api}/activitylist-service/activities/search/activities`,
    gc_activity: `${gc_api}/activity-service/activity`
  };
}

export type GarminURI = ReturnType<typeof getURI>;