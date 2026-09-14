import { afterEach, beforeAll, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { createPhoto, createPost } from './testing/fixtures.ts'

import { registerXPost } from './index.ts'

beforeAll(() => registerXPost())
afterEach(() => document.body.replaceChildren())

it('isolates text, links, avatars, media, and quotes from page CSS', async () => {
  const wrapper = document.createElement('div')
  const element = document.createElement('post-embed-x-post')
  const snapshot = createPost('Isolated text')
  snapshot.author.avatar = createPhoto().url
  snapshot.body.push({
    type: 'link',
    text: 'Body link',
    url: 'https://example.com',
  })
  snapshot.media = [createPhoto()]
  snapshot.quote = createPost('Quoted text')
  element.data = snapshot
  element.dataset.testid = 'isolated'
  wrapper.append(element)
  document.body.append(wrapper)
  await expect
    .element(
      page.getByTestId('isolated').getByText('Isolated text', { exact: false }),
    )
    .toBeVisible()
  const parts = element.shadowRoot!.querySelectorAll<HTMLElement>(
    '[data-root], [data-body], [data-avatar], [data-media] img, [data-quoted], a',
  )
  const readStyles = () => {
    return Array.from(parts, (part) => {
      const style = getComputedStyle(part)
      return [
        style.font,
        style.color,
        style.margin,
        style.padding,
        style.width,
        style.height,
        style.textTransform,
        style.letterSpacing,
        style.textDecorationLine,
      ]
    })
  }
  const before = readStyles()
  const stylesheet = document.createElement('style')
  stylesheet.textContent = `
    .hostile { font: italic 32px / 3 Georgia; color: magenta; letter-spacing: 8px; text-transform: uppercase; }
    .hostile * { --_color: red; --_muted: red; --_hairline: red; --_link: red; }
    .hostile p, .hostile article, .hostile header, .hostile footer { margin: 60px !important; padding: 40px !important; }
    .hostile a { color: red !important; text-decoration: underline wavy !important; }
    .hostile img { width: 200px !important; height: 10px !important; }
  `
  document.body.append(stylesheet)
  wrapper.className = 'hostile'
  expect(readStyles()).toEqual(before)
  expect(getComputedStyle(parts[0]).borderRadius).toBe('12px')
  expect(getComputedStyle(parts[0]).borderTopWidth).toBe('1px')
  expect(
    getComputedStyle(element.shadowRoot!.querySelector('[data-avatar]')!).width,
  ).toBe('28px')
})

it('follows the color scheme and explicit public theme variables', async () => {
  const wrapper = document.createElement('div')
  wrapper.style.colorScheme = 'light'
  const element = document.createElement('post-embed-x-post')
  element.data = createPost('Themed text')
  element.dataset.testid = 'themed'
  wrapper.append(element)
  document.body.append(wrapper)
  await expect
    .element(page.getByTestId('themed').getByText('Themed text'))
    .toBeVisible()
  const root = element.shadowRoot!.querySelector('[data-root]')!
  expect(getComputedStyle(root).backgroundColor).toBe('rgb(246, 247, 248)')
  wrapper.style.colorScheme = 'dark'
  expect(getComputedStyle(root).backgroundColor).toBe('rgb(41, 43, 48)')
  wrapper.style.setProperty('--post-embed-background', 'rgb(1, 2, 3)')
  wrapper.style.setProperty('--post-embed-color', 'rgb(240, 241, 242)')
  wrapper.style.setProperty('--post-embed-border-color', 'rgb(50, 51, 52)')
  wrapper.style.setProperty('--post-embed-radius', '8px')
  wrapper.style.setProperty('--post-embed-padding', '10px')
  wrapper.style.setProperty('--post-embed-muted-color', 'rgb(120, 121, 122)')
  wrapper.style.setProperty('--post-embed-link-color', 'rgb(80, 81, 82)')
  expect(getComputedStyle(root).backgroundColor).toBe('rgb(1, 2, 3)')
  expect(getComputedStyle(root).color).toBe('rgb(240, 241, 242)')
  expect(getComputedStyle(root).borderTopColor).toBe('rgb(50, 51, 52)')
  expect(getComputedStyle(root).borderRadius).toBe('8px')
  expect(getComputedStyle(root).padding).toBe('10px')
  expect(
    getComputedStyle(element.shadowRoot!.querySelector('[data-footer]')!).color,
  ).toBe('rgb(120, 121, 122)')
  expect(
    getComputedStyle(element.shadowRoot!.querySelector('[data-root]')!)
      .getPropertyValue('--_link')
      .trim(),
  ).toBe('rgb(80, 81, 82)')
})
