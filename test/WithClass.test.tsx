import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import React from 'react'
import '@testing-library/jest-dom'

import { withClass } from '../src'

describe('With Class', () => {
  describe('Variants and props', () => {
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

    it('Should render other props', () => {
      render(<Action>Hello</Action>)

      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('type', 'button')
    })

    it('Should render other props with a factory', () => {
      const ActionWithIcon = withClass('button', {
        otherProps: (props) => ({
          children: props.children ?? <span>Pretend this is an icon</span>,
        }),
      })

      render(<ActionWithIcon />)

      const btn = screen.getByRole('button')
      expect(btn).toHaveTextContent('Pretend this is an icon')
    })

    it('Should override the default props factory', () => {
      const ActionWithIcon = withClass('button', {
        otherProps: (props) => ({
          children: props.children ?? <span>Pretend this is an icon</span>,
        }),
      })

      render(<ActionWithIcon>Not icon</ActionWithIcon>)

      const btn = screen.getByRole('button')
      expect(btn).toHaveTextContent('Not icon')
    })
  })

  describe('Compound Variants', () => {
    let Action: ReturnType<typeof createActionComponentWithCompoundVariants>

    beforeAll(() => {
      Action = createActionComponentWithCompoundVariants()
    })

    it('should not render compound variants without the relevant props or defaults', () => {
      render(<Action color="primary" />)

      const btn = screen.getByRole('button')

      expect(btn).toHaveClass('button text-white variant-none', { exact: true })
    })

    it('should render compound variants when the relevant props or defaults are present', () => {
      render(<Action variant="outlined" />)

      const btn = screen.getByRole('button')

      expect(btn).toHaveClass('button text-white bg-indigo-600 border-indigo-600', { exact: true })
    })

    it('should evauluate boolean compound variant props', () => {
      render(<Action variant="regular" isGhost />)

      const btn = screen.getByRole('button')

      expect(btn).toHaveClass('button text-white bg-indigo-300', { exact: true })
    })
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
    otherProps: {
      type: 'button',
    },
  })
}

function createActionComponentWithCompoundVariants() {
  return withClass('button', {
    classes: 'button',
    variants: {
      color: {
        primary: 'text-white',
      },
      isGhost: {
        true: '',
      },
      variant: {
        outlined: '',
        regular: '',
        none: 'variant-none',
      },
    },
    compoundVariants: [
      { color: 'primary', variant: 'outlined', className: 'bg-indigo-600 border-indigo-600' },
      { color: 'primary', variant: 'regular', isGhost: true, className: 'bg-indigo-300' },
    ],
    defaultVariants: { color: 'primary', variant: 'none' },
    otherProps: {
      type: 'button',
    },
  })
}
