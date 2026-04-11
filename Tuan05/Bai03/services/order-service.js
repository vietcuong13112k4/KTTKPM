const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Get all products
app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create an order
app.post('/orders', (req, res) => {
  const { product_id, quantity, total_price } = req.body;
  const query = `INSERT INTO orders (product_id, quantity, total_price, status) VALUES (?, ?, ?, 'PENDING')`;
  
  db.run(query, [product_id, quantity, total_price], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ order_id: this.lastID, status: 'PENDING' });
  });
});

// Get order details
app.get('/orders/:id', (req, res) => {
  const query = `
    SELECT o.*, p.name as product_name 
    FROM orders o 
    JOIN products p ON o.product_id = p.id 
    WHERE o.id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.listen(port, () => {
  console.log(`Order Service running at http://localhost:${port}`);
});
