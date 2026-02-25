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

// Mock ImageUpload so it doesn't try to make real fetch calls in tests
vi.mock('./ImageUpload', () => ({
  ImageUpload: ({ onUploadComplete }) => (
    <div data-testid="image-upload">
      <button onClick={() => onUploadComplete(999)}>Mock Upload</button>
    </div>
  )
}))

describe('RockForm Component', () => {
  const mockFetchRocks = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    window.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/types')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTypes)
        })
      }
      // POST to /rocks
      return Promise.resolve({
        status: 201,
        json: () => Promise.resolve({ id: 999 })
      })
    })

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => JSON.stringify({ token: 'test-token' })),
      },
      writable: true
    })
  })

  it('renders the form with initial values', async () => {
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)

    expect(screen.getByText('Collect a Rock')).toBeInTheDocument()
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Weight in kg:')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    expect(screen.getByText('Collect Rock')).toBeInTheDocument()

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/types'),
        expect.any(Object)
      )
    })
  })

  it('updates form values when user inputs data', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)

    const nameInput = screen.getByLabelText('Name:')
    const weightInput = screen.getByLabelText('Weight in kg:')
    const typeSelect = screen.getByLabelText('Type')

    await user.type(nameInput, 'Granite')
    await user.clear(weightInput)
    await user.type(weightInput, '5.2')

    await waitFor(() => {
      expect(typeSelect.options.length).toBeGreaterThan(1)
    })

    fireEvent.change(typeSelect, { target: { value: '1' } })

    expect(nameInput.value).toBe('Granite')
    expect(weightInput.value).toBe('5.2')
    expect(typeSelect.value).toBe('1')
  })

  it('submits the form and shows image upload section', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)

    const nameInput = screen.getByLabelText('Name:')
    const weightInput = screen.getByLabelText('Weight in kg:')
    const typeSelect = screen.getByLabelText('Type')

    await user.type(nameInput, 'Granite')
    await user.clear(weightInput)
    await user.type(weightInput, '5.2')

    await waitFor(() => {
      expect(typeSelect.options.length).toBeGreaterThan(1)
    })

    fireEvent.change(typeSelect, { target: { value: '1' } })

    await user.click(screen.getByText('Collect Rock'))

    // Verify POST was made with correct data
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
    })

    // After POST, the form hides the submit button and shows the image upload section
    await waitFor(() => {
      expect(screen.queryByText('Collect Rock')).not.toBeInTheDocument()
      expect(screen.getByText('Rock saved! Add an image (optional):')).toBeInTheDocument()
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
      expect(screen.getByText("Skip, I'll add an image later")).toBeInTheDocument()
    })
  })

  it('navigates to /allrocks after skipping image upload', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)

    await user.type(screen.getByLabelText('Name:'), 'Granite')
    await user.click(screen.getByText('Collect Rock'))

    await waitFor(() => {
      expect(screen.getByText("Skip, I'll add an image later")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Skip, I'll add an image later"))

    await waitFor(() => {
      expect(mockFetchRocks).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/allrocks')
    })
  })

  it('navigates to /allrocks after completing image upload', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RockForm fetchRocks={mockFetchRocks} />)

    await user.type(screen.getByLabelText('Name:'), 'Granite')
    await user.click(screen.getByText('Collect Rock'))

    await waitFor(() => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    })

    // Simulate the ImageUpload component calling onUploadComplete
    await user.click(screen.getByText('Mock Upload'))

    await waitFor(() => {
      expect(mockFetchRocks).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/allrocks')
    })
  })
})
