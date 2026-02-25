import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { RockList } from './RockList'
import { renderWithRouter } from '../tests/utils'
import { mockRocks } from '../tests/mocks/handlers'

describe('RockList Component', () => {
  // Mock fetch function
  const mockFetchRocks = vi.fn()
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage to return a token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify({ token: 'test-token' })),
      },
      writable: true
    })
  })

  it('renders loading state when no rocks are provided', () => {
    // Render with no rocks
    renderWithRouter(<RockList rocks={[]} fetchRocks={mockFetchRocks} showAll={true} />)
    
    // Check if loading message is displayed
    expect(screen.getByText('Loading Rocks...')).toBeInTheDocument()
    
    // Verify fetchRocks was called
    expect(mockFetchRocks).toHaveBeenCalledWith(true)
  })

  it('renders a list of rocks when provided', () => {
    // Render with mock rocks
    renderWithRouter(<RockList rocks={mockRocks} fetchRocks={mockFetchRocks} showAll={true} />)
    
    // Check if the component title is displayed
    expect(screen.getByText('Rock List')).toBeInTheDocument()
    
    // Check if at least one rock is displayed
    expect(screen.getByText(`${mockRocks[0].name} (${mockRocks[0].type.label})`)).toBeInTheDocument()
    
    // Check if the collection text is present (using getAllByText since there are multiple matches)
    expect(screen.getAllByText(/In the collection of/i).length).toBeGreaterThan(0)
    
    // Verify fetchRocks was called
    expect(mockFetchRocks).toHaveBeenCalledWith(true)
  })

  it('does not show delete buttons when showAll is true', () => {
    // Render with showAll=true
    renderWithRouter(<RockList rocks={mockRocks} fetchRocks={mockFetchRocks} showAll={true} />)
    
    // Check that no delete buttons are present
    const deleteButtons = screen.queryAllByText('Delete')
    expect(deleteButtons.length).toBe(0)
  })

  it('shows delete buttons when showAll is false', () => {
    // Render with showAll=false
    renderWithRouter(<RockList rocks={mockRocks} fetchRocks={mockFetchRocks} showAll={false} />)
    
    // Check that delete buttons are present
    const deleteButtons = screen.getAllByText('Delete')
    expect(deleteButtons.length).toBe(mockRocks.length)
  })

  it('calls fetch with DELETE when delete button is clicked', async () => {
    // Mock the global fetch function
    window.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        status: 204
      })
    )

    // Render with showAll=false to show delete buttons
    renderWithRouter(<RockList rocks={mockRocks} fetchRocks={mockFetchRocks} showAll={false} />)
    
    // Click the first delete button
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Verify fetch was called with the correct arguments
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/rocks/${mockRocks[0].id}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Token test-token'
          })
        })
      )
      
      // Verify fetchRocks was called again after deletion
      expect(mockFetchRocks).toHaveBeenCalledTimes(2)
    })
  })

  it('fetches rocks with showAll=false when showAll prop is false', () => {
    // Render with showAll=false
    renderWithRouter(<RockList rocks={mockRocks} fetchRocks={mockFetchRocks} showAll={false} />)
    
    // Verify fetchRocks was called with false
    expect(mockFetchRocks).toHaveBeenCalledWith(false)
  })
})