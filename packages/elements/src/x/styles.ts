export const xPostStyles = /* css */ `
:host {
  display: block;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

[data-root] {
  all: initial;
  --_color: var(--post-embed-color, light-dark(#25272c, #e9e9ec));
  --_hairline: var(--post-embed-border-color, light-dark(#eaecf0, #34373d));
  --_muted: var(--post-embed-muted-color, light-dark(#6b7078, #a2a5ad));
  --_link: var(--post-embed-link-color, light-dark(#32699f, #9abfea));
  display: block;
  box-sizing: border-box;
  min-width: 0;
  position: relative;
  color-scheme: inherit;
  direction: inherit;
  unicode-bidi: normal;
  font: 400 15px / 1.55 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--_color);
  background: var(--post-embed-background, light-dark(#f6f7f8, #292b30));
  border: 1px solid var(--_hairline);
  border-radius: var(--post-embed-radius, 12px);
  padding: var(--post-embed-padding, 19px 22px);
  overflow-wrap: anywhere;
  text-align: start;
  text-decoration-skip-ink: none;
  -webkit-text-fill-color: currentColor;
  -webkit-user-select: text;
  user-select: text;
}

article,
header,
p,
footer {
  margin: 0;
}

[hidden] {
  display: none !important;
}

a {
  color: var(--_link);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--_link);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Header */
[data-author] {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

[data-avatar] {
  display: block;
  flex: none;
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 50%;
}

[data-avatar][data-shape='square'] {
  border-radius: 5px;
}

[data-avatar][data-shape='hexagon'] {
  clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
}

[data-author-details] {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 8px;
  min-width: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--_muted);
}

[data-author-name] {
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 650;
  color: var(--_color);
}

[data-author-details] > bdi > a {
  color: inherit;
}

/* Body */
[data-reply-to] {
  margin-block-start: 12px;
  font-size: 12px;
  color: var(--_muted);
}

[data-body] {
  margin-block: 12px 0;
  font-size: 15px;
  line-height: 1.55;
}

[data-body] a {
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--_link) 40%, transparent);
  text-underline-offset: 3px;
}

[data-text] {
  white-space: pre-wrap;
}

/* Media */
[data-media] {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
  margin-block-start: 15px;
  border-radius: 8px;
  overflow: hidden;
}

[data-media][data-count='1'] {
  grid-template-columns: minmax(0, 1fr);
}

[data-media-item] {
  min-width: 0;
  overflow: hidden;
}

[data-media-item] > a {
  display: block;
  height: 100%;
}

[data-media-item] img,
[data-media-item] video {
  display: block;
  width: 100%;
  height: auto;
  max-height: 576px;
  object-fit: contain;
  background: color-mix(in srgb, currentColor 6%, transparent);
}

[data-media]:not([data-count='1']) [data-media-item] img {
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

[data-media][data-count='3'] [data-media-item]:first-child {
  grid-row: span 2;
}

[data-media-unavailable],
[data-media-error] {
  padding: 12px 16px;
  color: var(--_muted);
  background: color-mix(in srgb, currentColor 4%, transparent);
}

/* Quoted post */
[data-quoted] {
  margin-block-start: 15px;
  padding: 13px;
  background: light-dark(#fff, #202125);
  border-radius: 8px;
}

[data-quoted] [data-author] {
  gap: 8px;
}

[data-quoted] [data-avatar] {
  width: 22px;
  height: 22px;
}

[data-quoted] [data-author-details] {
  gap: 0 7px;
  font-size: 11px;
}

[data-quoted] [data-author-name] {
  font-size: 12px;
}

[data-quoted] [data-body] {
  margin-block-start: 9px;
  font-size: 14px;
}

[data-quoted] [data-footer] {
  margin-block-start: 9px;
  font-size: 10px;
}

/* Footer */
[data-footer] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 0;
  margin-block-start: 16px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--_muted);
}

[data-footer] > a {
  color: inherit;
}

[data-footer] > [data-edited]::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 3px;
  margin-inline: 7px;
  border-radius: 50%;
  background: currentColor;
  vertical-align: middle;
}

[data-edited] {
  font-style: normal;
}

/* Fallback */
[data-fallback] [data-body] {
  color: var(--_muted);
}
`
