import { asyncAppend } from 'lit/directives/async-append.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import MarkdownItAsync from 'markdown-it-async'
import anchor from 'markdown-it-anchor'
import { full as emoji } from 'markdown-it-emoji'

const asyncRenderer = MarkdownItAsync({
  async highlight(code, lang) {
    const { codeToHtml } = await import('shiki')
    return codeToHtml(code, { lang, theme: 'material-theme-ocean' })
  },
})
  .use(anchor)
  .use(emoji /* , options */)

async function* produce(strings: TemplateStringsArray, ...args: unknown[]) {
  const joined = strings
    .flatMap((s, index) => [s, args[index]])
    .filter(Boolean)
    .join('')

  const html = await asyncRenderer.renderAsync(joined)

  yield unsafeHTML(html)
}

/**
 * use <code> md\`<some markdown>\`</code> to render Markdown into a lit-html template.
 */
export function md(strings: TemplateStringsArray, ...args: unknown[]) {
  return asyncAppend(produce(strings, ...args))
}
