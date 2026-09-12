import {
  createSignal,
  type HostElement,
  type Signal,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'

/**
 * Loads the snapshot for `url`. Return `undefined` when nothing was found.
 */
export type FetchHandler<T> = (
  url: string,
) => T | undefined | PromiseLike<T | undefined>

export interface FetchProps<T> {
  /**
   * A saved snapshot. When set, it is rendered as is and `url` is not fetched.
   */
  data: T | null
  /**
   * The URL to pass to `onFetch` when `data` is `null`.
   */
  url: string | null
  /**
   * Called with `url` to load the snapshot when `data` is `null`.
   */
  onFetch: FetchHandler<T> | null
}

/** @internal */
export interface FetchState<T> {
  /**
   * The fetched snapshot, or `null` before, during, and after a failed fetch.
   */
  fetched: Signal<T | null>
  pending: Signal<boolean>
}

/**
 * Runs `onFetch(url)` whenever `data` is `null` and both `url` and `onFetch`
 * are set, ignoring results that arrive after the inputs changed or the host
 * disconnected.
 *
 * @internal
 */
export function useFetch<T>(
  host: HostElement,
  props: State<FetchProps<T>>,
  label: string,
): FetchState<T> {
  const fetched = createSignal<T | null>(null)
  const pending = createSignal(false)

  useHostEffect(host, () => {
    const url = props.url.get()
    const onFetch = props.onFetch.get()
    fetched.set(null)
    pending.set(false)
    if (props.data.get() != null || !url || !onFetch) return

    let active = true
    const settle = (value: T | undefined) => {
      if (!active) return
      fetched.set(value ?? null)
      pending.set(false)
    }
    const fail = (error: unknown) => {
      if (!active) return
      console.error(`[post-embed] Failed to fetch ${label}:`, error)
      settle(undefined)
    }

    let result: ReturnType<FetchHandler<T>>
    try {
      result = onFetch(url)
    } catch (error) {
      fail(error)
      return
    }
    if (isPromiseLike(result)) {
      pending.set(true)
      result.then(settle, fail)
    } else {
      settle(result)
    }
    return () => {
      active = false
    }
  })

  return { fetched, pending }
}

function isPromiseLike<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<T>).then === 'function'
  )
}
