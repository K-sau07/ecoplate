import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { authService, foodItemService, donationService, storeService } from '../services/api'

// Mock axios
vi.mock('axios')

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Auth Service', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com', role: 'CUSTOMER' }
        }
      }
      axios.post.mockResolvedValue(mockResponse)

      const result = await authService.login('test@example.com', 'password123')

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        { email: 'test@example.com', password: 'password123' }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should signup user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER'
      }
      const mockResponse = { data: { message: 'User created successfully' } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await authService.signup(userData)

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/signup',
        userData
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should logout and clear localStorage', () => {
      // Set some items first
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify({ id: 1 }))
      
      authService.logout()

      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('Food Item Service', () => {
    beforeEach(() => {
      // Set token in localStorage before each food item test
      localStorage.setItem('token', 'test-token')
    })

    it('should get all food items', async () => {
      const mockItems = [
        { id: 1, itemName: 'Apples', category: 'FRUITS' },
        { id: 2, itemName: 'Bread', category: 'BAKERY' }
      ]
      axios.get.mockResolvedValue({ data: mockItems })

      const result = await foodItemService.getAll()

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/food-items',
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockItems)
    })

    it('should get food items by category', async () => {
      const mockItems = [{ id: 1, itemName: 'Apples', category: 'FRUITS' }]
      axios.get.mockResolvedValue({ data: mockItems })

      const result = await foodItemService.getByCategory('FRUITS')

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/food-items/category/FRUITS',
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockItems)
    })

    it('should create a new food item', async () => {
      const itemData = {
        name: 'Fresh Apples',
        category: 'FRUITS',
        quantity: 10,
        originalPrice: 5.99
      }
      const mockResponse = { data: { id: 1, ...itemData } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await foodItemService.create(itemData)

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/food-items',
        itemData,
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should delete a food item', async () => {
      axios.delete.mockResolvedValue({ data: { message: 'Deleted successfully' } })

      await foodItemService.delete(1)

      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/food-items/1',
        { headers: { Authorization: 'Bearer test-token' } }
      )
    })
  })

  describe('Donation Service', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('should claim a donation', async () => {
      const claimData = {
        foodItemId: 1,
        quantityClaimed: 5,
        ngoMessage: 'Need for community'
      }
      const mockResponse = { data: { id: 1, status: 'PENDING' } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await donationService.claimDonation(claimData)

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/donations/claim',
        claimData,
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should get NGO claims', async () => {
      const mockClaims = [
        { id: 1, status: 'PENDING', quantityClaimed: 5 }
      ]
      axios.get.mockResolvedValue({ data: mockClaims })

      const result = await donationService.getNgoClaims()

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/donations/ngo/claims',
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockClaims)
    })

    it('should update claim status', async () => {
      const mockResponse = { data: { id: 1, status: 'ACCEPTED' } }
      axios.put.mockResolvedValue(mockResponse)

      const result = await donationService.updateClaimStatus(1, 'ACCEPTED', 'Approved!')

      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/donations/claims/1/status',
        { status: 'ACCEPTED', storeResponse: 'Approved!' },
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('Store Service', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token')
    })

    it('should create or update store profile', async () => {
      const storeData = {
        storeName: 'Fresh Market',
        address: '123 Main St',
        latitude: 42.36,
        longitude: -71.05
      }
      const mockResponse = { data: { id: 1, ...storeData } }
      axios.post.mockResolvedValue(mockResponse)

      const result = await storeService.createOrUpdateStore(storeData)

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/stores/profile',
        storeData,
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should get my store profile', async () => {
      const mockStore = { id: 1, storeName: 'Fresh Market' }
      axios.get.mockResolvedValue({ data: mockStore })

      const result = await storeService.getMyStore()

      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/stores/my-store',
        { headers: { Authorization: 'Bearer test-token' } }
      )
      expect(result).toEqual(mockStore)
    })
  })
})
