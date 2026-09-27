# ACTIVITY DIAGRAMS - Food Waste Management System

## 1. STORE MANAGER - Create and List Food Item

```
┌─ Store Manager ─┐        ┌─── System ───┐         ┌─ Database ─┐
│                  │        │               │         │            │
│  [Start]         │        │               │         │            │
│     │            │        │               │         │            │
│     ▼            │        │               │         │            │
│  Login           │───────►│ Verify JWT    │────────►│ Check User │
│     │            │        │               │         │            │
│     │◄──────────────────Token Valid?      │         │            │
│     │            │        │               │         │            │
│     ▼            │        │               │         │            │
│ Fill Food Item   │        │               │         │            │
│ Details Form     │        │               │         │            │
│  - Name          │        │               │         │            │
│  - Category      │        │               │         │            │
│  - Quantity      │        │               │         │            │
│  - Price         │        │               │         │            │
│  - Expiry Date   │        │               │         │            │
│     │            │        │               │         │            │
│     ▼            │        │               │         │            │
│ Click Submit     │───────►│ Validate Data │         │            │
│     │            │        │     │         │         │            │
│     │            │        │     ▼         │         │            │
│     │            │        │ Calculate     │         │            │
│     │            │        │ Hours Until   │         │            │
│     │            │        │ Expiry        │         │            │
│     │            │        │     │         │         │            │
│     │            │        │     ▼         │         │            │
│     │            │        │ Apply Dynamic │         │            │
│     │            │        │ Pricing Logic │         │            │
│     │            │        │  (Formula)    │         │            │
│     │            │        │     │         │         │            │
│     │            │        │     ▼         │         │            │
│     │            │        │ Create Item   │────────►│ Save Item  │
│     │            │        │ Status:       │         │            │
│     │            │        │ AVAILABLE     │         │            │
│     │            │        │     │         │         │            │
│     │◄───────────────────Item Created     │         │            │
│     │            │        │               │         │            │
│     ▼            │        │               │         │            │
│ View Success     │        │               │         │            │
│ Message          │        │               │         │            │
│     │            │        │               │         │            │
│     ▼            │        │               │         │            │
│  [End]           │        │               │         │            │
└──────────────────┘        └───────────────┘         └────────────┘
```

## 2. NGO - Browse and Claim Food Item

```
┌──── NGO ────┐        ┌─── System ───┐         ┌─ Database ─┐
│             │        │               │         │            │
│  [Start]    │        │               │         │            │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│  Login      │───────►│ Verify JWT    │────────►│ Check User │
│     │       │        │               │         │            │
│     │◄─────────────Token Valid?      │         │            │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│ Navigate to │        │               │         │            │
│ Browse Items│        │               │         │            │
│     │       │        │               │         │            │
│     ▼       │───────►│ Fetch         │────────►│ SELECT *  │
│ View Items  │        │ AVAILABLE     │         │ WHERE     │
│ List        │        │ Items         │         │ status =  │
│     │       │        │     │         │         │ AVAILABLE │
│     │       │        │     ▼         │         │            │
│     │       │        │ Calculate     │         │            │
│     │◄──────────────Current Prices   │         │            │
│     │       │        │ for each      │         │            │
│     ▼       │        │ item          │         │            │
│ Apply       │        │               │         │            │
│ Filters?    │        │               │         │            │
│  │     │    │        │               │         │            │
│ Yes   No   │        │               │         │            │
│  │     │    │        │               │         │            │
│  ▼     │    │───────►│ Filter by     │         │            │
│Category│    │        │ Category      │         │            │
│  │     │    │        │               │         │            │
│  └─────┘    │        │               │         │            │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│ Select Item │        │               │         │            │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│ View Details│───────►│ Fetch Item    │────────►│ Get Full  │
│     │       │        │ Details       │         │ Details   │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│ Click Claim │───────►│ Check Still   │────────►│ Lock Row  │
│ Button      │        │ AVAILABLE?    │         │            │
│     │       │        │     │         │         │            │
│     │       │        │     ▼         │         │            │
│     │       │        │   Available?  │         │            │
│     │       │        │    /    \     │         │            │
│     │       │        │  Yes    No    │         │            │
│     │       │        │   │      │    │         │            │
│     │       │        │   ▼      ▼    │         │            │
│     │◄──────────────Create   Show    │         │            │
│     │       │        │ Claim   Error │         │            │
│     │       │        │   │           │         │            │
│     │       │        │   ▼           │         │            │
│     │       │        │ Update Status │────────►│ UPDATE    │
│     │       │        │ → CLAIMED     │         │ SET       │
│     │       │        │               │         │ status    │
│     │       │        │               │         │ = CLAIMED │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│ View Success│        │               │         │            │
│ Message     │        │               │         │            │
│     │       │        │               │         │            │
│     ▼       │        │               │         │            │
│  [End]      │        │               │         │            │
└─────────────┘        └───────────────┘         └────────────┘
```

## 3. CUSTOMER - Browse and Purchase Food Item

```
┌── Customer ──┐        ┌─── System ───┐         ┌─ Database ─┐
│              │        │               │         │            │
│  [Start]     │        │               │         │            │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│  Login       │───────►│ Verify JWT    │────────►│ Check User │
│     │        │        │               │         │            │
│     │◄──────────────Token Valid?      │         │            │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│ Browse Items │───────►│ Fetch         │────────►│ SELECT *  │
│     │        │        │ AVAILABLE     │         │ WHERE     │
│     │        │        │ Items         │         │ status =  │
│     │        │        │     │         │         │ AVAILABLE │
│     │        │        │     ▼         │         │            │
│     │        │        │ Calculate     │         │            │
│     │◄──────────────Dynamic Prices    │         │            │
│     │        │        │ (Discount     │         │            │
│     ▼        │        │  based on     │         │            │
│ View Items   │        │  expiry)      │         │            │
│ with Prices  │        │               │         │            │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│ Select Item  │        │               │         │            │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│ Enter        │        │               │         │            │
│ Quantity     │        │               │         │            │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│ Click        │───────►│ Validate      │────────►│ Check     │
│ Purchase     │        │ Stock         │         │ Available │
│     │        │        │     │         │         │ Quantity  │
│     │        │        │     ▼         │         │            │
│     │        │        │  Sufficient?  │         │            │
│     │        │        │    /    \     │         │            │
│     │        │        │  Yes    No    │         │            │
│     │        │        │   │      │    │         │            │
│     │        │        │   ▼      ▼    │         │            │
│     │◄──────────────Create  Show      │         │            │
│     │        │        │ Order  Error  │         │            │
│     │        │        │   │           │         │            │
│     │        │        │   ▼           │         │            │
│     │        │        │ Calculate     │         │            │
│     │        │        │ Total Price   │         │            │
│     │        │        │   │           │         │            │
│     │        │        │   ▼           │         │            │
│     │        │        │ Update Item   │────────►│ UPDATE    │
│     │        │        │ Status →      │         │ SET       │
│     │        │        │ SOLD          │         │ status    │
│     │        │        │   │           │         │ = SOLD    │
│     │        │        │   ▼           │         │            │
│     │        │        │ Reduce        │────────►│ UPDATE    │
│     │        │        │ Quantity      │         │ quantity  │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│ View Order   │        │               │         │            │
│ Confirmation │        │               │         │            │
│     │        │        │               │         │            │
│     ▼        │        │               │         │            │
│  [End]       │        │               │         │            │
└──────────────┘        └───────────────┘         └────────────┘
```

## 4. SYSTEM - Dynamic Pricing Calculation (Automatic)

```
┌─── Trigger Event ───┐
│  - Item Created     │
│  - Item Viewed      │
│  - Scheduled Job    │
└─────────┬───────────┘
          │
          ▼
    ┌─────────┐
    │ Start   │
    └────┬────┘
         │
         ▼
    Get Item's
    Expiry Date
         │
         ▼
    Calculate
    Hours Until
    Expiry
         │
         ▼
    ┌─────────────┐
    │ Hours >= 24?│
    └──┬──────┬───┘
      Yes     No
       │       │
       ▼       ▼
    20%     ┌─────────────┐
    Discount│ Hours 12-24?│
       │    └──┬──────┬───┘
       │      Yes     No
       │       │       │
       │       ▼       ▼
       │     40%    ┌─────────────┐
       │   Discount │ Hours 6-12? │
       │       │    └──┬──────┬───┘
       │       │      Yes     No
       │       │       │       │
       │       │       ▼       ▼
       │       │     60%     80%
       │       │   Discount Discount
       │       │       │       │
       └───────┴───────┴───────┘
                  │
                  ▼
         Calculate Final Price:
         discountedPrice = 
         originalPrice * 
         (1 - discountPercent)
                  │
                  ▼
         Update Food Item
         with Discounted Price
                  │
                  ▼
            ┌─────────┐
            │   End   │
            └─────────┘
```

## Summary of Activity Flows

### Flow 1: Store Manager Creates Item
1. Login with JWT
2. Fill item details form
3. System validates and calculates dynamic price
4. Item saved as AVAILABLE
5. Success message displayed

### Flow 2: NGO Claims Item
1. Login with JWT
2. Browse available items
3. Apply optional filters
4. Select item and view details
5. Click claim button
6. System checks availability and updates status to CLAIMED
7. Confirmation displayed

### Flow 3: Customer Purchases Item
1. Login with JWT
2. Browse items with dynamic pricing
3. Select item and enter quantity
4. System validates stock
5. Order created, item status → SOLD
6. Quantity reduced
7. Order confirmation displayed

### Flow 4: Dynamic Pricing (Automatic)
1. Triggered on item creation/view
2. Calculate hours until expiry
3. Apply discount formula:
   - 24+ hours: 20% off
   - 12-24 hours: 40% off
   - 6-12 hours: 60% off
   - <6 hours: 80% off
4. Update item with discounted price
