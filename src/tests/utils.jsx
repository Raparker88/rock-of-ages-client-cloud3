import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Custom render function that includes router
export function renderWithRouter(ui, { route = '/' } = {}) {
  // Set up window.location for the test
  window.history.pushState({}, 'Test page', route)
  
  return {
    ...render(ui, { wrapper: BrowserRouter }),
  }
}

// Mock navigate function for useNavigate
export function createMockNavigate() {
  const mockNavigate = vi.fn()
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
      ...actual,
      useNavigate: () => mockNavigate
    }
  })
  return mockNavigate
}

// Helper to create a mock fetch function for testing
export function createMockFetch(responseData, status = 200) {
  return vi.fn().mockImplementation(() => 
    Promise.resolve({
      status,
      json: () => Promise.resolve(responseData)
    })
  )
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))