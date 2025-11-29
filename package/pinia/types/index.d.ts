type storeIdKey = string;
type storeIdKeyList = storeIdKey[];

interface WhitelistOptions{
  whitelist: storeIdKeyList;
  blacklist?: never;
}

interface BlacklistOptions{
  blacklist: storeIdKeyList;
  whitelist?: never;
}

export type SyncOptions = WhitelistOptions | BlacklistOptions;
