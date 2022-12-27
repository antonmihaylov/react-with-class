import type { ClassValue } from 'clsx'
import isFunction from 'lodash/fp/isFunction'
import isObject from 'lodash/fp/isObject'
import type { ComponentPropsWithoutRef } from 'react'
import type React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentOrIntrinsic = React.ComponentType<any> | keyof JSX.IntrinsicElements

type ExtractProps<T extends ComponentOrIntrinsic> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : ComponentPropsWithoutRef<T>

type ClassesOrFactory<T extends ComponentOrIntrinsic> =
  | ClassValue
  | Array<ClassValue>
  | ((props: ExtractProps<T>) => ClassValue | Array<ClassValue>)

type PropsOrFactory<P> = ((props: P) => P) | P

function getClassName(obj: unknown) {
  return isObject(obj) && 'className' in obj
    ? (obj as { className?: ClassValue }).className
    : undefined
}

function evaluateClassesOrFactory<T extends ComponentOrIntrinsic>(
  classesOrFactory: ClassesOrFactory<T>,
  props: ExtractProps<T>,
): Array<ClassValue> {
  const arrayOrClasses = isFunction(classesOrFactory) ? classesOrFactory(props) : classesOrFactory
  return Array.isArray(arrayOrClasses) ? arrayOrClasses : [arrayOrClasses]
}

function evaluatePropsOrFactory<P>(propsOrFactory: PropsOrFactory<P>, allProps: P): P {
  return isFunction(propsOrFactory) ? propsOrFactory(allProps) : propsOrFactory
}

export type { ClassesOrFactory, ComponentOrIntrinsic, ExtractProps, PropsOrFactory }
export { getClassName, evaluateClassesOrFactory, evaluatePropsOrFactory }
