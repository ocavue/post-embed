export interface ObservedResponse {
  url: string
  operation: string
  transport: 'fetch' | 'xhr'
  body: string
}

export interface ResponseHookOptions {
  /**
   * The realm whose `fetch` and `XMLHttpRequest` to wrap.
   */
  target: typeof globalThis
  /**
   * Maps a request URL to an operation name; `undefined` skips the request.
   */
  resolveOperation: (url: string) => string | undefined
  onResponse: (response: ObservedResponse) => void
  onError?: (error: unknown) => void
}

function requestURL(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
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
 * Wrap `fetch` and `XMLHttpRequest.prototype.open` so matching responses are
 * copied to `onResponse` after the page has received them. Requests and
 * responses are never altered; a failure inside the hook is reported to
 * `onError` and otherwise invisible to the page. Returns an uninstaller that
 * restores the originals only if nothing else replaced them since.
 */
export function installResponseHooks(options: ResponseHookOptions): () => void {
  const { target, resolveOperation, onResponse } = options
  const report = (error: unknown) => {
    try {
      options.onError?.(error)
    } catch {
      // A broken error reporter must not break the page either.
    }
  }
  const resolve = (url: string): string | undefined => {
    try {
      return resolveOperation(url)
    } catch (error) {
      report(error)
      return undefined
    }
  }
  const deliver = (response: ObservedResponse) => {
    try {
      onResponse(response)
    } catch (error) {
      report(error)
    }
  }

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

  const xhrPrototype = target.XMLHttpRequest.prototype
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
    if (target.fetch === wrappedFetch) target.fetch = originalFetch
    if (xhrPrototype.open === wrappedOpen) xhrPrototype.open = originalOpen
  }
}
