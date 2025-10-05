import { html } from 'lit'
import { defineElement } from 'lit-composition'
import litSvg from '../assets/lit.svg'

defineElement({
  name: 'home-page',
  shadowRoot: false,
  setup() {
    return () => html`<img height="100" src="${litSvg}" />`
  },
})
