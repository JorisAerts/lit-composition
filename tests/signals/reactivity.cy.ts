import { html } from 'lit'
import { defineElement, reactive } from '../../src/signals'
import { signal } from '@lit-labs/signals'

describe('reactivity', () => {
  it('reactive properties', () => {
    const obj = {
      count: signal(0),
      test: () => 'ok',
      primitive: 1000,
      getterCount: 0,
      get getter() {
        return `${++obj.getterCount}`
      },
    }

    defineElement({
      name: 'reactivity-1',
      setup() {
        const reactiveObj = reactive(obj)
        const onClick = () => {
          reactiveObj.count++
          reactiveObj.primitive *= 2
        }
        return () =>
          html` <div>
              <div class="row1">Count: <span>${obj.count.get()} ➔ ${reactiveObj.count}</span></div>
              <div class="row2">Primitive: <span>${obj.primitive} ➔ ${reactiveObj.primitive}</span></div>
              <div class="row3">Test: <span>${obj.test()} ➔ ${reactiveObj.test()}</span></div>
              <div class="row4">Getter: <span>${obj.getter} ➔ ${reactiveObj.getter}</span></div>
            </div>
            <button @click=${onClick}>Click Me</button>`
      },
    })

    // things shouldn't get updated
    cy.then(() => expect(obj.getterCount).to.be.eq(0))

    cy.mount(html` <reactivity-1></reactivity-1> `).as('component')
    cy.get('@component').find('div.row1 span').as('row1').should('exist')
    cy.get('@component').find('div.row2 span').as('row2').should('exist')
    cy.get('@component').find('div.row3 span').as('row3').should('exist')
    cy.get('@component').find('div.row4 span').as('row4').should('exist')
    cy.get('@component').find('button').as('button').should('exist')

    Array.from({ length: 10 }).forEach((_, i) => {
      cy.log(`iteration ${i + 1} of 10`)

      cy.get('@row1').contains(`${i} ➔ ${i}`).should('exist')
      cy.get('@row2')
        .contains(`${1000 * Math.pow(2, i)} ➔ ${1000 * Math.pow(2, i)}`)
        .should('exist')
      cy.get('@row3').contains('ok ➔ ok').should('exist')
      cy.get('@row4')
        .contains(`${(i + 1) * 2} ➔ ${(i + 1) * 2 + 1}`)
        .should('exist')

      // fyi, the first "get" is called by the "reactive" function, so + 1
      cy.then(() => expect(obj.getterCount).to.be.eq((i + 1) * 2 + 1))

      cy.get('@button').click()
    })
  })
})
