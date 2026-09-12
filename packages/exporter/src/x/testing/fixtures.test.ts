import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { extractTweetResults } from '../extract.ts'

import { findViewerKeys, scrubFixture } from './scrub.ts'

const directory = fileURLToPath(new URL('./fixtures/', import.meta.url))
const fixtures = readdirSync(directory)
  .filter((name) => name.endsWith('.json'))
  .map((name) => ({
    name,
    value: JSON.parse(readFileSync(`${directory}${name}`, 'utf8')) as unknown,
  }))

describe('fixtures', () => {
  it('exist', () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  for (const { name, value } of fixtures) {
    it(`${name} carries no viewer-specific keys`, () => {
      expect(findViewerKeys(value)).toEqual([])
    })

    it(`${name} contains at least one tweet`, () => {
      expect(extractTweetResults(value).length).toBeGreaterThan(0)
    })
  }
})

describe('scrubFixture', () => {
  it('removes viewer keys at every depth and keeps the rest', () => {
    const input = {
      legacy: { bookmarked: true, favorited: false, full_text: 'hi' },
      core: {
        user_results: {
          result: {
            relationship_perspectives: { following: true },
            rest_id: '1',
          },
        },
      },
      list: [{ retweeted: true, keep: 1 }],
    }
    expect(scrubFixture(input)).toEqual({
      legacy: { full_text: 'hi' },
      core: { user_results: { result: { rest_id: '1' } } },
      list: [{ keep: 1 }],
    })
    expect(findViewerKeys(input)).toEqual([
      'legacy.bookmarked',
      'legacy.favorited',
      'core.user_results.result.relationship_perspectives',
      'list[0].retweeted',
    ])
  })
})
