import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import React from 'react'
import '@testing-library/jest-dom'

import { withClass } from '../src'

describe('With Class', () => {
  let Action: ReturnType<typeof createActionComponent>

  beforeAll(() => {
    Action = createActionComponent()
  })

  it('Should render the component with default classes', () => {
    render(<Action>Hello</Action>)

    const btn = screen.getByRole('button')

    expect(btn).toHaveTextContent('Hello')
    expect(btn).toHaveClass('button bg-indigo-600', { exact: true })
  })

  it('Should render isGhost variant classes if isGhost is true', () => {
    render(<Action isGhost>Hello</Action>)

    const btn = screen.getByRole('button')

    expect(btn).toHaveClass('button bg-indigo-600 opacity-50', { exact: true })
  })

  it('Should not render isGhost variant classes if isGhost is false', () => {
    render(<Action isGhost={false}>Hello</Action>)

    const btn = screen.getByRole('button')

    expect(btn).toHaveClass('button bg-indigo-600', { exact: true })
  })

  it('Should not render isGhost variant classes if isGhost is falsy', () => {
    render(<Action isGhost={null as unknown as boolean}>Hello</Action>)

    const btn = screen.getByRole('button')

    expect(btn).toHaveClass('button bg-indigo-600', { exact: true })
  })

  it('Should not render isGhost variant classes if isGhost is truthy', () => {
    render(<Action isGhost={{} as unknown as boolean}>Hello</Action>)

    const btn = screen.getByRole('button')

    expect(btn).toHaveClass('button bg-indigo-600 opacity-50', { exact: true })
  })

  it('Should render variant classes if a prop is provided', () => {
    render(<Action color="danger">Hello</Action>)

    const btn = screen.getByRole('button')

    expect(btn).toHaveClass('button bg-red-600', { exact: true })
  })

  it('Should render multiple variant classes if props are provided', () => {
    render(
      <Action color="secondary" isGhost>
        Hello
      </Action>,
    )

    const btn = screen.getByRole('button')

    expect(btn).toHaveClass('button bg-gray-300 opacity-50', { exact: true })
  })

  it('Should allow children nodes', () => {
    const child: ReactNode = <div>Hello world</div>

    render(
      <Action color="secondary" isGhost>
        {child}
      </Action>,
    )

    const btn = screen.getByRole('button')
    expect(btn).toHaveTextContent('Hello world')
  })
})

function createActionComponent() {
  return withClass('button', {
    classes: 'button',
    variants: {
      color: {
        danger: 'bg-red-600',
        primary: 'bg-indigo-600',
        secondary: 'bg-gray-300',
      },
      isGhost: {
        true: 'opacity-50',
      },
    },
    defaultVariants: { color: 'primary' },
  })
}
