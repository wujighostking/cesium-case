import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { isElement, isString } from '../src'

describe('isString', () => {
  it('returns true for primitive strings', () => {
    expect(isString('hello')).toBe(true)
    expect(isString('')).toBe(true)
  })

  it('returns false for non-strings', () => {
    expect(isString(123 as any)).toBe(false)
    expect(isString({} as any)).toBe(false)
    expect(isString(String('wrapped') as any)).toBe(true)
  })
})

describe('isElement', () => {
  beforeAll(() => {
    class MockElement {}
    vi.stubGlobal('Element', MockElement)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('returns true for Element instances', () => {
    const mockElement = new (globalThis.Element as unknown as { new (): Element })()
    expect(isElement(mockElement)).toBe(true)
  })

  it('returns false for non-elements', () => {
    expect(isElement('div' as unknown as Element)).toBe(false)
    expect(isElement({} as Element)).toBe(false)
  })
})
