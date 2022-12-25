import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import defaults from 'lodash/fp/defaults'
import entries from 'lodash/fp/entries'
import flow from 'lodash/fp/flow'
import isObject from 'lodash/fp/isObject'
import keys from 'lodash/fp/keys'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import pickBy from 'lodash/fp/pickBy'
import React, { forwardRef } from 'react'

import { getClassName, evaluateClassesOrFactory, evaluatePropsOrFactory } from './Common'
import type { ClassesOrFactory, ComponentOrIntrinsic, ExtractProps, PropsOrFactory } from './Common'

interface WithClassInput<
  T extends ComponentOrIntrinsic,
  TVariants extends Variants | undefined,
  TDefaults extends Defaults<TVariants> | undefined,
> {
  /**
   * Classes that will always get applied
   */
  classes?: ClassesOrFactory<T>

  /**
   * Variants definition
   */
  variants?: TVariants

  /**
   * Classes that will get applied only if all the specified variants are set.
   * @example To add `text-red-600` when `color` is `danger` and `isGhost` is `true`:
   * compoundVariants: [
   *  {
   *    color: 'danger',
   *    isGhost: true,
   *    className: 'text-red-600'
   *  }
   * ]
   */
  compoundVariants?: CompoundVariants<TVariants>

  /**
   * Variants that will get applied if no variant props are supplied
   */
  defaultVariants?: TDefaults

  /**
   * Other props that will get passed down to the component by default
   */
  otherProps?: PropsOrFactory<ExtractProps<T>>
}

/**
 * Wraps a component and allows conditionally setting different sets of classes depending on a prop.
 * Additionally, all other props are forwarded, and the className from the props is combined with the rest,
 * the ref is forwarded, and you can supply other default props to the component.
 *
 * @example
 * const Action = withClass('button', {
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
 *  compoundVariants: [
 *     {
 *       color: 'danger',
 *       isGhost: true,
 *       className: 'text-red-600'
 *     }
 *  ],
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
  TVariants extends Variants | undefined = undefined,
  TDefaults extends Partial<VariantPropsNoDefaults<TVariants>> | undefined = undefined,
>(component: T, input: WithClassInput<T, TVariants, TDefaults>) {
  const {
    defaultVariants,
    variants,
    otherProps: otherPropsOrFactory,
    classes,
    compoundVariants,
  } = input

  const Component = component as React.ComponentType
  const cleanupProps = omit(keys(variants))
  const evaluateVariants = evaluateVariantsFactory(variants, defaultVariants)
  const evaluateCompoundVariants = evaluateCompoundVariantsFactory(
    compoundVariants,
    defaultVariants,
  )

  const wrapped = forwardRef<
    ExtractRefType<T>,
    Partial<VariantProps<TVariants, TDefaults>> & ExtractProps<T>
  >((props, ref) => {
    const otherProps = otherPropsOrFactory ? evaluatePropsOrFactory(otherPropsOrFactory, props) : {}
    const finalProps = { ...otherProps, ...props } as ExtractProps<T>

    const className = clsx(
      getClassName(otherProps),
      getClassName(props),
      ...evaluateClassesOrFactory(classes, finalProps),
      ...evaluateVariants(finalProps as Record<string, unknown>),
      ...evaluateCompoundVariants(finalProps as Record<string, unknown>),
    )

    const cleanedProps = cleanupProps(finalProps)

    return (
      <Component
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(cleanedProps as any)}
        className={className}
        ref={ref}
      />
    )
  })

  wrapped.displayName = typeof component === 'string' ? component : component.displayName

  return wrapped
}

type Variants = Record<string, Record<string, ClassValue | Array<ClassValue>> | undefined>
type Defaults<TV extends Variants | undefined> = Partial<VariantPropsNoDefaults<TV>> | undefined
type CompoundVariant<TV extends Variants | undefined> = Defaults<TV> & { className?: ClassValue }
type CompoundVariants<TV extends Variants | undefined> = Array<CompoundVariant<TV>>

function evaluateVariantsFactory<TV extends Variants, TD extends Defaults<TV>>(
  variants: TV | undefined,
  defaultVariants?: TD,
) {
  if (!variants) {
    return (): Array<ClassValue> => []
  }

  function getVariantClasses(key: string, value: unknown): ClassValue | Array<ClassValue> {
    const variantObj = variants?.[key]

    if (!variantObj || !isObject(variantObj)) {
      return undefined
    }

    // evaluate boolean in a truthy-falsy way
    if ('true' in variantObj || 'false' in variantObj) {
      value = !!value
    }

    return variantObj[String(value)]
  }

  const isKeyValuePairValid = (value: unknown, key: string): value is string | number | boolean => {
    if (!(key in variants)) {
      return false
    }
    const classes = getVariantClasses(key, value)
    return classes !== undefined && classes !== null
  }

  const pickVariantValues = flow(
    pickBy(isKeyValuePairValid),
    defaults(defaultVariants ?? {}),
    entries,
    map(([key, value]) => getVariantClasses(key, value as string | boolean | number) ?? []),
  )

  return (props: Record<string, unknown>): Array<ClassValue> => pickVariantValues(props)
}

function isCompoundMatch(key: string, value: unknown, props: Record<string, unknown>) {
  if (key === 'className') {
    return false
  }

  if (value === true) {
    return !!props[key]
  }

  if (value === false) {
    return !props[key]
  }

  return props[key] === value
}

function evaluateCompoundVariantsFactory<TV extends Variants>(
  compoundVariants: CompoundVariants<TV> | undefined,
  defaultVariants?: Defaults<TV>,
) {
  if (!compoundVariants) {
    return (): Array<ClassValue> => []
  }

  const getMatches = (props: Record<string, unknown>) =>
    compoundVariants.filter((cv) =>
      Object.entries(cv).every(
        ([key, value]) => key === 'className' || isCompoundMatch(key, value, props),
      ),
    )

  const withDefaults = defaults(defaultVariants ?? {})

  return (props: Record<string, unknown>): Array<ClassValue> => {
    const matches = getMatches(withDefaults(props))
    return matches.map((cv) => cv.className)
  }
}

type ExtractRefType<T extends ComponentOrIntrinsic> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<infer R>,
      unknown
    >
    ? R
    : never
  : unknown

type VariantPropsNoDefaults<TVariants extends Variants | undefined> = TVariants extends
  | undefined
  | never
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : {
      [key in keyof TVariants]: 'true' extends keyof TVariants[key]
        ? boolean
        : 'false' extends keyof TVariants[key]
        ? boolean
        : keyof TVariants[key]
    }

type VariantProps<
  TVariants extends Variants | undefined = undefined,
  TDefaults extends Partial<VariantPropsNoDefaults<TVariants>> | undefined = undefined,
> = TVariants extends undefined | never
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : {
      [key in keyof TDefaults &
        keyof VariantPropsNoDefaults<TVariants>]?: VariantPropsNoDefaults<TVariants>[key]
    } & {
      [key in Exclude<
        keyof VariantPropsNoDefaults<TVariants>,
        keyof TDefaults
      >]: VariantPropsNoDefaults<TVariants>[key]
    }

export type { WithClassInput, Variants, Defaults }
export { withClass }
