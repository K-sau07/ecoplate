import { describe, it, expect } from 'vitest'

// Utility functions that might be used in the app
export const formatPrice = (price) => {
  return `$${parseFloat(price).toFixed(2)}`
}

export const formatDate = (dateString) => {
  // Add 'T00:00:00' to ensure it's treated as local time, not UTC
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

export const calculateDiscount = (originalPrice, currentPrice) => {
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100
  return Math.round(discount)
}

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return parseFloat(distance.toFixed(1))
}

export const isExpiringSoon = (expiryDate) => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60)
  return hoursUntilExpiry <= 24
}

export const getDiscountLabel = (expiryDate) => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60)
  
  if (hoursUntilExpiry > 24) return '20% OFF'
  if (hoursUntilExpiry > 12) return '40% OFF'
  if (hoursUntilExpiry > 6) return '60% OFF'
  return '80% OFF'
}

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(10)).toBe('$10.00')
      expect(formatPrice(9.99)).toBe('$9.99')
      expect(formatPrice(100.5)).toBe('$100.50')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-11-20')
      expect(result).toBe('Nov 20, 2024')
    })
  })

  describe('calculateDiscount', () => {
    it('should calculate discount percentage correctly', () => {
      expect(calculateDiscount(100, 80)).toBe(20)
      expect(calculateDiscount(50, 30)).toBe(40)
      expect(calculateDiscount(10, 2)).toBe(80)
    })

    it('should round discount to nearest integer', () => {
      expect(calculateDiscount(100, 66.67)).toBe(33)
    })
  })

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // Boston to Cambridge (approximately 5km)
      const distance = calculateDistance(42.3601, -71.0589, 42.3736, -71.1097)
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(10)
    })

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(42.3601, -71.0589, 42.3601, -71.0589)
      expect(distance).toBe(0)
    })
  })

  describe('isExpiringSoon', () => {
    it('should return true for items expiring within 24 hours', () => {
      const tomorrow = new Date()
      tomorrow.setHours(tomorrow.getHours() + 12)
      expect(isExpiringSoon(tomorrow)).toBe(true)
    })

    it('should return false for items expiring after 24 hours', () => {
      const future = new Date()
      future.setDate(future.getDate() + 2)
      expect(isExpiringSoon(future)).toBe(false)
    })
  })

  describe('getDiscountLabel', () => {
    it('should return correct discount for >24 hours', () => {
      const future = new Date()
      future.setDate(future.getDate() + 2)
      expect(getDiscountLabel(future)).toBe('20% OFF')
    })

    it('should return correct discount for 12-24 hours', () => {
      const future = new Date()
      future.setHours(future.getHours() + 18)
      expect(getDiscountLabel(future)).toBe('40% OFF')
    })

    it('should return correct discount for 6-12 hours', () => {
      const future = new Date()
      future.setHours(future.getHours() + 8)
      expect(getDiscountLabel(future)).toBe('60% OFF')
    })

    it('should return correct discount for <6 hours', () => {
      const future = new Date()
      future.setHours(future.getHours() + 3)
      expect(getDiscountLabel(future)).toBe('80% OFF')
    })
  })
})
