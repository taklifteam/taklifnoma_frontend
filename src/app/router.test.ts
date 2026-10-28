import { matchRoutes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './router'

function matchedPath(pathname: string): string | undefined {
  return matchRoutes(routes, pathname)?.at(-1)?.route.path
}

describe('routes', () => {
  it('keeps static pages ahead of invitation links', () => {
    expect(matchedPath('/login')).toBe('/login')
    expect(matchedPath('/register')).toBe('/register')
    expect(matchedPath('/')).toBe('/')
    expect(matchedPath('/preview/sochqi-konvert')).toBe('/preview/:templateCode')
  })

  it('sends a one-segment path to the guest page', () => {
    expect(matchedPath('/k7mx2qvd')).toBe('/:slug')
  })

  it('leaves deeper unknown paths to not found', () => {
    expect(matchedPath('/k7mx2qvd/extra')).toBe('*')
  })
})
