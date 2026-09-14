import el from 'crelt'

import { xPostStyles } from './styles.ts'

export function getXPostRoot(host: HTMLElement): HTMLDivElement {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
  let container = shadow.querySelector<HTMLDivElement>('div[data-root]')
  if (!container) {
    container =
      host.querySelector<HTMLDivElement>(':scope > div[data-root]') ??
      el('div', { 'data-root': '' })
    shadow.append(el('style', {}, xPostStyles), container, el('slot'))
  }
  return container
}
