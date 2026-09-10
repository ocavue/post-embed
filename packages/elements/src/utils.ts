/** Use only when the caller knows the operation is synchronous. We need this until https://github.com/standard-schema/standard-schema/issues/22 is resolved */
export function assumeNotPromise<T>(value: T | PromiseLike<T>): T {
  return value as T
}
