import type { ClassValue } from 'clsx'
import isFunction from 'lodash/fp/isFunction'
import isObject from 'lodash/fp/isObject'
import type { ComponentProps } from 'react'

type ComponentOrIntrinsic = React.ComponentType | keyof JSX.IntrinsicElements

type ExtractProps<T extends ComponentOrIntrinsic> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : ComponentProps<T>

type ClassesOrFactory<T extends ComponentOrIntrinsic> =
  | ClassValue
  | Array<ClassValue>
  | ((props: ExtractProps<T>) => ClassValue | Array<ClassValue>)

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

export type { ClassesOrFactory, ComponentOrIntrinsic, ExtractProps }
export { getClassName, evaluateClassesOrFactory }
