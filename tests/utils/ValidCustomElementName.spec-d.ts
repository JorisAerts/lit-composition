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
  expectTypeOf<ValidCustomElementName>('a-a-a').toExtend<ValidCustomElementName>()
  expectTypeOf<ValidCustomElementName>('a-b-c').toExtend<ValidCustomElementName>()
  expectTypeOf<ValidCustomElementName>('a-b.c').toExtend<ValidCustomElementName>()
  expectTypeOf<ValidCustomElementName>('abc-def-ghi-jkl-mno-pqr-sti-vwx-yz').toExtend<ValidCustomElementName>()
})

it('should contain illegal characters', () => {
  expectTypeOf<ValidatedCustomElementName<'abc->'>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'abc- '>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'abc-<'>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'abc-\t'>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'abc-\r'>>().toExtend<never>()
  expectTypeOf<ValidatedCustomElementName<'abc-\n'>>().toExtend<never>()

  expectTypeOf<ValidatedCustomElementName<'abc-aa'>>().toExtend<string>()
})

it('start with [a-z]', () => {
  // @ts-expect-error tags should start with an alphabetic character
  expectTypeOf<ValidatedCustomElementName<'123-abc'>>().toExtend<never>()
  // @ts-expect-error tags should start with an alphabetic character
  expectTypeOf<ValidatedCustomElementName<'$-ab.c'>>().toExtend<never>()

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
