export function removeFromArray<T>(
  array: T[],
  filter: (item: T) => boolean,
): T | undefined {
  const index = array.findIndex(filter)
  if (index !== -1) {
    return array.splice(index, 1)[0]
  }
  return undefined
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
