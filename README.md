

---

# 📱 Flipzon Flash Sale Backend

## 🚀 Introduction

Welcome to the **Flipzon Flash Sale Backend** project! This project is a backend service designed to handle flash sales for an eCommerce platform, specifically selling 1000 iPhones at 12 AM on an upcoming Sunday. The service is built using Node.js, MySQL, and Redis, with a focus on handling high concurrency, ensuring fairness, and providing stability under heavy traffic.

## 🛠️ System Design

### 📊 Database Schema

**1. `items` Table:**
- `id` (INT, Primary Key, Auto Increment): Unique identifier for each item.
- `name` (VARCHAR): Name of the item.
- `stock` (INT): Number of items available in stock.

**2. `customers` Table:**
- `id` (INT, Primary Key, Auto Increment): Unique identifier for each customer.
- `name` (VARCHAR): Name of the customer.
- `user_authentication_token` (VARCHAR, Unique): Token used to uniquely identify a customer.

**3. `sales` Table:**
- `id` (INT, Primary Key, Auto Increment): Unique identifier for each sale.
- `item_id` (INT, Foreign Key): ID of the item on sale.
- `start_time` (DATETIME): Start time of the flash sale.
- `end_time` (DATETIME): End time of the flash sale.

**4. `transactions` Table:**
- `id` (INT, Primary Key, Auto Increment): Unique identifier for each transaction.
- `customer_id` (INT, Foreign Key): ID of the customer making the purchase.
- `sale_id` (INT, Foreign Key): ID of the sale.
- `quantity` (INT): Quantity of items purchased.
- `transaction_time` (DATETIME): Timestamp when the transaction was completed.

### ⚙️ Backend Components

**1. Node.js/Express:**
   - Handles incoming HTTP requests and routes them to appropriate services.
   - Manages the overall flow of the flash sale, ensuring fairness and handling concurrency.

**2. MySQL:**
   - Stores persistent data about items, customers, sales, and transactions.
   - Ensures data integrity and provides relational data management.

**3. Redis:**
   - Manages real-time data such as stock levels and locks to prevent race conditions.
   - Handles concurrency by locking mechanisms to ensure that no two customers purchase the last item simultaneously.

## 🧩 Problem-Solving Approach

### 🌐 Concurrency Handling
- **Redis Locks**: To avoid race conditions, Redis is used to implement a locking mechanism that prevents multiple users from purchasing the last few items at the same time.
- **Stock Management**: Stock levels are managed in Redis for real-time performance, allowing quick updates and checks during the flash sale.
- **Fairness**: Customers are limited to purchasing one item to ensure fairness. This is enforced both in the database and in-memory.

### ⚖️ Fairness and Stability
- **Quota System**: Each customer can only purchase one item during the sale, ensuring that more customers have the opportunity to buy the item.
- **Real-Time Stock Checking**: Stock levels are continuously checked before processing any purchase request, preventing overselling.
- **Failure Handling**: If a purchase fails due to concurrency issues, the customer is informed and can retry.

### 🔄 Flow of Execution
1. **Sale Start**: When the sale starts, customers can begin placing orders.
2. **Order Processing**: Each order request checks the stock in Redis, and if available, proceeds with the purchase.
3. **Transaction Logging**: Successful transactions are logged in MySQL for record-keeping.
4. **Concurrency Management**: Redis locks are used to ensure that no two customers purchase the last item simultaneously.

## 📝 Installation and Setup

### 1. 📦 Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8 or higher)
- **Redis** (v6 or higher)
- **Git** (Optional, for cloning the repository)

### 2. ⬇️ Clone the Repository
```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 3. 📥 Install Dependencies
```bash
npm install
```

### 4. ⚙️ Configure MySQL and Redis

1. **MySQL Configuration**:
   - Start your MySQL server and create a new database:
     ```sql
     CREATE DATABASE flipzon_flash_sale;
     ```
   - Use the SQL script provided in the code to create the necessary tables.

2. **Redis Configuration**:
   - Start your Redis server by running:
     ```bash
     redis-server
     ```

3. **Update Database Credentials**:
   - Open `index.js` and update the MySQL connection details:
     ```javascript
     const db = mysql.createConnection({
         host: 'localhost',
         user: 'root',
         password: 'yourpassword',
         database: 'flipzon_flash_sale'
     });
     ```

### 5. ▶️ Run the Server
```bash
node index.js
```
The server will start on `http://localhost:3000`.

## 🧪 Testing the Application

### 1. 🛠️ Initialize Stock

Before the flash sale starts, initialize the stock in Redis.

- **Endpoint**: `POST /api/init-stock`
- **Request Body**:
  ```json
  {
    "itemId": 1,
    "stock": 1000
  }
  ```

### 2. 🛒 Simulate a Purchase

You can simulate a customer attempting to purchase an item.

- **Endpoint**: `POST /api/sales/:saleId/purchase`
- **Request Body**:
  ```json
  {
    "customerId": 1,
    "quantity": 1
  }
  ```

- **Header**: `user_authentication_token: your_token_here`

### 3. 📊 Testing with Postman

**Manual Testing**:
1. Use Postman to send requests to the `/purchase` endpoint.
2. Observe responses and ensure that only one item is purchased per request and that stock levels are updated correctly.

**Simulating Concurrent Requests**:
- Use Postman’s **Runner** tool to simulate multiple users sending requests simultaneously.
- Set up multiple requests with different `customerId` and send them in quick succession.

### 4. 📈 Stress Testing

**Using Tools like Apache JMeter or Artillery**:
- Simulate high traffic and observe the system's behavior.
- Test for edge cases, such as multiple users attempting to purchase the last item.

## 🛠️ Engineering Improvements

### 1. 🚀 Optimize Redis Usage
- **TTL for Locks**: Ensure that locks are appropriately timed out if not released, preventing deadlocks.
- **Rate Limiting**: Implement rate limiting for purchase requests to prevent abuse.

### 2. 🌐 Scalability Considerations
- **Horizontal Scaling**: The system can be scaled horizontally by deploying multiple instances of the Node.js server behind a load balancer.
- **Database Sharding**: Consider sharding the MySQL database if the customer base grows significantly.

### 3. 🔐 Security Enhancements
- **Authentication & Authorization**: Implement JWT or OAuth for secure API access.
- **Input Validation**: Add robust input validation to prevent SQL injection or other attacks.

## 📄 Conclusion

This backend system for a flash sale on Flipzon ensures fairness, handles high concurrency, and maintains stability under pressure. By using Node.js, MySQL, and Redis, the system efficiently manages stock levels and transactions, providing a seamless experience for customers during high-demand sales events.

Feel free to explore the code, contribute, and make this project even better! 😊

---

