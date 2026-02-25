import { http, HttpResponse } from 'msw'

// Define the base URL for API requests
const baseUrl = 'http://localhost:8000'

// Sample data for tests
export const mockRocks = [
  {
    id: 1,
    name: "Granite",
    weight: 5.2,
    type: {
      id: 1,
      label: "Igneous"
    },
    user: {
      id: 1,
      first_name: "John",
      last_name: "Doe"
    }
  },
  {
    id: 2,
    name: "Marble",
    weight: 3.8,
    type: {
      id: 2,
      label: "Metamorphic"
    },
    user: {
      id: 1,
      first_name: "John",
      last_name: "Doe"
    }
  },
  {
    id: 3,
    name: "Obsidian",
    weight: 2.1,
    type: {
      id: 1,
      label: "Igneous"
    },
    user: {
      id: 2,
      first_name: "Jane",
      last_name: "Smith"
    }
  }
]

export const mockTypes = [
  { id: 1, label: "Igneous" },
  { id: 2, label: "Metamorphic" },
  { id: 3, label: "Sedimentary" },
  { id: 4, label: "Volcanic" }
]

// Define API handlers
export const handlers = [
  // GET all rocks
  http.get(`${baseUrl}/rocks`, ({ request }) => {
    // Check if we're filtering by owner
    const url = new URL(request.url)
    const ownerParam = url.searchParams.get('owner')
    
    if (ownerParam === 'current') {
      // Return only rocks owned by user with ID 1 (our test user)
      return HttpResponse.json(
        mockRocks.filter(rock => rock.user.id === 1)
      )
    }
    
    // Return all rocks
    return HttpResponse.json(mockRocks)
  }),
  
  // GET rock types
  http.get(`${baseUrl}/types`, () => {
    return HttpResponse.json(mockTypes)
  }),
  
  // POST new rock
  http.post(`${baseUrl}/rocks`, async ({ request }) => {
    const rockData = await request.json()
    
    // Create a new rock with the provided data
    const newRock = {
      id: mockRocks.length + 1,
      name: rockData.name,
      weight: parseFloat(rockData.weight),
      type: mockTypes.find(type => type.id === rockData.typeId) || mockTypes[0],
      user: {
        id: 1,
        first_name: "John",
        last_name: "Doe"
      }
    }
    
    // In a real handler we would add this to mockRocks, but for testing
    // we want to keep our mock data consistent between tests
    
    return HttpResponse.json(newRock, { status: 201 })
  }),
  
  // DELETE rock
  http.delete(`${baseUrl}/rocks/:rockId`, ({ params }) => {
    const rockId = params.rockId
    
    // Check if rock exists
    const rockExists = mockRocks.some(rock => rock.id === parseInt(rockId))
    
    if (!rockExists) {
      return HttpResponse.json(
        { message: "Rock not found" },
        { status: 404 }
      )
    }
    
    // In a real handler we would remove the rock from mockRocks, but for testing
    // we want to keep our mock data consistent between tests
    
    return new HttpResponse(null, { status: 204 })
  })
]