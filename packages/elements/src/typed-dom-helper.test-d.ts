import { expectTypeOf, test } from 'vitest'

import { domFactory } from './typed-dom-helper.ts'

test('preserves concrete node types for native DOM APIs', () => {
  const el = domFactory(document)
  expectTypeOf(
    el('video', { controls: true }),
  ).toEqualTypeOf<HTMLVideoElement>()
  expectTypeOf(
    el('button', { type: 'button' }),
  ).toEqualTypeOf<HTMLButtonElement>()
  expectTypeOf(
    el('a', { href: 'https://example.com' }),
  ).toEqualTypeOf<HTMLAnchorElement>()
})

test('checks tag-specific attributes and children', () => {
  const el = domFactory(document)
  // @ts-expect-error Misspelled attribute.
  el('a', { href: 'https://example.com', hreff: 'https://example.com' })
  // @ts-expect-error Attributes cannot widen the tag to an anchor.
  el('div', { href: 'https://example.com' })
  // @ts-expect-error Button types are enumerated.
  el('button', { type: 'invalid' })
  // @ts-expect-error Images require alternative text, including empty text.
  el('img', { src: 'https://example.com/image.png' })
  // @ts-expect-error ARIA attribute names are checked on the object.
  el('span', { 'aria-labl': 'Copy' })
  // @ts-expect-error ARIA attribute values are checked too.
  el('span', { 'aria-live': 'sometimes' })
  // @ts-expect-error Event binding uses native DOM APIs.
  el('button', { type: 'button', onclick: () => {} })
  // @ts-expect-error DOM properties are assigned on the returned node.
  el('video', { muted: true })
  // @ts-expect-error Ordinary objects are not DOM children.
  el('p', {}, { text: 'Hello' })
})
