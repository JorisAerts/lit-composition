import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import markdownit from 'markdown-it'

const renderer = markdownit()

export function md(strings: TemplateStringsArray, ...args: unknown[]) {
  const joined = strings
    .flatMap((s, index) => [s, args[index]])
    .filter(Boolean)
    .join('')

  return unsafeHTML(renderer.render(joined))
}
