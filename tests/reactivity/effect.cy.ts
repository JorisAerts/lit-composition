import { html, LitElement } from 'lit'
import type { Effect } from '../../src'
import { computed, defineElement, onConnected, reactive, takeRef, useRef, watch, watchEffect } from '../../src'

describe('useRef', () => {
  it('useRef should be reactive', () => {
    defineElement({
      name: 'test-use-ref-1',
      shadowRoot: false,
      setup() {
        const test = useRef('not-ok')
        onConnected(() => (test.value = 'ok'))
        return () => html`${test.value}`
      },
    })

    cy.mount(html` <test-use-ref-1></test-use-ref-1> `).as('component')
    cy.get('@component').contains('ok').should('exist')
  })

  it('useRef should be reactive (part 2)', () => {
    const buttonId = globalThis.crypto.randomUUID() ?? Math.random().toString(36)
    defineElement({
      name: 'test-use-ref-2',
      shadowRoot: false,
      setup() {
        const test = useRef(0)
        return () => html`<button id="${buttonId}" @click="${() => test.value++}">${test.value}</button>`
      },
    })

    cy.mount(html` <test-use-ref-2></test-use-ref-2> `).as('component')
    cy.get('@component').find(`#${buttonId}`).as('button')

    Array.from({ length: 10 }, (_, i) => i).forEach((clickCount) => {
      cy.get('@component').contains(`${clickCount}`).should('exist')
      cy.get('@button').click()
    })
  })

  it('shared refs among web components', () => {
    //
    const test = useRef(0)
    defineElement(
      'test-shared-ref-1a',
      () => html`<button id="button1" @click="${() => test.value++}">${test.value}</button>`
    )
    defineElement(
      'test-shared-ref-1b',
      () => html`<button id="button2" @click="${() => test.value++}">${test.value}</button>`
    )

    cy.mount(
      html`<div>
        <test-shared-ref-1a></test-shared-ref-1a>
        <test-shared-ref-1b></test-shared-ref-1b>
      </div>`
    ).as('component')

    cy.get('@component').find(`#button1`).as('button1')
    cy.get('@component').find(`#button2`).as('button2')

    cy.get('@button1').contains(`0`).should('exist')
    cy.get('@button2').contains(`0`).should('exist')

    cy.get('@button1').click()
    cy.get('@button1').contains(`1`).should('exist')
    cy.get('@button2').contains(`1`).should('exist')

    cy.get('@button2').click()
    cy.get('@button1').contains(`2`).should('exist')
    cy.get('@button2').contains(`2`).should('exist')
  })

  it("shared refs & computed's among web components", () => {
    //
    const test = useRef(0)
    const comp = computed(() => test.value * 2)
    const comp2 = computed(() => comp.value * 2)
    defineElement(
      'test-shared-ref-2a',
      () => html`<button id="button1" @click="${() => test.value++}">${comp.value}</button>`
    )
    defineElement(
      'test-shared-ref-2b',
      () => html`<button id="button2" @click="${() => test.value++}">${comp2.value}</button>`
    )

    cy.mount(
      html`<div>
        <test-shared-ref-2a></test-shared-ref-2a>
        <test-shared-ref-2b></test-shared-ref-2b>
      </div>`
    ).as('component')

    cy.get('@component').find(`#button1`).as('button1')
    cy.get('@component').find(`#button2`).as('button2')

    cy.get('@button1').contains(`0`).should('exist')
    cy.get('@button2').contains(`0`).should('exist')

    cy.get('@button1').click()
    cy.get('@button1').contains(`2`).should('exist')
    cy.get('@button2').contains(`4`).should('exist')

    cy.get('@button2').click()
    cy.get('@button1').contains(`4`).should('exist')
    cy.get('@button2').contains(`8`).should('exist')
  })
})

describe('takeRef', () => {
  it("take a useRef into a 'regular' Lit element", () => {
    const ref = useRef(123)

    class Tmp extends LitElement {
      static properties = {
        ref: { type: Object },
      }

      declare ref: Effect<unknown>

      constructor() {
        super()
        this.ref = takeRef(this, ref)
      }

      render() {
        return html`<div>${this.ref.value}</div>`
      }
    }
    customElements.define('test-takeref-1', Tmp)

    cy.mount(html` <test-takeref-1></test-takeref-1> `).as('component')
    cy.get('@component').contains('123').should('exist')
  })

  it("take a computed into a 'regular' Lit element", () => {
    const ref = computed(() => 123)

    class Tmp extends LitElement {
      static properties = {
        ref: { type: Object },
      }

      declare ref: Effect<unknown>

      constructor() {
        super()
        this.ref = takeRef(this, ref)
      }

      render() {
        return html`<div>${this.ref.value}</div>`
      }
    }
    customElements.define('test-takeref-computed-1', Tmp)

    cy.mount(html` <test-takeref-computed-1></test-takeref-computed-1> `).as('component')
    cy.get('@component').contains('123').should('exist')
  })
})

describe('computed', () => {
  it('computed should be reactive when a Ref changes', () => {
    defineElement({
      name: 'test-computed-1',
      shadowRoot: false,
      setup() {
        const test = useRef('not-ok')
        const comp = computed(() => `${test.value}-${test.value}`)
        onConnected(() => (test.value = 'ok'))
        return () => html`${comp.value}`
      },
    })

    cy.mount(html` <test-computed-1></test-computed-1> `).as('component')
    cy.get('@component').contains('ok-ok').should('exist')
  })

  it('computed chaining', () => {
    defineElement({
      name: 'test-computed-2',
      shadowRoot: false,
      setup() {
        const test = useRef(1)
        const comp = computed(() => test.value * 2)
        const comp2 = computed(() => comp.value * 4)
        return () => html`result: ${comp2.value}`
      },
    })

    cy.mount(html` <test-computed-2></test-computed-2> `).as('component')
    cy.get('@component').contains('result: 8').should('exist')
  })

  it('computed chaining updates', () => {
    defineElement({
      name: 'test-computed-3',
      shadowRoot: false,
      setup() {
        const test = useRef(1)
        const comp = computed(() => test.value * 2)
        const comp2 = computed(() => comp.value * 4)
        return () =>
          html`<span>${comp2.value}</span>
            <button @click="${() => test.value++}">Increase</button> `
      },
    })

    cy.mount(html` <test-computed-3></test-computed-3> `).as('component')
    cy.get('@component').find('span').as('result')
    cy.get('@component').find('button').as('button')

    cy.get('@result').should('contain', '8')

    cy.get('@button').click()
    cy.get('@result').should('contain', '16')

    cy.get('@button').click()
    cy.get('@result').should('contain', '24')
  })
})

describe('watchEffect', () => {
  it('runs once immediately and re-runs when its deps (Ref) change', () => {
    const calls: number[] = []

    defineElement({
      name: 'test-watch-effect-1',
      shadowRoot: false,
      setup() {
        const count = useRef(0)
        watchEffect(() => {
          // track side-watchEffect executions with the current value
          calls.push(count.value)
        })
        return () => html`<button id="btn" @click="${() => count.value++}">${count.value}</button>`
      },
    })

    cy.mount(html` <test-watch-effect-1></test-watch-effect-1> `).as('component')
    cy.get('@component').find('#btn').as('btn')

    // watchEffect runs immediately with initial value 0
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([0])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run with updated value 1
      expect(calls).to.deep.equal([0, 1])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run again with updated value 2
      expect(calls).to.deep.equal([0, 1, 2])
    })
  })

  it('tracks multiple refs used inside the same watchEffect', () => {
    const snapshots: [number, number][] = []

    defineElement({
      name: 'test-watch-effect-2',
      shadowRoot: false,
      setup() {
        const a = useRef(1)
        const b = useRef(10)
        watchEffect(() => {
          snapshots.push([a.value, b.value])
        })
        return () => html`
          <button id="a" @click="${() => a.value++}">a:${a.value}</button>
          <button id="b" @click="${() => b.value++}">b:${b.value}</button>
        `
      },
    })

    cy.mount(html` <test-watch-effect-2></test-watch-effect-2> `).as('component')
    cy.get('@component').find('#a').as('btnA')
    cy.get('@component').find('#b').as('btnB')

    cy.get('@component').then(() => {
      expect(snapshots).to.deep.equal([[1, 10]])
    })

    cy.get('@btnA').click()
    cy.get('@component').then(() => {
      expect(snapshots).to.deep.equal([
        [1, 10], // initial
        [2, 10], // a changed
      ])
    })

    cy.get('@btnB').click()
    cy.get('@component').then(() => {
      expect(snapshots).to.deep.equal([
        [1, 10],
        [2, 10],
        [2, 11], // b changed
      ])
    })
  })

  it('watchEffect reactivity through computed chains', () => {
    const seen: number[] = []

    defineElement({
      name: 'test-watch-effect-3',
      shadowRoot: false,
      setup() {
        const base = useRef(2)
        const double = computed(() => base.value * 2)
        const quadruple = computed(() => double.value * 2)
        watchEffect(() => {
          // should re-run when base changes, via computed chain
          seen.push(quadruple.value)
        })
        return () => html`<button id="inc" @click="${() => base.value++}">${quadruple.value}</button>`
      },
    })

    cy.mount(html` <test-watch-effect-3></test-watch-effect-3> `).as('component')
    cy.get('@component').find('#inc').as('inc')

    cy.get('@component').then(() => {
      expect(seen).to.deep.equal([8]) // 2 -> 4 -> 8
    })

    cy.get('@inc').click()
    cy.get('@component').then(() => {
      expect(seen).to.deep.equal([8, 12]) // 3 -> 6 -> 12
    })

    cy.get('@inc').click()
    cy.get('@component').then(() => {
      expect(seen).to.deep.equal([8, 12, 16]) // 4 -> 8 -> 16
    })
  })

  it('multiple effects respond independently to the same Ref', () => {
    const e1: number[] = []
    const e2: number[] = []

    defineElement({
      name: 'test-watch-effect-4',
      shadowRoot: false,
      setup() {
        const n = useRef(0)
        watchEffect(() => e1.push(n.value))
        watchEffect(() => e2.push(n.value * 10))
        return () => html`<button id="go" @click="${() => n.value++}">${n.value}</button>`
      },
    })

    cy.mount(html` <test-watch-effect-4></test-watch-effect-4> `).as('component')
    cy.get('@component').find('#go').as('go')

    cy.get('@component').then(() => {
      expect(e1).to.deep.equal([0])
      expect(e2).to.deep.equal([0])
    })

    cy.get('@go').click()
    cy.get('@component').then(() => {
      expect(e1).to.deep.equal([0, 1])
      expect(e2).to.deep.equal([0, 10])
    })
  })
})

describe('watch', () => {
  it('watch(ref1, ...) behaves correctly ', () => {
    const calls: number[] = []

    defineElement({
      name: 'test-watch-1',
      shadowRoot: false,
      setup() {
        const count = useRef(0)
        watch(count, () => calls.push(count.value))
        return () => html`<button id="btn" @click="${() => count.value++}">${count.value}</button>`
      },
    })

    cy.mount(html` <test-watch-1></test-watch-1> `).as('component')
    cy.get('@component').find('#btn').as('btn')

    // watchEffect runs immediately with initial value 0
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run with updated value 1
      expect(calls).to.deep.equal([1])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run again with updated value 2
      expect(calls).to.deep.equal([1, 2])
    })
  })

  it('watch(ref1, ..., { immediate: true }) behaves correctly', () => {
    const calls: number[] = []

    defineElement({
      name: 'test-watch-2',
      shadowRoot: false,
      setup() {
        const count = useRef(0)
        watch(count, () => calls.push(count.value), { immediate: true })
        return () => html`<button id="btn" @click="${() => count.value++}">${count.value}</button>`
      },
    })

    cy.mount(html` <test-watch-2></test-watch-2> `).as('component')
    cy.get('@component').find('#btn').as('btn')

    // watchEffect runs immediately with initial value 0
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([0])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run with updated value 1
      expect(calls).to.deep.equal([0, 1])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run again with updated value 2
      expect(calls).to.deep.equal([0, 1, 2])
    })
  })

  it('watch([ref1, ref2], ...) behaves correctly with multiple refs ', () => {
    const calls: number[][] = []

    defineElement({
      name: 'test-watch-3',
      shadowRoot: false,
      setup() {
        const count = useRef(0)
        const count2 = useRef(0)
        watch([count, count2], () => calls.push([count.value, count2.value]))
        return () => html`
          <button id="btn" @click="${() => count.value++}">${count.value}</button>
          <button id="btn2" @click="${() => count2.value++}">${count2.value}</button>
        `
      },
    })

    cy.mount(html` <test-watch-3></test-watch-3> `).as('component')
    cy.get('@component').find('#btn').as('btn')
    cy.get('@component').find('#btn2').as('btn2')

    // watchEffect runs immediately with initial value 0
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run with updated value 1
      expect(calls).to.deep.equal([[1, 0]])
    })

    cy.get('@btn2').click()
    cy.get('@component').then(() => {
      // watchEffect should re-run again with updated value 2
      expect(calls).to.deep.equal([
        [1, 0],
        [1, 1],
      ])
    })
  })

  it('watch(() => reactive1.value, ...) behaves correctly', () => {
    const calls: number[] = []

    defineElement({
      name: 'test-watch-4',
      shadowRoot: false,
      setup() {
        const count = { count: useRef(0) }
        const r = reactive(count)
        watch(
          () => r.count,
          () => calls.push(r.count)
        )
        return () => html`<button id="btn" @click="${() => r.count++}">${r.count}</button>`
      },
    })

    cy.mount(html` <test-watch-4></test-watch-4> `).as('component')
    cy.get('@component').find('#btn').as('btn')

    // watchEffect runs immediately with initial value 0
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([1])
    })

    cy.get('@btn').click()
    cy.get('@component').then(() => {
      expect(calls).to.deep.equal([1, 2])
    })
  })
})
