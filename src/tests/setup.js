import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)

// Set up MSW server for API mocking
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests are done
afterAll(() => server.close())

// Mock environment variables
window.ENV = {
  VITE_API_URL: 'http://localhost:8000'
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
}

// Set up localStorage mock with a default token
localStorageMock.getItem.mockImplementation((key) => {
  if (key === 'rock_token') {
    return JSON.stringify({ token: 'test-token' })
  }
  return null
})

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Silence React error boundary warnings in test output
console.error = vi.fn()