import { UniqueIdExtractor } from './unique-id-extractor.model';

export interface MemoizePayload {
  extractHash: UniqueIdExtractor;
  doUseWeakMap?: boolean;
  clearCacheTimeout?: number;
}
