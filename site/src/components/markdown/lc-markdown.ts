import { defineElement } from 'lit-composition'
import { md } from '../../utils/md.ts'
import cssMarkdown from '../../style/markdown.scss?inline'
import { nothing, unsafeCSS } from 'lit'
import { until } from 'lit/directives/until.js'

// TODO: pre-render the markdown

defineElement({
  name: 'lc-md',
  styles: [unsafeCSS(cssMarkdown)],
  props: {
    value: { type: [String, Promise<string>], attribute: false },
  },
  setup() {
    return () =>
      this.value instanceof Promise
        ? until(
            this.value.then((v) => md`${v}`),
            nothing
          )
        : md`${this.value}`
  },
})
