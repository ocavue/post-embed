export function getSafeUrl(value: string): string | undefined {
  if (!/^https?:\/\//i.test(value)) return
  if (
    Array.from(value).some((character) => {
      return character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127
    })
  )
    return
  try {
    const url = new URL(value)
    if (url.username || url.password) return
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href
  } catch {
    return
  }
}
