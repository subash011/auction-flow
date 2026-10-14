# Auction Website Backend

Beginner-friendly backend for an auction website using Node.js, Express and MongoDB.

## 1. Requirements
- Node.js LTS and npm
- MongoDB locally, or a MongoDB Atlas database

## 2. Install
Open a terminal in this folder and run:
```bash
npm install
```
Copy `.env.example` to `.env`, then edit `.env`. Set `MONGODB_URI` to your MongoDB connection string and replace `JWT_SECRET` with a long random secret. Keep `.env private; do not upload it to GitHub.

For local MongoDB, the example URI is:
`mongodb://127.0.0.1:27017/auction_website`

For MongoDB Atlas, copy the connection string from Atlas and replace the username, password and database name. Add your server IP to Atlas Network Access and create a database user.

## 3. Run
```bash
npm run dev
```
Or:
```bash
npm start
```
Open `http://localhost:5000/`. Expected response:
```json
{"message":"Auction Website API is running"}
```

## 4. API routes
All request and response bodies use JSON.

| Method | Route | Login? | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/products` | No | List products |
| GET | `/api/products/:id` | No | Product details |
| POST | `/api/products` | Yes | Create product |
| POST | `/api/bids/:productId` | Yes | Place bid |
| GET | `/api/bids/:productId` | No | List bids for a product |

For protected routes, send this header:
`Authorization: Bearer YOUR_TOKEN`

### Register
`POST /api/auth/register`
```json
{"name":"Asha","email":"asha@example.com","password":"password123"}
```

### Login
`POST /api/auth/login`
```json
{"email":"asha@example.com","password":"password123"}
```
Save the returned `token` in the frontend and send it as a Bearer token for protected calls.

### Create an auction product
`POST /api/products`
```json
{
  "title":"Used Laptop",
  "description":"Laptop in good working condition",
  "imageUrl":"https://example.com/laptop.jpg",
  "startingPrice":10000,
  "endsAt":"2027-01-01T12:00:00.000Z"
}
```
Use a future `endsAt` value.

### List products
`GET /api/products`

### Place a bid
`POST /api/bids/PRODUCT_ID`
```json
{"amount":10500}
```
The amount must be greater than the current price. Sellers cannot bid on their own listings.

### View bid history
`GET /api/bids/PRODUCT_ID`

## 5. Connect the GitHub Pages frontend
Your current frontend is hosted at:
`https://chaitansagar.github.io/AUCTION-WEBSITE-/`

GitHub Pages only serves static files. Deploy this backend separately (for example, to a Node.js hosting service) and use the deployed API base URL instead of `http://localhost:5000`.

In your frontend JavaScript, define:
```js
const API_BASE = "https://YOUR-DEPLOYED-BACKEND-URL";
```

Example: load auction products:
```js
async function loadProducts() {
  const response = await fetch(`${API_BASE}/api/products`);
  const products = await response.json();
  if (!response.ok) throw new Error(products.message || "Could not load products");
  console.log(products); // Render these products in your existing product cards.
}
```

Example: register or login:
```js
async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  localStorage.setItem("auctionToken", data.token);
  return data.user;
}
```

Example: create a product (user must be logged in):
```js
async function createProduct(product) {
  const token = localStorage.getItem("auctionToken");
  const response = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(product)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not create product");
  return data;
}
```

Example: place a bid:
```js
async function placeBid(productId, amount) {
  const token = localStorage.getItem("auctionToken");
  const response = await fetch(`${API_BASE}/api/bids/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ amount: Number(amount) })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Bid failed");
  return data;
}
```

Set `CLIENT_ORIGIN` in the backend `.env` to `https://chaitansagar.github.io`. If you use a different frontend origin, update it. CORS is not authentication; protected routes still require a valid token.

## 6. Folder structure
```text
auction-backend/
  middleware/auth.js
  models/Bid.js
  models/Product.js
  models/User.js
  routes/auth.js
  routes/bids.js
  routes/products.js
  .env.example
  .gitignore
  package.json
  server.js
  README.md
```

## Notes
- Passwords are hashed with bcryptjs; raw passwords are never saved.
- JWT tokens expire after 7 days.
- This is a learning project, not a production-ready auction platform. Before production, add rate limiting, stronger validation, logging/monitoring, a robust auction-closing/winner process, and MongoDB transactions for bid/product consistency.
- `localStorage` is used in the simple frontend example for convenience. For production, consider safer token storage and additional protections.
