import type { MemoryCache } from 'cache-manager';
import { caching } from 'cache-manager';

let memoryCache: MemoryCache;

(async () => {
  memoryCache = await caching('memory', {
    max: 1000,
  })
})();

export { memoryCache };