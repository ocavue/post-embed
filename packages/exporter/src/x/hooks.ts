export interface ObservedResponse {
  url: string
  operation: string
  transport: 'fetch' | 'xhr'
  body: string
}

export interface ResponseHookOptions {
  /**
   * The realm whose `fetch` or `XMLHttpRequest` to wrap.
   */
  target: typeof globalThis
  /**
   * Maps a request URL to an operation name; `undefined` skips the request.
   */
  resolveOperation: (url: string) => string | undefined
  onResponse: (response: ObservedResponse) => void
  onError?: (error: unknown) => void
}

interface Guarded {
  resolve: (url: string) => string | undefined
  deliver: (response: ObservedResponse) => void
  report: (error: unknown) => void
}

/**
 * Wrap the consumer callbacks so nothing they throw can reach the page.
 */
function guard(options: ResponseHookOptions): Guarded {
  const report = (error: unknown) => {
    try {
      options.onError?.(error)
    } catch {
      // A broken error reporter must not break the page either.
    }
  }
  return {
    report,
    resolve: (url) => {
      try {
        return options.resolveOperation(url)
      } catch (error) {
        report(error)
        return
      }
    },
    deliver: (response) => {
      try {
        options.onResponse(response)
      } catch (error) {
        report(error)
      }
    },
  }
}

function requestURL(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

/**
 * Wrap `fetch` so matching responses are copied to `onResponse` after the
 * page has received them. The page's request and response are never altered;
 * a rejected fetch rejects exactly as before. Returns an uninstaller that
 * restores the original only if nothing else replaced it since.
 */
export function installFetchHook(options: ResponseHookOptions): () => void {
  const { target } = options
  const { resolve, deliver, report } = guard(options)
  const originalFetch = target.fetch

  const wrappedFetch = function (
    this: unknown,
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const promise = originalFetch.call(target, input, init)
    let operation: string | undefined
    try {
      operation = resolve(requestURL(input))
    } catch {
      return promise
    }
    if (operation === undefined) return promise
    const matched = operation
    return promise.then((response) => {
      try {
        response
          .clone()
          .text()
          .then((body) => {
            deliver({
              url: response.url || requestURL(input),
              operation: matched,
              transport: 'fetch',
              body,
            })
          }, report)
      } catch (error) {
        report(error)
      }
      return response
    })
  }
  target.fetch = wrappedFetch

  return () => {
    if (target.fetch === wrappedFetch) target.fetch = originalFetch
  }
}

/**
 * `responseText` throws unless `responseType` is `''` or `'text'`; a `json`
 * response is re-serialized so every transport hands over a string.
 */
function readXHRBody(xhr: XMLHttpRequest): string | undefined {
  if (xhr.responseType === '' || xhr.responseType === 'text') {
    return xhr.responseText
  }
  if (xhr.responseType === 'json') return JSON.stringify(xhr.response)
  return undefined
}

/**
 * Wrap `XMLHttpRequest.prototype.open` so a matching request gets a `load`
 * listener that copies its body to `onResponse`. `send` and the event order
 * are untouched, so other wrappers of `XMLHttpRequest` compose with this
 * one. Returns an uninstaller that restores the original only if nothing
 * else replaced it since.
 */
export function installXHRHook(options: ResponseHookOptions): () => void {
  const { resolve, deliver, report } = guard(options)
  const xhrPrototype = options.target.XMLHttpRequest.prototype
  // eslint-disable-next-line @typescript-eslint/unbound-method -- called with an explicit `this`
  const originalOpen = xhrPrototype.open

  const wrappedOpen = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: [
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ]
  ): void {
    try {
      const operation = resolve(String(url))
      if (operation !== undefined) {
        this.addEventListener('load', () => {
          try {
            const body = readXHRBody(this)
            if (body !== undefined) {
              deliver({
                url: this.responseURL || String(url),
                operation,
                transport: 'xhr',
                body,
              })
            }
          } catch (error) {
            report(error)
          }
        })
      }
    } catch (error) {
      report(error)
    }
    Reflect.apply(originalOpen, this, [method, url, ...rest])
  }
  xhrPrototype.open = wrappedOpen

  return () => {
    if (xhrPrototype.open === wrappedOpen) xhrPrototype.open = originalOpen
  }
}

/**
 * Install both hooks; the returned function uninstalls both.
 */
export function installResponseHooks(options: ResponseHookOptions): () => void {
  const uninstallFetch = installFetchHook(options)
  const uninstallXHR = installXHRHook(options)
  return () => {
    uninstallFetch()
    uninstallXHR()
  }
}
