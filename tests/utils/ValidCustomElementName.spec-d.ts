import { expectTypeOf, it } from 'vitest'
import type { ValidCustomElementName } from '../../src'
import type { ValidatedCustomElementName } from '../../src/utils/ValidCustomElementName'

it('ValidCustomElementName', () => {
  expectTypeOf<ValidatedCustomElementName<'ok-ok'>>().toExtend<ValidCustomElementName>()
  expectTypeOf<ValidCustomElementName>('ok-ok').toExtend<ValidCustomElementName>()

  // @ts-expect-error 'ok' is not a valid custom element name'
  expectTypeOf<ValidCustomElementName>('ok').toExtend<ValidCustomElementName>()
})

it('should contain a dash', () => {
  // @ts-expect-error tags should contain a dash
  expectTypeOf<ValidatedCustomElementName<'abc'>>().toExtend<never>()
  expectTypeOf<ValidCustomElementName>('a-a').toExtend<ValidCustomElementName>()
})

it('start with [a-z]', () => {
  // @ts-expect-error tags should start with an alphabetic character
  expectTypeOf<ValidatedCustomElementName<'123-abc'>>().toExtend<never>()
  // @ts-expect-error tags should start with an alphabetic character
  expectTypeOf<ValidatedCustomElementName<'$-abc'>>().toExtend<never>()

  expectTypeOf<ValidCustomElementName>('a-ok').toExtend<ValidCustomElementName>()
  expectTypeOf<ValidCustomElementName>('b-ok').toExtend<ValidCustomElementName>()
  expectTypeOf<ValidCustomElementName>('c-ok').toExtend<ValidCustomElementName>()
})

it('Forbidden tag-names should not be used', () => {
  expectTypeOf<ValidatedCustomElementName<'annotation-xml'>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'font-face'>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'annotation-xml2'>>().not.toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'font-face2'>>().not.toExtend<never>()
})
