import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsCard from '../components/StatsCard'

describe('StatsCard Component', () => {
  it('should render card with all props', () => {
    render(
      <StatsCard
        title="Total Items"
        value="150"
        change="+12%"
        period="vs last month"
        icon="📦"
        trend="up"
      />
    )

    expect(screen.getByText('Total Items')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    // Text is split by arrow and percentage, so use regex or getByText with function
    expect(screen.getByText((content, element) => {
      return element?.textContent === '↗ +12%'
    })).toBeInTheDocument()
    expect(screen.getByText('vs last month')).toBeInTheDocument()
    expect(screen.getByText('📦')).toBeInTheDocument()
  })

  it('should render with down trend', () => {
    render(
      <StatsCard
        title="Revenue"
        value="$1,200"
        change="-5%"
        period="vs last week"
        icon="💰"
        trend="down"
      />
    )

    const changeElement = screen.getByText((content, element) => {
      return element?.textContent === '↘ -5%'
    })
    expect(changeElement).toBeInTheDocument()
    expect(changeElement).toHaveClass('stats-change')
    expect(changeElement).toHaveClass('down')
  })

  it('should render with up trend', () => {
    render(
      <StatsCard
        title="Orders"
        value="45"
        change="+20%"
        period="this week"
        icon="🛒"
        trend="up"
      />
    )

    const changeElement = screen.getByText((content, element) => {
      return element?.textContent === '↗ +20%'
    })
    expect(changeElement).toBeInTheDocument()
    expect(changeElement).toHaveClass('stats-change')
    expect(changeElement).toHaveClass('up')
  })
})
