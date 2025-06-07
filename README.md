# Chapter Performance Dashboard Backend API

A RESTful API backend for a Chapter Performance Dashboard, built as a sample task for MathonGo. This project demonstrates API design, data filtering, caching, rate-limiting, and performance optimization using Node.js, Express.js, MongoDB, and Redis.

## Features

- **RESTful Endpoints** for managing chapter data
- **Advanced filtering** and pagination for listing chapters
- **Upload chapters via JSON** (admin only), with error handling and partial success reporting
- **Redis caching** for fast retrieval of chapter lists
- **Cache invalidation** on new chapter uploads
- **Rate limiting** per IP (30 requests/min) using Redis
- **Modular, clean, and well-documented code**

---


## Deployment Link (EC2)

- The API is deployed at: [LIVE LINK]  
  _[[Insert your deployed API link here](https://65.2.100.108.nip.io)]_

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** + Mongoose
- **Redis** (for caching and rate-limiting)
- **Deployed on:** EC2 (AWS)  
https://65.2.100.108.nip.io

---

## API Endpoints

### 1. Get All Chapters

```
GET /api/v1/chapters
```
- **Filters:** `class`, `unit`, `status`, `weakChapters`, `subject`
- **Pagination:** `page` & `limit` query params
- **Response:** Returns filtered, paginated list and the total number of chapters

### 2. Get Chapter by ID

```
GET /api/v1/chapters/:id
```
- Returns the details of a specific chapter by its ID

### 3. Upload Chapters (Admin Only)

```
POST /api/v1/chapters
```
- **Upload:** Accepts a JSON file containing an array of chapters
- **Validation:** Only valid chapters are uploaded; invalid ones are reported in response
- **Access:** Restricted to admin users

---

### 4. Register User/Admin

```
POST /api/v1/auth/register
```
- Register a new user/admin o=

---


### 4. Login User/Admin

```
POST /api/v1/auth/login
```
- Login using this route

---

## Caching (Redis)

- Results from `GET /api/v1/chapters` are cached for 1 hour
- Cache is invalidated automatically when new chapters are added

---

## Rate Limiting

- Each IP is limited to 30 requests per minute (handled via Redis)

---

## How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omdeep-Tyagi/Assignment.git
   cd Assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**

   Create a `.env` file in the root directory:

   ```
   PORT=8080
   MONGODB=<your-mongodb-uri>
   REDIS_URL=<your-redis-url>
   JWT_SECRET=<your-jwt-secret>
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

---


## Postman Collection

- [Postman Collection Link]  
  _[[Insert your Postman public collection link here](https://documenter.getpostman.com/view/39098392/2sB2x2LvAD)]_

---



## Author

- [Omdeep Tyagi](https://github.com/Omdeep-Tyagi)