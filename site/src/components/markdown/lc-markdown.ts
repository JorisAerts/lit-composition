import { defineElement } from 'lit-composition'
import { md } from '../../utils/md.ts'
import { ifDefined } from 'lit/directives/if-defined.js'
import cssMarkdown from '../../style/markdown.scss?inline'
import { unsafeCSS } from 'lit'

defineElement({
  name: 'lc-md',
  styles: [unsafeCSS(cssMarkdown)],
  props: {
    value: { type: String, attribute: false },
  },
  setup() {
    return () => ifDefined(md`${this.value}`)
  },
})
