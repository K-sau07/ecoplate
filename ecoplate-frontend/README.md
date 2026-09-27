# 🌱 EcoPlate - Food Waste Management Frontend

## 🚀 Quick Setup Instructions

### Step 1: Install Dependencies
```bash
cd /Users/saurabhkashyap/Desktop/Ecoplate/ecoplate-frontend
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
- Frontend will run on: **http://localhost:3000**
- Backend should be running on: **http://localhost:8080**

---

## 📂 Project Structure
```
ecoplate-frontend/
├── src/
│   ├── pages/
│   │   └── Login.jsx          # Login/Signup Page (DONE ✅)
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   └── Login.css          # Login page styles
│   ├── App.jsx                # Main app router
│   └── main.jsx               # Entry point
├── package.json
├── vite.config.js
└── index.html
```

---

## ✨ Features Implemented

### ✅ Login Page (Image 1)
- EcoPlate logo and branding
- Tab switcher (Login / Sign Up)
- Email & password inputs
- Role selection (Store Manager, NGO, Customer)
- "Remember me" checkbox
- Forgot password link
- Social login buttons (Google, GitHub)
- Responsive design

---

## 🎯 Tech Stack
- **React 18** - UI library
- **Vite** - Build tool (super fast!)
- **React Router** - Navigation
- **Axios** - API calls
- **CSS3** - Styling (custom design system)

---

## 🔗 API Integration
- Login: `POST http://localhost:8080/api/auth/login`
- Signup: `POST http://localhost:8080/api/auth/signup`

---

## 📱 Open in VS Code
```bash
code /Users/saurabhkashyap/Desktop/Ecoplate/ecoplate-frontend
```

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Backend not running?**
```bash
cd /Users/saurabhkashyap/Desktop/Ecoplate/food-waste-backend
mvn spring-boot:run
```

---

## 📸 Preview
Login page matches the Figma design from Image 1!

---

**Created for: Food Waste Management System Demo**
**Duration: 12-week project (Sprint 1 - Week 3)**# Frontend tests added
