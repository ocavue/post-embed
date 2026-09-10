type DataAttributes = { [Name in `data-${string}`]?: string }

interface CommonAttributes extends DataAttributes {
  dir?: 'auto' | 'ltr' | 'rtl'
  lang?: string
  title?: string
  hidden?: boolean
  role?: 'status' | 'img'
  'aria-label'?: string
  'aria-live'?: 'off' | 'polite' | 'assertive'
}

interface TagAttributes {
  a: { href: string; target?: '_blank' | '_self'; rel?: string }
  button: { type: 'button' | 'submit' | 'reset'; disabled?: boolean }
  img: {
    src: string
    alt: string
    width?: number
    height?: number
    loading?: 'lazy' | 'eager'
    decoding?: 'async' | 'sync' | 'auto'
    referrerpolicy?: ReferrerPolicy
  }
  video: {
    poster?: string
    controls?: boolean
    loop?: boolean
    playsinline?: boolean
    preload?: 'none' | 'metadata' | 'auto'
    width?: number
    height?: number
  }
  source: { src: string; type?: string }
  time: { datetime: string }
}

type Tag =
  | keyof TagAttributes
  | 'article'
  | 'header'
  | 'footer'
  | 'bdi'
  | 'p'
  | 'span'
  | 'div'
  | 'br'

type Attributes<K extends Tag> = CommonAttributes &
  (K extends keyof TagAttributes ? TagAttributes[K] : unknown)

export type Child =
  Node | string | number | null | undefined | false | readonly Child[]

/**
 * Creates HTML nodes with the attributes used by the post renderers.
 */
export function domFactory(doc: Document) {
  function append(parent: Element, child: Child): void {
    if (child == null || child === false) return
    if (typeof child === 'string' || typeof child === 'number') {
      parent.append(doc.createTextNode(String(child)))
    } else if ('nodeType' in child) {
      parent.append(child)
    } else {
      for (const item of child) append(parent, item)
    }
  }

  // Events and DOM properties are configured explicitly on the returned node.
  return function el<K extends Tag>(
    tag: K,
    attributes: Attributes<NoInfer<K>>,
    ...children: Child[]
  ): HTMLElementTagNameMap[K] {
    const node = doc.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) {
      if (value != null && value !== false) {
        node.setAttribute(name, value === true ? '' : String(value))
      }
    }
    for (const child of children) append(node, child)
    return node
  }
}

export type DOMFactory = ReturnType<typeof domFactory>
