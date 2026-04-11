const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Process payment
app.post('/pay', (req, res) => {
  const { order_id, amount } = req.body;
  const transaction_id = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  db.serialize(() => {
    // 1. Record payment
    db.run("INSERT INTO payments (order_id, amount, transaction_id, status) VALUES (?, ?, ?, 'SUCCESS')", 
      [order_id, amount, transaction_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // 2. Update order status
        db.run("UPDATE orders SET status = 'PAID' WHERE id = ?", [order_id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, transaction_id, status: 'PAID' });
        });
      });
  });
});

app.listen(port, () => {
  console.log(`Payment Service running at http://localhost:${port}`);
});
