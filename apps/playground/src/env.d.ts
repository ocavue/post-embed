/// <reference types="astro/client" />

declare module '*.astro' {
  const component: (props: unknown) => unknown
  export default component
}
