import { expectTypeOf, it } from 'vitest'
import { defineElement } from '../src'
import { html } from 'lit'

it('defineElement arguments', () => {
  expectTypeOf(defineElement).toBeFunction()
  expectTypeOf(defineElement).toBeCallableWith('tag-name', () => html``)
  expectTypeOf(defineElement).toBeCallableWith({ name: 'tag-name' })
  expectTypeOf(defineElement).toBeCallableWith({
    name: 'tag-name',
    render() {},
  })
  expectTypeOf(defineElement).toBeCallableWith({
    name: 'tag-name',
    setup() {},
  })
})

it('defineElement inferred arguments', () => {
  defineElement({
    name: 'tag-name',
    register: false,
    props: {
      txt: { type: String },
      num: { type: Number },
      dat: { type: Date },
    },

    setup() {
      expectTypeOf(this.txt).toEqualTypeOf<string>()
      expectTypeOf(this.num).toEqualTypeOf<number>()
      expectTypeOf(this.dat).toEqualTypeOf<Date>()

      return () => html``
    },
  })
})
