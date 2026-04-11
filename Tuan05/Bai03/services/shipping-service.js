const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Arrange shipping
app.post('/ship', (req, res) => {
  const { order_id } = req.body;
  const tracking_number = 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const estimated_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(); // 3 days later

  db.serialize(() => {
    // 1. Record shipping
    db.run("INSERT INTO shipping (order_id, tracking_number, status, estimated_delivery) VALUES (?, ?, 'IN_TRANSIT', ?)", 
      [order_id, tracking_number, estimated_delivery], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // 2. Update order status
        db.run("UPDATE orders SET status = 'SHIPPED' WHERE id = ?", [order_id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, tracking_number, estimated_delivery, status: 'SHIPPED' });
        });
      });
  });
});

// Get shipping status
app.get('/shipping/:order_id', (req, res) => {
  db.get("SELECT * FROM shipping WHERE order_id = ?", [req.params.order_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.listen(port, () => {
  console.log(`Shipping Service running at http://localhost:${port}`);
});
