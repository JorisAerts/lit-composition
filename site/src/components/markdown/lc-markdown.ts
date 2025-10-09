import { defineElement } from 'lit-composition'
import { md } from '../../utils/md.ts'
import cssMarkdown from '../../style/markdown.scss?inline'
import { unsafeCSS } from 'lit'

// TODO: pre-render the markdown

defineElement({
  name: 'lc-md',
  styles: [unsafeCSS(cssMarkdown)],
  props: {
    value: { type: String, attribute: false },
  },
  setup() {
    return () => md`${this.value}`
  },
})
