import { describe, expect, it } from 'vitest'
import { html, LitElement } from 'lit'
import { defineComponent } from '../src/defineComponent'

describe('defineComponent', () => {
  it('Test component is a LitElement', () => {
    const component = defineComponent({
      name: 'test-defined',
      props: {
        test: { type: String },
        test2: { type: Object as unknown as ReturnType<typeof defineComponent> },
      },
      render() {
        return html`<div>ok</div>`
      },
    })

    expect(component.prototype).toBeInstanceOf(LitElement)
  })
})
