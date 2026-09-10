import { expect, it } from 'vitest'

import { domFactory } from './typed-dom-helper.ts'

it('creates nested content in the supplied document without parsing text as HTML', () => {
  const doc = document.implementation.createHTMLDocument()
  const el = domFactory(doc)
  const label = el('bdi', {}, 'Name')
  const root = el('article', {}, label, [
    ' <img src=x>',
    [null, undefined, false, 0, '\n  Text'],
  ])
  expect(root.ownerDocument).toBe(doc)
  expect(root.firstChild).toBe(label)
  expect(root.querySelector('img')).toBeNull()
  expect(root.textContent).toBe('Name <img src=x>0\n  Text')
  for (const child of root.childNodes) expect(child.ownerDocument).toBe(doc)
})

it('distinguishes missing, boolean, and string attributes', () => {
  const el = domFactory(document)
  const video = el('video', {
    'data-media': '',
    controls: true,
    loop: false,
    poster: undefined,
    width: undefined,
    height: 400,
  })
  expect(video.hasAttribute('data-media')).toBe(true)
  expect(video.controls).toBe(true)
  expect(video.hasAttribute('loop')).toBe(false)
  expect(video.hasAttribute('poster')).toBe(false)
  expect(video.hasAttribute('width')).toBe(false)
  expect(video.height).toBe(400)
  const status = el('span', { 'aria-live': 'off' })
  expect(status.getAttribute('aria-live')).toBe('off')
})
