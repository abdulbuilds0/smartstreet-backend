# 🛖 SmartStreet — Backend API

> **Vocal for Local** — Digitally empowering street vendors, artisans, and small local businesses across India.

SmartStreet is a hyperlocal vendor discovery platform that connects customers with nearby street vendors and small businesses. The backend is a REST API built with Node.js and Express, powering vendor discovery, user authentication, reviews, and admin management.

---

## 🌟 Features

- **Vendor Discovery** — Browse vendors by category, search by name, filter by location and radius
- **Location-Based Search** — Find vendors within a custom radius using Haversine distance calculation
- **User Authentication** — JWT-based login and registration with bcrypt password hashing
- **Reviews & Ratings** — Users can leave ratings and reviews on vendors
- **Admin Panel** — Admins can add, edit, and delete vendors and products
- **Image Upload** — Vendor photos uploaded to Cloudinary CDN
- **Category Management** — Food, Handicrafts, Electronics, Clothing, Services

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT + bcrypt |
| Image Storage | Cloudinary |
| File Upload | Multer |

---

## 📁 Project Structure

```
src/
├── app.js                    # Main Express server
├── db/
│   ├── pool.js               # PostgreSQL connection
│   ├── migrate.js            # Database migrations
│   └── seed.js               # Demo vendor seeding
├── controllers/
│   ├── auth.controller.js
│   ├── vendor.controller.js
│   ├── review.controller.js
│   ├── admin.controller.js
│   └── category.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── vendor.routes.js
│   ├── review.routes.js
│   ├── admin.routes.js
│   ├── category.routes.js
│   └── user.routes.js
├── middleware/
│   └── auth.middleware.js    # JWT verification + admin role check
└── services/
    └── cloudinary.service.js # Image upload service
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (Supabase recommended)
- Cloudinary account

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/abdulbuilds0/smartstreet-backend.git
cd smartstreet-backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Create `.env` file**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

**4. Run database migrations**
```bash
npm run migrate
```

**5. Seed demo vendors (optional)**
```bash
node src/db/seed.js
```

**6. Start the server**
```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vendors` | Get all vendors (supports filters) |
| GET | `/api/v1/vendors/:id` | Get single vendor with products |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reviews/vendor/:id` | Get reviews for a vendor |
| POST | `/api/v1/reviews/vendor/:id` | Submit a review (auth required) |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/vendors` | Add a new vendor |
| PUT | `/api/v1/admin/vendors/:id` | Update vendor details |
| DELETE | `/api/v1/admin/vendors/:id` | Deactivate a vendor |
| POST | `/api/v1/admin/vendors/:id/products` | Add product to vendor |
| GET | `/api/v1/admin/users` | List all users |

---

## 🗄️ Database Schema

```sql
users       — id, name, email, password, role, avatar_url
vendors     — id, shop_name, category_id, description, phone, address, lat, lng, images, is_active
products    — id, vendor_id, name, description, price, images, is_available
categories  — id, name, icon
reviews     — id, vendor_id, user_id, rating, comment
```

---

## 🔮 Upcoming Features

- **Live Vendor Tracking** — Real-time location updates using Socket.io so users get notified when a moving vendor is nearby
- **Push Notifications** — Web Push API alerts when a favourite vendor is close
- **Vendor Self-Registration** — Public form for vendors to apply, admin approves
- **PWA Support** — Install as app on Android for background location tracking
- **Vendor Dashboard** — Vendors manage their own profiles and products
- **AI Recommendations** — Suggest vendors based on user location history

---

## 🇮🇳 Vision

Street vendors and small local businesses are the backbone of India's economy. With the rise of quick commerce, these vendors are losing customers fast. SmartStreet gives them a digital presence and connects them with nearby customers — keeping local economies alive.

**Vocal for Local 🇮🇳**

---

## 📄 License

MIT License — feel free to use and build on this project.
