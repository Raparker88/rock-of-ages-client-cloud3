import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { RockForm } from './RockForm'
import { renderWithRouter } from '../tests/utils'
import { mockTypes } from '../tests/mocks/handlers'
import userEvent from '@testing-library/user-event'

// Mock navigate function
const mockNavigate = vi.fn()

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('RockForm Component', () => {
  // Mock fetchRocks function
  const mockFetchRocks = vi.fn()
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock fetch to return types
    window.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/types')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTypes)
        })
      }
      
      // For POST requests to /rocks
      return Promise.resolve({
        status: 201,
        json: () => Promise.resolve({ id: 999 })
      })
    })
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify({ token: 'test-token' })),
      },
      writable: true
    })
  })

  it('renders the form with initial values', async () => {
    // Render the component
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)
    
    // Check if the form title is displayed
    expect(screen.getByText('Collect a Rock')).toBeInTheDocument()
    
    // Check if form fields are present
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Weight in kg:')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    
    // Check if the submit button is present
    expect(screen.getByText('Collect Rock')).toBeInTheDocument()
    
    // Wait for types to be fetched
    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/types'),
        expect.any(Object)
      )
    })
  })

  it('updates form values when user inputs data', async () => {
    // Setup userEvent
    const user = userEvent.setup()
    
    // Render the component
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)
    
    // Get form inputs
    const nameInput = screen.getByLabelText('Name:')
    const weightInput = screen.getByLabelText('Weight in kg:')
    const typeSelect = screen.getByLabelText('Type')
    
    // Fill the form
    await user.type(nameInput, 'Granite')
    await user.clear(weightInput)
    await user.type(weightInput, '5.2')
    
    // Wait for types to load
    await waitFor(() => {
      expect(typeSelect.options.length).toBeGreaterThan(1)
    })
    
    // Select a type
    fireEvent.change(typeSelect, { target: { value: '1' } })
    
    // Check if values were updated
    expect(nameInput.value).toBe('Granite')
    expect(weightInput.value).toBe('5.2')
    expect(typeSelect.value).toBe('1')
  })

  it('submits the form with correct data', async () => {
    // Setup userEvent
    const user = userEvent.setup()
    
    // Render the component
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)
    
    // Get form inputs
    const nameInput = screen.getByLabelText('Name:')
    const weightInput = screen.getByLabelText('Weight in kg:')
    const typeSelect = screen.getByLabelText('Type')
    const submitButton = screen.getByText('Collect Rock')
    
    // Fill the form
    await user.type(nameInput, 'Granite')
    await user.clear(weightInput)
    await user.type(weightInput, '5.2')
    
    // Wait for types to load
    await waitFor(() => {
      expect(typeSelect.options.length).toBeGreaterThan(1)
    })
    
    // Select a type
    fireEvent.change(typeSelect, { target: { value: '1' } })
    
    // Submit the form
    await user.click(submitButton)
    
    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rocks'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Token test-token'
          }),
          body: expect.stringContaining('"name":"Granite"')
        })
      )
      
      // Check if fetchRocks was called
      expect(mockFetchRocks).toHaveBeenCalled()
      
      // Check if navigate was called to redirect
      expect(mockNavigate).toHaveBeenCalledWith('/allrocks')
    })
  })
})