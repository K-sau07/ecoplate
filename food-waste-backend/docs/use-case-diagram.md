# USE CASE DIAGRAM - Food Waste Management System

## Actors
1. **Store Manager** - Lists food items nearing expiry
2. **NGO** - Claims food items for free
3. **Customer** - Purchases discounted items
4. **Admin** - Manages system
5. **System** - Food Waste Management Backend

## Use Cases

### Authentication & Authorization
- **UC-01: Register** (All users)
  - Input: Email, password, name, phone, role
  - Output: User account created, JWT token
  
- **UC-02: Login** (All users)
  - Input: Email, password
  - Output: JWT token, user profile

### Store Manager Use Cases
- **UC-03: Create Food Item**
  - Precondition: Store Manager logged in
  - Input: Name, category, quantity, price, expiry date
  - Output: Food item created with AVAILABLE status
  - Includes: UC-18 (Calculate Dynamic Price)

- **UC-04: View My Food Items**
  - Precondition: Store Manager logged in
  - Output: List of all items created by this store

- **UC-05: Update Food Item**
  - Precondition: Store Manager logged in, owns the item
  - Input: Updated item details
  - Output: Updated food item

- **UC-06: Delete Food Item**
  - Precondition: Store Manager logged in, owns the item
  - Output: Item removed from system

- **UC-07: View Orders/Claims**
  - Precondition: Store Manager logged in
  - Output: List of orders and claims on their items

### NGO Use Cases
- **UC-08: Browse Available Items**
  - Precondition: NGO logged in
  - Output: List of AVAILABLE food items
  - Extends: UC-14 (Search/Filter Items)

- **UC-09: Claim Food Item**
  - Precondition: NGO logged in, item is AVAILABLE
  - Input: Item ID, quantity, pickup date
  - Output: Claim created, item status → CLAIMED

- **UC-10: View Claimed Items**
  - Precondition: NGO logged in
  - Output: List of all claimed items by this NGO

### Customer Use Cases
- **UC-11: Browse Available Items**
  - Precondition: Customer logged in
  - Output: List of AVAILABLE items with dynamic pricing
  - Extends: UC-14 (Search/Filter Items)

- **UC-12: Purchase Food Item**
  - Precondition: Customer logged in, item is AVAILABLE
  - Input: Item ID, quantity
  - Output: Order created, item status → SOLD

- **UC-13: View Order History**
  - Precondition: Customer logged in
  - Output: List of all orders by this customer

### Common Use Cases
- **UC-14: Search/Filter Items**
  - Input: Category, price range, expiry date
  - Output: Filtered list of items

- **UC-15: View Item Details**
  - Input: Item ID
  - Output: Complete item information

### Admin Use Cases
- **UC-16: View All Users**
  - Precondition: Admin logged in
  - Output: List of all registered users

- **UC-17: View System Statistics**
  - Precondition: Admin logged in
  - Output: Total items, orders, claims, users

### System Use Cases (Automatic)
- **UC-18: Calculate Dynamic Price**
  - Triggered: When item is viewed or created
  - Logic: Discount based on hours until expiry
    * 24+ hours → 20% discount
    * 12-24 hours → 40% discount
    * 6-12 hours → 60% discount
    * Under 6 hours → 80% discount
  - Output: Discounted price

- **UC-19: Update Item Status**
  - Triggered: When order/claim is made or item expires
  - Output: Status changed (AVAILABLE → SOLD/CLAIMED/EXPIRED)

## Visual Representation

```
                    Food Waste Management System
┌────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Store Manager              System                    NGO       │
│       │                       │                        │        │
│       │                       │                        │        │
│   ┌───────┐             ┌──────────┐             ┌───────┐    │
│   │Register│◄───────────►│          │◄───────────►│Browse │    │
│   └───────┘             │          │             │Items  │    │
│   ┌───────┐             │          │             └───────┘    │
│   │ Login │◄───────────►│  Auth    │                  │        │
│   └───────┘             │  System  │             ┌───────┐    │
│       │                 │          │             │ Claim │    │
│   ┌───────┐             └──────────┘             │ Item  │    │
│   │Create │                   │                  └───────┘    │
│   │ Item  │───includes───►┌────────┐                │        │
│   └───────┘               │Calculate│           ┌───────┐    │
│       │                   │ Price   │           │ View  │    │
│   ┌───────┐               └────────┘           │Claims │    │
│   │ View  │                                    └───────┘    │
│   │ Items │                                                  │
│   └───────┘              Customer                           │
│       │                     │                                │
│   ┌───────┐             ┌───────┐                          │
│   │Update │             │Browse │◄────extends────┐         │
│   │ Item  │             │ Items │                │         │
│   └───────┘             └───────┘          ┌─────────┐    │
│       │                     │               │ Search  │    │
│   ┌───────┐             ┌───────┐          │ Filter  │    │
│   │Delete │             │Purchase│          └─────────┘    │
│   │ Item  │             │ Item   │                         │
│   └───────┘             └───────┘                         │
│       │                     │                              │
│   ┌───────┐             ┌───────┐                        │
│   │ View  │             │ View  │         Admin          │
│   │Orders │             │Orders │            │           │
│   └───────┘             └───────┘        ┌───────┐      │
│                                           │ View  │      │
│                                           │ Users │      │
│                                           └───────┘      │
│                                               │           │
│                                           ┌───────┐      │
│                                           │System │      │
│                                           │Stats  │      │
│                                           └───────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Priority

### P0 (Critical - Sprint 1) - ✅ COMPLETED
- UC-01: Register
- UC-02: Login  
- UC-03: Create Food Item
- UC-04: View My Items
- UC-06: Delete Item

### P1 (High - Sprint 2) - Week 4-6
- UC-08: Browse Items (NGO)
- UC-09: Claim Item
- UC-11: Browse Items (Customer)
- UC-12: Purchase Item
- UC-18: Calculate Dynamic Price
- UC-19: Update Status

### P2 (Medium - Sprint 3) - Week 7-9
- UC-05: Update Item
- UC-07: View Orders/Claims
- UC-10: View Claimed Items
- UC-13: View Order History
- UC-14: Search/Filter

### P3 (Low - Sprint 4) - Week 10-12
- UC-15: View Item Details
- UC-16: View All Users (Admin)
- UC-17: System Statistics (Admin)
