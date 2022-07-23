import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import defaults from 'lodash/fp/defaults'
import entries from 'lodash/fp/entries'
import flow from 'lodash/fp/flow'
import isBoolean from 'lodash/fp/isBoolean'
import isNumber from 'lodash/fp/isNumber'
import isObject from 'lodash/fp/isObject'
import isString from 'lodash/fp/isString'
import keys from 'lodash/fp/keys'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import pickBy from 'lodash/fp/pickBy'
import type {
  ForwardRefExoticComponent,
  PropsWithChildren,
  PropsWithoutRef,
  RefAttributes,
} from 'react'
import React, { forwardRef } from 'react'

import { getClassName, evaluateClassesOrFactory } from './Common'
import type { ClassesOrFactory, ComponentOrIntrinsic, ExtractProps } from './Common'

interface WithClassVariantsInput<
  T extends ComponentOrIntrinsic,
  TVariants extends Variants,
  TDefaults extends Defaults<TVariants>,
> {
  /**
   * Classes that will always get applied
   */
  classes?: ClassesOrFactory<T>

  /**
   * Variants definition
   */
  variants: TVariants

  /**
   * Variants that will get applied if no variant props are supplied
   */
  defaultVariants?: TDefaults

  /**
   * Other props that will get passed down to the component by default
   */
  otherProps?: ExtractProps<T>
}

/**
 * Wraps a component and allows conditionally setting different sets of classes depending on a prop.
 * Additionally, all other props are forwarded, and the className from the props is combined with the rest,
 * the ref is forwarded and you can supply other default props to the component.
 *
 * @example
 * const Action = withClassVariants('button', {
 *  classes: 'button flex-1',
 *  variants: {
 *    color: {
 *      danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
 *      primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
 *      secondary: 'border-gray-300  bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
 *    },
 *    isGhost: {
 *      true: 'opacity-50'
 *    }
 *  },
 *  defaultVariants: { color: 'primary', },
 * })
 * ...
 * <Action color="danger" isGhost />
 *
 * @param component
 * @param input
 * @returns
 */
function withClass<
  T extends ComponentOrIntrinsic,
  TVariants extends Variants,
  TDefaults extends Partial<VariantPropsNoDefaults<TVariants>> | undefined,
>(
  component: T,
  input: WithClassVariantsInput<T, TVariants, TDefaults>,
): ForwardRefExoticComponent<
  PropsWithoutRef<WrappedProps<T, TVariants, TDefaults>> & RefAttributes<T>
> {
  const { defaultVariants, variants, otherProps, classes } = input

  const Component = component as React.ComponentType
  const cleanupProps = omit(keys(variants))
  const evaluateVariants = evaluateVariantsFactory(variants, defaultVariants)

  const wrapped = forwardRef<T, WrappedProps<T, TVariants, TDefaults>>(
    ({ children, ...props }, ref) => {
      const finalProps = { ...otherProps, ...props } as ExtractProps<T>

      const className = clsx(
        getClassName(otherProps),
        getClassName(props),
        ...evaluateClassesOrFactory(classes, finalProps),
        ...evaluateVariants(finalProps as Record<string, unknown>),
      )

      const cleanedProps = cleanupProps(finalProps)

      return (
        <Component
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(cleanedProps as any)}
          className={className}
          ref={ref}
        >
          {children}
        </Component>
      )
    },
  )

  wrapped.displayName = typeof component === 'string' ? component : component.displayName
  Object.assign(wrapped, component)

  return wrapped
}

type Variants = Record<string, Record<string, ClassValue | Array<ClassValue>> | undefined>
type Defaults<TV extends Variants> = Partial<VariantPropsNoDefaults<TV>> | undefined

function evaluateVariantsFactory<TV extends Variants, TD extends Defaults<TV>>(
  variants: TV,
  defaultVariants?: TD,
) {
  function getVariantClasses(
    key: string,
    value: string | boolean | number,
  ): ClassValue | Array<ClassValue> {
    const variantObj = variants[key]

    if (!variantObj || !isObject(variantObj)) {
      return undefined
    }

    // evaluate boolean in a truthy-falsy way
    if ('true' in variantObj || 'false' in variantObj) {
      value = !!value
    }

    return variantObj[String(value)]
  }

  const isKeyValuePairValid = (value: unknown, key: string): value is string | number | boolean =>
    key in variants &&
    (isBoolean(value) || isString(value) || isNumber(value)) &&
    !!getVariantClasses(key, value)

  const pickVariantValues = flow(
    pickBy(isKeyValuePairValid),
    defaults(defaultVariants ?? {}),
    entries,
    map(([key, value]) => getVariantClasses(key, value as string | boolean | number) ?? []),
  )

  return (props: Record<string, unknown>): Array<ClassValue> => pickVariantValues(props)
}

type WrappedProps<
  T extends ComponentOrIntrinsic,
  TVariants extends Variants,
  TDefaults,
> = PropsWithChildren<VariantProps<TVariants, TDefaults> & ExtractProps<T>>

type VariantPropsNoDefaults<TVariants extends Variants> = {
  [key in keyof TVariants]: 'true' extends keyof TVariants[key]
    ? boolean
    : 'false' extends keyof TVariants[key]
    ? boolean
    : keyof TVariants[key]
}

type VariantProps<
  TVariants extends Variants,
  TDefaults extends Partial<VariantPropsNoDefaults<TVariants>> | undefined,
> = {
  [key in keyof TDefaults &
    keyof VariantPropsNoDefaults<TVariants>]?: VariantPropsNoDefaults<TVariants>[key]
} & {
  [key in Exclude<
    keyof VariantPropsNoDefaults<TVariants>,
    keyof TDefaults
  >]: VariantPropsNoDefaults<TVariants>[key]
}

export type { WrappedProps, WithClassVariantsInput, Variants, Defaults }
export { withClass }
