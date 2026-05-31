import { describe, it, expect } from 'vitest'
import { safeNext } from './safe-redirect'

describe('safeNext', () => {
  it('内部パスはそのまま返す', () => {
    expect(safeNext('/account')).toBe('/account')
    expect(safeNext('/auth/update-password')).toBe('/auth/update-password')
  })

  it('null / undefined / 空文字は / を返す', () => {
    expect(safeNext(null)).toBe('/')
    expect(safeNext(undefined)).toBe('/')
    expect(safeNext('')).toBe('/')
  })

  it('スキーム相対 URL は拒否する', () => {
    expect(safeNext('//evil.com')).toBe('/')
    expect(safeNext('/\\evil.com')).toBe('/')
  })

  it('外部 URL は拒否する', () => {
    expect(safeNext('https://evil.com')).toBe('/')
    expect(safeNext('http://evil.com')).toBe('/')
  })

  it('"/" 始まりでない相対パスは拒否する', () => {
    expect(safeNext('account')).toBe('/')
  })
})
