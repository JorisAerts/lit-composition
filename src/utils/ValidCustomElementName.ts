type AlphaLowercase =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

export type ForbiddenCustomElementNames =
  | 'annotation-xml'
  | 'color-profile'
  | 'font-face'
  | 'font-face-src'
  | 'font-face-uri'
  | 'font-face-format'
  | 'font-face-name'
  | 'missing-glyph'

type FirstCharacter = AlphaLowercase

type IllegalCharacter = '<' | '>' | '/' | '\r' | '\t' | '\n' | '\f' | '\0' | '\u0020'

/**
 * A very basic validator for custom element names.
 */
export type ValidCustomElementName = `${Lowercase<`${FirstCharacter}${string}-${string}`>}`

export type ValidatedCustomElementName<Name extends ValidCustomElementName> = Name extends ForbiddenCustomElementNames
  ? never
  : Name extends `${string}${IllegalCharacter}${string}`
    ? never
    : Name
