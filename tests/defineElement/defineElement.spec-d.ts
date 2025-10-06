import { expectTypeOf, it } from 'vitest'
import type { PropType } from '../../src'
import { defineElement } from '../../src'
import { html } from 'lit'

interface TestInterface {
  name: string
  address: string
  birthDate: Date
  isAlive: boolean
}

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

it('defineElement inferred arguments in setup function', () => {
  defineElement({
    name: 'tag-name',
    register: false,
    props: {
      txt: { type: String },
      num: { type: Number },
      dat: { type: Date },
      obj: { type: Object as PropType<TestInterface> },

      special: { type: String as PropType<`ok${string}ok`> },
    },

    setup() {
      expectTypeOf(this.txt).toEqualTypeOf<string>()
      expectTypeOf(this.num).toEqualTypeOf<number>()
      expectTypeOf(this.dat).toEqualTypeOf<Date>()
      expectTypeOf(this.obj).toEqualTypeOf<TestInterface>()

      expectTypeOf(this.special).not.toEqualTypeOf<string>()
      expectTypeOf(this.special).toEqualTypeOf<`ok${string}ok`>()

      return () => html``
    },
  })
})

it('defineElement inferred arguments in render function', () => {
  defineElement({
    name: 'tag-name',
    register: false,
    props: {
      txt: { type: String },
      num: { type: Number },
      dat: { type: Date },
      obj: { type: Object as PropType<TestInterface> },

      special: { type: String as PropType<`ok${string}ok`> },
    },

    render() {
      expectTypeOf(this.txt).toEqualTypeOf<string>()
      expectTypeOf(this.num).toEqualTypeOf<number>()
      expectTypeOf(this.dat).toEqualTypeOf<Date>()
      expectTypeOf(this.obj).toEqualTypeOf<TestInterface>()

      expectTypeOf(this.special).not.toEqualTypeOf<string>()
      expectTypeOf(this.special).toEqualTypeOf<`ok${string}ok`>()

      return html``
    },
  })
})
