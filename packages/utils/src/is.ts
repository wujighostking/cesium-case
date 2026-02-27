export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isElement(value: any): value is Element {
  return value instanceof Element
}
