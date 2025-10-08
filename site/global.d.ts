declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.json' {
  const value: unknown
  export default value
}

declare module '*.scss' {
  const content: Record<string, string>
  export = content
}

declare module '*.md' {
  const src: string
  export default src
}
