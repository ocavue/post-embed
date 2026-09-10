/** Use only when the caller knows the operation is synchronous. */
export function assumeNotPromise<T>(value: T | PromiseLike<T>): T {
  return value as T
}
