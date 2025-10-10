import { describe, expect, it } from 'vitest'
import { html, LitElement } from 'lit'
import { defineElement } from '../../src'

describe('defineElement', () => {
  it('Test component is a LitElement', () => {
    const component = defineElement({
      name: 'test-defined',
      props: {
        test: { type: String },
        test2: { type: Object as unknown as ReturnType<typeof defineElement> },
      },
      render() {
        return html`<div>ok</div>`
      },
    })

    expect(component.prototype).toBeInstanceOf(LitElement)
  })
})
