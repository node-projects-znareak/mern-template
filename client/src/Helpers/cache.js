import NodeCache from "node-cache";

const cache = new NodeCache();
export const clearCache = () => cache.flushAll()

export default cache;
