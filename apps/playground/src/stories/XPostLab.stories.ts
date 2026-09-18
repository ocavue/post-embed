import type { PresetName } from '../lab/axes.ts'

import XPostLab from './XPostLab.astro'

type Props = { preset: PresetName }

export default { component: XPostLab }

export const D00Current = { args: { preset: '00-current' } satisfies Props }
export const D01Narrower = { args: { preset: '01-narrower' } satisfies Props }
export const D02Tidy = { args: { preset: '02-tidy' } satisfies Props }
export const D03TidyInline = {
  args: { preset: '03-tidy-inline' } satisfies Props,
}
export const D04Cinema = { args: { preset: '04-cinema' } satisfies Props }
export const D05NoCrop = { args: { preset: '05-no-crop' } satisfies Props }
export const D06Strip = { args: { preset: '06-strip' } satisfies Props }
export const D07SideThumb = {
  args: { preset: '07-side-thumb' } satisfies Props,
}
export const D08LinkPreview = {
  args: { preset: '08-link-preview' } satisfies Props,
}
export const D09PosterTop = {
  args: { preset: '09-poster-top' } satisfies Props,
}
export const D10PosterBottom = {
  args: { preset: '10-poster-bottom' } satisfies Props,
}
export const D11SmallType = {
  args: { preset: '11-small-type' } satisfies Props,
}
export const D12Micro = { args: { preset: '12-micro' } satisfies Props }
export const D13NarrowMedia = {
  args: { preset: '13-narrow-media' } satisfies Props,
}
export const D14Tint = { args: { preset: '14-tint' } satisfies Props }
export const D15Rail = { args: { preset: '15-rail' } satisfies Props }
export const D16Brief = { args: { preset: '16-brief' } satisfies Props }
export const D17TintPoster = {
  args: { preset: '17-tint-poster' } satisfies Props,
}
export const D18SquareCap = {
  args: { preset: '18-square-cap' } satisfies Props,
}
export const D19TintSide = { args: { preset: '19-tint-side' } satisfies Props }
export const D20RailBrief = {
  args: { preset: '20-rail-brief' } satisfies Props,
}
