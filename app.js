const express = require('express');
const mysql = require('mysql2');
const redis = require('redis');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'flipzon_flash_sale'
});

const redisClient = redis.createClient();

app.use(express.json());

// Middleware to check if flash sale is active
const checkSaleActive = (req, res, next) => {
    const saleId = req.params.saleId;
    db.query('SELECT * FROM sales WHERE id = ? AND start_time <= NOW() AND end_time >= NOW()', [saleId], (err, results) => {
        if (err) return res.status(500).send('Server Error');
        if (results.length === 0) return res.status(400).send('Sale is not active');
        req.sale = results[0];
        next();
    });
};

// Middleware to check if an item is in stock
const checkStock = (req, res, next) => {
    const sale = req.sale;
    const itemId = sale.item_id;

    redisClient.get(`item_stock_${itemId}`, (err, stock) => {
        if (err) return res.status(500).send('Server Error');
        if (stock <= 0) return res.status(400).send('Out of stock');
        req.stock = stock;
        next();
    });
};

// Middleware to handle concurrency
const handleConcurrency = (req, res, next) => {
    const itemId = req.sale.item_id;
    const lockKey = `lock_item_${itemId}`;

    redisClient.setnx(lockKey, 'locked', (err, lockAcquired) => {
        if (err) return res.status(500).send('Server Error');
        if (lockAcquired === 0) return res.status(400).send('Concurrent operation in progress, please try again');

        redisClient.expire(lockKey, 5); // Lock expires after 5 seconds
        req.lockKey = lockKey;
        next();
    });
};

// Route to process the sale
app.post('/api/sales/:saleId/purchase', checkSaleActive, checkStock, handleConcurrency, (req, res) => {
    const customerId = req.body.customerId;
    const quantity = req.body.quantity;

    const sale = req.sale;
    const itemId = sale.item_id;

    // Check customer quota
    db.query('SELECT SUM(quantity) as totalQuantity FROM transactions WHERE customer_id = ? AND sale_id = ?', [customerId, sale.id], (err, results) => {
        if (err) return res.status(500).send('Server Error');
        const totalQuantity = results[0].totalQuantity || 0;
        if (totalQuantity + quantity > 1) return res.status(400).send('Quota exceeded');

        // Decrement stock
        redisClient.decrby(`item_stock_${itemId}`, quantity, (err, newStock) => {
            if (err) return res.status(500).send('Server Error');

            // Record transaction
            db.query('INSERT INTO transactions (customer_id, sale_id, quantity) VALUES (?, ?, ?)', [customerId, sale.id, quantity], (err, result) => {
                if (err) return res.status(500).send('Server Error');

                // Release lock
                redisClient.del(req.lockKey);
                res.status(200).send('Purchase successful');
            });
        });
    });
});

// Route to initialize stock in Redis (run this before the sale starts)
app.post('/api/init-stock', (req, res) => {
    const itemId = req.body.itemId;
    const stock = req.body.stock;

    redisClient.set(`item_stock_${itemId}`, stock, (err) => {
        if (err) return res.status(500).send('Server Error');
        res.status(200).send('Stock initialized');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
