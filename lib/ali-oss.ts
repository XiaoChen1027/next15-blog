import OSS from "ali-oss";

import {
  NODE_ENV,
  OSS_ACCESS_KEY_ID,
  OSS_ACCESS_KEY_SECRET,
  OSS_BASE_URL,
  OSS_BUCKET,
  OSS_REGION,
} from "@/config";

const globalForAliOSS = global as unknown as { aliOSS: OSS | undefined };

export const aliOSS =
  globalForAliOSS.aliOSS ??
  new OSS({
    endpoint: OSS_BASE_URL,
    accessKeyId: OSS_ACCESS_KEY_ID ?? "",
    accessKeySecret: OSS_ACCESS_KEY_SECRET ?? "",
    region: OSS_REGION ?? "",
    bucket: OSS_BUCKET ?? "",
    cname: true,
    secure: true,
  });

if (NODE_ENV !== "production") globalForAliOSS.aliOSS = aliOSS;
