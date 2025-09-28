import { mount } from 'cypress-ct-lit'

Cypress.Commands.add('mount' as const, mount)

globalThis.litIssuedWarnings ??= new Set()
;(globalThis.litIssuedWarnings as Set<string>)?.add(
  'Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.'
)
