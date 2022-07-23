# React With Class 😎

Utility methods to create primitive components with a set of classes, props or variants.

- Define easily usable and manageable primitive components
- A great addition to Tailwind and React
- Type-safe
- Supports class composition using [clsx](https://www.npmjs.com/package/clsx)

## Installation

1. Install the package

`npm install react-with-class`

or

`yarn add react-with-class`

or

`pnpm install react-with-class`

## Usage

```js
// The first argument is the component that will get rendered.
// You can use any of the built-in html tags or any custom component, as long as it takes in `className` as a prop.
const Button = withClass('button', {
  // Those classes will always be applied.
  // You can pass any value that clsx allows (which includes strings, string arrays, objects, etc. - check their readme for more info)
  // You can also pass a function that receives the props as argument and returns the classes
  classes: 'text-white font-bold py-2 px-4 rounded flex-1',

  // Those will get applied conditionally, depending on the value of the provided prop - see usage example bellow
  variants: {
    color: {
      danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'border-gray-300  bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    },

    // You can define boolean properties by using `true` or `false` as keys.
    // Anything truthy will pass as true and vice-versa
    isGhost: {
      true: 'bg-opacity-50',
    },
  },

  // Variants that will get applied if no variant props are supplied in a key:value form
  defaultVariants: {
    color: 'primary',
  },

  // Other props that will always be passed down
  otherProps: {
    type: 'button',
  },
})
```

Then use the component everywhere around your app

```jsx
<Button className="ml-2" color="danger" isGhost />
```
